import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const HERO_IMAGE = 'https://static.wixstatic.com/media/ce6ce7_d3c8b38dfdc743bc89066b39e578933a~mv2.jpg/v1/fill/w_1200,h_600,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ce6ce7_d3c8b38dfdc743bc89066b39e578933a~mv2.jpg';

const CREW_MEMBERS = [
  {
    id: 'maud', name: 'MAUD',
    role_fr: 'Hotesse Cook', role_en: 'Hostess Cook',
    image: 'https://static.wixstatic.com/media/ce6ce7_da78cc5130c64fa1889b63056a67cb22~mv2.jpg/v1/fill/w_300,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/maud_JPG.jpg',
    description_fr: 'Une veritable passionnee de cuisine qui sait transformer chaque repas en un moment de partage et de convivialite. Avec son expertise et sa creativite, elle elabore des plats savoureux qui allient tradition et innovation, tout en mettant un point d\'honneur a utiliser des produits frais et locaux.',
    description_en: 'A true cooking enthusiast who knows how to transform each meal into a moment of sharing and conviviality. With her expertise and creativity, she creates tasty dishes that combine tradition and innovation, while making it a point of honor to use fresh and local products.',
    icon: 'restaurant',
  },
  {
    id: 'nicolas', name: 'NICOLAS',
    role_fr: 'Capitaine', role_en: 'Captain',
    image: 'https://static.wixstatic.com/media/ce6ce7_8d08896c9d1c425da15727a17a90f1fc~mv2.jpg/v1/crop/x_399,y_148,w_714,h_905/fill/w_300,h_380,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/capitaine%20sognudimare.jpg',
    description_fr: 'Un professionnel experimente et brevete qui veille sur la securite et le confort de tous a bord. Passionne par la mer, il connait chaque recoin des cotes et navigue avec une grande maitrise, offrant a ses passagers une experience de navigation sereine et agreable.',
    description_en: 'An experienced and licensed professional who watches over the safety and comfort of everyone on board. Passionate about the sea, he knows every corner of the coasts and navigates with great mastery, offering his passengers a serene and pleasant sailing experience.',
    icon: 'compass',
  },
  {
    id: 'delfino', name: 'DELFINO',
    role_fr: 'Compagnon de route', role_en: 'Travel companion',
    image: 'https://static.wixstatic.com/media/32231ed08c5042aca4ba7593632e9726.jpg/v1/fill/w_300,h_220,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/dauphins%20mer-marine%20intelligent.jpg',
    description_fr: 'Un visiteur special qui choisit parfois de se joindre a nous lors de nos navigations. Sa presence joyeuse et gracieuse apporte une touche magique a chaque sortie en mer.',
    description_en: 'A special visitor who sometimes chooses to join us during our navigations. His joyful and graceful presence adds a magical touch to each sea outing.',
    icon: 'fish',
  },
];

const VALUES = [
  { icon: 'shield-checkmark', title_fr: 'Serenite totale', title_en: 'Total serenity',
    desc_fr: 'A bord de votre catamaran, tout est pense pour votre confort et votre securite. Capitaine professionnel experimente, Nicolas gere la navigation, les manoeuvres et l\'ensemble des operations maritimes avec rigueur et precision.',
    desc_en: 'On board your catamaran, everything is designed for your comfort and safety. An experienced professional captain, Nicolas manages navigation, maneuvers and all maritime operations with rigor and precision.' },
  { icon: 'heart', title_fr: 'Confort et service', title_en: 'Comfort and service',
    desc_fr: 'Le capitaine veille a votre confort et a la securite de chaque navigation, tandis que votre hotesse-cook Maud vous regale de plats savoureux elabores avec des produits frais et locaux.',
    desc_en: 'The captain ensures your comfort and the safety of each navigation, while your hostess-cook Maud delights you with tasty dishes made with fresh and local products.' },
  { icon: 'sparkles', title_fr: 'Experience sur mesure', title_en: 'Tailor-made experience',
    desc_fr: 'Chaque croisiere devient une experience sur mesure. Votre capitaine et votre hotesse-cuisiniere vous emmenent vers des criques secretes, des villages pittoresques et des eaux cristallines.',
    desc_en: 'Each cruise becomes a tailor-made experience. Your captain and hostess-cook take you to secret coves, picturesque villages and crystal clear waters.' },
];

export default function EquipageScreen() {
  const { language } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{language === 'fr' ? "L'Equipage" : 'The Crew'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image source={{ uri: HERO_IMAGE }} style={s.heroImg} />
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>{language === 'fr' ? 'Votre Equipage' : 'Your Crew'}</Text>
            <Text style={s.heroSub}>
              {language === 'fr' ? 'Et si vous passiez du reve a la realite...' : 'What if you went from dream to reality...'}
            </Text>
          </View>
        </View>

        {/* Story */}
        <View style={s.storySection}>
          <View style={s.storyLine} />
          <Text style={s.storyLabel}>Sognu di Mare</Text>
          <Text style={s.storyQuote}>{language === 'fr' ? '"Reve de mer"' : '"Dream of the sea"'}</Text>
          <View style={s.storyLine} />
          <Text style={s.storyText}>
            {language === 'fr'
              ? 'Le nom "Sognu di Mare" evoque l\'essence meme de notre passion. En corse, Sognu di Mare signifie "reve de mer", une expression qui resonne comme un appel au voyage, a la detente et a la decouverte.\n\nC\'est dans cet esprit que Nicolas a donne naissance a sa structure, avec pour ambition de partager sa passion pour la mer et de faire decouvrir les tresors caches de la Corse, de la Sardaigne et de toute la Mediterranee.'
              : 'The name "Sognu di Mare" evokes the very essence of our passion. In Corsican, Sognu di Mare means "dream of the sea", an expression that resonates like a call to travel, relaxation and discovery.\n\nIt is in this spirit that Nicolas created his company, with the ambition to share his passion for the sea and to reveal the hidden treasures of Corsica, Sardinia and the entire Mediterranean.'}
          </Text>
        </View>

        {/* Crew Members */}
        <View style={s.membersSection}>
          <View style={s.sectionHeader}>
            <View style={s.sectionLine} />
            <Text style={s.sectionLabel}>{language === 'fr' ? 'Les Membres' : 'Crew'}</Text>
            <Text style={s.sectionAccent}>{language === 'fr' ? "d'Equipage" : 'Members'}</Text>
            <View style={s.sectionLine} />
          </View>

          {CREW_MEMBERS.map((member) => (
            <View key={member.id} style={s.memberCard}>
              <Image source={{ uri: member.image }} style={s.memberImg} />
              <View style={s.memberOverlay}>
                <Text style={s.memberName}>{member.name}</Text>
                <Text style={s.memberRole}>{language === 'fr' ? member.role_fr : member.role_en}</Text>
              </View>
              <View style={s.memberBody}>
                <Text style={s.memberDesc}>
                  {language === 'fr' ? member.description_fr : member.description_en}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Values */}
        <View style={s.valuesSection}>
          <View style={s.sectionHeader}>
            <View style={s.sectionLine} />
            <Text style={s.sectionLabel}>{language === 'fr' ? 'Securite &' : 'Safety &'}</Text>
            <Text style={s.sectionAccent}>{language === 'fr' ? 'Service' : 'Service'}</Text>
            <View style={s.sectionLine} />
          </View>

          {VALUES.map((val, i) => (
            <View key={i} style={s.valueCard}>
              <View style={s.valueIcon}>
                <Ionicons name={val.icon as any} size={24} color={COLORS.secondary} />
              </View>
              <View style={s.valueContent}>
                <Text style={s.valueTitle}>{language === 'fr' ? val.title_fr : val.title_en}</Text>
                <Text style={s.valueDesc}>{language === 'fr' ? val.desc_fr : val.desc_en}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center', flex: 1 },

  hero: { height: 280, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,28,64,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  heroTitle: { fontSize: 30, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontStyle: 'italic', marginTop: 8 },

  storySection: { alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.primary },
  storyLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  storyLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  storyQuote: { fontSize: 24, color: COLORS.secondary, fontWeight: '700', fontStyle: 'italic' },
  storyText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22, textAlign: 'center', marginTop: SPACING.md },

  membersSection: { paddingVertical: SPACING.xl },
  sectionHeader: { alignItems: 'center', marginBottom: SPACING.xl },
  sectionLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.xs },
  sectionLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  sectionAccent: { fontSize: 26, color: COLORS.secondary, fontWeight: '700' },

  memberCard: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFF' },
  memberImg: { width: '100%', height: 280 },
  memberOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, justifyContent: 'flex-end', padding: SPACING.md, backgroundColor: 'rgba(14,28,64,0.3)' },
  memberName: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  memberRole: { fontSize: 14, color: COLORS.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  memberBody: { padding: SPACING.lg },
  memberDesc: { fontSize: 14, color: '#6B6560', lineHeight: 22 },

  valuesSection: { backgroundColor: COLORS.primary, paddingVertical: SPACING.xl },
  valueCard: { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.secondary },
  valueIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  valueContent: { flex: 1 },
  valueTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  valueDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 },
});
