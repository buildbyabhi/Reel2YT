import { google } from 'googleapis';

export const getOrCreatePlaylist = async (accessToken) => {
  const youtube = google.youtube({
    version: 'v3',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const playlistTitle = 'Instagram Reels Audio';

  try {
    // 1. Search for existing playlist
    let nextPageToken = null;
    do {
      const response = await youtube.playlists.list({
        part: 'snippet',
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      const playlists = response.data.items || [];
      for (const playlist of playlists) {
        if (playlist.snippet.title === playlistTitle) {
          console.log(`Found existing playlist: ${playlist.id}`);
          return playlist.id;
        }
      }
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // 2. If not found, create it
    console.log(`Playlist not found. Creating a new one: ${playlistTitle}`);
    const createResponse = await youtube.playlists.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: playlistTitle,
          description: 'Music identified automatically from Instagram Reels'
        },
        status: {
          privacyStatus: 'private' // keep it private by default
        }
      }
    });

    console.log(`Created new playlist: ${createResponse.data.id}`);
    return createResponse.data.id;

  } catch (error) {
    console.error('Error getting or creating playlist:', error.message);
    throw error;
  }
};

export const addToPlaylist = async (songData, accessToken, targetPlaylistId) => {
  try {
    const youtube = google.youtube({
      version: 'v3',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const query = `${songData.title} ${songData.artist} official audio`;
    console.log(`Searching YouTube for: ${query}`);

    // 1. Search for the video
    const searchResponse = await youtube.search.list({
      part: 'id,snippet',
      q: query,
      type: 'video',
      maxResults: 1
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      throw new Error('No YouTube video found for this song');
    }

    const videoId = searchResponse.data.items[0].id.videoId;
    console.log(`Found video ID: ${videoId}`);

    // 2. Add video to the playlist
    const insertResponse = await youtube.playlistItems.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: targetPlaylistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
          }
        }
      }
    });

    console.log('Successfully added to playlist:', insertResponse.data.id);
    return insertResponse.data;
  } catch (error) {
    console.error('Error in youtubeService:', error.message);
    throw error;
  }
};
