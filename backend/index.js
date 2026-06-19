import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import identifyReelRoute from './routes/identifyReel.js';
import addToPlaylistRoute from './routes/addToPlaylist.js';
import playlistsRoute from './routes/playlists.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/identify-reel', identifyReelRoute);
app.use('/api/add-to-playlist', addToPlaylistRoute);
app.use('/api/playlists', playlistsRoute);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve the compiled mobile-app (frontend)
const frontendPath = path.join(__dirname, '../mobile-app/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend is being served at http://localhost:${PORT}`);
});
