const timeButton = document.getElementById('timeButton')
const pauseButton = document.getElementById('pauseButton')
const inputBox = document.querySelector('.input');
const titleStudyTime = document.getElementById('titleStudyTime');
const plus30 = document.getElementById('plus30');
let isHovering = false;

/* Hide function for real time clock */
timeButton.addEventListener('mouseenter', function (){
    isHovering = true;
    timeButton.textContent = "Hide";
});

timeButton.addEventListener('mouseleave', function (){
    isHovering = false;
    updateClock();
});

/* Convert minutes to time format */
function minutesToTime(minutes) {
    const mins = parseInt(minutes) || 0;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${String(remainingMins).padStart(2, '0')}`;
}

/* Update study time display */
function updateStudyTime() {
    const inputValue = inputBox.value.trim();
    const timeFormatted = minutesToTime(inputValue);
    titleStudyTime.textContent = timeFormatted;
}

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

updateClock();
setInterval(updateClock, 1000);

