<div align="center">

<img src="./logo.png" width="150" alt="Insta2YouTube Logo"/>

# 🎵 Insta2YouTube: Your Ultimate Reel to Playlist Syncer

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](#)
[![YouTube API](https://img.shields.io/badge/YouTube_API-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](#)

A full-stack cross-platform app that automatically identifies songs from Instagram Reels using AI and adds them directly to your YouTube playlists. 🚀

[**Live Demo**](https://insta2-you-tube.vercel.app/) • [**Report Bug**](https://github.com/buildbyabhi/Insta2YouTube/issues) • [**Request Feature**](https://github.com/buildbyabhi/Insta2YouTube/issues)

</div>

---

## 🌟 About The Project

Ever liked a song on an Instagram Reel but forgot to add it to your playlist? **Insta2YouTube** solves exactly this! By leveraging the power of Google's Gemini AI, this app analyzes shared Reels, identifies the background track, and automatically adds it to your chosen YouTube playlist. 

### 🏗️ Architecture Flow

```mermaid
graph TD
    A[📱 User - Mobile App] -->|Share Instagram Reel| B(Background Service)
    B -->|Extract Media/Context| C{🧠 Gemini AI}
    C -->|Analyze & Identify Song| D[🎵 Song Metadata]
    D -->|Search & Auth| E[▶️ YouTube API]
    E -->|Add to User's Playlist| F[✅ Successfully Synced!]
    
    classDef ai fill:#8E75B2,stroke:#fff,stroke-width:2px,color:#fff;
    classDef app fill:#20232A,stroke:#61DAFB,stroke-width:2px,color:#fff;
    classDef yt fill:#FF0000,stroke:#fff,stroke-width:2px,color:#fff;
    
    class C ai;
    class A,B app;
    class E,F yt;
```

### ✨ Features
- **Seamless Integration:** Share an Instagram Reel directly to the app.
- **AI-Powered Identification:** Uses Gemini AI to accurately identify songs.
- **YouTube Sync:** Automatically adds the identified song to your YouTube playlist.
- **Cross-Platform:** Built with React Native to work natively on your mobile device.
- **Clean UI:** Simple, intuitive, and modern user interface.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- React Native environment setup
- API Keys: Google Gemini API, YouTube Data API v3

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/buildbyabhi/Insta2YouTube.git
   cd Insta2YouTube
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Run the App**
   ```bash
   npm run start
   ```

---

## 🛠️ Tech Stack
- **Frontend:** React Native, Expo
- **Backend/Logic:** Node.js, Express (if applicable)
- **AI:** Google Gemini API
- **External Services:** YouTube Data API v3

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

**Don't forget to give the project a star! Thanks again! ⭐**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📬 Contact
**Abhishek Kumar**
- GitHub: [@buildbyabhi](https://github.com/buildbyabhi)
- Email: buildbyabhi.dev@gmail.com
- Portfolio: [buildbyabhi.github.io](https://buildbyabhi.github.io/)

---
<div align="center">
  <i>Made with ❤️ by Abhishek</i>
</div>
