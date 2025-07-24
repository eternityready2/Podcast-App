let currentVolume = 1; // Default volume (50%)

document.addEventListener('click', (event) => {
  // Check if the clicked element is a play overlay or within it
  const playOverlay = event.target.closest('.play-pause');
  if (!playOverlay) return;

  // Select the relevant episode section
  const section = playOverlay.closest('.episode-section');
  if (!section) return;

  // Prevent default behavior
  event.stopPropagation();

  // Check if already initialized
  if (!section.dataset.initialized) {
    const audio = section.querySelector('.audio-player audio');
    const playPauseIcon = playOverlay.querySelector('i');
    const progressContainer = section.querySelector('.progress-container');
    const progress = section.querySelector('.progress');
    const currentTimeEl = section.querySelector('.current-time');
    const durationEl = section.querySelector('.duration');
    const volumeSlider = section.querySelector('.volume-slider');

    // Apply the current global volume
    audio.volume = currentVolume;

    // Format time to mm:ss
    const formatTime = (time) => {
      if (isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };

    // Add event listeners
    audio.addEventListener('timeupdate', () => {
      const { duration, currentTime } = audio;
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;

      currentTimeEl.textContent = formatTime(currentTime);
      durationEl.textContent = formatTime(duration);
    });

    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;

      audio.currentTime = (clickX / width) * duration;
    });

    audio.addEventListener('ended', () => {
      playPauseIcon.classList.remove('fa-pause');
      playPauseIcon.classList.add('fa-play');
      section.classList.remove('playing');
    });

    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    // Volume control
    if (volumeSlider) {
      // Initialize slider with the current volume
      volumeSlider.value = currentVolume;
      volumeSlider.addEventListener('input', (e) => {
        currentVolume = parseFloat(e.target.value); // Update global volume
        audio.volume = currentVolume;
      });
    }

    // Mark as initialized
    section.dataset.initialized = 'true';
  }

  // Toggle play/pause
  const audio = section.querySelector('.audio-player audio');
  const playPauseIcon = playOverlay.querySelector('i');

  if (audio.paused) {
    // Pause any other playing audio
    document.querySelectorAll('.episode-section.playing').forEach((playingSection) => {
      if (playingSection !== section) {
        const playingAudio = playingSection.querySelector('.audio-player audio');
        const playingIcon = playingSection.querySelector('.play-overlay i');
        playingAudio.pause();
        playingIcon.classList.remove('fa-pause');
        playingIcon.classList.add('fa-play');
        playingSection.classList.remove('playing');
      }
    });
    audio.volume = currentVolume;

    // Update the volume slider handle
    const volumeSlider = section.querySelector('.volume-slider');
    if (volumeSlider) {
      volumeSlider.value = currentVolume; // Set the slider value
      volumeSlider.setAttribute('value', currentVolume); // Update attribute for consistency
    }
    audio.play();
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
    section.classList.add('playing');
  } else {
    audio.pause();
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
    section.classList.remove('playing');
  }
});
