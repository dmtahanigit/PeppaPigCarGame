// Sound effects for Peppa Pig Car Game

// Create audio context for better browser compatibility
let audioContext;
try {
    // Create audio context only when needed (will be initialized on user interaction)
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = null; // Will be initialized on first user interaction
    console.log('Audio context ready to be initialized');
} catch (e) {
    console.error('Web Audio API not supported in this browser:', e);
}

// Initialize audio context on first user interaction
function initializeAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new AudioContext();
            console.log('Audio context initialized:', audioContext.state);
            
            // Some browsers might suspend audio context by default
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('Audio context resumed successfully');
                }).catch(err => {
                    console.error('Failed to resume audio context:', err);
                });
            }
        } catch (e) {
            console.error('Failed to initialize audio context:', e);
        }
    }
    return audioContext;
}

// Real sound effects using URLs instead of base64 (which might not work in all browsers)
const AUDIO = {
    // Sound effects
    powerup: "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3",
    collision: "https://assets.mixkit.co/sfx/preview/mixkit-falling-hit-on-gravel-756.mp3",
    gameOver: "https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3",
    bgMusic: "https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3",
    levelComplete: "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3",
    crowdCheer: "https://assets.mixkit.co/sfx/preview/mixkit-crowd-in-stadium-cheering-loop-442.mp3",
    carMotor: "assets/audio/car-motor-36308.mp3",
    bing: "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3"
};

// Preload all audio files to ensure they play on first interaction
const preloadedAudio = {};

// Function to preload all sounds
function preloadSounds() {
    // Make sure we have audio support
    if (!window.Audio) {
        console.error('Audio not supported in this browser');
        return;
    }
    
    for (const [key, url] of Object.entries(AUDIO)) {
        try {
            const audio = new Audio(url);
            // For some browsers, we need to "touch" the audio object
            audio.load();
            preloadedAudio[key] = audio;
            console.log(`Preloaded sound: ${key}`);
            
            // Add error handling for each audio element
            audio.addEventListener('error', (e) => {
                console.error(`Error loading audio ${key}:`, e);
            });
        } catch (error) {
            console.error(`Error preloading audio for ${key}:`, error);
        }
    }
}

// Call preload on page load, but sounds will only play after user interaction
preloadSounds();

// Document-level click handler to initialize audio context on first interaction
document.addEventListener('click', function initAudioOnFirstClick() {
    initializeAudioContext();
    // Remove this listener after first click
    document.removeEventListener('click', initAudioOnFirstClick);
}, { once: true });

// Function to play a sound
function playSound(soundName) {
    try {
        // Make sure audio context is initialized
        initializeAudioContext();
        
        // Use preloaded audio if available, otherwise create new
        let audio;
        if (preloadedAudio[soundName]) {
            // Clone the audio to allow multiple plays
            audio = preloadedAudio[soundName].cloneNode();
        } else {
            if (!AUDIO[soundName]) {
                console.error(`Sound "${soundName}" not found in AUDIO object`);
                return null;
            }
            audio = new Audio(AUDIO[soundName]);
        }
        
        audio.volume = 0.5;
        
        // Log to console for debugging
        console.log(`Playing sound: ${soundName}`);
        
        // Play the sound with a promise and catch any errors
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error playing sound ${soundName}:`, error);
                
                // If autoplay was prevented, try again after a user interaction
                if (error.name === 'NotAllowedError') {
                    console.log(`Autoplay prevented for ${soundName}, will try again after user interaction`);
                    
                    // Add a one-time click handler to play the sound
                    const playOnClick = function() {
                        const retryPlay = audio.play();
                        if (retryPlay) {
                            retryPlay.catch(e => console.error(`Retry failed for ${soundName}:`, e));
                        }
                        document.removeEventListener('click', playOnClick);
                    };
                    
                    document.addEventListener('click', playOnClick, { once: true });
                }
            });
        }
        
        return audio;
    } catch (error) {
        console.error(`Error creating audio for ${soundName}:`, error);
        return null;
    }
}

// Function to play background music (looped)
function playBackgroundMusic() {
    try {
        // Make sure audio context is initialized
        initializeAudioContext();
        
        const bgMusic = new Audio(AUDIO.bgMusic);
        bgMusic.loop = true;
        bgMusic.volume = 0.3; // Lower volume for background music
        
        // Log to console for debugging
        console.log('Playing background music');
        
        // Play the music with a promise and catch any errors
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Error playing background music:', error);
                
                // If autoplay was prevented, try again after a user interaction
                if (error.name === 'NotAllowedError') {
                    console.log('Autoplay prevented for background music, will try again after user interaction');
                    
                    // Add a one-time click handler to play the music
                    const playOnClick = function() {
                        const retryPlay = bgMusic.play();
                        if (retryPlay) {
                            retryPlay.catch(e => console.error('Retry failed for background music:', e));
                        }
                        document.removeEventListener('click', playOnClick);
                    };
                    
                    document.addEventListener('click', playOnClick, { once: true });
                }
            });
        }
        
        return bgMusic; // Return the audio object so it can be stopped later
    } catch (error) {
        console.error('Error creating background music:', error);
        return null;
    }
}
