import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, Cruise } from '../../src/services/api';

// Design tokens
const COLORS = {
  primary: '#002552',
  secondary: '#C9A227',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

interface PaymentConfig {
  application_id: string;
  location_id: string;
  environment: string;
}

export default function PaymentScreen() {
  const { cruiseId, bookingType, passengers, selectedDate, amount } = useLocalSearchParams();
  const router = useRouter();
  
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Card info (for demo/sandbox - in production use Square SDK)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, [cruiseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cruiseData, configData] = await Promise.all([
        apiService.cruises.getById(cruiseId as string),
        fetch('/api/payments/config').then(r => r.json())
      ]);
      setCruise(cruiseData);
      setPaymentConfig(configData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!customerName.trim()) {
      newErrors.customerName = 'Le nom est requis';
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      newErrors.customerEmail = 'Email valide requis';
    }
    if (!cardNumber.trim() || cardNumber.length < 16) {
      newErrors.cardNumber = 'Numéro de carte valide requis';
    }
    if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
      newErrors.cardExpiry = 'Date d\'expiration valide requise (MM/AA)';
    }
    if (!cardCvv.trim() || cardCvv.length < 3) {
      newErrors.cardCvv = 'CVV valide requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!cruise) return;
    
    setProcessing(true);
    
    try {
      // In sandbox mode, we use a test nonce
      // In production, you would use Square Web Payments SDK to generate the nonce
      const testNonce = 'cnon:card-nonce-ok'; // Square sandbox test nonce
      
      const paymentAmount = parseInt(amount as string) || (
        bookingType === 'private' 
          ? cruise.pricing.private_price * 100 
          : cruise.pricing.cabin_price * parseInt(passengers as string || '2') * 100
      );
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id: testNonce,
          amount: paymentAmount,
          currency: 'EUR',
          cruise_id: cruiseId,
          cruise_name: cruise.name_fr,
          customer_email: customerEmail,
          customer_name: customerName,
          passengers: parseInt(passengers as string) || 2,
          selected_date: selectedDate || null,
          booking_type: bookingType || 'cabin',
          note: `Téléphone: ${customerPhone}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentSuccess(true);
        setReceiptUrl(result.receipt_url);
      } else {
        Alert.alert('Erreur de paiement', result.detail || 'Le paiement a échoué');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (paymentSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Paiement Réussi !</Text>
          <Text style={styles.successSubtitle}>
            Votre réservation pour {cruise?.name_fr} est confirmée.
          </Text>
          
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationLabel}>Détails de la réservation</Text>
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationKey}>Croisière:</Text>
              <Text style={styles.confirmationValue}>{cruise?.name_fr}</Text>
            </View>
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationKey}>Date:</Text>
              <Text style={styles.confirmationValue}>{selectedDate || 'À confirmer'}</Text>
            </View>
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationKey}>Passagers:</Text>
              <Text style={styles.confirmationValue}>{passengers || 2}</Text>
            </View>
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationKey}>Type:</Text>
              <Text style={styles.confirmationValue}>
                {bookingType === 'private' ? 'Privatisation' : 'Cabine'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.confirmationNote}>
            Un email de confirmation a été envoyé à {customerEmail}
          </Text>
          
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.returnButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const paymentAmount = parseInt(amount as string) || (
    bookingType === 'private' 
      ? (cruise?.pricing.private_price || 0)
      : (cruise?.pricing.cabin_price || 0) * parseInt(passengers as string || '2')
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement Sécurisé</Text>
        <View style={styles.headerRight}>
          <Ionicons name="lock-closed" size={20} color={COLORS.success} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{cruise?.name_fr}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {bookingType === 'private' ? 'Privatisation complète' : `${passengers || 2} passager(s)`}
            </Text>
          </View>
          {selectedDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date: {selectedDate}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalAmount}>{paymentAmount.toLocaleString('fr-FR')} €</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vos informations</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={[styles.input, errors.customerName && styles.inputError]}
              placeholder="Jean Dupont"
              value={customerName}
              onChangeText={setCustomerName}
            />
            {errors.customerName && (
              <Text style={styles.errorText}>{errors.customerName}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[styles.input, errors.customerEmail && styles.inputError]}
              placeholder="jean@exemple.com"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.customerEmail && (
              <Text style={styles.errorText}>{errors.customerEmail}</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+33 6 12 34 56 78"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Card Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Carte bancaire</Text>
          
          {paymentConfig?.environment === 'sandbox' && (
            <View style={styles.sandboxNotice}>
              <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.sandboxText}>
                Mode test - Utilisez 4532 0123 4567 8901
              </Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numéro de carte *</Text>
            <View style={styles.cardInputContainer}>
              <TextInput
                style={[styles.input, styles.cardInput, errors.cardNumber && styles.inputError]}
                placeholder="4532 0123 4567 8901"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
              <View style={styles.cardIcons}>
                <Ionicons name="card" size={24} color={COLORS.textSecondary} />
              </View>
            </View>
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
              <Text style={styles.inputLabel}>Expiration *</Text>
              <TextInput
                style={[styles.input, errors.cardExpiry && styles.inputError]}
                placeholder="MM/AA"
                value={cardExpiry}
                onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.cardExpiry && (
                <Text style={styles.errorText}>{errors.cardExpiry}</Text>
              )}
            </View>
            
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV *</Text>
              <TextInput
                style={[styles.input, errors.cardCvv && styles.inputError]}
                placeholder="123"
                value={cardCvv}
                onChangeText={setCardCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              {errors.cardCvv && (
                <Text style={styles.errorText}>{errors.cardCvv}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
          <Text style={styles.securityText}>
            Paiement sécurisé par Square. Vos données sont cryptées et protégées.
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color={COLORS.white} />
              <Text style={styles.payButtonText}>
                Payer {paymentAmount.toLocaleString('fr-FR')} €
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerRight: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cardInputContainer: {
    position: 'relative',
  },
  cardInput: {
    paddingRight: 50,
  },
  cardIcons: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  sandboxNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  sandboxText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: '#92400E',
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  securityText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: '#065F46',
    flex: 1,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  confirmationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  confirmationLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  confirmationKey: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  confirmationValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmationNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  returnButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
  },
  returnButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
