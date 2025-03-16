// Peppa Pig Car Game - Phase 4: Level-Based Gameplay

document.addEventListener('DOMContentLoaded', function() {
    console.log('Game initialized - Phase 4: Level-Based Gameplay');
    
    // Preload sounds to ensure they work on first interaction
    preloadSounds();
    
    // Add a click event to start audio context
    document.addEventListener('click', initAudio, { once: true });
    
    function initAudio() {
        // Play and immediately pause a sound to initialize audio context
        const audio = playSound('bing');
        if (audio) {
            audio.volume = 0;
            setTimeout(() => {
                if (audio) audio.pause();
            }, 50);
        }
        console.log('Audio context initialized');
    }
    
    // Game elements
    const gameCanvas = document.getElementById('game-canvas');
    const carContainer = document.getElementById('car-container');
    const peppaCar = document.getElementById('peppa-car');
    const roadMarking = document.querySelector('.road-marking');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const scoreContainer = document.getElementById('score-container');
    const livesContainer = document.getElementById('lives-container');
    const levelContainer = document.getElementById('level-container');
    const timerContainer = document.getElementById('timer-container');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreSpan = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const controls = document.querySelector('.controls');
    
    // Update controls section for Phase 4
    controls.innerHTML = `
        <p>Phase 4: Level-Based Gameplay</p>
        <p>Use arrow keys (up/down) to move Peppa's car, collect power-ups, and avoid obstacles!</p>
        <p><strong>Power-ups:</strong> ⭐ Star (points) | 🛡️ Shield (protection) | ⚡ Speed (faster)</p>
        <p><strong>Each level:</strong> 20 seconds to reach the finish line. Avoid hitting 3 obstacles!</p>
    `;
    
    // Background music
    let bgMusicPlaying = false;
    let bgMusicObject = null;
    let cheerSound = null;
    
    // Game state
    let gameState = {
        isPlaying: true,
        carPosition: 60,
        carLane: 1, // 0: top, 1: middle, 2: bottom
        score: 0,
        lives: 3,
        level: 1,
        speed: 3,
        obstacleSpeed: 5,
        obstacleInterval: 2000,
        powerupInterval: 5000,
        lastObstacleTime: 0,
        lastPowerupTime: 0,
        animationFrame: 0,
        roadPosition: 0,
        obstacles: [],
        powerups: [],
        keysPressed: {
            ArrowUp: false,
            ArrowDown: false
        },
        hasShield: false,
        shieldEndTime: 0,
        hasSpeedBoost: false,
        speedBoostEndTime: 0,
        // Level-specific properties
        levelStarted: false,
        levelTime: 20, // 20 seconds per level
        levelTimer: null,
        obstaclesHit: 0,
        levelCompleted: false,
        showingFinishLine: false,
        carMotorSound: null
    };
    
    // Lane positions (from bottom of road)
    const lanes = [100, 60, 20];
    
    // Obstacle types
    const obstacleTypes = ['rock', 'puddle', 'mud'];
    
    // Power-up types
    const powerupTypes = ['star', 'shield', 'speed'];
    
    // Initialize game
    function initGame() {
        // Start background music if not already playing
        if (!bgMusicPlaying) {
            bgMusicObject = playBackgroundMusic();
            bgMusicPlaying = true;
        }
        
        // Start car motor sound
        if (gameState.carMotorSound) {
            gameState.carMotorSound.pause();
        }
        gameState.carMotorSound = playSound('carMotor');
        if (gameState.carMotorSound) {
            gameState.carMotorSound.loop = true;
            gameState.carMotorSound.volume = 0.3;
        }
        
        // Reset game state
        gameState = {
            isPlaying: true,
            carPosition: 60,
            carLane: 1,
            score: 0,
            lives: 3,
            level: 1,
            speed: 3,
            obstacleSpeed: 5,
            obstacleInterval: 2000,
            powerupInterval: 5000,
            lastObstacleTime: 0,
            lastPowerupTime: 0,
            animationFrame: 0,
            roadPosition: 0,
            obstacles: [],
            powerups: [],
            keysPressed: {
                ArrowUp: false,
                ArrowDown: false
            },
            hasShield: false,
            shieldEndTime: 0,
            hasSpeedBoost: false,
            speedBoostEndTime: 0,
            levelStarted: false,
            levelTime: 20,
            levelTimer: null,
            obstaclesHit: 0,
            levelCompleted: false,
            showingFinishLine: false,
            carMotorSound: gameState.carMotorSound
        };
        
        // Clear obstacles and power-ups
        obstaclesContainer.innerHTML = '';
        
        // Reset UI
        updateScore(0);
        updateLives(3);
        updateLevel(1);
        updateTimer(20);
        
        // Remove shield effect if present
        peppaCar.classList.remove('shielded');
        
        // Hide game over screen
        gameOverScreen.style.display = 'none';
        
        // Position car
        updateCarPosition();
        
        // Start level
        startLevel();
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start a new level
    function startLevel() {
        // Clear any existing level elements
        const existingStartSign = document.querySelector('.start-sign');
        if (existingStartSign) existingStartSign.remove();
        
        const existingFinishLine = document.querySelector('.finish-line');
        if (existingFinishLine) existingFinishLine.remove();
        
        const existingFinishFlag = document.querySelector('.finish-flag');
        if (existingFinishFlag) existingFinishFlag.remove();
        
        // Reset level-specific state
        gameState.levelStarted = false;
        gameState.levelTime = 20;
        gameState.obstaclesHit = 0;
        gameState.levelCompleted = false;
        gameState.showingFinishLine = false;
        
        // Clear obstacles and power-ups
        obstaclesContainer.innerHTML = '';
        gameState.obstacles = [];
        gameState.powerups = [];
        
        // Create start sign
        const startSign = document.createElement('div');
        startSign.className = 'start-sign';
        startSign.innerHTML = `<div>START</div><div>Level ${gameState.level}</div>`;
        gameCanvas.appendChild(startSign);
        
        // Wait for start sign animation to complete before starting the level timer
        setTimeout(() => {
            // Remove the start sign
            const startSign = document.querySelector('.start-sign');
            if (startSign) {
                startSign.style.animation = 'slide-out 0.5s forwards';
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (startSign.parentNode) {
                        startSign.parentNode.removeChild(startSign);
                    }
                }, 500);
            }
            
            gameState.levelStarted = true;
            
            // Start level timer
            if (gameState.levelTimer) clearInterval(gameState.levelTimer);
            gameState.levelTimer = setInterval(() => {
                gameState.levelTime--;
                updateTimer(gameState.levelTime);
                
                // When time is up, show finish line if player hasn't hit 3 obstacles
                if (gameState.levelTime <= 0) {
                    clearInterval(gameState.levelTimer);
                    
                    if (gameState.obstaclesHit < 3 && !gameState.levelCompleted) {
                        showFinishLine();
                    } else if (!gameState.levelCompleted) {
                        // Failed the level
                        endGame();
                    }
                }
            }, 1000);
        }, 1500); // Wait for start sign animation (1.5s)
    }
    
    // Show finish line
    function showFinishLine() {
        if (gameState.showingFinishLine) return;
        gameState.showingFinishLine = true;
        
        // Create finish line
        const finishLine = document.createElement('div');
        finishLine.className = 'finish-line';
        gameCanvas.appendChild(finishLine);
        
        // Create finish flag
        const finishFlag = document.createElement('div');
        finishFlag.className = 'finish-flag';
        gameCanvas.appendChild(finishFlag);
        
        // Wait for finish line to reach the car
        setTimeout(() => {
            if (gameState.isPlaying) {
                completeLevel();
            }
        }, 15000); // Match the animation duration in CSS
    }
    
    // Complete the current level
    function completeLevel() {
        if (gameState.levelCompleted) return;
        gameState.levelCompleted = true;
        
        // Play crowd cheer sound
        cheerSound = playSound('crowdCheer');
        playSound('levelComplete');
        
        // Add bonus points for completing the level
        updateScore(gameState.score + 100 * gameState.level);
        
        // Show level complete message
        const levelCompleteMsg = document.createElement('div');
        levelCompleteMsg.style.position = 'absolute';
        levelCompleteMsg.style.top = '50%';
        levelCompleteMsg.style.left = '50%';
        levelCompleteMsg.style.transform = 'translate(-50%, -50%)';
        levelCompleteMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        levelCompleteMsg.style.color = 'white';
        levelCompleteMsg.style.padding = '20px';
        levelCompleteMsg.style.borderRadius = '10px';
        levelCompleteMsg.style.fontSize = '24px';
        levelCompleteMsg.style.fontWeight = 'bold';
        levelCompleteMsg.style.zIndex = '100';
        levelCompleteMsg.style.textAlign = 'center';
        levelCompleteMsg.innerHTML = `Level ${gameState.level} Complete!<br>+${100 * gameState.level} points`;
        gameCanvas.appendChild(levelCompleteMsg);
        
        // Pause the game briefly
        gameState.isPlaying = false;
        
        // Start next level after a delay
        setTimeout(() => {
            // Remove level complete message
            levelCompleteMsg.remove();
            
            // Stop cheer sound if it's still playing
            if (cheerSound) {
                cheerSound.pause();
                cheerSound = null;
            }
            
            // Advance to next level
            updateLevel(gameState.level + 1);
            
            // Resume game
            gameState.isPlaying = true;
            
            // Start the next level
            startLevel();
        }, 3000);
    }
    
    // Update car position based on lane
    function updateCarPosition() {
        carContainer.style.bottom = `${lanes[gameState.carLane]}px`;
    }
    
    // Update score display
    function updateScore(newScore) {
        gameState.score = newScore;
        scoreContainer.textContent = `Score: ${newScore}`;
    }
    
    // Update lives display
    function updateLives(newLives) {
        gameState.lives = newLives;
        
        // Update lives UI
        const lifeElements = livesContainer.querySelectorAll('.life');
        lifeElements.forEach((life, index) => {
            life.style.opacity = index < newLives ? '1' : '0.3';
        });
    }
    
    // Update level display
    function updateLevel(newLevel) {
        gameState.level = newLevel;
        levelContainer.textContent = `Level ${newLevel}`;
        
        // Increase difficulty with level
        gameState.obstacleSpeed = 5 + (newLevel - 1) * 1;
        gameState.obstacleInterval = Math.max(500, 2000 - (newLevel - 1) * 300);
        
        // Reset road position to ensure animation continues in new level
        gameState.roadPosition = 0;
    }
    
    // Update timer display
    function updateTimer(seconds) {
        timerContainer.textContent = `Time: ${seconds}s`;
        
        // Change color when time is running out
        if (seconds <= 5) {
            timerContainer.style.color = 'red';
            timerContainer.style.fontWeight = 'bold';
        } else {
            timerContainer.style.color = '#333';
            timerContainer.style.fontWeight = 'normal';
        }
    }
    
    // Create a new obstacle
    function createObstacle() {
        if (!gameState.isPlaying || !gameState.levelStarted || gameState.levelCompleted) return;
        
        // Create obstacle element
        const obstacle = document.createElement('div');
        
        // Random obstacle type
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        // Random lane (0 = top, 2 = bottom, never 1 = middle)
        const lane = Math.random() < 0.5 ? 0 : 2;
        
        // Set obstacle properties
        obstacle.className = `obstacle ${type}`;
        obstacle.style.right = '-50px';
        obstacle.style.bottom = `${lanes[lane]}px`;
        
        // Add to DOM
        obstaclesContainer.appendChild(obstacle);
        
        // Add to game state
        gameState.obstacles.push({
            element: obstacle,
            lane: lane,
            type: type,
            position: -50,
            width: type === 'mud' ? 80 : 50,
            hit: false
        });
    }
    
    // Create a new power-up
    function createPowerup() {
        if (!gameState.isPlaying || !gameState.levelStarted || gameState.levelCompleted) return;
        
        // Create power-up element
        const powerup = document.createElement('div');
        
        // Random power-up type
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        // Random lane
        const lane = Math.floor(Math.random() * 3);
        
        // Set power-up properties
        powerup.className = `powerup ${type}`;
        powerup.style.right = '-50px';
        powerup.style.bottom = `${lanes[lane]}px`;
        
        // Add to DOM
        obstaclesContainer.appendChild(powerup);
        
        // Add to game state
        gameState.powerups.push({
            element: powerup,
            lane: lane,
            type: type,
            position: -50,
            width: 40,
            collected: false
        });
    }
    
    // Apply power-up effect
    function applyPowerup(type) {
        switch(type) {
            case 'star':
                updateScore(gameState.score + 50);
                playSound('bing');
                break;
                
            case 'shield':
                gameState.hasShield = true;
                gameState.shieldEndTime = Date.now() + 10000;
                peppaCar.classList.add('shielded');
                playSound('powerup');
                break;
                
            case 'speed':
                gameState.hasSpeedBoost = true;
                gameState.speedBoostEndTime = Date.now() + 5000;
                gameState.speed *= 1.5;
                playSound('powerup');
                break;
        }
    }
    
    // Check for collisions with obstacles
    function checkObstacleCollisions() {
        if (!gameState.isPlaying || !gameState.levelStarted || gameState.levelCompleted) return;
        
        const carWidth = 150;
        const carLeft = 100;
        const carRight = carLeft + carWidth;
        
        gameState.obstacles.forEach(obstacle => {
            if (obstacle.lane === gameState.carLane && !obstacle.hit) {
                const obstacleLeft = 800 - obstacle.position - obstacle.width;
                const obstacleRight = 800 - obstacle.position;
                
                if (carRight > obstacleLeft && carLeft < obstacleRight) {
                    obstacle.hit = true;
                    obstacle.element.style.opacity = '0.5';
                    
                    if (gameState.hasShield) {
                        // Shield absorbs the hit
                        gameState.hasShield = false;
                        peppaCar.classList.remove('shielded');
                        
                        // Visual feedback
                        peppaCar.style.filter = 'brightness(1.5) hue-rotate(180deg)';
                        setTimeout(() => {
                            peppaCar.style.filter = 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.3))';
                        }, 300);
                        
                        // Play shield break sound
                        playSound('collision');
                    } else {
                        // Car hit by obstacle
                        peppaCar.style.filter = 'brightness(2) hue-rotate(90deg)';
                        setTimeout(() => {
                            peppaCar.style.filter = 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.3))';
                        }, 300);
                        
                        // Increment obstacles hit counter
                        gameState.obstaclesHit++;
                        
                        // Play collision sound
                        playSound('collision');
                        
                        // Check if level failed (3 obstacles hit)
                        if (gameState.obstaclesHit >= 3) {
                            endGame();
                        }
                    }
                }
            }
        });
    }
    
    // Check for collisions with power-ups
    function checkPowerupCollisions() {
        if (!gameState.isPlaying || !gameState.levelStarted || gameState.levelCompleted) return;
        
        const carWidth = 150;
        const carLeft = 100;
        const carRight = carLeft + carWidth;
        
        gameState.powerups.forEach(powerup => {
            if (powerup.lane === gameState.carLane && !powerup.collected) {
                const powerupLeft = 800 - powerup.position - powerup.width;
                const powerupRight = 800 - powerup.position;
                
                if (carRight > powerupLeft && carLeft < powerupRight) {
                    powerup.collected = true;
                    powerup.element.style.opacity = '0';
                    powerup.element.style.transform = 'scale(1.5)';
                    
                    applyPowerup(powerup.type);
                }
            }
        });
    }
    
    // End the game
    function endGame() {
        gameState.isPlaying = false;
        
        // Clear level timer
        if (gameState.levelTimer) {
            clearInterval(gameState.levelTimer);
        }
        
        // Stop car motor sound
        if (gameState.carMotorSound) {
            gameState.carMotorSound.pause();
            gameState.carMotorSound = null;
        }
        
        // Play game over sound
        playSound('gameOver');
        
        // Show game over screen
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.flexDirection = 'column';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '50%';
        gameOverScreen.style.left = '50%';
        gameOverScreen.style.transform = 'translate(-50%, -50%)';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.padding = '20px';
        gameOverScreen.style.borderRadius = '10px';
        gameOverScreen.style.zIndex = '100';
        
        // Update final score
        finalScoreSpan.textContent = gameState.score;
    }
    
    // Main game loop
    function gameLoop(timestamp) {
        if (!gameState.isPlaying) return;
        
        // Update animation frame
        gameState.animationFrame += 0.05;
        
        // Check power-up timers
        const currentTime = Date.now();
        
        if (gameState.hasShield && currentTime > gameState.shieldEndTime) {
            gameState.hasShield = false;
            peppaCar.classList.remove('shielded');
        }
        
        if (gameState.hasSpeedBoost && currentTime > gameState.speedBoostEndTime) {
            gameState.hasSpeedBoost = false;
            gameState.speed /= 1.5;
        }
        
        // Only create obstacles and power-ups if level has started and not completed
        if (gameState.levelStarted && !gameState.levelCompleted) {
            // Create obstacles at intervals
            if (timestamp - gameState.lastObstacleTime > gameState.obstacleInterval) {
                createObstacle();
                gameState.lastObstacleTime = timestamp;
            }
            
            // Create power-ups at intervals
            if (timestamp - gameState.lastPowerupTime > gameState.powerupInterval) {
                createPowerup();
                gameState.lastPowerupTime = timestamp;
            }
        }
        
        // Move obstacles
        for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
            const obstacle = gameState.obstacles[i];
            obstacle.position += gameState.obstacleSpeed;
            obstacle.element.style.right = `${obstacle.position}px`;
            
            // Remove obstacles that are off-screen
            if (obstacle.position > 850) {
                obstacle.element.remove();
                gameState.obstacles.splice(i, 1);
                
                // Increase score for avoided obstacles
                if (!obstacle.hit && gameState.levelStarted && !gameState.levelCompleted) {
                    updateScore(gameState.score + 10);
                    playSound('bing');
                }
            }
        }
        
        // Move power-ups
        for (let i = gameState.powerups.length - 1; i >= 0; i--) {
            const powerup = gameState.powerups[i];
            powerup.position += gameState.obstacleSpeed;
            powerup.element.style.right = `${powerup.position}px`;
            
            // Remove power-ups that are off-screen or collected
            if (powerup.position > 850 || powerup.collected) {
                powerup.element.remove();
                gameState.powerups.splice(i, 1);
            }
        }
        
        // Check for collisions
        checkObstacleCollisions();
        checkPowerupCollisions();
        
        // Handle car movement
        if (gameState.keysPressed.ArrowUp && gameState.carLane > 0) {
            gameState.carLane--;
            updateCarPosition();
            gameState.keysPressed.ArrowUp = false;
        }
        
        if (gameState.keysPressed.ArrowDown && gameState.carLane < 2) {
            gameState.carLane++;
            updateCarPosition();
            gameState.keysPressed.ArrowDown = false;
        }
        
        // Animate Peppa Car with a gentle bounce
        const bounce = Math.sin(gameState.animationFrame) * 3;
        const tilt = Math.sin(gameState.animationFrame * 0.8) * 1;
        peppaCar.style.transform = `translateY(${bounce}px) rotate(${tilt}deg)`;
        
        // Animate road markings
        gameState.roadPosition -= gameState.speed;
        if (gameState.roadPosition <= -60) {
            gameState.roadPosition = 0;
        }
        roadMarking.style.backgroundPosition = `${gameState.roadPosition}px 0`;
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Keyboard event listeners
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            gameState.keysPressed[e.key] = true;
            e.preventDefault(); // Prevent scrolling
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            gameState.keysPressed[e.key] = false;
        }
    });
    
    // Touch controls for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Create touch control buttons
    const createTouchControls = () => {
        // Container for touch controls
        const touchControls = document.createElement('div');
        touchControls.id = 'touch-controls';
        touchControls.style.position = 'absolute';
        touchControls.style.bottom = '10px';
        touchControls.style.left = '50%';
        touchControls.style.transform = 'translateX(-50%)';
        touchControls.style.display = 'flex';
        touchControls.style.gap = '20px';
        touchControls.style.zIndex = '50';
        
        // Up button
        const upButton = document.createElement('button');
        upButton.className = 'touch-btn up-btn';
        upButton.innerHTML = '&#9650;'; // Up arrow
        upButton.style.width = '60px';
        upButton.style.height = '60px';
        upButton.style.fontSize = '24px';
        upButton.style.backgroundColor = 'rgba(255, 102, 153, 0.7)';
        upButton.style.border = 'none';
        upButton.style.borderRadius = '50%';
        upButton.style.color = 'white';
        upButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        
        // Down button
        const downButton = document.createElement('button');
        downButton.className = 'touch-btn down-btn';
        downButton.innerHTML = '&#9660;'; // Down arrow
        downButton.style.width = '60px';
        downButton.style.height = '60px';
        downButton.style.fontSize = '24px';
        downButton.style.backgroundColor = 'rgba(255, 102, 153, 0.7)';
        downButton.style.border = 'none';
        downButton.style.borderRadius = '50%';
        downButton.style.color = 'white';
        downButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        
        // Add buttons to container
        touchControls.appendChild(upButton);
        touchControls.appendChild(downButton);
        
        // Add container to game canvas
        gameCanvas.appendChild(touchControls);
        
        // Add event listeners for buttons
        upButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (gameState.carLane > 0) {
                gameState.carLane--;
                updateCarPosition();
            }
        });
        
        downButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (gameState.carLane < 2) {
                gameState.carLane++;
                updateCarPosition();
            }
        });
        
        // Show/hide touch controls based on screen width
        const updateTouchControlsVisibility = () => {
            if (window.innerWidth <= 768) {
                touchControls.style.display = 'flex';
            } else {
                touchControls.style.display = 'none';
            }
        };
        
        // Initial check
        updateTouchControlsVisibility();
        
        // Update on resize
        window.addEventListener('resize', updateTouchControlsVisibility);
    };
    
    // Add swipe detection for mobile
    gameCanvas.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    gameCanvas.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
    
    // Handle swipe gestures
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const swipeDistance = touchEndY - touchStartY;
        
        if (swipeDistance < -swipeThreshold && gameState.carLane > 0) {
            // Swipe up
            gameState.carLane--;
            updateCarPosition();
        } else if (swipeDistance > swipeThreshold && gameState.carLane < 2) {
            // Swipe down
            gameState.carLane++;
            updateCarPosition();
        }
    }
    
    // Restart button event listener
    restartBtn.addEventListener('click', initGame);
    
    // Add sound toggle button
    const soundBtn = document.createElement('button');
    soundBtn.textContent = 'Toggle Sound';
    soundBtn.style.marginTop = '10px';
    soundBtn.style.marginRight = '10px';
    soundBtn.style.padding = '5px 10px';
    soundBtn.style.backgroundColor = '#ff6699';
    soundBtn.style.border = 'none';
    soundBtn.style.borderRadius = '5px';
    soundBtn.style.color = 'white';
    soundBtn.style.cursor = 'pointer';
    
    soundBtn.addEventListener('click', function() {
        if (bgMusicPlaying) {
            bgMusicObject.pause();
            bgMusicPlaying = false;
            soundBtn.textContent = 'Sound: OFF';
        } else {
            bgMusicObject = playBackgroundMusic();
            bgMusicPlaying = true;
            soundBtn.textContent = 'Sound: ON';
        }
    });
    
    // Add instructions button
    const instructionsBtn = document.createElement('button');
    instructionsBtn.textContent = 'Show Instructions';
    instructionsBtn.style.marginTop = '10px';
    instructionsBtn.style.marginRight = '10px';
    instructionsBtn.style.padding = '5px 10px';
    instructionsBtn.style.backgroundColor = '#ff6699';
    instructionsBtn.style.border = 'none';
    instructionsBtn.style.borderRadius = '5px';
    instructionsBtn.style.color = 'white';
    instructionsBtn.style.cursor = 'pointer';
    
    instructionsBtn.addEventListener('click', function() {
        alert('Peppa Pig Car Game - Phase 4\n\n' +
              'How to play:\n' +
              '- Use UP and DOWN arrow keys to change lanes\n' +
              '- Each level lasts 20 seconds\n' +
              '- Avoid hitting 3 obstacles to reach the finish line\n' +
              '- Collect power-ups for bonuses:\n' +
              '  ⭐ Star: Extra points\n' +
              '  🛡️ Shield: Protection from one hit\n' +
              '  ⚡ Speed: Temporary speed boost\n' +
              '- Complete levels to increase your score\n\n' +
              'Good luck!');
    });
    
    // Add buttons to controls
    controls.appendChild(instructionsBtn);
    controls.appendChild(soundBtn);
    
    // Create touch controls for mobile
    createTouchControls();
    
    // Create start game overlay
    const startOverlay = document.createElement('div');
    startOverlay.style.position = 'absolute';
    startOverlay.style.top = '0';
    startOverlay.style.left = '0';
    startOverlay.style.width = '100%';
    startOverlay.style.height = '100%';
    startOverlay.style.backgroundColor = 'rgba(255, 230, 240, 0.9)';
    startOverlay.style.display = 'flex';
    startOverlay.style.flexDirection = 'column';
    startOverlay.style.alignItems = 'center';
    startOverlay.style.justifyContent = 'center';
    startOverlay.style.zIndex = '100';
    
    // Add Peppa Pig title
    const gameTitle = document.createElement('h1');
    gameTitle.textContent = 'Peppa Pig Car Game';
    gameTitle.style.color = '#ff6699';
    gameTitle.style.fontFamily = 'Comic Sans MS, cursive, sans-serif';
    gameTitle.style.fontSize = '36px';
    gameTitle.style.marginBottom = '20px';
    gameTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.2)';
    
    // Create start game button
    const startGameBtn = document.createElement('button');
    startGameBtn.textContent = 'Start Game';
    startGameBtn.style.padding = '15px 30px';
    startGameBtn.style.fontSize = '24px';
    startGameBtn.style.backgroundColor = '#ff6699';
    startGameBtn.style.border = '3px solid #ff4477';
    startGameBtn.style.borderRadius = '10px';
    startGameBtn.style.color = 'white';
    startGameBtn.style.cursor = 'pointer';
    startGameBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    startGameBtn.style.fontFamily = 'Comic Sans MS, cursive, sans-serif';
    startGameBtn.style.transition = 'transform 0.2s, background-color 0.2s';
    
    // Add hover effect
    startGameBtn.onmouseover = function() {
        startGameBtn.style.backgroundColor = '#ff4477';
        startGameBtn.style.transform = 'scale(1.05)';
    };
    
    startGameBtn.onmouseout = function() {
        startGameBtn.style.backgroundColor = '#ff6699';
        startGameBtn.style.transform = 'scale(1)';
    };
    
    // Add instructions text
    const instructionsText = document.createElement('p');
    instructionsText.innerHTML = 'Use UP and DOWN arrow keys to move Peppa\'s car.<br>Avoid obstacles and collect power-ups!';
    instructionsText.style.color = '#333';
    instructionsText.style.fontFamily = 'Arial, sans-serif';
    instructionsText.style.fontSize = '18px';
    instructionsText.style.marginTop = '20px';
    instructionsText.style.textAlign = 'center';
    
    // Add elements to overlay
    startOverlay.appendChild(gameTitle);
    startOverlay.appendChild(startGameBtn);
    startOverlay.appendChild(instructionsText);
    
    // Add overlay to game canvas
    gameCanvas.appendChild(startOverlay);
    
    // Start button event listener
    startGameBtn.addEventListener('click', function() {
        // Create and initialize audio context explicitly
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Force audio context to resume (needed for some browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Play a sound to initialize audio context with a slight delay
        setTimeout(() => {
            // Play a test sound to ensure audio is working
            const testSound = playSound('bing');
            if (testSound) {
                console.log('Audio initialized successfully');
            }
            
            // Start background music
            bgMusicObject = playBackgroundMusic();
            bgMusicPlaying = true;
            
            // Remove start overlay
            startOverlay.remove();
            
            // Start the game
            initGame();
        }, 100);
    });
});
