import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { cruiseApi, Cruise } from '../src/services/api';

const { width } = Dimensions.get('window');

export default function CruisesScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('ourDestinations')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCruises(); }} tintColor={COLORS.primary} />}
      >
        {/* Intro */}
        <View style={s.intro}>
          <View style={s.introLine} />
          <Text style={s.introTitle}>{language === 'fr' ? 'Nos' : 'Our'}</Text>
          <Text style={s.introAccent}>{language === 'fr' ? 'Croisières' : 'Cruises'}</Text>
          <Text style={s.introSub}>
            {language === 'fr'
              ? 'Explorez la Méditerranée à bord de nos catamarans'
              : 'Explore the Mediterranean aboard our catamarans'}
          </Text>
          <View style={s.introLine} />
        </View>

        {/* Cruise Cards */}
        {cruises.map((cruise) => {
          const nextAvail = cruise.availabilities?.find(a => a.status !== 'full');
          return (
            <TouchableOpacity
              key={cruise.id}
              style={s.card}
              onPress={() => router.push(`/cruise/${cruise.id}`)}
              activeOpacity={0.9}
            >
              <View style={s.cardImageWrap}>
                <Image source={{ uri: cruise.image_url }} style={s.cardImage} />
                <View style={s.cardOverlay}>
                  <View style={s.durationBadge}>
                    <Ionicons name="time-outline" size={13} color={COLORS.secondary} />
                    <Text style={s.durationText}>{cruise.duration}</Text>
                  </View>
                </View>
              </View>

              <View style={s.cardBody}>
                <Text style={s.cardSub}>
                  {language === 'fr' ? cruise.subtitle_fr : cruise.subtitle_en}
                </Text>
                <Text style={s.cardName}>
                  {language === 'fr' ? cruise.name_fr : cruise.name_en}
                </Text>

                <View style={s.metaRow}>
                  <View style={s.metaItem}>
                    <Ionicons name="location" size={14} color={COLORS.secondary} />
                    <Text style={s.metaText}>{cruise.departure_port}</Text>
                  </View>
                </View>

                {/* Next departure highlight */}
                {nextAvail && (
                  <View style={s.nextDep}>
                    <View style={s.nextDepHeader}>
                      <Ionicons name="calendar" size={14} color={COLORS.secondary} />
                      <Text style={s.nextDepLabel}>{language === 'fr' ? 'PROCHAIN DÉPART' : 'NEXT DEPARTURE'}</Text>
                    </View>
                    <View style={s.nextDepRow}>
                      <Text style={s.nextDepText}>{nextAvail.date_range}</Text>
                      <Text style={s.nextDepPrice}>{nextAvail.price}€</Text>
                    </View>
                  </View>
                )}

                <View style={s.cardFooter}>
                  <View>
                    <Text style={s.priceFrom}>{language === 'fr' ? 'À partir de' : 'From'}</Text>
                    <Text style={s.priceVal}>{cruise.pricing.cabin_price}€<Text style={s.pricePer}> /{language === 'fr' ? 'pers.' : 'pp'}</Text></Text>
                  </View>
                  <View style={s.seeBtn}>
                    <Text style={s.seeBtnText}>{t('seeDetails')}</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.secondary, textAlign: 'center', flex: 1 },

  intro: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg },
  introLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: SPACING.sm },
  introTitle: { fontSize: 16, color: COLORS.primary, fontWeight: '300', letterSpacing: 1 },
  introAccent: { fontSize: 28, color: COLORS.secondary, fontWeight: '700' },
  introSub: { fontSize: 13, color: '#8A8478', textAlign: 'center', marginTop: SPACING.xs },

  card: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.lg,
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
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

  nextDep: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 12, marginBottom: SPACING.md,
  },
  nextDepHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6,
  },
  nextDepLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.secondary, letterSpacing: 1.5,
  },
  nextDepRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
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
});
