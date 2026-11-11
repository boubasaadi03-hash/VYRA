
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

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [following, setFollowing] = useState({});
  const [likes, setLikes] = useState({});
  const [activeFeed, setActiveFeed] = useState('For You');

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
      key={video.id}
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
        <View style={styles.otherScreen}>
          <Text style={styles.logo}>VYRA</Text>
          <Text style={styles.screenTitle}>
            {activeTab}
          </Text>
          <Text style={styles.comingSoon}>
            Coming soon...
          </Text>
        </View>
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
