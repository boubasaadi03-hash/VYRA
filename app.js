
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

export default function App() {
  const [likes, setLikes] = useState(1250);
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />

      <View style={styles.header}>
        <Text style={styles.logo}>VYRA</Text>
        <Text style={styles.subtitle}>Discover the world</Text>
      </View>

      <ScrollView>
        <View style={styles.video}>
          <Text style={styles.play}>▶</Text>
          <Text style={styles.videoText}>VYRA VIDEO FEED</Text>
          <Text style={styles.coming}>Your world starts here</Text>
        </View>

        <View style={styles.profile}>
          <Text style={styles.username}>@vyra_user</Text>
          <Text style={styles.description}>
            Welcome to VYRA 🌍
            {'\n'}Meet people. Share moments. Make friends.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setLiked(!liked);
              setLikes(liked ? likes - 1 : likes + 1);
            }}
          >
            <Text style={styles.action}>
              {liked ? '❤️' : '🤍'} {likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.action}>💬 Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.action}>↗ Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>EXPLORE VYRA</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottom}>
        <Text style={styles.nav}>🏠 Home</Text>
        <Text style={styles.nav}>🔍 Discover</Text>
        <Text style={styles.nav}>➕ Create</Text>
        <Text style={styles.nav}>💬 Messages</Text>
        <Text style={styles.nav}>👤 Profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    color: '#B85CFF',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  subtitle: {
    color: '#999',
    fontSize: 12,
  },
  video: {
    width: width - 24,
    height: height * 0.52,
    marginHorizontal: 12,
    backgroundColor: '#24202D',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  play: {
    color: '#FFFFFF',
    fontSize: 55,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  coming: {
    color: '#B85CFF',
    marginTop: 8,
  },
  profile: {
    padding: 18,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  description: {
    color: '#BBBBBB',
    marginTop: 8,
    lineHeight: 23,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  action: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A94DFF',
    margin: 18,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  nav: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
