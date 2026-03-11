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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../../src/services/api';

const { width } = Dimensions.get('window');

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

const NOT_INCLUDED_FR = [
  'Les taxes éventuelles de séjour',
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
  const [showIncluded, setShowIncluded] = useState(false);
  const [showNotIncluded, setShowNotIncluded] = useState(false);

  useEffect(() => {
    loadCruise();
  }, [id]);

  const loadCruise = async () => {
    if (!id) return;
    try {
      const data = await cruiseApi.getById(id);
      setCruise(data);
      const firstAvail = data.availabilities?.find(a => a.status !== 'full');
      if (firstAvail) {
        setSelectedDate(firstAvail.date_range);
      } else {
        const firstDate = data.available_dates?.find(d => d.status !== 'full');
        if (firstDate) setSelectedDate(firstDate.date);
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
        pathname: `/booking/${cruise.id}`,
        params: { cruiseId: cruise.id, selectedDate: selectedDate || '' }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#34C759';
      case 'limited': return '#FF9500';
      case 'full': return '#FF3B30';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'fr') {
      switch (status) {
        case 'available': return 'Disponible';
        case 'limited': return 'Places limitées';
        case 'full': return 'Complet';
        default: return status;
      }
    }
    switch (status) {
      case 'available': return 'Available';
      case 'limited': return 'Limited';
      case 'full': return 'Full';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!cruise) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.center}>
          <Text style={s.errorText}>{t('error')}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
            <Text style={s.retryBtnText}>{language === 'fr' ? 'Retour' : 'Back'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = language === 'fr' ? cruise.name_fr : cruise.name_en;
  const description = language === 'fr' ? cruise.description_fr : cruise.description_en;
  const highlights = language === 'fr' ? cruise.highlights_fr : cruise.highlights_en;
  const detailedProgram = language === 'fr' ? cruise.detailed_program_fr : cruise.detailed_program_en;
  const program = language === 'fr' ? cruise.program_fr : cruise.program_en;
  const included = language === 'fr' ? getIncludedFR(cruise.duration) : getIncludedEN(cruise.duration);
  const notIncluded = language === 'fr' ? NOT_INCLUDED_FR : NOT_INCLUDED_EN;
  const hasDetailed = cruise.availabilities && cruise.availabilities.length > 0;
  const hasDetailedProgram = detailedProgram && detailedProgram.length > 0;

  // Next departure = first non-full availability
  const nextDeparture = cruise.availabilities?.find(a => a.status !== 'full');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image source={{ uri: cruise.image_url }} style={s.heroImg} />
          <View style={s.heroGradient}>
            <View style={s.heroBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.secondary} />
              <Text style={s.heroBadgeText}>{cruise.duration}</Text>
            </View>
            <Text style={s.heroName}>{name}</Text>
            <View style={s.heroMeta}>
              <Ionicons name="location" size={14} color={COLORS.secondary} />
              <Text style={s.heroMetaText}>
                {language === 'fr' ? 'Départ' : 'From'} {cruise.departure_port}
              </Text>
            </View>
          </View>
        </View>

        {/* Next Departure Card */}
        {nextDeparture && (
          <View style={s.nextDepartureCard}>
            <View style={s.nextDepartureHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={s.nextDepartureTitle}>
                {language === 'fr' ? 'PROCHAIN DÉPART' : 'NEXT DEPARTURE'}
              </Text>
            </View>
            <Text style={s.nextDepartureDate}>{nextDeparture.date_range}</Text>
            <View style={s.nextDepartureFooter}>
              <View>
                <Text style={s.nextDeparturePrice}>{nextDeparture.price}€</Text>
                <Text style={s.nextDeparturePriceLabel}>
                  {language === 'fr' ? 'par personne' : 'per person'}
                </Text>
              </View>
              <View style={[s.nextDepartureStatus, { backgroundColor: getStatusColor(nextDeparture.status) + '20' }]}>
                <View style={[s.statusDot, { backgroundColor: getStatusColor(nextDeparture.status) }]} />
                <Text style={[s.nextDepartureStatusText, { color: getStatusColor(nextDeparture.status) }]}>
                  {nextDeparture.status_label || getStatusLabel(nextDeparture.status)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={s.nextDepartureBtn} onPress={handleBooking}>
              <Text style={s.nextDepartureBtnText}>
                {language === 'fr' ? 'Réserver ce départ' : 'Book this departure'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={s.content}>
          {/* Description */}
          <Text style={s.descText}>{description}</Text>

          {/* Pricing */}
          <View style={s.pricingRow}>
            {cruise.pricing.cabin_price && (
              <View style={s.priceCard}>
                <Ionicons name="bed-outline" size={22} color={COLORS.primary} />
                <Text style={s.priceLabel}>{t('cabinReservation')}</Text>
                <Text style={s.priceVal}>{cruise.pricing.cabin_price}€</Text>
                <Text style={s.pricePer}>{t('perPerson')}</Text>
              </View>
            )}
            {cruise.pricing.private_price && (
              <View style={[s.priceCard, s.priceCardGold]}>
                <Ionicons name="boat-outline" size={22} color={COLORS.secondary} />
                <Text style={[s.priceLabel, { color: COLORS.secondary }]}>{t('fullPrivatization')}</Text>
                <Text style={[s.priceVal, { color: COLORS.secondary }]}>{cruise.pricing.private_price}€</Text>
                <Text style={[s.pricePer, { color: 'rgba(197,171,110,0.7)' }]}>{language === 'fr' ? 'le bateau' : 'the boat'}</Text>
              </View>
            )}
          </View>

          {/* Highlights */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t('highlights')}</Text>
            {highlights.map((h, i) => (
              <View key={i} style={s.highlightItem}>
                <Ionicons name="star" size={16} color={COLORS.secondary} />
                <Text style={s.highlightText}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Program - Timeline */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t('program')}</Text>
            <View style={s.timeline}>
              {hasDetailedProgram ? (
                detailedProgram.map((day, i) => (
                  <View key={i} style={s.timelineItem}>
                    <View style={s.timelineLeft}>
                      <View style={s.timelineDot}>
                        <Text style={s.timelineDotText}>{day.day}</Text>
                      </View>
                      {i < detailedProgram.length - 1 && <View style={s.timelineLine} />}
                    </View>
                    <View style={s.timelineContent}>
                      <Text style={s.timelineTitle}>{day.title}</Text>
                      <Text style={s.timelineDesc}>{day.description}</Text>
                    </View>
                  </View>
                ))
              ) : (
                program.map((p, i) => (
                  <View key={i} style={s.timelineItem}>
                    <View style={s.timelineLeft}>
                      <View style={s.timelineDot}>
                        <Text style={s.timelineDotText}>{i + 1}</Text>
                      </View>
                      {i < program.length - 1 && <View style={s.timelineLine} />}
                    </View>
                    <View style={s.timelineContent}>
                      <Text style={s.timelineDesc}>{p}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* All Dates */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{language === 'fr' ? 'Tous les départs' : 'All departures'}</Text>
            {hasDetailed ? (
              cruise.availabilities!.map((avail, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.dateRow,
                    selectedDate === avail.date_range && s.dateRowSelected,
                    avail.status === 'full' && s.dateRowFull
                  ]}
                  onPress={() => avail.status !== 'full' && setSelectedDate(avail.date_range)}
                  disabled={avail.status === 'full'}
                >
                  <View style={[s.statusDot, { backgroundColor: getStatusColor(avail.status) }]} />
                  <View style={s.dateRowInfo}>
                    <Text style={[s.dateRowText, avail.status === 'full' && s.textStrike]}>{avail.date_range}</Text>
                    <Text style={[s.dateRowStatus, { color: getStatusColor(avail.status) }]}>
                      {avail.status_label || getStatusLabel(avail.status)}
                    </Text>
                  </View>
                  <Text style={[s.dateRowPrice, avail.status === 'full' && s.textStrike]}>{avail.price}€</Text>
                  {selectedDate === avail.date_range && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent || COLORS.secondary} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              cruise.available_dates.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.dateRow, selectedDate === d.date && s.dateRowSelected]}
                  onPress={() => d.status !== 'full' && setSelectedDate(d.date)}
                >
                  <View style={[s.statusDot, { backgroundColor: getStatusColor(d.status) }]} />
                  <Text style={s.dateRowText}>{d.date}</Text>
                  {selectedDate === d.date && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent || COLORS.secondary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Included - Collapsible */}
          <TouchableOpacity style={s.collapsibleHeader} onPress={() => setShowIncluded(!showIncluded)}>
            <Text style={s.collapsibleTitle}>
              {language === 'fr' ? 'Ce tarif comprend' : 'This rate includes'}
            </Text>
            <Ionicons name={showIncluded ? 'chevron-up' : 'chevron-down'} size={22} color={COLORS.primary} />
          </TouchableOpacity>
          {showIncluded && (
            <View style={s.collapsibleContent}>
              {included.map((item, i) => (
                <View key={i} style={s.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={s.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Not Included - Collapsible */}
          <TouchableOpacity style={s.collapsibleHeader} onPress={() => setShowNotIncluded(!showNotIncluded)}>
            <Text style={[s.collapsibleTitle, { color: '#FF3B30' }]}>
              {language === 'fr' ? 'Le tarif ne comprend pas' : 'This rate does not include'}
            </Text>
            <Ionicons name={showNotIncluded ? 'chevron-up' : 'chevron-down'} size={22} color="#FF3B30" />
          </TouchableOpacity>
          {showNotIncluded && (
            <View style={s.collapsibleContent}>
              {notIncluded.map((item, i) => (
                <View key={i} style={s.listItem}>
                  <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  <Text style={s.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={s.fixedBook}>
        <View>
          <Text style={s.fixedBookPrice}>
            {language === 'fr' ? 'À partir de ' : 'From '}
            {cruise.pricing.cabin_price}€
          </Text>
          <Text style={s.fixedBookPriceSub}>{t('perPerson')}</Text>
        </View>
        <TouchableOpacity style={s.fixedBookBtn} onPress={handleBooking}>
          <Text style={s.fixedBookBtnText}>{t('bookNow')}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: COLORS.white, fontWeight: '600' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' },

  // Hero
  hero: { height: 340, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,28,64,0.45)',
    justifyContent: 'center', padding: SPACING.lg, paddingBottom: 60,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(14,28,64,0.7)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 8,
  },
  heroBadgeText: { color: COLORS.secondary, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  heroName: { fontSize: 28, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginLeft: 6 },

  // Next Departure Card
  nextDepartureCard: {
    marginHorizontal: SPACING.md, marginTop: -30,
    backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12,
    elevation: 8, borderLeftWidth: 4, borderLeftColor: COLORS.secondary,
  },
  nextDepartureHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  nextDepartureTitle: {
    fontSize: 12, fontWeight: '800', color: COLORS.primary,
    letterSpacing: 2, marginLeft: 8,
  },
  nextDepartureDate: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  nextDepartureFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  nextDeparturePrice: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  nextDeparturePriceLabel: { fontSize: 12, color: COLORS.textSecondary },
  nextDepartureStatus: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  nextDepartureStatusText: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  nextDepartureBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12,
  },
  nextDepartureBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginRight: 8 },

  // Content
  content: { padding: SPACING.lg },
  descText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.lg },

  // Pricing
  pricingRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.lg },
  priceCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: SPACING.md,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary,
  },
  priceCardGold: { backgroundColor: COLORS.primary, borderColor: COLORS.secondary },
  priceLabel: { fontSize: 11, fontWeight: '600', color: COLORS.primary, textAlign: 'center', marginTop: 8 },
  priceVal: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  pricePer: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  // Sections
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },

  // Highlights
  highlightItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  highlightText: { marginLeft: 10, fontSize: 14, color: COLORS.primary, fontWeight: '500', flex: 1 },

  // Program - Timeline
  timeline: {},
  timelineItem: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { alignItems: 'center', width: 44 },
  timelineDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.secondary,
  },
  timelineDotText: { color: COLORS.secondary, fontSize: 14, fontWeight: '800' },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(197,171,110,0.3)', marginVertical: 4 },
  timelineContent: {
    flex: 1, marginLeft: 14, paddingBottom: 20,
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  timelineTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  timelineDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Dates
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent',
  },
  dateRowSelected: { borderColor: COLORS.secondary, backgroundColor: '#FBF8F2' },
  dateRowFull: { opacity: 0.5 },
  dateRowInfo: { flex: 1 },
  dateRowText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dateRowStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  dateRowPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginRight: 10 },
  textStrike: { textDecorationLine: 'line-through', color: COLORS.textSecondary },

  // Collapsible
  collapsibleHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 8,
  },
  collapsibleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  collapsibleContent: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12,
    marginTop: -4,
  },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  listItemText: { flex: 1, marginLeft: 10, fontSize: 13, color: COLORS.text, lineHeight: 19 },

  // Fixed Book
  fixedBook: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, padding: SPACING.md,
    borderTopWidth: 1, borderTopColor: '#E8E4DF',
  },
  fixedBookPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  fixedBookPriceSub: { fontSize: 11, color: COLORS.textSecondary },
  fixedBookBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
  },
  fixedBookBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginRight: 8 },
});
