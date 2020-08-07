document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".o-play-btn");

  const stopButton = document.querySelector("#pomodoro-stop");
  let updatedWorkSessionDuration;
  let updatedBreakSessionDuration;

  let workDurationInput = document.querySelector("#input-work-duration");
  let breakDurationInput = document.querySelector("#input-break-duration");

  workDurationInput.value = "30";
  breakDurationInput.value = "5";
  let isClockRunning = false;
  // in seconds = 25 mins
  let workSessionDuration = 1800;
  let currentTimeLeftInSession = 1800;
  // in seconds = 5 mins;
  let breakSessionDuration = 300;
  let type = "Work";
  let timeSpentInCurrentSession = 0;
  let currentTaskLabel = document.querySelector("#pomodoro-clock-task");
  let isClockStopped = true;
  const progressBar = new ProgressBar.Circle("#pomodoro-timer", {
    strokeWidth: 2,
    text: {
      value: "30:00",
    },
    trailColor: "#f4f4f4",
  });
  // START
  startButton.addEventListener("click", () => {
    toggleClock();
  });

  // STOP
  stopButton.addEventListener("click", () => {
    toggleClock(true);
  });
  // UPDATE WORK TIME
  workDurationInput.addEventListener("input", () => {
    updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
  });

  // UPDATE PAUSE TIME
  breakDurationInput.addEventListener("input", () => {
    updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
  });
  class AndrewsProgress {
    constructor(score) {
      this.score = score;
    }
    increment() {
      this.score++;
    }
  }

  const july2020 = new AndrewsProgress(30);

  const minuteToSeconds = (mins) => {
    return mins * 60;
  };
  const setUpdatedTimers = () => {
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
  const toggleClock = (reset) => {
    togglePlayPauseIcon(reset);
    if (reset) {
      stopClock();
    } else {
      console.log(isClockStopped);
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
        clockTimer = setInterval(() => {
          stepDown();
          displayCurrentTimeLeftInSession();
          progressBar.set(calculateSessionProgress());
        }, 1000);
        isClockRunning = true;
      }
      // new
      showStopIcon();
    }
  };

  const stepDown = () => {
    if (currentTimeLeftInSession > 0) {
      // decrease time left / increase time spent
      currentTimeLeftInSession--;
      timeSpentInCurrentSession++;
    } else if (currentTimeLeftInSession === 0) {
      timeSpentInCurrentSession = 0;
      document.getElementById("myAudio").play();
      alert("Times up");
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

  const stopClock = () => {
    setUpdatedTimers();
    displaySessionLog(type);
    updateProgress(type);
    clearInterval(clockTimer);
    isClockStopped = true;
    isClockRunning = false;
    currentTimeLeftInSession = workSessionDuration;
    displayCurrentTimeLeftInSession();
    type = "Work";
    timeSpentInCurrentSession = 0;
  };

  var displaySessionLog = function displaySessionLog(type) {
    // var sessionsList = document.querySelector("#pomodoro-sessions");
    // append li to it
    //var li = document.createElement("li");

    if (type === "Work") {
      // currentTaskLabel.value = "Break";
      sessionLabel = currentTaskLabel.value ? currentTaskLabel.value : "Work";
      workSessionLabel = sessionLabel;
    } else {
      sessionLabel = "Break";
    }
    var elapsedTime = parseInt(timeSpentInCurrentSession / 60);
    elapsedTime = elapsedTime > 1 ? elapsedTime : "< 1";

    let tomatos = document.querySelector("ul.tomatos");
    let lastElm = tomatos.lastElementChild;
    let tomato = document.createElement("li");

    tomato.setAttribute("class", "half-tomato");
    tomato.className =
      lastElm.className === "full-tomato" && sessionLabel === "Work"
        ? "half-tomato"
        : lastElm.className === "half-tomato" && sessionLabel === "Work"
        ? lastElm.classList.replace("half-tomato", "full-tomato")
        : sessionLabel === "Work"
        ? (tomato.className = "half-tomato")
        : console.log("not enough time has been spent");

    //tomato = elapsedTime > 1 ? tomato : console.log("keep working");
    /* var text = document.createTextNode(
      sessionLabel + " : " + elapsedTime + " min"
    );*/

    tomatos.appendChild(tomato);
    //let halfTomato = document.createElement("img");
    //halfTomato.setAttribute("src", "./half-tomato-png.png");

    // Work : < 1 min will be 30 minutes

    //lastElm.classList.replace("half-tomato", "full-tomato");
    //li.appendChild(text);

    // sessionsList.appendChild(li);
  };

  let ourObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      console.log("Mutation detected");
    }
  });

  ourObserver.observe(document.querySelector(".tomatos"), {
    childList: true,
    subtree: true,
    attributes: true,
  });

  const updateProgress = function updateProgress(type) {
    var elapsedTime = parseInt(timeSpentInCurrentSession / 60);
    if (type === "Work" && elapsedTime > 0) {
      july2020.increment();
      console.log(july2020.score);
    }
  };

  const displayCurrentTimeLeftInSession = () => {
    const secondsLeft = currentTimeLeftInSession;
    let result = "";
    const seconds = secondsLeft % 60;
    const minutes = parseInt(secondsLeft / 60) % 60;
    let hours = parseInt(secondsLeft / 3600);
    // add leading zeroes if it's less than 10
    function addLeadingZeroes(time) {
      return time < 10 ? `0${time}` : time;
    }
    if (hours > 0) result += `${hours}:`;
    result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;
    progressBar.text.innerText = result.toString();
  };

  const togglePlayPauseIcon = (reset) => {
    //const playIcon = document.querySelector(".o-play-btn__icon");
    //const pauseIcon = document.querySelector("#pause-icon");
    if (reset) {
      // when resetting -> always revert to play icon
      if (startButton.classList.contains("o-play-btn--playing")) {
        startButton.classList.remove("o-play-btn--playing");
      }
      /*if (!pauseIcon.classList.contains("hidden")) {
        pauseIcon.classList.add("hidden");
      }*/
    } else {
      startButton.classList.toggle("o-play-btn--playing");
      // pauseIcon.classList.toggle("hidden");
    }
  };

  const showStopIcon = () => {
    const stopButton = document.querySelector("#pomodoro-stop");
    stopButton.classList.remove("hidden");
  };

  const calculateSessionProgress = () => {
    // calculate the completion rate of this session
    const sessionDuration =
      type === "Work" ? workSessionDuration : breakSessionDuration;
    return (timeSpentInCurrentSession / sessionDuration) * 10;
  };
});
