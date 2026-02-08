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

const HERO_IMAGE = 'https://static.wixstatic.com/media/ac2dc0_44e4ce464e8a4820b7f34f4b3dc5fe3c~mv2.jpg/v1/fill/w_1903,h_770,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ac2dc0_44e4ce464e8a4820b7f34f4b3dc5fe3c~mv2.jpg';
const LOGO_URL = 'https://static.wixstatic.com/media/ac2dc0_cf6b3b4e0ae345acbeb00d34a8fdc9d6~mv2.png/v1/fill/w_77,h_77,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ac2dc0_cf6b3b4e0ae345acbeb00d34a8fdc9d6~mv2.png';

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
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.logoText}>SOGNUDIMARE</Text>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
            <Ionicons name="globe-outline" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Image source={{ uri: LOGO_URL }} style={styles.heroLogo} />
            <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push('/cruises')}
            >
              <Text style={styles.heroButtonText}>{t('discoverCruises')}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
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
                  <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
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
            <ActivityIndicator size="large" color={COLORS.accent} />
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

        {/* Club Section */}
        <View style={styles.clubSection}>
          <Text style={styles.clubTitle}>{t('clubTitle')}</Text>
          <Text style={styles.clubSubtitle}>
            {language === 'fr' 
              ? 'Économisez jusqu\'à 20% sur vos croisières en rejoignant le Club des Voyageurs !'
              : 'Save up to 20% on your cruises by joining the Travelers Club!'}
          </Text>
          <View style={styles.clubCardsPreview}>
            <View style={styles.clubCardPreview}>
              <Text style={styles.clubCardDuration}>12 {language === 'fr' ? 'mois' : 'months'}</Text>
              <Text style={styles.clubCardPrice}>90€</Text>
              <Text style={styles.clubCardDiscount}>-10%</Text>
            </View>
            <View style={[styles.clubCardPreview, styles.clubCardHighlight]}>
              <Text style={[styles.clubCardDuration, styles.clubCardTextLight]}>24 {language === 'fr' ? 'mois' : 'months'}</Text>
              <Text style={[styles.clubCardPrice, styles.clubCardTextLight]}>150€</Text>
              <Text style={styles.clubCardDiscountHighlight}>-15%</Text>
            </View>
            <View style={styles.clubCardPreview}>
              <Text style={styles.clubCardDuration}>36 {language === 'fr' ? 'mois' : 'months'}</Text>
              <Text style={styles.clubCardPrice}>140€</Text>
              <Text style={styles.clubCardDiscount}>-20%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clubButton}
            onPress={() => router.push('/club')}
          >
            <Text style={styles.clubButtonText}>{t('joinClub')}</Text>
          </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
    letterSpacing: 2,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  langText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    marginRight: SPACING.xs,
  },
  heroContainer: {
    height: 450,
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
  heroLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  heroButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
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
    color: COLORS.primary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cruiseName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  cruisePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cruisePrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    fontWeight: '700',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  clubSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  clubTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  clubSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  clubCardsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  clubCardPreview: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '30%',
  },
  clubCardHighlight: {
    backgroundColor: COLORS.accent,
    transform: [{ scale: 1.05 }],
  },
  clubCardDuration: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clubCardTextLight: {
    color: COLORS.primary,
  },
  clubCardPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  clubCardDiscount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.accent,
  },
  clubCardDiscountHighlight: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  clubButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  clubButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  aboutSection: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  aboutTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  aboutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
