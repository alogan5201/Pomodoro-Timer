"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var startButton = document.querySelector("#pomodoro-start");
  var stopButton = document.querySelector("#pomodoro-stop");

  var isClockRunning = false;
  // in seconds = 25 mins
  var workSessionDuration = 1500;
  var currentTimeLeftInSession = 1500;

  // in seconds = 5 mins;
  var breakSessionDuration = 300;

  var timeSpentInCurrentSession = 0;
  var type = "Work";

  var currentTaskLabel = document.querySelector("#pomodoro-clock-task");

  var updatedWorkSessionDuration = void 0;
  var updatedBreakSessionDuration = void 0;

  var workDurationInput = document.querySelector("#input-work-duration");
  var breakDurationInput = document.querySelector("#input-break-duration");

  workDurationInput.value = "25";
  breakDurationInput.value = "5";

  var isClockStopped = true;

  var progressBar = new ProgressBar.Circle("#pomodoro-timer", {
    strokeWidth: 2,
    text: {
      value: "25:00",
    },
    trailColor: "#f4f4f4",
  });

  // START
  startButton.addEventListener("click", function () {
    toggleClock();
  });

  // STOP
  stopButton.addEventListener("click", function () {
    toggleClock(true);
  });

  // UPDATE WORK TIME
  workDurationInput.addEventListener("input", function () {
    updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
  });

  // UPDATE PAUSE TIME
  breakDurationInput.addEventListener("input", function () {
    updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
  });

  var minuteToSeconds = function minuteToSeconds(mins) {
    return mins * 60;
  };

  var toggleClock = function toggleClock(reset) {
    togglePlayPauseIcon(reset);
    if (reset) {
      stopClock();
    } else {
      if (isClockStopped) {
        setUpdatedTimers();
        isClockStopped = false;
      }

      if (isClockRunning === true) {
        // pause
        clearInterval(clockTimer);
        // update icon to the play one
        // set the vale of the button to start or pause
        isClockRunning = false;
      } else {
        // start
        clockTimer = setInterval(function () {
          stepDown();
          displayCurrentTimeLeftInSession();
          progressBar.set(calculateSessionProgress());
        }, 1000);
        isClockRunning = true;
      }
      showStopIcon();
    }
  };

  var displayCurrentTimeLeftInSession = function displayCurrentTimeLeftInSession() {
    var secondsLeft = currentTimeLeftInSession;
    var result = "";
    var seconds = secondsLeft % 60;
    var minutes = parseInt(secondsLeft / 60) % 60;
    var hours = parseInt(secondsLeft / 3600);
    // add leading zeroes if it's less than 10
    function addLeadingZeroes(time) {
      return time < 10 ? "0" + time : time;
    }
    if (hours > 0) result += hours + ":";
    result += addLeadingZeroes(minutes) + ":" + addLeadingZeroes(seconds);
    progressBar.text.innerText = result.toString();
  };

  var stopClock = function stopClock() {
    setUpdatedTimers();
    displaySessionLog(type);
    clearInterval(clockTimer);
    isClockStopped = true;
    isClockRunning = false;
    currentTimeLeftInSession = workSessionDuration;
    displayCurrentTimeLeftInSession();
    type = "Work";
    timeSpentInCurrentSession = 0;
  };

  var stepDown = function stepDown() {
    if (currentTimeLeftInSession > 0) {
      // decrease time left / increase time spent
      currentTimeLeftInSession--;
      timeSpentInCurrentSession++;
    } else if (currentTimeLeftInSession === 0) {
      timeSpentInCurrentSession = 0;
      // Timer is over -> if work switch to break, viceversa
      if (type === "Work") {
        currentTimeLeftInSession = breakSessionDuration;
        displaySessionLog("Work");
        type = "Break";
        setUpdatedTimers();
        // new
        currentTaskLabel.value = "Break";
        currentTaskLabel.disabled = true;
      } else {
        currentTimeLeftInSession = workSessionDuration;
        type = "Work";
        setUpdatedTimers();
        // new
        if (currentTaskLabel.value === "Break") {
          currentTaskLabel.value = workSessionLabel;
        }
        currentTaskLabel.disabled = false;
        displaySessionLog("Break");
      }
    }
    displayCurrentTimeLeftInSession();
  };

  var displaySessionLog = function displaySessionLog(type) {
    var sessionsList = document.querySelector("#pomodoro-sessions");
    // append li to it
    var li = document.createElement("li");
    if (type === "Work") {
      sessionLabel = currentTaskLabel.value ? currentTaskLabel.value : "Work";
      workSessionLabel = sessionLabel;
    } else {
      sessionLabel = "Break";
    }
    var elapsedTime = parseInt(timeSpentInCurrentSession / 60);
    elapsedTime = elapsedTime > 0 ? elapsedTime : "< 1";

    var text = document.createTextNode(
      sessionLabel + " : " + elapsedTime + " min"
    );

    li.appendChild(text);
    sessionsList.appendChild(li);
  };

  var setUpdatedTimers = function setUpdatedTimers() {
    if (type === "Work") {
      currentTimeLeftInSession = updatedWorkSessionDuration
        ? updatedWorkSessionDuration
        : workSessionDuration;
      workSessionDuration = currentTimeLeftInSession;
    } else {
      currentTimeLeftInSession = updatedBreakSessionDuration
        ? updatedBreakSessionDuration
        : breakSessionDuration;
      breakSessionDuration = currentTimeLeftInSession;
    }
  };

  var togglePlayPauseIcon = function togglePlayPauseIcon(reset) {
    var playIcon = document.querySelector("#play-icon");
    var pauseIcon = document.querySelector("#pause-icon");
    if (reset) {
      // when resetting -> always revert to play icon
      if (playIcon.classList.contains("hidden")) {
        playIcon.classList.remove("hidden");
      }
      if (!pauseIcon.classList.contains("hidden")) {
        pauseIcon.classList.add("hidden");
      }
    } else {
      playIcon.classList.toggle("hidden");
      pauseIcon.classList.toggle("hidden");
    }
  };

  var showStopIcon = function showStopIcon() {
    var stopButton = document.querySelector("#pomodoro-stop");
    stopButton.classList.remove("hidden");
  };

  var calculateSessionProgress = function calculateSessionProgress() {
    // calculate the completion rate of this session
    var sessionDuration =
      type === "Work" ? workSessionDuration : breakSessionDuration;
    return (timeSpentInCurrentSession / sessionDuration) * 10;
  };
});
