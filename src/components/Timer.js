import React, { useState, useEffect, useRef } from "react";
import "./timer.css";
import alarmSound from "../assets/alarm-sound.mp3"; // Import the alarm sound

const Timer = () => {
    const defaultWorkTime = 25 * 60; // Default work time in seconds (25 minutes)
    const defaultBreakTime = 5 * 60; // Default break time in seconds (5 minutes)

    const [workTime, setWorkTime] = useState(parseInt(localStorage.getItem('workTime')) || defaultWorkTime);
    const [breakTime, setBreakTime] = useState(parseInt(localStorage.getItem('breakTime')) || defaultBreakTime);
    const [timeRemaining, setTimeRemaining] = useState(workTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const alarmRef = useRef(null);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Reset timer
    const resetTimer = () => {
        setIsRunning(false);
        setTimeRemaining(isBreak ? breakTime : workTime);
    };

    // Countdown timer
    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(interval);
                        setIsBreak(!isBreak);
                        setTimeRemaining(isBreak ? workTime : breakTime);
                        if (alarmRef.current) {
                            alarmRef.current.play();
                        }
                        return isBreak ? workTime : breakTime;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isRunning, isBreak, workTime, breakTime]);

    // Start/Stop timer
    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    // Handle time changes
    const handleWorkTimeChange = (e) => {
        const newWorkTime = parseInt(e.target.value) * 60;
        setWorkTime(newWorkTime);
        localStorage.setItem('workTime', newWorkTime.toString());
        if (!isRunning && !isBreak) {
            setTimeRemaining(newWorkTime);
        }
    };

    const handleBreakTimeChange = (e) => {
        const newBreakTime = parseInt(e.target.value) * 60;
        setBreakTime(newBreakTime);
        localStorage.setItem('breakTime', newBreakTime.toString());
        if (!isRunning && isBreak) {
            setTimeRemaining(newBreakTime);
        }
    };

    useEffect(() => {
        const spotifyPlayerContainer = document.getElementById('spotify-player-container');

        if (!spotifyPlayerContainer.hasChildNodes()) {
            const iframe = document.createElement('iframe');
            iframe.src = localStorage.getItem('spotifyPlayerState') || 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4VxMPHUmYF1?autoplay=true'; // Top Indonesia Songs playlist
            iframe.width = '100%';
            iframe.height = '380';
            iframe.frameBorder = '0';
            iframe.allow = 'encrypted-media';

            spotifyPlayerContainer.appendChild(iframe);

            window.addEventListener('beforeunload', function() {
                localStorage.setItem('spotifyPlayerState', iframe.src);
            });

            // Ensure Spotify player continues playing in the background
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                    iframe.src = localStorage.getItem('spotifyPlayerState') || iframe.src;
                }
            });
        }
    }, []);

    return (
        <div className="container mt-10">
            <div className="glassmorphic-card p-4 text-center">
                <div className="icon-card">
                    <i className="fas fa-rocket"></i>
                </div>
                <h1>{isBreak ? "Break Time" : "Work Time"}</h1>
                <div className="timer-display">{formatTime(timeRemaining)}</div>
                <div className="timer-controls">
                    <button className="glassmorphic-button" onClick={toggleTimer}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button className="glassmorphic-button" onClick={resetTimer}>Reset</button>
                </div>
                <div className="time-settings">
                    <label>
                        Work Time (minutes):
                        <input
                            type="number"
                            value={workTime / 60}
                            onChange={handleWorkTimeChange}
                            min="1"
                        />
                    </label>
                    <label>
                        Break Time (minutes):
                        <input
                            type="number"
                            value={breakTime / 60}
                            onChange={handleBreakTimeChange}
                            min="1"
                        />
                    </label>
                </div>
                <div id="spotify-player-container" style={{ marginTop: '20px' }}></div>
                <audio ref={alarmRef} src={alarmSound} preload="auto"></audio>
            </div>
        </div>
    );
};

export default Timer;
