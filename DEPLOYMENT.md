# BioHome: Life Support for Deep Space - Deployment Guide

## 🚀 Game Complete!

The BioHome NASA Space Apps Challenge game has been successfully implemented with all requested features:

### ✅ Completed Features

1. **Build Phase (Earth Configuration)**
   - Drag-and-drop modular components in 100x50 block grid
   - 10 different component types with detailed pixel art
   - Crew selection (1-6 members) with specialized roles
   - Real-time cost and mass calculations
   - Zoom and pan controls for large builds

2. **Simulation Phase (Mars Journey)**
   - Real-time resource management with NASA-accurate data
   - Variable time acceleration (1 real second = 1 simulated day)
   - 6 resource gauges: Oxygen, CO2, Food, Water, Energy, Health
   - Crew dot system with space occupation (2 people per spot)
   - A* pathfinding for crew movement

3. **Advanced Systems**
   - Random events system (solar flares, equipment failures, etc.)
   - 5 bio-experiments for win condition
   - Spacewalk mechanic for external repairs
   - Supabase leaderboard integration with local fallback
   - 8-bit pixel art style with zoom functionality

4. **NASA Data Integration**
   - Realistic life support parameters
   - Accurate oxygen production from algae
   - Crew health and psychological factors
   - Equipment failure rates and radiation exposure

### 🎮 How to Play

1. **Build Phase**: Select crew members and drag components to build your spacecraft
2. **Launch**: Click "Launch Mission" when ready
3. **Simulation**: Manage resources, handle events, complete experiments
4. **Win**: Reach Mars with crew alive and all 5 experiments complete

### 🌐 Deployment

**GitHub Repository**: https://github.com/idkwhatitshouldbeman/NASA_thingy.git

**Netlify Deployment**:
1. Connect GitHub repository to Netlify
2. Set build command to empty (static site)
3. Set publish directory to root
4. Deploy automatically on git push

**Local Testing**:
```bash
# Serve locally
python -m http.server 8000
# or
npx serve .
```

### 🔧 Technical Details

- **Platform**: Pure HTML/CSS/JavaScript with p5.js
- **Graphics**: 8-bit pixel art with zoom controls
- **Performance**: Optimized for 60 FPS
- **Database**: Supabase with local storage fallback
- **Responsive**: Works on desktop and mobile

### 📊 Game Mechanics

- **Components**: 10 types with unique pixel art and functions
- **Crew Roles**: 6 specialized roles with unique bonuses
- **Resources**: 6 monitored variables with realistic decay
- **Events**: 10-20% chance per simulated day for random events
- **Experiments**: 5 bio-experiments required to win
- **Scoring**: Based on survival time, experiments, and cost efficiency

### 🏆 Leaderboard

- Global leaderboard via Supabase
- Local storage fallback for offline play
- Score calculation: (survival_time × experiments_completed) / cost

### 🎯 NASA Space Apps Challenge 2025

This game fulfills Challenge #15: BioHome: Life Support for Deep Space
- Educational content about space life support systems
- Realistic NASA data integration
- Competitive gameplay with leaderboard
- Accessible to general public while impressing judges

## 🎉 Mission Complete!

The game is ready for the NASA Space Apps Challenge 2025 submission!
