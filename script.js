// Force browser to start at the top on every refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    
    // Set global background video speed
    const bgVideo = document.getElementById('global-bg-video');
    if (bgVideo) {
        bgVideo.playbackRate = 0.2;
    }
    
    // Custom Cursor Logic
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorTrail = document.querySelector('.custom-cursor-trail');
    
    if (cursorDot && cursorTrail) {
        let mouseX = 0;
        let mouseY = 0;
        let trailX = 0;
        let trailY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows instantly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });
        
        // Smooth trailing animation for the outer ring using requestAnimationFrame
        const animateTrail = () => {
            const distX = mouseX - trailX;
            const distY = mouseY - trailY;
            
            // Easing factor for the trail (0.15 gives a smooth, slightly delayed follow)
            trailX += distX * 0.15;
            trailY += distY * 0.15;
            
            cursorTrail.style.left = `${trailX}px`;
            cursorTrail.style.top = `${trailY}px`;
            
            requestAnimationFrame(animateTrail);
        };
        animateTrail();

        // Hover effects for clickable elements
        const clickables = document.querySelectorAll('a, button, .interact-btn, .selectable, .video-container');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovered');
                cursorTrail.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovered');
                cursorTrail.classList.remove('hovered');
            });
        });
    }
    
    // Interactive buttons logic
    const interactBtns = document.querySelectorAll('.interact-btn');
    
    interactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            interactBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            e.target.classList.add('active');
            
            const targetId = e.target.closest('.btn-mega').getAttribute('data-target');
            console.log('User selected:', targetId);
            
            // Scroll to specific section based on selection
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Simple reveal animation on scroll
    const sections = document.querySelectorAll('.section');
    
    const revealSection = (entries, observer) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        
        // Trigger subtle calming glow animation for the title
        const title = entry.target.querySelector('.work-title, .section-title');
        if (title) {
            title.classList.add('glow-animated');
        }
        
        // Trigger staggered animation for video containers
        const videos = entry.target.querySelectorAll('.video-container');
        videos.forEach((video, index) => {
            // 300ms gap after title starts, then 100ms stagger between each video
            setTimeout(() => {
                video.classList.add('reveal-video');
            }, 300 + (index * 100));
        });

        // Trigger staggered animation for mega buttons
        const megaBtns = entry.target.querySelectorAll('.btn-mega');
        megaBtns.forEach((btn, index) => {
            // Wait for title, then aggressively snap each button into place with a 3D effect
            setTimeout(() => {
                btn.classList.add('reveal-btn');
            }, 400 + (index * 150));
        });

        // Trigger soothing animation for the final contact section
        if (entry.target.id === 'contact') {
            const contactContent = entry.target.querySelector('.contact-content');
            if (contactContent) {
                contactContent.classList.add('reveal-animated');
            }
        }
        
        observer.unobserve(entry.target);
    };
    
    const sectionObserver = new IntersectionObserver(revealSection, {
        root: null,
        threshold: 0.15,
    });
    
    sections.forEach(section => {
        if(section.id !== 'hero') {
            sectionObserver.observe(section);
        }
    });
});

// ==========================================
// YouTube API: Hover Play & Custom UI
// ==========================================
let currentlyPlaying = null;
const players = [];

// Prepare iframes for API control and Custom UI injection
document.querySelectorAll('.video-container').forEach((container, index) => {
    const iframe = container.querySelector('iframe');
    if (!iframe) return;

    // Append API params to hide YT UI and enable JS control
    const connector = iframe.src.includes('?') ? '&' : '?';
    iframe.src += `${connector}enablejsapi=1&mute=1&controls=0&disablekb=1&rel=0&modestbranding=1&playsinline=1`;
    
    if (!iframe.id) {
        iframe.id = `yt-player-${index}`;
    }

    // Extract video ID for thumbnail
    let videoId = '';
    const match = iframe.src.match(/embed\/([^?]+)/);
    if (match && match[1]) {
        videoId = match[1];
    }

    // Inject custom UI overlay and thumbnail
    const overlayHTML = `
        <div class="custom-thumbnail" style="background-image: url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg'), url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')">
            <div class="center-play-indicator">▶</div>
        </div>
        <div class="custom-video-overlay">
            <button class="custom-skip-btn backward mx-style" title="-5s">
                <div class="icon">↺</div>
            </button>
            <button class="custom-skip-btn forward mx-style" title="+5s">
                <div class="icon">↻</div>
            </button>
            <div class="custom-controls">
                <button class="custom-play-btn" title="Play/Pause">▶</button>
                <div class="custom-progress-bg">
                    <div class="custom-progress-fill"></div>
                </div>
                <button class="custom-fullscreen-btn" title="Fullscreen">⛶</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', overlayHTML);
});

// Load the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
    document.querySelectorAll('iframe').forEach(iframe => {
        const player = new YT.Player(iframe.id, {
            events: {
                'onReady': (event) => onPlayerReady(event, iframe),
                'onStateChange': onPlayerStateChange
            }
        });
        players.push(player);
    });
}

function onPlayerReady(event, iframe) {
    const container = iframe.closest('.video-container');
    if (!container) return;

    const overlay = container.querySelector('.custom-video-overlay');
    const playBtn = container.querySelector('.custom-play-btn');
    
    // Play on hover
    container.addEventListener('mouseenter', () => {
        event.target.playVideo();
    });

    // Pause on hover out
    container.addEventListener('mouseleave', () => {
        event.target.pauseVideo();
    });

    // Manual Play/Pause click
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const state = event.target.getPlayerState();
        if (state === 1) { // Playing
            event.target.pauseVideo();
        } else {
            event.target.playVideo();
        }
    });

    // Skip Backward 5s
    const backBtn = container.querySelector('.backward');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = event.target.getCurrentTime();
            event.target.seekTo(Math.max(current - 5, 0), true);
        });
    }

    // Skip Forward 5s
    const forwardBtn = container.querySelector('.forward');
    if (forwardBtn) {
        forwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = event.target.getCurrentTime();
            const duration = event.target.getDuration();
            event.target.seekTo(Math.min(current + 5, duration), true);
        });
    }

    // Fullscreen Toggle
    const fullscreenBtn = container.querySelector('.custom-fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
}

function onPlayerStateChange(event) {
    const iframe = event.target.getIframe();
    const container = iframe.closest('.video-container');
    const playBtn = container.querySelector('.custom-play-btn');

    if (event.data === 1) { // PLAYING
        playBtn.innerText = '⏸';
        
        // Hide the custom thumbnail permanently once the video starts
        const thumbnail = container.querySelector('.custom-thumbnail');
        if (thumbnail) {
            thumbnail.style.opacity = '0';
            thumbnail.style.pointerEvents = 'none';
        }

        if (currentlyPlaying && currentlyPlaying !== event.target) {
            currentlyPlaying.pauseVideo();
        }
        currentlyPlaying = event.target;
    } else { // PAUSED / ENDED
        playBtn.innerText = '▶';
        if (currentlyPlaying === event.target) {
            currentlyPlaying = null;
        }
    }
}

// Global loop to update the custom progress bar for the currently playing video
setInterval(() => {
    if (currentlyPlaying) {
        const iframe = currentlyPlaying.getIframe();
        const container = iframe.closest('.video-container');
        const fill = container.querySelector('.custom-progress-fill');
        
        const current = currentlyPlaying.getCurrentTime();
        const duration = currentlyPlaying.getDuration();
        
        if (duration > 0) {
            const percent = (current / duration) * 100;
            fill.style.width = `${percent}%`;
        }
    }
}, 100);
