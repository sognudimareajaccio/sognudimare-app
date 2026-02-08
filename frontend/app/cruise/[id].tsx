import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../../src/services/api';

const { width } = Dimensions.get('window');

// Boarding card images per destination
const BOARDING_CARDS: { [key: string]: string } = {
  corsica: 'https://customer-assets.emergentagent.com/job_6b4de818-f2a7-4120-8f67-bde1e1f2e2e5/artifacts/nb95cmkj_13.jpg', // Tour de Corse - NEW IMAGE
  corsica_south: 'https://customer-assets.emergentagent.com/job_b879dc80-6d9d-4bd9-95f6-eb63e0393a89/artifacts/0smxu1vy_11.jpg',
  corsica_west: 'https://customer-assets.emergentagent.com/job_b879dc80-6d9d-4bd9-95f6-eb63e0393a89/artifacts/fd6dl1bq_12.jpg',
  sardinia: 'https://customer-assets.emergentagent.com/job_b879dc80-6d9d-4bd9-95f6-eb63e0393a89/artifacts/8wp4j8ba_13.jpg',
  greece: 'https://customer-assets.emergentagent.com/job_b879dc80-6d9d-4bd9-95f6-eb63e0393a89/artifacts/tqjx4rwx_2.jpg',
  caribbean: 'https://customer-assets.emergentagent.com/job_b879dc80-6d9d-4bd9-95f6-eb63e0393a89/artifacts/5gq8efu3_14.jpg',
};

// Destinations that are PRIVATE ONLY (full boat rental, base 8 passengers)
const PRIVATE_ONLY_DESTINATIONS = ['greece', 'caribbean'];

// What's included - base items (cruise duration is added dynamically)
const getIncludedFR = (duration: string) => [
  `La croisière de ${duration}`,
  'Le logement en cabine double',
  'Les 3 repas par jour (pas de repas le midi les jours d\'arrivée et départ)',
  'Les boissons à volonté* toute la journée (*hors champagnes)',
  'Les services du Capitaine, et de l\'hôtesse',
  'Les assurances RC Armateur',
  'Le transport ALLER / RETOUR de l\'aéroport jusqu\'aux ports (Uniquement Ajaccio)',
  'Les sports nautiques à bord : paddle, snorkeling, pêche...',
];

const getIncludedEN = (duration: string) => [
  `The ${duration} cruise`,
  'Double cabin accommodation',
  '3 meals a day (no lunch on arrival and departure days)',
  'Unlimited drinks* all day (*except champagne)',
  'Captain and hostess services',
  'Shipowner liability insurance',
  'Round trip transport from airport to ports (Ajaccio only)',
  'On-board water sports: paddle, snorkeling, fishing...',
];

// What's not included
const NOT_INCLUDED_FR = [
  'Les taxes éventuelles de séjour et de sortie du territoire',
  'Le petit déjeuner du jour 1 ainsi que le diner du jour du débarquement',
  'Les repas et les boissons non inclus dans la formule (ex : champagne)',
  'La caisse de bord : 240 €/ passager / semaine',
  'Les dépenses d\'ordre personnel',
  'Les excursions facultatives, et les activités non mentionnées au programme',
  'Les repas éventuels aux escales',
  'Les garanties assistance, rapatriement, frais médicaux et d\'hospitalisation, assistance juridique et pénale',
  'Les garanties annulation, bagages, retard aérien',
];

const NOT_INCLUDED_EN = [
  'Any tourist and exit taxes',
  'Breakfast on day 1 and dinner on disembarkation day',
  'Meals and drinks not included in the package (e.g., champagne)',
  'Ship\'s fund: €240/passenger/week',
  'Personal expenses',
  'Optional excursions and activities not mentioned in the program',
  'Possible meals at stopovers',
  'Assistance, repatriation, medical and hospitalization costs, legal and criminal assistance guarantees',
  'Cancellation, baggage, flight delay guarantees',
];

export default function CruiseDetailScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    loadCruise();
  }, [id]);

  const loadCruise = async () => {
    if (!id) return;
    try {
      const data = await cruiseApi.getById(id);
      setCruise(data);
      const firstAvailable = data.available_dates.find(d => d.status !== 'full');
      if (firstAvailable) {
        setSelectedDate(firstAvailable.date);
      }
    } catch (error) {
      console.error('Error loading cruise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (cruise) {
      router.push({
        pathname: '/booking',
        params: { cruiseId: cruise.id, date: selectedDate }
      });
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return COLORS.available;
      case 'limited': return COLORS.limited;
      case 'full': return COLORS.full;
      default: return COLORS.textSecondary;
    }
  };

  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'available': return t('available');
      case 'limited': return t('limited');
      case 'full': return t('full');
      default: return status;
    }
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

  const getBoardingCardImage = (destination: string) => {
    return BOARDING_CARDS[destination] || BOARDING_CARDS['corsica'];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cruise) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('error')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = language === 'fr' ? cruise.name_fr : cruise.name_en;
  const subtitle = language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en;
  const description = language === 'fr' ? cruise.description_fr : cruise.description_en;
  const highlights = language === 'fr' ? cruise.highlights_fr : cruise.highlights_en;
  const program = language === 'fr' ? cruise.program_fr : cruise.program_en;
  const included = language === 'fr' ? getIncludedFR(cruise.duration) : getIncludedEN(cruise.duration);
  const notIncluded = language === 'fr' ? NOT_INCLUDED_FR : NOT_INCLUDED_EN;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: cruise.image_url }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
            <Text style={styles.heroTitle}>{name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Boarding Card Image */}
          <View style={styles.boardingCardContainer}>
            <Image 
              source={{ uri: getBoardingCardImage(cruise.destination) }} 
              style={styles.boardingCardImage} 
              resizeMode="contain"
            />
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.accent} />
              <Text style={styles.quickInfoLabel}>{t('duration')}</Text>
              <Text style={styles.quickInfoValue}>{cruise.duration}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.accent} />
              <Text style={styles.quickInfoLabel}>{t('departure')}</Text>
              <Text style={styles.quickInfoValue}>{cruise.departure_port}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Private Only Notice for Greece & Caribbean */}
          {PRIVATE_ONLY_DESTINATIONS.includes(cruise.destination) && (
            <View style={styles.privateOnlyNotice}>
              <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.privateOnlyText}>
                {language === 'fr' 
                  ? 'Cette croisière est uniquement disponible en privatisation complète du navire (base 8 passagers)'
                  : 'This cruise is only available as full boat charter (base 8 passengers)'}
              </Text>
            </View>
          )}

          {/* Pricing */}
          <View style={styles.pricingSection}>
            {cruise.pricing.cabin_price && !PRIVATE_ONLY_DESTINATIONS.includes(cruise.destination) && (
              <View style={styles.priceCard}>
                <View style={styles.priceHeader}>
                  <Ionicons name="bed" size={24} color={COLORS.primary} />
                  <Text style={styles.priceCardTitle}>{t('cabinReservation')}</Text>
                </View>
                <Text style={styles.priceAmount}>
                  {cruise.pricing.cabin_price}€
                  <Text style={styles.pricePer}>{t('perPerson')}</Text>
                </Text>
              </View>
            )}
            {cruise.pricing.private_price && (
              <View style={[styles.priceCard, PRIVATE_ONLY_DESTINATIONS.includes(cruise.destination) ? styles.priceCardPrivateFull : styles.priceCardPrivate]}>
                <View style={styles.priceHeader}>
                  <Ionicons name="boat" size={24} color={COLORS.secondary} />
                  <Text style={[styles.priceCardTitle, { color: COLORS.secondary }]}>
                    {PRIVATE_ONLY_DESTINATIONS.includes(cruise.destination) 
                      ? (language === 'fr' ? 'Privatisation complète' : 'Full Charter')
                      : t('fullPrivatization')}
                  </Text>
                </View>
                <Text style={[styles.priceAmount, { color: COLORS.secondary }]}>
                  {cruise.pricing.private_price}€
                </Text>
                {PRIVATE_ONLY_DESTINATIONS.includes(cruise.destination) && (
                  <Text style={styles.privatePriceNote}>
                    {language === 'fr' ? '(base 8 passagers)' : '(base 8 passengers)'}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Ce tarif comprend */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'fr' ? 'Ce tarif comprend :' : 'This rate includes:'}
            </Text>
            <View style={styles.includedList}>
              {included.map((item, index) => (
                <View key={index} style={styles.includedItem}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.includedText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Le tarif ne comprend pas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitleRed}>
              {language === 'fr' ? 'Le tarif ne comprend pas :' : 'This rate does not include:'}
            </Text>
            <View style={styles.notIncludedList}>
              {notIncluded.map((item, index) => (
                <View key={index} style={styles.notIncludedItem}>
                  <Ionicons name="close-circle" size={18} color={COLORS.error} />
                  <Text style={styles.notIncludedText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('highlights')}</Text>
            <View style={styles.highlightsList}>
              {highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="star" size={18} color={COLORS.secondary} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Program */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('program')}</Text>
            {program.map((day, index) => (
              <View key={index} style={styles.programItem}>
                <View style={styles.programDot} />
                <Text style={styles.programText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Available Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('availableDates')}</Text>
            {cruise.available_dates.map((dateInfo, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.dateItem,
                  selectedDate === dateInfo.date && styles.dateItemSelected
                ]}
                onPress={() => dateInfo.status !== 'full' && setSelectedDate(dateInfo.date)}
              >
                <View
                  style={[
                    styles.dateStatus,
                    { backgroundColor: getAvailabilityColor(dateInfo.status) },
                  ]}
                />
                <View style={styles.dateInfo}>
                  <Text style={[
                    styles.dateText,
                    selectedDate === dateInfo.date && styles.dateTextSelected
                  ]}>
                    {formatDate(dateInfo.date)}
                  </Text>
                  <Text style={styles.dateStatusText}>
                    {getAvailabilityLabel(dateInfo.status)}
                    {dateInfo.status === 'limited' &&
                      dateInfo.remaining_places &&
                      ` - ${dateInfo.remaining_places} ${t('remainingPlaces')}`}
                  </Text>
                </View>
                {selectedDate === dateInfo.date && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
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
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  heroContainer: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayLight,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  boardingCardContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  boardingCardImage: {
    width: width - SPACING.lg * 2,
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
  },
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickInfoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  sectionTitleRed: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  pricingSection: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  priceCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  priceCardPrivate: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  priceCardPrivateFull: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  privateOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  privateOnlyText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  privatePriceNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  priceAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pricePer: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
  },
  includedList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  includedText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  notIncludedList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  notIncludedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  notIncludedText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  highlightsList: {
    gap: SPACING.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  highlightText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  programDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginTop: 6,
    marginRight: SPACING.md,
  },
  programText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dateItemSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surfaceLight,
  },
  dateStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  dateTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateStatusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  bookButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
});
