import express from 'express';
import { extractAudio } from '../services/ytDlpService.js';
import { identifySong } from '../services/shazamService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let { reelUrl } = req.body;

    if (!reelUrl) {
      return res.status(400).json({ error: 'reelUrl is required' });
    }

    reelUrl = reelUrl.trim();

    // 1. Download audio snippet from Instagram Reel
    console.log(`Extracting audio from: ${reelUrl}`);
    const audioFilePath = await extractAudio(reelUrl);

    if (!audioFilePath) {
      return res.status(500).json({ error: 'Failed to extract audio from Reel' });
    }

    // 2. Identify the song using node-shazam
    console.log(`Identifying song from: ${audioFilePath}`);
    const songData = await identifySong(audioFilePath);

    if (!songData) {
      return res.status(404).json({ error: 'Could not identify the song' });
    }

    console.log(`Identified Song: ${songData.title} by ${songData.artist}`);

    res.status(200).json({
      message: 'Reel identified successfully',
      song: songData
    });

  } catch (error) {
    console.error('Error identifying reel:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
