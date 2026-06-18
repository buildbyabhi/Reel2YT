# Insta2YouTube Playlist 🎵🎥

Insta2YouTube Playlist is a full-stack application that seamlessly bridges the gap between Instagram Reels and YouTube Music. Whenever you find a catchy song in an Instagram Reel, simply copy the URL and paste it into this app (or use the native Share sheet on Android). The app will automatically identify the song and add it directly to a dedicated playlist on your YouTube account!

## ✨ Features
* **AI-Powered Song Identification**: Uses Google's Gemini 1.5 Flash AI to intelligently identify the track name and artist from an Instagram Reel's caption, hashtags, and visual context.
* **Seamless YouTube Integration**: Automatically searches YouTube and adds the identified track to a "Insta2YouTube Playlist" on your logged-in YouTube account.
* **Cross-Platform**: Available as a beautifully designed Web App and a Native Android App.
* **Native Android Sharing**: Share a Reel directly from the Instagram app to the Insta2YouTube Android app via the native share sheet.
* **Secure Google Authentication**: Implements standard Google OAuth 2.0 (using official Play Services SDK on Android and Web Auth on browsers) to securely manage your YouTube playlists.

## 🚀 Live Links
* **Web App (Vercel)**: [https://insta2-you-tube.vercel.app/](https://insta2-you-tube.vercel.app/)
* **Android App (APK)**: [Download Latest APK](https://expo.dev/accounts/buildbyabhi/projects/mobile-app/builds/a69b0735-9a30-4339-8f96-2ab738a73f17)
* **Backend API (Render)**: `https://insta2youtube.onrender.com`

## 🛠️ Technology Stack
* **Backend**: Node.js, Express.js
* **AI Processing**: Google Generative AI (`gemini-1.5-flash`)
* **Web Scraping**: Puppeteer (to fetch Instagram Reel context)
* **API Integration**: YouTube Data API v3
* **Frontend/Mobile**: React Native, Expo, Expo Router
* **Mobile Authentication**: `@react-native-google-signin/google-signin`
* **Web Authentication**: `expo-auth-session`

## 📂 Project Structure
* `/backend`: Contains the Express server, Puppeteer scraping logic, Gemini AI processing, and YouTube API calls.
* `/mobile-app`: Contains the React Native (Expo) code for both the Web application and the Android APK.

## ⚙️ Setup & Installation
### Backend
1. Navigate to `/backend`: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
4. Start the server: `npm start` (Runs on port 3000)

### Frontend (Web & Mobile)
1. Navigate to `/mobile-app`: `cd mobile-app`
2. Install dependencies: `npm install`
3. Run locally: `npx expo start`
4. **Build for Android**: `npx eas-cli build -p android --profile preview`

## 🔒 Authentication Configuration
This project uses Google Cloud Console for OAuth.
- **Web Client ID**: Configured for Vercel and local development.
- **Android Client ID**: Created and linked to the EAS build's SHA-1 fingerprint (`D6:51...`).

*Developed with ❤️*
