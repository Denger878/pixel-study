/* ==================== API CONFIGURATION ==================== */
const API_URL = 'http://localhost:5001/api/random';

/* ==================== CANVAS SETUP ==================== */
const canvas = document.getElementById('landscapesCanvas');
const ctx = canvas.getContext('2d');

// Disable image smoothing for crisp pixels
ctx.imageSmoothingEnabled = false;

canvas.width = Math.min(window.innerWidth, 1920);
canvas.height = Math.min(window.innerHeight, 1080);

const landscapeImage = new Image();
landscapeImage.crossOrigin = "anonymous";  // Enable CORS for API images

/* ==================== LOAD RANDOM LANDSCAPE FROM API ==================== */
async function loadRandomLandscape() {
    try {
        console.log('Fetching random landscape from API...');
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            console.log('API Response:', data.data);
            
            // Set image source from API
            landscapeImage.src = data.data.imageUrl;
            
            // Log location if available
            if (data.data.caption) {
                console.log('Location:', data.data.caption);
            } else {
                console.log('No location data for this image');
            }
            
            // Log photographer credit
            console.log('Photo by:', data.data.photographer.name);
        } else {
            console.error('API returned error');
            fallbackToLocalImage();
        }
    } catch (error) {
        console.error('Failed to fetch from API:', error);
        fallbackToLocalImage();
    }
}

// Fallback to local image if API fails
function fallbackToLocalImage() {
    console.log('Using fallback local image');
    const landscapes = [
        'landscapes/lofoten_islands.jpg',
        'landscapes/benagil_cave.jpg',
        'landscapes/yellowstone.jpg',
        'landscapes/great_wall_of_china.jpg',
        'landscapes/ben_gioc.jpg'
    ];
    const randomLandscape = landscapes[Math.floor(Math.random() * landscapes.length)];
    landscapeImage.src = randomLandscape;
}

// Load image on page load
loadRandomLandscape();

landscapeImage.onload = function() {
    console.log('Image loaded successfully');
    ctx.drawImage(landscapeImage, 0, 0, canvas.width, canvas.height);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawPixelated(200);
    console.log('Pixelated version drawn!');
};

landscapeImage.onerror = function() {
    console.error('Failed to load image, trying fallback');
    fallbackToLocalImage();
};

/* ==================== CONSTANTS ==================== */
const timeButton = document.getElementById('timeButton');
const pauseButton = document.getElementById('pauseButton');
const inputBox = document.querySelector('.input');
const titleStudyTime = document.getElementById('titleStudyTime');
const plus30 = document.getElementById('plus30');
const startButton = document.getElementById('startButton');
const inputScreen = document.querySelector('.inputScreen');
const clockScreen = document.querySelector('.clock');
const clockStudyTime = document.getElementById('studyTime');
let isHovering = false;
let inputValue = 0;
let remainingSeconds = 0;
let countdownInterval = null;
let inFinalMinute = false;
let lastStage = -1;
const pixelStages = 32;
const startBlockSize = 128;
const endBlockSize = 4;

/* ==================== TIMER LOGIC ==================== */

/* --------------------TITLE SCREEN-------------------- */

/* Update on Enter key press */
inputBox.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        updateStudyTime();
        inputBox.blur();
    }
});

/* Update when input user clicks elsewhere */
inputBox.addEventListener('blur', function() {
    updateStudyTime();
});

/* Add global Enter key listener for starting timer */
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && inputScreen.style.display !== 'none') {
        // Check if input box is NOT focused
        if (document.activeElement !== inputBox) {
            // Start timer if valid time exists
            if (inputValue > 0) {
                startTimer();
            }
        }
    }
});

/* Update +30 */
plus30.addEventListener('click', function() {
    inputValue += 30;
    titleStudyTime.textContent = secondsToTime(inputValue * 60);
});

/* Start button - switch screens */
startButton.addEventListener('click', function() {
    startTimer();
});

/* Function to start the timer and switch screens */
function startTimer() {
    if (inputValue > 0) {
        inputScreen.style.display = 'none';
        clockScreen.style.display = 'flex';
        document.body.style.backgroundImage = 'none';
        canvas.style.display = 'block';
        remainingSeconds = inputValue * 60;
        clockStudyTime.textContent = secondsToTime(remainingSeconds);
        drawPixelated(calculateBlockSize());
    }
}

/* Update study time display */
function updateStudyTime() {
    inputValue = parseInt(inputBox.value.trim()) || 0;
    titleStudyTime.textContent = secondsToTime(inputValue * 60);
}

/* --------------------CLOCK SCREEN-------------------- */

/* Hide function for real time clock */
timeButton.addEventListener('mouseenter', function (){
    isHovering = true;
    timeButton.textContent = "Hide";
});

timeButton.addEventListener('mouseleave', function (){
    isHovering = false;
    updateClock();
});

timeButton.addEventListener('click', function(){
    timeButton.style.display = 'none';
})

/* Pause/Start button */
pauseButton.addEventListener('click', function() {
    if (pauseButton.textContent === "Start") {
        pauseButton.style.opacity = '0';
        startCountdown();
        pauseButton.textContent = "Pause";
    } else if (pauseButton.textContent === "Pause") {
        clearInterval(countdownInterval);
        pauseButton.textContent = "Resume";
    } else {
        startCountdown();
        pauseButton.textContent = "Pause";
    }
});

pauseButton.addEventListener('mouseenter', function() {
    if (pauseButton.textContent === "Pause") {
        pauseButton.style.opacity = '1';
    }
});

/* Hide pause button when mouse leaves */
pauseButton.addEventListener('mouseleave', function() {
    if (pauseButton.textContent === "Pause") {
        pauseButton.style.opacity = '0';
    }
});

/* Real time clock update */
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours());
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (!isHovering) {
        document.getElementById('timeButton').textContent = `${hours} : ${minutes} : ${seconds}`;
    }
}

/* --------------------CLOCK LOGIC-------------------- */

/* Convert seconds to time format */
function secondsToTime(seconds) {
    const total = parseInt(seconds) || 0;
    const secs = total % 60;
    const mins = Math.floor(total / 60) % 60;
    const hours = Math.floor(total / 3600);
    if (hours === 0) {
        return `0:${String(mins).padStart(2, '0')}`;
    }
    return `${hours}:${String(mins).padStart(2, '0')}`;
}

/* Countdown timer function */
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    let lastUpdateTime = Date.now();
    countdownInterval = setInterval(function() {
        const now = Date.now();
        const deltaTime = now - lastUpdateTime;
        lastUpdateTime = now;
        
        // Only decrement if close to 1 second has passed
        if (deltaTime >= 900) {
            remainingSeconds--;
        }
        
        // Update clock display every tick
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            clockStudyTime.textContent = '';
            timeButton.style.display = 'none';
            pauseButton.style.display = 'none';
            colorBlastReveal();
        } else if (remainingSeconds <= 60) {
            clockStudyTime.textContent = remainingSeconds;
        } else {
            clockStudyTime.textContent = secondsToTime(remainingSeconds);
        }
        
        // Update pixels only when stage changes
        const newStage = calculateStage();
        if (newStage !== lastStage) {
            lastStage = newStage;
            const blockSize = calculateBlockSize();
            
            // Subtle desaturation only in final 60 seconds
            let saturation = 1.0;
            if (remainingSeconds <= 60) {
                saturation = 0.5 + (remainingSeconds / 60 * 0.5);
            }
            
            drawPixelated(blockSize, saturation);
            console.log(`Stage ${newStage}: ${blockSize}px blocks, saturation: ${saturation.toFixed(2)}`);
        }
        
    }, 1000);
}

updateClock();
setInterval(updateClock, 1000);

/* ==================== PIXEL REVEAL ==================== */

let imageData = null;

// Draw the image in pixelated blocks
function drawPixelated(blockSize, saturation = 1.0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let y = 0; y < canvas.height; y += blockSize) {
    for (let x = 0; x < canvas.width; x += blockSize) {
      const color = getAverageColor(x, y, blockSize, blockSize, saturation);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
  }
}

/* Get average color of an image */
function getAverageColor(startX, startY, blockWidth, blockHeight, saturation = 1.0) {
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let y = startY; y < startY + blockHeight && y < canvas.height; y++) {
    for (let x = startX; x < startX + blockWidth && x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      r += imageData.data[index];
      g += imageData.data[index + 1];
      b += imageData.data[index + 2];
      count++;
    }
  }
  
  // Calculate average RGB
  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);
  
  // Apply subtle desaturation if needed
  if (saturation < 1.0) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = Math.floor(r * saturation + gray * (1 - saturation));
    g = Math.floor(g * saturation + gray * (1 - saturation));
    b = Math.floor(b * saturation + gray * (1 - saturation));
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Calculate what block size should be based on current stage
function calculateBlockSize() {
  const stage = calculateStage();
  const numberOfStages = 16;
  
  const maxBlockSize = 256;
  const minBlockSize = 8;
  
  // Create exponential curve for satisfying "splitting" feel
  const stageProgress = stage / (numberOfStages - 1);
  const easedProgress = Math.pow(stageProgress, 1.4);
  
  const blockSize = maxBlockSize * Math.pow(minBlockSize / maxBlockSize, easedProgress);
  
  return Math.round(blockSize);
}

// Calculate which discrete stage we're in (0 to numberOfStages-1)
function calculateStage() {
  const totalSeconds = inputValue * 60;
  if (totalSeconds === 0) return 0;
  
  const progress = (totalSeconds - remainingSeconds) / totalSeconds;
  const numberOfStages = 16;
  
  const stage = Math.floor(progress * numberOfStages);
  return Math.min(stage, numberOfStages - 1);
}

// Animate the final color reveal with left-to-right wave
function colorBlastReveal() {
  // Remove frosted glass effect from clock container
  clockScreen.style.background = 'transparent';
  clockScreen.style.backdropFilter = 'none';
  clockScreen.style.webkitBackdropFilter = 'none';
  clockScreen.style.border = 'none';
  clockScreen.style.boxShadow = 'none';
  
  let blastProgress = 0;
  const blastDuration = 3000;
  const startTime = Date.now();
  
  function animateBlast() {
    const elapsed = Date.now() - startTime;
    blastProgress = Math.min(1, elapsed / blastDuration);
    
    const easedProgress = 1 - Math.pow(1 - blastProgress, 2);
    
    const transitionZone = 150;
    const wavePosition = easedProgress * (canvas.width + transitionZone);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // LAYER 1: Draw pixelated background everywhere
    const blockSize = 8;
    for (let y = 0; y < canvas.height; y += blockSize) {
      for (let x = 0; x < canvas.width; x += blockSize) {
        const color = getAverageColor(x, y, blockSize, blockSize, 0.5);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
    
    // LAYER 2: Draw full-res image over the revealed area
    if (wavePosition > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, Math.max(0, wavePosition), canvas.height);
      ctx.clip();
      ctx.drawImage(landscapeImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // LAYER 3: Draw gradient mask over transition zone to blend
      if (wavePosition < canvas.width + transitionZone) {
        const gradient = ctx.createLinearGradient(
        wavePosition - transitionZone, 0,
        wavePosition, 0
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');

        ctx.fillStyle = gradient;
        ctx.fillRect(wavePosition - transitionZone, 0, transitionZone, canvas.height);
      }
    }
    
    if (blastProgress < 1) {
      requestAnimationFrame(animateBlast);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(landscapeImage, 0, 0, canvas.width, canvas.height);
    }
  }
  
  requestAnimationFrame(animateBlast);
}

/* ==================== INITIALIZATION ==================== */

// Auto-focus the input box when page loads
window.addEventListener('load', function() {
    inputBox.focus();
});

// Handle window resize to keep canvas properly sized
window.addEventListener('resize', function() {
  // Only resize if on clock screen (canvas is visible)
  if (canvas.style.display === 'block') {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    canvas.width = Math.min(window.innerWidth, 1920);
    canvas.height = Math.min(window.innerHeight, 1080);
    
    // Redraw if size changed
    if (oldWidth !== canvas.width || oldHeight !== canvas.height) {
      // Reload image data at new size
      ctx.drawImage(landscapeImage, 0, 0, canvas.width, canvas.height);
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Redraw current state
      if (remainingSeconds > 0) {
        const blockSize = calculateBlockSize();
        let saturation = 1.0;
        if (remainingSeconds <= 60) {
          saturation = 0.5 + (remainingSeconds / 60 * 0.5);
        }
        drawPixelated(blockSize, saturation);
      }
    }
  }
});
