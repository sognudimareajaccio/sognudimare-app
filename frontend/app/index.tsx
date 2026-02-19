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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppStore } from '../src/store/appStore';
import { cruiseApi, Cruise, seedDatabase } from '../src/services/api';

const { width } = Dimensions.get('window');

// Images from sognudimare website
const HERO_IMAGE = 'https://static.wixstatic.com/media/ce6ce7_d0178804b62b4c56802db975ade4e29ff000.jpg/v1/fill/w_1904,h_1008,al_c,q_85,usm_0.33_1.00_0.00,enc_avif,quality_auto/ce6ce7_d0178804b62b4c56802db975ade4e29ff000.jpg';
const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';
const BOARDING_CARDS_IMAGE = 'https://customer-assets.emergentagent.com/job_sognudi-app/artifacts/b4ya6cm8_15.jpg';

// Portfolio photos from sognudimare website
const PORTFOLIO_PHOTOS = [
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_0ce032b8fe2e4bf58652c8d18e897478~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/SOGNUDIMARE%20CROISIERE%20CATAMARAN%20DEPUIS%20AJACCIO%20copie.jpg',
    label_fr: 'Tour de Corse',
    label_en: 'Tour of Corsica'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_f3bee630d0c549388bbc71c0e58fb9ea~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/sognudimare%20a%20scandola_edited.jpg',
    label_fr: 'Scandola',
    label_en: 'Scandola'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_9e15d4c9779b4d48ad56a689ab2fe02b~mv2.avif/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/LAGOON%2043%20SOGNUDIMARE.avif',
    label_fr: 'Notre Catamaran',
    label_en: 'Our Catamaran'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_1872feb30a584c1da72e05ee7d37fb22~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_1872feb30a584c1da72e05ee7d37fb22~mv2.jpg',
    label_fr: 'Îles Lavezzi',
    label_en: 'Lavezzi Islands'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_7f55aceeb39542168e40d1384ab96e09~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_7f55aceeb39542168e40d1384ab96e09~mv2.jpg',
    label_fr: 'Criques secrètes',
    label_en: 'Secret coves'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_e68872eb7cb44d2ba34396071f003322~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_e68872eb7cb44d2ba34396071f003322~mv2.jpg',
    label_fr: 'Eaux cristallines',
    label_en: 'Crystal waters'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_d9f82f1b7c874908a2b4e92a82d98086~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/cala-orzu.jpg',
    label_fr: 'Cala d\'Orzu',
    label_en: 'Cala d\'Orzu'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_322d9b6fa5b1489689b338b8367512ef~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/team.jpg',
    label_fr: 'L\'équipage',
    label_en: 'The crew'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_33c3f5377f8546a68ad7377405f13f95~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/PHOTO-2025-08-02-23-15-20%204.jpg',
    label_fr: 'À bord',
    label_en: 'On board'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/slider-lagoon-43-21.jpg',
    label_fr: 'Lagoon 43',
    label_en: 'Lagoon 43'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_98fe44ee0ba0419794505afe2c70aa95~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/SOGNUDIMARE%20CROISIERE%20CATAMARAN%20DEPUIS%20AJACCIO.jpg',
    label_fr: 'Coucher de soleil',
    label_en: 'Sunset'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_1f87dc5f279b4f8c910f5badc47d8385~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/tour%20santa%20maria%20cap%20corse%20avec%20sognudimare%20catamarans_JPG.jpg',
    label_fr: 'Cap Corse',
    label_en: 'Cap Corse'
  },
];

// Local partners
const LOCAL_PARTNERS = [
  { name: 'ANAREDA', type: 'Epicerie Vrac' },
  { name: 'A STRADA CAMPAGNOLA', type: 'Producteur' },
  { name: 'Boucherie J.J DE PERETTI', type: 'Boucherie' },
  { name: 'GRAZIA DOLCE AMORE', type: 'Glaces' },
  { name: 'CORSICA BEAUTY', type: 'Cosmétiques' },
  { name: 'FROMAGERIE CHEZ BERNARD', type: 'Fromagerie' },
  { name: 'BOULANGERIE PIERRE', type: 'Boulangerie' },
  { name: 'PRIMEUR EMILIE & CHARLY', type: 'Fruits & Légumes' },
  { name: 'LE CHEMIN DES VIGNOBLES', type: 'Vins' },
  { name: 'A MOGLIA DI U PESCADORE', type: 'Poissonnerie' },
  { name: 'CARPEDIEM AJACCIO', type: 'Restaurant' },
];

// What's included - 9 items with full details
const ALL_INCLUSIVE_FEATURES = [
  { 
    icon: 'bed', 
    title_fr: 'HÉBERGEMENT', 
    title_en: 'ACCOMMODATION',
    desc_fr: 'Cabine double tout confort avec salle d\'eau et WC indépendants. Draps, serviettes et foutas fournis.',
    desc_en: 'Double cabin with en-suite bathroom. Sheets, towels and foutas provided.',
    petit_plus_fr: 'CABINES PERSONNALISÉES',
    petit_plus_en: 'PERSONALIZED CABINS'
  },
  { 
    icon: 'restaurant', 
    title_fr: 'REPAS', 
    title_en: 'MEALS',
    desc_fr: 'Tous les repas préparés et servis à bord. Cuisine avec des produits locaux de producteurs passionnés.',
    desc_en: 'All meals prepared and served on board. Cooking with local products from passionate producers.',
    petit_plus_fr: 'PRODUITS LOCAUX',
    petit_plus_en: 'LOCAL PRODUCTS'
  },
  { 
    icon: 'wine', 
    title_fr: 'BOISSONS', 
    title_en: 'DRINKS',
    desc_fr: 'Toutes les boissons (softs & alcools). Vins issus exclusivement de vignobles locaux.',
    desc_en: 'All drinks (soft & alcoholic). Wines exclusively from local vineyards.',
    petit_plus_fr: 'VINS LOCAUX',
    petit_plus_en: 'LOCAL WINES'
  },
  { 
    icon: 'boat', 
    title_fr: 'CATAMARAN', 
    title_en: 'CATAMARAN',
    desc_fr: 'Bateaux modernes et confortables vers des criques confidentielles accessibles uniquement par la mer.',
    desc_en: 'Modern and comfortable boats to secluded coves accessible only by sea.',
    petit_plus_fr: 'BATEAUX RÉCENTS',
    petit_plus_en: 'RECENT BOATS'
  },
  { 
    icon: 'fish', 
    title_fr: 'MATÉRIELS DE PÊCHE', 
    title_en: 'FISHING GEAR',
    desc_fr: 'Cannes à pêche à disposition. Moment privilégié pour se reconnecter à la mer.',
    desc_en: 'Fishing rods available. A special moment to reconnect with the sea.',
    petit_plus_fr: 'DU POISSON FRAIS',
    petit_plus_en: 'FRESH FISH'
  },
  { 
    icon: 'water', 
    title_fr: 'PADDLE', 
    title_en: 'PADDLE',
    desc_fr: 'Glissez dans une crique sauvage ou profitez d\'un moment de détente au coucher du soleil.',
    desc_en: 'Glide into a wild cove or enjoy a relaxing moment at sunset.',
    petit_plus_fr: 'FORMATION DU CAPITAINE ;)',
    petit_plus_en: 'CAPTAIN TRAINING ;)'
  },
  { 
    icon: 'people', 
    title_fr: 'CANOË', 
    title_en: 'CANOE',
    desc_fr: 'Naviguer en douceur au rythme des pagaies, dans le respect de la nature.',
    desc_en: 'Navigate gently at the rhythm of the paddles, respecting nature.',
    petit_plus_fr: 'POUR DÉCOUVRIR EN COUPLE',
    petit_plus_en: 'FOR COUPLES TO DISCOVER'
  },
  { 
    icon: 'car', 
    title_fr: 'TRANSFERT', 
    title_en: 'TRANSFER',
    desc_fr: 'Transfert aéroport / port d\'embarquement inclus à l\'aller et au retour. Navette privative.',
    desc_en: 'Airport / boarding port transfer included both ways. Private shuttle.',
    petit_plus_fr: 'EXCLUSIVITÉ SOGNUDIMARE',
    petit_plus_en: 'SOGNUDIMARE EXCLUSIVE'
  },
  { 
    icon: 'heart', 
    title_fr: 'ÉQUIPAGE', 
    title_en: 'CREW',
    desc_fr: 'Équipe professionnelle et passionnée, dédiée à votre confort et sécurité.',
    desc_en: 'Professional and passionate team, dedicated to your comfort and safety.',
    petit_plus_fr: 'L\'ÉQUIPAGE EST UN COUPLE',
    petit_plus_en: 'THE CREW IS A COUPLE'
  },
];

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
      try {
        await seedDatabase();
      } catch (e) {}
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
    { icon: 'heart', label_fr: "L'authenticité de nos croisières", label_en: 'Authentic cruises', desc_fr: 'Des expériences uniques loin du tourisme de masse', desc_en: 'Unique experiences away from mass tourism' },
    { icon: 'leaf', label_fr: 'Le concept Slow Tourisme', label_en: 'Slow Tourism concept', desc_fr: 'Voyagez plus lentement, plus sainement', desc_en: 'Travel slower, healthier' },
    { icon: 'boat', label_fr: 'Des catamarans récents', label_en: 'Recent catamarans', desc_fr: 'Navires spacieux et confortables', desc_en: 'Spacious and comfortable vessels' },
    { icon: 'people', label_fr: "L'équipage aux petits soins", label_en: 'Dedicated crew', desc_fr: 'Maud & Nicolas à votre service', desc_en: 'Maud & Nicolas at your service' },
    { icon: 'restaurant', label_fr: 'Produits frais et locaux', label_en: 'Fresh local products', desc_fr: '11 partenaires locaux', desc_en: '11 local partners' },
    { icon: 'earth', label_fr: 'Engagement environnemental', label_en: 'Environmental commitment', desc_fr: '1% reversé aux associations', desc_en: '1% donated to associations' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>sognudimare</Text>
          </View>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
            <Ionicons name="globe-outline" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/cruises')}>
              <Text style={styles.heroButtonText}>{t('discoverCruises')}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Portfolio Section */}
        <View style={styles.portfolioSection}>
          <Text style={styles.portfolioTitle}>
            {language === 'fr' ? 'Découvrez nos croisières en images' : 'Discover our cruises in pictures'}
          </Text>
          <View style={styles.portfolioGrid}>
            {PORTFOLIO_PHOTOS.slice(0, 4).map((photo, index) => (
              <TouchableOpacity key={index} style={styles.portfolioItem}>
                <Image source={{ uri: photo.url }} style={styles.portfolioImage} />
                <View style={styles.portfolioOverlay}>
                  <Text style={styles.portfolioLabel}>
                    {language === 'fr' ? photo.label_fr : photo.label_en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.portfolioScrollContent}
            style={styles.portfolioScroll}
          >
            {PORTFOLIO_PHOTOS.slice(6).map((photo, index) => (
              <TouchableOpacity key={index} style={styles.portfolioScrollItem}>
                <Image source={{ uri: photo.url }} style={styles.portfolioScrollImage} />
                <View style={styles.portfolioScrollOverlay}>
                  <Text style={styles.portfolioScrollLabel}>
                    {language === 'fr' ? photo.label_fr : photo.label_en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Boarding Cards Section */}
        <View style={styles.boardingSection}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'Choisissez votre aventure' : 'Choose your adventure'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/cruises')}>
            <Image source={{ uri: BOARDING_CARDS_IMAGE }} style={styles.boardingCardsImage} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.boardingText}>
            {language === 'fr' 
              ? '8 jours / 7 nuits ou 2 semaines (selon la destination)\nen pension complète avec équipage aux petits soins.'
              : '8 days / 7 nights or 2 weeks (depending on destination)\nfull board with dedicated crew.'}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2021</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Création' : 'Created'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Destinations' : 'Destinations'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>13-26</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Repas frais' : 'Fresh meals'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>11</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Partenaires' : 'Partners'}</Text>
          </View>
        </View>

        {/* CE QUI FAIT VRAIMENT NOTRE DIFFÉRENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'Ce qui fait vraiment notre différence...' : 'What really makes us different...'}
          </Text>
          <View style={styles.differenceGrid}>
            {differenceItems.map((item, index) => (
              <View key={index} style={styles.differenceCard}>
                <View style={styles.differenceIconContainer}>
                  <Ionicons name={item.icon as any} size={28} color={COLORS.accent} />
                </View>
                <Text style={styles.differenceLabel}>
                  {language === 'fr' ? item.label_fr : item.label_en}
                </Text>
                <Text style={styles.differenceDesc}>
                  {language === 'fr' ? item.desc_fr : item.desc_en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* All Inclusive Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' 
              ? 'DES VACANCES TOUT INCLUS' 
              : 'ALL-INCLUSIVE VACATION'}
          </Text>
          <Text style={styles.allInclusiveSubtitle}>
            {language === 'fr' 
              ? 'Formule tout compris & respectueuse de l\'environnement\nLES PETITS +++ DE SOGNUDIMARE' 
              : 'All-inclusive & eco-friendly formula\nSOGNUDIMARE EXTRAS'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inclusiveScroll}>
            {ALL_INCLUSIVE_FEATURES.map((feature, index) => (
              <View key={index} style={styles.inclusiveCard}>
                <View style={styles.inclusiveHeader}>
                  <Ionicons name={feature.icon as any} size={32} color={COLORS.accent} />
                  <Text style={styles.inclusiveTitle}>
                    {language === 'fr' ? feature.title_fr : feature.title_en}
                  </Text>
                  <View style={styles.inclusiveBadge}>
                    <Text style={styles.inclusiveBadgeText}>INCLUS</Text>
                  </View>
                </View>
                <Text style={styles.inclusiveDesc}>
                  {language === 'fr' ? feature.desc_fr : feature.desc_en}
                </Text>
                <View style={styles.petitPlusBox}>
                  <Text style={styles.petitPlusLabel}>PETIT + SOGNUDIMARE</Text>
                  <Text style={styles.petitPlusText}>
                    {language === 'fr' ? feature.petit_plus_fr : feature.petit_plus_en}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Local Partners Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' 
              ? 'Une collaboration responsable et engagée' 
              : 'Responsible and committed collaboration'}
          </Text>
          <Text style={styles.partnersSubtitle}>
            {language === 'fr' 
              ? 'Nous travaillons uniquement avec des acteurs locaux' 
              : 'We work exclusively with local partners'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnersScroll}>
            {LOCAL_PARTNERS.map((partner, index) => (
              <View key={index} style={styles.partnerCard}>
                <View style={styles.partnerIcon}>
                  <Ionicons name="storefront" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerType}>{partner.type}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Cruises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ourDestinations')}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cruisesScroll}>
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
                    <Text style={styles.cruisePrice}>
                      {t('from')} {cruise.pricing.cabin_price || cruise.pricing.private_price}€
                    </Text>
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
              ? 'Économisez jusqu\'à 20% sur vos croisières !' 
              : 'Save up to 20% on your cruises!'}
          </Text>
          <View style={styles.clubCardsPreview}>
            <View style={styles.clubCardPreview}>
              <Text style={styles.clubCardDuration}>12 mois</Text>
              <Text style={styles.clubCardPrice}>90€</Text>
              <View style={styles.clubDiscountBadge}><Text style={styles.clubDiscountText}>-10%</Text></View>
            </View>
            <View style={[styles.clubCardPreview, styles.clubCardHighlight]}>
              <Text style={[styles.clubCardDuration, styles.clubCardTextLight]}>24 mois</Text>
              <Text style={[styles.clubCardPrice, styles.clubCardTextLight]}>150€</Text>
              <View style={styles.clubDiscountBadgeHighlight}><Text style={styles.clubDiscountTextDark}>-15%</Text></View>
            </View>
            <View style={styles.clubCardPreview}>
              <Text style={styles.clubCardDuration}>36 mois</Text>
              <Text style={styles.clubCardPrice}>140€</Text>
              <View style={styles.clubDiscountBadge}><Text style={styles.clubDiscountText}>-20%</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.clubButton} onPress={() => router.push('/club')}>
            <Text style={styles.clubButtonText}>{t('joinClub')}</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>{t('aboutTitle')}</Text>
          <Text style={styles.aboutText}>{t('aboutText')}</Text>
          <Text style={styles.aboutHighlight}>
            {language === 'fr' 
              ? 'En septembre 2025, la Corse a été labellisée GREEN DESTINATION, confirmant son rôle de référence méditerranéenne en matière de tourisme durable.' 
              : 'In September 2025, Corsica was labeled GREEN DESTINATION, confirming its role as a Mediterranean reference in sustainable tourism.'}
          </Text>
        </View>

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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 40,
  },
  logoText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
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
  // Portfolio Photo styles
  portfolioSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  portfolioTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: '48%',
    height: 120,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,37,82,0.4)',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  portfolioLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  portfolioScroll: {
    marginTop: SPACING.sm,
  },
  portfolioScrollContent: {
    paddingRight: SPACING.lg,
  },
  portfolioScrollItem: {
    width: 180,
    height: 120,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  portfolioScrollImage: {
    width: '100%',
    height: '100%',
  },
  portfolioScrollOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,37,82,0.4)',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  portfolioScrollLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  boardingSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  boardingCardsImage: {
    width: width - SPACING.lg * 2,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
  },
  boardingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
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
    marginTop: 2,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  differenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  differenceCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  differenceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  differenceLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  differenceDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  allInclusiveSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  inclusiveScroll: {
    paddingRight: SPACING.lg,
  },
  inclusiveCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  inclusiveHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inclusiveTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  inclusiveBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  inclusiveBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inclusiveDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  petitPlusBox: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  petitPlusLabel: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.8,
  },
  petitPlusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  partnersSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  partnersScroll: {
    paddingRight: SPACING.lg,
  },
  partnerCard: {
    width: 120,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partnerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  partnerName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  partnerType: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
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
    height: 160,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  cruisePrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '700',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  clubSection: {
    backgroundColor: COLORS.accent,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  clubTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  clubSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textAlign: 'center',
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
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
  },
  clubCardDuration: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clubCardTextLight: {
    color: COLORS.white,
  },
  clubCardPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  clubDiscountBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  clubDiscountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clubDiscountBadgeHighlight: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  clubDiscountTextDark: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clubButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  clubButtonText: {
    color: COLORS.secondary,
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
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  aboutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  aboutHighlight: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
