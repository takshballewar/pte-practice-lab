/* FluentAI Landing Page Component & Sine Wave Visualizer */

import { Router } from '../router.js?v=22';

export function renderLanding(container) {
  container.innerHTML = `
    <!-- HERO SECTION -->
    <section class="landing-hero">
      <div class="hero-text">
        <h1 class="hero-title">Your AI-powered <span>PTE coach</span> — practice smarter, score higher</h1>
        <p class="hero-subtitle">Step into a sleek, data-rich language cockpit. Experience instant, exam-accurate grading, live pronunciation waveforms, and a floating personal tutor.</p>
        <div class="hero-ctas">
          <button id="hero-cta-mock" class="btn btn-accent shadow-neon">Start Free Mock Test</button>
          <button id="hero-cta-scroll" class="btn btn-outline">See How It Works</button>
        </div>
      </div>
      
      <!-- Futuristic Glowing Sine Wave Visual -->
      <div class="hero-visual">
        <div class="visual-brain-glow"></div>
        <canvas id="hero-wave-canvas" class="visual-canvas-wave" width="500" height="250"></canvas>
      </div>
    </section>

    <!-- STATS PANEL -->
    <section class="landing-stats-panel">
      <div class="stat-item">
        <h3>+12</h3>
        <p>Average Score Gain</p>
      </div>
      <div class="stat-item">
        <h3>1.2s</h3>
        <p>AI Grader Latency</p>
      </div>
      <div class="stat-item">
        <h3>99.2%</h3>
        <p>Simulation Accuracy</p>
      </div>
      <div class="stat-item">
        <h3>120K+</h3>
        <p>Tests Evaluated</p>
      </div>
    </section>

    <!-- FEATURES LIST SECTION -->
    <section id="features-section" class="features-section">
      <div class="section-heading-center">
        <h2>Built Like an AI Flight Deck</h2>
        <p>We bypassed generic templates to build a diagnostic ecosystem that works for your target score.</p>
      </div>

      <div class="features-grid">
        <!-- Feature 1 -->
        <div class="card-glass feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          </div>
          <h3>Phonemic Audio Grading</h3>
          <p>Read Aloud checks speaking using real-time pronunciation highlights. Discover which syllables are dragging down your oral fluency.</p>
        </div>

        <!-- Feature 2 -->
        <div class="card-glass feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <h3>Grammatical Diagnostics</h3>
          <p>Our writing engine isolates spelling typos and syntactic flaws, offering context-specific academic synonyms to enrich your writing.</p>
        </div>

        <!-- Feature 3 -->
        <div class="card-glass feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>Chronological Simulation</h3>
          <p>Mock examinations mirror the real PTE timing protocols, helping you build core pacing habits before entering the test center.</p>
        </div>

        <!-- Feature 4 -->
        <div class="card-glass feature-card">
          <div class="feature-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3>Contextual Tutor Assistant</h3>
          <p>A persistent tutor bubble monitors your workspace. Get answers to grammar errors, spelling feedback, and templates on the fly.</p>
        </div>
      </div>
    </section>

    <!-- PRICING PLANS SECTION -->
    <section class="pricing-section">
      <div class="pricing-header">
        <h2>Select Your Diagnostic Speed</h2>
        <p style="color:var(--text-secondary); margin-top:4px; font-size:14px;"><a href="#pricing" style="color:var(--accent); text-decoration:underline; cursor:pointer;">View full pricing & comparison →</a></p>
        <div class="billing-toggle">
          <button id="billing-monthly" class="active">Monthly</button>
          <button id="billing-annual">Annually <span style="color:var(--accent); font-size:10px;">-20%</span></button>
        </div>
      </div>

      <div class="pricing-grid">
        <!-- Plan 1 -->
        <div class="card-glass pricing-card">
          <div class="price-header">
            <h3>Diagnose Score</h3>
            <div class="price-val" id="score-price-tag">₹600 <span class="billing-period">/mo</span></div>
          </div>
          <ul class="price-features">
            <li>1 Full-Length Mock Test</li>
            <li>Basic Practice Lab access</li>
            <li>Standard AI grading (2-min latency)</li>
            <li>PTE scorecard analytics</li>
          </ul>
          <button class="btn btn-outline plan-cta-btn" data-plan="free">Choose Score</button>
        </div>

        <!-- Plan 2 -->
        <div class="card-glass pricing-card premium">
          <div class="price-header">
            <h3>Diagnose Pro</h3>
            <div class="price-val" id="pro-price-tag">₹1,000 <span class="billing-period">/mo</span></div>
          </div>
          <ul class="price-features">
            <li>5 Timed Mock Tests</li>
            <li>Unlimited speaking & writing practice</li>
            <li>Instant AI speech highlights</li>
            <li>Full AI tutor assistance</li>
            <li>AI Study planner custom schedules</li>
          </ul>
          <button class="btn btn-primary shadow-neon plan-cta-btn" data-plan="pro">Upgrade to Pro</button>
        </div>

        <!-- Plan 3 -->
        <div class="card-glass pricing-card">
          <div class="price-header">
            <h3>Diagnose Light</h3>
            <div class="price-val" id="light-price-tag">₹1,200 <span class="billing-period">/mo</span></div>
          </div>
          <ul class="price-features">
            <li>Unlimited Mock Examinations</li>
            <li>Personalized pronunciation diagnostics</li>
            <li>Weekly human trainer review</li>
            <li>99.9% score accuracy guarantee</li>
            <li>Priority server grading queues</li>
          </ul>
          <button class="btn btn-outline plan-cta-btn" data-plan="elite">Get Light</button>
        </div>
      </div>
    </section>
  `;

  // Bind click handlers to CTAs
  document.getElementById('hero-cta-mock').addEventListener('click', () => {
    openRegisterModal();
  });

  document.getElementById('hero-cta-scroll').addEventListener('click', () => {
    document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.plan-cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Navigate to the dedicated pricing page
      window.location.hash = '#pricing';
    });
  });

  // Billing Cycle Toggle Handler
  const monthlyBtn = document.getElementById('billing-monthly');
  const annualBtn = document.getElementById('billing-annual');
  const scorePrice = document.getElementById('score-price-tag');
  const proPrice = document.getElementById('pro-price-tag');
  const lightPrice = document.getElementById('light-price-tag');
  const periodLabels = document.querySelectorAll('.billing-period');

  const updatePricing = (isAnnual) => {
    if (isAnnual) {
      monthlyBtn.classList.remove('active');
      annualBtn.classList.add('active');
      scorePrice.innerHTML = `₹480 <span class="billing-period">/mo</span>`;
      proPrice.innerHTML = `₹800 <span class="billing-period">/mo</span>`;
      lightPrice.innerHTML = `₹960 <span class="billing-period">/mo</span>`;
      periodLabels.forEach(lbl => lbl.textContent = '/mo (billed annually)');
    } else {
      monthlyBtn.classList.add('active');
      annualBtn.classList.remove('active');
      scorePrice.innerHTML = `₹600 <span class="billing-period">/mo</span>`;
      proPrice.innerHTML = `₹1,000 <span class="billing-period">/mo</span>`;
      lightPrice.innerHTML = `₹1,200 <span class="billing-period">/mo</span>`;
      periodLabels.forEach(lbl => lbl.textContent = '/mo');
    }
  };

  monthlyBtn.addEventListener('click', () => updatePricing(false));
  annualBtn.addEventListener('click', () => updatePricing(true));

  // Initialize Canvas Wave Animation
  initWaveAnimation();
}

function openRegisterModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  const registerModal = document.getElementById('register-modal');
  const loginModal = document.getElementById('login-modal');
  if (overlay && registerModal && loginModal) {
    overlay.classList.remove('hidden');
    registerModal.classList.remove('hidden');
    loginModal.classList.add('hidden');
  }
}

// Draw a beautiful sine wave representing voice waveform on Canvas
function initWaveAnimation() {
  const canvas = document.getElementById('hero-wave-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let phase = 0;

  // Adapt canvas to screens
  const resizeCanvas = () => {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 250;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerY = canvas.height / 2;
    const width = canvas.width;

    // Draw three overlaying sine waves with different frequencies and colors
    const waves = [
      { amplitude: 45, frequency: 0.008, speed: 0.05, color: 'rgba(18, 44, 94, 0.25)', blur: 0 },
      { amplitude: 25, frequency: 0.015, speed: -0.07, color: 'rgba(19, 150, 226, 0.45)', blur: 4 },
      { amplitude: 15, frequency: 0.03, speed: 0.1, color: 'rgba(19, 150, 226, 0.15)', blur: 0 }
    ];

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2.5;

      if (wave.blur > 0) {
        ctx.shadowBlur = wave.blur;
        ctx.shadowColor = wave.color;
      } else {
        ctx.shadowBlur = 0;
      }

      for (let x = 0; x < width; x++) {
        // Fade out waves at boundaries to prevent sharp cuts
        const fade = Math.sin((x / width) * Math.PI);
        const y = centerY + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * fade;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    phase += 0.5;
    animationId = requestAnimationFrame(draw);
  };

  draw();

  // Cancel animation on navigation clean up
  const observer = new MutationObserver(() => {
    if (!document.getElementById('hero-wave-canvas')) {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('viewport'), { childList: true });
}
