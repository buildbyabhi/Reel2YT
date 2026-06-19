import express from 'express';
import { getUserPlaylists } from '../services/youtubeService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { youtubeAccessToken } = req.body;

    if (!youtubeAccessToken) {
      return res.status(400).json({ error: 'youtubeAccessToken is required' });
    }

    const playlists = await getUserPlaylists(youtubeAccessToken);

    res.status(200).json({
      playlists
    });

  } catch (error) {
    console.error('Error fetching playlists:', error);
    
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
