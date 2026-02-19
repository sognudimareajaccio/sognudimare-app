import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';

// Catamaran data
const CATAMARANS = [
  {
    id: 'lagoon-38',
    name: 'LAGOON 38',
    tagline_fr: 'Naviguez avec élégance',
    tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_024c0100065546fbabe332bcb97a841f~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/catamaran-lagoon-38-slider-25.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg',
    ],
    capacity: 8,
    cabins: 4,
    bathrooms: 2,
    specs: {
      length: '13,12 m',
      width: '6,65 m',
      draft: '1,26 m',
      mainsail: '56 m²',
      jib: '23 m²',
      engine: '2 x 29 CV',
      fuel: '400 L',
      water: '300 L',
    },
    features_fr: [
      'Flybridge spacieux avec poste de barre surélevé',
      'Visibilité panoramique à 360°',
      'Cockpit avant encastré (rare sur cette taille)',
      'Table pour 8 personnes avec banquettes en U',
      'Cuisine extérieure avec évier et frigo',
      'Bains de soleil sur flybridge et pont avant',
    ],
    features_en: [
      'Spacious flybridge with elevated helm station',
      '360° panoramic visibility',
      'Built-in forward cockpit (rare on this size)',
      'Table for 8 with U-shaped seating',
      'Outdoor kitchen with sink and fridge',
      'Sunbathing areas on flybridge and foredeck',
    ],
  },
  {
    id: 'lagoon-43',
    name: 'LAGOON 43',
    tagline_fr: 'Naviguez avec élégance',
    tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_5929704591ae45fe935f994303ec34a4~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/slider-lagoon-43-24.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg',
    ],
    capacity: 8,
    cabins: 4,
    bathrooms: 4,
    specs: {
      length: '13,85 m',
      width: '7,69 m',
      draft: '1,31 m',
      mainsail: '68 m²',
      jib: '37 m²',
      engine: '2 x 57 CV',
      fuel: '570 L',
      water: '300 L',
    },
    features_fr: [
      'Flybridge spacieux et central',
      'Poste de barre avec visibilité panoramique à 360°',
      'Accès double depuis le cockpit arrière',
      'Grande banquette en L pour détente',
      'Hardtop pour protection solaire',
      'Plage arrière dégagée avec plateforme',
    ],
    features_en: [
      'Spacious and central flybridge',
      'Helm station with 360° panoramic visibility',
      'Double access from aft cockpit',
      'Large L-shaped bench for relaxation',
      'Hardtop for sun protection',
      'Clear stern platform',
    ],
  },
  {
    id: 'lagoon-46',
    name: 'LAGOON 46',
    tagline_fr: 'Naviguez avec élégance',
    tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_ab91617a12cd4697aa8c83c9c5fcbd83~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/lagoon%2046%20corse%20du%20%20sud.jpeg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png',
      'https://static.wixstatic.com/media/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg',
    ],
    capacity: 8,
    cabins: 4,
    bathrooms: 4,
    specs: {
      length: '13,99 m',
      width: '7,96 m',
      draft: '1,30 m',
      mainsail: '87 m²',
      jib: '50 m²',
      engine: '2 x 57 CV',
      fuel: '2 x 520 L',
      water: '2 x 300 L',
    },
    features_fr: [
      'Le plus grand de notre flotte',
      'Flybridge spacieux avec hardtop',
      'Carré très lumineux avec vue panoramique',
      'Cuisine en U avec accès direct au cockpit',
      'Matelas confort haut de gamme',
      'Nombreux coffres de rangement',
    ],
    features_en: [
      'The largest in our fleet',
      'Spacious flybridge with hardtop',
      'Very bright saloon with panoramic view',
      'U-shaped kitchen with direct cockpit access',
      'High-end comfort mattresses',
      'Numerous storage compartments',
    ],
  },
];

export default function CatamaransScreen() {
  const { language } = useTranslation();
  const router = useRouter();
  const [selectedCatamaran, setSelectedCatamaran] = useState<typeof CATAMARANS[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openDetail = (catamaran: typeof CATAMARANS[0]) => {
    setSelectedCatamaran(catamaran);
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'fr' ? 'Les Catamarans' : 'The Catamarans'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>
            {language === 'fr' ? 'La flotte de navires\nde sognudimare' : 'The sognudimare\nfleet'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {language === 'fr' 
              ? 'Des catamarans récents, spacieux et conçus pour une navigation douce et respectueuse' 
              : 'Recent, spacious catamarans designed for smooth and respectful sailing'}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <MaterialCommunityIcons name="sail-boat" size={48} color={COLORS.accent} />
          <Text style={styles.introTitle}>
            {language === 'fr' ? 'Pour les croisières catamarans' : 'For catamaran cruises'}
          </Text>
          <Text style={styles.introText}>
            {language === 'fr' 
              ? 'Notre flotte se compose de catamarans récents, spacieux et conçus pour une navigation douce et respectueuse. Leur stabilité et leur faible tirant d\'eau permettent d\'accéder en toute sérénité à des criques secrètes et à des mouillages préservés, loin des foules.'
              : 'Our fleet consists of recent, spacious catamarans designed for smooth and respectful sailing. Their stability and shallow draft allow serene access to secret coves and preserved anchorages, far from the crowds.'}
          </Text>
        </View>

        {/* Responsible Approach */}
        <View style={styles.approachSection}>
          <View style={styles.approachCard}>
            <Ionicons name="leaf" size={32} color={COLORS.secondary} />
            <Text style={styles.approachTitle}>
              {language === 'fr' ? 'Une démarche responsable et locale' : 'A responsible and local approach'}
            </Text>
            <Text style={styles.approachText}>
              {language === 'fr' 
                ? 'Nicolas, votre capitaine, privilégie l\'économie de l\'usage et de la fonctionnalité, en s\'appuyant sur des partenaires locaux de confiance. Cette approche garantit des bateaux toujours récents, entretenus avec soin.'
                : 'Nicolas, your captain, favors economy of use and functionality, relying on trusted local partners. This approach guarantees always recent boats, carefully maintained.'}
            </Text>
          </View>
          <View style={styles.approachCard}>
            <Ionicons name="heart" size={32} color={COLORS.secondary} />
            <Text style={styles.approachTitle}>
              {language === 'fr' ? 'Confort et art de vivre en mer' : 'Comfort and art of living at sea'}
            </Text>
            <Text style={styles.approachText}>
              {language === 'fr' 
                ? 'À bord, les catamarans marient élégance et praticité : cabines lumineuses, espaces de vie conviviaux et cuisine équipée pour partager des repas inspirés des saveurs locales.'
                : 'On board, the catamarans combine elegance and practicality: bright cabins, friendly living spaces and equipped kitchen to share meals inspired by local flavors.'}
            </Text>
          </View>
        </View>

        {/* Catamarans List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'NOTRE FLOTTE' : 'OUR FLEET'}
          </Text>
          
          {CATAMARANS.map((catamaran, index) => (
            <TouchableOpacity 
              key={catamaran.id} 
              style={styles.catamaranCard}
              onPress={() => openDetail(catamaran)}
            >
              <Image source={{ uri: catamaran.image }} style={styles.catamaranImage} />
              <View style={styles.catamaranContent}>
                <Text style={styles.catamaranName}>{catamaran.name}</Text>
                <Text style={styles.catamaranTagline}>
                  {language === 'fr' ? catamaran.tagline_fr : catamaran.tagline_en}
                </Text>
                
                <View style={styles.specsRow}>
                  <View style={styles.specItem}>
                    <Ionicons name="people" size={18} color={COLORS.accent} />
                    <Text style={styles.specText}>{catamaran.capacity} {language === 'fr' ? 'passagers' : 'passengers'}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="bed" size={18} color={COLORS.accent} />
                    <Text style={styles.specText}>{catamaran.cabins} {language === 'fr' ? 'cabines' : 'cabins'}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="water" size={18} color={COLORS.accent} />
                    <Text style={styles.specText}>{catamaran.bathrooms} {language === 'fr' ? 'SdB' : 'bath'}</Text>
                  </View>
                </View>

                <View style={styles.dimensionsRow}>
                  <Text style={styles.dimensionText}>L: {catamaran.specs.length}</Text>
                  <Text style={styles.dimensionText}>l: {catamaran.specs.width}</Text>
                </View>

                <TouchableOpacity style={styles.detailButton} onPress={() => openDetail(catamaran)}>
                  <Text style={styles.detailButtonText}>
                    {language === 'fr' ? 'Voir les détails' : 'View details'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            {language === 'fr' ? 'Prêt à embarquer ?' : 'Ready to board?'}
          </Text>
          <Text style={styles.ctaText}>
            {language === 'fr' 
              ? 'Découvrez nos croisières et choisissez votre prochaine aventure en mer.'
              : 'Discover our cruises and choose your next adventure at sea.'}
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/cruises')}>
            <Text style={styles.ctaButtonText}>
              {language === 'fr' ? 'Voir les croisières' : 'View cruises'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        {selectedCatamaran && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedCatamaran.name}</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Gallery */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.gallery}
                contentContainerStyle={styles.galleryContent}
              >
                {selectedCatamaran.gallery.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
                ))}
              </ScrollView>

              {/* Quick Specs */}
              <View style={styles.quickSpecs}>
                <View style={styles.quickSpecItem}>
                  <Ionicons name="people" size={24} color={COLORS.accent} />
                  <Text style={styles.quickSpecValue}>{selectedCatamaran.capacity}</Text>
                  <Text style={styles.quickSpecLabel}>{language === 'fr' ? 'Passagers' : 'Passengers'}</Text>
                </View>
                <View style={styles.quickSpecItem}>
                  <Ionicons name="bed" size={24} color={COLORS.accent} />
                  <Text style={styles.quickSpecValue}>{selectedCatamaran.cabins}</Text>
                  <Text style={styles.quickSpecLabel}>{language === 'fr' ? 'Cabines' : 'Cabins'}</Text>
                </View>
                <View style={styles.quickSpecItem}>
                  <Ionicons name="water" size={24} color={COLORS.accent} />
                  <Text style={styles.quickSpecValue}>{selectedCatamaran.bathrooms}</Text>
                  <Text style={styles.quickSpecLabel}>{language === 'fr' ? 'Salles d\'eau' : 'Bathrooms'}</Text>
                </View>
              </View>

              {/* Characteristics */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  {language === 'fr' ? 'CARACTÉRISTIQUES' : 'SPECIFICATIONS'}
                </Text>
                
                <View style={styles.specsGrid}>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Longueur' : 'Length'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.length}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Largeur' : 'Width'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.width}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Tirant d\'eau' : 'Draft'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.draft}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Grand-voile' : 'Mainsail'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.mainsail}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Génois/Foc' : 'Jib'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.jib}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Motorisation' : 'Engine'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.engine}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Carburant' : 'Fuel'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.fuel}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>{language === 'fr' ? 'Eau douce' : 'Fresh water'}</Text>
                    <Text style={styles.specValue}>{selectedCatamaran.specs.water}</Text>
                  </View>
                </View>
              </View>

              {/* Features */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  {language === 'fr' ? 'AMÉNAGEMENTS' : 'AMENITIES'}
                </Text>
                
                {(language === 'fr' ? selectedCatamaran.features_fr : selectedCatamaran.features_en).map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Book Button */}
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => {
                  setShowModal(false);
                  router.push('/cruises');
                }}
              >
                <Text style={styles.bookButtonText}>
                  {language === 'fr' ? 'Réserver une croisière' : 'Book a cruise'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>

              <View style={{ height: SPACING.xxl }} />
            </ScrollView>
          </SafeAreaView>
        )}
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: SPACING.md,
  },
  introSection: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  introTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  approachSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  approachCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  approachTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  approachText: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 16,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  catamaranCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catamaranImage: {
    width: '100%',
    height: 200,
  },
  catamaranContent: {
    padding: SPACING.lg,
  },
  catamaranName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  catamaranTagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  dimensionsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  dimensionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  detailButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  ctaSection: {
    backgroundColor: COLORS.accent,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  ctaText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  ctaButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  gallery: {
    marginVertical: SPACING.md,
  },
  galleryContent: {
    paddingHorizontal: SPACING.md,
  },
  galleryImage: {
    width: width * 0.8,
    height: 220,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  quickSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  quickSpecItem: {
    alignItems: 'center',
  },
  quickSpecValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  quickSpecLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    opacity: 0.8,
  },
  modalSection: {
    padding: SPACING.lg,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  specsGrid: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  bookButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
});
