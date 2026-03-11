import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppStore } from '../src/store/appStore';
import { cruiseApi, Cruise, seedDatabase } from '../src/services/api';

const { width } = Dimensions.get('window');

// Hero carousel images
const HERO_CAROUSEL_IMAGES = [
  'https://customer-assets.emergentagent.com/job_5ba811cf-02a8-4655-b752-0019730eddad/artifacts/oxvhoibd_1741880477434-zoanls12-processed-1282x855-c-default.webp',
  'https://customer-assets.emergentagent.com/job_5ba811cf-02a8-4655-b752-0019730eddad/artifacts/edw900fs_1741880477436-zoanls34-processed-1282x855-c-default.webp',
  'https://customer-assets.emergentagent.com/job_5ba811cf-02a8-4655-b752-0019730eddad/artifacts/xd5y7qna_1741880477435-zoanls22-processed-1282x855-c-default.webp',
];

// Images from sognudimare website (keep for backup)
const HERO_IMAGE = 'https://static.wixstatic.com/media/ce6ce7_d0178804b62b4c56802db975ade4e29ff000.jpg/v1/fill/w_1904,h_1008,al_c,q_85,usm_0.33_1.00_0.00,enc_avif,quality_auto/ce6ce7_d0178804b62b4c56802db975ade4e29ff000.jpg';
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9595dfad-24f9-4c7d-8c80-c7800213d8b6/artifacts/xqltz436_Copie%20de%20logo%20sognudimare%202026.png';
const LOGO_FULL_URL = 'https://customer-assets.emergentagent.com/job_9595dfad-24f9-4c7d-8c80-c7800213d8b6/artifacts/fyysjnlz_2.png';
const BOARDING_CARDS_IMAGE = 'https://customer-assets.emergentagent.com/job_sognudi-app/artifacts/b4ya6cm8_15.jpg';

// Portfolio photos from sognudimare website
const PORTFOLIO_PHOTOS = [
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_0ce032b8fe2e4bf58652c8d18e897478~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/SOGNUDIMARE%20CROISIERE%20CATAMARAN%20DEPUIS%20AJACCIO%20copie.jpg',
    label_fr: 'Tour de Corse',
    label_en: 'Tour of Corsica',
    cruiseName: 'Tour de Corse'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_f3bee630d0c549388bbc71c0e58fb9ea~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/sognudimare%20a%20scandola_edited.jpg',
    label_fr: 'Scandola',
    label_en: 'Scandola',
    cruiseName: 'Ouest Corse'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_1872feb30a584c1da72e05ee7d37fb22~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_1872feb30a584c1da72e05ee7d37fb22~mv2.jpg',
    label_fr: 'Îles Lavezzi',
    label_en: 'Lavezzi Islands',
    cruiseName: 'Corse du Sud'
  },
  { 
    url: 'https://customer-assets.emergentagent.com/job_fe2730ba-35c4-4eb7-98c9-325cf295cc88/artifacts/c45b6sng_maddalena.jpg',
    label_fr: 'Archipel la Maddalena',
    label_en: 'Maddalena Archipelago',
    cruiseName: 'Corse du Sud & Sardaigne'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_9e15d4c9779b4d48ad56a689ab2fe02b~mv2.avif/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/LAGOON%2043%20SOGNUDIMARE.avif',
    label_fr: 'Les Catamarans',
    label_en: 'The Catamarans',
    link: '/catamarans'
  },
  { 
    url: 'https://static.wixstatic.com/media/ce6ce7_322d9b6fa5b1489689b338b8367512ef~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/team.jpg',
    label_fr: "L'équipage",
    label_en: 'The crew',
    link: '/equipage'
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
    iconType: 'ionicons',
    title_fr: 'HÉBERGEMENT', 
    title_en: 'ACCOMMODATION',
    desc_fr: 'Cabine double tout confort avec salle d\'eau et WC indépendants. Draps, serviettes et foutas fournis.',
    desc_en: 'Double cabin with en-suite bathroom. Sheets, towels and foutas provided.',
    petit_plus_fr: 'CABINES PERSONNALISÉES',
    petit_plus_en: 'PERSONALIZED CABINS'
  },
  { 
    icon: 'restaurant', 
    iconType: 'ionicons',
    title_fr: 'REPAS', 
    title_en: 'MEALS',
    desc_fr: 'Tous les repas préparés et servis à bord. Cuisine avec des produits locaux de producteurs passionnés.',
    desc_en: 'All meals prepared and served on board. Cooking with local products from passionate producers.',
    petit_plus_fr: 'PRODUITS LOCAUX',
    petit_plus_en: 'LOCAL PRODUCTS'
  },
  { 
    icon: 'wine', 
    iconType: 'ionicons',
    title_fr: 'BOISSONS', 
    title_en: 'DRINKS',
    desc_fr: 'Toutes les boissons (softs & alcools). Vins issus exclusivement de vignobles locaux.',
    desc_en: 'All drinks (soft & alcoholic). Wines exclusively from local vineyards.',
    petit_plus_fr: 'VINS LOCAUX',
    petit_plus_en: 'LOCAL WINES'
  },
  { 
    icon: 'sail-boat', 
    iconType: 'material',
    title_fr: 'CATAMARAN', 
    title_en: 'CATAMARAN',
    desc_fr: 'Embarquez pour une escapade en mer à bord de nos bateaux modernes et confortables, pensés pour la détente et l\'exploration en douceur.',
    desc_en: 'Embark on a sea getaway aboard our modern and comfortable boats, designed for relaxation and gentle exploration.',
    petit_plus_fr: 'BATEAUX RÉCENTS',
    petit_plus_en: 'RECENT BOATS'
  },
  { 
    icon: 'fish', 
    iconType: 'ionicons',
    title_fr: 'MATÉRIELS DE PÊCHE', 
    title_en: 'FISHING GEAR',
    desc_fr: 'Tout au long de votre croisière en catamaran, des cannes à pêche sont mises à disposition des passagers. Libre à vous de tenter votre chance, que ce soit au lever du soleil.',
    desc_en: 'Throughout your catamaran cruise, fishing rods are available for passengers. Feel free to try your luck, whether at sunrise.',
    petit_plus_fr: 'DU POISSON FRAIS',
    petit_plus_en: 'FRESH FISH'
  },
  { 
    icon: 'rowing', 
    iconType: 'material',
    title_fr: 'PADDLE', 
    title_en: 'PADDLE',
    desc_fr: 'Le paddle est l\'activité idéale pour s\'évader et se ressourcer. Accessible à tous, il permet de se reconnecter à la nature en douceur, de vivre la mer autrement et de prolonger l\'esprit du slow tourisme.',
    desc_en: 'Paddleboarding is the ideal activity to escape and recharge. Accessible to all, it allows you to gently reconnect with nature, experience the sea differently and extend the spirit of slow tourism.',
    petit_plus_fr: 'FORMATION DU CAPITAINE ;)',
    petit_plus_en: 'CAPTAIN TRAINING ;)'
  },
  { 
    icon: 'kayaking', 
    iconType: 'material',
    title_fr: 'CANOË', 
    title_en: 'CANOE',
    desc_fr: 'Facile d\'accès et convivial, le canoë invite à prendre le temps de naviguer en douceur, au rythme des pagaies, dans le respect de la nature et loin de l\'agitation.',
    desc_en: 'Easy to access and friendly, the canoe invites you to take the time to navigate gently, at the rhythm of the paddles, respecting nature and away from the hustle.',
    petit_plus_fr: 'POUR DÉCOUVRIR EN COUPLE',
    petit_plus_en: 'FOR COUPLES TO DISCOVER'
  },
  { 
    icon: 'car', 
    iconType: 'ionicons',
    title_fr: 'TRANSFERT', 
    title_en: 'TRANSFER',
    desc_fr: 'Transfert aéroport / port d\'embarquement inclus à l\'aller et au retour. Navette privative.',
    desc_en: 'Airport / boarding port transfer included both ways. Private shuttle.',
    petit_plus_fr: 'EXCLUSIVITÉ SOGNUDIMARE',
    petit_plus_en: 'SOGNUDIMARE EXCLUSIVE'
  },
  { 
    icon: 'account-group', 
    iconType: 'material',
    title_fr: 'ÉQUIPAGE', 
    title_en: 'CREW',
    desc_fr: 'Vous êtes accompagnés par une équipe professionnelle et passionnée, entièrement dédiée à votre confort et à votre sécurité tout au long de la croisière.',
    desc_en: 'You are accompanied by a professional and passionate team, entirely dedicated to your comfort and safety throughout the cruise.',
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
  
  // Hero carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
  }, []);
  
  // Hero carousel auto-animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change image
        setCurrentImageIndex((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Change every 4 seconds
    
    return () => clearInterval(interval);
  }, [fadeAnim]);

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
          <Image source={{ uri: LOGO_URL }} style={styles.headerLogo} resizeMode="contain" />
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
            <Ionicons name="globe-outline" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section with Animated Carousel */}
        <View style={styles.heroContainer}>
          <Animated.Image 
            source={{ uri: HERO_CAROUSEL_IMAGES[currentImageIndex] }} 
            style={[styles.heroImage, { opacity: fadeAnim }]} 
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/cruises')}>
              <Text style={styles.heroButtonText}>{t('discoverCruises')}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {/* Carousel Indicators */}
          <View style={styles.carouselIndicators}>
            {HERO_CAROUSEL_IMAGES.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.carouselDot, 
                  currentImageIndex === index && styles.carouselDotActive
                ]} 
              />
            ))}
          </View>
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

        {/* Nos Destinations Section - Vertical Layout */}
        <View style={styles.destinationsSection}>
          <Text style={styles.sectionTitle}>
            {t('ourDestinations')}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} />
          ) : (
            cruises.slice(0, 4).map((cruise) => (
              <TouchableOpacity
                key={cruise.id}
                style={styles.destinationCard}
                onPress={() => router.push(`/cruise/${cruise.id}`)}
              >
                <Image source={{ uri: cruise.image_url }} style={styles.destinationImage} />
                <View style={styles.destinationOverlay}>
                  <View>
                    <Text style={styles.destinationSubtitle}>
                      {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                    </Text>
                    <Text style={styles.destinationLabel}>
                      {language === 'fr' ? cruise.name_fr : cruise.name_en}
                    </Text>
                    <Text style={styles.destinationPrice}>
                      {t('from')} {cruise.pricing.cabin_price || cruise.pricing.private_price}€
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={32} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* CE QUI FAIT VRAIMENT NOTRE DIFFÉRENCE */}
        <View style={styles.differenceSection}>
          <View style={styles.differenceTitleContainer}>
            <View style={styles.differenceLine} />
            <Text style={styles.differenceMainTitle}>
              {language === 'fr' ? 'Ce qui fait vraiment' : 'What really makes'}
            </Text>
            <Text style={styles.differenceAccentTitle}>
              {language === 'fr' ? 'notre différence' : 'us different'}
            </Text>
            <View style={styles.differenceLine} />
          </View>
          <View style={styles.differenceGridNew}>
            {differenceItems.map((item, index) => (
              <View key={index} style={styles.differenceCardNew}>
                <View style={styles.differenceIconNew}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.white} />
                </View>
                <Text style={styles.differenceLabelNew}>
                  {language === 'fr' ? item.label_fr : item.label_en}
                </Text>
                <Text style={styles.differenceDescNew}>
                  {language === 'fr' ? item.desc_fr : item.desc_en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* All Inclusive Section - Elegant */}
        <View style={styles.allInclusiveSection}>
          <View style={styles.allInclusiveTitleContainer}>
            <View style={styles.allInclusiveLine} />
            <Text style={styles.allInclusiveMainTitle}>
              {language === 'fr' ? 'Des vacances' : 'All-inclusive'}
            </Text>
            <Text style={styles.allInclusiveAccentTitle}>
              {language === 'fr' ? 'tout inclus' : 'vacation'}
            </Text>
            <Text style={styles.allInclusiveTagline}>
              {language === 'fr' 
                ? 'Formule tout compris & respectueuse de l\'environnement' 
                : 'All-inclusive & eco-friendly formula'}
            </Text>
            <View style={styles.allInclusiveLine} />
          </View>
          
          <Text style={styles.petitPlusSectionTitle}>
            {language === 'fr' ? 'LES PETITS +++ DE SOGNUDIMARE' : 'SOGNUDIMARE EXTRAS'}
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inclusiveScrollNew}>
            {ALL_INCLUSIVE_FEATURES.map((feature, index) => (
              <View key={index} style={styles.inclusiveCardNew}>
                <View style={styles.inclusiveIconNew}>
                  {feature.iconType === 'material' ? (
                    <MaterialCommunityIcons name={feature.icon as any} size={28} color={COLORS.white} />
                  ) : (
                    <Ionicons name={feature.icon as any} size={28} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.inclusiveTitleNew}>
                  {language === 'fr' ? feature.title_fr : feature.title_en}
                </Text>
                <View style={styles.inclusiveBadgeNew}>
                  <Text style={styles.inclusiveBadgeTextNew}>INCLUS</Text>
                </View>
                <Text style={styles.inclusiveDescNew}>
                  {language === 'fr' ? feature.desc_fr : feature.desc_en}
                </Text>
                <View style={styles.petitPlusBoxNew}>
                  <Ionicons name="sparkles" size={14} color={COLORS.secondary} />
                  <Text style={styles.petitPlusTextNew}>
                    {language === 'fr' ? feature.petit_plus_fr : feature.petit_plus_en}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Local Partners Section - Elegant */}
        <View style={styles.partnersSection}>
          <View style={styles.partnersTitleContainer}>
            <View style={styles.partnersLine} />
            <Text style={styles.partnersMainTitle}>
              {language === 'fr' ? 'Une collaboration' : 'Responsible and'}
            </Text>
            <Text style={styles.partnersAccentTitle}>
              {language === 'fr' ? 'responsable et engagée' : 'committed collaboration'}
            </Text>
            <Text style={styles.partnersTagline}>
              {language === 'fr' 
                ? 'Nous travaillons uniquement avec des acteurs locaux' 
                : 'We work exclusively with local partners'}
            </Text>
            <View style={styles.partnersLine} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnersScrollNew}>
            {LOCAL_PARTNERS.map((partner, index) => (
              <View key={index} style={styles.partnerCardNew}>
                <View style={styles.partnerIconNew}>
                  <Ionicons name="storefront" size={24} color={COLORS.white} />
                </View>
                <Text style={styles.partnerNameNew}>{partner.name}</Text>
                <Text style={styles.partnerTypeNew}>{partner.type}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Club Section - Elegant with Card Image */}
        <View style={styles.clubSectionNew}>
          <View style={styles.clubTitleContainer}>
            <View style={styles.clubLine} />
            <Text style={styles.clubMainTitle}>
              {language === 'fr' ? 'Club des' : 'Travelers'}
            </Text>
            <Text style={styles.clubAccentTitle}>
              {language === 'fr' ? 'Voyageurs' : 'Club'}
            </Text>
            <View style={styles.clubLine} />
          </View>

          {/* Club Cards Image */}
          <View style={styles.clubImageContainer}>
            <Image 
              source={{ uri: 'https://customer-assets.emergentagent.com/job_sognudi-app/artifacts/nfk3yqi1_CARTE%20CLUB.avif' }}
              style={styles.clubCardsImageHome}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.clubDescriptionText}>
            {language === 'fr' 
              ? 'Rejoignez notre communauté de passionnés et profitez de réductions exclusives sur toutes vos croisières.'
              : 'Join our community of enthusiasts and enjoy exclusive discounts on all your cruises.'}
          </Text>

          {/* Pricing Pills */}
          <View style={styles.clubPricingRow}>
            <View style={styles.clubPricingPill}>
              <Text style={styles.clubPillDuration}>12 {language === 'fr' ? 'mois' : 'mo'}</Text>
              <Text style={styles.clubPillPrice}>90€</Text>
              <Text style={styles.clubPillDiscount}>-10%</Text>
            </View>
            <View style={[styles.clubPricingPill, styles.clubPricingPillHighlight]}>
              <Text style={styles.clubPillDurationHighlight}>24 {language === 'fr' ? 'mois' : 'mo'}</Text>
              <Text style={styles.clubPillPriceHighlight}>150€</Text>
              <Text style={styles.clubPillDiscountHighlight}>-15%</Text>
            </View>
            <View style={styles.clubPricingPill}>
              <Text style={styles.clubPillDuration}>36 {language === 'fr' ? 'mois' : 'mo'}</Text>
              <Text style={styles.clubPillPrice}>140€</Text>
              <Text style={styles.clubPillDiscount}>-20%</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clubButtonNew} onPress={() => router.push('/club')}>
            <Text style={styles.clubButtonTextNew}>{t('joinClub')}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Gallery - Elegant */}
        <View style={styles.gallerySection}>
          <View style={styles.galleryTitleContainer}>
            <View style={styles.galleryLine} />
            <Text style={styles.galleryMainTitle}>
              {language === 'fr' ? 'Destinations' : 'Authentic'}
            </Text>
            <Text style={styles.galleryAccentTitle}>
              {language === 'fr' ? 'authentiques' : 'Destinations'}
            </Text>
            <View style={styles.galleryLine} />
          </View>
          {/* 6 Portfolio photos with links */}
          {PORTFOLIO_PHOTOS.map((photo, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.galleryItemFull}
              onPress={() => {
                if (photo.link) {
                  router.push(photo.link as any);
                } else if (photo.cruiseName) {
                  const c = cruises.find(cr => cr.name_fr === photo.cruiseName);
                  if (c) router.push(`/cruise/${c.id}`);
                }
              }}
            >
              <Image source={{ uri: photo.url }} style={styles.galleryImage} />
              <View style={styles.galleryOverlay}>
                <View style={styles.galleryLabelRow}>
                  <Text style={styles.galleryLabel}>{language === 'fr' ? photo.label_fr : photo.label_en}</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Engagements Section - Elegant */}
        <View style={styles.engagementsSectionNew}>
          <View style={styles.engagementsTitleContainer}>
            <View style={styles.engagementsLine} />
            <View style={styles.engagementsIconRowNew}>
              <Ionicons name="leaf" size={32} color={COLORS.white} />
              <View style={styles.engagementsBadgeNew}>
                <Text style={styles.engagementsBadgeText}>1%</Text>
              </View>
              <Ionicons name="heart" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.engagementsMainTitle}>
              {language === 'fr' ? 'Nos engagements' : 'Our eco-responsible'}
            </Text>
            <Text style={styles.engagementsAccentTitle}>
              {language === 'fr' ? 'écoresponsables' : 'commitments'}
            </Text>
            <View style={styles.engagementsLine} />
          </View>
          <Text style={styles.engagementsTextNew}>
            {language === 'fr' 
              ? 'Tourisme durable, circuits courts, protection de la biodiversité marine... 1% de notre CA est reversé à des associations locales.' 
              : 'Sustainable tourism, short supply chains, marine biodiversity protection... 1% of our revenue is donated to local associations.'}
          </Text>
          <View style={styles.engagementsAssociationsNew}>
            <View style={styles.engagementAssocItemNew}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.engagementAssocNameNew}>Mare Vivu</Text>
            </View>
            <View style={styles.engagementAssocItemNew}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.engagementAssocNameNew}>La Girelle</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.engagementsButtonNew} onPress={() => router.push('/engagements')}>
            <Text style={styles.engagementsButtonTextNew}>
              {language === 'fr' ? 'Découvrir nos engagements' : 'Discover our commitments'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* About Section - Elegant */}
        <View style={styles.aboutSectionNew}>
          <View style={styles.aboutTitleContainer}>
            <View style={styles.aboutLine} />
            <Text style={styles.aboutMainTitle}>
              {language === 'fr' ? 'À propos de' : 'About'}
            </Text>
            <View style={styles.aboutLine} />
          </View>
          <Image source={{ uri: LOGO_FULL_URL }} style={styles.aboutLogoImage} resizeMode="contain" />
          <Text style={styles.aboutTextNew}>{t('aboutText')}</Text>
          <View style={styles.aboutHighlightBox}>
            <Ionicons name="trophy" size={28} color={COLORS.secondary} />
            <Text style={styles.aboutHighlightNew}>
              {language === 'fr' 
                ? 'En septembre 2025, la Corse a été labellisée GREEN DESTINATION, confirmant son rôle de référence méditerranéenne en matière de tourisme durable.' 
                : 'In September 2025, Corsica was labeled GREEN DESTINATION, confirming its role as a Mediterranean reference in sustainable tourism.'}
            </Text>
          </View>
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
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  headerLogo: {
    width: 180,
    height: 40,
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
  carouselIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: COLORS.secondary,
    width: 24,
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
    flex: 1,
    paddingHorizontal: 4,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
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
  // Engagements Section styles
  engagementsSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  engagementsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  engagementsBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: SPACING.md,
  },
  engagementsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  engagementsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  engagementsAssociations: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  engagementAssocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  engagementAssocName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  engagementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  engagementsButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  // Destinations Section - Vertical Layout
  destinationsSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  destinationCard: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  destinationSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  destinationPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
    marginTop: 4,
  },
  // Elegant Difference Section
  differenceSection: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  differenceTitleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  differenceLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  differenceMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '300',
    letterSpacing: 1,
  },
  differenceAccentTitle: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  differenceGridNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  differenceCardNew: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  differenceIconNew: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  differenceLabelNew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  differenceDescNew: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Elegant All Inclusive Section
  allInclusiveSection: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.xxl,
  },
  allInclusiveTitleContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  allInclusiveLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  allInclusiveMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '300',
    letterSpacing: 1,
  },
  allInclusiveAccentTitle: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  allInclusiveTagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  petitPlusSectionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  inclusiveScrollNew: {
    paddingHorizontal: SPACING.lg,
  },
  inclusiveCardNew: {
    width: 260,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inclusiveIconNew: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  inclusiveTitleNew: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  inclusiveBadgeNew: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  inclusiveBadgeTextNew: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  inclusiveDescNew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  petitPlusBoxNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(198, 165, 114, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  petitPlusTextNew: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '600',
    flex: 1,
  },
  // Partners Section Elegant
  partnersSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xxl,
  },
  partnersTitleContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  partnersLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  partnersMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '300',
    letterSpacing: 1,
  },
  partnersAccentTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  partnersTagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  partnersScrollNew: {
    paddingHorizontal: SPACING.lg,
  },
  partnerCardNew: {
    width: 140,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  partnerIconNew: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  partnerNameNew: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  partnerTypeNew: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  // Club Section Elegant
  clubSectionNew: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
  },
  clubTitleContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  clubLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  clubMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '300',
    letterSpacing: 1,
  },
  clubAccentTitle: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clubImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  clubCardsImageHome: {
    width: width - SPACING.lg * 2,
    height: 180,
    borderRadius: BORDER_RADIUS.xl,
  },
  clubDescriptionText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  clubPricingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  clubPricingPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  clubPricingPillHighlight: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  clubPillDuration: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  clubPillPrice: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  clubPillDiscount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  clubPillDurationHighlight: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.7,
  },
  clubPillPriceHighlight: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  clubPillDiscountHighlight: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  clubButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    gap: SPACING.sm,
  },
  clubButtonTextNew: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Gallery Section Elegant
  gallerySection: {
    backgroundColor: '#F5F0EB',
    paddingVertical: SPACING.xxl,
  },
  galleryTitleContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  galleryLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  galleryMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '300',
    letterSpacing: 1,
  },
  galleryAccentTitle: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  galleryItemFull: {
    height: 200,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,28,64,0.35)',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  galleryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  galleryScroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  galleryScrollItem: {
    width: 160,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  galleryScrollLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Engagements Section Elegant
  engagementsSectionNew: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  engagementsTitleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  engagementsLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  engagementsIconRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  engagementsBadgeNew: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  engagementsBadgeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  engagementsMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '300',
    letterSpacing: 1,
  },
  engagementsAccentTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  engagementsTextNew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  engagementsAssociationsNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  engagementAssocItemNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  engagementAssocNameNew: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  engagementsButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  engagementsButtonTextNew: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  // About Section Elegant
  aboutSectionNew: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  aboutTitleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  aboutLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  aboutMainTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '300',
    letterSpacing: 1,
  },
  aboutAccentTitle: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aboutLogoImage: {
    width: 280,
    height: 150,
    alignSelf: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  aboutTextNew: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  aboutHighlightBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  aboutHighlightNew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
});
