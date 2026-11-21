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
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

const SUPABASE_URL = 'https://izaovotpdkfabizdzpew.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pZGo3ceCADgIYO_NF85Ujw_exlkdErd';

const { width, height } = Dimensions.get('window');

const demoVideos = [
  {
    id: 'd1',
    user: 'vyra_creator',
    description: 'Welcome to VYRA! 🌍',
    music: 'Original sound',
    color: '#30205B',
  },
  {
    id: 'd2',
    user: 'world_traveler',
    description: 'Discover the world with VYRA ✈️',
    music: 'Travel vibes',
    color: '#164B65',
  },
  {
    id: 'd3',
    user: 'daily_life',
    description: 'Share your best moments ❤️',
    music: 'Daily moments',
    color: '#642D48',
  },
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
  const insets = useSafeAreaInsets();

  const videos = [...remote, ...demoVideos];

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
      setStatus('Upload failed: ' + String(e.message).slice(0, 200));
    }
    setUploading(false);
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

      <View style={styles.videoTop}>
        <Text style={styles.logo}>VYRA</Text>
        <View style={styles.feedButtons}>
          <TouchableOpacity onPress={() => setActiveFeed('Following')}>
            <Text
              style={[
                styles.feedText,
                activeFeed === 'Following' && styles.selectedFeed,
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveFeed('For You')}>
            <Text
              style={[
                styles.feedText,
                activeFeed === 'For You' && styles.selectedFeed,
              ]}
            >
              For You
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!video.url && (
        <View style={styles.centerContent}>
          <Text style={styles.videoTitle}>VYRA</Text>
          <Text style={styles.videoSubtitle}>Your world. Your moments.</Text>
        </View>
      )}

      <View style={styles.videoInfo}>
        <Text style={styles.username}>@{video.user}</Text>
        <Text style={styles.description}>{video.description}</Text>
        <Text style={styles.music}>♫ {video.music}</Text>
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
            {likes[video.id] ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => toggleFollow(video.id)}
        >
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>
            {following[video.id] ? 'Following' : 'Follow'}
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
          {videos.map(renderVideo)}
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
                Your world. Your moments. 🌍
              </Text>
              <Text style={{ color: '#A855F7', marginTop: 30, fontSize: 18 }}>
                {remote.length} Posts     0 Followers     0 Following
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                My Videos
              </Text>
              <Text style={{ color: '#999999', marginTop: 15 }}>
                {remote.length > 0
                  ? 'Your videos are in the Home feed.'
                  : 'Your videos will appear here.'}
              </Text>
            </View>
          ) : activeTab === 'Discover' ? (
            <View style={{ marginTop: 35 }}>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
                Discover 🌍
              </Text>
              <Text style={{ color: '#AAAAAA', marginTop: 15 }}>
                Explore people around the world
              </Text>
              {['World Traveler', 'Daily Life', 'VYRA Creator'].map((name, i) => (
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
                    👤 {name}
                  </Text>
                  <Text style={{ color: '#A855F7', marginTop: 8 }}>
                    Discover creator
                  </Text>
                </View>
              ))}
            </View>
          ) : activeTab === 'Messages' ? (
            <View style={{ marginTop: 35 }}>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
                Messages ✉️
              </Text>
              <Text style={{ color: '#AAAAAA', marginTop: 15 }}>
                Your conversations
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                No messages yet.
              </Text>
              <Text style={{ color: '#999999', marginTop: 10 }}>
                Start connecting with people on VYRA.
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
                Create on VYRA
              </Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={pickVideo}>
                <Text style={styles.primaryBtnText}>
                  {picked ? 'Change video' : 'Choose a video'}
                </Text>
              </TouchableOpacity>

              {picked ? (
                <Text style={{ color: '#CCCCCC', marginTop: 12, textAlign: 'center' }}>
                  Video selected ✓
                </Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Write a caption..."
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
                  <Text style={styles.primaryBtnText}>Upload</Text>
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
              {tab}
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
