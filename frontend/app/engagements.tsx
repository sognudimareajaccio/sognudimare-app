import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';
const MARE_VIVU_LOGO = 'https://static.wixstatic.com/media/ce6ce7_82ab2dd1b68a43ec838aad612601c235~mv2.webp/v1/fill/w_147,h_132,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Logo-Mare-Vivu-2020.webp';
const MARE_VIVU_TEAM = 'https://static.wixstatic.com/media/ce6ce7_67ae3d42cac1407c8e714935e08bca5f~mv2.webp/v1/fill/w_300,h_200,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Photo-bateau-equipe.webp';
const LA_GIRELLE_IMG = 'https://static.wixstatic.com/media/ce6ce7_133e94dec1544324ac5e5758ebc51fc4~mv2.jpg/v1/fill/w_300,h_200,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Girelle_commune_coris_julis_male_D5555.jpg';

const ENGAGEMENTS = [
  {
    icon: 'time-outline',
    iconType: 'ionicons',
    title_fr: 'Prendre le temps',
    title_en: 'Taking time',
    desc_fr: 'Naviguer à la voile, c\'est adopter un rythme doux, guidé par la mer et le vent. Chaque étape est une invitation à savourer l\'instant, loin des itinéraires précipités et standardisés.',
    desc_en: 'Sailing is adopting a gentle rhythm, guided by the sea and wind. Each stage is an invitation to savor the moment, far from rushed and standardized itineraries.',
  },
  {
    icon: 'leaf-outline',
    iconType: 'ionicons',
    title_fr: 'Respect absolu de la nature',
    title_en: 'Absolute respect for nature',
    desc_fr: 'Aucun mouillage sur les herbiers de posidonie, véritables poumons de la Méditerranée. Navigation à la voile privilégiée, pour réduire l\'usage du moteur.',
    desc_en: 'No anchoring on posidonia seagrass beds, the true lungs of the Mediterranean. Sailing is preferred to reduce engine use.',
  },
  {
    icon: 'water-outline',
    iconType: 'ionicons',
    title_fr: 'Produits sanitaires écologiques',
    title_en: 'Eco-friendly sanitary products',
    desc_fr: 'Exclusivement des produits écologiques à bord, afin de préserver les écosystèmes marins.',
    desc_en: 'Only eco-friendly products on board to preserve marine ecosystems.',
  },
  {
    icon: 'trash-outline',
    iconType: 'ionicons',
    title_fr: 'Utilisation du vrac à bord',
    title_en: 'Bulk products on board',
    desc_fr: 'Une réduction de 80% des déchets grâce à l\'utilisation de produits en vrac.',
    desc_en: '80% waste reduction through the use of bulk products.',
  },
  {
    icon: 'nutrition-outline',
    iconType: 'ionicons',
    title_fr: 'Une alimentation saine',
    title_en: 'Healthy food',
    desc_fr: 'Une mise en avant des saveurs du terroir, en lien direct avec ceux qui les cultivent.',
    desc_en: 'Highlighting local flavors, in direct connection with those who grow them.',
  },
  {
    icon: 'restaurant-outline',
    iconType: 'ionicons',
    title_fr: 'Des menus équilibrés',
    title_en: 'Balanced menus',
    desc_fr: 'Validés avec les voyageurs avant le départ pour éviter tout gaspillage alimentaire.',
    desc_en: 'Validated with travelers before departure to avoid food waste.',
  },
  {
    icon: 'storefront-outline',
    iconType: 'ionicons',
    title_fr: 'Des circuits courts',
    title_en: 'Short supply chains',
    desc_fr: 'Pour l\'avitaillement : producteurs locaux, marchés, artisans et vignobles de la région.',
    desc_en: 'For provisioning: local producers, markets, artisans and regional vineyards.',
  },
  {
    icon: 'heart-outline',
    iconType: 'ionicons',
    title_fr: 'Authenticité & partage',
    title_en: 'Authenticity & sharing',
    desc_fr: 'Les escales privilégient les criques confidentielles, les villages côtiers et les rencontres vraies avec les habitants.',
    desc_en: 'Stopovers favor secluded coves, coastal villages and genuine encounters with locals.',
  },
];

export default function EngagementsScreen() {
  const { language } = useTranslation();
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
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
            {language === 'fr' ? 'Nos Engagements' : 'Our Commitments'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>
            {language === 'fr' ? 'Les engagements\nde sognudimare' : 'The commitments\nof sognudimare'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {language === 'fr' 
              ? 'Tourisme durable et responsable en Méditerranée' 
              : 'Sustainable and responsible tourism in the Mediterranean'}
          </Text>
        </View>

        {/* 1% Section */}
        <View style={styles.percentSection}>
          <View style={styles.percentBadge}>
            <Text style={styles.percentNumber}>1%</Text>
          </View>
          <Text style={styles.percentTitle}>
            {language === 'fr' 
              ? 'DE NOTRE CA REVERSÉ À DES ASSOCIATIONS LOCALES' 
              : 'OF OUR REVENUE DONATED TO LOCAL ASSOCIATIONS'}
          </Text>
          <Text style={styles.percentText}>
            {language === 'fr' 
              ? 'Parce que la mer est au cœur de notre passion et de notre activité, nous tenons à la protéger et à soutenir ceux qui agissent concrètement pour sa préservation.\n\nC\'est pourquoi 1% de notre chiffre d\'affaires est reversé à deux associations corses :'
              : 'Because the sea is at the heart of our passion and activity, we are committed to protecting it and supporting those who act concretely for its preservation.\n\nThat\'s why 1% of our revenue is donated to two Corsican associations:'}
          </Text>
          <View style={styles.associationsList}>
            <View style={styles.associationItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
              <Text style={styles.associationName}>Mare Vivu</Text>
            </View>
            <View style={styles.associationItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
              <Text style={styles.associationName}>La Girelle</Text>
            </View>
          </View>
          <Text style={styles.percentFooter}>
            {language === 'fr' 
              ? 'En choisissant Sognudimare, vous participez directement à ces initiatives et contribuez, vous aussi, à préserver la richesse et la beauté de notre Méditerranée.'
              : 'By choosing Sognudimare, you directly participate in these initiatives and contribute to preserving the richness and beauty of our Mediterranean.'}
          </Text>
        </View>

        {/* Nos Engagements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'NOS ENGAGEMENTS' : 'OUR COMMITMENTS'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {language === 'fr' 
              ? 'Nos croisières en catamaran sont pensées comme une alternative durable et responsable au tourisme de masse.'
              : 'Our catamaran cruises are designed as a sustainable and responsible alternative to mass tourism.'}
          </Text>
          
          <View style={styles.engagementsGrid}>
            {ENGAGEMENTS.map((item, index) => (
              <View key={index} style={styles.engagementCard}>
                <View style={styles.engagementIconContainer}>
                  <Ionicons name={item.icon as any} size={28} color={COLORS.accent} />
                </View>
                <Text style={styles.engagementTitle}>
                  {language === 'fr' ? item.title_fr : item.title_en}
                </Text>
                <Text style={styles.engagementDesc}>
                  {language === 'fr' ? item.desc_fr : item.desc_en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Équipage engagé */}
        <View style={styles.crewSection}>
          <MaterialCommunityIcons name="account-group" size={48} color={COLORS.secondary} />
          <Text style={styles.crewTitle}>
            {language === 'fr' ? 'Un équipage engagé' : 'A committed crew'}
          </Text>
          <Text style={styles.crewText}>
            {language === 'fr' 
              ? 'Convaincu de la nécessité de changer nos modes de voyage, l\'équipage soutient des associations environnementales locales, applique au quotidien les principes de sobriété, de circuits courts et de respect de la mer. Il partage sa passion pour une navigation plus douce et plus consciente.'
              : 'Convinced of the need to change our ways of traveling, the crew supports local environmental associations, applies the principles of sobriety, short supply chains and respect for the sea on a daily basis. They share their passion for gentler, more conscious sailing.'}
          </Text>
        </View>

        {/* Associations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'LES ASSOCIATIONS QUE NOUS SOUTENONS' : 'THE ASSOCIATIONS WE SUPPORT'}
          </Text>

          {/* Mare Vivu */}
          <View style={styles.associationCard}>
            <View style={styles.associationHeader}>
              <Image source={{ uri: MARE_VIVU_LOGO }} style={styles.associationLogo} resizeMode="contain" />
              <View style={styles.associationHeaderText}>
                <Text style={styles.associationCardTitle}>MARE VIVU</Text>
                <Text style={styles.associationTag}>
                  {language === 'fr' ? 'Pollution plastique' : 'Plastic pollution'}
                </Text>
              </View>
            </View>
            <Image source={{ uri: MARE_VIVU_TEAM }} style={styles.associationImage} resizeMode="cover" />
            <Text style={styles.associationDescription}>
              {language === 'fr' 
                ? 'L\'association Mare Vivu, fondée en 2016 par deux étudiants corses, est une organisation à but non lucratif basée à Pino, dans le Cap Corse. Elle se spécialise dans la lutte contre la pollution plastique en Méditerranée et œuvre pour la préservation de la biodiversité marine, la promotion du zéro déchet et la sensibilisation aux enjeux énergie-climat.'
                : 'The Mare Vivu association, founded in 2016 by two Corsican students, is a non-profit organization based in Pino, Cap Corse. It specializes in fighting plastic pollution in the Mediterranean and works to preserve marine biodiversity, promote zero waste and raise awareness about energy-climate issues.'}
            </Text>
            
            <Text style={styles.missionTitle}>
              {language === 'fr' ? 'Missions principales :' : 'Main missions:'}
            </Text>
            <View style={styles.missionList}>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Mission CorSeaCare : collecte de données scientifiques sur 1000 km de côtes' : 'CorSeaCare Mission: scientific data collection over 1000 km of coastline'}
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Recherche scientifique avec l\'Ifremer et le CNRS' : 'Scientific research with Ifremer and CNRS'}
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Sensibilisation et éducation environnementale' : 'Environmental awareness and education'}
                </Text>
              </View>
            </View>

            <View style={styles.rewardBadge}>
              <Ionicons name="trophy" size={20} color={COLORS.secondary} />
              <Text style={styles.rewardText}>
                {language === 'fr' 
                  ? 'Prix « Biodiversité » du Plan Climat 2018' 
                  : 'Climate Plan "Biodiversity" Award 2018'}
              </Text>
            </View>
          </View>

          {/* La Girelle */}
          <View style={styles.associationCard}>
            <View style={styles.associationHeader}>
              <View style={styles.girelleLogoPlaceholder}>
                <MaterialCommunityIcons name="fish" size={32} color={COLORS.accent} />
              </View>
              <View style={styles.associationHeaderText}>
                <Text style={styles.associationCardTitle}>LA GIRELLE</Text>
                <Text style={styles.associationTag}>
                  {language === 'fr' ? 'Préservation milieux marins' : 'Marine environment preservation'}
                </Text>
              </View>
            </View>
            <Image source={{ uri: LA_GIRELLE_IMG }} style={styles.associationImage} resizeMode="cover" />
            <Text style={styles.associationDescription}>
              {language === 'fr' 
                ? 'L\'association La Girelle est une organisation corse engagée dans la préservation des milieux marins méditerranéens. Fondée par trois jeunes corses, elle a pour objectif de sensibiliser le public aux enjeux écologiques de la Méditerranée, un écosystème riche mais fragile.'
                : 'The La Girelle association is a Corsican organization committed to preserving Mediterranean marine environments. Founded by three young Corsicans, its goal is to raise public awareness about the ecological issues of the Mediterranean, a rich but fragile ecosystem.'}
            </Text>
            
            <Text style={styles.missionTitle}>
              {language === 'fr' ? 'Domaines d\'action :' : 'Areas of action:'}
            </Text>
            <View style={styles.missionList}>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Recherche scientifique sur la biodiversité côtière' : 'Scientific research on coastal biodiversity'}
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Étude de la reproduction des seiches et faune marine' : 'Study of cuttlefish reproduction and marine fauna'}
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionBullet}>•</Text>
                <Text style={styles.missionText}>
                  {language === 'fr' ? 'Sensibilisation et vulgarisation scientifique' : 'Awareness and scientific outreach'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            {language === 'fr' 
              ? 'Voyagez autrement avec nous' 
              : 'Travel differently with us'}
          </Text>
          <Text style={styles.ctaText}>
            {language === 'fr' 
              ? 'Rejoignez-nous pour une expérience de voyage respectueuse de l\'environnement et des communautés locales.'
              : 'Join us for a travel experience that respects the environment and local communities.'}
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/cruises')}>
            <Text style={styles.ctaButtonText}>
              {language === 'fr' ? 'Découvrir nos croisières' : 'Discover our cruises'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
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
  },
  percentSection: {
    backgroundColor: COLORS.accent,
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  percentBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  percentNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  percentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  percentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  associationsList: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  associationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  associationName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  percentFooter: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  engagementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  engagementCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  engagementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  engagementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  engagementDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  crewSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  crewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  crewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  associationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  associationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  associationLogo: {
    width: 60,
    height: 60,
  },
  girelleLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  associationHeaderText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  associationCardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  associationTag: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  associationImage: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  associationDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  missionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  missionList: {
    marginBottom: SPACING.md,
  },
  missionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  missionBullet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    marginRight: SPACING.sm,
    fontWeight: '700',
  },
  missionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  rewardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  ctaSection: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ctaText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
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
});
