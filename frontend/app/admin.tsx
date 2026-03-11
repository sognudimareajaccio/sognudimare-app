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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminApi, Cruise, CommunityPost, Member, DirectMessage, CruiseAvailability } from '../src/services/api';
import { useAppStore } from '../src/store/appStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/theme/theme';

type AdminTab = 'cruises' | 'posts' | 'members' | 'messages';

const TAB_CONFIG = [
  { key: 'cruises' as AdminTab, icon: 'sail-boat', label: 'Croisieres', ionicon: false },
  { key: 'posts' as AdminTab, icon: 'chatbubbles', label: 'Publications', ionicon: true },
  { key: 'members' as AdminTab, icon: 'people', label: 'Membres', ionicon: true },
  { key: 'messages' as AdminTab, icon: 'mail', label: 'Messages', ionicon: true },
];

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
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCruise, setEditingCruise] = useState<Cruise | null>(null);
  const [editForm, setEditForm] = useState({
    name_fr: '', name_en: '', description_fr: '', description_en: '',
    duration: '', departure_port: '', cabin_price: '', private_price: '', image_url: '',
  });
  
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingAvailabilityCruise, setEditingAvailabilityCruise] = useState<Cruise | null>(null);
  const [editingAvailabilityIndex, setEditingAvailabilityIndex] = useState<number | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    date_range: '', price: '', status: 'available', remaining_places: '',
  });

  const handleLogin = async () => {
    setLoginError('');
    setLoading(true);
    try {
      const result = await adminApi.login(username, password);
      if (result.success) { setIsLoggedIn(true); fetchData(); }
    } catch (error) { setLoginError('Identifiants incorrects'); }
    finally { setLoading(false); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cruisesData, postsData, membersData, messagesData] = await Promise.all([
        adminApi.getCruises(), adminApi.getPosts(), adminApi.getMembers(), adminApi.getMessages(),
      ]);
      setCruises(cruisesData); setPosts(postsData); setMembers(membersData); setMessages(messagesData);
    } catch (error) { console.error('Error fetching data:', error); }
    finally { setLoading(false); }
  }, []);

  const handleEditCruise = (cruise: Cruise) => {
    setEditingCruise(cruise);
    setEditForm({
      name_fr: cruise.name_fr, name_en: cruise.name_en,
      description_fr: cruise.description_fr, description_en: cruise.description_en,
      duration: cruise.duration, departure_port: cruise.departure_port,
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
        name_fr: editForm.name_fr, name_en: editForm.name_en,
        description_fr: editForm.description_fr, description_en: editForm.description_en,
        duration: editForm.duration, departure_port: editForm.departure_port,
        image_url: editForm.image_url,
        pricing: {
          cabin_price: editForm.cabin_price ? parseFloat(editForm.cabin_price) : null,
          private_price: editForm.private_price ? parseFloat(editForm.private_price) : null,
          currency: 'EUR',
        },
      });
      setShowEditModal(false); fetchData();
      Alert.alert('Succes', 'Croisiere mise a jour');
    } catch (error) { Alert.alert('Erreur', 'Impossible de sauvegarder'); }
  };

  const handleDeleteCruise = async (cruiseId: string, cruiseName: string) => {
    Alert.alert('Confirmer la suppression ?', `Supprimer "${cruiseName}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await adminApi.deleteCruise(cruiseId); fetchData(); }
        catch (error) { Alert.alert('Erreur', 'Impossible de supprimer'); }
      }},
    ]);
  };

  const handleToggleCruiseActive = async (cruiseId: string) => {
    try { await adminApi.toggleCruiseActive(cruiseId); fetchData(); }
    catch (error) { console.error('Error toggling cruise:', error); }
  };

  const handleOpenAvailabilities = (cruise: Cruise) => {
    setEditingAvailabilityCruise(cruise);
    setEditingAvailabilityIndex(null);
    setAvailabilityForm({ date_range: '', price: '', status: 'available', remaining_places: '8' });
    setShowAvailabilityModal(true);
  };

  const handleEditAvailability = (index: number) => {
    if (!editingAvailabilityCruise) return;
    const availability = editingAvailabilityCruise.availabilities?.[index];
    if (availability) {
      setEditingAvailabilityIndex(index);
      setAvailabilityForm({
        date_range: availability.date_range, price: availability.price.toString(),
        status: availability.status, remaining_places: availability.remaining_places?.toString() || '8',
      });
    }
  };

  const handleSaveAvailability = async () => {
    if (!editingAvailabilityCruise) return;
    const availability: CruiseAvailability = {
      date_range: availabilityForm.date_range, price: parseFloat(availabilityForm.price),
      status: availabilityForm.status as 'available' | 'limited' | 'full',
      remaining_places: parseInt(availabilityForm.remaining_places) || 8,
    };
    try {
      if (editingAvailabilityIndex !== null) {
        await adminApi.updateAvailability(editingAvailabilityCruise.id, editingAvailabilityIndex, availability);
      } else {
        await adminApi.addAvailability(editingAvailabilityCruise.id, availability);
      }
      const updatedCruises = await adminApi.getCruises();
      setCruises(updatedCruises);
      const updatedCruise = updatedCruises.find(c => c.id === editingAvailabilityCruise.id);
      if (updatedCruise) setEditingAvailabilityCruise(updatedCruise);
      setEditingAvailabilityIndex(null);
      setAvailabilityForm({ date_range: '', price: '', status: 'available', remaining_places: '8' });
      Alert.alert('Succes', 'Disponibilite mise a jour');
    } catch (error) { Alert.alert('Erreur', 'Impossible de sauvegarder'); }
  };

  const handleDeleteAvailability = async (index: number) => {
    if (!editingAvailabilityCruise) return;
    Alert.alert('Supprimer cette date ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await adminApi.deleteAvailability(editingAvailabilityCruise.id, index);
          const updatedCruises = await adminApi.getCruises();
          setCruises(updatedCruises);
          const updatedCruise = updatedCruises.find(c => c.id === editingAvailabilityCruise.id);
          if (updatedCruise) setEditingAvailabilityCruise(updatedCruise);
        } catch (error) { console.error('Error deleting availability:', error); }
      }},
    ]);
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert('Confirmer ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await adminApi.deletePost(postId); fetchData(); } catch (error) {}
      }},
    ]);
  };

  const handleBanMember = async (memberId: string, isBanned: boolean) => {
    try {
      if (isBanned) await adminApi.unbanMember(memberId);
      else await adminApi.banMember(memberId);
      fetchData();
    } catch (error) {}
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert('Confirmer ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await adminApi.deleteMessage(messageId); fetchData(); } catch (error) {}
      }},
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) { case 'available': return '#10B981'; case 'limited': return '#F59E0B'; case 'full': return '#EF4444'; default: return '#999'; }
  };
  const getStatusLabel = (status: string) => {
    switch (status) { case 'available': return 'Disponible'; case 'limited': return 'Limite'; case 'full': return 'Complet'; default: return status; }
  };

  // ─────────── LOGIN SCREEN ───────────
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.loginSafe}>
        <View style={s.loginPage}>
          <View style={s.loginCard}>
            <View style={s.loginLogoWrap}>
              <View style={s.loginLogoBg}>
                <Ionicons name="shield-checkmark" size={36} color={COLORS.secondary} />
              </View>
            </View>
            <Text style={s.loginTitle}>Back-Office</Text>
            <Text style={s.loginSub}>Sognudimare</Text>

            <View style={s.inputGroup}>
              <Text style={s.fieldLabel}>Identifiant</Text>
              <View style={s.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                <TextInput style={s.fieldInput} placeholder="admin" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#bbb" />
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.fieldLabel}>Mot de passe</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                <TextInput style={s.fieldInput} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#bbb" />
              </View>
            </View>

            {loginError ? <Text style={s.loginErr}>{loginError}</Text> : null}

            <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.primary} /> : (
                <><Text style={s.loginBtnText}>Se connecter</Text><Ionicons name="arrow-forward" size={18} color={COLORS.primary} /></>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={s.backLinkText}>Retour a l'application</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────── ADMIN PANEL ───────────
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerLabel}>ADMINISTRATION</Text>
          <Text style={s.headerBrand}>Sognudimare</Text>
        </View>
        <TouchableOpacity onPress={() => setIsLoggedIn(false)} style={s.headerBtn}>
          <Ionicons name="log-out-outline" size={20} color="#FF8080" />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={s.statsBar}>
        {[
          { val: cruises.length, label: 'Croisieres', color: COLORS.secondary },
          { val: cruises.reduce((sum, c) => sum + (c.availabilities?.length || 0), 0), label: 'Dates', color: COLORS.accent },
          { val: members.length, label: 'Membres', color: '#10B981' },
          { val: posts.length, label: 'Posts', color: '#F59E0B' },
        ].map((stat, i) => (
          <View key={i} style={s.statItem}>
            <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={[s.tab, isActive && s.tabActive]} onPress={() => setActiveTab(tab.key)}>
              {tab.ionicon ? (
                <Ionicons name={tab.icon as any} size={20} color={isActive ? COLORS.primary : 'rgba(255,255,255,0.5)'} />
              ) : (
                <MaterialCommunityIcons name={tab.icon as any} size={20} color={isActive ? COLORS.primary : 'rgba(255,255,255,0.5)'} />
              )}
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 60 }} />
        ) : activeTab === 'cruises' ? (
          cruises.length === 0 ? <EmptyState text="Aucune croisiere" icon="boat-outline" /> : (
            cruises.map((cruise) => (
              <View key={cruise.id} style={[s.cruiseCard, !cruise.is_active && { opacity: 0.55 }]}>
                <Image source={{ uri: cruise.image_url }} style={s.cruiseImg} />
                <View style={s.cruiseBadgeRow}>
                  <View style={[s.badge, cruise.is_active ? s.badgeGreen : s.badgeRed]}>
                    <View style={[s.badgeDot, { backgroundColor: cruise.is_active ? '#10B981' : '#EF4444' }]} />
                    <Text style={[s.badgeText, { color: cruise.is_active ? '#10B981' : '#EF4444' }]}>
                      {cruise.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
                <View style={s.cruiseBody}>
                  <Text style={s.cruiseName}>{cruise.name_fr}</Text>
                  <View style={s.cruiseMetaRow}>
                    <View style={s.cruiseMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#999" />
                      <Text style={s.cruiseMetaText}>{cruise.duration}</Text>
                    </View>
                    <View style={s.cruiseMetaItem}>
                      <Ionicons name="location-outline" size={14} color="#999" />
                      <Text style={s.cruiseMetaText}>{cruise.departure_port}</Text>
                    </View>
                  </View>
                  <View style={s.cruisePriceRow}>
                    {cruise.pricing.cabin_price ? (
                      <View style={s.priceChip}>
                        <Text style={s.priceChipLabel}>Cabine</Text>
                        <Text style={s.priceChipVal}>{cruise.pricing.cabin_price} EUR</Text>
                      </View>
                    ) : null}
                    {cruise.pricing.private_price ? (
                      <View style={s.priceChip}>
                        <Text style={s.priceChipLabel}>Prive</Text>
                        <Text style={s.priceChipVal}>{cruise.pricing.private_price} EUR</Text>
                      </View>
                    ) : null}
                    <View style={s.priceChip}>
                      <Text style={s.priceChipLabel}>Dates</Text>
                      <Text style={[s.priceChipVal, { color: COLORS.accent }]}>{cruise.availabilities?.length || 0}</Text>
                    </View>
                  </View>
                  {/* Actions */}
                  <View style={s.actionRow}>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleEditCruise(cruise)}>
                      <Ionicons name="pencil" size={16} color={COLORS.secondary} />
                      <Text style={[s.actionText, { color: COLORS.secondary }]}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleOpenAvailabilities(cruise)}>
                      <Ionicons name="calendar" size={16} color={COLORS.accent} />
                      <Text style={[s.actionText, { color: COLORS.accent }]}>Dates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleToggleCruiseActive(cruise.id)}>
                      <Ionicons name={cruise.is_active ? 'eye-off' : 'eye'} size={16} color={cruise.is_active ? '#F59E0B' : '#10B981'} />
                      <Text style={[s.actionText, { color: cruise.is_active ? '#F59E0B' : '#10B981' }]}>
                        {cruise.is_active ? 'Masquer' : 'Activer'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, s.actionDanger]} onPress={() => handleDeleteCruise(cruise.id, cruise.name_fr)}>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? <EmptyState text="Aucune publication" icon="chatbubbles-outline" /> : (
            posts.map((post) => (
              <View key={post.id} style={s.listCard}>
                <View style={s.listCardIcon}><Ionicons name="document-text" size={20} color={COLORS.secondary} /></View>
                <View style={s.listCardBody}>
                  <Text style={s.listCardTitle}>{post.title}</Text>
                  <Text style={s.listCardSub}>{post.author_name} - {new Date(post.created_at).toLocaleDateString()}</Text>
                  <Text style={s.listCardDesc} numberOfLines={2}>{post.content}</Text>
                </View>
                <TouchableOpacity style={s.listCardDel} onPress={() => handleDeletePost(post.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : activeTab === 'members' ? (
          members.length === 0 ? <EmptyState text="Aucun membre" icon="people-outline" /> : (
            members.map((member: any) => (
              <View key={member.id} style={s.listCard}>
                <View style={s.memberAvatar}><Text style={s.memberAvatarText}>{member.username.charAt(0).toUpperCase()}</Text></View>
                <View style={s.listCardBody}>
                  <Text style={s.listCardTitle}>{member.username}</Text>
                  <Text style={s.listCardSub}>{member.email}</Text>
                  {member.is_banned && <View style={s.bannedPill}><Text style={s.bannedPillText}>BANNI</Text></View>}
                </View>
                <TouchableOpacity style={[s.memberAction, member.is_banned && s.memberActionUnban]} onPress={() => handleBanMember(member.id, member.is_banned)}>
                  <Text style={[s.memberActionText, member.is_banned && { color: '#10B981' }]}>{member.is_banned ? 'Debannir' : 'Bannir'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          messages.length === 0 ? <EmptyState text="Aucun message" icon="mail-outline" /> : (
            messages.map((msg) => (
              <View key={msg.id} style={s.listCard}>
                <View style={s.listCardIcon}><Ionicons name="chatbubble-ellipses" size={20} color={COLORS.accent} /></View>
                <View style={s.listCardBody}>
                  <Text style={s.listCardTitle}>{msg.sender_name} → {msg.receiver_name}</Text>
                  <Text style={s.listCardSub}>{new Date(msg.created_at).toLocaleString()}</Text>
                  <Text style={s.listCardDesc}>{msg.content}</Text>
                </View>
                <TouchableOpacity style={s.listCardDel} onPress={() => handleDeleteMessage(msg.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Edit Cruise Modal ─── */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalWrap}>
            <View style={s.modalHead}>
              <View>
                <Text style={s.modalHeadLabel}>MODIFIER</Text>
                <Text style={s.modalHeadTitle}>{editingCruise?.name_fr}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={s.modalClose}>
                <Ionicons name="close" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalBody}>
              <FormField label="Nom (FR)" value={editForm.name_fr} onChange={(v) => setEditForm({ ...editForm, name_fr: v })} />
              <FormField label="Nom (EN)" value={editForm.name_en} onChange={(v) => setEditForm({ ...editForm, name_en: v })} />
              <View style={s.fieldRow}>
                <View style={s.fieldHalf}><FormField label="Duree" value={editForm.duration} onChange={(v) => setEditForm({ ...editForm, duration: v })} /></View>
                <View style={s.fieldHalf}><FormField label="Port de depart" value={editForm.departure_port} onChange={(v) => setEditForm({ ...editForm, departure_port: v })} /></View>
              </View>
              <View style={s.fieldRow}>
                <View style={s.fieldHalf}><FormField label="Prix cabine (EUR)" value={editForm.cabin_price} onChange={(v) => setEditForm({ ...editForm, cabin_price: v })} numeric /></View>
                <View style={s.fieldHalf}><FormField label="Prix prive (EUR)" value={editForm.private_price} onChange={(v) => setEditForm({ ...editForm, private_price: v })} numeric /></View>
              </View>
              <FormField label="URL de l'image" value={editForm.image_url} onChange={(v) => setEditForm({ ...editForm, image_url: v })} />
              <FormField label="Description (FR)" value={editForm.description_fr} onChange={(v) => setEditForm({ ...editForm, description_fr: v })} multiline />
              <FormField label="Description (EN)" value={editForm.description_en} onChange={(v) => setEditForm({ ...editForm, description_en: v })} multiline />
            </ScrollView>
            <View style={s.modalFoot}>
              <TouchableOpacity style={s.footCancel} onPress={() => setShowEditModal(false)}>
                <Text style={s.footCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.footSave} onPress={handleSaveCruise}>
                <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                <Text style={s.footSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Availability Modal ─── */}
      <Modal visible={showAvailabilityModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalWrap}>
            <View style={s.modalHead}>
              <View>
                <Text style={s.modalHeadLabel}>DISPONIBILITES</Text>
                <Text style={s.modalHeadTitle}>{editingAvailabilityCruise?.name_fr}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAvailabilityModal(false)} style={s.modalClose}>
                <Ionicons name="close" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalBody}>
              {/* Existing availabilities */}
              <Text style={s.sectionHead}>Dates existantes</Text>
              {editingAvailabilityCruise?.availabilities?.map((avail, index) => (
                <View key={index} style={s.availCard}>
                  <View style={s.availTop}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.secondary} />
                    <Text style={s.availDate}>{avail.date_range}</Text>
                    <View style={[s.availStatusPill, { backgroundColor: getStatusColor(avail.status) + '20' }]}>
                      <View style={[s.availDot, { backgroundColor: getStatusColor(avail.status) }]} />
                      <Text style={[s.availStatusText, { color: getStatusColor(avail.status) }]}>{getStatusLabel(avail.status)}</Text>
                    </View>
                  </View>
                  <View style={s.availBottom}>
                    <Text style={s.availPrice}>{avail.price} EUR/pers</Text>
                    {avail.status !== 'full' && <Text style={s.availPlaces}>{avail.remaining_places} places</Text>}
                    <View style={s.availActions}>
                      <TouchableOpacity style={s.availEditBtn} onPress={() => handleEditAvailability(index)}>
                        <Ionicons name="pencil" size={14} color={COLORS.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={s.availDelBtn} onPress={() => handleDeleteAvailability(index)}>
                        <Ionicons name="trash" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {/* Add/Edit form */}
              <Text style={s.sectionHead}>{editingAvailabilityIndex !== null ? 'Modifier la date' : 'Ajouter une date'}</Text>
              <FormField label="Periode" value={availabilityForm.date_range} onChange={(v) => setAvailabilityForm({ ...availabilityForm, date_range: v })} placeholder="ex: du 23 mai au 6 juin 2026" />
              <FormField label="Prix (EUR/pers)" value={availabilityForm.price} onChange={(v) => setAvailabilityForm({ ...availabilityForm, price: v })} numeric placeholder="ex: 2560" />

              <Text style={s.fLabel}>Statut</Text>
              <View style={s.statusRow}>
                {['available', 'limited', 'full'].map((st) => (
                  <TouchableOpacity key={st} style={[s.statusChip, availabilityForm.status === st && { backgroundColor: getStatusColor(st) + '20', borderColor: getStatusColor(st) }]} onPress={() => setAvailabilityForm({ ...availabilityForm, status: st })}>
                    <View style={[s.statusChipDot, { backgroundColor: availabilityForm.status === st ? getStatusColor(st) : '#ccc' }]} />
                    <Text style={[s.statusChipText, availabilityForm.status === st && { color: getStatusColor(st) }]}>{getStatusLabel(st)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {availabilityForm.status !== 'full' && (
                <FormField label="Places restantes" value={availabilityForm.remaining_places} onChange={(v) => setAvailabilityForm({ ...availabilityForm, remaining_places: v })} numeric placeholder="ex: 8" />
              )}

              <TouchableOpacity style={s.addDateBtn} onPress={handleSaveAvailability}>
                <Ionicons name={editingAvailabilityIndex !== null ? 'checkmark-circle' : 'add-circle'} size={20} color={COLORS.primary} />
                <Text style={s.addDateBtnText}>{editingAvailabilityIndex !== null ? 'Mettre a jour' : 'Ajouter cette date'}</Text>
              </TouchableOpacity>

              {editingAvailabilityIndex !== null && (
                <TouchableOpacity style={s.cancelEditLink} onPress={() => { setEditingAvailabilityIndex(null); setAvailabilityForm({ date_range: '', price: '', status: 'available', remaining_places: '8' }); }}>
                  <Text style={s.cancelEditLinkText}>Annuler la modification</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <View style={s.modalFoot}>
              <TouchableOpacity style={s.footSave} onPress={() => setShowAvailabilityModal(false)}>
                <Text style={s.footSaveText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Helper Components ───
function EmptyState({ text, icon }: { text: string; icon: string }) {
  return (
    <View style={{ alignItems: 'center', marginTop: 60 }}>
      <Ionicons name={icon as any} size={48} color="rgba(255,255,255,0.2)" />
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 12 }}>{text}</Text>
    </View>
  );
}

function FormField({ label, value, onChange, multiline, numeric, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; numeric?: boolean; placeholder?: string }) {
  return (
    <View style={s.fGroup}>
      <Text style={s.fLabel}>{label}</Text>
      <TextInput style={[s.fInput, multiline && { height: 80, textAlignVertical: 'top' }]} value={value} onChangeText={onChange} multiline={multiline} keyboardType={numeric ? 'numeric' : 'default'} placeholder={placeholder} placeholderTextColor="#666" />
    </View>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  // Login
  loginSafe: { flex: 1, backgroundColor: COLORS.primary },
  loginPage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginCard: { width: '100%', maxWidth: 380, alignItems: 'center' },
  loginLogoWrap: { marginBottom: 24 },
  loginLogoBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(235,208,169,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(235,208,169,0.3)' },
  loginTitle: { fontSize: 28, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  loginSub: { fontSize: 14, color: COLORS.secondary, fontWeight: '600', letterSpacing: 2, marginBottom: 32 },
  inputGroup: { width: '100%', marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  fieldInput: { flex: 1, fontSize: 15, color: COLORS.white },
  loginErr: { color: '#FF8080', fontSize: 13, marginBottom: 12, fontWeight: '500' },
  loginBtn: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, gap: 8, marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  backLink: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  backLinkText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // Main layout
  safe: { flex: 1, backgroundColor: '#0B1530' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.primary, borderBottomWidth: 1, borderBottomColor: 'rgba(235,208,169,0.15)' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerCenter: { alignItems: 'center' },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 2 },
  headerBrand: { fontSize: 18, color: COLORS.secondary, fontWeight: '700' },

  // Stats
  statsBar: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(235,208,169,0.1)' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingBottom: 12 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, gap: 4 },
  tabActive: { backgroundColor: COLORS.secondary },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary, fontWeight: '700' },

  // Content
  content: { flex: 1, backgroundColor: '#0F1D3D', padding: 12 },

  // Cruise card
  cruiseCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(235,208,169,0.1)' },
  cruiseImg: { width: '100%', height: 140 },
  cruiseBadgeRow: { position: 'absolute', top: 12, right: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 6 },
  badgeGreen: { backgroundColor: 'rgba(16,185,129,0.15)' },
  badgeRed: { backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cruiseBody: { padding: 16 },
  cruiseName: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 6 },
  cruiseMetaRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  cruiseMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cruiseMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  cruisePriceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  priceChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  priceChipLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  priceChipVal: { fontSize: 14, color: COLORS.secondary, fontWeight: '700', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', gap: 6 },
  actionDanger: { backgroundColor: 'rgba(239,68,68,0.1)' },
  actionText: { fontSize: 12, fontWeight: '600' },

  // Generic list card
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  listCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(235,208,169,0.1)', justifyContent: 'center', alignItems: 'center' },
  listCardBody: { flex: 1, marginLeft: 12 },
  listCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  listCardSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  listCardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  listCardDel: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Members
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  bannedPill: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  bannedPillText: { fontSize: 9, fontWeight: '800', color: '#EF4444', letterSpacing: 1 },
  memberAction: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)' },
  memberActionUnban: { backgroundColor: 'rgba(16,185,129,0.1)' },
  memberActionText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalWrap: { backgroundColor: '#0F1D3D', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(235,208,169,0.1)' },
  modalHeadLabel: { fontSize: 10, color: COLORS.secondary, fontWeight: '700', letterSpacing: 2 },
  modalHeadTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700', marginTop: 2 },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20, maxHeight: 480 },
  modalFoot: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(235,208,169,0.1)' },
  footCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  footCancelText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  footSave: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', gap: 6 },
  footSaveText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // Form
  fGroup: { marginBottom: 14 },
  fLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  fInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  fieldRow: { flexDirection: 'row', gap: 10 },
  fieldHalf: { flex: 1 },

  // Section heads
  sectionHead: { fontSize: 14, fontWeight: '700', color: COLORS.secondary, letterSpacing: 1, marginTop: 20, marginBottom: 10 },

  // Availability card
  availCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  availTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  availDate: { flex: 1, fontSize: 13, color: COLORS.white, fontWeight: '500' },
  availStatusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availStatusText: { fontSize: 10, fontWeight: '700' },
  availBottom: { flexDirection: 'row', alignItems: 'center' },
  availPrice: { fontSize: 14, color: COLORS.secondary, fontWeight: '700', flex: 1 },
  availPlaces: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginRight: 12 },
  availActions: { flexDirection: 'row', gap: 6 },
  availEditBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(235,208,169,0.1)', justifyContent: 'center', alignItems: 'center' },
  availDelBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Status chips
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  statusChipDot: { width: 8, height: 8, borderRadius: 4 },
  statusChipText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  // Add date button
  addDateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, paddingVertical: 14, borderRadius: 12, marginTop: 12, gap: 8 },
  addDateBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  cancelEditLink: { alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  cancelEditLinkText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
});
