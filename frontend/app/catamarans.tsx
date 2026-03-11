import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const CATAMARANS = [
  {
    id: 'lagoon-38', name: 'LAGOON 38',
    tagline_fr: 'Naviguez avec elegance', tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_024c0100065546fbabe332bcb97a841f~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/catamaran-lagoon-38-slider-25.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 2,
    specs: { length: '13,12 m', width: '6,65 m', draft: '1,26 m', mainsail: '56 m2', jib: '23 m2', engine: '2 x 29 CV', fuel: '400 L', water: '300 L' },
    features_fr: ['Flybridge spacieux avec poste de barre sureleve','Visibilite panoramique a 360','Cockpit avant encastre (rare sur cette taille)','Table pour 8 personnes avec banquettes en U','Cuisine exterieure avec evier et frigo','Bains de soleil sur flybridge et pont avant'],
    features_en: ['Spacious flybridge with elevated helm station','360 panoramic visibility','Built-in forward cockpit (rare on this size)','Table for 8 with U-shaped seating','Outdoor kitchen with sink and fridge','Sunbathing areas on flybridge and foredeck'],
  },
  {
    id: 'lagoon-43', name: 'LAGOON 43',
    tagline_fr: 'Naviguez avec elegance', tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_5929704591ae45fe935f994303ec34a4~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/slider-lagoon-43-24.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 4,
    specs: { length: '13,85 m', width: '7,69 m', draft: '1,31 m', mainsail: '68 m2', jib: '37 m2', engine: '2 x 57 CV', fuel: '570 L', water: '300 L' },
    features_fr: ['Flybridge spacieux et central','Poste de barre avec visibilite panoramique a 360','Acces double depuis le cockpit arriere','Grande banquette en L pour detente','Hardtop pour protection solaire','Plage arriere degagee avec plateforme'],
    features_en: ['Spacious and central flybridge','Helm station with 360 panoramic visibility','Double access from aft cockpit','Large L-shaped bench for relaxation','Hardtop for sun protection','Clear stern platform'],
  },
  {
    id: 'lagoon-46', name: 'LAGOON 46',
    tagline_fr: 'Naviguez avec elegance', tagline_en: 'Sail with elegance',
    image: 'https://static.wixstatic.com/media/ce6ce7_ab91617a12cd4697aa8c83c9c5fcbd83~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/lagoon%2046%20corse%20du%20%20sud.jpeg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png',
      'https://static.wixstatic.com/media/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 4,
    specs: { length: '13,99 m', width: '7,96 m', draft: '1,30 m', mainsail: '87 m2', jib: '50 m2', engine: '2 x 57 CV', fuel: '2 x 520 L', water: '2 x 300 L' },
    features_fr: ['Le plus grand de notre flotte','Flybridge spacieux avec hardtop','Carre tres lumineux avec vue panoramique','Cuisine en U avec acces direct au cockpit','Matelas confort haut de gamme','Nombreux coffres de rangement'],
    features_en: ['The largest in our fleet','Spacious flybridge with hardtop','Very bright saloon with panoramic view','U-shaped kitchen with direct cockpit access','High-end comfort mattresses','Numerous storage compartments'],
  },
];

export default function CatamaransScreen() {
  const { language } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<typeof CATAMARANS[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openDetail = (cat: typeof CATAMARANS[0]) => { setSelected(cat); setShowModal(true); };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{language === 'fr' ? 'La Flotte' : 'The Fleet'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={s.intro}>
          <View style={s.introLine} />
          <Text style={s.introLabel}>{language === 'fr' ? 'La flotte de navires' : 'The fleet'}</Text>
          <Text style={s.introAccent}>Sognudimare</Text>
          <Text style={s.introSub}>
            {language === 'fr'
              ? 'Des catamarans recents, spacieux et concus pour une navigation douce et respectueuse'
              : 'Recent, spacious catamarans designed for smooth and respectful sailing'}
          </Text>
          <View style={s.introLine} />
        </View>

        {/* Catamaran Cards */}
        {CATAMARANS.map((cat) => (
          <TouchableOpacity key={cat.id} style={s.card} onPress={() => openDetail(cat)} activeOpacity={0.9}>
            <View style={s.cardImgWrap}>
              <Image source={{ uri: cat.image }} style={s.cardImg} />
              <View style={s.cardImgOverlay}>
                <Text style={s.cardName}>{cat.name}</Text>
              </View>
            </View>
            <View style={s.cardBody}>
              <View style={s.specRow}>
                <View style={s.specItem}><Ionicons name="people" size={16} color={COLORS.secondary} /><Text style={s.specText}>{cat.capacity}</Text></View>
                <View style={s.specItem}><Ionicons name="bed" size={16} color={COLORS.secondary} /><Text style={s.specText}>{cat.cabins}</Text></View>
                <View style={s.specItem}><Ionicons name="water" size={16} color={COLORS.secondary} /><Text style={s.specText}>{cat.bathrooms}</Text></View>
                <View style={s.specItem}><Ionicons name="resize" size={16} color={COLORS.secondary} /><Text style={s.specText}>{cat.specs.length}</Text></View>
              </View>
              <View style={s.seeBtn}>
                <Text style={s.seeBtnText}>{language === 'fr' ? 'Decouvrir' : 'Discover'}</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>{language === 'fr' ? 'Pret a embarquer ?' : 'Ready to board?'}</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/cruises')}>
            <Text style={s.ctaBtnText}>{language === 'fr' ? 'Voir les croisieres' : 'View cruises'}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        {selected && (
          <SafeAreaView style={s.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.modalHeader}>
                <TouchableOpacity onPress={() => setShowModal(false)} style={s.closeBtn}>
                  <Ionicons name="close" size={26} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={s.modalTitle}>{selected.name}</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gallery}>
                {selected.gallery.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={s.galleryImg} />
                ))}
              </ScrollView>

              <View style={s.quickSpecs}>
                {[
                  { icon: 'people', val: selected.capacity, label: language === 'fr' ? 'Passagers' : 'Guests' },
                  { icon: 'bed', val: selected.cabins, label: language === 'fr' ? 'Cabines' : 'Cabins' },
                  { icon: 'water', val: selected.bathrooms, label: language === 'fr' ? 'SdB' : 'Bath' },
                ].map((sp, i) => (
                  <View key={i} style={s.qsItem}>
                    <Ionicons name={sp.icon as any} size={22} color={COLORS.secondary} />
                    <Text style={s.qsVal}>{sp.val}</Text>
                    <Text style={s.qsLabel}>{sp.label}</Text>
                  </View>
                ))}
              </View>

              <View style={s.modalSection}>
                <Text style={s.mSectionTitle}>{language === 'fr' ? 'Caracteristiques' : 'Specifications'}</Text>
                {Object.entries({
                  [language === 'fr' ? 'Longueur' : 'Length']: selected.specs.length,
                  [language === 'fr' ? 'Largeur' : 'Width']: selected.specs.width,
                  [language === 'fr' ? 'Tirant d\'eau' : 'Draft']: selected.specs.draft,
                  [language === 'fr' ? 'Grand-voile' : 'Mainsail']: selected.specs.mainsail,
                  [language === 'fr' ? 'Genois' : 'Jib']: selected.specs.jib,
                  [language === 'fr' ? 'Motorisation' : 'Engine']: selected.specs.engine,
                  [language === 'fr' ? 'Carburant' : 'Fuel']: selected.specs.fuel,
                  [language === 'fr' ? 'Eau douce' : 'Water']: selected.specs.water,
                }).map(([k, v], i) => (
                  <View key={i} style={s.specLine}><Text style={s.specK}>{k}</Text><Text style={s.specV}>{v}</Text></View>
                ))}
              </View>

              <View style={s.modalSection}>
                <Text style={s.mSectionTitle}>{language === 'fr' ? 'Amenagements' : 'Amenities'}</Text>
                {(language === 'fr' ? selected.features_fr : selected.features_en).map((f, i) => (
                  <View key={i} style={s.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={s.modalBookBtn} onPress={() => { setShowModal(false); router.push('/cruises'); }}>
                <Text style={s.modalBookText}>{language === 'fr' ? 'Reserver une croisiere' : 'Book a cruise'}</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center', flex: 1 },

  intro: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg },
  introLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  introLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  introAccent: { fontSize: 28, color: COLORS.secondary, fontWeight: '700' },
  introSub: { fontSize: 13, color: '#8A8478', textAlign: 'center', marginTop: SPACING.xs },

  card: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardImgWrap: { height: 220, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  cardImgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,28,64,0.3)', justifyContent: 'flex-end', padding: SPACING.md },
  cardName: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  cardBody: { padding: SPACING.md },
  specRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  seeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 10, gap: 8 },
  seeBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  cta: { alignItems: 'center', backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, borderRadius: 16, padding: SPACING.xl },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, gap: 8 },
  ctaBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

  // Modal
  modal: { flex: 1, backgroundColor: '#F8F6F3' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, flex: 1, textAlign: 'center' },
  gallery: { paddingHorizontal: SPACING.md, gap: 10 },
  galleryImg: { width: width * 0.7, height: 200, borderRadius: 14 },
  quickSpecs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.lg, marginHorizontal: SPACING.md, backgroundColor: COLORS.primary, borderRadius: 14, marginTop: SPACING.md },
  qsItem: { alignItems: 'center' },
  qsVal: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  qsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  modalSection: { padding: SPACING.md },
  mSectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md, letterSpacing: 1, textTransform: 'uppercase' },
  specLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDE9E4' },
  specK: { fontSize: 14, color: '#8A8478' },
  specV: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  featureText: { flex: 1, fontSize: 14, color: '#6B6560' },
  modalBookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, paddingVertical: 16, borderRadius: 12, gap: 8 },
  modalBookText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
