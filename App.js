// VYRA
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const SUPABASE_URL = 'https://izaovotpdkfabizdzpew.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pZGo3ceCADgIYO_NF85Ujw_exlkdErd';

const { width, height } = Dimensions.get('window');

let currentToken = null;

const api = (path, options = {}) =>
  fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: 'Bearer ' + currentToken } : {}),
      ...(options.headers || {}),
    },
  });

const authFetch = async (path, body, token) => {
  const res = await fetch(SUPABASE_URL + '/auth/v1' + path, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
};

const toSession = (d) => ({
  access_token: d.access_token,
  refresh_token: d.refresh_token,
  expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
  user: d.user,
});

const formatCount = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
};

const STRINGS = {
  en: {
    tabForYou: 'For You',
    tabFollowing: 'Following',
    tabTrending: 'Discover',
    points: 'Points',
    level: 'Level',
    btnFollow: 'Follow',
    btnFollowing: 'Following',
    share: 'Share',
    shareLink: 'Watch this video on VYRA: ',
    shareGeneric: 'Join me on VYRA - Your world. Your moments.',
    commentsTitle: 'Comments',
    noComments: 'No comments yet. Be the first!',
    addComment: 'Add a comment...',
    send: 'Send',
    navHome: 'Home',
    navFriends: 'Friends',
    navFollow: 'Follow',
    navLive: 'LIVE',
    navChat: 'Chat',
    navProfile: 'Profile',
    posts: 'Posts',
    followers: 'Followers',
    followingCount: 'Following',
    myVideos: 'My Videos',
    videosInFeed: 'Your videos are in the Home feed.',
    videosWillAppear: 'Your videos will appear here.',
    language: 'Language',
    publishVideo: '＋ Post a video',
    discoverTitle: 'Discover creators',
    explore: 'Follow creators to see their videos',
    friendsTitle: 'Friends',
    friendsEmpty: 'Follow creators to find them here.',
    messagesTitle: 'Chat ✉️',
    yourConvos: 'Your conversations',
    noMessages: 'No messages yet.',
    startConnecting: 'Start connecting with people on VYRA.',
    liveTitle: 'LIVE',
    liveSoon: 'Live streaming is coming soon.',
    liveInfo: 'Go live and talk with people around the world, with real-time subtitles.',
    createTitle: 'Post on VYRA',
    chooseVideo: 'Choose a video',
    changeVideo: 'Change video',
    videoSelected: 'Video selected ✓',
    captionPlaceholder: 'Write a caption...',
    upload: 'Upload',
    uploadFailed: 'Upload failed:',
    noVideos: 'No videos yet',
    followHint: 'Follow creators in For You to see their videos here.',
    tagline: 'Your world. Your moments.',
    login: 'Log in',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    noAccount: "Don't have an account? Sign up",
    haveAccount: 'Already have an account? Log in',
    adultConfirm: 'I confirm that I am 18 or older',
    logout: 'Log out',
    errUsername: 'Username: 3-20 characters, lowercase letters, numbers and _ only.',
    errEmail: 'Enter a valid email.',
    errPassword: 'Password must be at least 8 characters.',
    errAdult: 'You must be 18 or older to join.',
    errLogin: 'Wrong email or password.',
    usernameTaken: 'This username is already taken.',
    confirmEmail: 'Check your email to confirm your account, then log in.',
    errGeneric: 'Something went wrong. Try again.',
    navDiscover: 'Discover',
    navCreate: 'Create',
    navRanking: 'Ranking',
    roomsTitle: 'Chat rooms',
    roomsSub: 'Join rooms from around the world',
    roomGeneral: 'General rooms',
    roomVoice: 'Voice rooms',
    roomVideo: 'Video rooms',
    roomPrivate: 'Private rooms',
    createRoom: 'Create a room',
    rewardsTitle: 'Rewards',
    rewardsSub: 'Earn points and gifts',
    myPoints: 'My points',
    seeMore: 'See more',
    adsTitle: 'Ads',
    adsSub: 'Discover our partners',
    adsBanner: 'Advertise with us!',
    adsSoon: 'The ads platform is coming soon.',
    soon: 'Coming soon',
    soonText: 'This feature is not available yet.',
    pointsRule: '1 point per like received, 2 per comment, 5 per video posted.',
    giftsSoon: 'Gifts and badges are coming soon.',
    rankingTitle: 'Ranking',
    rankingSub: 'Top creators',
    noRanking: 'No ranking yet.',
    messagePlaceholder: 'Write a message...',
    messageBtn: 'Message',
    noChats: 'No conversations yet. Open a profile and tap Message.',
    chatWithFollowed: 'People you follow',
    reportMessage: 'Report this message',
    reportTitle: 'Report',
    reasonSpam: 'Spam or scam',
    reasonHarass: 'Harassment or bullying',
    reasonSexual: 'Nudity or sexual content',
    reasonViolence: 'Violence or dangerous acts',
    reasonHate: 'Hate speech',
    reasonMinor: 'Involves a minor / child safety',
    reasonOther: 'Something else',
    reportDetails: 'Add details (optional)',
    reportSent: 'Thank you. Our team will review your report.',
    reportVideo: 'Report video',
    reportUser: 'Report user',
    block: 'Block',
    unblock: 'Unblock',
    blockUser: 'Block user',
    blockConfirm: "You won't see their videos or comments anymore.",
    blockedList: 'Blocked users',
    noBlocked: 'No blocked users.',
    cancel: 'Cancel',
    bannedTitle: 'Account disabled',
    bannedText: 'Your account was disabled because it broke the community rules.',
    demo1: 'Welcome to VYRA! 🌍',
    demo2: 'Discover the world with VYRA ✈️',
    demo3: 'Share your best moments ❤️',
    originalSound: 'Original sound',
    travelVibes: 'Travel vibes',
    dailyMoments: 'Daily moments',
  },
  ar: {
    tabForYou: 'لك',
    tabFollowing: 'المتابَعون',
    tabTrending: 'اكتشف',
    points: 'نقاط',
    level: 'المستوى',
    btnFollow: 'متابعة',
    btnFollowing: 'تتابعه',
    share: 'مشاركة',
    shareLink: 'شاهد هذا الفيديو على VYRA: ',
    shareGeneric: 'انضم إليّ على VYRA - عالمك. لحظاتك.',
    commentsTitle: 'التعليقات',
    noComments: 'لا توجد تعليقات بعد. كن أول من يعلّق!',
    addComment: 'أضف تعليقاً...',
    send: 'إرسال',
    navHome: 'الرئيسية',
    navFriends: 'الأصدقاء',
    navFollow: 'متابعة',
    navLive: 'مباشر',
    navChat: 'الدردشة',
    navProfile: 'حسابي',
    posts: 'منشورات',
    followers: 'متابعون',
    followingCount: 'يتابع',
    myVideos: 'فيديوهاتي',
    videosInFeed: 'فيديوهاتك في الصفحة الرئيسية.',
    videosWillAppear: 'ستظهر فيديوهاتك هنا.',
    language: 'اللغة',
    publishVideo: '＋ انشر فيديو',
    discoverTitle: 'اكتشف المبدعين',
    explore: 'تابع المبدعين لتشاهد فيديوهاتهم',
    friendsTitle: 'الأصدقاء',
    friendsEmpty: 'تابع مبدعين لتجدهم هنا.',
    messagesTitle: 'الدردشة ✉️',
    yourConvos: 'محادثاتك',
    noMessages: 'لا توجد رسائل بعد.',
    startConnecting: 'ابدأ بالتواصل مع الناس على VYRA.',
    liveTitle: 'مباشر',
    liveSoon: 'البث المباشر قادم قريباً.',
    liveInfo: 'ابدأ بثاً مباشراً وتحدث مع الناس حول العالم، مع ترجمة فورية مكتوبة.',
    createTitle: 'انشر على VYRA',
    chooseVideo: 'اختر فيديو',
    changeVideo: 'غيّر الفيديو',
    videoSelected: 'تم اختيار الفيديو ✓',
    captionPlaceholder: 'اكتب وصفاً...',
    upload: 'نشر',
    uploadFailed: 'فشل الرفع:',
    noVideos: 'لا توجد فيديوهات بعد',
    followHint: 'تابع مبدعين في «لك» لتظهر فيديوهاتهم هنا.',
    tagline: 'عالمك. لحظاتك.',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة السر',
    username: 'اسم المستخدم',
    noAccount: 'ليس لديك حساب؟ أنشئ حساباً',
    haveAccount: 'لديك حساب؟ سجّل الدخول',
    adultConfirm: 'أؤكد أن عمري 18 سنة أو أكثر',
    logout: 'تسجيل الخروج',
    errUsername: 'اسم المستخدم من 3 إلى 20 حرفاً: أحرف إنجليزية صغيرة وأرقام و _ فقط.',
    errEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
    errPassword: 'كلمة السر 8 أحرف على الأقل.',
    errAdult: 'يجب أن يكون عمرك 18 سنة أو أكثر للانضمام.',
    errLogin: 'البريد أو كلمة السر غير صحيحة.',
    usernameTaken: 'اسم المستخدم مستخدم من قبل.',
    confirmEmail: 'افتح بريدك لتأكيد الحساب ثم سجّل الدخول.',
    errGeneric: 'حدث خطأ. حاول مرة أخرى.',
    navDiscover: 'اكتشف',
    navCreate: 'إنشاء',
    navRanking: 'الترتيب',
    roomsTitle: 'غرف الدردشة',
    roomsSub: 'انضم إلى غرف من حول العالم',
    roomGeneral: 'غرف عامة',
    roomVoice: 'غرف صوتية',
    roomVideo: 'غرف فيديو',
    roomPrivate: 'غرف خاصة',
    createRoom: 'أنشئ غرفة',
    rewardsTitle: 'المكافآت',
    rewardsSub: 'اكسب نقاطاً وهدايا',
    myPoints: 'نقاطي',
    seeMore: 'المزيد',
    adsTitle: 'الإعلانات',
    adsSub: 'تعرّف على شركائنا',
    adsBanner: 'أعلن معنا!',
    adsSoon: 'منصة الإعلانات قادمة قريباً.',
    soon: 'قريباً',
    soonText: 'هذه الميزة غير متاحة بعد.',
    pointsRule: 'نقطة لكل إعجاب، ونقطتان لكل تعليق، و5 نقاط لكل فيديو تنشره.',
    giftsSoon: 'الهدايا والأوسمة قادمة قريباً.',
    rankingTitle: 'الترتيب',
    rankingSub: 'أفضل المبدعين',
    noRanking: 'لا ترتيب بعد.',
    messagePlaceholder: 'اكتب رسالة...',
    messageBtn: 'مراسلة',
    noChats: 'لا توجد محادثات بعد. افتح ملف شخص واضغط مراسلة.',
    chatWithFollowed: 'من تتابعهم',
    reportMessage: 'الإبلاغ عن هذه الرسالة',
    reportTitle: 'إبلاغ',
    reasonSpam: 'محتوى مزعج أو احتيال',
    reasonHarass: 'تحرش أو تنمر',
    reasonSexual: 'عري أو محتوى جنسي',
    reasonViolence: 'عنف أو أفعال خطيرة',
    reasonHate: 'خطاب كراهية',
    reasonMinor: 'يتعلق بقاصر / سلامة الأطفال',
    reasonOther: 'سبب آخر',
    reportDetails: 'أضف تفاصيل (اختياري)',
    reportSent: 'شكراً لك. سيراجع فريقنا بلاغك.',
    reportVideo: 'الإبلاغ عن الفيديو',
    reportUser: 'الإبلاغ عن المستخدم',
    block: 'حظر',
    unblock: 'إلغاء الحظر',
    blockUser: 'حظر المستخدم',
    blockConfirm: 'لن ترى فيديوهاته ولا تعليقاته بعد الآن.',
    blockedList: 'المستخدمون المحظورون',
    noBlocked: 'لا يوجد مستخدمون محظورون.',
    cancel: 'إلغاء',
    bannedTitle: 'الحساب معطّل',
    bannedText: 'تم تعطيل حسابك لمخالفته قواعد المجتمع.',
    demo1: 'مرحباً بك في VYRA! 🌍',
    demo2: 'اكتشف العالم مع VYRA ✈️',
    demo3: 'شارك أجمل لحظاتك ❤️',
    originalSound: 'صوت أصلي',
    travelVibes: 'أجواء السفر',
    dailyMoments: 'لحظات يومية',
  },
  fr: {
    tabForYou: 'Pour Vous',
    tabFollowing: 'Suivis',
    tabTrending: 'Découvrir',
    points: 'Points',
    level: 'Niveau',
    btnFollow: 'Suivre',
    btnFollowing: 'Suivi',
    share: 'Partager',
    shareLink: 'Regarde cette vidéo sur VYRA : ',
    shareGeneric: 'Rejoins-moi sur VYRA - Ton monde. Tes moments.',
    commentsTitle: 'Commentaires',
    noComments: 'Pas encore de commentaires. Sois le premier !',
    addComment: 'Ajouter un commentaire...',
    send: 'Envoyer',
    navHome: 'Accueil',
    navFriends: 'Amis',
    navFollow: 'Suivre',
    navLive: 'LIVE',
    navChat: 'Chat',
    navProfile: 'Profil',
    posts: 'Publications',
    followers: 'Abonnés',
    followingCount: 'Abonnements',
    myVideos: 'Mes vidéos',
    videosInFeed: "Tes vidéos sont dans le fil d'accueil.",
    videosWillAppear: 'Tes vidéos apparaîtront ici.',
    language: 'Langue',
    publishVideo: '＋ Publier une vidéo',
    discoverTitle: 'Découvrir des créateurs',
    explore: 'Suis des créateurs pour voir leurs vidéos',
    friendsTitle: 'Amis',
    friendsEmpty: 'Suis des créateurs pour les retrouver ici.',
    messagesTitle: 'Chat ✉️',
    yourConvos: 'Tes conversations',
    noMessages: 'Aucun message pour le moment.',
    startConnecting: 'Commence à échanger avec des gens sur VYRA.',
    liveTitle: 'LIVE',
    liveSoon: 'Le direct arrive bientôt.',
    liveInfo: 'Passe en direct et parle avec des gens du monde entier, avec sous-titres en temps réel.',
    createTitle: 'Publier sur VYRA',
    chooseVideo: 'Choisir une vidéo',
    changeVideo: 'Changer de vidéo',
    videoSelected: 'Vidéo sélectionnée ✓',
    captionPlaceholder: 'Écris une légende...',
    upload: 'Publier',
    uploadFailed: "Échec de l'envoi :",
    noVideos: 'Pas encore de vidéos',
    followHint: 'Suis des créateurs dans « Pour toi » pour voir leurs vidéos ici.',
    tagline: 'Ton monde. Tes moments.',
    login: 'Se connecter',
    register: "S'inscrire",
    email: 'E-mail',
    password: 'Mot de passe',
    username: "Nom d'utilisateur",
    noAccount: "Pas de compte ? S'inscrire",
    haveAccount: 'Déjà un compte ? Se connecter',
    adultConfirm: "Je confirme avoir 18 ans ou plus",
    logout: 'Se déconnecter',
    errUsername: "Nom d'utilisateur : 3 à 20 caractères, minuscules, chiffres et _ uniquement.",
    errEmail: 'Entre un e-mail valide.',
    errPassword: 'Le mot de passe doit faire au moins 8 caractères.',
    errAdult: 'Tu dois avoir 18 ans ou plus pour rejoindre VYRA.',
    errLogin: 'E-mail ou mot de passe incorrect.',
    usernameTaken: "Ce nom d'utilisateur est déjà pris.",
    confirmEmail: 'Vérifie ton e-mail pour confirmer ton compte, puis connecte-toi.',
    errGeneric: "Une erreur s'est produite. Réessaie.",
    navDiscover: 'Découvrir',
    navCreate: 'Créer',
    navRanking: 'Classement',
    roomsTitle: 'Salons de Chat',
    roomsSub: 'Rejoignez des salons du monde entier',
    roomGeneral: 'Salons Généraux',
    roomVoice: 'Salons Vocaux',
    roomVideo: 'Salons Vidéo',
    roomPrivate: 'Salons Privés',
    createRoom: 'Créer un Salon',
    rewardsTitle: 'Récompenses',
    rewardsSub: 'Gagnez des points et des cadeaux',
    myPoints: 'Mes Points',
    seeMore: 'Voir Plus',
    adsTitle: 'Publicités',
    adsSub: 'Découvrez nos partenaires',
    adsBanner: 'Annoncez avec nous !',
    adsSoon: 'La plateforme publicitaire arrive bientôt.',
    soon: 'Bientôt',
    soonText: "Cette fonctionnalité n'est pas encore disponible.",
    pointsRule: "1 point par J'aime reçu, 2 par commentaire, 5 par vidéo publiée.",
    giftsSoon: 'Les cadeaux et badges arrivent bientôt.',
    rankingTitle: 'Classement',
    rankingSub: 'Meilleurs créateurs',
    noRanking: 'Pas encore de classement.',
    messagePlaceholder: 'Écris un message...',
    messageBtn: 'Message',
    noChats: "Aucune conversation. Ouvre un profil et touche Message.",
    chatWithFollowed: 'Personnes que tu suis',
    reportMessage: 'Signaler ce message',
    reportTitle: 'Signaler',
    reasonSpam: 'Spam ou arnaque',
    reasonHarass: 'Harcèlement ou intimidation',
    reasonSexual: 'Nudité ou contenu sexuel',
    reasonViolence: 'Violence ou actes dangereux',
    reasonHate: 'Discours haineux',
    reasonMinor: 'Concerne un mineur / sécurité des enfants',
    reasonOther: 'Autre chose',
    reportDetails: 'Ajoute des détails (facultatif)',
    reportSent: 'Merci. Notre équipe va examiner ton signalement.',
    reportVideo: 'Signaler la vidéo',
    reportUser: "Signaler l'utilisateur",
    block: 'Bloquer',
    unblock: 'Débloquer',
    blockUser: "Bloquer l'utilisateur",
    blockConfirm: 'Tu ne verras plus ses vidéos ni ses commentaires.',
    blockedList: 'Utilisateurs bloqués',
    noBlocked: 'Aucun utilisateur bloqué.',
    cancel: 'Annuler',
    bannedTitle: 'Compte désactivé',
    bannedText: 'Ton compte a été désactivé car il enfreint les règles de la communauté.',
    demo1: 'Bienvenue sur VYRA ! 🌍',
    demo2: 'Découvre le monde avec VYRA ✈️',
    demo3: 'Partage tes plus beaux moments ❤️',
    originalSound: 'Son original',
    travelVibes: 'Ambiance voyage',
    dailyMoments: 'Moments du quotidien',
  },
};

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

const REASONS = [
  ['spam', 'reasonSpam'],
  ['harassment', 'reasonHarass'],
  ['sexual', 'reasonSexual'],
  ['violence', 'reasonViolence'],
  ['hate', 'reasonHate'],
  ['minor', 'reasonMinor'],
  ['other', 'reasonOther'],
];

const NAV = [
  ['Home', '🏠', 'navHome'],
  ['Follow', '🧭', 'navDiscover'],
  ['Create', '＋', 'navCreate'],
  ['Ranking', '🏆', 'navRanking'],
  ['Profile', '👤', 'navProfile'],
];

const ROOMS = [
  ['roomGeneral', '🌐', ['#7C3AED', '#4C1D95']],
  ['roomVoice', '🎙️', ['#2563EB', '#1E3A8A']],
  ['roomVideo', '🎥', ['#DB2777', '#9D174D']],
  ['roomPrivate', '👑', ['#F59E0B', '#B45309']],
];

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

function AuthScreen({ t, lang, changeLang, onSession }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [adult, setAdult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const readError = (data) => {
    const m = String(
      (data && (data.msg || data.error_description || data.message || data.error)) || ''
    );
    if (m.toLowerCase().includes('invalid login')) return t('errLogin');
    return m || t('errGeneric');
  };

  const submit = async () => {
    setError('');
    setInfo('');
    const mail = email.trim().toLowerCase();
    if (!mail.includes('@') || mail.length < 5) {
      setError(t('errEmail'));
      return;
    }

    if (mode === 'login') {
      if (!password) {
        setError(t('errPassword'));
        return;
      }
      setLoading(true);
      try {
        const r = await authFetch('/token?grant_type=password', {
          email: mail,
          password: password,
        });
        if (!r.ok) setError(readError(r.data));
        else onSession(toSession(r.data));
      } catch (e) {
        setError(t('errGeneric'));
      }
      setLoading(false);
      return;
    }

    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(name)) {
      setError(t('errUsername'));
      return;
    }
    if (password.length < 8) {
      setError(t('errPassword'));
      return;
    }
    if (!adult) {
      setError(t('errAdult'));
      return;
    }
    setLoading(true);
    try {
      const check = await fetch(
        SUPABASE_URL + '/rest/v1/profiles?select=id&username=eq.' + encodeURIComponent(name),
        { headers: { apikey: SUPABASE_KEY } }
      );
      const rows = await check.json();
      if (Array.isArray(rows) && rows.length > 0) {
        setError(t('usernameTaken'));
        setLoading(false);
        return;
      }
      const r = await authFetch('/signup', {
        email: mail,
        password: password,
        data: { username: name, adult_confirmed: true },
      });
      if (!r.ok) setError(readError(r.data));
      else if (r.data.access_token) onSession(toSession(r.data));
      else setInfo(t('confirmEmail'));
    } catch (e) {
      setError(t('errGeneric'));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={styles.authWrap}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.authLogo}>VYRA</Text>
        <Text style={styles.authTagline}>{t('tagline')}</Text>
        <Text style={styles.authTitle}>
          {mode === 'login' ? t('login') : t('register')}
        </Text>

        {mode === 'register' && (
          <TextInput
            style={styles.authInput}
            placeholder={t('username')}
            placeholderTextColor="#777777"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        )}

        <TextInput
          style={styles.authInput}
          placeholder={t('email')}
          placeholderTextColor="#777777"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.authInput}
          placeholder={t('password')}
          placeholderTextColor="#777777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {mode === 'register' && (
          <TouchableOpacity style={styles.checkRow} onPress={() => setAdult(!adult)}>
            <View style={[styles.checkBox, adult && styles.checkBoxOn]}>
              {adult ? <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>✓</Text> : null}
            </View>
            <Text style={styles.checkText}>{t('adultConfirm')}</Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={styles.authError}>{error}</Text> : null}
        {info ? <Text style={styles.authInfo}>{info}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, { opacity: loading ? 0.6 : 1 }]}
          disabled={loading}
          onPress={submit}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {mode === 'login' ? t('login') : t('register')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
            setInfo('');
          }}
        >
          <Text style={styles.authSwitch}>
            {mode === 'login' ? t('noAccount') : t('haveAccount')}
          </Text>
        </TouchableOpacity>

        <View style={[styles.langRow, { justifyContent: 'center', marginTop: 30 }]}>
          {[
            ['fr', 'Français'],
            ['ar', 'العربية'],
            ['en', 'English'],
          ].map(([code, label]) => (
            <TouchableOpacity
              key={code}
              style={[styles.langBtn, lang === code && styles.langBtnActive]}
              onPress={() => changeLang(code)}
            >
              <Text style={styles.langText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('Home');
  const [activeFeed, setActiveFeed] = useState('forYou');
  const [lang, setLang] = useState('fr');
  const [following, setFollowing] = useState({});
  const [myLikes, setMyLikes] = useState({});
  const [stats, setStats] = useState({});
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [people, setPeople] = useState([]);
  const [blocked, setBlocked] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [counts, setCounts] = useState(null);
  const [menuVideo, setMenuVideo] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [banned, setBanned] = useState(false);
  const [hubView, setHubView] = useState('home');
  const [board, setBoard] = useState([]);
  const [names, setNames] = useState({});
  const [conversations, setConversations] = useState([]);
  const [chatWith, setChatWith] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatScrollRef = useRef(null);
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
  const insets = useSafeAreaInsets();

  const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;

  const me = session ? session.user : null;
  const myId = me ? me.id : null;
  const myName = (me && me.user_metadata && me.user_metadata.username) || 'user';

  const saveSession = async (sess) => {
    currentToken = sess.access_token;
    setSession(sess);
    try {
      await AsyncStorage.setItem('vyra_session', JSON.stringify(sess));
    } catch (e) {
      // not saved
    }
  };

  const logout = async () => {
    try {
      if (currentToken) await authFetch('/logout', null, currentToken);
    } catch (e) {
      // ignore
    }
    currentToken = null;
    setSession(null);
    setMyLikes({});
    setActiveTab('Home');
    AsyncStorage.removeItem('vyra_session').catch(() => {});
  };

  const ensureToken = async () => {
    if (!session) return null;
    if (session.expires_at - 30 > Date.now() / 1000) return session.access_token;
    const r = await authFetch('/token?grant_type=refresh_token', {
      refresh_token: session.refresh_token,
    });
    if (r.ok) {
      const fresh = toSession(r.data);
      await saveSession(fresh);
      return fresh.access_token;
    }
    await logout();
    return null;
  };

  const videos = [...remote, ...demoVideos].filter(
    (v) => !(v.user_id && blocked[v.user_id])
  );
  const countOf = (id) => stats[id] || { likes: 0, comments: 0 };
  const score = (v) => countOf(v.id).likes * 2 + countOf(v.id).comments;

  const feedVideos =
    activeFeed === 'following'
      ? videos.filter((v) => v.user_id && following[v.user_id])
      : activeFeed === 'trending'
      ? [...videos].sort((a, b) => score(b) - score(a))
      : videos;

  const loadVideos = useCallback(async () => {
    try {
      const res = await api('videos?select=*&order=created_at.desc&limit=30');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRemote(
          data.map((v) => ({
            id: 'r' + v.id,
            user: v.username,
            user_id: v.user_id,
            description: v.description || '',
            musicKey: 'originalSound',
            color: '#1A1A2E',
            url: v.video_url,
          }))
        );
      }
    } catch (e) {
      // offline: demo videos only
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await api('video_stats?select=*');
      const data = await res.json();
      if (Array.isArray(data)) {
        const m = {};
        data.forEach((r) => {
          m[r.video_id] = {
            likes: Number(r.likes) || 0,
            comments: Number(r.comments) || 0,
          };
        });
        setStats(m);
      }
    } catch (e) {
      // keep zeros
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const l = await AsyncStorage.getItem('vyra_lang');
        if (l && STRINGS[l]) setLang(l);
        const raw = await AsyncStorage.getItem('vyra_session');
        if (raw) {
          let sess = JSON.parse(raw);
          if (sess.expires_at - 60 < Date.now() / 1000) {
            const r = await authFetch('/token?grant_type=refresh_token', {
              refresh_token: sess.refresh_token,
            });
            sess = r.ok ? toSession(r.data) : null;
          }
          if (sess) await saveSession(sess);
          else await AsyncStorage.removeItem('vyra_session');
        }
      } catch (e) {
        // start logged out
      }
      setAuthReady(true);
    })();
    loadVideos();
    loadStats();
  }, [loadVideos, loadStats]);

  useEffect(() => {
    if (!myId) return;
    api('likes?select=video_id&user_id=eq.' + myId)
      .then((r) => r.json())
      .then((rows) => {
        if (Array.isArray(rows)) {
          const m = {};
          rows.forEach((r) => {
            m[r.video_id] = true;
          });
          setMyLikes(m);
        }
      })
      .catch(() => {});
  }, [myId]);

  const loadSocial = useCallback(async () => {
    if (!myId) return;
    try {
      const [f, b, pe] = await Promise.all([
        api('follows?select=followed_id&follower_id=eq.' + myId).then((r) => r.json()),
        api('blocks?select=blocked_id').then((r) => r.json()),
        api('profiles?select=id,username&order=created_at.desc&limit=100').then((r) => r.json()),
      ]);
      if (Array.isArray(f)) {
        const m = {};
        f.forEach((x) => {
          m[x.followed_id] = true;
        });
        setFollowing(m);
      }
      if (Array.isArray(b)) {
        const m = {};
        b.forEach((x) => {
          m[x.blocked_id] = true;
        });
        setBlocked(m);
      }
      if (Array.isArray(pe)) setPeople(pe);
    } catch (e) {
      // offline
    }
  }, [myId]);

  useEffect(() => {
    loadSocial();
  }, [loadSocial]);

  useEffect(() => {
    if ((activeTab === 'Friends' || activeTab === 'Follow') && myId) loadSocial();
  }, [activeTab, myId, loadSocial]);

  useEffect(() => {
    if (activeTab === 'Profile' && myId) {
      setCounts(null);
      loadCounts(myId);
    }
  }, [activeTab, myId]);

  useEffect(() => {
    if (!myId) {
      setBanned(false);
      return;
    }
    api('rpc/is_banned', { method: 'POST', body: '{}' })
      .then((r) => r.json())
      .then((v) => setBanned(v === true))
      .catch(() => {});
  }, [myId]);

  const changeLang = (code) => {
    setLang(code);
    AsyncStorage.setItem('vyra_lang', code).catch(() => {});
  };

  const switchFeed = (feed) => {
    setActiveFeed(feed);
    setCurrentIndex(0);
  };

  const nameOf = (id) => {
    if (names[id]) return names[id];
    const pe = people.find((x) => x.id === id);
    return pe ? pe.username : String(id).slice(0, 6);
  };

  const loadConversations = useCallback(async () => {
    if (!myId) return;
    try {
      const res = await api(
        'messages?select=*&or=(sender_id.eq.' + myId + ',recipient_id.eq.' + myId +
          ')&order=created_at.desc&limit=300'
      );
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      const map = {};
      rows.forEach((m) => {
        const other = m.sender_id === myId ? m.recipient_id : m.sender_id;
        if (!map[other]) map[other] = { id: other, last: m, unread: 0 };
        if (m.recipient_id === myId && !m.read) map[other].unread += 1;
      });
      const list = Object.values(map);
      setConversations(list);
      const ids = list.map((c) => c.id);
      if (ids.length) {
        const pr = await api('profiles?select=id,username&id=in.(' + ids.join(',') + ')').then((r) => r.json());
        if (Array.isArray(pr)) {
          const m = {};
          pr.forEach((x) => {
            m[x.id] = x.username;
          });
          setNames((prev) => ({ ...prev, ...m }));
        }
      }
    } catch (e) {
      // offline
    }
  }, [myId]);

  const loadMessages = async (otherId) => {
    if (!myId || !otherId) return;
    try {
      const res = await api(
        'messages?select=*&or=(and(sender_id.eq.' + myId + ',recipient_id.eq.' + otherId +
          '),and(sender_id.eq.' + otherId + ',recipient_id.eq.' + myId +
          '))&order=created_at.asc&limit=300'
      );
      const rows = await res.json();
      if (Array.isArray(rows)) {
        setChatMessages(rows);
        if (rows.some((m) => m.recipient_id === myId && !m.read)) {
          api(
            'messages?recipient_id=eq.' + myId + '&sender_id=eq.' + otherId + '&read=eq.false',
            {
              method: 'PATCH',
              headers: { Prefer: 'return=minimal' },
              body: JSON.stringify({ read: true }),
            }
          ).catch(() => {});
        }
      }
    } catch (e) {
      // offline
    }
  };

  const openChat = (userId, name) => {
    if (!userId || userId === myId) return;
    setNames((prev) => ({ ...prev, [userId]: name || prev[userId] }));
    setChatWith({ id: userId, username: name || nameOf(userId) });
    setChatMessages([]);
    setChatText('');
    setChatError('');
    loadMessages(userId);
  };

  const sendMessage = async () => {
    const text = chatText.trim();
    if (!text || !chatWith || !myId || chatSending) return;
    const token = await ensureToken();
    if (!token) return;
    setChatText('');
    setChatError('');
    setChatSending(true);
    try {
      const res = await api('messages', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          sender_id: myId,
          recipient_id: chatWith.id,
          content: text,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        setChatMessages((p) => [...p, data[0]]);
      } else {
        setChatText(text);
        setChatError(t('errGeneric'));
      }
    } catch (e) {
      setChatText(text);
      setChatError(t('errGeneric'));
    }
    setChatSending(false);
  };

  useEffect(() => {
    if (!myId) return;
    loadConversations();
    const timer = setInterval(loadConversations, 10000);
    return () => clearInterval(timer);
  }, [myId, loadConversations]);

  useEffect(() => {
    if (!chatWith) return;
    const timer = setInterval(() => loadMessages(chatWith.id), 3000);
    return () => clearInterval(timer);
  }, [chatWith]);

  const soon = () => Alert.alert(t('soon'), t('soonText'));

  const openHub = (view) => {
    setHubView(view);
    setActiveTab('Hub');
  };

  const loadBoard = useCallback(async () => {
    try {
      const [vr, sr] = await Promise.all([
        api('videos?select=id,user_id,username&user_id=not.is.null&limit=1000').then((r) => r.json()),
        api('video_stats?select=*').then((r) => r.json()),
      ]);
      if (!Array.isArray(vr) || !Array.isArray(sr)) return;
      const st = {};
      sr.forEach((r) => {
        st[String(r.video_id)] = {
          likes: Number(r.likes) || 0,
          comments: Number(r.comments) || 0,
        };
      });
      const agg = {};
      vr.forEach((v) => {
        const sv = st['r' + v.id] || { likes: 0, comments: 0 };
        if (!agg[v.user_id]) {
          agg[v.user_id] = { id: v.user_id, username: v.username, posts: 0, likes: 0, comments: 0 };
        }
        agg[v.user_id].posts += 1;
        agg[v.user_id].likes += sv.likes;
        agg[v.user_id].comments += sv.comments;
      });
      const list = Object.values(agg)
        .map((a) => ({ ...a, points: a.likes + 2 * a.comments + 5 * a.posts }))
        .sort((x, y) => y.points - x.points);
      setBoard(list);
    } catch (e) {
      // keep old board
    }
  }, []);

  useEffect(() => {
    if (!myId) return;
    if (['Home', 'Hub', 'Ranking', 'Profile'].includes(activeTab)) loadBoard();
  }, [activeTab, myId, loadBoard]);

  const loadCounts = async (userId) => {
    try {
      const [a, b, c] = await Promise.all([
        api('follows?select=follower_id&followed_id=eq.' + userId + '&limit=1000').then((r) => r.json()),
        api('follows?select=followed_id&follower_id=eq.' + userId + '&limit=1000').then((r) => r.json()),
        api('videos?select=id&user_id=eq.' + userId + '&limit=1000').then((r) => r.json()),
      ]);
      setCounts({
        followers: Array.isArray(a) ? a.length : 0,
        following: Array.isArray(b) ? b.length : 0,
        posts: Array.isArray(c) ? c.length : 0,
      });
    } catch (e) {
      // keep dashes
    }
  };

  const openUser = (userId, name) => {
    if (!userId) return;
    if (userId === myId) {
      setActiveTab('Profile');
      return;
    }
    setViewUser({ id: userId, username: name || '?' });
    setCounts(null);
    setActiveTab('User');
    loadCounts(userId);
  };

  const toggleFollow = async (userId) => {
    if (!userId || !myId || userId === myId) return;
    const token = await ensureToken();
    if (!token) return;
    const was = !!following[userId];
    setFollowing((p) => ({ ...p, [userId]: !was }));
    setCounts((c) =>
      c && viewUser && viewUser.id === userId
        ? { ...c, followers: Math.max(0, c.followers + (was ? -1 : 1)) }
        : c
    );
    try {
      if (was) {
        await api(
          'follows?follower_id=eq.' + myId + '&followed_id=eq.' + userId,
          { method: 'DELETE' }
        );
      } else {
        await api('follows', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ follower_id: myId, followed_id: userId }),
        });
      }
    } catch (e) {
      // will resync later
    }
  };

  const blockUser = (userId, name) => {
    setMenuVideo(null);
    Alert.alert(t('blockUser') + ' @' + name, t('blockConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('block'),
        style: 'destructive',
        onPress: async () => {
          const token = await ensureToken();
          if (!token) return;
          setBlocked((p) => ({ ...p, [userId]: true }));
          setFollowing((p) => ({ ...p, [userId]: false }));
          if (activeTab === 'User') setActiveTab('Home');
          try {
            await api(
              'follows?follower_id=eq.' + myId + '&followed_id=eq.' + userId,
              { method: 'DELETE' }
            );
            await api('blocks', {
              method: 'POST',
              headers: { Prefer: 'return=minimal' },
              body: JSON.stringify({ blocker_id: myId, blocked_id: userId }),
            });
          } catch (e) {
            // will resync later
          }
        },
      },
    ]);
  };

  const unblockUser = async (userId) => {
    const token = await ensureToken();
    if (!token) return;
    setBlocked((p) => {
      const n = { ...p };
      delete n[userId];
      return n;
    });
    try {
      await api(
        'blocks?blocker_id=eq.' + myId + '&blocked_id=eq.' + userId,
        { method: 'DELETE' }
      );
    } catch (e) {
      // will resync later
    }
  };

  const openReport = (type, id) => {
    setMenuVideo(null);
    setReportTarget({ type: type, id: String(id) });
    setReportReason('');
    setReportDetails('');
    setReportDone(false);
  };

  const sendReport = async () => {
    if (!reportTarget || !reportReason || !myId) return;
    const token = await ensureToken();
    if (!token) return;
    setReportBusy(true);
    try {
      const res = await api('reports', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          reporter_id: myId,
          target_type: reportTarget.type,
          target_id: reportTarget.id,
          reason: reportReason,
          details: reportDetails.trim() || null,
        }),
      });
      if (res.ok) setReportDone(true);
    } catch (e) {
      // not sent
    }
    setReportBusy(false);
  };

  const toggleLike = async (video) => {
    const token = await ensureToken();
    if (!token || !myId) return;
    const id = video.id;
    const liked = !!myLikes[id];
    setMyLikes((p) => ({ ...p, [id]: !liked }));
    setStats((p) => {
      const cur = p[id] || { likes: 0, comments: 0 };
      return {
        ...p,
        [id]: { ...cur, likes: Math.max(0, cur.likes + (liked ? -1 : 1)) },
      };
    });
    try {
      if (liked) {
        await api(
          'likes?video_id=eq.' + encodeURIComponent(id) + '&user_id=eq.' + myId,
          { method: 'DELETE' }
        );
      } else {
        await api('likes', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ video_id: id, user_id: myId }),
        });
      }
    } catch (e) {
      // will resync on next launch
    }
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
      const res = await api(
        'comments?select=*&video_id=eq.' +
          encodeURIComponent(video.id) +
          '&order=created_at.desc&limit=100'
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
    const vid = commentsFor;
    const token = await ensureToken();
    if (!token) return;
    setCommentText('');
    try {
      const res = await api('comments', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          video_id: vid,
          user_id: myId,
          username: myName,
          content: text,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        setComments((prev) => [data[0], ...prev]);
        setStats((p) => {
          const cur = p[vid] || { likes: 0, comments: 0 };
          return { ...p, [vid]: { ...cur, comments: cur.comments + 1 } };
        });
      }
    } catch (e) {
      // not sent
    }
  };

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

      const token = await ensureToken();
      if (!token) throw new Error('login required');
      const blob = await (await fetch(picked.uri)).blob();
      const up = await fetch(
        SUPABASE_URL + '/storage/v1/object/videos/' + fileName,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + token,
            'Content-Type': mime,
          },
          body: blob,
        }
      );
      if (!up.ok) throw new Error(await up.text());

      const publicUrl =
        SUPABASE_URL + '/storage/v1/object/public/videos/' + fileName;
      const ins = await api('videos', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          username: myName,
          user_id: myId,
          description: description,
          video_url: publicUrl,
        }),
      });
      if (!ins.ok) throw new Error(await ins.text());

      setPicked(null);
      setDescription('');
      setStatus('');
      await loadVideos();
      await loadStats();
      setCurrentIndex(0);
      setActiveFeed('forYou');
      setActiveTab('Home');
    } catch (e) {
      setStatus(t('uploadFailed') + ' ' + String(e.message).slice(0, 200));
    }
    setUploading(false);
  };

  const renderHeader = () => (
    <View style={styles.header} pointerEvents="box-none">
      <View style={styles.headerRow}>
        <View style={styles.logoRow}>
          <Text style={styles.logoV}>V</Text>
          <Text style={styles.logoRest}>YRA</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setActiveTab('Follow')}>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Chat')}>
            <Text style={styles.headerIcon}>🔔</Text>
            {totalUnread > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.badgeText}>{totalUnread > 9 ? '9+' : totalUnread}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => setActiveTab('Profile')}
          >
            <Text style={styles.avatarLetter}>{myName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {[
          ['forYou', 'tabForYou'],
          ['following', 'tabFollowing'],
          ['trending', 'tabTrending'],
        ].map(([key, label]) =>
          activeFeed === key ? (
            <TouchableOpacity key={key} onPress={() => switchFeed(key)}>
              <LinearGradient
                colors={['#7C3AED', '#C026D3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabPill}
              >
                <Text style={styles.tabPillText}>{t(label)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={key}
              style={[styles.tabPill, styles.tabPillOff]}
              onPress={() => switchFeed(key)}
            >
              <Text style={styles.tabPillText}>{t(label)}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  const renderVideo = (video, index) => {
    const c = countOf(video.id);
    const isFollowed = !!following[video.user_id];
    const showFollow = !!video.user_id && video.user_id !== myId;
    return (
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

        {!video.url && (
          <View style={styles.centerContent}>
            <Text style={styles.videoTitle}>VYRA</Text>
            <Text style={styles.videoSubtitle}>{t('tagline')}</Text>
          </View>
        )}

        <View style={styles.bottomShade} />

        <View style={styles.videoInfo}>
          <View style={styles.userRow}>
            <TouchableOpacity onPress={() => openUser(video.user_id, video.user)}>
              <Text style={styles.username}>@{video.user}</Text>
            </TouchableOpacity>
            {showFollow && (
              <TouchableOpacity
                style={[styles.followPill, isFollowed && styles.followPillOn]}
                onPress={() => toggleFollow(video.user_id)}
              >
                <Text style={styles.followPillText}>
                  {isFollowed ? t('btnFollowing') : '+ ' + t('btnFollow')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.description}>
            {video.descKey ? t(video.descKey) : video.description}
          </Text>
          <Text style={styles.music}>♫ {t(video.musicKey || 'originalSound')}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => openUser(video.user_id, video.user)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {(video.user || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            {showFollow && !isFollowed && (
              <TouchableOpacity
                style={styles.avatarPlus}
                onPress={() => toggleFollow(video.user_id)}
              >
                <Text style={styles.avatarPlusText}>+</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => toggleLike(video)}>
            <Text style={styles.actionIcon}>{myLikes[video.id] ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>{formatCount(c.likes)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => openComments(video)}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{formatCount(c.comments)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => shareVideo(video)}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>{t('share')}</Text>
          </TouchableOpacity>

          {showFollow && (
            <TouchableOpacity style={styles.action} onPress={() => setMenuVideo(video)}>
              <Text style={styles.actionIcon}>⋯</Text>
            </TouchableOpacity>
          )}

          <View style={styles.railDivider} />

          {[
            ['📡', 'LIVE', () => setActiveTab('Live'), '#FF2D55'],
            ['💬', 'CHAT', () => setActiveTab('Chat'), '#7DD3FC'],
            ['👥', 'ROOMS', () => openHub('rooms'), '#86EFAC'],
            ['📣', 'ADS', () => openHub('ads'), '#FCD34D'],
            ['🏆', 'REWARDS', () => openHub('rewards'), '#FBBF24'],
          ].map(([icon, label, fn, color]) => (
            <TouchableOpacity key={label} style={styles.shortcut} onPress={fn}>
              <Text style={styles.shortcutIcon}>{icon}</Text>
              <Text style={[styles.shortcutText, { color: color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const meRow = board.find((b) => b.id === myId);
  const myPoints = meRow ? meRow.points : 0;
  const myLevel = Math.floor(myPoints / 50) + 1;
  const levelProgress = (myPoints % 50) / 50;

  const totalUnread = conversations
    .filter((c) => !blocked[c.id])
    .reduce((sum, c) => sum + c.unread, 0);
  const followedPeople = people.filter((pe) => following[pe.id]);
  const discoverPeople = people.filter((pe) => pe.id !== myId && !blocked[pe.id]);

  const personRow = (pe) => (
    <View key={pe.id} style={styles.creatorRow}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => openUser(pe.id, pe.username)}
      >
        <View style={styles.smallAvatar}>
          <Text style={styles.avatarLetter}>{pe.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.creatorName}>@{pe.username}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.followPill, following[pe.id] && styles.followPillOn]}
        onPress={() => toggleFollow(pe.id)}
      >
        <Text style={styles.followPillText}>
          {following[pe.id] ? t('btnFollowing') : '+ ' + t('btnFollow')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!authReady) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator color="#A855F7" size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        t={t}
        lang={lang}
        changeLang={changeLang}
        onSession={saveSession}
      />
    );
  }

  if (banned) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: 'center', justifyContent: 'center', padding: 30 },
        ]}
      >
        <Text style={styles.liveBig}>🚫</Text>
        <Text style={[styles.screenTitle, { marginTop: 16 }]}>{t('bannedTitle')}</Text>
        <Text style={styles.liveInfo}>{t('bannedText')}</Text>
        <TouchableOpacity
          style={[styles.logoutBtn, { alignSelf: 'stretch' }]}
          onPress={logout}
        >
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {activeTab === 'Home' && (
        <View style={{ flex: 1 }}>
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
                <View style={styles.centerContent}>
                  <Text style={styles.emptyTitle}>{t('noVideos')}</Text>
                  <Text style={styles.emptySub}>{t('followHint')}</Text>
                </View>
              </View>
            ) : (
              feedVideos.map(renderVideo)
            )}
          </ScrollView>
          {renderHeader()}
        </View>
      )}

      {activeTab !== 'Home' && (
        <ScrollView
          style={{ flex: 1, padding: 22 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>VYRA</Text>

          {activeTab === 'Friends' ? (
            <View style={{ marginTop: 30 }}>
              <Text style={styles.screenTitle}>{t('friendsTitle')}</Text>
              {followedPeople.length === 0 ? (
                <Text style={styles.screenSub}>{t('friendsEmpty')}</Text>
              ) : (
                followedPeople.map(personRow)
              )}
            </View>
          ) : activeTab === 'Follow' ? (
            <View style={{ marginTop: 30 }}>
              <Text style={styles.screenTitle}>{t('discoverTitle')}</Text>
              <Text style={styles.screenSub}>{t('explore')}</Text>
              {discoverPeople.map(personRow)}
            </View>
          ) : activeTab === 'User' && viewUser ? (
            <View style={{ alignItems: 'center', marginTop: 30 }}>
              <View style={styles.bigAvatar}>
                <Text style={{ fontSize: 34, color: '#FFFFFF', fontWeight: 'bold' }}>
                  {viewUser.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>
                @{viewUser.username}
              </Text>
              <Text style={{ color: '#A855F7', marginTop: 18, fontSize: 16 }}>
                {counts ? counts.posts : '-'} {t('posts')}     {counts ? counts.followers : '-'} {t('followers')}     {counts ? counts.following : '-'} {t('followingCount')}
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { alignSelf: 'stretch' }]}
                onPress={() => toggleFollow(viewUser.id)}
              >
                <Text style={styles.primaryBtnText}>
                  {following[viewUser.id] ? t('btnFollowing') : t('btnFollow')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutBtn, { marginTop: 14 }]}
                onPress={() => openChat(viewUser.id, viewUser.username)}
              >
                <Text style={styles.logoutText}>{t('messageBtn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => blockUser(viewUser.id, viewUser.username)}
              >
                <Text style={styles.logoutText}>{t('blockUser')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutBtn, { marginTop: 12 }]}
                onPress={() => openReport('user', viewUser.id)}
              >
                <Text style={styles.logoutText}>{t('reportUser')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setActiveTab('Home')}>
                <Text style={styles.authSwitch}>‹ {t('navHome')}</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'Hub' ? (
            hubView === 'rooms' ? (
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={styles.backRow} onPress={() => setHubView('home')}>
                  <Text style={styles.backArrow}>‹</Text>
                  <Text style={styles.screenTitle}>{t('roomsTitle')}</Text>
                </TouchableOpacity>
                <Text style={styles.screenSub}>{t('roomsSub')}</Text>
                {ROOMS.map(([key, icon, colors]) => (
                  <TouchableOpacity key={key} onPress={soon} style={{ marginTop: 14 }}>
                    <LinearGradient
                      colors={colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.roomBig}
                    >
                      <Text style={styles.roomBigIcon}>{icon}</Text>
                      <Text style={styles.roomBigName}>{t(key)}</Text>
                      <View style={styles.soonTag}>
                        <Text style={styles.soonText}>{t('soon')}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={soon} style={{ marginTop: 16 }}>
                  <LinearGradient
                    colors={['#7C3AED', '#C026D3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createRoom}
                  >
                    <Text style={styles.createRoomText}>＋ {t('createRoom')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : hubView === 'rewards' ? (
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={styles.backRow} onPress={() => setHubView('home')}>
                  <Text style={styles.backArrow}>‹</Text>
                  <Text style={styles.screenTitle}>{t('rewardsTitle')}</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#4C1D95', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pointsCard}
                >
                  <Text style={styles.pointsLabel}>{t('myPoints')}</Text>
                  <Text style={styles.pointsBig}>⭐ {formatCount(myPoints)}</Text>
                  <Text style={styles.pointsLevel}>
                    {t('level')} {myLevel}
                  </Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: Math.round(levelProgress * 100) + '%' }]} />
                  </View>
                </LinearGradient>
                <Text style={[styles.screenSub, { marginTop: 18 }]}>{t('pointsRule')}</Text>
                <Text style={{ color: '#777777', marginTop: 12 }}>{t('giftsSoon')}</Text>
              </View>
            ) : hubView === 'ads' ? (
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={styles.backRow} onPress={() => setHubView('home')}>
                  <Text style={styles.backArrow}>‹</Text>
                  <Text style={styles.screenTitle}>{t('adsTitle')}</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#1D4ED8', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.adsBanner}
                >
                  <Text style={styles.adsLogo}>VYRA ADS</Text>
                  <Text style={styles.adsText}>{t('adsBanner')}</Text>
                </LinearGradient>
                <Text style={[styles.screenSub, { marginTop: 18 }]}>{t('adsSoon')}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 20 }}>
                <View style={styles.hubCard}>
                  <TouchableOpacity style={styles.hubHead} onPress={() => setHubView('rooms')}>
                    <Text style={styles.hubIcon}>💬</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hubTitle}>{t('roomsTitle')}</Text>
                      <Text style={styles.hubSub}>{t('roomsSub')}</Text>
                    </View>
                    <View style={styles.chev}>
                      <Text style={styles.chevText}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.roomGrid}>
                    {ROOMS.map(([key, icon, colors]) => (
                      <TouchableOpacity key={key} style={styles.roomTileWrap} onPress={soon}>
                        <LinearGradient
                          colors={colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.roomTile}
                        >
                          <Text style={styles.roomIcon}>{icon}</Text>
                          <Text style={styles.roomName}>{t(key)}</Text>
                          <View style={styles.soonTag}>
                            <Text style={styles.soonText}>{t('soon')}</Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity onPress={soon}>
                    <LinearGradient
                      colors={['#7C3AED', '#C026D3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.createRoom}
                    >
                      <Text style={styles.createRoomText}>＋ {t('createRoom')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.hubCard}>
                  <TouchableOpacity style={styles.hubHead} onPress={() => setHubView('rewards')}>
                    <Text style={styles.hubIcon}>🎁</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hubTitle}>{t('rewardsTitle')}</Text>
                      <Text style={styles.hubSub}>{t('rewardsSub')}</Text>
                    </View>
                    <View style={styles.chev}>
                      <Text style={styles.chevText}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <LinearGradient
                    colors={['#2E1065', '#6D28D9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pointsRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pointsLabel}>{t('myPoints')}</Text>
                      <Text style={styles.pointsMid}>⭐ {formatCount(myPoints)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.seeMoreBtn}
                      onPress={() => setHubView('rewards')}
                    >
                      <Text style={styles.seeMoreText}>{t('seeMore')} ›</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                <View style={styles.hubCard}>
                  <TouchableOpacity style={styles.hubHead} onPress={() => setHubView('ads')}>
                    <Text style={styles.hubIcon}>📣</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hubTitle}>{t('adsTitle')}</Text>
                      <Text style={styles.hubSub}>{t('adsSub')}</Text>
                    </View>
                    <View style={styles.chev}>
                      <Text style={styles.chevText}>›</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setHubView('ads')}>
                    <LinearGradient
                      colors={['#1D4ED8', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.adsBanner}
                    >
                      <Text style={styles.adsLogo}>VYRA ADS</Text>
                      <Text style={styles.adsText}>{t('adsBanner')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : activeTab === 'Ranking' ? (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.screenTitle}>🏆 {t('rankingTitle')}</Text>
              <Text style={styles.screenSub}>{t('rankingSub')}</Text>
              {board.filter((b) => !blocked[b.id]).length === 0 ? (
                <Text style={{ color: '#777777', marginTop: 16 }}>{t('noRanking')}</Text>
              ) : (
                board
                  .filter((b) => !blocked[b.id])
                  .slice(0, 30)
                  .map((b, i) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.creatorRow, b.id === myId && styles.meRow]}
                      onPress={() => openUser(b.id, b.username)}
                    >
                      <Text style={styles.rankNum}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                      </Text>
                      <View style={styles.smallAvatar}>
                        <Text style={styles.avatarLetter}>
                          {String(b.username).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.creatorName}>@{b.username}</Text>
                      <Text style={styles.rankPts}>
                        {formatCount(b.points)} {t('points')}
                      </Text>
                    </TouchableOpacity>
                  ))
              )}
            </View>
          ) : activeTab === 'Live' ? (
            <View style={{ alignItems: 'center', marginTop: 70 }}>
              <Text style={styles.liveBig}>📡</Text>
              <Text style={styles.liveTitle}>{t('liveTitle')}</Text>
              <Text style={styles.liveSoon}>{t('liveSoon')}</Text>
              <Text style={styles.liveInfo}>{t('liveInfo')}</Text>
            </View>
          ) : activeTab === 'Chat' ? (
            <View style={{ marginTop: 30 }}>
              <Text style={styles.screenTitle}>{t('messagesTitle')}</Text>
              {conversations.filter((c) => !blocked[c.id]).length === 0 ? (
                <Text style={styles.screenSub}>{t('noChats')}</Text>
              ) : (
                conversations
                  .filter((c) => !blocked[c.id])
                  .map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.creatorRow}
                      onPress={() => openChat(c.id, nameOf(c.id))}
                    >
                      <View style={styles.smallAvatar}>
                        <Text style={styles.avatarLetter}>
                          {nameOf(c.id).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.convName}>@{nameOf(c.id)}</Text>
                        <Text numberOfLines={1} style={styles.chatPreview}>
                          {c.last.content}
                        </Text>
                      </View>
                      {c.unread > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{c.unread}</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ))
              )}

              {followedPeople.length > 0 ? (
                <Text style={[styles.screenSub, { marginTop: 26 }]}>
                  {t('chatWithFollowed')}
                </Text>
              ) : null}
              {followedPeople.map((pe) => (
                <TouchableOpacity
                  key={pe.id}
                  style={styles.creatorRow}
                  onPress={() => openChat(pe.id, pe.username)}
                >
                  <View style={styles.smallAvatar}>
                    <Text style={styles.avatarLetter}>
                      {pe.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.creatorName}>@{pe.username}</Text>
                  <Text style={{ fontSize: 20 }}>💬</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : activeTab === 'Create' ? (
            <View style={{ marginTop: 40 }}>
              <Text style={[styles.screenTitle, { textAlign: 'center' }]}>
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
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <View style={styles.bigAvatar}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>
                @{myName}
              </Text>
              <Text style={{ color: '#A855F7', marginTop: 18, fontSize: 16 }}>
                {counts ? counts.posts : '-'} {t('posts')}     {counts ? counts.followers : '-'} {t('followers')}     {counts ? counts.following : '-'} {t('followingCount')}
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { alignSelf: 'stretch' }]}
                onPress={() => setActiveTab('Create')}
              >
                <Text style={styles.primaryBtnText}>{t('publishVideo')}</Text>
              </TouchableOpacity>

              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => setActiveTab('Friends')}>
                  <Text style={styles.quickText}>👥 {t('friendsTitle')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => setActiveTab('Chat')}>
                  <Text style={styles.quickText}>💬 Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => openHub('home')}>
                  <Text style={styles.quickText}>🎁 Hub</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: 'white', marginTop: 30 }}>{t('myVideos')}</Text>
              <Text style={{ color: '#999999', marginTop: 10 }}>
                {remote.length > 0 ? t('videosInFeed') : t('videosWillAppear')}
              </Text>

              <Text style={{ color: 'white', marginTop: 30 }}>{t('blockedList')}</Text>
              {Object.keys(blocked).filter((k) => blocked[k]).length === 0 ? (
                <Text style={{ color: '#999999', marginTop: 10 }}>{t('noBlocked')}</Text>
              ) : (
                Object.keys(blocked)
                  .filter((k) => blocked[k])
                  .map((bid) => {
                    const pe = people.find((x) => x.id === bid);
                    return (
                      <View key={bid} style={[styles.creatorRow, { alignSelf: 'stretch' }]}>
                        <Text style={styles.creatorName}>
                          @{pe ? pe.username : bid.slice(0, 8)}
                        </Text>
                        <TouchableOpacity
                          style={styles.followPill}
                          onPress={() => unblockUser(bid)}
                        >
                          <Text style={styles.followPillText}>{t('unblock')}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
              )}

              <Text style={{ color: 'white', marginTop: 30 }}>{t('language')}</Text>
              <View style={styles.langRow}>
                {[
                  ['fr', 'Français'],
                  ['ar', 'العربية'],
                  ['en', 'English'],
                ].map(([code, label]) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.langBtn, lang === code && styles.langBtnActive]}
                    onPress={() => changeLang(code)}
                  >
                    <Text style={styles.langText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
              ) : comments.filter((c) => !blocked[c.user_id]).length === 0 ? (
                <Text style={styles.noComments}>{t('noComments')}</Text>
              ) : (
                comments
                  .filter((c) => !blocked[c.user_id])
                  .map((c) => (
                  <View key={c.id} style={styles.commentRow}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.commentUser}>@{c.username}</Text>
                      {c.user_id && c.user_id !== myId ? (
                        <TouchableOpacity
                          onPress={() => {
                            setCommentsFor(null);
                            setTimeout(() => openReport('comment', c.id), 350);
                          }}
                        >
                          <Text style={styles.flag}>⚑</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
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

      <Modal
        visible={chatWith !== null}
        animationType="slide"
        onRequestClose={() => {
          setChatWith(null);
          loadConversations();
        }}
      >
        <KeyboardAvoidingView
          style={[styles.container, { paddingTop: insets.top }]}
          behavior="padding"
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => {
                setChatWith(null);
                loadConversations();
              }}
            >
              <Text style={styles.chatBack}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.chatTitle}>@{chatWith ? chatWith.username : ''}</Text>
            <TouchableOpacity
              onPress={() => chatWith && openReport('user', chatWith.id)}
            >
              <Text style={styles.flag}>⚑</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={chatScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 14 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              chatScrollRef.current && chatScrollRef.current.scrollToEnd({ animated: true })
            }
          >
            {chatMessages.map((m) => {
              const mine = m.sender_id === myId;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.8}
                  onLongPress={
                    mine
                      ? undefined
                      : () =>
                          Alert.alert(t('reportMessage'), '', [
                            { text: t('cancel'), style: 'cancel' },
                            {
                              text: t('reportTitle'),
                              onPress: () => openReport('message', m.id),
                            },
                          ])
                  }
                  style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}
                >
                  <Text style={styles.bubbleText}>{m.content}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {chatError ? <Text style={styles.chatErr}>{chatError}</Text> : null}

          <View style={[styles.chatInputRow, { paddingBottom: insets.bottom + 10 }]}>
            <TextInput
              style={styles.commentInput}
              placeholder={t('messagePlaceholder')}
              placeholderTextColor="#777777"
              value={chatText}
              onChangeText={setChatText}
              maxLength={1000}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendBtnText}>{t('send')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={menuVideo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVideo(null)}
      >
        <TouchableOpacity
          style={styles.menuWrap}
          activeOpacity={1}
          onPress={() => setMenuVideo(null)}
        >
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + 12 }]}>
            {menuVideo && String(menuVideo.id).startsWith('r') ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openReport('video', String(menuVideo.id).slice(1))}
              >
                <Text style={styles.menuText}>{t('reportVideo')}</Text>
              </TouchableOpacity>
            ) : null}
            {menuVideo && menuVideo.user_id ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openReport('user', menuVideo.user_id)}
              >
                <Text style={styles.menuText}>{t('reportUser')}</Text>
              </TouchableOpacity>
            ) : null}
            {menuVideo && menuVideo.user_id ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => blockUser(menuVideo.user_id, menuVideo.user)}
              >
                <Text style={styles.menuText}>{t('blockUser')}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVideo(null)}>
              <Text style={[styles.menuText, { color: '#999999' }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={reportTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReportTarget(null)}
      >
        <KeyboardAvoidingView style={styles.modalWrap} behavior="padding">
          <View style={[styles.sheet, { height: '80%', paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('reportTitle')}</Text>
              <TouchableOpacity onPress={() => setReportTarget(null)}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {reportDone ? (
              <View>
                <Text style={styles.reportThanks}>{t('reportSent')}</Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setReportTarget(null)}
                >
                  <Text style={styles.primaryBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {REASONS.map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.reasonRow, reportReason === key && styles.reasonRowOn]}
                    onPress={() => setReportReason(key)}
                  >
                    <Text style={styles.reasonText}>{t(label)}</Text>
                  </TouchableOpacity>
                ))}

                <TextInput
                  style={styles.input}
                  placeholder={t('reportDetails')}
                  placeholderTextColor="#777777"
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  maxLength={500}
                  multiline
                />

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { opacity: reportReason && !reportBusy ? 1 : 0.4 },
                  ]}
                  disabled={!reportReason || reportBusy}
                  onPress={sendReport}
                >
                  {reportBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t('send')}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View
        style={[
          styles.bottomBar,
          { height: 64 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        {NAV.map(([key, icon, label]) => {
          if (key === 'Create') {
            return (
              <TouchableOpacity
                key={key}
                style={styles.navItem}
                onPress={() => setActiveTab('Create')}
              >
                <LinearGradient
                  colors={['#7C3AED', '#C026D3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.navPlus}
                >
                  <Text style={styles.navPlusText}>＋</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.navItem}
              onPress={() => setActiveTab(key)}
            >
              <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
              <Text style={[styles.navText, active && styles.activeNav]}>{t(label)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0612',
  },

  video: {
    width: width,
    height: height - 85,
    position: 'relative',
  },

  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    backgroundColor: 'rgba(0,0,0,0.3)',
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

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    color: '#A855F7',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 2,
  },

  headerIcon: {
    fontSize: 24,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  pillIcon: {
    fontSize: 24,
  },

  pillNum: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  pillLabel: {
    color: '#CCCCCC',
    fontSize: 10,
  },

  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  tabPillActive: {
    backgroundColor: '#A855F7',
  },

  tabPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  videoInfo: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    width: width - 100,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  username: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  followPill: {
    borderWidth: 1.5,
    borderColor: '#F43F9E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  followPillOn: {
    borderColor: '#888888',
  },

  followPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  description: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },

  music: {
    color: '#EEEEEE',
    fontSize: 12,
  },

  actions: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    alignItems: 'center',
    gap: 11,
  },

  avatarWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#A855F7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  avatarPlus: {
    position: 'absolute',
    bottom: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F43F9E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarPlusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 18,
  },

  action: {
    alignItems: 'center',
  },

  actionIcon: {
    color: '#FFFFFF',
    fontSize: 26,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },

  bottomBar: {
    backgroundColor: '#0E0818',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    fontSize: 22,
    opacity: 0.55,
  },

  navIconActive: {
    opacity: 1,
  },

  navText: {
    color: '#888888',
    fontSize: 10,
    marginTop: 3,
  },

  activeNav: {
    color: '#A855F7',
  },

  liveIcon: {
    fontSize: 30,
    opacity: 1,
  },

  liveText: {
    color: '#FF2D55',
    fontWeight: 'bold',
    fontSize: 11,
  },

  screenTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },

  screenSub: {
    color: '#AAAAAA',
    marginTop: 12,
  },

  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },

  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  creatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },

  bigAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
  },

  liveBig: {
    fontSize: 70,
  },

  liveTitle: {
    color: '#FF2D55',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 10,
  },

  liveSoon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 18,
    textAlign: 'center',
  },

  liveInfo: {
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
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

  authWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  authLogo: {
    color: '#A855F7',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },

  authTagline: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 30,
  },

  authTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  authInput: {
    backgroundColor: '#202020',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    fontSize: 15,
  },

  authError: {
    color: '#FF6B6B',
    marginTop: 14,
  },

  authInfo: {
    color: '#7CE3A1',
    marginTop: 14,
  },

  authSwitch: {
    color: '#C9B8F0',
    textAlign: 'center',
    marginTop: 20,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkBoxOn: {
    backgroundColor: '#A855F7',
  },

  checkText: {
    color: '#DDDDDD',
    flex: 1,
  },

  logoutBtn: {
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: '#F43F9E',
    borderRadius: 12,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flag: {
    color: '#999999',
    fontSize: 18,
    paddingHorizontal: 6,
  },

  menuWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  menuSheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
  },

  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2A',
  },

  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  reasonRow: {
    backgroundColor: '#202020',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  reasonRowOn: {
    borderColor: '#A855F7',
  },

  reasonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  reportThanks: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2A',
  },

  chatBack: {
    color: '#FFFFFF',
    fontSize: 34,
    paddingHorizontal: 8,
    lineHeight: 36,
  },

  chatTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 8,
  },

  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#A855F7',
  },

  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: '#242424',
  },

  bubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#2A2A2A',
  },

  chatErr: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 4,
  },

  convName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  chatPreview: {
    color: '#999999',
    marginTop: 2,
  },

  badge: {
    backgroundColor: '#F43F9E',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  navBadge: {
    position: 'absolute',
    top: -2,
    right: 14,
    backgroundColor: '#F43F9E',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  logoV: {
    color: '#C026D3',
    fontSize: 30,
    fontWeight: '900',
  },

  logoRest: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7C3AED',
    borderWidth: 2,
    borderColor: '#C026D3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#F43F9E',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  tabPillOff: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  railDivider: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  shortcut: {
    alignItems: 'center',
  },

  shortcutIcon: {
    fontSize: 21,
  },

  shortcutText: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  backArrow: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 40,
  },

  hubCard: {
    backgroundColor: '#150C26',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2D1B4E',
    padding: 14,
    marginBottom: 16,
  },

  hubHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  hubIcon: {
    fontSize: 30,
  },

  hubTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  hubSub: {
    color: '#A99BC4',
    fontSize: 12,
    marginTop: 2,
  },

  chev: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4C1D95',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chevText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: 'bold',
  },

  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  roomTileWrap: {
    width: '48.5%',
    marginBottom: 10,
  },

  roomTile: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 112,
    justifyContent: 'center',
  },

  roomIcon: {
    fontSize: 30,
  },

  roomName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },

  soonTag: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },

  soonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  createRoom: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },

  createRoomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  roomBig: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  roomBigIcon: {
    fontSize: 34,
  },

  roomBigName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },

  pointsRow: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pointsLabel: {
    color: '#D8B4FE',
    fontSize: 13,
  },

  pointsMid: {
    color: '#FDE68A',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },

  seeMoreBtn: {
    backgroundColor: '#4C1D95',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  seeMoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  pointsCard: {
    borderRadius: 18,
    padding: 22,
    marginTop: 14,
  },

  pointsBig: {
    color: '#FDE68A',
    fontSize: 44,
    fontWeight: '900',
    marginTop: 6,
  },

  pointsLevel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },

  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE68A',
  },

  adsBanner: {
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
  },

  adsLogo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },

  adsText: {
    color: '#E0E7FF',
    fontSize: 14,
    marginTop: 6,
  },

  navPlus: {
    width: 62,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navPlusText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },

  rankNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    width: 36,
    textAlign: 'center',
  },

  rankPts: {
    color: '#FDE68A',
    fontWeight: 'bold',
  },

  meRow: {
    borderWidth: 1.5,
    borderColor: '#C026D3',
  },

  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    alignSelf: 'stretch',
  },

  quickBtn: {
    flex: 1,
    backgroundColor: '#1E1233',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  quickText: {
    color: '#FFFFFF',
    fontSize: 13,
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
