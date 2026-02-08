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
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppStore } from '../src/store/appStore';
import { postApi, memberApi, CommunityPost } from '../src/services/api';

const CATEGORIES = ['all', 'general', 'trip_report', 'tips', 'meetup'];

export default function ClubScreen() {
  const { t, language } = useTranslation();
  const { currentMember, setCurrentMember } = useAppStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newComment, setNewComment] = useState('');

  // Form states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await postApi.getAll(category);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'all':
        return t('allPosts');
      case 'general':
        return t('general');
      case 'trip_report':
        return t('tripReports');
      case 'tips':
        return t('tips');
      case 'meetup':
        return t('meetups');
      default:
        return category;
    }
  };

  const handleJoinClub = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const member = await memberApi.create({
        username: username.trim(),
        email: email.trim(),
        bio_fr: bio.trim(),
        bio_en: bio.trim(),
      });
      setCurrentMember(member);
      setShowJoinModal(false);
      setUsername('');
      setEmail('');
      setBio('');
      Alert.alert('Bienvenue!', 'Vous faites maintenant partie du Club des Voyageurs!');
    } catch (error: any) {
      if (error.response?.data?.detail === 'Email already registered') {
        // Try to get existing member
        try {
          const existingMember = await memberApi.getByEmail(email.trim());
          setCurrentMember(existingMember);
          setShowJoinModal(false);
          Alert.alert('Content de vous revoir!', 'Vous êtes reconnecté au club.');
        } catch (e) {
          Alert.alert('Erreur', 'Cet email est déjà utilisé');
        }
      } else {
        Alert.alert('Erreur', 'Impossible de créer votre compte');
      }
    }
  };

  const handleCreatePost = async () => {
    if (!currentMember) {
      setShowJoinModal(true);
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le contenu');
      return;
    }

    try {
      await postApi.create({
        author_id: currentMember.id,
        author_name: currentMember.username,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory,
      });
      setShowNewPostModal(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      loadPosts();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la publication');
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentMember) {
      setShowJoinModal(true);
      return;
    }

    try {
      await postApi.toggleLike(postId, currentMember.id);
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!currentMember || !selectedPost || !newComment.trim()) return;

    try {
      await postApi.addComment(selectedPost.id, {
        author_id: currentMember.id,
        author_name: currentMember.username,
        content: newComment.trim(),
      });
      setNewComment('');
      const updatedPost = await postApi.getById(selectedPost.id);
      setSelectedPost(updatedPost);
      loadPosts();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    }
  };

  const openComments = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('clubTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('clubSubtitle')}</Text>
        </View>
        {currentMember ? (
          <View style={styles.memberBadge}>
            <Ionicons name="person-circle" size={24} color={COLORS.primary} />
            <Text style={styles.memberName}>{currentMember.username}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={() => setShowJoinModal(true)}>
            <Text style={styles.joinButtonText}>{t('joinClub')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat && styles.categoryButtonTextActive,
              ]}
            >
              {getCategoryLabel(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.postsContainer}
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Aucune publication pour le moment</Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.authorInfo}>
                    <View style={styles.authorAvatar}>
                      <Ionicons name="person" size={20} color={COLORS.white} />
                    </View>
                    <View>
                      <Text style={styles.authorName}>{post.author_name}</Text>
                      <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{getCategoryLabel(post.category)}</Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent}>{post.content}</Text>

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleLike(post.id)}
                  >
                    <Ionicons
                      name={currentMember && post.likes.includes(currentMember.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={
                        currentMember && post.likes.includes(currentMember.id)
                          ? COLORS.error
                          : COLORS.textSecondary
                      }
                    />
                    <Text style={styles.actionText}>{post.likes.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openComments(post)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.actionText}>
                      {post.comments.length} {t('comments')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      )}

      {/* FAB for new post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => (currentMember ? setShowNewPostModal(true) : setShowJoinModal(true))}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Join Modal */}
      <Modal visible={showJoinModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('joinClub')}</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('username')}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('bio')}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textLight}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleJoinClub}>
              <Text style={styles.submitButtonText}>{t('register')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* New Post Modal */}
      <Modal visible={showNewPostModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('newPost')}</Text>
              <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('postTitle')}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('postContent')}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={5}
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.inputLabel}>{t('selectCategory')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelect}>
              {CATEGORIES.filter((c) => c !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    newPostCategory === cat && styles.categoryOptionActive,
                  ]}
                  onPress={() => setNewPostCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      newPostCategory === cat && styles.categoryOptionTextActive,
                    ]}
                  >
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
              <Text style={styles.submitButtonText}>{t('publish')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={showCommentsModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, styles.commentsModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('comments')}</Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {selectedPost?.comments.length === 0 ? (
                <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
              ) : (
                selectedPost?.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.author_name}</Text>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {currentMember && (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={t('writeComment')}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholderTextColor={COLORS.textLight}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  memberName: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    marginRight: SPACING.sm,
    alignSelf: 'flex-start',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  authorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  postDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  postContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  commentsModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  categorySelect: {
    marginBottom: SPACING.lg,
  },
  categoryOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    marginRight: SPACING.sm,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryOptionTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  commentsList: {
    maxHeight: 300,
  },
  noComments: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: SPACING.xl,
  },
  commentItem: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  commentAuthor: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  commentDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
