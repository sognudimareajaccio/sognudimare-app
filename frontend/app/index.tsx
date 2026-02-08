import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppStore } from '../src/store/appStore';
import { cruiseApi, Cruise, seedDatabase } from '../src/services/api';

const { width } = Dimensions.get('window');

const HERO_IMAGE = 'https://images.unsplash.com/photo-1599580792927-de3b03c5dc20?w=1200';

export default function HomeScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { setLanguage } = useAppStore();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // First try to seed the database
      try {
        await seedDatabase();
      } catch (e) {
        // Database might already be seeded
      }
      
      const data = await cruiseApi.getAll();
      setCruises(data);
    } catch (error) {
      console.error('Error loading cruises:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const differenceItems = [
    { icon: 'heart', label: t('authenticCruises') },
    { icon: 'leaf', label: t('slowTourism') },
    { icon: 'boat', label: t('recentCatamarans') },
    { icon: 'people', label: t('dedicatedCrew') },
    { icon: 'restaurant', label: t('localFood') },
    { icon: 'earth', label: t('ecoCommitment') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1599580792927-de3b03c5dc20?w=100' }}
            style={styles.logo}
          />
          <Text style={styles.logoText}>SOGNUDIMARE</Text>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
            <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push('/cruises')}
            >
              <Text style={styles.heroButtonText}>{t('discoverCruises')}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Our Difference Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ourDifference')}</Text>
          <View style={styles.differenceGrid}>
            {differenceItems.map((item, index) => (
              <View key={index} style={styles.differenceItem}>
                <View style={styles.differenceIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.differenceLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Cruises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ourDestinations')}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cruisesScroll}
            >
              {cruises.slice(0, 4).map((cruise) => (
                <TouchableOpacity
                  key={cruise.id}
                  style={styles.cruiseCard}
                  onPress={() => router.push(`/cruise/${cruise.id}`)}
                >
                  <Image source={{ uri: cruise.image_url }} style={styles.cruiseImage} />
                  <View style={styles.cruiseCardContent}>
                    <Text style={styles.cruiseSubtitle}>
                      {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                    </Text>
                    <Text style={styles.cruiseName}>
                      {language === 'fr' ? cruise.name_fr : cruise.name_en}
                    </Text>
                    <View style={styles.cruisePriceRow}>
                      <Text style={styles.cruisePrice}>
                        {t('from')} {cruise.pricing.cabin_price || cruise.pricing.private_price}€
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>{t('aboutTitle')}</Text>
          <Text style={styles.aboutText}>{t('aboutText')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2021</Text>
              <Text style={styles.statLabel}>{t('createdIn')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>{t('destinations')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>11</Text>
              <Text style={styles.statLabel}>{t('localPartners')}</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
  },
  langText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  heroContainer: {
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  heroButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  differenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  differenceItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  differenceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  differenceLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  cruisesScroll: {
    paddingRight: SPACING.lg,
  },
  cruiseCard: {
    width: width * 0.7,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cruiseImage: {
    width: '100%',
    height: 180,
  },
  cruiseCardContent: {
    padding: SPACING.md,
  },
  cruiseSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cruiseName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  cruisePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cruisePrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  aboutSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  aboutTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  aboutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    lineHeight: 24,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
