/* ==================== CANVAS SETUP ==================== */
const canvas = document.getElementById('landscapesCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const landscapes = [
  'landscapes/lofoten_islands.jpg',
  'landscapes/benagil_cave.jpg',
  'landscapes/yellowstone.jpg',
  'landscapes/great_wall_of_china.jpg',
  'landscapes/ben_gioc.jpg'
];

const randomLandscape = landscapes[Math.floor(Math.random() * landscapes.length)];

const landscapeImage = new Image();
landscapeImage.src = randomLandscape;

landscapeImage.onload = function() {
  console.log('Loaded:', randomLandscape);
  ctx.drawImage(landscapeImage, 0, 0, canvas.width, canvas.height);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawPixelated(200); // One pixel = whole screen width
  console.log('Pixelated version drawn!');
};

landscapeImage.onerror = function() {
  console.error('Failed to load:', randomLandscape);
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
let inFinalMinute = false
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

/* Update +30 */
plus30.addEventListener('click', function() {
    inputValue += 30;
    titleStudyTime.textContent = secondsToTime(inputValue * 60);
});

/* Start button - switch screens */
startButton.addEventListener('click', function() {
    if (inputValue > 0) {
        inputScreen.style.display = 'none';
        clockScreen.style.display = 'flex';
        document.body.style.backgroundImage = 'none';
        canvas.style.display = 'block';
        remainingSeconds = inputValue * 60;
        clockStudyTime.textContent = secondsToTime(remainingSeconds);
        drawPixelated(calculateBlockSize());
    }
});

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
    countdownInterval = setInterval(function() {
        remainingSeconds --;
        const blockSize = calculateBlockSize();
        drawPixelated(blockSize);
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            clockStudyTime.textContent = '';
            timeButton.style.display = 'none';
            pauseButton.style.display = 'none';
        } else if (remainingSeconds <= 60) {
            clockStudyTime.textContent = remainingSeconds;
        } else
            clockStudyTime.textContent = secondsToTime(remainingSeconds);
        
        
    }, 10);
}

updateClock();
setInterval(updateClock, 1000);

/* ==================== PIXEL REVEAL ==================== */

let imageData = null;

// Draw the image in pixelated blocks
function drawPixelated(blockSize) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw blocks
  for (let y = 0; y < canvas.height; y += blockSize) {
    for (let x = 0; x < canvas.width; x += blockSize) {
      const color = getAverageColor(x, y, blockSize, blockSize);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
  }
}

/* Get average color of an image */
function getAverageColor(startX, startY, blockWidth, blockHeight) {
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let y = startY; y < startY + blockHeight && y < canvas.height; y++) {
    for (let x = startX; x < startX + blockWidth && x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      r += imageData.data[index];     // Red
      g += imageData.data[index + 1]; // Green
      b += imageData.data[index + 2]; // Blue
      count++;
    }
  }
 return `rgb(${Math.floor(r/count)}, ${Math.floor(g/count)}, ${Math.floor(b/count)})`;
}

// Calculate what block size should be based on progress
function calculateBlockSize() {
  const totalSeconds = inputValue * 60;
  if (totalSeconds === 0) return startBlockSize;

  const elapsed = totalSeconds - remainingSeconds;
  const progress = elapsed / totalSeconds;

  // Which discrete stage are we in?
  const stage = Math.min(
    pixelStages - 1,
    Math.floor(progress * pixelStages)
  );

  // Exponential decay so it feels like consistent splitting
  const ratio = Math.pow(
    endBlockSize / startBlockSize,
    1 / (pixelStages - 1)
  );

  const blockSize = startBlockSize * Math.pow(ratio, stage);

  return Math.max(endBlockSize, Math.round(blockSize));
}

/* ==================== INITIALIZATION ==================== */