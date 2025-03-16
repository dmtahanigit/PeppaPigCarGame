// Sound effects for Peppa Pig Car Game

// Real sound effects using URLs instead of base64 (which might not work in all browsers)
const AUDIO = {
    // Sound effects
    powerup: "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3",
    collision: "https://assets.mixkit.co/sfx/preview/mixkit-falling-hit-on-gravel-756.mp3",
    gameOver: "https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3",
    bgMusic: "https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3",
    levelComplete: "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3",
    crowdCheer: "https://assets.mixkit.co/sfx/preview/mixkit-crowd-in-stadium-cheering-loop-442.mp3"
};

// Function to play a sound
function playSound(soundName) {
    try {
        const audio = new Audio(AUDIO[soundName]);
        audio.volume = 0.5;
        
        // Log to console for debugging
        console.log(`Playing sound: ${soundName}`);
        
        // Play the sound with a promise and catch any errors
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error playing sound ${soundName}:`, error);
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
            });
        }
        
        return bgMusic; // Return the audio object so it can be stopped later
    } catch (error) {
        console.error('Error creating background music:', error);
        return null;
    }
}
