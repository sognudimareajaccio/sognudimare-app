import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Platform, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');
const PHONE = '+33762457442';
const EMAIL = 'contact@sognudimare-catamarans.com';
const WEBSITE = 'https://www.sognudimare.com';
const LOGO_URL = 'https://static.wixstatic.com/media/ce6ce7_a82e3e86741143d6ab7acd99c121af7b~mv2.png/v1/fill/w_317,h_161,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/croisieres%20catamaran%20corse%20sognudimare.png';
const CREW_PHOTO = 'https://customer-assets.emergentagent.com/job_9cd3f56f-4a03-431f-97d2-451a19626174/artifacts/02i4y2gt_PHOTO-2026-02-22-12-33-46.jpg';

const SOCIALS = [
  { name: 'Instagram', icon: 'logo-instagram', color: '#E4405F', url: 'https://www.instagram.com/sognudimare/' },
  { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2', url: 'https://www.facebook.com/sognudimare' },
  { name: 'YouTube', icon: 'logo-youtube', color: '#FF0000', url: 'https://www.youtube.com/@sognudimare7470' },
  { name: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2', url: 'https://www.linkedin.com/in/nicolasllorens/' },
];

export default function ContactScreen() {
  const { language } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero with crew photo */}
        <View style={s.hero}>
          <Image source={{ uri: CREW_PHOTO }} style={s.heroImg} resizeMode="cover" />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <View style={s.heroLine} />
            <Text style={s.heroLabel}>{language === 'fr' ? 'Contactez-nous' : 'Contact us'}</Text>
            <Text style={s.heroTitle}>Nicolas & Maud</Text>
            <Text style={s.heroSub}>{language === 'fr' ? 'Votre equipage' : 'Your crew'}</Text>
            <View style={s.heroLine} />
          </View>
        </View>

        {/* Thank you message */}
        <View style={s.thankSection}>
          <MaterialCommunityIcons name="heart-multiple" size={28} color={COLORS.secondary} />
          <Text style={s.thankTitle}>
            {language === 'fr' ? 'Un mot de l\'equipage' : 'A word from the crew'}
          </Text>
          <Text style={s.thankText}>
            {language === 'fr'
              ? '"Merci de votre confiance et de votre interet pour nos croisieres. Chaque voyage est pour nous une aventure humaine unique. Nous mettons tout notre coeur a vous offrir des moments inoubliables en Mediterranee. N\'hesitez pas a nous contacter, nous serons ravis d\'echanger avec vous et de preparer ensemble votre prochaine escapade."'
              : '"Thank you for your trust and interest in our cruises. Each voyage is a unique human adventure for us. We put all our heart into offering you unforgettable moments in the Mediterranean. Do not hesitate to contact us, we will be delighted to chat with you and prepare your next escape together."'}
          </Text>
          <Text style={s.thankSign}>— Nicolas & Maud</Text>
        </View>

        {/* Contact cards */}
        <View style={s.cardsSection}>
          <TouchableOpacity style={s.contactCard} onPress={() => Linking.openURL(`tel:${PHONE}`)}>
            <View style={s.cardIcon}>
              <Ionicons name="call" size={24} color={COLORS.white} />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>{language === 'fr' ? 'Appelez-nous' : 'Call us'}</Text>
              <Text style={s.cardValue}>07 62 45 74 42</Text>
            </View>
            <View style={s.cardArrow}><Ionicons name="chevron-forward" size={18} color={COLORS.secondary} /></View>
          </TouchableOpacity>

          <TouchableOpacity style={s.contactCard} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>
            <View style={[s.cardIcon, { backgroundColor: COLORS.accent }]}>
              <Ionicons name="mail" size={24} color={COLORS.white} />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>{language === 'fr' ? 'Ecrivez-nous' : 'Email us'}</Text>
              <Text style={s.cardValue}>{EMAIL}</Text>
            </View>
            <View style={s.cardArrow}><Ionicons name="chevron-forward" size={18} color={COLORS.secondary} /></View>
          </TouchableOpacity>

          <TouchableOpacity style={s.contactCard} onPress={() => {
            const addr = encodeURIComponent('Port Tino Rossi, 20000 Ajaccio, France');
            Linking.openURL(Platform.select({ ios: `maps:?q=${addr}`, android: `geo:0,0?q=${addr}`, default: `https://www.google.com/maps/search/?api=1&query=${addr}` }));
          }}>
            <View style={[s.cardIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="location" size={24} color={COLORS.white} />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>{language === 'fr' ? 'Retrouvez-nous' : 'Find us'}</Text>
              <Text style={s.cardValue}>Port Tino Rossi, Ajaccio</Text>
            </View>
            <View style={s.cardArrow}><Ionicons name="chevron-forward" size={18} color={COLORS.secondary} /></View>
          </TouchableOpacity>
        </View>

        {/* Website CTA */}
        <TouchableOpacity style={s.websiteBtn} onPress={() => Linking.openURL(WEBSITE)}>
          <MaterialCommunityIcons name="sail-boat" size={22} color={COLORS.primary} />
          <Text style={s.websiteBtnText}>{language === 'fr' ? 'Visiter notre site web' : 'Visit our website'}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Social media */}
        <View style={s.socialSection}>
          <Text style={s.socialTitle}>{language === 'fr' ? 'Suivez-nous' : 'Follow us'}</Text>
          <View style={s.socialRow}>
            {SOCIALS.map((social) => (
              <TouchableOpacity key={social.name} style={s.socialBtn} onPress={() => Linking.openURL(social.url)}>
                <View style={[s.socialIconWrap, { backgroundColor: social.color + '15' }]}>
                  <Ionicons name={social.icon as any} size={24} color={social.color} />
                </View>
                <Text style={s.socialName}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Admin link */}
        <TouchableOpacity style={s.adminLink} onPress={() => router.push('/admin')}>
          <Ionicons name="settings-outline" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={s.adminLinkText}>Administration</Text>
        </TouchableOpacity>

        {/* Company footer */}
        <View style={s.footer}>
          <Image source={{ uri: LOGO_URL }} style={s.footerLogo} resizeMode="contain" />
          <Text style={s.footerText}>Croisieres catamaran & Promenades privatives en mer</Text>
          <Text style={s.footerText}>Corse | Sardaigne</Text>
          <View style={s.footerDivider} />
          <Text style={s.footerLegal}>SIRET: 45138736900031</Text>
          <Text style={s.footerLegal}>APE: 52.22Z  |  TVA: FR21451387369</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F3' },

  // Hero
  hero: { height: 340, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,28,64,0.45)' },
  heroContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 },
  heroLine: { width: 50, height: 2, backgroundColor: COLORS.secondary, marginVertical: 8 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '400', letterSpacing: 2, textTransform: 'uppercase' },
  heroTitle: { fontSize: 32, color: COLORS.white, fontWeight: '700' },
  heroSub: { fontSize: 14, color: COLORS.secondary, fontWeight: '600', letterSpacing: 1 },

  // Thank you
  thankSection: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  thankTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 12, marginBottom: 12 },
  thankText: { fontSize: 14, color: '#6B6560', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
  thankSign: { fontSize: 14, color: COLORS.secondary, fontWeight: '700', marginTop: 16, letterSpacing: 1 },

  // Contact cards
  cardsSection: { paddingHorizontal: 16, marginBottom: 16 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 14 },
  cardLabel: { fontSize: 11, color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  cardValue: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  cardArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(235,208,169,0.15)', justifyContent: 'center', alignItems: 'center' },

  // Website CTA
  websiteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, marginHorizontal: 16, paddingVertical: 16, borderRadius: BORDER_RADIUS.full, gap: 10, marginBottom: 28 },
  websiteBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

  // Social
  socialSection: { paddingHorizontal: 16, marginBottom: 24 },
  socialTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 14 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialBtn: { width: (width - 42) / 2, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 12, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  socialIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  socialName: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Admin
  adminLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, marginHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, marginBottom: 20 },
  adminLinkText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  // Footer
  footer: { backgroundColor: COLORS.primary, marginHorizontal: 16, borderRadius: 20, padding: 28, alignItems: 'center' },
  footerLogo: { width: 180, height: 90, marginBottom: 10 },
  footerText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },
  footerDivider: { width: 50, height: 1, backgroundColor: 'rgba(235,208,169,0.3)', marginVertical: 16 },
  footerLegal: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 2 },
});
