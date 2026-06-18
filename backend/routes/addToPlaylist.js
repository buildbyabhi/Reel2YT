import express from 'express';
import { addToPlaylist, getOrCreatePlaylist } from '../services/youtubeService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { songData, youtubeAccessToken } = req.body;

    if (!songData || !youtubeAccessToken) {
      return res.status(400).json({ error: 'songData and youtubeAccessToken are required' });
    }

    const dynamicPlaylistId = await getOrCreatePlaylist(youtubeAccessToken);
    const result = await addToPlaylist(songData, youtubeAccessToken, dynamicPlaylistId);

    res.status(200).json({
      message: 'Successfully added to playlist',
      result
    });

  } catch (error) {
    console.error('Error adding to playlist:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
