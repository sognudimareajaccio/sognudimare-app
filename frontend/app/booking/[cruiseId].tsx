import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cruiseApi, Cruise } from '../../src/services/api';

// Design tokens
const COLORS = {
  primary: '#002552',
  secondary: '#C9A227',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  lightBlue: '#E8F4FD',
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Club Card types with prices and discounts
interface ClubCardType {
  id: string;
  name: string;
  duration: string;
  price: number;
  discount: number; // percentage
  description: string;
}

const CLUB_CARDS: ClubCardType[] = [
  {
    id: 'none',
    name: 'Sans carte',
    duration: '',
    price: 0,
    discount: 0,
    description: 'Prix standard sans réduction'
  },
  {
    id: '12months',
    name: 'Carte Club 12 mois',
    duration: '12 mois',
    price: 90,
    discount: 10,
    description: '10% de remise immédiate sur votre croisière'
  },
  {
    id: '24months',
    name: 'Carte Club 24 mois',
    duration: '24 mois',
    price: 150,
    discount: 15,
    description: '15% de remise immédiate sur votre croisière'
  },
  {
    id: '36months',
    name: 'Carte Club 36 mois',
    duration: '36 mois',
    price: 140,
    discount: 20,
    description: '20% de remise immédiate sur votre croisière'
  }
];

export default function BookingScreen() {
  const { cruiseId, selectedDate } = useLocalSearchParams();
  const router = useRouter();
  
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking options
  const [bookingType, setBookingType] = useState<'cabin' | 'private'>('cabin');
  const [passengers, setPassengers] = useState(2);
  const [selectedClubCard, setSelectedClubCard] = useState<ClubCardType>(CLUB_CARDS[0]);
  const [clubCardQuantity, setClubCardQuantity] = useState(0); // Number of cards (for multiple passengers)
  
  // Modal for date selection
  const [showDateModal, setShowDateModal] = useState(false);
  const [chosenDate, setChosenDate] = useState<string>(selectedDate as string || '');

  useEffect(() => {
    if (cruiseId) {
      loadCruise();
    }
  }, [cruiseId]);

  const loadCruise = async () => {
    if (!cruiseId) {
      console.log('No cruiseId provided');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading cruise with ID:', cruiseId);
      const data = await cruiseApi.getById(cruiseId as string);
      console.log('Cruise loaded:', data?.name_fr);
      setCruise(data);
      
      // Set default date if availabilities exist
      if (data.availabilities && data.availabilities.length > 0 && !chosenDate) {
        const availableDate = data.availabilities.find(a => a.status !== 'full');
        if (availableDate) {
          setChosenDate(availableDate.date_range);
        }
      }
    } catch (error) {
      console.error('Error loading cruise:', error);
      Alert.alert('Erreur', 'Impossible de charger la croisière');
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceDetails = () => {
    if (!cruise) return { basePrice: 0, discount: 0, clubCardTotal: 0, total: 0 };
    
    // Base cruise price
    let basePrice = 0;
    if (bookingType === 'private') {
      basePrice = cruise.pricing.private_price || 0;
    } else {
      basePrice = (cruise.pricing.cabin_price || 0) * passengers;
    }
    
    // Club card discount
    const discountPercentage = selectedClubCard.discount;
    const discountAmount = Math.round(basePrice * discountPercentage / 100);
    
    // Club card cost (price × quantity)
    const clubCardTotal = selectedClubCard.price * clubCardQuantity;
    
    // Total = base price - discount + club cards
    const total = basePrice - discountAmount + clubCardTotal;
    
    return { basePrice, discount: discountAmount, clubCardTotal, total };
  };

  const calculateTotal = () => {
    return calculatePriceDetails().total;
  };

  const handleProceedToPayment = () => {
    if (!cruise) return;
    
    if (!chosenDate) {
      Alert.alert('Date requise', 'Veuillez sélectionner une date de départ');
      return;
    }
    
    const totalAmount = calculateTotal() * 100; // Convert to cents for Square
    
    router.push({
      pathname: `/payment/${cruise.id}`,
      params: {
        cruiseId: cruise.id,
        selectedDate: chosenDate,
        bookingType: bookingType,
        passengers: String(passengers),
        clubCardId: selectedClubCard.id,
        clubCardQuantity: String(clubCardQuantity),
        amount: String(totalAmount)
      }
    });
  };

  const incrementPassengers = () => {
    if (passengers < 8) setPassengers(passengers + 1);
  };

  const decrementPassengers = () => {
    if (passengers > 1) {
      setPassengers(passengers - 1);
      // Reduce club card quantity if needed
      if (clubCardQuantity > passengers - 1) {
        setClubCardQuantity(passengers - 1);
      }
    }
  };

  const incrementClubCardQuantity = () => {
    if (clubCardQuantity < passengers && selectedClubCard.id !== 'none') {
      setClubCardQuantity(clubCardQuantity + 1);
    }
  };

  const decrementClubCardQuantity = () => {
    if (clubCardQuantity > 0) {
      setClubCardQuantity(clubCardQuantity - 1);
    }
  };

  const selectClubCard = (card: ClubCardType) => {
    setSelectedClubCard(card);
    // Reset quantity when changing card type
    if (card.id === 'none') {
      setClubCardQuantity(0);
    } else if (clubCardQuantity === 0) {
      setClubCardQuantity(1); // Auto-select 1 card
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cruise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Croisière non trouvée</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const total = calculateTotal();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réservation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cruise Summary */}
        <View style={styles.cruiseSummary}>
          <Image source={{ uri: cruise.image_url }} style={styles.cruiseImage} />
          <View style={styles.cruiseInfo}>
            <Text style={styles.cruiseName}>{cruise.name_fr}</Text>
            <Text style={styles.cruiseDuration}>{cruise.duration}</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} /> Date de départ
          </Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={[styles.dateSelectorText, !chosenDate && styles.datePlaceholder]}>
              {chosenDate || 'Sélectionner une date'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Booking Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="boat" size={20} color={COLORS.primary} /> Type de réservation
          </Text>
          
          <View style={styles.bookingTypeContainer}>
            {/* Cabin Option */}
            <TouchableOpacity 
              style={[
                styles.bookingTypeCard,
                bookingType === 'cabin' && styles.bookingTypeCardSelected
              ]}
              onPress={() => setBookingType('cabin')}
            >
              <View style={styles.bookingTypeHeader}>
                <Ionicons 
                  name="bed" 
                  size={28} 
                  color={bookingType === 'cabin' ? COLORS.primary : COLORS.textSecondary} 
                />
                <View style={[
                  styles.radioCircle,
                  bookingType === 'cabin' && styles.radioCircleSelected
                ]}>
                  {bookingType === 'cabin' && <View style={styles.radioInner} />}
                </View>
              </View>
              <Text style={[
                styles.bookingTypeTitle,
                bookingType === 'cabin' && styles.bookingTypeTitleSelected
              ]}>
                Réservation Cabine
              </Text>
              <Text style={styles.bookingTypePrice}>
                {cruise.pricing.cabin_price}€ / personne
              </Text>
              <Text style={styles.bookingTypeDescription}>
                Partagez le catamaran avec d'autres passagers
              </Text>
            </TouchableOpacity>

            {/* Private Option */}
            <TouchableOpacity 
              style={[
                styles.bookingTypeCard,
                bookingType === 'private' && styles.bookingTypeCardSelected
              ]}
              onPress={() => setBookingType('private')}
            >
              <View style={styles.bookingTypeHeader}>
                <Ionicons 
                  name="boat" 
                  size={28} 
                  color={bookingType === 'private' ? COLORS.secondary : COLORS.textSecondary} 
                />
                <View style={[
                  styles.radioCircle,
                  bookingType === 'private' && styles.radioCircleSelectedGold
                ]}>
                  {bookingType === 'private' && <View style={styles.radioInnerGold} />}
                </View>
              </View>
              <Text style={[
                styles.bookingTypeTitle,
                bookingType === 'private' && styles.bookingTypeTitleSelectedGold
              ]}>
                Privatisation Complète
              </Text>
              <Text style={[styles.bookingTypePrice, { color: COLORS.secondary }]}>
                {cruise.pricing.private_price?.toLocaleString('fr-FR')}€
              </Text>
              <Text style={styles.bookingTypeDescription}>
                Le catamaran rien que pour vous (jusqu'à 8 personnes)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Passengers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people" size={20} color={COLORS.primary} /> Nombre de passagers
          </Text>
          
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={[styles.counterButton, passengers <= 1 && styles.counterButtonDisabled]}
              onPress={decrementPassengers}
              disabled={passengers <= 1}
            >
              <Ionicons name="remove" size={24} color={passengers <= 1 ? COLORS.border : COLORS.primary} />
            </TouchableOpacity>
            
            <View style={styles.counterValue}>
              <Text style={styles.counterValueText}>{passengers}</Text>
              <Text style={styles.counterValueLabel}>
                {passengers === 1 ? 'passager' : 'passagers'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.counterButton, passengers >= 8 && styles.counterButtonDisabled]}
              onPress={incrementPassengers}
              disabled={passengers >= 8}
            >
              <Ionicons name="add" size={24} color={passengers >= 8 ? COLORS.border : COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {bookingType === 'cabin' && (
            <Text style={styles.passengerNote}>
              Prix par passager : {cruise.pricing.cabin_price}€ × {passengers} = {cruise.pricing.cabin_price * passengers}€
            </Text>
          )}
        </View>

        {/* Club Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="card" size={20} color={COLORS.secondary} /> Carte Club Sognudimare
          </Text>
          
          <View style={styles.clubCardInfo}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.clubCardInfoText}>
              Profitez de remises immédiates sur votre croisière avec nos cartes Club !
            </Text>
          </View>

          {/* Card Type Selection */}
          <View style={styles.clubCardOptions}>
            {CLUB_CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.clubCardOption,
                  selectedClubCard.id === card.id && styles.clubCardOptionSelected,
                  card.id === 'none' && styles.clubCardOptionNone
                ]}
                onPress={() => selectClubCard(card)}
              >
                <View style={styles.clubCardOptionHeader}>
                  <View style={[
                    styles.radioCircle,
                    selectedClubCard.id === card.id && styles.radioCircleSelectedGold
                  ]}>
                    {selectedClubCard.id === card.id && <View style={styles.radioInnerGold} />}
                  </View>
                  <Text style={[
                    styles.clubCardOptionName,
                    selectedClubCard.id === card.id && styles.clubCardOptionNameSelected
                  ]}>
                    {card.name}
                  </Text>
                </View>
                
                {card.id !== 'none' && (
                  <>
                    <View style={styles.clubCardPriceRow}>
                      <Text style={styles.clubCardPrice}>{card.price}€</Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>-{card.discount}%</Text>
                      </View>
                    </View>
                    <Text style={styles.clubCardDescription}>{card.description}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity selector (only if a card is selected) */}
          {selectedClubCard.id !== 'none' && (
            <View style={styles.clubCardQuantitySection}>
              <Text style={styles.clubCardQuantityLabel}>Nombre de cartes</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterButton, clubCardQuantity <= 0 && styles.counterButtonDisabled]}
                  onPress={decrementClubCardQuantity}
                  disabled={clubCardQuantity <= 0}
                >
                  <Ionicons name="remove" size={24} color={clubCardQuantity <= 0 ? COLORS.border : COLORS.secondary} />
                </TouchableOpacity>
                
                <View style={styles.counterValue}>
                  <Text style={[styles.counterValueText, { color: COLORS.secondary }]}>{clubCardQuantity}</Text>
                  <Text style={styles.counterValueLabel}>
                    {clubCardQuantity === 1 ? 'carte' : 'cartes'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.counterButton, clubCardQuantity >= passengers && styles.counterButtonDisabled]}
                  onPress={incrementClubCardQuantity}
                  disabled={clubCardQuantity >= passengers}
                >
                  <Ionicons name="add" size={24} color={clubCardQuantity >= passengers ? COLORS.border : COLORS.secondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.clubCardNote}>
                {clubCardQuantity} × {selectedClubCard.price}€ = {clubCardQuantity * selectedClubCard.price}€
              </Text>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={styles.priceSummary}>
          <Text style={styles.priceSummaryTitle}>Récapitulatif</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {bookingType === 'private' 
                ? 'Privatisation complète' 
                : `Cabine × ${passengers} passager${passengers > 1 ? 's' : ''}`}
            </Text>
            <Text style={styles.priceValue}>
              {calculatePriceDetails().basePrice.toLocaleString('fr-FR')}€
            </Text>
          </View>
          
          {selectedClubCard.id !== 'none' && calculatePriceDetails().discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: COLORS.success }]}>
                Remise Carte Club (-{selectedClubCard.discount}%)
              </Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>
                -{calculatePriceDetails().discount.toLocaleString('fr-FR')}€
              </Text>
            </View>
          )}
          
          {clubCardQuantity > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {selectedClubCard.name} × {clubCardQuantity}
              </Text>
              <Text style={styles.priceValue}>
                +{calculatePriceDetails().clubCardTotal.toLocaleString('fr-FR')}€
              </Text>
            </View>
          )}
          
          <View style={styles.priceDivider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('fr-FR')} €</Text>
          </View>
          
          {selectedClubCard.id !== 'none' && calculatePriceDetails().discount > 0 && (
            <Text style={styles.savingsNote}>
              Vous économisez {calculatePriceDetails().discount.toLocaleString('fr-FR')}€ avec votre Carte Club !
            </Text>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarTotal}>
          <Text style={styles.bottomBarTotalLabel}>Total</Text>
          <Text style={styles.bottomBarTotalValue}>{total.toLocaleString('fr-FR')} €</Text>
        </View>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToPayment}>
          <Text style={styles.proceedButtonText}>Procéder au paiement</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateList}>
              {cruise.availabilities && cruise.availabilities.length > 0 ? (
                cruise.availabilities.map((avail, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      chosenDate === avail.date_range && styles.dateOptionSelected,
                      avail.status === 'full' && styles.dateOptionDisabled
                    ]}
                    onPress={() => {
                      if (avail.status !== 'full') {
                        setChosenDate(avail.date_range);
                        setShowDateModal(false);
                      }
                    }}
                    disabled={avail.status === 'full'}
                  >
                    <View style={styles.dateOptionContent}>
                      <Text style={[
                        styles.dateOptionText,
                        chosenDate === avail.date_range && styles.dateOptionTextSelected,
                        avail.status === 'full' && styles.dateOptionTextDisabled
                      ]}>
                        {avail.date_range}
                      </Text>
                      <Text style={[
                        styles.dateOptionStatus,
                        avail.status === 'available' && { color: COLORS.success },
                        avail.status === 'limited' && { color: COLORS.secondary },
                        avail.status === 'full' && { color: COLORS.error }
                      ]}>
                        {avail.status === 'available' && 'Disponible'}
                        {avail.status === 'limited' && avail.status_label}
                        {avail.status === 'full' && 'COMPLET'}
                      </Text>
                    </View>
                    {chosenDate === avail.date_range && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDateText}>Aucune date disponible</Text>
              )}
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBackButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  cruiseSummary: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  cruiseImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  cruiseInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  cruiseName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cruiseDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateSelectorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  datePlaceholder: {
    color: COLORS.textSecondary,
  },
  bookingTypeContainer: {
    gap: SPACING.md,
  },
  bookingTypeCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  bookingTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  bookingTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioCircleSelectedGold: {
    borderColor: COLORS.secondary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioInnerGold: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
  },
  bookingTypeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bookingTypeTitleSelected: {
    color: COLORS.primary,
  },
  bookingTypeTitleSelectedGold: {
    color: COLORS.secondary,
  },
  bookingTypePrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  bookingTypeDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  counterValueText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  counterValueLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  passengerNote: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  clubCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clubCardBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  clubCardBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  clubCardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  clubCardInfoText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  clubCardNote: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  // New Club Card styles
  clubCardOptions: {
    gap: SPACING.md,
  },
  clubCardOption: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  clubCardOptionSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#FFFBEB',
  },
  clubCardOptionNone: {
    paddingVertical: SPACING.md,
  },
  clubCardOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  clubCardOptionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  clubCardOptionNameSelected: {
    color: COLORS.secondary,
  },
  clubCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: 36,
    gap: SPACING.md,
  },
  clubCardPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  discountBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  discountBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  clubCardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: 36,
  },
  clubCardQuantitySection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clubCardQuantityLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  savingsNote: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  priceSummary: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  priceSummaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  priceValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomPadding: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomBarTotal: {
    flex: 1,
  },
  bottomBarTotalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bottomBarTotalValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateList: {
    padding: SPACING.lg,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  dateOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  dateOptionDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.background,
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateOptionTextSelected: {
    color: COLORS.primary,
  },
  dateOptionTextDisabled: {
    color: COLORS.textSecondary,
  },
  dateOptionStatus: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  noDateText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    padding: SPACING.xl,
  },
});
