import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../src/services/api';

const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';

export default function CruisesScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width: winWidth } = useWindowDimensions();
  const isDesktop = winWidth > 768;

  useEffect(() => { loadCruises(); }, []);

  const loadCruises = async () => {
    try {
      const data = await cruiseApi.getAll();
      setCruises(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Desktop header with logo */}
      {isDesktop ? (
        <View style={s.desktopHeader}>
          <Image source={{ uri: LOGO_URL }} style={s.desktopLogo} resizeMode="contain" />
          <View style={s.desktopNav}>
            <Text style={s.desktopNavItem}>{language === 'fr' ? 'Nos destinations' : 'Our destinations'}</Text>
          </View>
        </View>
      ) : (
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('ourDestinations')}</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCruises(); }} tintColor={COLORS.primary} />}
      >
        {/* Intro */}
        <View style={[s.intro, isDesktop && s.introDesktop]}>
          <View style={s.introLine} />
          <Text style={[s.introTitle, isDesktop && { fontSize: 18 }]}>{language === 'fr' ? 'Nos' : 'Our'}</Text>
          <Text style={[s.introAccent, isDesktop && { fontSize: 36 }]}>{language === 'fr' ? 'Croisieres' : 'Cruises'}</Text>
          <Text style={[s.introSub, isDesktop && { fontSize: 15, maxWidth: 500 }]}>
            {language === 'fr'
              ? 'Explorez la Mediterranee a bord de nos catamarans'
              : 'Explore the Mediterranean aboard our catamarans'}
          </Text>
          <View style={s.introLine} />
        </View>

        {/* Cruise Cards - Grid on desktop */}
        <View style={[s.cardsContainer, isDesktop && s.cardsGrid]}>
          {cruises.map((cruise) => {
            const nextAvail = cruise.availabilities?.find(a => a.status !== 'full');
            return (
              <TouchableOpacity
                key={cruise.id}
                style={[s.card, isDesktop && s.cardDesktop]}
                onPress={() => router.push(`/cruise/${cruise.id}`)}
                activeOpacity={0.9}
              >
                <View style={[s.cardImageWrap, isDesktop && { height: 240 }]}>
                  <Image source={{ uri: cruise.image_url }} style={s.cardImage} />
                  <View style={s.cardOverlay}>
                    <View style={s.durationBadge}>
                      <Ionicons name="time-outline" size={13} color={COLORS.secondary} />
                      <Text style={s.durationText}>{cruise.duration}</Text>
                    </View>
                  </View>
                </View>

                <View style={[s.cardBody, isDesktop && { padding: 20 }]}>
                  <Text style={s.cardSub}>
                    {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                  </Text>
                  <Text style={[s.cardName, isDesktop && { fontSize: 24 }]}>
                    {language === 'fr' ? cruise.name_fr : cruise.name_en}
                  </Text>

                  <View style={s.metaRow}>
                    <View style={s.metaItem}>
                      <Ionicons name="location" size={14} color={COLORS.secondary} />
                      <Text style={s.metaText}>{cruise.departure_port}</Text>
                    </View>
                  </View>

                  {/* Next departure */}
                  {nextAvail && (
                    <View style={s.nextDep}>
                      <View style={s.nextDepHeader}>
                        <Ionicons name="calendar" size={14} color={COLORS.secondary} />
                        <Text style={s.nextDepLabel}>{language === 'fr' ? 'PROCHAIN DEPART' : 'NEXT DEPARTURE'}</Text>
                      </View>
                      <View style={s.nextDepRow}>
                        <Text style={s.nextDepText}>{nextAvail.date_range}</Text>
                        <Text style={s.nextDepPrice}>{nextAvail.price}EUR</Text>
                      </View>
                    </View>
                  )}

                  <View style={s.cardFooter}>
                    <View>
                      <Text style={s.priceFrom}>{language === 'fr' ? 'A partir de' : 'From'}</Text>
                      <Text style={s.priceVal}>{cruise.pricing.cabin_price}EUR<Text style={s.pricePer}> /{language === 'fr' ? 'pers.' : 'pp'}</Text></Text>
                    </View>
                    <View style={[s.seeBtn, isDesktop && { paddingHorizontal: 24, paddingVertical: 12 }]}>
                      <Text style={s.seeBtnText}>{t('seeDetails')}</Text>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Desktop footer */}
        {isDesktop && (
          <View style={s.desktopFooter}>
            <Image source={{ uri: LOGO_URL }} style={s.footerLogo} resizeMode="contain" />
            <Text style={s.footerText}>Croisieres catamaran & Promenades privatives en mer</Text>
            <Text style={s.footerText}>Corse | Sardaigne | Mediterranee</Text>
            <View style={s.footerDivider} />
            <Text style={s.footerLegal}>contact@sognudimare-catamarans.com | +33 7 62 45 74 42</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Mobile header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center', flex: 1 },

  // Desktop header
  desktopHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 60, paddingVertical: 16, backgroundColor: COLORS.primary,
    borderBottomWidth: 1, borderBottomColor: 'rgba(235,208,169,0.15)',
  },
  desktopLogo: { width: 160, height: 60 },
  desktopNav: { flexDirection: 'row', alignItems: 'center' },
  desktopNavItem: { fontSize: 14, color: COLORS.secondary, fontWeight: '600', letterSpacing: 1 },

  // Intro
  intro: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg },
  introDesktop: { paddingVertical: 48 },
  introLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  introTitle: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  introAccent: { fontSize: 28, color: COLORS.secondary, fontWeight: '700' },
  introSub: { fontSize: 13, color: '#8A8478', textAlign: 'center', marginTop: SPACING.xs },

  // Cards container
  cardsContainer: { paddingHorizontal: SPACING.md },
  cardsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 20, gap: 24,
  },

  // Card
  card: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardDesktop: {
    width: 500, marginBottom: 0,
  },
  cardImageWrap: { height: 200, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,28,64,0.15)', justifyContent: 'flex-start', alignItems: 'flex-start', padding: SPACING.md },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,28,64,0.75)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  durationText: { color: COLORS.secondary, fontSize: 12, fontWeight: '600', marginLeft: 6 },

  cardBody: { padding: SPACING.md },
  cardSub: { fontSize: 11, color: '#8A8478', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  cardName: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginTop: 2, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: '#6B6560', marginLeft: 6 },

  nextDep: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 12, marginBottom: SPACING.md },
  nextDepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  nextDepLabel: { fontSize: 10, fontWeight: '800', color: COLORS.secondary, letterSpacing: 1.5 },
  nextDepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextDepText: { fontSize: 13, color: COLORS.white, fontWeight: '600' },
  nextDepPrice: { fontSize: 16, fontWeight: '800', color: COLORS.secondary },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#F0EDE8' },
  priceFrom: { fontSize: 10, color: '#8A8478' },
  priceVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  pricePer: { fontSize: 12, fontWeight: '400', color: '#8A8478' },
  seeBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  seeBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  // Desktop footer
  desktopFooter: {
    backgroundColor: COLORS.primary, marginHorizontal: 60, borderRadius: 20,
    padding: 40, alignItems: 'center', marginTop: 20,
  },
  footerLogo: { width: 180, height: 80, marginBottom: 12 },
  footerText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 },
  footerDivider: { width: 60, height: 1, backgroundColor: 'rgba(235,208,169,0.3)', marginVertical: 16 },
  footerLegal: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
});
