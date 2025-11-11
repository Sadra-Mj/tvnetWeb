document.addEventListener('DOMContentLoaded', () => {
    // --- Carousel Logic ---
    const slides = document.querySelectorAll('.carousel-slide');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    if (slides.length > 0) {
        let currentSlide = 0;
        let isPlaying = true;
        let slideInterval = setInterval(nextSlide, 5000);

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            updateDots(index);
            currentSlide = index;
        }

        function nextSlide() {
            let newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        }

        function updateDots(index) {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }

        function createDots() {
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                dot.setAttribute('data-index', index);
                dotsContainer.appendChild(dot);
            });
            dotsContainer.addEventListener('click', e => {
                if (e.target.matches('.dot')) {
                    const index = Number(e.target.dataset.index);
                    showSlide(index);
                    if (isPlaying) {
                        clearInterval(slideInterval);
                        slideInterval = setInterval(nextSlide, 5000);
                    }
                }
            });
        }

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                clearInterval(slideInterval);
                playPauseBtn.classList.add('pause');
            } else {
                slideInterval = setInterval(nextSlide, 5000);
                playPauseBtn.classList.remove('pause');
            }
            isPlaying = !isPlaying;
        });

        createDots();
        showSlide(0);
    }


    // --- Infinite Scroller Logic ---
    const scrollers = document.querySelectorAll(".scroller");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
    }
    function addAnimation() {
        scrollers.forEach((scroller) => {
            scroller.setAttribute("data-animated", true);
            const scrollerInner = scroller.querySelector(".scroller-inner");
            const scrollerContent = Array.from(scrollerInner.children);
            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });
        });
    }

    // --- HLS.js Video Player Logic ---
    const video = document.getElementById('video-player');
    const videoSrc = 'https://3ea22335.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWdiX1JlZEJ1bGxUVl9ITFM/playlist.m3u8'; // New M3U link
    if (Hls.isSupported() && video) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }

     // --- TV Player Controls ---
    const volumeBtn = document.getElementById('volume-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const videoPlayer = document.getElementById('video-player');
    const playerContainer = document.querySelector('.tv-player-container');

    if (volumeBtn && videoPlayer) {
        volumeBtn.addEventListener('click', () => {
            videoPlayer.muted = !videoPlayer.muted;
            volumeBtn.querySelector('.volume-on').style.display = videoPlayer.muted ? 'none' : 'block';
            volumeBtn.querySelector('.volume-off').style.display = videoPlayer.muted ? 'block' : 'none';
        });
    }

    if (fullscreenBtn && playerContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                 playerContainer.requestFullscreen().catch(err => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            }
        });
    }



    // --- Mobile Menu Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');
    if (menuToggle && navLinks && nav) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            nav.classList.toggle('nav-open');
        });
    }

    // --- Scroll-to-Zoom Logic ---
    const scrollZoomSection = document.querySelector('.scroll-zoom-section');
    if (scrollZoomSection) {
        const stickyContainer = document.querySelector('.scroll-zoom-sticky-container');
        const videoWrapper = document.querySelector('.scroll-zoom-video-wrapper');
        const video = document.querySelector('.scroll-zoom-video');
        const initialContent = document.querySelector('.scroll-zoom-content-initial');
        const secondaryContent = document.querySelector('.scroll-zoom-content-secondary');
        const infoPanel1 = document.getElementById('info-panel-1');
        const infoPanel2 = document.getElementById('info-panel-2');
        const videoOverlay = document.querySelector('.scroll-zoom-video-overlay');


        window.addEventListener('scroll', () => {
            const sectionTop = scrollZoomSection.offsetTop;
            const sectionHeight = scrollZoomSection.offsetHeight;
            const scrollPosition = window.scrollY;

            if (scrollPosition >= sectionTop && scrollPosition <= sectionTop + sectionHeight - window.innerHeight) {
                const progress = (scrollPosition - sectionTop) / (sectionHeight - window.innerHeight);

                // --- Animation Phases ---
                // Adjusted phase timings to include holds
                const phases = {
                    zoomIn: { start: 0.0, end: 0.15 },
                    panel1FadeIn: { start: 0.20, end: 0.30 },
                    panel1Hold: { start: 0.30, end: 0.45 },
                    panel1FadeOut: { start: 0.45, end: 0.55 },
                    panel2FadeIn: { start: 0.60, end: 0.70 },
                    panel2Hold: { start: 0.70, end: 0.85 },
                    zoomOut: { start: 0.85, end: 1.0 }
                };
                
                // Helper to calculate progress within a phase
                const getPhaseProgress = (phase) => {
                    if (progress < phase.start) return 0;
                    if (progress > phase.end) return 1;
                    return (progress - phase.start) / (phase.end - phase.start);
                };

                // --- Apply Animations based on current progress ---

                // Video Zoom & Initial Content Fade
                if (progress < phases.zoomOut.start) {
                    const phaseProgress = getPhaseProgress(phases.zoomIn);
                    const scaleX = 1 + (window.innerWidth / videoWrapper.offsetWidth - 1) * phaseProgress;
                    const scaleY = 1 + (window.innerHeight / videoWrapper.offsetHeight - 1) * phaseProgress;
                    const scale = Math.max(scaleX, scaleY);
                    
                    videoWrapper.style.transform = `scale(${scale})`;
                    videoWrapper.style.borderRadius = `${30 * (1 - phaseProgress)}px`;
                    initialContent.style.opacity = 1 - (phaseProgress * 2.5);
                    videoOverlay.style.opacity = phaseProgress * 0.7;
                } else {
                     const phaseProgress = getPhaseProgress(phases.zoomOut);
                     const scaleX = 1 + (window.innerWidth / videoWrapper.offsetWidth - 1) * (1 - phaseProgress);
                     const scaleY = 1 + (window.innerHeight / videoWrapper.offsetHeight - 1) * (1 - phaseProgress);
                     const scale = Math.max(scaleX, scaleY);
                     
                     videoWrapper.style.transform = `scale(${scale})`;
                     videoWrapper.style.borderRadius = `${30 * phaseProgress}px`;
                     videoOverlay.style.opacity = 0.7 * (1 - phaseProgress);
                }


                // Panel 1 Visibility
                if (progress >= phases.panel1FadeIn.start && progress < phases.panel1FadeOut.start) {
                    const phaseProgress = getPhaseProgress(phases.panel1FadeIn);
                    infoPanel1.style.opacity = phaseProgress;
                    infoPanel1.style.transform = `translateY(${30 * (1 - phaseProgress)}px)`;
                } else if (progress >= phases.panel1FadeOut.start && progress < phases.panel2FadeIn.start) {
                     const phaseProgress = getPhaseProgress(phases.panel1FadeOut);
                     infoPanel1.style.opacity = 1 - phaseProgress;
                     infoPanel1.style.transform = `translateY(${30 * phaseProgress}px)`;
                }
                else {
                    infoPanel1.style.opacity = 0;
                }

                // Panel 2 Visibility
                if (progress >= phases.panel2FadeIn.start && progress < phases.zoomOut.start) {
                     const phaseProgress = getPhaseProgress(phases.panel2FadeIn);
                     infoPanel2.style.opacity = phaseProgress;
                     infoPanel2.style.transform = `translateY(${30 * (1 - phaseProgress)}px)`;
                } else if(progress >= phases.zoomOut.start){
                    const phaseProgress = getPhaseProgress({start: phases.panel2Hold.end, end: phases.zoomOut.start});
                     infoPanel2.style.opacity = 1- phaseProgress;
                     infoPanel2.style.transform = `translateY(${30 * phaseProgress}px)`;
                } else {
                    infoPanel2.style.opacity = 0;
                }

            }
        });

         // Autoplay the scroll-zoom video
        const scrollVideo = document.querySelector('.scroll-zoom-video');
        if (scrollVideo) {
            scrollVideo.play();
        }
    }

     // --- App Tabs Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.apps-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === tab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // --- Modal Logic ---
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    function openModal(modal) {
        if(modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if(modal) modal.classList.remove('active');
    }

    if(privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('privacy-modal');
            if (modal) openModal(modal);
        });
    }

    if(termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('terms-modal');
            if(modal) openModal(modal);
        });
    }
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

});




 // 1) Disable right-click/context menu
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    // 2) Disable selection via keyboard (Shift+Arrows, Ctrl+A) — best-effort
    document.addEventListener('keydown', function(e) {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I / Ctrl+Shift+J (DevTools), Ctrl+U (view-source), Ctrl+S (save)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+A selection block
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
    });

    // 3) Block selection via mouse (double/triple click)
    document.addEventListener('selectstart', function(e) { e.preventDefault(); });

    // 4) Very simple DevTools detection: measure difference between outer/inner window size.
    //    This is heuristic and will false-positive/false-negative on many setups.
    (function detectDevTools() {
      let threshold = 160; // px difference heuristic
      let last = false;
      function check() {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const devOpen = (widthDiff > threshold) || (heightDiff > threshold);

        if (devOpen && !last) {
          showDevtoolsOverlay();
        }
        last = devOpen;
      }
      function showDevtoolsOverlay() {
        const el = document.getElementById('devtools-warning');
        if (el) el.style.display = 'flex';
        // optional: blur page content or redirect
        // window.location.href = 'about:blank';
      }
      // periodic check
      setInterval(check, 1000);
      // also check on resize
      window.addEventListener('resize', check);
    })();