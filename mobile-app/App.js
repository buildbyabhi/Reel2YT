import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal, FlatList } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useShareIntent } from 'expo-share-intent';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '218386241996-icajnrark6ga63si8gbtnmdacll310hv.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });
}

WebBrowser.maybeCompleteAuthSession();

// Point to the live Render backend
const BACKEND_URL = 'https://insta2youtube.onrender.com';

export default function App() {
  const { hasShareIntent, shareIntent, resetShareIntent, error: shareError } = useShareIntent();
  const [reelUrl, setReelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [songInfo, setSongInfo] = useState(null);
  const [youtubeToken, setYoutubeToken] = useState(null);

  // New states for playlist selection
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Setup Google Auth (Web Fallback)
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '218386241996-icajnrark6ga63si8gbtnmdacll310hv.apps.googleusercontent.com',
    expoClientId: '218386241996-icajnrark6ga63si8gbtnmdacll310hv.apps.googleusercontent.com', 
    webClientId: '218386241996-icajnrark6ga63si8gbtnmdacll310hv.apps.googleusercontent.com',
    androidClientId: '218386241996-7h0020i79ioq07egsb1tc1sph8jqjrh5.apps.googleusercontent.com',
    prompt: 'select_account',
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('youtubeAccessToken');
        if (storedToken) {
          setYoutubeToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load session', e);
      }
    };
    loadSession();
  }, []);

  const handleSignIn = async () => {
    if (Platform.OS === 'web') {
      promptAsync();
    } else {
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        setYoutubeToken(tokens.accessToken);
        await AsyncStorage.setItem('youtubeAccessToken', tokens.accessToken);
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        setErrorMessage('Failed to sign in with Google.');
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && response?.type === 'success') {
      const { authentication } = response;
      setYoutubeToken(authentication.accessToken);
      AsyncStorage.setItem('youtubeAccessToken', authentication.accessToken).catch(console.error);
    }
  }, [response]);

  const handleLogout = async () => {
    setYoutubeToken(null);
    await AsyncStorage.removeItem('youtubeAccessToken');
  };

  useEffect(() => {
    // If we receive a URL from the native share sheet
    if (hasShareIntent && shareIntent.value) {
      setReelUrl(shareIntent.value);
      resetShareIntent();
    }
  }, [hasShareIntent, shareIntent]);

  const handleIdentifyReel = async () => {
    if (!reelUrl) {
      setErrorMessage('Please enter an Instagram Reel URL');
      return;
    }

    setLoading(true);
    setSongInfo(null);
    setErrorMessage('');

    try {
      const identifyRes = await axios.post(`${BACKEND_URL}/api/identify-reel`, {
        reelUrl,
      });

      if (identifyRes.data && identifyRes.data.song) {
        setSongInfo(identifyRes.data.song);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMessage(err.response.data.error);
      } else {
        setErrorMessage('Failed to identify Reel. Instagram might be blocking it.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openPlaylistModal = async () => {
    setShowPlaylistModal(true);
    setCreatingNew(false);
    setNewPlaylistName('');
    setSelectedPlaylistId(null);
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/playlists`, {
        youtubeAccessToken: youtubeToken,
      });
      if (res.data && res.data.playlists) {
        setPlaylists(res.data.playlists);
      }
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!songInfo) return;
    
    if (!creatingNew && !selectedPlaylistId) {
      Alert.alert('Error', 'Please select a playlist or create a new one.');
      return;
    }

    if (creatingNew && !newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a name for the new playlist.');
      return;
    }
    
    setAdding(true);
    try {
      await axios.post(`${BACKEND_URL}/api/add-to-playlist`, {
        songData: songInfo,
        youtubeAccessToken: youtubeToken,
        playlistId: creatingNew ? null : selectedPlaylistId,
        newPlaylistName: creatingNew ? newPlaylistName : null,
      });

      Alert.alert('Success', `"${songInfo.title}" was successfully added to your YouTube playlist!`);
      setShowPlaylistModal(false);
      setSongInfo(null);
      setReelUrl('');
      setErrorMessage('Success! Added to playlist.');
    } catch (err) {
      console.error(err);
      let errorMsg = 'Failed to add to playlist.';
      if (err.response?.data?.error) {
        errorMsg += ` Reason: ${err.response.data.error}`;
      }
      setErrorMessage(errorMsg);
      setShowPlaylistModal(false);
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = () => {
    setSongInfo(null);
    setReelUrl('');
    setErrorMessage('');
  };

  const handleListenOnYouTube = () => {
    if (!songInfo) return;
    const query = encodeURIComponent(`${songInfo.title} ${songInfo.artist}`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { justifyContent: youtubeToken ? 'space-between' : 'center', paddingHorizontal: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: youtubeToken ? 'flex-start' : 'center' }}>
            <MaterialCommunityIcons name="youtube" size={32} color="#FF0000" style={{ marginRight: 10 }} />
            <Text style={styles.title}>Insta2YouTube</Text>
          </View>
          {youtubeToken && (
            <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
              <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://raw.githubusercontent.com/buildbyabhi/Insta2YouTube/main/mobile-app/assets/logo.png' }} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

      {!youtubeToken ? (
        <View style={styles.authContainer}>
          <Text style={styles.subtitle}>Log in to connect your account and start saving identified tracks.</Text>
          
          <TouchableOpacity 
            style={Platform.OS === 'web' && !request ? [styles.primaryButton, styles.disabledButton] : styles.primaryButton} 
            onPress={handleSignIn}
            disabled={Platform.OS === 'web' ? !request : false}
          >
            <Text style={styles.buttonText}>LOG IN WITH GOOGLE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.appContainer}>
          <View style={styles.connectedBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" style={{ marginRight: 5 }} />
            <Text style={styles.successText}>YouTube Connected</Text>
          </View>
          
          <Text style={styles.label}>Paste Instagram Reel URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="https://www.instagram.com/reel/..."
              placeholderTextColor="#b3b3b3"
              value={reelUrl}
              onChangeText={(text) => {
                setReelUrl(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardAppearance="dark"
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {loading || adding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1ed760" />
              <Text style={styles.loadingText}>{adding ? "ADDING TO PLAYLIST..." : "IDENTIFYING SONG..."}</Text>
            </View>
          ) : !songInfo ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleIdentifyReel}>
              <Text style={styles.buttonText}>IDENTIFY SONG</Text>
            </TouchableOpacity>
          ) : null}

          {songInfo && !adding && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>IDENTIFIED SONG</Text>
              </View>
              <Text style={styles.resultSongTitle}>{songInfo.title}</Text>
              <Text style={styles.resultArtist}>{songInfo.artist}</Text>

              <TouchableOpacity style={styles.youtubeButton} onPress={handleListenOnYouTube}>
                <MaterialCommunityIcons name="youtube" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonTextWhite}>LISTEN ON YOUTUBE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryButton, { marginTop: 15 }]} onPress={openPlaylistModal}>
                <Text style={styles.buttonText}>ADD TO PLAYLIST</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel & Start Over</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        )}
      </ScrollView>

      {/* Playlist Selection Modal */}
      <Modal visible={showPlaylistModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Playlist</Text>
            
            {!creatingNew ? (
              <>
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  style={styles.playlistList}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.playlistItem, selectedPlaylistId === item.id && styles.selectedPlaylistItem]}
                      onPress={() => setSelectedPlaylistId(item.id)}
                    >
                      <MaterialCommunityIcons 
                        name={selectedPlaylistId === item.id ? "radiobox-marked" : "radiobox-blank"} 
                        size={24} 
                        color={selectedPlaylistId === item.id ? "#1ed760" : "#b3b3b3"} 
                      />
                      <Text style={styles.playlistItemText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
                
                <TouchableOpacity 
                  style={styles.createNewOption}
                  onPress={() => { setCreatingNew(true); setSelectedPlaylistId(null); }}
                >
                  <MaterialCommunityIcons name="plus-circle" size={24} color="#1ed760" />
                  <Text style={styles.createNewText}>Create New Playlist</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.createNewContainer}>
                <Text style={styles.label}>New Playlist Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., My Chill Beats"
                    placeholderTextColor="#b3b3b3"
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                  />
                </View>
                <TouchableOpacity style={styles.cancelLink} onPress={() => setCreatingNew(false)}>
                  <Text style={styles.cancelText}>Back to List</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowPlaylistModal(false)}
                disabled={adding}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, (!selectedPlaylistId && !creatingNew) || (creatingNew && !newPlaylistName) ? styles.disabledButton : {}]} 
                onPress={handleAddToPlaylist}
                disabled={(!selectedPlaylistId && !creatingNew) || (creatingNew && !newPlaylistName) || adding}
              >
                {adding ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.buttonText}>CONFIRM</Text>
                )}
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
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  authContainer: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  appContainer: {
    padding: 24,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 500,
    alignSelf: 'center',
    marginBottom: 30,
  },
  successText: {
    color: '#1ed760',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 500,
    marginBottom: 30,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#ff333320',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff333350',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1ed760',
    paddingVertical: 14,
    paddingHorizontal: 43,
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  youtubeButton: {
    flexDirection: 'row',
    backgroundColor: '#ff0000',
    paddingVertical: 14,
    paddingHorizontal: 43,
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 24,
  },
  buttonTextWhite: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  cancelLink: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disabledButton: {
    backgroundColor: '#4d4d4d',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#b3b3b3',
    marginTop: 15,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  resultContainer: {
    marginTop: 40,
    padding: 24,
    backgroundColor: '#181818',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b3b3b3',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  resultSongTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  resultArtist: {
    fontSize: 16,
    color: '#b3b3b3',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  playlistList: {
    maxHeight: 250,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedPlaylistItem: {
    backgroundColor: '#33333350',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  playlistItemText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
  },
  createNewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  createNewText: {
    color: '#1ed760',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  createNewContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  modalCancelText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#1ed760',
    padding: 14,
    borderRadius: 500,
    alignItems: 'center',
  },
});
