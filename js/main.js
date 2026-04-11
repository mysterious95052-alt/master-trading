/* ==============================================
   MARKET VISION — Main JavaScript
   
   Bug fixes vs original:
   - Replaced deprecated document.execCommand("copy") with Clipboard API
   - Fixed implicit `event` global in simulateServerPayment
   - Added form validation with proper phone pattern
   - Added back button from step 2 → step 1
   - Fixed timer not stopping at 0
   - Fixed selectCourse not selecting correct dropdown option
   - Added scroll reveal with IntersectionObserver
   - Added animated stat counters
   - Added particle canvas background
   - Added mobile nav toggle
   ============================================== */

// ==============================================
// CONFIGURATION — Change these for your setup
// ==============================================
const MERCHANT_UPI_ID  = "marketvision@okhdfc";
const MERCHANT_NAME    = "Market Vision Education";

// ==============================================
// STATE
// ==============================================
let currentCourseName  = "SMC Mastery Program";
let currentCoursePrice = 60000;
let timerInterval      = null;

// ==============================================
// INITIALIZATION
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollReveal();
    initNavScroll();
    initCounters();
    initTimer();
    updateUpiDisplay();
});

// ==============================================
// PARTICLE CANVAS BACKGROUND
// ==============================================
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const PARTICLE_COUNT = 50;
    const GOLD_COLORS = [
        'rgba(212, 175, 55, 0.3)',
        'rgba(212, 175, 55, 0.15)',
        'rgba(240, 208, 96, 0.2)',
        'rgba(255, 255, 255, 0.08)',
    ];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
            opacity: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.005,
        };
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            // Wrap around edges
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;

            const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, currentOpacity + ')');
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
    animate();
}

// ==============================================
// SCROLL REVEAL (IntersectionObserver)
// ==============================================
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ==============================================
// NAV SCROLL EFFECT
// ==============================================
function initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ==============================================
// ANIMATED STAT COUNTERS
// ==============================================
function initCounters() {
    const counters = document.querySelectorAll('.stat__number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        
        el.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==============================================
// COUNTDOWN TIMER
// ==============================================
function initTimer() {
    let timeLeft = 15 * 60; // 15 minutes
    const timerEl = document.getElementById('timer-text');
    if (!timerEl) return;

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerEl.textContent = 'Offer has expired';
            return;
        }
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerEl.textContent = `Offer expires in: ${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}

// ==============================================
// MOBILE NAVIGATION
// ==============================================
function toggleMobileMenu() {
    const links = document.getElementById('nav-links');
    const btn = document.getElementById('hamburger-btn');
    if (!links || !btn) return;

    links.classList.toggle('open');
    btn.classList.toggle('active');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
}

function closeMobileMenu() {
    const links = document.getElementById('nav-links');
    const btn = document.getElementById('hamburger-btn');
    if (!links || !btn) return;

    links.classList.remove('open');
    btn.classList.remove('active');
    document.body.style.overflow = '';
}

// ==============================================
// COURSE SELECTION
// ==============================================
function selectCourse(name, price) {
    const selectEl = document.getElementById('courseSelect');
    if (!selectEl) return;

    // Find option by data-name attribute
    for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].getAttribute('data-name') === name) {
            selectEl.selectedIndex = i;
            break;
        }
    }

    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
}

// ==============================================
// FORM PROCESSING
// ==============================================
function processForm(e) {
    e.preventDefault();

    const selectEl = document.getElementById('courseSelect');
    if (!selectEl) return;

    currentCoursePrice = parseInt(selectEl.value, 10);
    currentCourseName  = selectEl.options[selectEl.selectedIndex].getAttribute('data-name');

    // Update summary
    const summaryCoursEl = document.getElementById('summary-course');
    const summaryPriceEl = document.getElementById('summary-price');
    if (summaryCoursEl) summaryCoursEl.textContent = currentCourseName;
    if (summaryPriceEl) summaryPriceEl.textContent = `₹${currentCoursePrice.toLocaleString()}`;

    // Update QR price texts
    document.querySelectorAll('.qr-price-text').forEach(el => {
        el.textContent = currentCoursePrice.toLocaleString();
    });

    // Update confirmation details
    const confirmCourse = document.getElementById('confirm-course');
    const confirmAmount = document.getElementById('confirm-amount');
    if (confirmCourse) confirmCourse.textContent = currentCourseName;
    if (confirmAmount) confirmAmount.textContent = `₹${currentCoursePrice.toLocaleString()}`;

    // Generate QR code with dynamic data
    const qrData = encodeURIComponent(
        `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${currentCoursePrice}&cu=INR&tn=Enroll_${currentCourseName.replace(/\s+/g, '')}`
    );
    const qrImage = document.getElementById('qr-image');
    if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${qrData}`;
    }

    switchTab(1, 2);
}

// ==============================================
// PAYMENT METHODS
// ==============================================
function triggerMobileUPI(app) {
    const upiString = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${currentCoursePrice}&cu=INR&tn=Enroll_${currentCourseName.replace(/\s+/g, '')}`;
    
    // Open UPI intent
    window.location.href = upiString;

    // Note: In production, you'd verify payment via a server callback
    // This timeout is a placeholder for demo purposes
    setTimeout(() => {
        switchTab(2, 3);
    }, 5000);
}

function toggleScanner() {
    const section = document.getElementById('qr-section');
    const chevron = document.getElementById('qr-chevron');
    if (!section) return;

    const isHidden = section.classList.contains('apply__step--hidden');
    section.classList.toggle('apply__step--hidden');
    
    if (chevron) {
        chevron.classList.toggle('rotated', isHidden);
    }

    if (isHidden) {
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// ==============================================
// CLIPBOARD (Modern API with fallback)
// ==============================================
async function copyUpi() {
    const copyTextEl = document.getElementById('copy-text');
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(MERCHANT_UPI_ID);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = MERCHANT_UPI_ID;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        if (copyTextEl) {
            copyTextEl.textContent = 'Copied!';
            setTimeout(() => {
                copyTextEl.textContent = 'Copy';
            }, 2000);
        }
    } catch (err) {
        console.error('Copy failed:', err);
        if (copyTextEl) {
            copyTextEl.textContent = 'Failed';
            setTimeout(() => {
                copyTextEl.textContent = 'Copy';
            }, 2000);
        }
    }
}

// ==============================================
// PAYMENT STATUS CHECK
// ==============================================
function checkPaymentStatus() {
    const btn = document.getElementById('check-payment-btn');
    if (!btn) return;

    const btnSpan = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');

    // Show loading state
    if (btnSpan) btnSpan.textContent = 'Checking transaction...';
    if (btnIcon) {
        btnIcon.className = 'fa-solid fa-spinner fa-spin';
    }
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // In production, this would call your server to verify the payment
    // This is a demo simulation
    setTimeout(() => {
        switchTab(2, 3);
    }, 2500);
}

// ==============================================
// TAB / STEP MANAGEMENT
// ==============================================
function switchTab(from, to) {
    // Hide current step
    const stepFrom = document.getElementById(`step-${from}`);
    const stepTo   = document.getElementById(`step-${to}`);
    if (stepFrom) stepFrom.classList.add('apply__step--hidden');
    if (stepTo)   stepTo.classList.remove('apply__step--hidden');

    // Update tab states
    const tabFrom = document.getElementById(`tab-${from}`);
    const tabTo   = document.getElementById(`tab-${to}`);

    if (tabFrom) {
        tabFrom.classList.remove('apply__tab--active');
        // Mark as completed if going forward
        if (to > from) {
            tabFrom.classList.add('apply__tab--completed');
        }
    }

    if (tabTo) {
        tabTo.classList.remove('apply__tab--completed');
        tabTo.classList.add('apply__tab--active');
    }

    // Scroll to the apply section
    const applySection = document.getElementById('apply');
    if (applySection) {
        setTimeout(() => {
            applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// ==============================================
// FAQ ACCORDION
// ==============================================
function toggleFaq(button) {
    const item = button.closest('.faq__item');
    if (!item) return;

    const isActive = item.classList.contains('active');

    // Close all items
    document.querySelectorAll('.faq__item.active').forEach(el => {
        el.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

// ==============================================
// UPI DISPLAY
// ==============================================
function updateUpiDisplay() {
    const upiDisplay = document.getElementById('merchant-upi-display');
    if (upiDisplay) {
        upiDisplay.textContent = MERCHANT_UPI_ID;
    }
}
