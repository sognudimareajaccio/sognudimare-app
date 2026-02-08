import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

const PHONE_NUMBER = '+33762457442';
const EMAIL = 'contact@sognudimare-catamarans.com';
const BOOKING_URL = 'https://www.sognudimare.com/r%C3%A9servation-cabines-privatisation-catamaran-sognudimare';

const SOCIAL_LINKS = [
  { name: 'Instagram', icon: 'logo-instagram', url: 'https://www.instagram.com/sognudimare/' },
  { name: 'Facebook', icon: 'logo-facebook', url: 'https://www.facebook.com/sognudimare' },
  { name: 'YouTube', icon: 'logo-youtube', url: 'https://www.youtube.com/@sognudimare7470' },
  { name: 'LinkedIn', icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/nicolasllorens/' },
];

export default function ContactScreen() {
  const { t } = useTranslation();

  const handleCall = () => {
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${EMAIL}`);
  };

  const handleOpenWebsite = () => {
    Linking.openURL(BOOKING_URL);
  };

  const handleSocialLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleOpenMaps = () => {
    const address = 'Port Tino Rossi, 20000 Ajaccio, France';
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('contactTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('contactSubtitle')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Contact Cards */}
        <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="call" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>{t('callUs')}</Text>
            <Text style={styles.contactValue}>07 62 45 74 42</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="mail" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>{t('emailUs')}</Text>
            <Text style={styles.contactValue}>{EMAIL}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleOpenMaps}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="location" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>{t('visitUs')}</Text>
            <Text style={styles.contactValue}>{t('address')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handleOpenWebsite}>
          <Ionicons name="boat" size={24} color={COLORS.white} />
          <Text style={styles.bookButtonText}>{t('bookingWebsite')}</Text>
        </TouchableOpacity>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>{t('followUs')}</Text>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((social) => (
              <TouchableOpacity
                key={social.name}
                style={styles.socialButton}
                onPress={() => handleSocialLink(social.url)}
              >
                <Ionicons name={social.icon as any} size={28} color={COLORS.primary} />
                <Text style={styles.socialName}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyTitle}>SOGNUDIMARE</Text>
          <Text style={styles.companyText}>
            Croisières catamaran & Promenades privatives en mer
          </Text>
          <Text style={styles.companyText}>Corse | Sardaigne | Grèce | Caraïbes</Text>
          <View style={styles.companyDetails}>
            <Text style={styles.companyDetailText}>SIRET: 45138736900031</Text>
            <Text style={styles.companyDetailText}>APE: 52.22Z</Text>
            <Text style={styles.companyDetailText}>TVA: FR21451387369</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  socialSection: {
    marginBottom: SPACING.xl,
  },
  socialTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  socialName: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  companyInfo: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  companyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 2,
  },
  companyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  companyDetails: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  companyDetailText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 2,
  },
});
