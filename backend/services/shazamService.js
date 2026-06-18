import fs from 'fs';
import { Shazam } from 'node-shazam';

export const identifySong = async (audioFilePath) => {
  try {
    const shazam = new Shazam();
    const result = await shazam.recognise(audioFilePath, "en-US");

    // Clean up the temporary audio file
    fs.unlinkSync(audioFilePath);

    if (result && result.track) {
      return {
        title: result.track.title,
        artist: result.track.subtitle,
        album: result.track.sections?.find(s => s.type === 'SONG')?.metadata?.find(m => m.title === 'Album')?.text
      };
    } else {
      console.error('Shazam API failed to recognize song or returned empty result');
      return null;
    }
  } catch (error) {
    console.error('Error in shazamService:', error);
    
    // Attempt cleanup if it failed
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }
    
    return null;
  }
};
