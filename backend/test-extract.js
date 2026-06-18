import { extractAudio } from './services/ytDlpService.js';

const run = async () => {
  const result = await extractAudio('https://www.instagram.com/reel/DZadsczzqrj/');
  console.log('Result:', result);
};
run();
