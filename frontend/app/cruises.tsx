import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../src/services/api';

export default function CruisesScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCruises();
  }, []);

  const loadCruises = async () => {
    try {
      const data = await cruiseApi.getAll();
      setCruises(data);
    } catch (error) {
      console.error('Error loading cruises:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCruises();
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

  const getNextAvailableDate = (cruise: Cruise) => {
    const availableDate = cruise.available_dates.find(
      (d) => d.status === 'available' || d.status === 'limited'
    );
    return availableDate;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', options);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('ourDestinations')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {cruises.map((cruise) => {
          const nextDate = getNextAvailableDate(cruise);
          return (
            <TouchableOpacity
              key={cruise.id}
              style={styles.cruiseCard}
              onPress={() => router.push(`/cruise/${cruise.id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: cruise.image_url }} style={styles.cruiseImage} />
              <View style={styles.imageOverlay}>
                <View style={styles.badgeContainer}>
                  {cruise.cruise_type === 'cabin' || cruise.cruise_type === 'both' ? (
                    <View style={styles.badge}>
                      <Ionicons name="bed" size={12} color={COLORS.white} />
                      <Text style={styles.badgeText}>{t('cabin')}</Text>
                    </View>
                  ) : null}
                  {cruise.cruise_type === 'private' || cruise.cruise_type === 'both' ? (
                    <View style={[styles.badge, styles.privateBadge]}>
                      <Ionicons name="boat" size={12} color={COLORS.white} />
                      <Text style={styles.badgeText}>{t('private')}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cruiseSubtitle}>
                  {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                </Text>
                <Text style={styles.cruiseName}>
                  {language === 'fr' ? cruise.name_fr : cruise.name_en}
                </Text>
                <Text style={styles.cruiseDescription} numberOfLines={2}>
                  {language === 'fr' ? cruise.description_fr : cruise.description_en}
                </Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{cruise.duration}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{cruise.departure_port}</Text>
                  </View>
                </View>

                {/* Pricing */}
                <View style={styles.pricingRow}>
                  {cruise.pricing.cabin_price && (
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>{t('cabin')}</Text>
                      <Text style={styles.priceValue}>
                        {cruise.pricing.cabin_price}€{t('perPerson')}
                      </Text>
                    </View>
                  )}
                  {cruise.pricing.private_price && (
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>{t('private')}</Text>
                      <Text style={styles.priceValue}>
                        {cruise.pricing.private_price}€
                      </Text>
                    </View>
                  )}
                </View>

                {/* Next available date */}
                {nextDate && (
                  <View style={styles.availabilityRow}>
                    <View
                      style={[
                        styles.availabilityDot,
                        { backgroundColor: getAvailabilityColor(nextDate.status) },
                      ]}
                    />
                    <Text style={styles.availabilityText}>
                      {formatDate(nextDate.date)}
                      {nextDate.status === 'limited' &&
                        nextDate.remaining_places &&
                        ` - ${nextDate.remaining_places} ${t('remainingPlaces')}`}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/cruise/${cruise.id}`)}
                >
                  <Text style={styles.detailsButtonText}>{t('seeDetails')}</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
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
  scrollContent: {
    padding: SPACING.lg,
  },
  cruiseCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cruiseImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  privateBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cruiseSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cruiseName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  cruiseDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pricingRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xl,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  availabilityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  detailsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
});
