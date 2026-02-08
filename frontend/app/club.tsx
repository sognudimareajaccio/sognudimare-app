import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { postApi, memberApi, messageApi, CommunityPost, DirectMessage, CaptainInfo } from '../src/services/api';
import { useAppStore } from '../src/store/appStore';

// Theme constants inline to avoid import issues
const COLORS = {
  primary: '#0e1c40',
  secondary: '#ebd0a9',
  accent: '#7ad2d4',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  text: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  gray: '#919191',
  border: '#E5E7EB',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Club Card formulas from website
const CLUB_FORMULAS = [
  { id: '12', months: 12, price: 90, discount: 10, name_fr: 'Carte 12 mois', name_en: '12 months card' },
  { id: '24', months: 24, price: 150, discount: 15, name_fr: 'Carte 24 mois', name_en: '24 months card' },
  { id: '36', months: 36, price: 140, discount: 20, name_fr: 'Carte 36 mois', name_en: '36 months card' },
];

// Club advantages from website
const CLUB_ADVANTAGES_FR = [
  'Jusqu\'à 20% de réduction sur toutes les croisières',
  'Priorité de réservation sur les dates les plus demandées',
  'Accès exclusif aux offres de dernière minute',
  'Newsletter mensuelle avec conseils de voyage',
  'Invitations aux événements exclusifs Sognudimare',
  'Communauté de passionnés pour échanger et se retrouver',
  'Contact direct avec le Capitaine',
];

const CLUB_ADVANTAGES_EN = [
  'Up to 20% discount on all cruises',
  'Priority booking on the most requested dates',
  'Exclusive access to last-minute offers',
  'Monthly newsletter with travel tips',
  'Invitations to exclusive Sognudimare events',
  'Community of enthusiasts to exchange and meet',
  'Direct contact with the Captain',
];

// Categories
const CATEGORIES = [
  { id: 'all', name_fr: 'Tout', name_en: 'All', icon: 'apps' },
  { id: 'general', name_fr: 'Général', name_en: 'General', icon: 'chatbubbles' },
  { id: 'trip_report', name_fr: 'Récits', name_en: 'Trip Reports', icon: 'boat' },
  { id: 'tips', name_fr: 'Conseils', name_en: 'Tips', icon: 'bulb' },
  { id: 'meetup', name_fr: 'Rencontres', name_en: 'Meetups', icon: 'people' },
];

// Tabs
type TabType = 'info' | 'community' | 'messages';

export default function ClubScreen() {
  const router = useRouter();
  const { language } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // User simulation (in production, use real auth)
  const [currentUser] = useState({
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: 'Voyageur',
  });
  
  // New post
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  
  // Messaging
  const [captainInfo, setCaptainInfo] = useState<CaptainInfo | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatWith, setChatWith] = useState<'captain' | 'community'>('captain');
  
  const t = (key: string) => {
    const translations: { [key: string]: { fr: string; en: string } } = {
      clubTitle: { fr: 'Club des Voyageurs', en: 'Travelers Club' },
      info: { fr: 'Infos', en: 'Info' },
      community: { fr: 'Communauté', en: 'Community' },
      messages: { fr: 'Messages', en: 'Messages' },
      joinClub: { fr: 'Rejoindre le Club', en: 'Join the Club' },
      clubDescription: { 
        fr: 'Le Club des Voyageurs Sognudimare vous offre des avantages exclusifs et une communauté de passionnés de la mer.',
        en: 'The Sognudimare Travelers Club offers you exclusive benefits and a community of sea enthusiasts.'
      },
      howItWorks: { fr: 'Comment ça marche ?', en: 'How does it work?' },
      howItWorksDesc: {
        fr: 'Choisissez votre formule, réglez votre carte et profitez immédiatement des réductions sur votre prochaine croisière !',
        en: 'Choose your plan, pay for your card and immediately enjoy discounts on your next cruise!'
      },
      ourFormulas: { fr: 'Nos formules', en: 'Our plans' },
      advantages: { fr: 'Vos avantages', en: 'Your benefits' },
      discount: { fr: 'de réduction', en: 'discount' },
      perYear: { fr: '/an', en: '/year' },
      newPost: { fr: 'Nouveau post', en: 'New Post' },
      title: { fr: 'Titre', en: 'Title' },
      content: { fr: 'Contenu', en: 'Content' },
      publish: { fr: 'Publier', en: 'Publish' },
      cancel: { fr: 'Annuler', en: 'Cancel' },
      captain: { fr: 'Capitaine', en: 'Captain' },
      talkToCaptain: { fr: 'Parler au Capitaine', en: 'Talk to Captain' },
      communityChat: { fr: 'Discussion Voyageurs', en: 'Travelers Chat' },
      sendMessage: { fr: 'Envoyer', en: 'Send' },
      typeMessage: { fr: 'Votre message...', en: 'Your message...' },
      noMessages: { fr: 'Aucun message. Commencez la conversation !', en: 'No messages. Start the conversation!' },
      noPosts: { fr: 'Aucun post dans cette catégorie.', en: 'No posts in this category.' },
      likes: { fr: 'J\'aime', en: 'Likes' },
      comments: { fr: 'Commentaires', en: 'Comments' },
    };
    return translations[key]?.[language] || key;
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postApi.getAll(selectedCategory === 'all' ? undefined : selectedCategory);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCaptainInfo = useCallback(async () => {
    try {
      const info = await messageApi.getCaptainInfo();
      setCaptainInfo(info);
    } catch (error) {
      console.error('Error fetching captain info:', error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!captainInfo) return;
    try {
      const data = await messageApi.getMessages(currentUser.id, captainInfo.id);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentUser.id, captainInfo]);

  useEffect(() => {
    fetchPosts();
    fetchCaptainInfo();
  }, [fetchPosts, fetchCaptainInfo]);

  useEffect(() => {
    if (activeTab === 'messages' && captainInfo) {
      fetchMessages();
    }
  }, [activeTab, captainInfo, fetchMessages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    try {
      await postApi.create({
        author_id: currentUser.id,
        author_name: currentUser.name,
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
      });
      setShowNewPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await postApi.toggleLike(postId, currentUser.id);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !captainInfo) return;
    
    try {
      await messageApi.sendMessage({
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        receiver_id: captainInfo.id,
        receiver_name: captainInfo.name,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Info Tab Content
  const renderInfoTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Ionicons name="people-circle" size={60} color={COLORS.secondary} />
        </View>
        <Text style={styles.heroTitle}>{t('clubTitle')}</Text>
        <Text style={styles.heroDescription}>{t('clubDescription')}</Text>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
        <View style={styles.howItWorksCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>
              {language === 'fr' ? 'Choisissez votre formule (12, 24 ou 36 mois)' : 'Choose your plan (12, 24 or 36 months)'}
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>
              {language === 'fr' ? 'Réglez votre carte Club' : 'Pay for your Club card'}
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>
              {language === 'fr' ? 'Profitez immédiatement des réductions !' : 'Immediately enjoy discounts!'}
            </Text>
          </View>
        </View>
      </View>

      {/* Formulas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ourFormulas')}</Text>
        <View style={styles.formulasContainer}>
          {CLUB_FORMULAS.map((formula) => (
            <View key={formula.id} style={styles.formulaCard}>
              <View style={styles.formulaHeader}>
                <Text style={styles.formulaMonths}>{formula.months}</Text>
                <Text style={styles.formulaMonthsLabel}>{language === 'fr' ? 'mois' : 'months'}</Text>
              </View>
              <View style={styles.formulaDiscount}>
                <Text style={styles.formulaDiscountText}>-{formula.discount}%</Text>
              </View>
              <Text style={styles.formulaPrice}>{formula.price}€{t('perYear')}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Advantages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('advantages')}</Text>
        <View style={styles.advantagesContainer}>
          {(language === 'fr' ? CLUB_ADVANTAGES_FR : CLUB_ADVANTAGES_EN).map((advantage, index) => (
            <View key={index} style={styles.advantageRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.advantageText}>{advantage}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Join Button */}
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => router.push('/booking')}
      >
        <Text style={styles.joinButtonText}>{t('joinClub')}</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Community Tab Content
  const renderCommunityTab = () => (
    <View style={styles.tabContent}>
      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? COLORS.white : COLORS.primary}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === cat.id && styles.categoryChipTextActive,
            ]}>
              {language === 'fr' ? cat.name_fr : cat.name_en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={60} color={COLORS.gray} />
          <Text style={styles.emptyStateText}>{t('noPosts')}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>
                    {item.author_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.postAuthorInfo}>
                  <Text style={styles.postAuthorName}>{item.author_name}</Text>
                  <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postContent}>{item.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity 
                  style={styles.postAction}
                  onPress={() => handleLikePost(item.id)}
                >
                  <Ionicons 
                    name={item.likes.includes(currentUser.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={item.likes.includes(currentUser.id) ? COLORS.error : COLORS.textSecondary} 
                  />
                  <Text style={styles.postActionText}>{item.likes.length}</Text>
                </TouchableOpacity>
                <View style={styles.postAction}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.postActionText}>{item.comments.length}</Text>
                </View>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* New Post Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setShowNewPost(true)}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal visible={showNewPost} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('newPost')}</Text>
              <TouchableOpacity onPress={() => setShowNewPost(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('title')}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholderTextColor={COLORS.textSecondary}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('content')}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textSecondary}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelect}>
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    newPostCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setNewPostCategory(cat.id)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newPostCategory === cat.id && styles.categoryChipTextActive,
                  ]}>
                    {language === 'fr' ? cat.name_fr : cat.name_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNewPost(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.publishButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.publishButtonText}>{t('publish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );

  // Messages Tab Content
  const renderMessagesTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tabContent}
    >
      {/* Chat Type Selector */}
      <View style={styles.chatTypeSelector}>
        <TouchableOpacity
          style={[styles.chatTypeButton, chatWith === 'captain' && styles.chatTypeButtonActive]}
          onPress={() => setChatWith('captain')}
        >
          <Ionicons 
            name="boat" 
            size={20} 
            color={chatWith === 'captain' ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.chatTypeButtonText,
            chatWith === 'captain' && styles.chatTypeButtonTextActive
          ]}>
            {t('talkToCaptain')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chatTypeButton, chatWith === 'community' && styles.chatTypeButtonActive]}
          onPress={() => setChatWith('community')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={chatWith === 'community' ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.chatTypeButtonText,
            chatWith === 'community' && styles.chatTypeButtonTextActive
          ]}>
            {t('communityChat')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender_id === currentUser.id ? styles.messageBubbleSent : styles.messageBubbleReceived,
          ]}>
            {item.sender_id !== currentUser.id && (
              <Text style={styles.messageSender}>{item.sender_name}</Text>
            )}
            <Text style={[
              styles.messageText,
              item.sender_id === currentUser.id && styles.messageTextSent,
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.messageTime,
              item.sender_id === currentUser.id && styles.messageTimeSent,
            ]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={60} color={COLORS.gray} />
            <Text style={styles.emptyStateText}>{t('noMessages')}</Text>
          </View>
        }
        contentContainerStyle={{ padding: SPACING.md, flexGrow: 1 }}
        inverted={messages.length > 0}
      />

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder={t('typeMessage')}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor={COLORS.textSecondary}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('clubTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={activeTab === 'info' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            {t('info')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'community' && styles.tabActive]}
          onPress={() => setActiveTab('community')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'community' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
            {t('community')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={20} 
            color={activeTab === 'messages' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            {t('messages')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'community' && renderCommunityTab()}
      {activeTab === 'messages' && renderMessagesTab()}
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
    paddingVertical: SPACING.sm,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  heroDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  // Sections
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  // How it works
  howItWorksCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  // Formulas
  formulasContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formulaCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  formulaMonths: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  formulaMonthsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  formulaDiscount: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  formulaDiscountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  formulaPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  // Advantages
  advantagesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  advantageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  advantageText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  // Join Button
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  joinButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Categories
  categoriesScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  // Posts
  postCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  postAuthorInfo: {
    marginLeft: SPACING.sm,
  },
  postAuthorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  postDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  postTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  postContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.lg,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  postActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  // FAB
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelect: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
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
  publishButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Chat Type Selector
  chatTypeSelector: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  chatTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    gap: SPACING.xs,
  },
  chatTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  chatTypeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  chatTypeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // Messages
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  messageBubbleSent: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  messageTextSent: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeSent: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
