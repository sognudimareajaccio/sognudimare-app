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

// Logo URL from website
const LOGO_URL = 'https://static.wixstatic.com/media/ac2dc0_cf6b3b4e0ae345acbeb00d34a8fdc9d6~mv2.png/v1/fill/w_77,h_77,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ac2dc0_cf6b3b4e0ae345acbeb00d34a8fdc9d6~mv2.png';

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
      // Set first available date as default
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
      case 'available':
        return COLORS.available;
      case 'limited':
        return COLORS.limited;
      case 'full':
        return COLORS.full;
      default:
        return COLORS.textSecondary;
    }
  };

  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'available':
        return t('available');
      case 'limited':
        return t('limited');
      case 'full':
        return t('full');
      default:
        return status;
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
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
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>{t('duration')}</Text>
              <Text style={styles.quickInfoValue}>{cruise.duration}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>{t('departure')}</Text>
              <Text style={styles.quickInfoValue}>{cruise.departure_port}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            {cruise.pricing.cabin_price && (
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
              <View style={[styles.priceCard, styles.priceCardPrivate]}>
                <View style={styles.priceHeader}>
                  <Ionicons name="boat" size={24} color={COLORS.secondary} />
                  <Text style={[styles.priceCardTitle, { color: COLORS.secondary }]}>
                    {t('fullPrivatization')}
                  </Text>
                </View>
                <Text style={[styles.priceAmount, { color: COLORS.secondary }]}>
                  {cruise.pricing.private_price}€
                </Text>
              </View>
            )}
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('highlights')}</Text>
            <View style={styles.highlightsList}>
              {highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
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
              <View key={index} style={styles.dateItem}>
                <View
                  style={[
                    styles.dateStatus,
                    { backgroundColor: getAvailabilityColor(dateInfo.status) },
                  ]}
                />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateText}>{formatDate(dateInfo.date)}</Text>
                  <Text style={styles.dateStatusText}>
                    {getAvailabilityLabel(dateInfo.status)}
                    {dateInfo.status === 'limited' &&
                      dateInfo.remaining_places &&
                      ` - ${dateInfo.remaining_places} ${t('remainingPlaces')}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    color: COLORS.text,
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
    height: 280,
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
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: -SPACING.xl,
    ...SHADOWS.md,
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
    color: COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
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
  highlightsList: {
    gap: SPACING.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
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
    backgroundColor: COLORS.primary,
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
    ...SHADOWS.sm,
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
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
});
