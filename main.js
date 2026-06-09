const init = () => {
  // 1. SETUP AUDIO DI AWAL (Pakai relative path langsung, spasi diganti %20 agar aman di HP)
  let bgAudio;
  try {
    bgAudio = new Audio('./public/antent%20-%20hope%20to%20see%20you%20again.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 1.0;
    bgAudio.muted = false;
  } catch (err) {
    console.warn('Audio init failed', err);
  }

  // Scroll Down Button
  const scrollBtn = document.getElementById('scroll-down');
  const messageSection = document.getElementById('message-section');
  
  scrollBtn.addEventListener('click', () => {
    messageSection.scrollIntoView({ behavior: 'smooth' });
  });

  // 2. TRIGGER AUDIO SAAT USER BERHASIL LOGIN (INTERAKSI)
  const loginOverlay = document.getElementById('login-overlay');
  const pwdInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const loginErr = document.getElementById('login-error');

  const attemptLogin = () => {
    if (pwdInput.value.trim() === '1234') {
      loginOverlay.classList.add('hidden');
      document.body.classList.remove('locked');
      
      // MULAI MUSIKNYA DI SINI SAAT LOGIN BERHASIL!
      if (bgAudio) {
        bgAudio.play().catch(e => console.warn('Background audio blocked:', e));
      }
    } else {
      loginErr.classList.remove('hidden');
      setTimeout(() => loginErr.classList.add('hidden'), 3000);
    }
  };

  if (loginBtn && pwdInput) {
    loginBtn.addEventListener('click', attemptLogin);
    pwdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
  }

  // 3. Message Reveal
  const envelope = document.getElementById('envelope');
  const messageContent = document.getElementById('message-content');

  if (envelope) {
    envelope.addEventListener('click', () => {
      envelope.style.opacity = '0';
      setTimeout(() => {
        envelope.style.display = 'none';
        messageContent.classList.remove('hidden');
      }, 1500); 
    });
  }

  // 4. Scroll Animations for Gallery
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 4) * 0.15}s`;
    observer.observe(item);
  });

  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => observer.observe(item));

  const counterGrid = document.querySelector('.counter-grid');
  if (counterGrid) observer.observe(counterGrid);

  const singleTimers = document.getElementById('single-timers');
  if (singleTimers) observer.observe(singleTimers);

  // Scratch Card Logic
  const scratchPads = document.querySelectorAll('.scratch-pad');
  scratchPads.forEach(canvas => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isCleared = false;

    const updateSize = () => {
      if (isCleared) return;
      canvas.width = canvas.offsetWidth || 300;
      canvas.height = canvas.offsetHeight || 400;
      drawCover();
    };

    const drawCover = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#4a151e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 2500; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let i = 0; i < 1500; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2.5, 2.5);
      }
      
      ctx.font = 'bold 30px "Outfit", sans-serif';
      ctx.fillStyle = '#a0a0a0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCRATCH ME', canvas.width / 2, canvas.height / 2);
    };

    setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);

    const getMousePos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = evt.clientX;
      let clientY = evt.clientY;
      
      if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const scratch = (pos) => {
      if (isCleared) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 45, 0, Math.PI * 2);
      ctx.fill();
    };

    let scratchCheckCounter = 0;
    const checkClear = () => {
      scratchCheckCounter++;
      if (scratchCheckCounter % 10 !== 0) return; 

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) {
          transparentPixels++;
        }
      }
      
      const totalPixels = canvas.width * canvas.height;
      if (transparentPixels / totalPixels > 0.6) {
        isCleared = true;
        canvas.classList.add('cleared');
      }
    };

    const handleStart = (evt) => {
      if (isCleared) return;
      isDrawing = true;
      scratch(getMousePos(evt));
    };

    const handleMove = (evt) => {
      if (!isDrawing || isCleared) return;
      evt.preventDefault();
      scratch(getMousePos(evt));
      checkClear();
    };

    const handleEnd = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    
    canvas.addEventListener('touchstart', handleStart, {passive: false});
    canvas.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);
  });

  // 5. Confetti Button Logic
  const confettiBtn = document.getElementById('confetti-btn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4a151e', '#a0a0a0', '#ffffff', '#f5f5f5']
        });
      }
    });
  }

  // 6. Time Together Counter Logic
  const counterStartDate = new Date('2019-02-13T22:00:00+07:00').getTime();
  const updateCounter = () => {
    const now = new Date().getTime();
    const diff = now - counterStartDate;
    
    if (diff > 0) {
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('c-years').innerText = years;
      document.getElementById('c-months').innerText = months;
      document.getElementById('c-days').innerText = days;
      document.getElementById('c-hours').innerText = hours;
      document.getElementById('c-mins').innerText = mins;
      document.getElementById('c-secs').innerText = secs;

      // Single Timers
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const totalMins = Math.floor(diff / (1000 * 60));
      const totalSecs = Math.floor(diff / 1000);

      document.getElementById('st-days').innerText = totalDays.toLocaleString('id-ID');
      document.getElementById('st-hours').innerText = totalHours.toLocaleString('id-ID');
      document.getElementById('st-mins').innerText = totalMins.toLocaleString('id-ID');
      document.getElementById('st-secs').innerText = totalSecs.toLocaleString('id-ID');
    }
  };
  setInterval(updateCounter, 1000);
  updateCounter();

  // 7. Extra Audio Button Logic (Pakai relative path langsung)
  const extraPlayBtn = document.getElementById('extra-play-btn');
  if (extraPlayBtn) {
    const extraAudio = new Audio('./public/audio.aac');
    extraAudio.volume = 0.45; 
    let isExtraPlaying = false;
    
    extraPlayBtn.addEventListener('click', () => {
      if (!isExtraPlaying) {
        extraAudio.play().catch(e => console.warn('Extra audio play failed:', e));
        extraPlayBtn.innerHTML = '<i class="ri-pause-circle-line"></i> Pause Audio';
        isExtraPlaying = true;
      } else {
        extraAudio.pause();
        extraPlayBtn.innerHTML = '<i class="ri-play-circle-line"></i> Play Audio';
        isExtraPlaying = false;
      }
    });

    extraAudio.addEventListener('ended', () => {
      extraPlayBtn.innerHTML = '<i class="ri-play-circle-line"></i> Play Audio';
      isExtraPlaying = false;
    });
  }

  // 8. Mute toggle button logic
  const muteBtn = document.getElementById('mute-toggle');
  if (muteBtn && bgAudio) {
    const icon = muteBtn.querySelector('i');
    const updateIcon = () => {
      if (bgAudio.muted) {
        icon.className = 'ri-volume-mute-line';
        muteBtn.setAttribute('aria-pressed', 'true');
        muteBtn.setAttribute('aria-label', 'Audio muted');
      } else {
        icon.className = 'ri-volume-up-line';
        muteBtn.setAttribute('aria-pressed', 'false');
        muteBtn.setAttribute('aria-label', 'Audio playing');
      }
    };

    updateIcon();

    muteBtn.addEventListener('click', () => {
      bgAudio.muted = !bgAudio.muted;
      if (!bgAudio.muted) {
        bgAudio.play().catch(() => {});
      }
      updateIcon();
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}