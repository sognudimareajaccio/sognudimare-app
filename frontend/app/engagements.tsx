import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const MARE_VIVU_LOGO = 'https://static.wixstatic.com/media/ce6ce7_82ab2dd1b68a43ec838aad612601c235~mv2.webp/v1/fill/w_147,h_132,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Logo-Mare-Vivu-2020.webp';
const MARE_VIVU_TEAM = 'https://static.wixstatic.com/media/ce6ce7_67ae3d42cac1407c8e714935e08bca5f~mv2.webp/v1/fill/w_300,h_200,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Photo-bateau-equipe.webp';
const LA_GIRELLE_IMG = 'https://static.wixstatic.com/media/ce6ce7_133e94dec1544324ac5e5758ebc51fc4~mv2.jpg/v1/fill/w_300,h_200,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Girelle_commune_coris_julis_male_D5555.jpg';

const ENGAGEMENTS = [
  {
    icon: 'time-outline',
    title_fr: 'Prendre le temps',
    title_en: 'Taking time',
    desc_fr: 'Naviguer a la voile, c\'est adopter un rythme doux, guide par la mer et le vent. Chaque etape est une invitation a savourer l\'instant.',
    desc_en: 'Sailing is adopting a gentle rhythm, guided by the sea and wind. Each stage is an invitation to savor the moment.',
  },
  {
    icon: 'leaf-outline',
    title_fr: 'Respect de la nature',
    title_en: 'Respect for nature',
    desc_fr: 'Aucun mouillage sur les herbiers de posidonie. Navigation a la voile privilegiee pour reduire l\'usage du moteur.',
    desc_en: 'No anchoring on posidonia seagrass beds. Sailing is preferred to reduce engine use.',
  },
  {
    icon: 'water-outline',
    title_fr: 'Produits ecologiques',
    title_en: 'Eco-friendly products',
    desc_fr: 'Exclusivement des produits ecologiques a bord, afin de preserver les ecosystemes marins.',
    desc_en: 'Only eco-friendly products on board to preserve marine ecosystems.',
  },
  {
    icon: 'trash-outline',
    title_fr: 'Utilisation du vrac',
    title_en: 'Bulk products',
    desc_fr: 'Une reduction de 80% des dechets grace a l\'utilisation de produits en vrac.',
    desc_en: '80% waste reduction through the use of bulk products.',
  },
  {
    icon: 'nutrition-outline',
    title_fr: 'Alimentation saine',
    title_en: 'Healthy food',
    desc_fr: 'Une mise en avant des saveurs du terroir, en lien direct avec ceux qui les cultivent.',
    desc_en: 'Highlighting local flavors, in direct connection with those who grow them.',
  },
  {
    icon: 'restaurant-outline',
    title_fr: 'Menus equilibres',
    title_en: 'Balanced menus',
    desc_fr: 'Valides avec les voyageurs avant le depart pour eviter tout gaspillage alimentaire.',
    desc_en: 'Validated with travelers before departure to avoid food waste.',
  },
  {
    icon: 'storefront-outline',
    title_fr: 'Circuits courts',
    title_en: 'Short supply chains',
    desc_fr: 'Producteurs locaux, marches, artisans et vignobles de la region.',
    desc_en: 'Local producers, markets, artisans and regional vineyards.',
  },
  {
    icon: 'heart-outline',
    title_fr: 'Authenticite & partage',
    title_en: 'Authenticity & sharing',
    desc_fr: 'Les escales privilegient les criques confidentielles, les villages cotiers et les rencontres vraies.',
    desc_en: 'Stopovers favor secluded coves, coastal villages and genuine encounters.',
  },
];

export default function EngagementsScreen() {
  const { language } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{language === 'fr' ? 'Nos Engagements' : 'Our Commitments'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={s.hero}>
          <View style={s.heroLine} />
          <View style={s.heroIconRow}>
            <Ionicons name="leaf" size={28} color={COLORS.white} />
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>1%</Text>
            </View>
            <Ionicons name="heart" size={28} color={COLORS.white} />
          </View>
          <Text style={s.heroLabel}>{language === 'fr' ? 'Les engagements' : 'The commitments'}</Text>
          <Text style={s.heroAccent}>Sognudimare</Text>
          <Text style={s.heroSub}>
            {language === 'fr'
              ? 'Tourisme durable et responsable\nen Mediterranee'
              : 'Sustainable and responsible tourism\nin the Mediterranean'}
          </Text>
          <View style={s.heroLine} />
        </View>

        {/* 1% Donation Section */}
        <View style={s.donationSection}>
          <View style={s.donationCard}>
            <View style={s.donationCircle}>
              <Text style={s.donationPercent}>1%</Text>
              <Text style={s.donationPercentSub}>{language === 'fr' ? 'de notre CA' : 'of revenue'}</Text>
            </View>
            <Text style={s.donationTitle}>
              {language === 'fr'
                ? 'Reverse a des associations locales'
                : 'Donated to local associations'}
            </Text>
            <Text style={s.donationText}>
              {language === 'fr'
                ? 'Parce que la mer est au coeur de notre passion et de notre activite, nous tenons a la proteger et a soutenir ceux qui agissent concretement pour sa preservation.'
                : 'Because the sea is at the heart of our passion and activity, we are committed to protecting it and supporting those who act concretely for its preservation.'}
            </Text>
            <View style={s.donationAssociations}>
              <View style={s.donationAssocPill}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <Text style={s.donationAssocName}>Mare Vivu</Text>
              </View>
              <View style={s.donationAssocPill}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <Text style={s.donationAssocName}>La Girelle</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Engagements List */}
        <View style={s.engSection}>
          <View style={s.engTitleWrap}>
            <View style={s.engLine} />
            <Text style={s.engLabel}>{language === 'fr' ? 'Nos' : 'Our'}</Text>
            <Text style={s.engAccent}>{language === 'fr' ? 'engagements' : 'commitments'}</Text>
            <View style={s.engLine} />
          </View>
          <Text style={s.engSub}>
            {language === 'fr'
              ? 'Des croisieres pensees comme une alternative durable au tourisme de masse.'
              : 'Cruises designed as a sustainable alternative to mass tourism.'}
          </Text>

          {ENGAGEMENTS.map((item, index) => (
            <View key={index} style={s.engCard}>
              <View style={s.engCardLeft}>
                <View style={s.engIconWrap}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.white} />
                </View>
                <View style={s.engNumWrap}>
                  <Text style={s.engNum}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
              </View>
              <View style={s.engCardRight}>
                <Text style={s.engCardTitle}>{language === 'fr' ? item.title_fr : item.title_en}</Text>
                <Text style={s.engCardDesc}>{language === 'fr' ? item.desc_fr : item.desc_en}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Committed Crew */}
        <View style={s.crewSection}>
          <MaterialCommunityIcons name="account-group" size={40} color={COLORS.secondary} />
          <Text style={s.crewTitle}>
            {language === 'fr' ? 'Un equipage engage' : 'A committed crew'}
          </Text>
          <Text style={s.crewText}>
            {language === 'fr'
              ? 'Convaincu de la necessite de changer nos modes de voyage, l\'equipage soutient des associations environnementales locales, applique au quotidien les principes de sobriete, de circuits courts et de respect de la mer.'
              : 'Convinced of the need to change our ways of traveling, the crew supports local environmental associations, applies the principles of sobriety, short supply chains and respect for the sea on a daily basis.'}
          </Text>
        </View>

        {/* Associations */}
        <View style={s.assocSection}>
          <View style={s.assocTitleWrap}>
            <View style={s.assocLine} />
            <Text style={s.assocLabel}>{language === 'fr' ? 'Les associations' : 'The associations'}</Text>
            <Text style={s.assocAccent}>{language === 'fr' ? 'que nous soutenons' : 'we support'}</Text>
            <View style={s.assocLine} />
          </View>

          {/* Mare Vivu */}
          <View style={s.assocCard}>
            <View style={s.assocCardHeader}>
              <Image source={{ uri: MARE_VIVU_LOGO }} style={s.assocLogo} resizeMode="contain" />
              <View style={s.assocCardHeaderText}>
                <Text style={s.assocCardName}>MARE VIVU</Text>
                <View style={s.assocTagPill}>
                  <Text style={s.assocTagText}>{language === 'fr' ? 'Pollution plastique' : 'Plastic pollution'}</Text>
                </View>
              </View>
            </View>
            <Image source={{ uri: MARE_VIVU_TEAM }} style={s.assocImage} resizeMode="cover" />
            <Text style={s.assocDesc}>
              {language === 'fr'
                ? 'Fondee en 2016 par deux etudiants corses, Mare Vivu est une association basee a Pino, dans le Cap Corse. Elle se specialise dans la lutte contre la pollution plastique en Mediterranee et oeuvre pour la preservation de la biodiversite marine.'
                : 'Founded in 2016 by two Corsican students, Mare Vivu is an association based in Pino, Cap Corse. It specializes in fighting plastic pollution in the Mediterranean and works to preserve marine biodiversity.'}
            </Text>
            <View style={s.missionList}>
              {[
                language === 'fr' ? 'Mission CorSeaCare : collecte de donnees scientifiques sur 1000 km de cotes' : 'CorSeaCare Mission: scientific data collection over 1000 km of coastline',
                language === 'fr' ? 'Recherche scientifique avec l\'Ifremer et le CNRS' : 'Scientific research with Ifremer and CNRS',
                language === 'fr' ? 'Sensibilisation et education environnementale' : 'Environmental awareness and education',
              ].map((m, i) => (
                <View key={i} style={s.missionItem}>
                  <Ionicons name="chevron-forward-circle" size={16} color={COLORS.secondary} />
                  <Text style={s.missionText}>{m}</Text>
                </View>
              ))}
            </View>
            <View style={s.rewardBadge}>
              <Ionicons name="trophy" size={18} color={COLORS.secondary} />
              <Text style={s.rewardText}>
                {language === 'fr' ? 'Prix "Biodiversite" du Plan Climat 2018' : 'Climate Plan "Biodiversity" Award 2018'}
              </Text>
            </View>
          </View>

          {/* La Girelle */}
          <View style={s.assocCard}>
            <View style={s.assocCardHeader}>
              <View style={s.assocIconPlaceholder}>
                <MaterialCommunityIcons name="fish" size={28} color={COLORS.accent} />
              </View>
              <View style={s.assocCardHeaderText}>
                <Text style={s.assocCardName}>LA GIRELLE</Text>
                <View style={s.assocTagPill}>
                  <Text style={s.assocTagText}>{language === 'fr' ? 'Milieux marins' : 'Marine environments'}</Text>
                </View>
              </View>
            </View>
            <Image source={{ uri: LA_GIRELLE_IMG }} style={s.assocImage} resizeMode="cover" />
            <Text style={s.assocDesc}>
              {language === 'fr'
                ? 'L\'association La Girelle est une organisation corse engagee dans la preservation des milieux marins mediterraneens. Fondee par trois jeunes corses, elle sensibilise le public aux enjeux ecologiques de la Mediterranee.'
                : 'La Girelle is a Corsican organization committed to preserving Mediterranean marine environments. Founded by three young Corsicans, it raises public awareness about ecological issues.'}
            </Text>
            <View style={s.missionList}>
              {[
                language === 'fr' ? 'Recherche scientifique sur la biodiversite cotiere' : 'Scientific research on coastal biodiversity',
                language === 'fr' ? 'Etude de la reproduction des seiches et faune marine' : 'Study of cuttlefish reproduction and marine fauna',
                language === 'fr' ? 'Sensibilisation et vulgarisation scientifique' : 'Awareness and scientific outreach',
              ].map((m, i) => (
                <View key={i} style={s.missionItem}>
                  <Ionicons name="chevron-forward-circle" size={16} color={COLORS.secondary} />
                  <Text style={s.missionText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quote / Footer message */}
        <View style={s.quoteSection}>
          <Ionicons name="earth" size={36} color={COLORS.secondary} />
          <Text style={s.quoteText}>
            {language === 'fr'
              ? '"En choisissant Sognudimare, vous participez directement a ces initiatives et contribuez a preserver la richesse et la beaute de notre Mediterranee."'
              : '"By choosing Sognudimare, you directly participate in these initiatives and contribute to preserving the richness and beauty of our Mediterranean."'}
          </Text>
        </View>

        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>
            {language === 'fr' ? 'Voyagez autrement' : 'Travel differently'}
          </Text>
          <Text style={s.ctaSub}>
            {language === 'fr'
              ? 'Rejoignez-nous pour une experience respectueuse de l\'environnement'
              : 'Join us for an eco-friendly travel experience'}
          </Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/cruises')}>
            <Text style={s.ctaBtnText}>{language === 'fr' ? 'Decouvrir nos croisieres' : 'Discover our cruises'}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center', flex: 1 },

  // Hero
  hero: { backgroundColor: COLORS.primary, alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg },
  heroLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  heroIconRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  heroBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md },
  heroBadgeText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  heroLabel: { fontSize: 16, color: COLORS.white, fontWeight: '300', letterSpacing: 1 },
  heroAccent: { fontSize: 28, color: COLORS.secondary, fontWeight: '700' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },

  // Donation
  donationSection: { paddingHorizontal: SPACING.md, marginTop: -SPACING.lg },
  donationCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.xl, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6, borderWidth: 1, borderColor: 'rgba(235,208,169,0.3)' },
  donationCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  donationPercent: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
  donationPercentSub: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  donationTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.md },
  donationText: { fontSize: 13, color: '#6B6560', textAlign: 'center', lineHeight: 21 },
  donationAssociations: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  donationAssocPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.full, gap: SPACING.xs },
  donationAssocName: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Engagements List
  engSection: { paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.md },
  engTitleWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  engLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  engLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  engAccent: { fontSize: 24, color: COLORS.secondary, fontWeight: '700' },
  engSub: { fontSize: 13, color: '#8A8478', textAlign: 'center', marginBottom: SPACING.lg },

  engCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  engCardLeft: { alignItems: 'center', marginRight: SPACING.md, width: 50 },
  engIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  engNumWrap: { marginTop: 6 },
  engNum: { fontSize: 10, color: COLORS.secondary, fontWeight: '800', letterSpacing: 1 },
  engCardRight: { flex: 1, justifyContent: 'center' },
  engCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  engCardDesc: { fontSize: 12, color: '#8A8478', lineHeight: 18 },

  // Crew
  crewSection: { backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, borderRadius: 16, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  crewTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginTop: SPACING.md, marginBottom: SPACING.sm },
  crewText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 21 },

  // Associations
  assocSection: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  assocTitleWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  assocLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  assocLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  assocAccent: { fontSize: 20, color: COLORS.secondary, fontWeight: '700' },

  assocCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
  assocCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  assocLogo: { width: 56, height: 56 },
  assocIconPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center' },
  assocCardHeaderText: { marginLeft: SPACING.md, flex: 1 },
  assocCardName: { fontSize: 16, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  assocTagPill: { backgroundColor: 'rgba(122,210,212,0.15)', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start', marginTop: 4 },
  assocTagText: { fontSize: 10, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  assocImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: SPACING.md },
  assocDesc: { fontSize: 13, color: '#6B6560', lineHeight: 21, marginBottom: SPACING.md },

  missionList: { marginBottom: SPACING.md },
  missionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: SPACING.sm },
  missionText: { flex: 1, fontSize: 13, color: '#6B6560', lineHeight: 18 },

  rewardBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start', gap: SPACING.xs },
  rewardText: { fontSize: 11, color: COLORS.secondary, fontWeight: '700' },

  // Quote
  quoteSection: { backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, borderRadius: 16, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  quoteText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, marginTop: SPACING.md, fontStyle: 'italic' },

  // CTA
  cta: { alignItems: 'center', backgroundColor: '#F0EDE8', marginHorizontal: SPACING.md, borderRadius: 16, padding: SPACING.xl, borderWidth: 2, borderColor: COLORS.secondary },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
  ctaSub: { fontSize: 13, color: '#8A8478', textAlign: 'center', marginBottom: SPACING.lg },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: BORDER_RADIUS.full, gap: SPACING.sm },
  ctaBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
