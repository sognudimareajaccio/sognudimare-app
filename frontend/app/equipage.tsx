import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';
const HERO_IMAGE = 'https://static.wixstatic.com/media/ce6ce7_d3c8b38dfdc743bc89066b39e578933a~mv2.jpg/v1/fill/w_1200,h_600,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_d3c8b38dfdc743bc89066b39e578933a~mv2.jpg';

// Crew members
const CREW_MEMBERS = [
  {
    id: 'maud',
    name: 'MAUD',
    role_fr: 'Hôtesse Cook',
    role_en: 'Hostess Cook',
    image: 'https://static.wixstatic.com/media/ce6ce7_da78cc5130c64fa1889b63056a67cb22~mv2.jpg/v1/fill/w_300,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/maud_JPG.jpg',
    description_fr: 'Une véritable passionnée de cuisine qui sait transformer chaque repas en un moment de partage et de convivialité. Avec son expertise et sa créativité, elle élabore des plats savoureux qui allient tradition et innovation, tout en mettant un point d\'honneur à utiliser des produits frais et locaux.',
    description_en: 'A true cooking enthusiast who knows how to transform each meal into a moment of sharing and conviviality. With her expertise and creativity, she creates tasty dishes that combine tradition and innovation, while making it a point of honor to use fresh and local products.',
    icon: 'restaurant',
  },
  {
    id: 'nicolas',
    name: 'NICOLAS',
    role_fr: 'Capitaine',
    role_en: 'Captain',
    image: 'https://static.wixstatic.com/media/ce6ce7_8d08896c9d1c425da15727a17a90f1fc~mv2.jpg/v1/crop/x_399,y_148,w_714,h_905/fill/w_300,h_380,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/capitaine%20sognudimare.jpg',
    description_fr: 'Un professionnel expérimenté et breveté qui veille sur la sécurité et le confort de tous à bord. Passionné par la mer, il connaît chaque recoin des côtes et navigue avec une grande maîtrise, offrant à ses passagers une expérience de navigation sereine et agréable.',
    description_en: 'An experienced and licensed professional who watches over the safety and comfort of everyone on board. Passionate about the sea, he knows every corner of the coasts and navigates with great mastery, offering his passengers a serene and pleasant sailing experience.',
    icon: 'compass',
  },
  {
    id: 'delfino',
    name: 'DELFINO',
    role_fr: 'Compagnon de route',
    role_en: 'Travel companion',
    image: 'https://static.wixstatic.com/media/32231ed08c5042aca4ba7593632e9726.jpg/v1/fill/w_300,h_220,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/dauphins%20mer-marine%20intelligent.jpg',
    description_fr: 'Un visiteur spécial qui choisit parfois de se joindre à nous lors de nos navigations. Sa présence joyeuse et gracieuse apporte une touche magique à chaque sortie en mer, créant des moments de pure émerveillement pour l\'équipage et les voyageurs.',
    description_en: 'A special visitor who sometimes chooses to join us during our navigations. His joyful and graceful presence adds a magical touch to each sea outing, creating moments of pure wonder for the crew and travelers.',
    icon: 'fish',
  },
];

// Values/Services
const VALUES = [
  {
    icon: 'shield-checkmark',
    title_fr: 'Sérénité totale',
    title_en: 'Total serenity',
    desc_fr: 'À bord de votre catamaran, tout est pensé pour votre confort et votre sécurité. Capitaine professionnel expérimenté, Nicolas gère la navigation, les manœuvres et l\'ensemble des opérations maritimes avec rigueur et précision.',
    desc_en: 'On board your catamaran, everything is designed for your comfort and safety. An experienced professional captain, Nicolas manages navigation, maneuvers and all maritime operations with rigor and precision.',
  },
  {
    icon: 'heart',
    title_fr: 'Confort et service',
    title_en: 'Comfort and service',
    desc_fr: 'Le capitaine veille à votre confort et à la sécurité de chaque navigation, tandis que votre hôtesse-cook Maud vous régale de plats savoureux élaborés avec des produits frais et locaux.',
    desc_en: 'The captain ensures your comfort and the safety of each navigation, while your hostess-cook Maud delights you with tasty dishes made with fresh and local products.',
  },
  {
    icon: 'sparkles',
    title_fr: 'Expérience sur mesure',
    title_en: 'Tailor-made experience',
    desc_fr: 'Chaque croisière devient une expérience sur mesure. Votre capitaine et votre hôtesse-cuisinière vous emmènent vers des criques secrètes, des villages pittoresques et des eaux cristallines.',
    desc_en: 'Each cruise becomes a tailor-made experience. Your captain and hostess-cook take you to secret coves, picturesque villages and crystal clear waters.',
  },
];

export default function EquipageScreen() {
  const { language } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'fr' ? 'L\'Équipage' : 'The Crew'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section with Image */}
        <View style={styles.heroSection}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heroTitle}>
              {language === 'fr' ? 'Votre Équipage' : 'Your Crew'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'fr' 
                ? 'Et si vous passiez du rêve à la réalité...' 
                : 'What if you went from dream to reality...'}
            </Text>
          </View>
        </View>

        {/* Story Section */}
        <View style={styles.storySection}>
          <MaterialCommunityIcons name="sail-boat" size={40} color={COLORS.accent} />
          <Text style={styles.storyTitle}>Sognu di Mare</Text>
          <Text style={styles.storyQuote}>
            {language === 'fr' ? '"Rêve de mer"' : '"Dream of the sea"'}
          </Text>
          <Text style={styles.storyText}>
            {language === 'fr' 
              ? 'Le nom "Sognu di Mare" évoque l\'essence même de notre passion. En corse, Sognu di Mare signifie "rêve de mer", une expression qui résonne comme un appel au voyage, à la détente et à la découverte.\n\nC\'est dans cet esprit que Nicolas a donné naissance à sa structure, avec pour ambition de partager sa passion pour la mer et de faire découvrir les trésors cachés de la Corse, de la Sardaigne et de toute la Méditerranée.'
              : 'The name "Sognu di Mare" evokes the very essence of our passion. In Corsican, Sognu di Mare means "dream of the sea", an expression that resonates like a call to travel, relaxation and discovery.\n\nIt is in this spirit that Nicolas created his company, with the ambition to share his passion for the sea and to reveal the hidden treasures of Corsica, Sardinia and the entire Mediterranean.'}
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'SÉCURITÉ ET SERVICE PERSONNALISÉ' : 'SAFETY AND PERSONALIZED SERVICE'}
          </Text>
          
          {VALUES.map((value, index) => (
            <View key={index} style={styles.valueCard}>
              <View style={styles.valueIconContainer}>
                <Ionicons name={value.icon as any} size={28} color={COLORS.white} />
              </View>
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>
                  {language === 'fr' ? value.title_fr : value.title_en}
                </Text>
                <Text style={styles.valueDesc}>
                  {language === 'fr' ? value.desc_fr : value.desc_en}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Crew Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'fr' ? 'LES MEMBRES D\'ÉQUIPAGE' : 'CREW MEMBERS'}
          </Text>
          
          {CREW_MEMBERS.map((member, index) => (
            <View key={member.id} style={styles.memberCard}>
              <Image source={{ uri: member.image }} style={styles.memberImage} />
              <View style={styles.memberBadge}>
                <Ionicons name={member.icon as any} size={20} color={COLORS.white} />
              </View>
              <View style={styles.memberContent}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>
                  {language === 'fr' ? member.role_fr : member.role_en}
                </Text>
                <Text style={styles.memberDesc}>
                  {language === 'fr' ? member.description_fr : member.description_en}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Slow Tourism Section */}
        <View style={styles.slowSection}>
          <Ionicons name="leaf" size={40} color={COLORS.secondary} />
          <Text style={styles.slowTitle}>Slow Tourisme</Text>
          <Text style={styles.slowText}>
            {language === 'fr' 
              ? 'Ici, le voyage se vit autrement : le slow tourisme guide chacune de nos sorties, pour prendre le temps d\'admirer les paysages, de savourer chaque escale, de se reconnecter à la nature et aux cultures locales. À bord, on ralentit le rythme, on respire, on explore en douceur… et on transforme chaque journée en une véritable expérience immersive et authentique.'
              : 'Here, travel is experienced differently: slow tourism guides each of our outings, taking time to admire the landscapes, savor each stopover, reconnect with nature and local cultures. On board, we slow down the pace, breathe, explore gently... and transform each day into a truly immersive and authentic experience.'}
          </Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            {language === 'fr' ? 'Prêt à embarquer avec nous ?' : 'Ready to board with us?'}
          </Text>
          <Text style={styles.ctaText}>
            {language === 'fr' 
              ? 'Découvrez nos croisières en Corse, Sardaigne et Méditerranée.'
              : 'Discover our cruises in Corsica, Sardinia and the Mediterranean.'}
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/cruises')}>
            <Text style={styles.ctaButtonText}>
              {language === 'fr' ? 'Voir les croisières' : 'View cruises'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/contact')}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
            <Text style={styles.contactButtonText}>
              {language === 'fr' ? 'Contacter l\'équipage' : 'Contact the crew'}
            </Text>
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
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,51,102,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  storySection: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  storyQuote: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  storyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  valuesSection: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  valueCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  valueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  valueDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    padding: SPACING.lg,
  },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberImage: {
    width: '100%',
    height: 220,
  },
  memberBadge: {
    position: 'absolute',
    top: 200,
    right: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  memberContent: {
    padding: SPACING.lg,
  },
  memberName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  memberRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  memberDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  slowSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  slowTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  slowText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  ctaSection: {
    padding: SPACING.xl,
    alignItems: 'center',
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
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  ctaButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});
