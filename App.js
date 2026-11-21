// VYRA
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Share,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://izaovotpdkfabizdzpew.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pZGo3ceCADgIYO_NF85Ujw_exlkdErd';

const { width, height } = Dimensions.get('window');

const demoVideos = [
  {
    id: 'd1',
    user: 'vyra_creator',
    descKey: 'demo1',
    musicKey: 'originalSound',
    color: '#30205B',
  },
  {
    id: 'd2',
    user: 'world_traveler',
    descKey: 'demo2',
    musicKey: 'travelVibes',
    color: '#164B65',
  },
  {
    id: 'd3',
    user: 'daily_life',
    descKey: 'demo3',
    musicKey: 'dailyMoments',
    color: '#642D48',
  },
];

const STRINGS = {
  en: {
    tabFollowing: 'Following',
    tabForYou: 'For You',
    tagline: 'Your world. Your moments.',
    like: 'Like',
    liked: 'Liked',
    comment: 'Comment',
    share: 'Share',
    btnFollow: 'Follow',
    btnFollowing: 'Following',
    shareLink: 'Watch this video on VYRA: ',
    shareGeneric: 'Join me on VYRA - Your world. Your moments.',
    commentsTitle: 'Comments',
    noComments: 'No comments yet. Be the first!',
    addComment: 'Add a comment...',
    send: 'Send',
    home: 'Home',
    discover: 'Discover',
    create: 'Create',
    messages: 'Messages',
    profile: 'Profile',
    posts: 'Posts',
    followers: 'Followers',
    followingCount: 'Following',
    myVideos: 'My Videos',
    videosInFeed: 'Your videos are in the Home feed.',
    videosWillAppear: 'Your videos will appear here.',
    language: 'Language',
    discoverTitle: 'Discover 🌍',
    explore: 'Explore people around the world',
    discoverCreator: 'Discover creator',
    nameTraveler: 'World Traveler',
    nameDaily: 'Daily Life',
    nameCreator: 'VYRA Creator',
    messagesTitle: 'Messages ✉️',
    yourConvos: 'Your conversations',
    noMessages: 'No messages yet.',
    startConnecting: 'Start connecting with people on VYRA.',
    createTitle: 'Create on VYRA',
    chooseVideo: 'Choose a video',
    changeVideo: 'Change video',
    videoSelected: 'Video selected ✓',
    captionPlaceholder: 'Write a caption...',
    upload: 'Upload',
    uploadFailed: 'Upload failed:',
    noVideos: 'No videos yet',
    followHint: 'Follow creators in For You to see their videos here.',
    demo1: 'Welcome to VYRA! 🌍',
    demo2: 'Discover the world with VYRA ✈️',
    demo3: 'Share your best moments ❤️',
    originalSound: 'Original sound',
    travelVibes: 'Travel vibes',
    dailyMoments: 'Daily moments',
  },
  ar: {
    tabFollowing: 'المتابَعون',
    tabForYou: 'لك',
    tagline: 'عالمك. لحظاتك.',
    like: 'إعجاب',
    liked: 'أعجبك',
    comment: 'تعليق',
    share: 'مشاركة',
    btnFollow: 'متابعة',
    btnFollowing: 'تتابعه',
    shareLink: 'شاهد هذا الفيديو على VYRA: ',
    shareGeneric: 'انضم إليّ على VYRA - عالمك. لحظاتك.',
    commentsTitle: 'التعليقات',
    noComments: 'لا توجد تعليقات بعد. كن أول من يعلّق!',
    addComment: 'أضف تعليقاً...',
    send: 'إرسال',
    home: 'الرئيسية',
    discover: 'اكتشف',
    create: 'إنشاء',
    messages: 'الرسائل',
    profile: 'حسابي',
    posts: 'منشورات',
    followers: 'متابعون',
    followingCount: 'يتابع',
    myVideos: 'فيديوهاتي',
    videosInFeed: 'فيديوهاتك في الصفحة الرئيسية.',
    videosWillAppear: 'ستظهر فيديوهاتك هنا.',
    language: 'اللغة',
    discoverTitle: 'اكتشف 🌍',
    explore: 'تعرّف على أشخاص من حول العالم',
    discoverCreator: 'اكتشف المبدع',
    nameTraveler: 'مسافر حول العالم',
    nameDaily: 'الحياة اليومية',
    nameCreator: 'مبدع VYRA',
    messagesTitle: 'الرسائل ✉️',
    yourConvos: 'محادثاتك',
    noMessages: 'لا توجد رسائل بعد.',
    startConnecting: 'ابدأ بالتواصل مع الناس على VYRA.',
    createTitle: 'أنشئ على VYRA',
    chooseVideo: 'اختر فيديو',
    changeVideo: 'غيّر الفيديو',
    videoSelected: 'تم اختيار الفيديو ✓',
    captionPlaceholder: 'اكتب وصفاً...',
    upload: 'نشر',
    uploadFailed: 'فشل الرفع:',
    noVideos: 'لا توجد فيديوهات بعد',
    followHint: 'تابع مبدعين في «لك» لتظهر فيديوهاتهم هنا.',
    demo1: 'مرحباً بك في VYRA! 🌍',
    demo2: 'اكتشف العالم مع VYRA ✈️',
    demo3: 'شارك أجمل لحظاتك ❤️',
    originalSound: 'صوت أصلي',
    travelVibes: 'أجواء السفر',
    dailyMoments: 'لحظات يومية',
  },
  fr: {
    tabFollowing: 'Abonnements',
    tabForYou: 'Pour toi',
    tagline: 'Ton monde. Tes moments.',
    like: "J'aime",
    liked: 'Aimé',
    comment: 'Commenter',
    share: 'Partager',
    btnFollow: 'Suivre',
    btnFollowing: 'Suivi',
    shareLink: 'Regarde cette vidéo sur VYRA : ',
    shareGeneric: 'Rejoins-moi sur VYRA - Ton monde. Tes moments.',
    commentsTitle: 'Commentaires',
    noComments: 'Pas encore de commentaires. Sois le premier !',
    addComment: 'Ajouter un commentaire...',
    send: 'Envoyer',
    home: 'Accueil',
    discover: 'Découvrir',
    create: 'Créer',
    messages: 'Messages',
    profile: 'Profil',
    posts: 'Publications',
    followers: 'Abonnés',
    followingCount: 'Abonnements',
    myVideos: 'Mes vidéos',
    videosInFeed: "Tes vidéos sont dans le fil d'accueil.",
    videosWillAppear: 'Tes vidéos apparaîtront ici.',
    language: 'Langue',
    discoverTitle: 'Découvrir 🌍',
    explore: 'Explore des gens du monde entier',
    discoverCreator: 'Découvrir le créateur',
    nameTraveler: 'Voyageur du monde',
    nameDaily: 'Vie quotidienne',
    nameCreator: 'Créateur VYRA',
    messagesTitle: 'Messages ✉️',
    yourConvos: 'Tes conversations',
    noMessages: 'Aucun message pour le moment.',
    startConnecting: 'Commence à échanger avec des gens sur VYRA.',
    createTitle: 'Créer sur VYRA',
    chooseVideo: 'Choisir une vidéo',
    changeVideo: 'Changer de vidéo',
    videoSelected: 'Vidéo sélectionnée ✓',
    captionPlaceholder: 'Écris une légende...',
    upload: 'Publier',
    uploadFailed: "Échec de l'envoi :",
    noVideos: 'Pas encore de vidéos',
    followHint: 'Suis des créateurs dans « Pour toi » pour voir leurs vidéos ici.',
    demo1: 'Bienvenue sur VYRA ! 🌍',
    demo2: 'Découvre le monde avec VYRA ✈️',
    demo3: 'Partage tes plus beaux moments ❤️',
    originalSound: 'Son original',
    travelVibes: 'Ambiance voyage',
    dailyMoments: 'Moments du quotidien',
  },
};

function VideoPlayer({ url, active }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('Home');
  const [following, setFollowing] = useState({});
  const [likes, setLikes] = useState({});
  const [activeFeed, setActiveFeed] = useState('For You');
  const [pageHeight, setPageHeight] = useState(height - 85);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remote, setRemote] = useState([]);
  const [picked, setPicked] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [commentsFor, setCommentsFor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;

  useEffect(() => {
    AsyncStorage.getItem('vyra_lang')
      .then((v) => {
        if (v && STRINGS[v]) setLang(v);
      })
      .catch(() => {});
  }, []);

  const changeLang = (code) => {
    setLang(code);
    AsyncStorage.setItem('vyra_lang', code).catch(() => {});
  };
  const insets = useSafeAreaInsets();

  const videos = [...remote, ...demoVideos];
  const feedVideos =
    activeFeed === 'Following'
      ? videos.filter((v) => following[v.user])
      : videos;

  const loadVideos = useCallback(async () => {
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/videos?select=*&order=created_at.desc&limit=30',
        { headers: { apikey: SUPABASE_KEY } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setRemote(
          data.map((v) => ({
            id: 'r' + v.id,
            user: v.username,
            description: v.description || '',
            music: 'Original sound',
            color: '#1A1A2E',
            url: v.video_url,
          }))
        );
      }
    } catch (e) {
      // no connection: keep demo videos only
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled) {
      setPicked(result.assets[0]);
      setStatus('');
    }
  };

  const uploadVideo = async () => {
    if (!picked) return;
    setUploading(true);
    setStatus('');
    try {
      const ext = (picked.uri.split('?')[0].split('.').pop() || 'mp4').toLowerCase();
      const fileName = Date.now() + '.' + ext;
      const mime = picked.mimeType || 'video/mp4';

      const blob = await (await fetch(picked.uri)).blob();
      const up = await fetch(
        SUPABASE_URL + '/storage/v1/object/videos/' + fileName,
        {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, 'Content-Type': mime },
          body: blob,
        }
      );
      if (!up.ok) throw new Error(await up.text());

      const publicUrl =
        SUPABASE_URL + '/storage/v1/object/public/videos/' + fileName;
      const ins = await fetch(SUPABASE_URL + '/rest/v1/videos', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          username: 'vyra_creator',
          description: description,
          video_url: publicUrl,
        }),
      });
      if (!ins.ok) throw new Error(await ins.text());

      setPicked(null);
      setDescription('');
      setStatus('');
      await loadVideos();
      setCurrentIndex(0);
      setActiveTab('Home');
    } catch (e) {
      setStatus(t('uploadFailed') + ' ' + String(e.message).slice(0, 200));
    }
    setUploading(false);
  };

  const shareVideo = async (video) => {
    try {
      await Share.share({
        message: video.url
          ? t('shareLink') + video.url
          : t('shareGeneric'),
      });
    } catch (e) {
      // share cancelled
    }
  };

  const openComments = async (video) => {
    setCommentsFor(video.id);
    setComments([]);
    setCommentText('');
    setCommentsLoading(true);
    try {
      const res = await fetch(
        SUPABASE_URL +
          '/rest/v1/comments?select=*&video_id=eq.' +
          encodeURIComponent(video.id) +
          '&order=created_at.desc&limit=100',
        { headers: { apikey: SUPABASE_KEY } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (e) {
      // keep empty list
    }
    setCommentsLoading(false);
  };

  const sendComment = async () => {
    const text = commentText.trim();
    if (!text || !commentsFor) return;
    setCommentText('');
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/comments', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          video_id: commentsFor,
          username: 'vyra_creator',
          content: text,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        setComments((prev) => [data[0], ...prev]);
      }
    } catch (e) {
      // not sent
    }
  };

  const toggleLike = (id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFollow = (id) => {
    setFollowing((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const switchFeed = (feed) => {
    setActiveFeed(feed);
    setCurrentIndex(0);
  };

  const renderTop = () => (
    <View style={styles.videoTop}>
      <Text style={styles.logo}>VYRA</Text>
      <View style={styles.feedButtons}>
        <TouchableOpacity onPress={() => switchFeed('Following')}>
          <Text
            style={[
              styles.feedText,
              activeFeed === 'Following' && styles.selectedFeed,
            ]}
          >
            {t('tabFollowing')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => switchFeed('For You')}>
          <Text
            style={[
              styles.feedText,
              activeFeed === 'For You' && styles.selectedFeed,
            ]}
          >
            {t('tabForYou')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideo = (video, index) => (
    <View
      key={video.id}
      style={[styles.video, { backgroundColor: video.color, height: pageHeight }]}
    >
      {video.url && Math.abs(index - currentIndex) <= 1 && (
        <VideoPlayer
          url={video.url}
          active={index === currentIndex && activeTab === 'Home'}
        />
      )}

      {renderTop()}

      {!video.url && (
        <View style={styles.centerContent}>
          <Text style={styles.videoTitle}>VYRA</Text>
          <Text style={styles.videoSubtitle}>{t('tagline')}</Text>
        </View>
      )}

      <View style={styles.videoInfo}>
        <Text style={styles.username}>@{video.user}</Text>
        <Text style={styles.description}>
          {video.descKey ? t(video.descKey) : video.description}
        </Text>
        <Text style={styles.music}>♫ {t(video.musicKey || 'originalSound')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => toggleLike(video.id)}
        >
          <Text style={styles.actionIcon}>
            {likes[video.id] ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionText}>
            {likes[video.id] ? t('liked') : t('like')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => openComments(video)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{t('comment')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => shareVideo(video)}
        >
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>{t('share')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => toggleFollow(video.user)}
        >
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>
            {following[video.user] ? t('btnFollowing') : t('btnFollow')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {activeTab === 'Home' && (
        <ScrollView
          key={activeFeed}
          style={{ flex: 1 }}
          onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
          onMomentumScrollEnd={(e) =>
            setCurrentIndex(
              Math.round(e.nativeEvent.contentOffset.y / pageHeight)
            )
          }
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        >
          {feedVideos.length === 0 ? (
            <View
              style={[
                styles.video,
                { backgroundColor: '#101010', height: pageHeight },
              ]}
            >
              {renderTop()}
              <View style={styles.centerContent}>
                <Text style={styles.emptyTitle}>{t('noVideos')}</Text>
                <Text style={styles.emptySub}>
                  {t('followHint')}
                </Text>
              </View>
            </View>
          ) : (
            feedVideos.map(renderVideo)
          )}
        </ScrollView>
      )}

      {activeTab !== 'Home' && (
        <ScrollView
          style={{ flex: 1, padding: 22 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>VYRA</Text>

          {activeTab === 'Profile' ? (
            <View style={{ alignItems: 'center', marginTop: 45 }}>
              <Text style={{ fontSize: 65 }}>👤</Text>
              <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>
                VYRA Creator
              </Text>
              <Text style={{ color: '#AAAAAA', marginTop: 8 }}>
                @vyra_creator
              </Text>
              <Text style={{ color: 'white', marginTop: 25 }}>
                {t('tagline')} 🌍
              </Text>
              <Text style={{ color: '#A855F7', marginTop: 30, fontSize: 18 }}>
                {remote.length} {t('posts')}     0 {t('followers')}     0 {t('followingCount')}
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                {t('myVideos')}
              </Text>
              <Text style={{ color: '#999999', marginTop: 15 }}>
                {remote.length > 0
                  ? t('videosInFeed')
                  : t('videosWillAppear')}
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                {t('language')}
              </Text>
              <View style={styles.langRow}>
                {[
                  ['en', 'English'],
                  ['ar', 'العربية'],
                  ['fr', 'Français'],
                ].map(([code, label]) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.langBtn,
                      lang === code && styles.langBtnActive,
                    ]}
                    onPress={() => changeLang(code)}
                  >
                    <Text style={styles.langText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : activeTab === 'Discover' ? (
            <View style={{ marginTop: 35 }}>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
                {t('discoverTitle')}
              </Text>
              <Text style={{ color: '#AAAAAA', marginTop: 15 }}>
                {t('explore')}
              </Text>
              {['nameTraveler', 'nameDaily', 'nameCreator'].map((k, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#202020',
                    padding: 20,
                    marginTop: 15,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 18 }}>
                    👤 {t(k)}
                  </Text>
                  <Text style={{ color: '#A855F7', marginTop: 8 }}>
                    {t('discoverCreator')}
                  </Text>
                </View>
              ))}
            </View>
          ) : activeTab === 'Messages' ? (
            <View style={{ marginTop: 35 }}>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
                {t('messagesTitle')}
              </Text>
              <Text style={{ color: '#AAAAAA', marginTop: 15 }}>
                {t('yourConvos')}
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                {t('noMessages')}
              </Text>
              <Text style={{ color: '#999999', marginTop: 10 }}>
                {t('startConnecting')}
              </Text>
            </View>
          ) : activeTab === 'Create' ? (
            <View style={{ marginTop: 40 }}>
              <Text
                style={{
                  color: '#A855F7',
                  fontSize: 28,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {t('createTitle')}
              </Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={pickVideo}>
                <Text style={styles.primaryBtnText}>
                  {picked ? t('changeVideo') : t('chooseVideo')}
                </Text>
              </TouchableOpacity>

              {picked ? (
                <Text style={{ color: '#CCCCCC', marginTop: 12, textAlign: 'center' }}>
                  {t('videoSelected')}
                </Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder={t('captionPlaceholder')}
                placeholderTextColor="#777777"
                value={description}
                onChangeText={setDescription}
                maxLength={150}
              />

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { opacity: picked && !uploading ? 1 : 0.4 },
                ]}
                disabled={!picked || uploading}
                onPress={uploadVideo}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>{t('upload')}</Text>
                )}
              </TouchableOpacity>

              {status ? (
                <Text style={{ color: '#EEEEEE', marginTop: 16, textAlign: 'center' }}>
                  {status}
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}

      <Modal
        visible={commentsFor !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentsFor(null)}
      >
        <KeyboardAvoidingView style={styles.modalWrap} behavior="padding">
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('commentsTitle')}</Text>
              <TouchableOpacity onPress={() => setCommentsFor(null)}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {commentsLoading ? (
                <ActivityIndicator color="#A855F7" style={{ marginTop: 20 }} />
              ) : comments.length === 0 ? (
                <Text style={styles.noComments}>
                  {t('noComments')}
                </Text>
              ) : (
                comments.map((c) => (
                  <View key={c.id} style={styles.commentRow}>
                    <Text style={styles.commentUser}>@{c.username}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder={t('addComment')}
                placeholderTextColor="#777777"
                value={commentText}
                onChangeText={setCommentText}
                maxLength={300}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendComment}>
                <Text style={styles.sendBtnText}>{t('send')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View
        style={[
          styles.bottomBar,
          { height: 60 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        {[
          ['Home', '⌂'],
          ['Discover', '⌕'],
          ['Create', '+'],
          ['Messages', '✉'],
          ['Profile', '◉'],
        ].map(([tab, icon]) => (
          <TouchableOpacity
            key={tab}
            style={styles.navItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.navIcon,
                activeTab === tab && styles.activeNav,
              ]}
            >
              {icon}
            </Text>
            <Text
              style={[
                styles.navText,
                activeTab === tab && styles.activeNav,
              ]}
            >
              {t(tab.toLowerCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },

  video: {
    width: width,
    height: height - 85,
    position: 'relative',
  },

  videoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  logo: {
    color: '#A855F7',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 2,
  },

  feedButtons: {
    flexDirection: 'row',
    gap: 18,
  },

  feedText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedFeed: {
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#A855F7',
    paddingBottom: 5,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoTitle: {
    color: '#FFFFFF',
    fontSize: 55,
    fontWeight: '900',
    letterSpacing: 8,
  },

  videoSubtitle: {
    color: '#DDDDDD',
    fontSize: 15,
    marginTop: 10,
  },

  videoInfo: {
    position: 'absolute',
    bottom: 35,
    left: 18,
    width: width - 105,
  },

  username: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },

  music: {
    color: '#EEEEEE',
    fontSize: 12,
  },

  actions: {
    position: 'absolute',
    right: 12,
    bottom: 35,
    alignItems: 'center',
    gap: 22,
  },

  action: {
    alignItems: 'center',
  },

  actionIcon: {
    color: '#FFFFFF',
    fontSize: 27,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
  },

  bottomBar: {
    height: 60,
    backgroundColor: '#080808',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: '#888888',
    fontSize: 23,
  },

  navText: {
    color: '#888888',
    fontSize: 10,
    marginTop: 3,
  },

  activeNav: {
    color: '#A855F7',
  },

  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheet: {
    height: '65%',
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  sheetClose: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  noComments: {
    color: '#999999',
    textAlign: 'center',
    marginTop: 30,
  },

  commentRow: {
    marginBottom: 14,
  },

  commentUser: {
    color: '#A855F7',
    fontWeight: 'bold',
  },

  commentText: {
    color: '#FFFFFF',
    marginTop: 2,
  },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  commentInput: {
    flex: 1,
    backgroundColor: '#202020',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  sendBtn: {
    backgroundColor: '#A855F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginLeft: 8,
  },

  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  emptySub: {
    color: '#999999',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  langRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  langBtn: {
    backgroundColor: '#202020',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  langBtnActive: {
    backgroundColor: '#A855F7',
  },

  langText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  primaryBtn: {
    backgroundColor: '#A855F7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#202020',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 24,
    fontSize: 15,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
