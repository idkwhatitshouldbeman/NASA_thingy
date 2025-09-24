// BioHome: Life Support for Deep Space - Main Game Script
// NASA Space Apps Challenge 2025

// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'title';
        this.gamePhase = 'build'; // 'build' or 'simulation'
        this.timeSpeed = 1; // 1 real second = 1 simulated day
        this.simulationTime = 0; // days
        this.isPaused = false;
        
        // Build Phase State
        this.crew = [];
        this.components = [];
        this.totalCost = 800; // Base cost in millions
        this.totalMass = 0; // tons
        
        // Simulation Phase State
        this.resources = {
            oxygen: 21.0, // percentage
            co2: 0.3, // percentage
            food: 2500, // kcal per crew per day
            water: 2.5, // liters per crew per day
            energy: 7.5, // kWh per day
            temperature: 22.5, // celsius
            humidity: 50.0, // percentage
            health: 100.0 // percentage
        };
        
        this.experiments = [
            { name: "Algae Growth Rate", progress: 0, completed: false },
            { name: "Hydroponic Yield", progress: 0, completed: false },
            { name: "Water Recycling Efficiency", progress: 0, completed: false },
            { name: "Crew Psychological Health", progress: 0, completed: false },
            { name: "Radiation Shielding Effectiveness", progress: 0, completed: false }
        ];
        
        this.events = [];
        this.crewPositions = new Map();
        this.spacewalkActive = false;
        this.spacewalkCrew = null;
        this.spacewalkTime = 0;
        this.spacewalkTarget = null;
        
        // NASA Data Constants (realistic values)
        this.NASA_CONSTANTS = {
            O2_TARGET_MIN: 20.0,
            O2_TARGET_MAX: 25.0,
            CO2_TARGET_MIN: 0.1,
            CO2_TARGET_MAX: 0.5,
            FOOD_TARGET_MIN: 2500,
            FOOD_TARGET_MAX: 3500,
            WATER_TARGET_MIN: 2.0,
            WATER_TARGET_MAX: 3.0,
            ENERGY_TARGET_MIN: 5.0,
            ENERGY_TARGET_MAX: 10.0,
            TEMP_TARGET_MIN: 18.0,
            TEMP_TARGET_MAX: 27.0,
            HUMIDITY_TARGET_MIN: 25.0,
            HUMIDITY_TARGET_MAX: 75.0,
            
            // Decay rates per hour
            O2_DECAY_PER_CREW: 0.5,
            CO2_GROWTH_PER_CREW: 0.2,
            FOOD_DECAY_PER_CREW: 125, // kcal per hour
            WATER_DECAY_PER_CREW: 0.104, // liters per hour
            ENERGY_DECAY_BASE: 0.2, // kWh per hour
            
            // Production rates
            ALGAE_O2_PRODUCTION: 0.00573, // mol O2 per gram per hour
            HYDROPONICS_FOOD_PRODUCTION: 16.7, // kcal per hour per m²
            SOLAR_ENERGY_PRODUCTION: 0.021, // kWh per hour per m²
        };
    }
}

// Component Definitions
class Component {
    constructor(type, x, y, rotation = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.connected = false;
        this.active = true;
        this.efficiency = 1.0;
        
        // Component-specific properties
        this.setupComponentProperties();
    }
    
    setupComponentProperties() {
        const componentData = {
            'algae-small': {
                width: 5, height: 3, cost: 5, mass: 0.5,
                energyUsage: 0.5, o2Production: 0.0372,
                walkSpace: { width: 3, height: 2 },
                colors: { body: '#00ff00', frame: '#000000', hub: '#666666' }
            },
            'algae-large': {
                width: 6, height: 3, cost: 7, mass: 0.8,
                energyUsage: 1.0, o2Production: 0.0745,
                walkSpace: { width: 4, height: 2 },
                colors: { body: '#00ff00', frame: '#000000', hub: '#666666' }
            },
            'hydroponics': {
                width: 5, height: 3, cost: 2, mass: 0.3,
                energyUsage: 0.047, foodProduction: 77,
                walkSpace: { width: 3, height: 2 },
                colors: { body: '#ff0000', frame: '#000000', hub: '#666666' }
            },
            'water-recycler': {
                width: 8, height: 6, cost: 3, mass: 1.2,
                energyUsage: 0.2, waterRecycling: 0.95,
                walkSpace: { width: 4, height: 4 },
                colors: { body: '#0066ff', frame: '#000000', hub: '#666666' }
            },
            'solar-panels': {
                width: 12, height: 6, cost: 1, mass: 0.8,
                energyProduction: 0.5, walkSpace: { width: 0, height: 0 },
                colors: { body: '#ffff00', frame: '#000000', hub: '#666666' }
            },
            'food-processor': {
                width: 8, height: 6, cost: 4, mass: 1.5,
                energyUsage: 0.3, foodProduction: 400,
                walkSpace: { width: 4, height: 4 },
                colors: { body: '#8b4513', frame: '#000000', hub: '#666666' }
            },
            'thermal-control': {
                width: 6, height: 6, cost: 2, mass: 0.8,
                energyUsage: 0.1, tempControl: 1.0,
                walkSpace: { width: 3, height: 4 },
                colors: { body: '#ff6600', frame: '#000000', hub: '#666666' }
            },
            'humidity-reg': {
                width: 6, height: 4, cost: 1.5, mass: 0.4,
                energyUsage: 0.05, humidityControl: 1.0,
                walkSpace: { width: 3, height: 2 },
                colors: { body: '#00aaff', frame: '#000000', hub: '#666666' }
            },
            'crew-quarters': {
                width: 10, height: 10, cost: 10, mass: 2.0,
                energyUsage: 0.2, crewCapacity: 1,
                walkSpace: { width: 6, height: 6 },
                colors: { body: '#0066cc', frame: '#000000', hub: '#666666' }
            },
            'experiment-module': {
                width: 8, height: 8, cost: 3, mass: 1.0,
                energyUsage: 0.2, experimentRate: 1.0,
                walkSpace: { width: 4, height: 6 },
                colors: { body: '#666666', frame: '#000000', hub: '#666666' }
            }
        };
        
        const data = componentData[this.type];
        if (data) {
            Object.assign(this, data);
        }
    }
}

// Crew Member Class
class CrewMember {
    constructor(role) {
        this.role = role;
        this.health = 100;
        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.isMoving = false;
        this.currentTask = null;
        
        // Role-specific bonuses
        this.setupRoleBonuses();
    }
    
    setupRoleBonuses() {
        const roleData = {
            'Engineer': { 
                repairBonus: 0.3, 
                color: '#ff0000',
                description: 'Reduces equipment failure rates by 30%'
            },
            'Botanist': { 
                hydroponicsBonus: 0.4, 
                color: '#00ff00',
                description: 'Increases hydroponic food production by 40%'
            },
            'Doctor': { 
                healthBonus: 0.2, 
                color: '#ffffff',
                description: 'Improves crew health recovery by 20%'
            },
            'Pilot': { 
                navigationBonus: 0.1, 
                color: '#0000ff',
                description: 'Reduces mission time by 10%'
            },
            'Scientist': { 
                experimentBonus: 0.5, 
                color: '#ff00ff',
                description: 'Increases experiment completion rate by 50%'
            },
            'Commander': { 
                moraleBonus: 0.3, 
                color: '#ffff00',
                description: 'Improves crew morale and reduces stress'
            }
        };
        
        const data = roleData[this.role];
        if (data) {
            Object.assign(this, data);
        }
    }
}

// Pathfinding System
class Pathfinding {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.obstacles = new Set();
    }
    
    addObstacle(x, y, width, height) {
        for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
                this.obstacles.add(`${x + dx},${y + dy}`);
            }
        }
    }
    
    removeObstacle(x, y, width, height) {
        for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
                this.obstacles.delete(`${x + dx},${y + dy}`);
            }
        }
    }
    
    isValid(x, y) {
        return x >= 0 && x < this.gridWidth && 
               y >= 0 && y < this.gridHeight && 
               !this.obstacles.has(`${x},${y}`);
    }
    
    findPath(startX, startY, endX, endY) {
        // Simple A* pathfinding implementation
        const openSet = [{ x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, endX, endY), f: 0, parent: null }];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        while (openSet.length > 0) {
            // Find node with lowest f score
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            
            const current = openSet.splice(currentIndex, 1)[0];
            closedSet.add(`${current.x},${current.y}`);
            
            // Check if we reached the goal
            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }
            
            // Check neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!this.isValid(neighbor.x, neighbor.y) || closedSet.has(key)) {
                    continue;
                }
                
                const tentativeG = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                const f = tentativeG + h;
                
                // Check if this path is better
                const existingIndex = openSet.findIndex(node => node.x === neighbor.x && node.y === neighbor.y);
                if (existingIndex === -1) {
                    openSet.push({ x: neighbor.x, y: neighbor.y, g: tentativeG, h, f, parent: current });
                    cameFrom.set(key, current);
                } else if (tentativeG < openSet[existingIndex].g) {
                    openSet[existingIndex] = { x: neighbor.x, y: neighbor.y, g: tentativeG, h, f, parent: current };
                    cameFrom.set(key, current);
                }
            }
        }
        
        return []; // No path found
    }
    
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [];
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        return path;
    }
}

// Main Game Class
class BioHomeGame {
    constructor() {
        this.state = new GameState();
        this.pathfinding = new Pathfinding(100, 50);
        this.canvas = null;
        this.p5Instance = null;
        this.lastUpdate = 0;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.dragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.selectedComponent = null;
        this.buildMode = false;
        
        // Supabase configuration
        this.supabaseUrl = 'https://your-project.supabase.co'; // Replace with actual URL
        this.supabaseKey = 'your-anon-key'; // Replace with actual key
        this.supabase = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showScreen('title');
        this.initializeSupabase();
    }
    
    setupEventListeners() {
        // Title screen
        document.getElementById('start-game').addEventListener('click', () => {
            this.showScreen('build');
            this.startBuildPhase();
        });
        
        document.getElementById('view-leaderboard').addEventListener('click', () => {
            this.showScreen('leaderboard');
            this.loadLeaderboard();
        });
        
        // Build screen
        document.getElementById('add-crew').addEventListener('click', () => {
            this.addCrewMember();
        });
        
        document.getElementById('launch-button').addEventListener('click', () => {
            this.launchMission();
        });
        
        // Component palette
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectComponent(e.target.dataset.type);
            });
        });
        
        // Simulation screen
        document.getElementById('time-speed').addEventListener('input', (e) => {
            this.state.timeSpeed = parseInt(e.target.value);
        });
        
        // Game over screen
        document.getElementById('submit-score').addEventListener('click', () => {
            this.submitScore();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Leaderboard screen
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('title');
        });
        
        // Spacewalk controls
        document.getElementById('spacewalk-button').addEventListener('click', () => {
            this.startSpacewalk();
        });
        
        document.getElementById('return-spacewalk').addEventListener('click', () => {
            this.endSpacewalk();
        });
    }
    
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.state.currentScreen = screenName;
    }
    
    startBuildPhase() {
        this.buildMode = true;
        this.initializeP5();
        this.updateCostDisplay();
    }
    
    initializeP5() {
        if (this.p5Instance) {
            this.p5Instance.remove();
        }
        
        this.p5Instance = new p5((p) => {
            p.setup = () => {
                const container = document.getElementById('p5-canvas-container');
                this.canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
                this.canvas.parent('p5-canvas-container');
                p.background(0);
            };
            
            p.draw = () => {
                p.background(0, 0, 20);
                this.drawBuildArea(p);
                this.drawComponents(p);
                this.drawCrewDots(p);
            };
            
            p.mousePressed = () => {
                this.handleMousePress(p);
            };
            
            p.mouseDragged = () => {
                this.handleMouseDrag(p);
            };
            
            p.mouseReleased = () => {
                this.handleMouseRelease(p);
            };
            
            p.mouseWheel = (event) => {
                this.handleMouseWheel(p, event);
            };
            
        }, document.getElementById('p5-canvas-container'));
    }
    
    drawBuildArea(p) {
        // Draw grid
        p.stroke(50);
        p.strokeWeight(1);
        
        const blockSize = 8 * this.zoom;
        const startX = this.panX % blockSize;
        const startY = this.panY % blockSize;
        
        for (let x = startX; x < p.width; x += blockSize) {
            p.line(x, 0, x, p.height);
        }
        for (let y = startY; y < p.height; y += blockSize) {
            p.line(0, y, p.width, y);
        }
        
        // Draw build area boundary
        p.stroke(0, 255, 136);
        p.strokeWeight(2);
        p.noFill();
        const buildAreaX = -this.panX;
        const buildAreaY = -this.panY;
        const buildAreaWidth = 100 * blockSize;
        const buildAreaHeight = 50 * blockSize;
        p.rect(buildAreaX, buildAreaY, buildAreaWidth, buildAreaHeight);
    }
    
    drawComponents(p) {
        const blockSize = 8 * this.zoom;
        
        this.state.components.forEach(component => {
            const x = (component.x * blockSize) - this.panX;
            const y = (component.y * blockSize) - this.panY;
            const width = component.width * blockSize;
            const height = component.height * blockSize;
            
            // Draw component with detailed pixel art
            this.drawComponentPixelArt(p, component, x, y, width, height, blockSize);
            
            // Draw connector
            const connectorX = x + (width - 3 * blockSize) / 2;
            const connectorY = y + height;
            p.fill(component.colors.hub);
            p.stroke(component.colors.frame);
            p.strokeWeight(1);
            p.rect(connectorX, connectorY, 3 * blockSize, blockSize);
            
            // Draw component label
            p.fill(255);
            p.textSize(Math.max(6, blockSize * 0.3));
            p.textAlign(p.CENTER);
            p.text(component.type.replace('-', ' '), x + width/2, y + height/2);
        });
    }
    
    drawComponentPixelArt(p, component, x, y, width, height, blockSize) {
        p.noStroke();
        
        switch (component.type) {
            case 'algae-small':
                this.drawAlgaeSmall(p, x, y, width, height, blockSize);
                break;
            case 'algae-large':
                this.drawAlgaeLarge(p, x, y, width, height, blockSize);
                break;
            case 'hydroponics':
                this.drawHydroponics(p, x, y, width, height, blockSize);
                break;
            case 'water-recycler':
                this.drawWaterRecycler(p, x, y, width, height, blockSize);
                break;
            case 'solar-panels':
                this.drawSolarPanels(p, x, y, width, height, blockSize);
                break;
            case 'food-processor':
                this.drawFoodProcessor(p, x, y, width, height, blockSize);
                break;
            case 'thermal-control':
                this.drawThermalControl(p, x, y, width, height, blockSize);
                break;
            case 'humidity-reg':
                this.drawHumidityRegulator(p, x, y, width, height, blockSize);
                break;
            case 'crew-quarters':
                this.drawCrewQuarters(p, x, y, width, height, blockSize);
                break;
            case 'experiment-module':
                this.drawExperimentModule(p, x, y, width, height, blockSize);
                break;
            default:
                // Default component drawing
                p.fill(component.colors.body);
                p.stroke(component.colors.frame);
                p.strokeWeight(1);
                p.rect(x, y, width, height);
        }
    }
    
    drawAlgaeSmall(p, x, y, width, height, blockSize) {
        // Main body - dark green
        p.fill('#004400');
        p.rect(x, y, width, height);
        
        // Algae vats - bright green
        p.fill('#00ff00');
        p.rect(x + blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 3 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Water lines - blue
        p.fill('#0066ff');
        p.rect(x, y + blockSize, blockSize, blockSize * 0.5);
        p.rect(x + 4 * blockSize, y + blockSize, blockSize, blockSize * 0.5);
        
        // Light indicators - yellow
        p.fill('#ffff00');
        p.rect(x + blockSize * 0.5, y, blockSize * 0.5, blockSize * 0.5);
        p.rect(x + 3.5 * blockSize, y, blockSize * 0.5, blockSize * 0.5);
        
        // Control hub - gray
        p.fill('#666666');
        p.rect(x + 2 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawAlgaeLarge(p, x, y, width, height, blockSize) {
        // Main body - dark green
        p.fill('#004400');
        p.rect(x, y, width, height);
        
        // Algae vats - bright green (4 vats)
        p.fill('#00ff00');
        p.rect(x + blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 2.5 * blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 4 * blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 5.5 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Water lines - blue
        p.fill('#0066ff');
        p.rect(x, y + blockSize, blockSize, blockSize * 0.5);
        p.rect(x + 5 * blockSize, y + blockSize, blockSize, blockSize * 0.5);
        
        // Light indicators - yellow
        p.fill('#ffff00');
        p.rect(x + blockSize * 0.5, y, blockSize * 0.5, blockSize * 0.5);
        p.rect(x + 5.5 * blockSize, y, blockSize * 0.5, blockSize * 0.5);
        
        // Control hub - gray
        p.fill('#666666');
        p.rect(x + 3 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawHydroponics(p, x, y, width, height, blockSize) {
        // Main body - dark red
        p.fill('#440000');
        p.rect(x, y, width, height);
        
        // Tomato beds - bright red
        p.fill('#ff0000');
        p.rect(x + blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 2.5 * blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 4 * blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 5.5 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Water/nutrient lines - blue
        p.fill('#0066ff');
        p.rect(x, y + blockSize, blockSize, blockSize * 0.5);
        p.rect(x + 4 * blockSize, y + blockSize, blockSize, blockSize * 0.5);
        
        // Grow lights - yellow
        p.fill('#ffff00');
        p.rect(x + blockSize * 0.5, y, blockSize * 0.5, blockSize * 0.5);
        p.rect(x + 4.5 * blockSize, y, blockSize * 0.5, blockSize * 0.5);
        
        // Control hub - gray
        p.fill('#666666');
        p.rect(x + 3 * blockSize, y + blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawWaterRecycler(p, x, y, width, height, blockSize) {
        // Main body - dark blue
        p.fill('#000044');
        p.rect(x, y, width, height);
        
        // Water tanks - bright blue
        p.fill('#0066ff');
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                p.rect(x + (i + 1) * blockSize, y + (j + 1) * blockSize, blockSize, blockSize);
            }
        }
        
        // Filters - gray
        p.fill('#666666');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, 2 * blockSize, 2 * blockSize);
        
        // Status indicator - red/green
        p.fill(component.active ? '#00ff00' : '#ff0000');
        p.rect(x + 3 * blockSize, y + 3 * blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawSolarPanels(p, x, y, width, height, blockSize) {
        // Main body - dark yellow
        p.fill('#444400');
        p.rect(x, y, width, height);
        
        // Solar panels - bright yellow
        p.fill('#ffff00');
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                p.rect(x + (i + 1) * blockSize, y + (j + 1) * blockSize, blockSize, blockSize);
            }
        }
        
        // Mounts - black
        p.fill('#000000');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, 2 * blockSize, 2 * blockSize);
        p.rect(x + 6 * blockSize, y + 2 * blockSize, 2 * blockSize, 2 * blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawFoodProcessor(p, x, y, width, height, blockSize) {
        // Main body - dark brown
        p.fill('#442200');
        p.rect(x, y, width, height);
        
        // Biomass chambers - brown
        p.fill('#8b4513');
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                p.rect(x + (i + 1) * blockSize, y + (j + 1) * blockSize, blockSize, blockSize);
            }
        }
        
        // Microbe beds - green
        p.fill('#00ff00');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, 2 * blockSize, 2 * blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawThermalControl(p, x, y, width, height, blockSize) {
        // Main body - dark orange
        p.fill('#442200');
        p.rect(x, y, width, height);
        
        // Heat exchangers - red/blue gradient
        p.fill('#ff0000');
        p.rect(x + blockSize, y + blockSize, blockSize, blockSize);
        p.rect(x + 3 * blockSize, y + blockSize, blockSize, blockSize);
        p.fill('#0066ff');
        p.rect(x + blockSize, y + 3 * blockSize, blockSize, blockSize);
        p.rect(x + 3 * blockSize, y + 3 * blockSize, blockSize, blockSize);
        
        // Pump - gray
        p.fill('#666666');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawHumidityRegulator(p, x, y, width, height, blockSize) {
        // Main body - dark blue
        p.fill('#000044');
        p.rect(x, y, width, height);
        
        // Membranes - bright blue
        p.fill('#00aaff');
        p.rect(x + blockSize, y + blockSize, 3 * blockSize, 2 * blockSize);
        
        // Sensor - gray
        p.fill('#666666');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawCrewQuarters(p, x, y, width, height, blockSize) {
        // Main body - dark blue
        p.fill('#000044');
        p.rect(x, y, width, height);
        
        // Beds/seats - blue
        p.fill('#0066cc');
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                p.rect(x + (i + 1) * blockSize, y + (j + 1) * blockSize, blockSize, blockSize);
            }
        }
        
        // Storage - gray
        p.fill('#666666');
        p.rect(x + 2 * blockSize, y + 2 * blockSize, 2 * blockSize, 2 * blockSize);
        p.rect(x + 6 * blockSize, y + 6 * blockSize, 2 * blockSize, 2 * blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawExperimentModule(p, x, y, width, height, blockSize) {
        // Main body - dark gray
        p.fill('#222222');
        p.rect(x, y, width, height);
        
        // Tables - gray
        p.fill('#666666');
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                p.rect(x + (i + 1) * blockSize, y + (j + 1) * blockSize, blockSize, blockSize);
            }
        }
        
        // Experiment device - red
        p.fill('#ff0000');
        p.rect(x + 3 * blockSize, y + 3 * blockSize, blockSize, blockSize);
        
        // Frame - black
        p.stroke('#000000');
        p.strokeWeight(1);
        p.noFill();
        p.rect(x, y, width, height);
    }
    
    drawCrewDots(p) {
        const blockSize = 8 * this.zoom;
        
        // Group crew by position for space occupation
        const positionGroups = new Map();
        this.state.crew.forEach((crewMember, index) => {
            const pos = this.state.crewPositions.get(index) || { x: 0, y: 0 };
            const key = `${pos.x},${pos.y}`;
            if (!positionGroups.has(key)) {
                positionGroups.set(key, []);
            }
            positionGroups.get(key).push({ crewMember, index });
        });
        
        // Draw crew dots with space occupation
        positionGroups.forEach((crewAtPosition, positionKey) => {
            const [x, y] = positionKey.split(',').map(Number);
            const screenX = (x * blockSize) - this.panX;
            const screenY = (y * blockSize) - this.panY;
            
            if (crewAtPosition.length === 1) {
                // Single crew member - draw in center
                const { crewMember } = crewAtPosition[0];
                this.drawCrewDot(p, crewMember, screenX, screenY, blockSize);
            } else if (crewAtPosition.length === 2) {
                // Two crew members - split left and right
                const leftCrew = crewAtPosition[0];
                const rightCrew = crewAtPosition[1];
                const offset = blockSize * 0.3;
                
                this.drawCrewDot(p, leftCrew.crewMember, screenX - offset, screenY, blockSize * 0.7);
                this.drawCrewDot(p, rightCrew.crewMember, screenX + offset, screenY, blockSize * 0.7);
            } else {
                // More than 2 - draw smaller and arrange in circle
                crewAtPosition.forEach(({ crewMember }, i) => {
                    const angle = (i / crewAtPosition.length) * Math.PI * 2;
                    const radius = blockSize * 0.4;
                    const dotX = screenX + Math.cos(angle) * radius;
                    const dotY = screenY + Math.sin(angle) * radius;
                    this.drawCrewDot(p, crewMember, dotX, dotY, blockSize * 0.5);
                });
            }
        });
    }
    
    drawCrewDot(p, crewMember, x, y, size) {
        // Draw crew dot with role color
        p.fill(crewMember.color);
        p.stroke('#ffffff');
        p.strokeWeight(1);
        p.ellipse(x, y, size, size);
        
        // Draw role initial
        p.fill('#000000');
        p.textSize(size * 0.3);
        p.textAlign(p.CENTER);
        p.text(crewMember.role[0], x, y + size * 0.1);
        
        // Draw health indicator (small bar above dot)
        if (crewMember.health < 100) {
            const barWidth = size * 0.8;
            const barHeight = size * 0.1;
            const barX = x - barWidth / 2;
            const barY = y - size * 0.6;
            
            // Background
            p.fill('#333333');
            p.rect(barX, barY, barWidth, barHeight);
            
            // Health bar
            p.fill(crewMember.health > 50 ? '#00ff00' : crewMember.health > 25 ? '#ffff00' : '#ff0000');
            p.rect(barX, barY, barWidth * (crewMember.health / 100), barHeight);
        }
    }
    
    handleMousePress(p) {
        if (this.state.currentScreen !== 'build') return;
        
        const blockSize = 8 * this.zoom;
        const gridX = Math.floor((p.mouseX + this.panX) / blockSize);
        const gridY = Math.floor((p.mouseY + this.panY) / blockSize);
        
        if (this.selectedComponent) {
            this.placeComponent(gridX, gridY);
        } else {
            // Check if clicking on existing component
            const clickedComponent = this.getComponentAt(gridX, gridY);
            if (clickedComponent) {
                this.selectedComponent = clickedComponent;
            }
        }
    }
    
    handleMouseDrag(p) {
        if (this.state.currentScreen !== 'build') return;
        
        if (this.dragging) {
            this.panX += p.mouseX - this.dragStart.x;
            this.panY += p.mouseY - this.dragStart.y;
            this.dragStart = { x: p.mouseX, y: p.mouseY };
        }
    }
    
    handleMouseRelease(p) {
        this.dragging = false;
    }
    
    handleMouseWheel(p, event) {
        const zoomFactor = 0.1;
        const newZoom = this.zoom + (event.delta > 0 ? -zoomFactor : zoomFactor);
        this.zoom = Math.max(0.5, Math.min(3, newZoom));
    }
    
    selectComponent(type) {
        this.selectedComponent = type;
        this.buildMode = true;
    }
    
    placeComponent(x, y) {
        if (!this.selectedComponent) return;
        
        // Check if position is valid
        if (!this.isValidPosition(x, y, this.selectedComponent)) {
            this.logEvent('Invalid position for component placement', 'error');
            return;
        }
        
        const component = new Component(this.selectedComponent, x, y);
        this.state.components.push(component);
        
        // Update pathfinding obstacles
        this.pathfinding.addObstacle(x, y, component.width, component.height);
        
        // Update cost and mass
        this.state.totalCost += component.cost;
        this.state.totalMass += component.mass;
        
        this.updateCostDisplay();
        this.selectedComponent = null;
        
        this.logEvent(`Placed ${this.selectedComponent} at (${x}, ${y})`, 'success');
    }
    
    isValidPosition(x, y, componentType) {
        const componentData = {
            'algae-small': { width: 5, height: 3 },
            'algae-large': { width: 6, height: 3 },
            'hydroponics': { width: 5, height: 3 },
            'water-recycler': { width: 8, height: 6 },
            'solar-panels': { width: 12, height: 6 },
            'food-processor': { width: 8, height: 6 },
            'thermal-control': { width: 6, height: 6 },
            'humidity-reg': { width: 6, height: 4 },
            'crew-quarters': { width: 10, height: 10 },
            'experiment-module': { width: 8, height: 8 }
        };
        
        const data = componentData[componentType];
        if (!data) return false;
        
        // Check boundaries
        if (x < 0 || y < 0 || x + data.width > 100 || y + data.height > 50) {
            return false;
        }
        
        // Check for overlaps
        for (const existingComponent of this.state.components) {
            if (this.componentsOverlap(x, y, data.width, data.height, 
                                     existingComponent.x, existingComponent.y, 
                                     existingComponent.width, existingComponent.height)) {
                return false;
            }
        }
        
        return true;
    }
    
    componentsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }
    
    getComponentAt(x, y) {
        return this.state.components.find(component => 
            x >= component.x && x < component.x + component.width &&
            y >= component.y && y < component.y + component.height
        );
    }
    
    addCrewMember() {
        if (this.state.crew.length >= 6) {
            this.logEvent('Maximum crew size reached (6 members)', 'warning');
            return;
        }
        
        const roles = ['Engineer', 'Botanist', 'Doctor', 'Pilot', 'Scientist', 'Commander'];
        const availableRoles = roles.filter(role => 
            !this.state.crew.some(crew => crew.role === role)
        );
        
        if (availableRoles.length === 0) {
            this.logEvent('All crew roles already assigned', 'warning');
            return;
        }
        
        const role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
        const crewMember = new CrewMember(role);
        this.state.crew.push(crewMember);
        
        // Update cost
        this.state.totalCost += 10; // $10M per crew member
        this.updateCostDisplay();
        this.updateCrewDisplay();
        
        this.logEvent(`Added ${role} to crew`, 'success');
    }
    
    updateCostDisplay() {
        document.getElementById('cost-display').textContent = `Total Cost: $${this.state.totalCost}M`;
        document.getElementById('mass-display').textContent = `Total Mass: ${this.state.totalMass.toFixed(1)} tons`;
        
        // Enable launch button if we have crew and components
        const launchButton = document.getElementById('launch-button');
        launchButton.disabled = this.state.crew.length === 0 || this.state.components.length === 0;
    }
    
    updateCrewDisplay() {
        const crewList = document.getElementById('crew-list');
        crewList.innerHTML = '';
        
        this.state.crew.forEach((crewMember, index) => {
            const crewDiv = document.createElement('div');
            crewDiv.className = 'crew-member';
            crewDiv.innerHTML = `
                <span class="crew-role">${crewMember.role}</span>
                <button class="remove-crew" onclick="game.removeCrewMember(${index})">Remove</button>
            `;
            crewList.appendChild(crewDiv);
        });
    }
    
    removeCrewMember(index) {
        this.state.crew.splice(index, 1);
        this.state.totalCost -= 10;
        this.updateCostDisplay();
        this.updateCrewDisplay();
    }
    
    launchMission() {
        if (this.state.crew.length === 0) {
            this.logEvent('Cannot launch without crew members', 'error');
            return;
        }
        
        if (this.state.components.length === 0) {
            this.logEvent('Cannot launch without life support components', 'error');
            return;
        }
        
        this.showScreen('simulation');
        this.startSimulation();
    }
    
    startSimulation() {
        this.state.gamePhase = 'simulation';
        this.state.simulationTime = 0;
        this.initializeCrewPositions();
        this.startSimulationLoop();
        this.updateResourceGauges();
        this.updateExperimentDisplay();
        
        this.logEvent('Mission launched! Beginning journey to Mars...', 'success');
    }
    
    initializeCrewPositions() {
        // Place crew members in crew quarters
        const crewQuarters = this.state.components.filter(c => c.type === 'crew-quarters');
        
        this.state.crew.forEach((crewMember, index) => {
            if (crewQuarters.length > 0) {
                const quarters = crewQuarters[index % crewQuarters.length];
                this.state.crewPositions.set(index, {
                    x: quarters.x + Math.floor(quarters.width / 2),
                    y: quarters.y + Math.floor(quarters.height / 2)
                });
            } else {
                // Place at origin if no crew quarters
                this.state.crewPositions.set(index, { x: 0, y: 0 });
            }
        });
    }
    
    startSimulationLoop() {
        const updateSimulation = () => {
            if (this.state.currentScreen === 'simulation' && !this.state.isPaused) {
                this.updateSimulation();
                this.updateResourceGauges();
                this.updateCrewDisplay();
                this.updateExperimentDisplay();
                this.checkWinLoseConditions();
            }
            requestAnimationFrame(updateSimulation);
        };
        updateSimulation();
    }
    
    updateSimulation() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;
        
        // Update simulation time
        this.state.simulationTime += deltaTime * this.state.timeSpeed / 86400; // Convert to days
        
        // Update resources based on NASA data
        this.updateResources(deltaTime);
        
        // Check for random events
        this.checkRandomEvents();
        
        // Update experiments
        this.updateExperiments(deltaTime);
        
        // Update crew health
        this.updateCrewHealth(deltaTime);
        
        // Update spacewalk
        this.updateSpacewalk(deltaTime);
        
        // Update time display
        document.getElementById('time-display').textContent = `Day ${Math.floor(this.state.simulationTime)}`;
    }
    
    updateResources(deltaTime) {
        const crewCount = this.state.crew.length;
        const hours = deltaTime / 3600; // Convert to hours
        
        // Calculate production from components
        let o2Production = 0;
        let foodProduction = 0;
        let energyProduction = 0;
        let waterRecycling = 0;
        
        this.state.components.forEach(component => {
            if (!component.active) return;
            
            switch (component.type) {
                case 'algae-small':
                    o2Production += component.o2Production * hours;
                    break;
                case 'algae-large':
                    o2Production += component.o2Production * hours;
                    break;
                case 'hydroponics':
                    foodProduction += component.foodProduction * hours;
                    break;
                case 'solar-panels':
                    energyProduction += component.energyProduction * hours;
                    break;
                case 'water-recycler':
                    waterRecycling += component.waterRecycling;
                    break;
            }
        });
        
        // Apply crew consumption and production
        this.state.resources.oxygen += o2Production - (this.state.NASA_CONSTANTS.O2_DECAY_PER_CREW * crewCount * hours);
        this.state.resources.co2 += (this.state.NASA_CONSTANTS.CO2_GROWTH_PER_CREW * crewCount * hours) - (o2Production * 0.1);
        this.state.resources.food += foodProduction - (this.state.NASA_CONSTANTS.FOOD_DECAY_PER_CREW * crewCount * hours);
        this.state.resources.water += (this.state.resources.water * waterRecycling * hours) - (this.state.NASA_CONSTANTS.WATER_DECAY_PER_CREW * crewCount * hours);
        
        // Energy consumption and production
        let energyConsumption = 0;
        this.state.components.forEach(component => {
            if (component.active) {
                energyConsumption += component.energyUsage * hours;
            }
        });
        this.state.resources.energy += energyProduction - energyConsumption;
        
        // Clamp values to realistic ranges
        this.state.resources.oxygen = Math.max(0, Math.min(30, this.state.resources.oxygen));
        this.state.resources.co2 = Math.max(0, Math.min(5, this.state.resources.co2));
        this.state.resources.food = Math.max(0, Math.min(10000, this.state.resources.food));
        this.state.resources.water = Math.max(0, Math.min(50, this.state.resources.water));
        this.state.resources.energy = Math.max(0, Math.min(100, this.state.resources.energy));
    }
    
    updateCrewHealth(deltaTime) {
        const hours = deltaTime / 3600;
        let healthChange = 0;
        
        // Check resource levels and apply health penalties
        if (this.state.resources.oxygen < this.state.NASA_CONSTANTS.O2_TARGET_MIN) {
            healthChange -= 5 * hours; // -5% per hour
        }
        if (this.state.resources.co2 > this.state.NASA_CONSTANTS.CO2_TARGET_MAX) {
            healthChange -= 2 * hours; // -2% per hour
        }
        if (this.state.resources.food < this.state.NASA_CONSTANTS.FOOD_TARGET_MIN) {
            healthChange -= 10 * hours; // -10% per hour
        }
        if (this.state.resources.water < this.state.NASA_CONSTANTS.WATER_TARGET_MIN) {
            healthChange -= 5 * hours; // -5% per hour
        }
        
        // Apply health recovery if all resources are optimal
        if (this.state.resources.oxygen >= this.state.NASA_CONSTANTS.O2_TARGET_MIN &&
            this.state.resources.co2 <= this.state.NASA_CONSTANTS.CO2_TARGET_MAX &&
            this.state.resources.food >= this.state.NASA_CONSTANTS.FOOD_TARGET_MIN &&
            this.state.resources.water >= this.state.NASA_CONSTANTS.WATER_TARGET_MIN) {
            healthChange += 1 * hours; // +1% per hour
        }
        
        this.state.resources.health += healthChange;
        this.state.resources.health = Math.max(0, Math.min(100, this.state.resources.health));
    }
    
    checkRandomEvents() {
        // 10-20% chance per simulated day
        const eventChance = 0.15 * (this.state.timeSpeed / 86400); // Adjust for time speed
        if (Math.random() < eventChance) {
            this.triggerRandomEvent();
        }
    }
    
    triggerRandomEvent() {
        const events = [
            {
                name: 'Solar Flare',
                description: 'Solar radiation spike detected!',
                effect: () => {
                    this.state.resources.energy -= 20;
                    this.state.resources.health -= 5;
                    this.logEvent('Solar flare damaged solar panels and exposed crew to radiation', 'error');
                }
            },
            {
                name: 'Equipment Failure',
                description: 'Critical system malfunction!',
                effect: () => {
                    const component = this.state.components[Math.floor(Math.random() * this.state.components.length)];
                    component.active = false;
                    this.logEvent(`${component.type} has failed and needs repair`, 'warning');
                }
            },
            {
                name: 'Asteroid Pass',
                description: 'Asteroid field detected ahead',
                effect: () => {
                    if (Math.random() < 0.3) {
                        this.state.resources.health -= 10;
                        this.logEvent('Asteroid impact caused hull damage', 'error');
                    } else {
                        this.logEvent('Successfully navigated through asteroid field', 'success');
                    }
                }
            },
            {
                name: 'Planet Alignment',
                description: 'Favorable planetary alignment detected',
                effect: () => {
                    this.state.resources.energy += 10;
                    this.logEvent('Planetary gravity assist provided energy boost', 'success');
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
    }
    
    updateExperiments(deltaTime) {
        const hours = deltaTime / 3600;
        const experimentModules = this.state.components.filter(c => c.type === 'experiment-module' && c.active);
        
        if (experimentModules.length > 0) {
            this.state.experiments.forEach(experiment => {
                if (!experiment.completed) {
                    experiment.progress += (experimentModules.length * hours) / 24; // 1 day per module
                    if (experiment.progress >= 1) {
                        experiment.progress = 1;
                        experiment.completed = true;
                        this.logEvent(`Experiment "${experiment.name}" completed!`, 'success');
                    }
                }
            });
        }
    }
    
    updateResourceGauges() {
        const gauges = [
            { id: 'o2-gauge', value: this.state.resources.oxygen, unit: '%', color: '#00ff88' },
            { id: 'co2-gauge', value: this.state.resources.co2, unit: '%', color: '#ff6666' },
            { id: 'food-gauge', value: this.state.resources.food, unit: ' kcal', color: '#ffaa00' },
            { id: 'water-gauge', value: this.state.resources.water, unit: 'L', color: '#0066ff' },
            { id: 'energy-gauge', value: this.state.resources.energy, unit: ' kWh', color: '#ffff00' },
            { id: 'health-gauge', value: this.state.resources.health, unit: '%', color: '#ff00ff' }
        ];
        
        gauges.forEach(gauge => {
            const element = document.getElementById(gauge.id);
            const valueElement = element.querySelector('.gauge-value');
            valueElement.textContent = `${gauge.value.toFixed(1)}${gauge.unit}`;
            
            // Update gauge color based on value
            const percentage = Math.min(100, Math.max(0, gauge.value / 100 * 100));
            element.style.setProperty('--percentage', `${percentage}%`);
            element.style.background = `conic-gradient(from 0deg, ${gauge.color} 0%, ${gauge.color} ${percentage}%, #333 ${percentage}%, #333 100%)`;
        });
    }
    
    updateExperimentDisplay() {
        const experimentList = document.getElementById('experiment-list');
        experimentList.innerHTML = '';
        
        this.state.experiments.forEach(experiment => {
            const experimentDiv = document.createElement('div');
            experimentDiv.className = 'experiment-item';
            experimentDiv.innerHTML = `
                <span>${experiment.name}</span>
                <div class="experiment-progress-bar">
                    <div class="experiment-progress-fill" style="width: ${experiment.progress * 100}%"></div>
                </div>
            `;
            experimentList.appendChild(experimentDiv);
        });
    }
    
    checkWinLoseConditions() {
        // Check for game over
        if (this.state.resources.health <= 0) {
            this.gameOver(false);
            return;
        }
        
        // Check for win condition
        const allExperimentsComplete = this.state.experiments.every(exp => exp.completed);
        const marsReached = this.state.simulationTime >= 180; // 6 months to Mars
        
        if (allExperimentsComplete && marsReached) {
            this.gameOver(true);
        }
    }
    
    gameOver(success) {
        this.state.isPaused = true;
        
        const gameOverScreen = document.getElementById('game-over-screen');
        const title = document.getElementById('game-over-title');
        const stats = document.getElementById('final-stats');
        
        if (success) {
            title.textContent = 'Mission Successful!';
            title.style.color = '#00ff88';
        } else {
            title.textContent = 'Mission Failed';
            title.style.color = '#ff6666';
        }
        
        // Calculate final score
        const survivalTime = this.state.simulationTime;
        const cost = this.state.totalCost;
        const score = survivalTime / cost * 1000; // Higher is better
        
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Survival Time:</span>
                <span class="stat-value">${survivalTime.toFixed(1)} days</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Cost:</span>
                <span class="stat-value">$${cost}M</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Final Score:</span>
                <span class="stat-value">${score.toFixed(0)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Experiments Completed:</span>
                <span class="stat-value">${this.state.experiments.filter(e => e.completed).length}/5</span>
            </div>
        `;
        
        this.showScreen('game-over');
    }
    
    logEvent(message, type = 'info') {
        const logEntries = document.getElementById('log-entries');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `Day ${Math.floor(this.state.simulationTime)}: ${message}`;
        
        logEntries.appendChild(entry);
        logEntries.scrollTop = logEntries.scrollHeight;
        
        // Keep only last 50 entries
        while (logEntries.children.length > 50) {
            logEntries.removeChild(logEntries.firstChild);
        }
    }
    
    async submitScore() {
        const username = prompt('Enter your name for the leaderboard:') || 'Anonymous';
        const score = this.calculateFinalScore();
        const survivalTime = this.state.simulationTime;
        const cost = this.state.totalCost;
        
        // Submit to Supabase
        await this.submitScoreToSupabase(username, score, survivalTime, cost);
        
        this.logEvent(`Score submitted: ${score}`, 'success');
        this.showScreen('leaderboard');
        await this.loadLeaderboard();
    }
    
    calculateFinalScore() {
        const survivalTime = this.state.simulationTime;
        const cost = this.state.totalCost;
        const experimentsCompleted = this.state.experiments.filter(e => e.completed).length;
        
        return Math.floor((survivalTime * experimentsCompleted) / cost * 1000);
    }
    
    restartGame() {
        this.state = new GameState();
        this.pathfinding = new Pathfinding(100, 50);
        this.showScreen('title');
    }
    
    async loadLeaderboard() {
        const leaderboardData = await this.loadLeaderboardFromSupabase();
        
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        
        if (leaderboardData.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-entry">No scores yet. Be the first!</div>';
            return;
        }
        
        leaderboardData.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'leaderboard-entry';
            entryDiv.innerHTML = `
                <span class="leaderboard-rank">#${entry.rank}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score}</span>
            `;
            leaderboardList.appendChild(entryDiv);
        });
    }
    
    initializeSupabase() {
        // Initialize Supabase connection
        try {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase initialized successfully');
            
            // Create leaderboard table if it doesn't exist
            this.createLeaderboardTable();
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            // Continue without Supabase for offline play
        }
    }
    
    async createLeaderboardTable() {
        // This would create the table structure in Supabase
        // For now, we'll assume the table exists with columns: id, username, score, survival_time, cost, created_at
        console.log('Leaderboard table ready');
    }
    
    async submitScoreToSupabase(username, score, survivalTime, cost) {
        if (!this.supabase) {
            console.log('Supabase not available, storing locally');
            this.storeScoreLocally(username, score, survivalTime, cost);
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .insert([
                    {
                        username: username,
                        score: score,
                        survival_time: survivalTime,
                        cost: cost,
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error submitting score:', error);
                this.storeScoreLocally(username, score, survivalTime, cost);
            } else {
                console.log('Score submitted successfully:', data);
            }
        } catch (error) {
            console.error('Failed to submit score:', error);
            this.storeScoreLocally(username, score, survivalTime, cost);
        }
    }
    
    async loadLeaderboardFromSupabase() {
        if (!this.supabase) {
            return this.loadLeaderboardFromLocal();
        }
        
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(10);
            
            if (error) {
                console.error('Error loading leaderboard:', error);
                return this.loadLeaderboardFromLocal();
            }
            
            return data || [];
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return this.loadLeaderboardFromLocal();
        }
    }
    
    storeScoreLocally(username, score, survivalTime, cost) {
        const scores = JSON.parse(localStorage.getItem('biohome_scores') || '[]');
        scores.push({ username, score, survivalTime, cost, timestamp: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep only top 10
        localStorage.setItem('biohome_scores', JSON.stringify(scores));
    }
    
    loadLeaderboardFromLocal() {
        const scores = JSON.parse(localStorage.getItem('biohome_scores') || '[]');
        return scores.map((score, index) => ({
            rank: index + 1,
            name: score.username,
            score: score.score
        }));
    }
    
    startSpacewalk() {
        // Find an Engineer crew member
        const engineerIndex = this.state.crew.findIndex(crew => crew.role === 'Engineer');
        if (engineerIndex === -1) {
            this.logEvent('No Engineer available for spacewalk', 'error');
            return;
        }
        
        this.spacewalkActive = true;
        this.spacewalkCrew = engineerIndex;
        this.spacewalkTime = 120; // 2 minutes
        this.spacewalkTarget = null;
        
        // Show spacewalk overlay
        document.getElementById('spacewalk-overlay').style.display = 'block';
        document.getElementById('spacewalk-button').disabled = true;
        
        this.logEvent('Engineer has begun spacewalk for external repairs', 'success');
    }
    
    endSpacewalk() {
        if (!this.spacewalkActive) return;
        
        this.spacewalkActive = false;
        this.spacewalkCrew = null;
        this.spacewalkTime = 0;
        this.spacewalkTarget = null;
        
        // Hide spacewalk overlay
        document.getElementById('spacewalk-overlay').style.display = 'none';
        document.getElementById('spacewalk-button').disabled = false;
        
        this.logEvent('Engineer has returned from spacewalk', 'success');
    }
    
    updateSpacewalk(deltaTime) {
        if (!this.spacewalkActive) return;
        
        this.spacewalkTime -= deltaTime;
        
        // Update UI
        document.getElementById('spacewalk-timer').textContent = `Time Remaining: ${Math.max(0, Math.floor(this.spacewalkTime))}s`;
        
        const crewMember = this.state.crew[this.spacewalkCrew];
        document.getElementById('spacewalk-health').textContent = `Health: ${Math.floor(crewMember.health)}%`;
        
        // Check for radiation exposure (5% chance per second)
        if (Math.random() < 0.05 * deltaTime) {
            crewMember.health -= 5;
            this.logEvent('Spacewalk: Radiation exposure detected!', 'warning');
        }
        
        // Check for hull breach (1% chance per second)
        if (Math.random() < 0.01 * deltaTime) {
            this.state.resources.oxygen -= 10; // O2 leak
            this.logEvent('Spacewalk: Hull breach detected! O2 leak!', 'error');
        }
        
        // Auto-end spacewalk if time runs out or health too low
        if (this.spacewalkTime <= 0 || crewMember.health <= 0) {
            this.endSpacewalk();
            if (crewMember.health <= 0) {
                this.logEvent('Engineer lost in space! Mission critical!', 'error');
            }
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new BioHomeGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game && game.p5Instance) {
        const container = document.getElementById('p5-canvas-container');
        game.p5Instance.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
});
