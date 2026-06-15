/**
 * Payment Status Pages — Aspire Education PTE Platform
 *
 * Exports:
 *  - renderPaymentSuccess(container, params)  — Celebration page after checkout
 *  - renderPaymentCancel(container, params)   — Friendly page when user cancels
 *
 * Both pages are self-contained: they inject their own scoped styles and
 * animations, clean up on re-render, and persist subscription state.
 */

import { Database } from '../db.js?v=16';
import { Router } from '../router.js?v=16';

// ─── Plan / Cycle display labels ─────────────────────────────────────────────
const PLAN_LABELS = {
  pro:   'Pro',
  elite: 'Elite',
  free:  'Free'
};

const CYCLE_LABELS = {
  monthly: 'Monthly',
  yearly:  'Yearly'
};

const PLAN_FEATURES = {
  pro: [
    'Unlimited practice questions',
    'AI-powered scoring & feedback',
    'Performance analytics dashboard',
    'Priority question bank updates'
  ],
  elite: [
    'Everything in Pro',
    'Live mock test simulations',
    '1-on-1 AI tutor sessions',
    'Predicted score guarantee',
    'Priority support channel'
  ]
};

// ─── Unique style ID to prevent duplicate injection ──────────────────────────
const STYLE_ID = 'payment-status-styles';

// ─── Inject scoped styles once ───────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* ================================================================
       PAYMENT STATUS — Scoped Animations & Styles
       ================================================================ */

    /* ── Confetti ──────────────────────────────────────────────────── */
    .ps-confetti-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
    }

    .ps-confetti-piece {
      position: absolute;
      top: -20px;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      opacity: 0;
      animation: ps-confetti-fall linear forwards;
    }

    @keyframes ps-confetti-fall {
      0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
      75%  { opacity: 1; }
      100% { opacity: 0; transform: translateY(105vh) rotate(720deg) scale(0.4); }
    }

    /* ── Animated Checkmark ───────────────────────────────────────── */
    .ps-checkmark-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
      animation: ps-pulse-ring 2s ease-in-out infinite;
      position: relative;
      z-index: 20;
    }

    @keyframes ps-pulse-ring {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      50%      { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
    }

    .ps-checkmark-svg {
      width: 56px;
      height: 56px;
    }

    .ps-checkmark-path {
      stroke: #FFFFFF;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: ps-draw-check 0.6s 0.4s ease forwards;
    }

    @keyframes ps-draw-check {
      to { stroke-dashoffset: 0; }
    }

    /* ── Cancel Icon ──────────────────────────────────────────────── */
    .ps-cancel-icon {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
      font-size: 56px;
      line-height: 1;
      animation: ps-fade-scale-in 0.5s ease forwards;
      position: relative;
      z-index: 20;
    }

    /* ── Page Container ───────────────────────────────────────────── */
    .ps-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      padding: 40px 20px;
      position: relative;
    }

    .ps-card {
      background: #FFFFFF;
      border-radius: 28px;
      padding: 56px 48px;
      max-width: 560px;
      width: 100%;
      text-align: center;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.02),
        0 20px 50px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.03);
      position: relative;
      z-index: 20;
      opacity: 0;
      transform: translateY(24px);
      animation: ps-fade-scale-in 0.6s 0.15s ease forwards;
    }

    @keyframes ps-fade-scale-in {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ps-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }

    .ps-subheading {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      color: #64748B;
      margin: 0 0 28px;
      line-height: 1.6;
    }

    /* ── Plan Badge ───────────────────────────────────────────────── */
    .ps-plan-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
      border: 1px solid #C7D2FE;
      border-radius: 14px;
      padding: 14px 24px;
      margin-bottom: 28px;
      font-family: 'Inter', sans-serif;
    }

    .ps-plan-badge .ps-plan-name {
      font-size: 18px;
      font-weight: 700;
      color: #122c5e;
    }

    .ps-plan-badge .ps-plan-cycle {
      font-size: 13px;
      font-weight: 500;
      color: #6366F1;
      background: rgba(99, 102, 241, 0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }

    /* ── Active Message ───────────────────────────────────────────── */
    .ps-active-msg {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 32px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #065F46;
    }

    /* ── Features List ────────────────────────────────────────────── */
    .ps-features {
      text-align: left;
      margin-bottom: 36px;
      padding: 0;
      list-style: none;
    }

    .ps-features li {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #334155;
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #F1F5F9;
    }

    .ps-features li:last-child {
      border-bottom: none;
    }

    .ps-features li .ps-feat-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ECFDF5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    /* ── Buttons ───────────────────────────────────────────────────── */
    .ps-btn-row {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .ps-btn {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 28px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .ps-btn:active {
      transform: scale(0.97);
    }

    .ps-btn-primary {
      background: linear-gradient(135deg, #122c5e, #1a3a7a);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(18, 44, 94, 0.3);
    }

    .ps-btn-primary:hover {
      box-shadow: 0 6px 20px rgba(18, 44, 94, 0.4);
      transform: translateY(-1px);
    }

    .ps-btn-accent {
      background: linear-gradient(135deg, #1396e2, #0ea5e9);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(19, 150, 226, 0.3);
    }

    .ps-btn-accent:hover {
      box-shadow: 0 6px 20px rgba(19, 150, 226, 0.4);
      transform: translateY(-1px);
    }

    .ps-btn-outline {
      background: transparent;
      color: #334155;
      border: 2px solid #E2E8F0;
    }

    .ps-btn-outline:hover {
      border-color: #CBD5E1;
      background: #F8FAFC;
    }

    .ps-btn-ghost {
      background: transparent;
      color: #64748B;
      border: none;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .ps-btn-ghost:hover {
      color: #334155;
    }

    /* ── Cancel Page ──────────────────────────────────────────────── */
    .ps-cancel-msg {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #64748B;
      margin: 0 0 12px;
      line-height: 1.6;
    }

    .ps-cancel-reassure {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFF7ED;
      border: 1px solid #FED7AA;
      border-radius: 10px;
      padding: 10px 18px;
      margin-bottom: 32px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #C2410C;
    }

    /* ── Responsive ───────────────────────────────────────────────── */
    @media (max-width: 560px) {
      .ps-card {
        padding: 40px 24px;
        border-radius: 20px;
      }

      .ps-heading {
        font-size: 26px;
      }

      .ps-btn-row {
        flex-direction: column;
      }

      .ps-btn {
        width: 100%;
        justify-content: center;
      }

      .ps-checkmark-ring,
      .ps-cancel-icon {
        width: 96px;
        height: 96px;
      }

      .ps-checkmark-svg {
        width: 44px;
        height: 44px;
      }

      .ps-cancel-icon {
        font-size: 44px;
      }
    }
  `;

  document.head.appendChild(style);
}


// ─── Confetti Generator ──────────────────────────────────────────────────────

/**
 * Create a burst of CSS confetti particles anchored to the viewport.
 * Returns the container element so callers can clean it up.
 *
 * @param {number} [count=60] Number of confetti pieces
 * @returns {HTMLElement}
 */
function createConfetti(count = 60) {
  const canvas = document.createElement('div');
  canvas.className = 'ps-confetti-canvas';

  const colors = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
    '#A855F7', '#F472B6', '#FB923C', '#34D399',
    '#60A5FA', '#E879F9', '#122c5e', '#1396e2'
  ];

  const shapes = ['square', 'rect', 'circle'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'ps-confetti-piece';

    const color    = colors[Math.floor(Math.random() * colors.length)];
    const shape    = shapes[Math.floor(Math.random() * shapes.length)];
    const left     = Math.random() * 100;            // % across viewport
    const size     = 6 + Math.random() * 10;         // 6–16px
    const duration = 2.5 + Math.random() * 3;        // 2.5–5.5s
    const delay    = Math.random() * 2.5;            // stagger start

    let width  = size;
    let height = size;
    let radius = '2px';

    if (shape === 'rect') {
      width  = size * 0.4;
      height = size * 1.6;
    } else if (shape === 'circle') {
      radius = '50%';
    }

    piece.style.cssText = `
      left: ${left}%;
      width: ${width}px;
      height: ${height}px;
      background: ${color};
      border-radius: ${radius};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    canvas.appendChild(piece);
  }

  document.body.appendChild(canvas);

  // Self-destruct after animations complete
  setTimeout(() => canvas.remove(), 8000);

  return canvas;
}


// ═══════════════════════════════════════════════════════════════════════════════
//  renderPaymentSuccess
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render the payment-success celebration page.
 *
 * @param {HTMLElement} container – The viewport element
 * @param {{ plan?: string, cycle?: string }} params – Route params
 */
export function renderPaymentSuccess(container, params = {}) {
  injectStyles();

  const planId       = params.plan  || 'pro';
  const billingCycle = params.cycle || 'monthly';
  const planLabel    = PLAN_LABELS[planId]       || planId;
  const cycleLabel   = CYCLE_LABELS[billingCycle] || billingCycle;
  const features     = PLAN_FEATURES[planId]     || PLAN_FEATURES.pro;

  // ── Persist subscription ────────────────────────────────────────────────
  const subscription = {
    plan:         planId,
    billingCycle: billingCycle,
    startDate:    new Date().toISOString(),
    status:       'active'
  };
  localStorage.setItem('aspire_subscription', JSON.stringify(subscription));

  // ── Launch confetti 🎉 ──────────────────────────────────────────────────
  createConfetti(70);

  // ── Build the page ──────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="ps-page">
      <div class="ps-card">

        <!-- Animated checkmark -->
        <div class="ps-checkmark-ring">
          <svg class="ps-checkmark-svg" viewBox="0 0 52 52">
            <path class="ps-checkmark-path" d="M14 27 l8 8 l16 -16"/>
          </svg>
        </div>

        <h1 class="ps-heading">Payment Successful!</h1>
        <p class="ps-subheading">
          Welcome to <strong>Aspire ${planLabel}</strong> — your PTE preparation
          just got a serious upgrade.
        </p>

        <!-- Plan badge -->
        <div class="ps-plan-badge">
          <span class="ps-plan-name">🎓 ${planLabel} Plan</span>
          <span class="ps-plan-cycle">${cycleLabel}</span>
        </div>

        <!-- Active subscription message -->
        <div class="ps-active-msg">
          <span>✅</span>
          Your subscription is now active
        </div>

        <!-- Features unlocked -->
        <ul class="ps-features">
          ${features.map(f => `
            <li>
              <span class="ps-feat-icon">✓</span>
              ${f}
            </li>
          `).join('')}
        </ul>

        <!-- Action buttons -->
        <div class="ps-btn-row">
          <button class="ps-btn ps-btn-primary" id="ps-goto-dashboard">
            <span>📊</span> Go to Dashboard
          </button>
          <button class="ps-btn ps-btn-accent" id="ps-start-practice">
            <span>🚀</span> Start Practicing
          </button>
        </div>
      </div>
    </div>
  `;

  // ── Button Handlers ─────────────────────────────────────────────────────
  container.querySelector('#ps-goto-dashboard')?.addEventListener('click', () => {
    Router.navigate('#dashboard');
  });

  container.querySelector('#ps-start-practice')?.addEventListener('click', () => {
    Router.navigate('#practice');
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
//  renderPaymentCancel
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render the payment-cancel page with a friendly, no-pressure message.
 *
 * @param {HTMLElement} container – The viewport element
 * @param {object} params – Route params (unused)
 */
export function renderPaymentCancel(container, params = {}) {
  injectStyles();

  container.innerHTML = `
    <div class="ps-page">
      <div class="ps-card">

        <!-- Friendly illustration -->
        <div class="ps-cancel-icon">
          <span>🤷‍♂️</span>
        </div>

        <h1 class="ps-heading">Payment Cancelled</h1>

        <p class="ps-cancel-msg">
          That's completely fine! Take your time to decide.
          <br>Your progress and free features are still right here waiting for you.
        </p>

        <div class="ps-cancel-reassure">
          <span>🔒</span>
          No worries — no charges were made to your account.
        </div>

        <!-- Action buttons -->
        <div class="ps-btn-row">
          <button class="ps-btn ps-btn-outline" id="ps-return-pricing">
            ← Return to Pricing
          </button>
          <button class="ps-btn ps-btn-primary" id="ps-continue-free">
            Continue with Free Plan
          </button>
        </div>

        <!-- Subtle helper text -->
        <p style="
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #94A3B8;
          margin-top: 24px;
          line-height: 1.5;
        ">
          Questions? Reach out anytime at
          <a href="mailto:support@aspirepte.ai" style="color: #1396e2; text-decoration: none; font-weight: 500;">
            support@aspirepte.ai
          </a>
        </p>
      </div>
    </div>
  `;

  // ── Button Handlers ─────────────────────────────────────────────────────
  container.querySelector('#ps-return-pricing')?.addEventListener('click', () => {
    // Navigate to the landing page which contains the pricing section
    Router.navigate('#landing');
    // Scroll to pricing after a brief delay for the page to render
    setTimeout(() => {
      const pricingSection = document.querySelector('.pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
  });

  container.querySelector('#ps-continue-free')?.addEventListener('click', () => {
    Router.navigate('#dashboard');
  });
}
