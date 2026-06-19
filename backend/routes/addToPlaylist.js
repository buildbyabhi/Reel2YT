import express from 'express';
import { addToPlaylist, getOrCreatePlaylist, createCustomPlaylist } from '../services/youtubeService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { songData, youtubeAccessToken, playlistId, newPlaylistName } = req.body;

    if (!songData || !youtubeAccessToken) {
      return res.status(400).json({ error: 'songData and youtubeAccessToken are required' });
    }

    let targetPlaylistId = null;

    if (newPlaylistName) {
      // 1. Create a brand new custom playlist
      targetPlaylistId = await createCustomPlaylist(youtubeAccessToken, newPlaylistName);
    } else if (playlistId) {
      // 2. Use the provided existing playlist
      targetPlaylistId = playlistId;
    } else {
      // 3. Fallback to default behavior (Instagram Reels Audio)
      targetPlaylistId = await getOrCreatePlaylist(youtubeAccessToken);
    }

    const result = await addToPlaylist(songData, youtubeAccessToken, targetPlaylistId);

    res.status(200).json({
      message: 'Successfully added to playlist',
      result
    });

  } catch (error) {
    console.error('Error adding to playlist:', error);
    
    // Better error message extraction for frontend
    let errorMsg = 'Internal server error';
    if (error.response && error.response.data && error.response.data.error) {
      errorMsg = error.response.data.error.message;
    } else if (error.message) {
      errorMsg = error.message;
    }

    res.status(500).json({ error: errorMsg, details: error.message });
  }
});

export default router;
