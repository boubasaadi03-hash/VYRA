// VYRA
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const videos = [
  {
    id: 1,
    user: 'vyra_creator',
    name: 'VYRA Creator',
    description: 'Welcome to VYRA! 🌍',
    music: 'Original sound',
    color: '#30205B',
  },
  {
    id: 2,
    user: 'world_traveler',
    name: 'World Traveler',
    description: 'Discover the world with VYRA ✈️',
    music: 'Travel vibes',
    color: '#164B65',
  },
  {
    id: 3,
    user: 'daily_life',
    name: 'Daily Life',
    description: 'Share your best moments ❤️',
    music: 'Daily moments',
    color: '#642D48',
  },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('Home');
  const [following, setFollowing] = useState({});
  const [likes, setLikes] = useState({});
  const [activeFeed, setActiveFeed] = useState('For You');
 const insets = useSafeAreaInsets();
  const [pageHeight, setPageHeight] = useState(height - 85);
  const toggleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFollow = (id) => {
    setFollowing(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderVideo = (video) => (
    <View
      key={}style={[styles.video, { backgroundColor: video.color, height: pageHeight }]}
      style={[styles.video, { backgroundColor: video.color }]}
    >
      <View style={styles.videoTop}>
        <Text style={styles.logo}>VYRA</Text>
        <View style={styles.feedButtons}>
          <TouchableOpacity
            onPress={() => setActiveFeed('Following')}
          >
            <Text style={[
              styles.feedText,
              activeFeed === 'Following' && styles.selectedFeed
            ]}>
              Following
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFeed('For You')}
          >
            <Text style={[
              styles.feedText,
              activeFeed === 'For You' && styles.selectedFeed
            ]}>
              For You
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.videoTitle}>VYRA</Text>
        <Text style={styles.videoSubtitle}>
          Your world. Your moments.
        </Text>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.username}>@{video.user}</Text>
        <Text style={styles.description}>
          {video.description}
        </Text>
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
          <Text style={styles.actionIcon}>＋</Text>
          <Text style={styles.actionText}>
            {following[video.id] ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080808"
    />

    {activeTab === 'Home' && (
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
      >
        {videos.map(renderVideo)}
      </ScrollView>
    )}

    

    {activeTab !== 'Home' && (
      <ScrollView style={{ flex: 1, padding: 22 }}>
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
                0 Posts     0 Followers     0 Following
              </Text>
              <Text style={{ color: 'white', marginTop: 35 }}>
                My Videos
              </Text>
              <Text style={{ color: '#999999', marginTop: 15 }}>
                Your videos will appear here.
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
                <View key={i} style={{ backgroundColor: '#202020', padding: 20, marginTop: 15, borderRadius: 12 }}>
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
                Messages ✉
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
            <View style={{ alignItems: 'center', marginTop: 70 }}>
              <Text style={{ color: '#A855F7', fontSize: 28, fontWeight: 'bold' }}>
                Create on VYRA
              </Text>
              <Text style={{ color: 'white', fontSize: 55, marginTop: 35 }}>
                ＋
              </Text>
              <Text style={{ color: 'white', fontSize: 18, marginTop: 20 }}>
                Share your moments
              </Text>
              <Text style={{ color: '#999999', marginTop: 12 }}>
                Video upload will be connected next.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        {[
          ['Home', '⌂'],
          ['Discover', '⌕'],
          ['Create', '＋'],
          ['Messages', '✉'],
          ['Profile', '◉'],
        ].map(([tab, icon]) => (
          <TouchableOpacity
            key={tab}
            style={styles.navItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.navIcon,
              activeTab === tab && styles.activeNav
            ]}>
              {icon}
            </Text>
            <Text style={[
              styles.navText,
              activeTab === tab && styles.activeNav
            ]}>
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

  otherScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  screenTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 25,
  },

  comingSoon: {
    color: '#999999',
    marginTop: 12,
    fontSize: 15,
  },
});
