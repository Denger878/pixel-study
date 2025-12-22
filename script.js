const timeButton = document.getElementById('timeButton')
const pauseButton = document.getElementById('pauseButton')
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
    titleStudyTime.textContent = minutesToTime(inputValue);
});

/* Pause/Start button on clock screen */
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

/* Start button - switch screens */
startButton.addEventListener('click', function() {
    if (inputValue > 0) {
        inputScreen.style.display = 'none';
        clockScreen.style.display = 'flex';
        document.body.style.backgroundImage = 'none';
        remainingSeconds = inputValue * 60;
        clockStudyTime.textContent = minutesToTime(inputValue);
    }
});

/* Convert minutes to time format */
function minutesToTime(minutes) {
    const mins = parseInt(minutes) || 0;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) {
        return `0:${String(mins).padStart(2, '0')}`;
    }
    return `${hours}:${String(remainingMins).padStart(2, '0')}`;
}

/* Update study time display */
function updateStudyTime() {
    inputValue = parseInt(inputBox.value.trim()) || 0;
    titleStudyTime.textContent = minutesToTime(inputValue);
}

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

/* Countdown timer function */
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(function() {
        remainingSeconds -= 60;
        clockStudyTime.textContent = minutesToTime(remainingSeconds / 60);
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            clockStudyTime.textContent = "0:00";
            alert("Time's up!");
        }
    }, 60000);
}

updateClock();
setInterval(updateClock, 1000);