import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execPromise = util.promisify(exec);

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

    const cookiesFlag = fs.existsSync(cookiesPath) ? `--cookies "${cookiesPath}"` : '';

    // Using yt-dlp to extract audio with packaged ffmpeg
    const command = `yt-dlp -x --audio-format mp3 ${cookiesFlag} --ffmpeg-location "${ffmpegPath}" -o "${outputPath}" "${reelUrl}"`;
    
    console.log(`Executing: ${command}`);
    await execPromise(command);

    if (fs.existsSync(outputPath)) {
      return outputPath;
    } else {
      throw new Error('Output file not found after yt-dlp execution');
    }
  } catch (error) {
    console.error('Error in ytDlpService:', error);
    return null;
  }
};
