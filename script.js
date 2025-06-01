document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const timerElement = document.getElementById('timer');
    const timerModeElement = document.getElementById('timer-mode');
    const progressBar = document.getElementById('progress-bar');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const longBreakTimeInput = document.getElementById('long-break-time');
    const longBreakIntervalInput = document.getElementById('long-break-interval');
    const completedCyclesElement = document.getElementById('completed-cycles');
    const cycleIndicatorsElement = document.getElementById('cycle-indicators');

    // Timer state
    let timerInterval;
    let timeLeft;
    let totalTime;
    let isRunning = false;
    let isPaused = false;
    let isWorkTime = true;
    let completedCycles = 0;
    let completedPomodoros = 0;

    // Audio notifications
    const workCompleteSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
    const breakCompleteSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');

    // Initialize timer display
    updateTimerDisplay();
    updateCycleIndicators();

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Settings inputs event listeners
    [workTimeInput, breakTimeInput, longBreakTimeInput, longBreakIntervalInput].forEach(input => {
        input.addEventListener('change', () => {
            if (!isRunning) {
                updateTimerDisplay();
            }
        });
    });

    // Functions
    function startTimer() {
        if (isPaused) {
            resumeTimer();
            return;
        }

        if (isRunning) return;

        isRunning = true;
        isPaused = false;
        
        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // Disable settings while timer is running
        toggleSettingsInputs(true);
        
        // Set timer duration based on current mode
        setTimerDuration();
        
        // Start the timer interval
        timerInterval = setInterval(updateTimer, 1000);
    }

    function pauseTimer() {
        if (!isRunning || isPaused) return;
        
        clearInterval(timerInterval);
        isPaused = true;
        
        // Update button states
        startBtn.disabled = false;
        startBtn.textContent = '再開';
    }

    function resumeTimer() {
        if (!isPaused) return;
        
        isPaused = false;
        
        // Update button states
        startBtn.disabled = true;
        
        // Resume the timer interval
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        isPaused = false;
        
        // Reset to work time
        isWorkTime = true;
        
        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.textContent = 'スタート';
        
        // Enable settings
        toggleSettingsInputs(false);
        
        // Reset timer display
        updateTimerDisplay();
        
        // Reset progress bar
        progressBar.style.width = '0%';
    }

    function updateTimer() {
        timeLeft--;
        
        // Update timer display
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress bar
        const progressPercentage = 100 - (timeLeft / totalTime * 100);
        progressBar.style.width = `${progressPercentage}%`;
        
        // Check if timer is complete
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerComplete();
        }
    }

    function timerComplete() {
        // Play sound based on which timer completed
        if (isWorkTime) {
            workCompleteSound.play();
            completedPomodoros++;
            
            // Update completed cycles
            if (completedPomodoros % parseInt(longBreakIntervalInput.value) === 0) {
                completedCycles++;
                completedCyclesElement.textContent = completedCycles;
                updateCycleIndicators();
            }
        } else {
            breakCompleteSound.play();
        }
        
        // Toggle timer mode
        isWorkTime = !isWorkTime;
        
        // Check if it's time for a long break
        if (!isWorkTime && completedPomodoros % parseInt(longBreakIntervalInput.value) === 0) {
            timerModeElement.textContent = '長い休憩時間';
        } else {
            timerModeElement.textContent = isWorkTime ? '作業時間' : '休憩時間';
        }
        
        // Reset timer
        setTimerDuration();
        
        // Start the next timer
        timerInterval = setInterval(updateTimer, 1000);
    }

    function setTimerDuration() {
        if (isWorkTime) {
            totalTime = parseInt(workTimeInput.value) * 60;
            timerModeElement.textContent = '作業時間';
        } else {
            // Check if it's time for a long break
            if (completedPomodoros % parseInt(longBreakIntervalInput.value) === 0) {
                totalTime = parseInt(longBreakTimeInput.value) * 60;
                timerModeElement.textContent = '長い休憩時間';
            } else {
                totalTime = parseInt(breakTimeInput.value) * 60;
                timerModeElement.textContent = '休憩時間';
            }
        }
        
        timeLeft = totalTime;
        
        // Update timer display
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Reset progress bar
        progressBar.style.width = '0%';
    }

    function updateTimerDisplay() {
        // Set initial timer display based on work time
        const workMinutes = parseInt(workTimeInput.value);
        timerElement.textContent = `${workMinutes.toString().padStart(2, '0')}:00`;
        timerModeElement.textContent = '作業時間';
    }

    function toggleSettingsInputs(disabled) {
        workTimeInput.disabled = disabled;
        breakTimeInput.disabled = disabled;
        longBreakTimeInput.disabled = disabled;
        longBreakIntervalInput.disabled = disabled;
    }

    function updateCycleIndicators() {
        // Clear existing indicators
        cycleIndicatorsElement.innerHTML = '';
        
        // Create indicators based on long break interval
        const longBreakInterval = parseInt(longBreakIntervalInput.value);
        
        for (let i = 0; i < longBreakInterval; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('cycle-indicator');
            
            // Mark completed pomodoros
            if (i < completedPomodoros % longBreakInterval) {
                indicator.classList.add('completed');
            }
            
            cycleIndicatorsElement.appendChild(indicator);
        }
    }
});
