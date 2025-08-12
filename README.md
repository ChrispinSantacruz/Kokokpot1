# 🎰 Kokok The Roach - Slot Machine Game

A modern slot machine game built with HTML5, CSS3, JavaScript, and Node.js backend with MongoDB integration.

## 🎮 Features

- **Slot Machine Gameplay**: Classic 3-reel slot machine with animated spins
- **User Authentication**: Player login system with persistent progress
- **Score Tracking**: Save and track player scores and achievements
- **Leaderboard**: Real-time top scores ranking
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Sound Effects**: Background music and game sound effects
- **Progress Persistence**: Save game progress between sessions
- **Anti-Cheat System**: Players are locked after completing 30 spins

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kokok-pot-game.git
   cd kokok-pot-game
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in server directory
   MONGO_URI=mongodb://localhost:27017/kokokpot
   PORT=8081
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open the game**
   - Navigate to `http://localhost:8081`
   - Create a username and start playing!

## 🏗️ Project Structure

```
kokok-pot-game/
├── css/                 # Stylesheets
│   ├── style.css       # Main styles and responsive design
│   └── game.css        # Game-specific styles
├── js/                  # JavaScript files
│   ├── auth.js         # Authentication logic
│   ├── game.js         # Core game mechanics
│   ├── leaderboard.js  # Leaderboard management
│   ├── ui.js           # UI animations and effects
│   ├── sound.js        # Audio management
│   └── config.js       # API configuration
├── images/              # Game assets and images
├── server/              # Backend server
│   ├── src/
│   │   └── index.js    # Express server and API endpoints
│   └── package.json    # Backend dependencies
├── *.html               # Frontend pages
└── README.md           # This file
```

## 🎯 Game Rules

- **Starting Spins**: Each player starts with 30 spins
- **Symbols**: Various symbols with different point values
- **Scoring**: Points are awarded based on symbol combinations
- **Free Spins**: Bonus spins can be earned during gameplay
- **Game End**: Game ends after 30 spins, player is locked from replaying

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Player login/registration

### Game Progress
- `POST /api/progress` - Save current game progress
- `POST /api/score` - Submit final game score

### Leaderboard
- `GET /api/leaderboard` - Get top scores
- `GET /api/debug/users` - Debug endpoint for user data

## 🎨 Customization

### Adding New Symbols
1. Add symbol image to `images/ruleta/ruleta/`
2. Update `symbolAssets` in `js/game.js`
3. Adjust `symbolWeights` for probability

### Modifying Game Balance
- Edit `symbolWeights` in `js/game.js`
- Adjust point values in `calculateScore()` method

### Styling Changes
- Modify `css/style.css` for general styles
- Edit `css/game.css` for game-specific styles

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- **Desktop**: Full layout with all features
- **Mobile Portrait**: Optimized layout for vertical orientation
- **Touch Controls**: Responsive buttons and controls

## 🚀 Deployment

### Backend (Render/Heroku)
1. Push code to GitHub
2. Connect repository to Render/Heroku
3. Set environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `PORT`: Server port (auto-assigned by platform)

### Frontend (Vercel/Netlify)
1. Deploy from GitHub repository
2. Set build command: `npm run build` (if needed)
3. Set publish directory: `/` (root)

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update `MONGO_URI` in backend environment

## 🐛 Troubleshooting

### Common Issues

**Game not loading**
- Check browser console for errors
- Verify backend server is running
- Check MongoDB connection

**Scores not saving**
- Verify API endpoints are accessible
- Check MongoDB connection string
- Review server logs for errors

**Responsive issues**
- Clear browser cache
- Test on different devices
- Check CSS media queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Game assets and design inspiration
- MongoDB and Node.js communities
- Modern web development tools and frameworks

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review server logs for error details

---

**Happy Gaming! 🎰✨**

