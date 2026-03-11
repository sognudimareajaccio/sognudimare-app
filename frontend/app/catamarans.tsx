import React, { useState, useRef } from 'react';
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
    id: 'lucy', name: 'LUCY', model: 'Sunreef 50', year: 2021, flagship: true,
    tagline_fr: 'Notre yacht de prestige', tagline_en: 'Our prestige yacht',
    desc_fr: 'Remarquable pour ses espaces de vie de 167 m\u00B2, le Sunreef 50 offre un equilibre parfait entre confort extreme, performance et technologie de pointe. Ideal pour les croisieres de luxe avec une autonomie complete.',
    desc_en: 'Remarkable for its 167 m\u00B2 living spaces, the Sunreef 50 offers a perfect balance between extreme comfort, performance and cutting-edge technology. Ideal for luxury cruises with complete autonomy.',
    image: 'https://www.lucy-yacht-charter.com/wp-content/uploads/2025/04/1741948383001-dji0319-0210-processed-400x0-c-default.jpg',
    gallery: [
      'https://www.lucy-yacht-charter.com/wp-content/uploads/2025/04/1741880477430-dji0149-0196-processed-1-e1744794238742.jpg',
      'https://www.lucy-yacht-charter.com/wp-content/uploads/2025/04/1741880477434-zoanls12-processed-445x600-c-default.jpg',
      'https://www.lucy-yacht-charter.com/wp-content/uploads/2025/04/1741880477435-zoanls29-processed-400x300-c-default.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 3,
    cabins_detail_fr: '1 cabine proprietaire (2 PAX)\n2 cabines invites (4 PAX)\n1 cabine VIP (2 PAX)',
    cabins_detail_en: '1 owner cabin (2 PAX)\n2 guest cabins (4 PAX)\n1 VIP cabin (2 PAX)',
    specs: { length: '15,26 m', width: '9,27 m', draft: '-', mainsail: 'Hydranet', jib: 'Hydranet', engine: '2 x 110 CV Yanmar', fuel: '1 500 L', water: '800 L', living: '167 m\u00B2' },
    features_fr: ['4 cabines : 1 proprietaire, 2 invites, 1 VIP (8 passagers)','Espaces de vie de 167 m\u00B2','Climatisation integrale','Bar, frigo et ice maker sur le fly','Tepanyaki sur le fly','2x Seabobs F5S','Paddleboard et ski nautique','TV 49" salon + TV 32" par cabine','Eclairage domotique et sous-marin','Dessalinisateur','Machine a laver et seche-linge','Passerelle et plateforme hydraulique','Equipement de peche complet'],
    features_en: ['4 cabins: 1 owner, 2 guest, 1 VIP (8 passengers)','167 m\u00B2 living spaces','Full air conditioning','Bar, fridge and ice maker on flybridge','Teppanyaki on flybridge','2x Seabobs F5S','Paddleboard and water ski','49" TV in salon + 32" TV per cabin','Smart lighting and underwater lights','Watermaker','Washer and dryer','Electric gangway and hydraulic platform','Complete fishing equipment'],
  },
  {
    id: 'lagoon-46', name: 'LAGOON 46', model: 'Lagoon 46', year: 2020, flagship: false,
    tagline_fr: 'Le plus grand de notre flotte Lagoon', tagline_en: 'The largest in our Lagoon fleet',
    desc_fr: 'Le Lagoon 46, avec son carre tres lumineux et sa vue panoramique, offre un confort haut de gamme pour 8 passagers dans 4 cabines spacieuses.',
    desc_en: 'The Lagoon 46, with its very bright saloon and panoramic view, offers high-end comfort for 8 guests in 4 spacious cabins.',
    image: 'https://static.wixstatic.com/media/ce6ce7_ab91617a12cd4697aa8c83c9c5fcbd83~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/lagoon%2046%20corse%20du%20%20sud.jpeg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_13a61aad063e4e06a04f8dc12f3923fc~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfe56e21dba24c57b05e9f43789c949a~mv2.png',
      'https://static.wixstatic.com/media/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_1c35243e90c443898806ba3a93d902bf~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 4,
    specs: { length: '13,99 m', width: '7,96 m', draft: '1,30 m', mainsail: '87 m\u00B2', jib: '50 m\u00B2', engine: '2 x 57 CV', fuel: '2 x 520 L', water: '2 x 300 L' },
    features_fr: ['Le plus grand de notre flotte Lagoon','Flybridge spacieux avec hardtop','Carre tres lumineux avec vue panoramique','Cuisine en U avec acces direct au cockpit','Matelas confort haut de gamme','Nombreux coffres de rangement'],
    features_en: ['The largest in our Lagoon fleet','Spacious flybridge with hardtop','Very bright saloon with panoramic view','U-shaped kitchen with direct cockpit access','High-end comfort mattresses','Numerous storage compartments'],
  },
  {
    id: 'lagoon-43', name: 'LAGOON 43', model: 'Lagoon 43', year: 2019, flagship: false,
    tagline_fr: 'Polyvalent et performant', tagline_en: 'Versatile and performant',
    desc_fr: 'Le Lagoon 43 combine polyvalence et performance. Son flybridge central offre une visibilite panoramique a 360 degres.',
    desc_en: 'The Lagoon 43 combines versatility and performance. Its central flybridge offers 360-degree panoramic visibility.',
    image: 'https://static.wixstatic.com/media/ce6ce7_5929704591ae45fe935f994303ec34a4~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/slider-lagoon-43-24.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_8278feafa93b400baa60e62fb051e0f5~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_6952556b109d49aebb18ec1a5e8df4e7~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_0a265a0d38054848b9385830b50ac84f~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 4,
    specs: { length: '13,85 m', width: '7,69 m', draft: '1,31 m', mainsail: '68 m\u00B2', jib: '37 m\u00B2', engine: '2 x 57 CV', fuel: '570 L', water: '300 L' },
    features_fr: ['Flybridge spacieux et central','Poste de barre avec visibilite panoramique a 360','Acces double depuis le cockpit arriere','Grande banquette en L pour detente','Hardtop pour protection solaire','Plage arriere degagee avec plateforme'],
    features_en: ['Spacious and central flybridge','Helm station with 360 panoramic visibility','Double access from aft cockpit','Large L-shaped bench for relaxation','Hardtop for sun protection','Clear stern platform'],
  },
  {
    id: 'lagoon-38', name: 'LAGOON 38', model: 'Lagoon 38', year: 2018, flagship: false,
    tagline_fr: 'Compact et elegant', tagline_en: 'Compact and elegant',
    desc_fr: 'Le Lagoon 38 se distingue par son cockpit avant encastre, rare a cette taille, et son flybridge spacieux avec une visibilite a 360 degres.',
    desc_en: 'The Lagoon 38 stands out with its built-in forward cockpit, rare at this size, and its spacious flybridge with 360-degree visibility.',
    image: 'https://static.wixstatic.com/media/ce6ce7_024c0100065546fbabe332bcb97a841f~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/catamaran-lagoon-38-slider-25.jpg',
    gallery: [
      'https://static.wixstatic.com/media/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg/v1/fill/w_600,h_400,q_90,enc_avif,quality_auto/ce6ce7_cbe3a23c159c43a1b89f03644ccf7ae4~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_f81d6b94746141e5b76189efe5760d51~mv2.jpg',
      'https://static.wixstatic.com/media/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg/v1/fill/w_400,h_300,q_90,enc_avif,quality_auto/ce6ce7_bfd4090cd81a4111860693f30f2ad6ab~mv2.jpg',
    ],
    capacity: 8, cabins: 4, bathrooms: 2,
    specs: { length: '13,12 m', width: '6,65 m', draft: '1,26 m', mainsail: '56 m\u00B2', jib: '23 m\u00B2', engine: '2 x 29 CV', fuel: '400 L', water: '300 L' },
    features_fr: ['Flybridge spacieux avec poste de barre sureleve','Visibilite panoramique a 360','Cockpit avant encastre (rare sur cette taille)','Table pour 8 personnes avec banquettes en U','Cuisine exterieure avec evier et frigo','Bains de soleil sur flybridge et pont avant'],
    features_en: ['Spacious flybridge with elevated helm station','360 panoramic visibility','Built-in forward cockpit (rare on this size)','Table for 8 with U-shaped seating','Outdoor kitchen with sink and fridge','Sunbathing areas on flybridge and foredeck'],
  },
];

export default function CatamaransScreen() {
  const { language } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<typeof CATAMARANS[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
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

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={s.intro}>
          <View style={s.introLine} />
          <Text style={s.introLabel}>{language === 'fr' ? 'La flotte' : 'The fleet'}</Text>
          <Text style={s.introAccent}>Sognudimare</Text>
          <Text style={s.introSub}>
            {language === 'fr'
              ? '4 catamarans d\'exception pour des navigations inoubliables'
              : '4 exceptional catamarans for unforgettable sailing'}
          </Text>
          <View style={s.introLine} />
        </View>

        {/* Catamaran Cards */}
        {CATAMARANS.map((cat) => (
          <TouchableOpacity key={cat.id} style={[s.card, cat.flagship && s.cardFlagship]} onPress={() => openDetail(cat)} activeOpacity={0.9}>
            {/* Flagship badge */}
            {cat.flagship && (
              <View style={s.flagshipBadge}>
                <Ionicons name="diamond" size={12} color={COLORS.primary} />
                <Text style={s.flagshipText}>{language === 'fr' ? 'PRESTIGE' : 'PRESTIGE'}</Text>
              </View>
            )}
            <View style={s.cardImgWrap}>
              <Image source={{ uri: cat.image }} style={s.cardImg} />
              <View style={s.cardImgOverlay}>
                <View>
                  <Text style={s.cardModel}>{cat.model}</Text>
                  <Text style={s.cardName}>{cat.name}</Text>
                </View>
              </View>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardTagline}>{language === 'fr' ? cat.tagline_fr : cat.tagline_en}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{language === 'fr' ? cat.desc_fr : cat.desc_en}</Text>
              <View style={s.specRow}>
                <View style={s.specItem}>
                  <Ionicons name="people" size={16} color={cat.flagship ? COLORS.secondary : COLORS.primary} />
                  <Text style={[s.specText, cat.flagship && s.specTextGold]}>{cat.capacity}</Text>
                  <Text style={s.specLabel}>{language === 'fr' ? 'pers.' : 'guests'}</Text>
                </View>
                <View style={s.specItem}>
                  <Ionicons name="bed" size={16} color={cat.flagship ? COLORS.secondary : COLORS.primary} />
                  <Text style={[s.specText, cat.flagship && s.specTextGold]}>{cat.cabins}</Text>
                  <Text style={s.specLabel}>{language === 'fr' ? 'cab.' : 'cab.'}</Text>
                </View>
                <View style={s.specItem}>
                  <Ionicons name="resize" size={16} color={cat.flagship ? COLORS.secondary : COLORS.primary} />
                  <Text style={[s.specText, cat.flagship && s.specTextGold]}>{cat.specs.length}</Text>
                </View>
                {cat.specs.living && (
                  <View style={s.specItem}>
                    <Ionicons name="expand" size={16} color={COLORS.secondary} />
                    <Text style={[s.specText, s.specTextGold]}>{cat.specs.living}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={[s.seeBtn, cat.flagship && s.seeBtnGold]} onPress={() => openDetail(cat)}>
                <Text style={[s.seeBtnText, cat.flagship && s.seeBtnTextGold]}>{language === 'fr' ? 'Decouvrir' : 'Discover'}</Text>
                <Ionicons name="arrow-forward" size={16} color={cat.flagship ? COLORS.primary : COLORS.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>{language === 'fr' ? 'Pret a embarquer ?' : 'Ready to board?'}</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => { scrollRef.current?.scrollTo({ y: 0, animated: true }); router.push('/cruises'); }}>
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
                <View style={s.modalHeaderCenter}>
                  <Text style={s.modalModel}>{selected.model}</Text>
                  <Text style={s.modalTitle}>{selected.name}</Text>
                </View>
                <View style={{ width: 40 }} />
              </View>

              {/* Gallery */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gallery}>
                <Image source={{ uri: selected.image }} style={s.galleryImg} />
                {selected.gallery.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={s.galleryImg} />
                ))}
              </ScrollView>

              {/* Description */}
              <View style={s.modalDesc}>
                <Text style={s.modalDescText}>{language === 'fr' ? selected.desc_fr : selected.desc_en}</Text>
              </View>

              {/* Quick Specs */}
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

              {/* Cabin Detail for Lucy */}
              {selected.cabins_detail_fr && (
                <View style={s.cabinDetailBox}>
                  <Text style={s.cabinDetailTitle}>{language === 'fr' ? 'Detail des cabines' : 'Cabin details'}</Text>
                  {(language === 'fr' ? selected.cabins_detail_fr : selected.cabins_detail_en).split('\n').map((line: string, i: number) => (
                    <View key={i} style={s.cabinDetailRow}>
                      <Ionicons name="bed-outline" size={16} color={COLORS.secondary} />
                      <Text style={s.cabinDetailText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Specs Table */}
              <View style={s.modalSection}>
                <Text style={s.mSectionTitle}>{language === 'fr' ? 'Caracteristiques' : 'Specifications'}</Text>
                {Object.entries({
                  [language === 'fr' ? 'Longueur' : 'Length']: selected.specs.length,
                  [language === 'fr' ? 'Largeur' : 'Width']: selected.specs.width,
                  ...(selected.specs.living ? { [language === 'fr' ? 'Espaces de vie' : 'Living spaces']: selected.specs.living } : {}),
                  ...(selected.specs.draft !== '-' ? { [language === 'fr' ? "Tirant d'eau" : 'Draft']: selected.specs.draft } : {}),
                  [language === 'fr' ? 'Motorisation' : 'Engine']: selected.specs.engine,
                  [language === 'fr' ? 'Carburant' : 'Fuel']: selected.specs.fuel,
                  [language === 'fr' ? 'Eau douce' : 'Water']: selected.specs.water,
                }).map(([k, v], i) => (
                  <View key={i} style={s.specLine}><Text style={s.specK}>{k}</Text><Text style={s.specV}>{v}</Text></View>
                ))}
              </View>

              {/* Features */}
              <View style={s.modalSection}>
                <Text style={s.mSectionTitle}>{language === 'fr' ? 'Equipements' : 'Equipment'}</Text>
                {(language === 'fr' ? selected.features_fr : selected.features_en).map((f, i) => (
                  <View key={i} style={s.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={s.modalBookBtn} onPress={() => { setShowModal(false); scrollRef.current?.scrollTo({ y: 0, animated: true }); router.push('/cruises'); }}>
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

  // Cards
  card: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardFlagship: { borderWidth: 2, borderColor: COLORS.secondary },
  flagshipBadge: { position: 'absolute', top: 12, right: 12, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 5 },
  flagshipText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.5 },
  cardImgWrap: { height: 240, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  cardImgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,28,64,0.35)', justifyContent: 'flex-end', padding: SPACING.md },
  cardModel: { fontSize: 12, color: COLORS.secondary, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  cardName: { fontSize: 30, fontWeight: '800', color: COLORS.white },
  cardBody: { padding: SPACING.md },
  cardTagline: { fontSize: 11, color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#8A8478', lineHeight: 19, marginBottom: SPACING.md },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0EDE8' },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  specTextGold: { color: COLORS.secondary },
  specLabel: { fontSize: 10, color: '#8A8478' },
  seeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, gap: 8 },
  seeBtnGold: { backgroundColor: COLORS.secondary },
  seeBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  seeBtnTextGold: { color: COLORS.primary },

  cta: { alignItems: 'center', backgroundColor: COLORS.primary, marginHorizontal: SPACING.md, borderRadius: 16, padding: SPACING.xl },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, gap: 8 },
  ctaBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

  // Modal
  modal: { flex: 1, backgroundColor: '#F8F6F3' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  modalHeaderCenter: { flex: 1, alignItems: 'center' },
  modalModel: { fontSize: 11, color: COLORS.secondary, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  gallery: { paddingHorizontal: SPACING.md, gap: 10 },
  galleryImg: { width: width * 0.75, height: 220, borderRadius: 14 },
  modalDesc: { padding: SPACING.lg },
  modalDescText: { fontSize: 14, color: '#6B6560', lineHeight: 22 },
  quickSpecs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.lg, marginHorizontal: SPACING.md, backgroundColor: COLORS.primary, borderRadius: 14 },
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

  // Cabin detail
  cabinDetailBox: { marginHorizontal: SPACING.md, backgroundColor: 'rgba(235,208,169,0.1)', borderRadius: 14, padding: SPACING.md, marginTop: SPACING.md, borderWidth: 1, borderColor: 'rgba(235,208,169,0.3)' },
  cabinDetailTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  cabinDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cabinDetailText: { fontSize: 14, color: '#6B6560', fontWeight: '500' },
});
