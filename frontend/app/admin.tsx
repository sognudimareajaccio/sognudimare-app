import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminApi, Cruise, CommunityPost, Member, DirectMessage } from '../src/services/api';
import { useAppStore } from '../src/store/appStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/theme/theme';

type AdminTab = 'cruises' | 'posts' | 'members' | 'messages';

export default function AdminScreen() {
  const router = useRouter();
  const { language } = useAppStore();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<AdminTab>('cruises');
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCruise, setEditingCruise] = useState<Cruise | null>(null);
  const [editForm, setEditForm] = useState({
    name_fr: '',
    name_en: '',
    description_fr: '',
    description_en: '',
    duration: '',
    departure_port: '',
    cabin_price: '',
    private_price: '',
    image_url: '',
  });

  const t = (key: string) => {
    const translations: { [key: string]: { fr: string; en: string } } = {
      backOffice: { fr: 'Back-Office', en: 'Admin Panel' },
      login: { fr: 'Connexion', en: 'Login' },
      username: { fr: 'Nom d\'utilisateur', en: 'Username' },
      password: { fr: 'Mot de passe', en: 'Password' },
      loginButton: { fr: 'Se connecter', en: 'Log in' },
      invalidCredentials: { fr: 'Identifiants incorrects', en: 'Invalid credentials' },
      cruises: { fr: 'Croisières', en: 'Cruises' },
      posts: { fr: 'Publications', en: 'Posts' },
      members: { fr: 'Membres', en: 'Members' },
      messages: { fr: 'Messages', en: 'Messages' },
      edit: { fr: 'Modifier', en: 'Edit' },
      delete: { fr: 'Supprimer', en: 'Delete' },
      ban: { fr: 'Bannir', en: 'Ban' },
      unban: { fr: 'Débannir', en: 'Unban' },
      save: { fr: 'Enregistrer', en: 'Save' },
      cancel: { fr: 'Annuler', en: 'Cancel' },
      confirmDelete: { fr: 'Confirmer la suppression ?', en: 'Confirm deletion?' },
      noCruises: { fr: 'Aucune croisière', en: 'No cruises' },
      noPosts: { fr: 'Aucune publication', en: 'No posts' },
      noMembers: { fr: 'Aucun membre', en: 'No members' },
      noMessages: { fr: 'Aucun message', en: 'No messages' },
      name: { fr: 'Nom', en: 'Name' },
      description: { fr: 'Description', en: 'Description' },
      duration: { fr: 'Durée', en: 'Duration' },
      departurePort: { fr: 'Port de départ', en: 'Departure Port' },
      cabinPrice: { fr: 'Prix cabine', en: 'Cabin Price' },
      privatePrice: { fr: 'Prix privatisation', en: 'Private Price' },
      imageUrl: { fr: 'URL de l\'image', en: 'Image URL' },
      logout: { fr: 'Déconnexion', en: 'Logout' },
    };
    return translations[key]?.[language] || key;
  };

  const handleLogin = async () => {
    setLoginError('');
    setLoading(true);
    try {
      const result = await adminApi.login(username, password);
      if (result.success) {
        setIsLoggedIn(true);
        fetchData();
      }
    } catch (error) {
      setLoginError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cruisesData, postsData, membersData, messagesData] = await Promise.all([
        adminApi.getCruises(),
        adminApi.getPosts(),
        adminApi.getMembers(),
        adminApi.getMessages(),
      ]);
      setCruises(cruisesData);
      setPosts(postsData);
      setMembers(membersData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditCruise = (cruise: Cruise) => {
    setEditingCruise(cruise);
    setEditForm({
      name_fr: cruise.name_fr,
      name_en: cruise.name_en,
      description_fr: cruise.description_fr,
      description_en: cruise.description_en,
      duration: cruise.duration,
      departure_port: cruise.departure_port,
      cabin_price: cruise.pricing.cabin_price?.toString() || '',
      private_price: cruise.pricing.private_price?.toString() || '',
      image_url: cruise.image_url,
    });
    setShowEditModal(true);
  };

  const handleSaveCruise = async () => {
    if (!editingCruise) return;
    
    try {
      await adminApi.updateCruise(editingCruise.id, {
        name_fr: editForm.name_fr,
        name_en: editForm.name_en,
        description_fr: editForm.description_fr,
        description_en: editForm.description_en,
        duration: editForm.duration,
        departure_port: editForm.departure_port,
        image_url: editForm.image_url,
        pricing: {
          cabin_price: editForm.cabin_price ? parseFloat(editForm.cabin_price) : null,
          private_price: editForm.private_price ? parseFloat(editForm.private_price) : null,
          currency: 'EUR',
        },
      });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving cruise:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      t('confirmDelete'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deletePost(postId);
              fetchData();
            } catch (error) {
              console.error('Error deleting post:', error);
            }
          },
        },
      ]
    );
  };

  const handleBanMember = async (memberId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await adminApi.unbanMember(memberId);
      } else {
        await adminApi.banMember(memberId);
      }
      fetchData();
    } catch (error) {
      console.error('Error banning/unbanning member:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      t('confirmDelete'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteMessage(messageId);
              fetchData();
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          },
        },
      ]
    );
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.loginIcon}>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.loginTitle}>{t('backOffice')}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={t('username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={COLORS.textSecondary}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.textSecondary}
          />
          
          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>{t('loginButton')}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backLinkText}>
              {language === 'fr' ? 'Retour à l\'application' : 'Back to app'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Admin Panel
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('backOffice')}</Text>
        <TouchableOpacity 
          onPress={() => setIsLoggedIn(false)} 
          style={styles.headerButton}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {(['cruises', 'posts', 'members', 'messages'] as AdminTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={
                tab === 'cruises' ? 'boat' :
                tab === 'posts' ? 'chatbubbles' :
                tab === 'members' ? 'people' : 'mail'
              }
              size={20}
              color={activeTab === tab ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'cruises' ? (
          // Cruises Tab
          cruises.length === 0 ? (
            <Text style={styles.emptyText}>{t('noCruises')}</Text>
          ) : (
            cruises.map((cruise) => (
              <View key={cruise.id} style={styles.itemCard}>
                <Image source={{ uri: cruise.image_url }} style={styles.cruiseImage} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{cruise.name_fr}</Text>
                  <Text style={styles.itemSubtitle}>{cruise.duration} • {cruise.departure_port}</Text>
                  <Text style={styles.itemPrice}>
                    {cruise.pricing.cabin_price ? `${cruise.pricing.cabin_price}€/pers` : ''}
                    {cruise.pricing.cabin_price && cruise.pricing.private_price ? ' • ' : ''}
                    {cruise.pricing.private_price ? `${cruise.pricing.private_price}€ priv.` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditCruise(cruise)}
                >
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : activeTab === 'posts' ? (
          // Posts Tab
          posts.length === 0 ? (
            <Text style={styles.emptyText}>{t('noPosts')}</Text>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{post.title}</Text>
                  <Text style={styles.itemSubtitle}>
                    {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.itemText} numberOfLines={2}>{post.content}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePost(post.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : activeTab === 'members' ? (
          // Members Tab
          members.length === 0 ? (
            <Text style={styles.emptyText}>{t('noMembers')}</Text>
          ) : (
            members.map((member: any) => (
              <View key={member.id} style={styles.itemCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{member.username}</Text>
                  <Text style={styles.itemSubtitle}>{member.email}</Text>
                  {member.is_banned && (
                    <Text style={styles.bannedBadge}>BANNI</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.banButton, member.is_banned && styles.unbanButton]}
                  onPress={() => handleBanMember(member.id, member.is_banned)}
                >
                  <Text style={[styles.banButtonText, member.is_banned && styles.unbanButtonText]}>
                    {member.is_banned ? t('unban') : t('ban')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          // Messages Tab
          messages.length === 0 ? (
            <Text style={styles.emptyText}>{t('noMessages')}</Text>
          ) : (
            messages.map((message) => (
              <View key={message.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>
                    {message.sender_name} → {message.receiver_name}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {new Date(message.created_at).toLocaleString()}
                  </Text>
                  <Text style={styles.itemText}>{message.content}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMessage(message.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('edit')}: {editingCruise?.name_fr}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>{t('name')} (FR)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name_fr}
                onChangeText={(text) => setEditForm({ ...editForm, name_fr: text })}
              />
              
              <Text style={styles.inputLabel}>{t('name')} (EN)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name_en}
                onChangeText={(text) => setEditForm({ ...editForm, name_en: text })}
              />
              
              <Text style={styles.inputLabel}>{t('duration')}</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.duration}
                onChangeText={(text) => setEditForm({ ...editForm, duration: text })}
              />
              
              <Text style={styles.inputLabel}>{t('departurePort')}</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.departure_port}
                onChangeText={(text) => setEditForm({ ...editForm, departure_port: text })}
              />
              
              <Text style={styles.inputLabel}>{t('cabinPrice')} (€)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.cabin_price}
                onChangeText={(text) => setEditForm({ ...editForm, cabin_price: text })}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>{t('privatePrice')} (€)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.private_price}
                onChangeText={(text) => setEditForm({ ...editForm, private_price: text })}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>{t('imageUrl')}</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.image_url}
                onChangeText={(text) => setEditForm({ ...editForm, image_url: text })}
              />
              
              <Text style={styles.inputLabel}>{t('description')} (FR)</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={editForm.description_fr}
                onChangeText={(text) => setEditForm({ ...editForm, description_fr: text })}
                multiline
              />
              
              <Text style={styles.inputLabel}>{t('description')} (EN)</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={editForm.description_en}
                onChangeText={(text) => setEditForm({ ...editForm, description_en: text })}
                multiline
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCruise}
              >
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Login
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loginIcon: {
    marginBottom: SPACING.lg,
  },
  loginTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  backLinkText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Tabs
  tabsScroll: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    marginTop: 40,
  },
  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cruiseImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
  },
  itemContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  itemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
  },
  deleteButton: {
    padding: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: BORDER_RADIUS.md,
  },
  // Members
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  bannedBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '700',
    marginTop: 4,
  },
  banButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: BORDER_RADIUS.md,
  },
  unbanButton: {
    backgroundColor: '#D1FAE5',
  },
  banButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  unbanButtonText: {
    color: COLORS.success,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  modalScroll: {
    padding: SPACING.lg,
    maxHeight: 500,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
