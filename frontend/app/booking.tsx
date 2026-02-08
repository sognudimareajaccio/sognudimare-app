import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../src/services/api';

const CLUB_CARDS = [
  { id: '12', months: 12, price: 90, discount: 10 },
  { id: '24', months: 24, price: 150, discount: 15 },
  { id: '36', months: 36, price: 140, discount: 20 },
];

const TIME_SLOTS = [
  '9h - 10h', '10h - 11h', '11h - 12h', '12h - 13h',
  '14h - 15h', '15h - 16h', '16h - 17h', '17h - 18h', '18h - 19h'
];

// Destinations that are PRIVATE ONLY (full boat rental, base 8 passengers)
const PRIVATE_ONLY_DESTINATIONS = ['greece', 'caribbean'];

export default function BookingScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ cruiseId?: string; date?: string }>();
  
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [passengers, setPassengers] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [wantsClubCard, setWantsClubCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<typeof CLUB_CARDS[0] | null>(null);
  const [clubCardCount, setClubCardCount] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCruiseSelect, setShowCruiseSelect] = useState(false);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showTimeSlotSelect, setShowTimeSlotSelect] = useState(false);

  useEffect(() => {
    loadCruises();
  }, []);

  useEffect(() => {
    if (params.cruiseId && cruises.length > 0) {
      const cruise = cruises.find(c => c.id === params.cruiseId);
      if (cruise) {
        setSelectedCruise(cruise);
        if (params.date) {
          setSelectedDate(params.date);
        }
      }
    }
  }, [params.cruiseId, cruises]);

  const loadCruises = async () => {
    try {
      const data = await cruiseApi.getAll();
      setCruises(data);
    } catch (error) {
      console.error('Error loading cruises:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCruisePrice = (): number => {
    if (!selectedCruise) return 0;
    return selectedCruise.pricing.cabin_price || selectedCruise.pricing.private_price || 0;
  };

  // FIXED: Now uses clubCardCount for card cost calculation
  const calculateSavings = () => {
    const basePricePerPerson = getCruisePrice();
    if (!selectedCard || basePricePerPerson === 0) return null;

    // For private only cruises, use total price divided by 8 as base
    const isPrivateOnly = selectedCruise && PRIVATE_ONLY_DESTINATIONS.includes(selectedCruise.destination);
    
    const totalBasePrice = basePricePerPerson * passengers;
    const discountAmount = (totalBasePrice * selectedCard.discount) / 100;
    const priceAfterDiscount = totalBasePrice - discountAmount;
    // Club card cost is based on clubCardCount
    const totalCardCost = selectedCard.price * clubCardCount;
    const totalWithClub = priceAfterDiscount + totalCardCost;
    const savings = totalBasePrice - totalWithClub;

    return {
      basePricePerPerson,
      passengers,
      totalBasePrice,
      discountPercent: selectedCard.discount,
      discountAmount,
      priceAfterDiscount,
      cardPricePerPerson: selectedCard.price,
      clubCardCount,
      totalCardCost,
      totalWithClub,
      savings,
      isPrivateOnly,
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (!selectedCruise || !selectedDate || !name || !email || !phone) {
      Alert.alert(
        language === 'fr' ? 'Erreur' : 'Error', 
        language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields'
      );
      return;
    }
    setShowSuccess(true);
  };

  const savings = calculateSavings();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bookingTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Cruise Selection */}
          <Text style={styles.sectionTitle}>{t('selectDestination')}</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowCruiseSelect(true)}>
            <Ionicons name="boat-outline" size={24} color={COLORS.primary} />
            <Text style={styles.selectButtonText}>
              {selectedCruise
                ? (language === 'fr' ? selectedCruise.name_fr : selectedCruise.name_en)
                : t('selectDestination')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Date Selection */}
          {selectedCruise && (
            <>
              <Text style={styles.sectionTitle}>{t('selectDate')}</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setShowDateSelect(true)}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                <Text style={styles.selectButtonText}>
                  {selectedDate ? formatDate(selectedDate) : t('selectDate')}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </>
          )}

          {/* Passengers */}
          <Text style={styles.sectionTitle}>{t('numberOfPassengers')}</Text>
          <View style={styles.passengersContainer}>
            <TouchableOpacity
              style={styles.passengerButton}
              onPress={() => passengers > 1 && setPassengers(passengers - 1)}
            >
              <Ionicons name="remove" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.passengersText}>{passengers} {t('passengers')}</Text>
            <TouchableOpacity
              style={styles.passengerButton}
              onPress={() => passengers < 8 && setPassengers(passengers + 1)}
            >
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Private Only Notice */}
          {selectedCruise && PRIVATE_ONLY_DESTINATIONS.includes(selectedCruise.destination) && (
            <View style={styles.privateNotice}>
              <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.privateNoticeText}>
                {language === 'fr' 
                  ? 'Cette croisière est uniquement disponible en privatisation complète du navire (base 8 passagers). Le prix affiché est calculé par personne sur cette base.'
                  : 'This cruise is only available as full boat charter (base 8 passengers). Price shown is calculated per person on this basis.'}
              </Text>
            </View>
          )}

          {/* Club Cards Section */}
          {selectedCruise && getCruisePrice() > 0 && (
            <>
              {/* Toggle for Club Card */}
              <Text style={styles.sectionTitle}>
                {language === 'fr' ? 'Carte Club des Voyageurs' : 'Travelers Club Card'}
              </Text>
              
              <View style={styles.clubToggleContainer}>
                <View style={styles.clubToggleInfo}>
                  <Text style={styles.clubToggleQuestion}>
                    {language === 'fr' 
                      ? 'Souhaitez-vous bénéficier d\'une carte Club ?'
                      : 'Would you like a Club card?'}
                  </Text>
                  <Text style={styles.clubToggleHint}>
                    {language === 'fr' 
                      ? 'Économisez jusqu\'à 20% sur votre croisière !'
                      : 'Save up to 20% on your cruise!'}
                  </Text>
                </View>
                <View style={styles.clubToggleButtons}>
                  <TouchableOpacity
                    style={[styles.toggleButton, !wantsClubCard && styles.toggleButtonActive]}
                    onPress={() => {
                      setWantsClubCard(false);
                      setSelectedCard(null);
                    }}
                  >
                    <Text style={[styles.toggleButtonText, !wantsClubCard && styles.toggleButtonTextActive]}>
                      {language === 'fr' ? 'Non' : 'No'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, wantsClubCard && styles.toggleButtonActiveYes]}
                    onPress={() => setWantsClubCard(true)}
                  >
                    <Text style={[styles.toggleButtonText, wantsClubCard && styles.toggleButtonTextActive]}>
                      {language === 'fr' ? 'Oui' : 'Yes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price WITHOUT Club Card */}
              {!wantsClubCard && (
                <View style={styles.priceWithoutClubContainer}>
                  <Text style={styles.priceWithoutClubTitle}>
                    {language === 'fr' ? 'Votre devis' : 'Your quote'}
                  </Text>
                  <View style={styles.priceWithoutClubRow}>
                    <Text style={styles.priceWithoutClubLabel}>
                      {t('cruisePrice')} ({passengers} {t('passengers')})
                    </Text>
                    <Text style={styles.priceWithoutClubValue}>
                      {getCruisePrice()}€ x {passengers} = {getCruisePrice() * passengers}€
                    </Text>
                  </View>
                  <View style={styles.priceWithoutClubDivider} />
                  <View style={styles.priceWithoutClubRow}>
                    <Text style={styles.priceWithoutClubTotalLabel}>
                      {language === 'fr' ? 'Total à payer' : 'Total to pay'}
                    </Text>
                    <Text style={styles.priceWithoutClubTotalValue}>
                      {getCruisePrice() * passengers}€
                    </Text>
                  </View>
                </View>
              )}

              {/* Club Card Options - Only if wantsClubCard is true */}
              {wantsClubCard && (
                <>
                  <Text style={styles.clubDescription}>
                    {language === 'fr' 
                      ? 'Choisissez votre formule et économisez sur votre croisière !'
                      : 'Choose your plan and save on your cruise!'}
                  </Text>
                  
                  <View style={styles.cardsContainer}>
                    {CLUB_CARDS.map((card) => (
                      <TouchableOpacity
                        key={card.id}
                        style={[
                          styles.clubCard,
                          selectedCard?.id === card.id && styles.clubCardSelected,
                        ]}
                        onPress={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                      >
                        <View style={styles.cardHeader}>
                          <Text style={[
                            styles.cardTitle,
                            selectedCard?.id === card.id && styles.cardTitleSelected,
                          ]}>
                            {card.months} {language === 'fr' ? 'mois' : 'months'}
                          </Text>
                          <View style={[
                            styles.discountBadge,
                            selectedCard?.id === card.id && styles.discountBadgeSelected,
                          ]}>
                            <Text style={styles.discountText}>-{card.discount}%</Text>
                          </View>
                        </View>
                        <Text style={[
                          styles.cardPrice,
                          selectedCard?.id === card.id && styles.cardPriceSelected,
                        ]}>
                          {card.price}€{t('perYear')}
                        </Text>
                        {selectedCard?.id === card.id && (
                          <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Number of Club Cards selector */}
                  {selectedCard && (
                    <>
                      <Text style={styles.sectionTitle}>
                        {language === 'fr' ? 'Nombre de cartes Club' : 'Number of Club cards'}
                      </Text>
                      <View style={styles.passengersContainer}>
                        <TouchableOpacity
                          style={styles.passengerButton}
                          onPress={() => clubCardCount > 1 && setClubCardCount(clubCardCount - 1)}
                        >
                          <Ionicons name="remove" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.passengersText}>
                          {clubCardCount} {language === 'fr' ? (clubCardCount > 1 ? 'cartes' : 'carte') : (clubCardCount > 1 ? 'cards' : 'card')}
                        </Text>
                        <TouchableOpacity
                          style={styles.passengerButton}
                          onPress={() => clubCardCount < passengers && setClubCardCount(clubCardCount + 1)}
                        >
                          <Ionicons name="add" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cardCountHint}>
                        {language === 'fr' 
                          ? `La réduction s'applique à tous les passagers, mais chaque carte est individuelle. Maximum: ${passengers} cartes pour ${passengers} passagers.`
                          : `The discount applies to all passengers, but each card is individual. Maximum: ${passengers} cards for ${passengers} passengers.`}
                      </Text>
                    </>
                  )}

              {/* Savings Calculator - NOW WITH CLUB CARD COUNT */}
              {savings && (
                <View style={styles.savingsContainer}>
                  <Text style={styles.savingsTitle}>{t('savingsSimulator')}</Text>
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>
                      {t('cruisePrice')} ({savings.passengers} {t('passengers')})
                    </Text>
                    <Text style={styles.savingsValue}>
                      {savings.basePricePerPerson}€ x {savings.passengers} = {savings.totalBasePrice}€
                    </Text>
                  </View>
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>{t('clubDiscount')} ({savings.discountPercent}%)</Text>
                    <Text style={[styles.savingsValue, styles.discountValue]}>-{savings.discountAmount.toFixed(0)}€</Text>
                  </View>
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>{t('priceAfterDiscount')}</Text>
                    <Text style={styles.savingsValue}>{savings.priceAfterDiscount.toFixed(0)}€</Text>
                  </View>
                  
                  <View style={styles.savingsDivider} />
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>
                      {language === 'fr' ? `Carte Club (${selectedCard?.months} mois x ${savings.clubCardCount})` : `Club Card (${selectedCard?.months} months x ${savings.clubCardCount})`}
                    </Text>
                    <Text style={styles.savingsValue}>
                      {savings.cardPricePerPerson}€ x {savings.clubCardCount} = {savings.totalCardCost}€
                    </Text>
                  </View>
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabelBold}>{t('totalPaid')}</Text>
                    <Text style={styles.savingsValueBold}>{savings.totalWithClub.toFixed(0)}€</Text>
                  </View>
                  
                  <View style={styles.totalSavingsBox}>
                    <Ionicons name="star" size={24} color={COLORS.secondary} />
                    <View style={styles.totalSavingsContent}>
                      <Text style={styles.totalSavingsLabel}>{t('immediateSavings')}</Text>
                      <Text style={styles.totalSavingsValue}>{savings.savings.toFixed(0)}€</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.benefitText}>{t('benefitDescription')}</Text>
                </View>
              )}
            </>
          )}

          {/* Contact Form */}
          <Text style={styles.sectionTitle}>{language === 'fr' ? 'Vos coordonnées' : 'Your details'}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={t('yourName')}
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.gray}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('yourEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.gray}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('yourPhone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.gray}
          />

          {/* Time Slot Selection */}
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'Créneau pour être rappelé' : 'Preferred call time'}
          </Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowTimeSlotSelect(true)}>
            <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            <Text style={styles.selectButtonText}>
              {selectedTimeSlot || (language === 'fr' ? 'Choisir un créneau (9h-19h)' : 'Choose a time slot (9am-7pm)')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('yourMessage')}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.gray}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{t('sendRequest')}</Text>
            <Ionicons name="send" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Cruise Selection Modal */}
      <Modal visible={showCruiseSelect} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectDestination')}</Text>
              <TouchableOpacity onPress={() => setShowCruiseSelect(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {cruises.map((cruise) => (
                <TouchableOpacity
                  key={cruise.id}
                  style={[
                    styles.optionItem,
                    selectedCruise?.id === cruise.id && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCruise(cruise);
                    setSelectedDate('');
                    setShowCruiseSelect(false);
                  }}
                >
                  <Text style={[styles.optionTitle, selectedCruise?.id === cruise.id && styles.optionTitleSelected]}>
                    {language === 'fr' ? cruise.name_fr : cruise.name_en}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Selection Modal */}
      <Modal visible={showDateSelect} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectDate')}</Text>
              <TouchableOpacity onPress={() => setShowDateSelect(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectedCruise?.available_dates
                .filter(d => d.status !== 'full')
                .map((dateInfo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      selectedDate === dateInfo.date && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(dateInfo.date);
                      setShowDateSelect(false);
                    }}
                  >
                    <Text style={[styles.optionTitle, selectedDate === dateInfo.date && styles.optionTitleSelected]}>
                      {formatDate(dateInfo.date)}
                    </Text>
                    <Text style={[
                      styles.optionStatus,
                      { color: dateInfo.status === 'available' ? COLORS.available : COLORS.limited }
                    ]}>
                      {dateInfo.status === 'available' ? t('available') : `${dateInfo.remaining_places} ${t('remainingPlaces')}`}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Slot Selection Modal */}
      <Modal visible={showTimeSlotSelect} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'fr' ? 'Créneau horaire' : 'Time slot'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimeSlotSelect(false)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {TIME_SLOTS.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    selectedTimeSlot === slot && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedTimeSlot(slot);
                    setShowTimeSlotSelect(false);
                  }}
                >
                  <Text style={[styles.optionTitle, selectedTimeSlot === slot && styles.optionTitleSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.accent} />
            </View>
            <Text style={styles.successTitle}>{t('requestSent')}</Text>
            <Text style={styles.successMessage}>{t('requestSentMessage')}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
            >
              <Text style={styles.successButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButtonText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passengerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengersText: {
    marginHorizontal: SPACING.xl,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clubDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  privateNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  privateNoticeText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    lineHeight: 20,
  },
  cardCountHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  clubCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  clubCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.primary,
  },
  cardHeader: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardTitleSelected: {
    color: COLORS.white,
  },
  discountBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  discountBadgeSelected: {
    backgroundColor: COLORS.accent,
  },
  discountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  cardPriceSelected: {
    color: COLORS.secondary,
  },
  checkIcon: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  savingsContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  savingsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  savingsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  savingsLabelBold: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  savingsValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  savingsValueBold: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discountValue: {
    color: COLORS.success,
  },
  savingsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalSavingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  totalSavingsContent: {
    marginLeft: SPACING.md,
  },
  totalSavingsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  totalSavingsValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  benefitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
  },
  submitButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: SPACING.sm,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTitleSelected: {
    color: COLORS.white,
  },
  optionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  optionStatus: {
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  successButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  successButtonText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
