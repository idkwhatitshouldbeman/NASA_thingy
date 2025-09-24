# BioHome: Life Support for Deep Space

A hyper-realistic simulation game for the NASA Space Apps Challenge 2025, specifically Challenge #15: BioHome: Life Support for Deep Space.

## Game Overview

This browser-based survival simulation puts players in control of a Mars mission crew. Players start on Earth, build a spaceship using modular components, select crew members, and manage the journey to Mars while keeping the crew alive and completing bio-experiments.

## Features

- **Build Phase**: Design your spacecraft with modular life support components
- **Crew Management**: Select 1-6 crew members with specialized roles
- **Real-time Simulation**: Manage resources during the accelerated journey to Mars
- **NASA Data Integration**: Realistic life support parameters based on actual NASA research
- **Random Events**: Handle solar flares, equipment failures, and other space challenges
- **Bio-Experiments**: Complete 5 different experiments to win the mission
- **Leaderboard**: Compete with other players for the lowest mission cost

## Technical Details

- **Platform**: Pure HTML/CSS/JavaScript with p5.js for graphics
- **Deployment**: Static files optimized for Netlify
- **Database**: Supabase integration for leaderboard functionality
- **Graphics**: 8-bit pixel art style with zoom functionality
- **Performance**: Optimized for 60 FPS on standard hardware

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/idkwhatitshouldbeman/NASA_thingy.git
   cd NASA_thingy
   ```

2. Open `index.html` in a web browser or serve locally:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. For Netlify deployment:
   - Connect your GitHub repository to Netlify
   - Set build command to empty (static site)
   - Set publish directory to root

## Game Mechanics

### Build Phase
- Drag and drop components in a 100x50 block grid (25m x 12.5m)
- Each component has specific costs, mass, and capabilities
- Crew selection affects mission success and costs
- Total mission cost calculated based on components and crew

### Simulation Phase
- Real-time resource management with NASA-accurate parameters
- Time acceleration: 1 real second = 1 simulated day (adjustable)
- Monitor oxygen, CO2, food, water, energy, temperature, humidity, and crew health
- Handle random events and equipment failures
- Complete bio-experiments to win

### Components
- **Algae Bioreactors**: Produce oxygen from algae
- **Hydroponics Bays**: Grow food for the crew
- **Water Recyclers**: Recycle 93-98% of water
- **Solar Panels**: Generate electrical power
- **Crew Quarters**: Living space for astronauts
- **Experiment Modules**: Conduct bio-experiments
- **Thermal Control**: Maintain optimal temperature
- **Humidity Regulators**: Control air moisture

### Crew Roles
- **Engineer**: Reduces equipment failure rates
- **Botanist**: Increases hydroponic food production
- **Doctor**: Improves crew health recovery
- **Pilot**: Reduces mission time
- **Scientist**: Increases experiment completion rate
- **Commander**: Improves crew morale

## NASA Data Integration

The game uses real NASA data for:
- Life support system requirements
- Oxygen production rates from algae
- Food and water consumption per crew member
- Radiation exposure limits
- Psychological health factors
- Equipment failure rates

## Contributing

This project was developed for the NASA Space Apps Challenge 2025. Feel free to submit issues or pull requests for improvements.

## License

This project is open source and available under the MIT License.

## Credits

- NASA Space Apps Challenge 2025
- NASA Life Support Systems Research
- International Space Station (ISS) data
- p5.js library for graphics
- Supabase for backend services
