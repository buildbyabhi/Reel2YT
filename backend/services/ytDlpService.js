import ytDlp from 'yt-dlp-exec';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ffmpegPath from 'ffmpeg-static';

export const extractAudio = async (reelUrl) => {
  try {
    const tempDir = os.tmpdir();
    const outputFilename = `audio_${Date.now()}.mp3`;
    const outputPath = path.join(tempDir, outputFilename);

    // 1. Check for local cookies.txt file
    let cookiesPath = path.join(process.cwd(), 'cookies.txt');
    
    // 2. If deploying to cloud (Render, Heroku, etc), read from Environment Variable
    if (!fs.existsSync(cookiesPath) && process.env.INSTAGRAM_COOKIES) {
      cookiesPath = path.join(tempDir, `cookies_${Date.now()}.txt`);
      fs.writeFileSync(cookiesPath, process.env.INSTAGRAM_COOKIES);
    }

    const flags = {
      extractAudio: true,
      audioFormat: 'mp3',
      ffmpegLocation: ffmpegPath,
      output: outputPath,
      noWarnings: true
    };

    if (fs.existsSync(cookiesPath)) {
      flags.cookies = cookiesPath;
    }

    console.log(`Executing yt-dlp via exec wrapper for: ${reelUrl}`);
    await ytDlp(reelUrl, flags);

    if (fs.existsSync(outputPath)) {
      return outputPath;
    } else {
      throw new Error('Output file not found after yt-dlp execution');
    }
  } catch (error) {
    console.error('Error in ytDlpService:', error.message || error);
    return null;
  }
};
