/* Aspire Education — Premium Pricing Page */

import { Router } from '../router.js?v=19';
import { Database } from '../db.js?v=19';

export function renderPricing(container, params) {
  // Inject keyframe animations (only once)
  if (!document.getElementById('pricing-keyframes')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'pricing-keyframes';
    styleSheet.textContent = `
      @keyframes pricingFadeInUp {
        from { opacity: 0; transform: translateY(32px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pricingShimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes pricingGradientBorder {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes pricingPulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(19, 150, 226, 0.15); }
        50%      { box-shadow: 0 0 40px rgba(19, 150, 226, 0.30); }
      }
      @keyframes pricingBadgeBounce {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.06); }
      }
      @keyframes pricingCheckIn {
        from { opacity: 0; transform: scale(0.5) translateX(-8px); }
        to   { opacity: 1; transform: scale(1) translateX(0); }
      }
      @keyframes pricingFloat {
        0%, 100% { transform: translateY(0px); }
        50%      { transform: translateY(-6px); }
      }
      @keyframes pricingCountUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Get current subscription
  const currentSub = Database.getSubscription();
  const currentPlan = currentSub.plan || 'free';

  // Pricing data
  const plans = {
    free: {
      id: 'free',
      name: 'Free',
      icon: '🎯',
      subtitle: 'Perfect to get started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyDisplay: '₹0',
      yearlyDisplay: '₹0',
      yearlySavings: null,
      features: [
        { text: '5 practice questions/day', available: true },
        { text: 'Basic question types', available: true },
        { text: 'Community support', available: true },
        { text: 'Progress tracking', available: true },
        { text: 'AI scoring & feedback', available: false },
        { text: 'Mock tests', available: false },
        { text: 'Performance analytics', available: false },
        { text: 'Study resources library', available: false },
      ],
      cta: currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free',
      ctaDisabled: currentPlan === 'free',
      ctaClass: 'pricing-btn-free',
      tier: 'free'
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      icon: '⚡',
      subtitle: 'Most popular for serious learners',
      monthlyPrice: 999,
      yearlyPrice: 7999,
      monthlyDisplay: '₹999',
      yearlyDisplay: '₹7,999',
      yearlySavings: 'Save 33%',
      yearlyPerMonth: '₹667',
      features: [
        { text: 'Unlimited practice questions', available: true },
        { text: 'AI scoring & detailed feedback', available: true },
        { text: '2 mock tests/month', available: true },
        { text: 'All question types', available: true },
        { text: 'Priority email support', available: true },
        { text: 'Performance analytics', available: true },
        { text: 'Study resources library', available: false },
        { text: '1-on-1 tutor sessions', available: false },
      ],
      cta: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaDisabled: currentPlan === 'pro',
      ctaClass: 'pricing-btn-pro',
      recommended: true,
      tier: 'pro'
    },
    elite: {
      id: 'elite',
      name: 'Elite',
      icon: '👑',
      subtitle: 'Maximum results, fastest path',
      monthlyPrice: 1999,
      yearlyPrice: 14999,
      monthlyDisplay: '₹1,999',
      yearlyDisplay: '₹14,999',
      yearlySavings: 'Save 37%',
      yearlyPerMonth: '₹1,250',
      features: [
        { text: 'Everything in Pro', available: true, highlight: true },
        { text: 'Unlimited mock tests', available: true },
        { text: 'Priority AI feedback', available: true },
        { text: 'Study resources library', available: true },
        { text: '1-on-1 tutor sessions', available: true },
        { text: 'Custom study plans', available: true },
        { text: 'Exam strategy guides', available: true },
        { text: 'Dedicated success manager', available: true },
      ],
      cta: currentPlan === 'elite' ? 'Current Plan' : 'Upgrade to Elite',
      ctaDisabled: currentPlan === 'elite',
      ctaClass: 'pricing-btn-elite',
      tier: 'elite'
    }
  };

  // Feature comparison table data
  const comparisonFeatures = [
    { feature: 'Practice Questions', free: '5/day', pro: 'Unlimited', elite: 'Unlimited' },
    { feature: 'Question Types', free: 'Basic', pro: 'All Types', elite: 'All Types' },
    { feature: 'AI Scoring & Feedback', free: false, pro: true, elite: true },
    { feature: 'Mock Tests', free: false, pro: '2/month', elite: 'Unlimited' },
    { feature: 'Performance Analytics', free: false, pro: true, elite: true },
    { feature: 'Priority Email Support', free: false, pro: true, elite: true },
    { feature: 'Study Resources Library', free: false, pro: false, elite: true },
    { feature: '1-on-1 Tutor Sessions', free: false, pro: false, elite: true },
    { feature: 'Custom Study Plans', free: false, pro: false, elite: true },
    { feature: 'Exam Strategy Guides', free: false, pro: false, elite: true },
    { feature: 'Priority AI Feedback', free: false, pro: false, elite: true },
    { feature: 'Dedicated Success Manager', free: false, pro: false, elite: true },
  ];

  // FAQ data
  const faqs = [
    {
      q: 'How does the free plan work?',
      a: 'Our Free plan gives you instant access to 5 practice questions per day across basic question types. No credit card required — just sign up and start practising. It\'s perfect for exploring the platform before committing to a paid plan.'
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Absolutely! There are no contracts or hidden fees. You can cancel your Pro or Elite subscription at any time from your account settings. Your access continues until the end of your current billing period.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm), all major credit and debit cards, net banking, and popular wallets. All payments are processed securely through Razorpay.'
    },
    {
      q: 'Is my payment information secure?',
      a: 'Yes, completely. We use Razorpay for payment processing — India\'s leading payment solution. All transactions are secured using standard 256-bit SSL encryption, and we never store your card credentials on our servers.'
    },
    {
      q: 'Can I switch between plans?',
      a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference immediately. When downgrading, the change takes effect at the start of your next billing cycle.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'We offer a 7-day money-back guarantee on all paid plans. If you\'re not satisfied within the first 7 days, contact our support team for a full refund — no questions asked.'
    }
  ];

  // Build the pricing card HTML
  const buildPricingCard = (plan, index) => {
    const isRecommended = plan.recommended;
    const animDelay = (index + 1) * 120;

    const featuresHtml = plan.features.map((f, fi) => `
      <li style="
        display: flex; align-items: flex-start; gap: 10px;
        font-size: 14px; line-height: 1.5; padding: 6px 0;
        animation: pricingCheckIn 0.4s ease-out ${(fi * 60) + 300}ms both;
      ">
        <span style="
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; margin-top: 1px;
          ${f.available
            ? `background: ${f.highlight ? 'linear-gradient(135deg, var(--accent), var(--primary))' : 'rgba(16, 185, 129, 0.12)'}; color: ${f.highlight ? '#fff' : 'var(--success)'};`
            : 'background: rgba(100, 116, 139, 0.08); color: var(--text-muted);'
          }
        ">${f.available ? '✓' : '✕'}</span>
        <span style="color: ${f.available ? 'var(--text-primary)' : 'var(--text-muted)'}; ${!f.available ? 'text-decoration: line-through; opacity: 0.5;' : ''} ${f.highlight ? 'font-weight: 600; background: linear-gradient(135deg, var(--accent), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}">
          ${f.text}
        </span>
      </li>
    `).join('');

    return `
      <div class="card-glass pricing-card ${isRecommended ? 'premium' : ''}"
        data-plan="${plan.id}"
        style="
          position: relative; display: flex; flex-direction: column;
          padding: 0; overflow: visible;
          border-radius: var(--radius-lg);
          animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${animDelay}ms both;
          ${isRecommended ? `
            border: 2px solid transparent;
            background-clip: padding-box;
            z-index: 2;
            transform: scale(1.04);
            animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${animDelay}ms both, pricingPulseGlow 3s ease-in-out infinite 1.5s;
          ` : `
            border: 1px solid var(--border-color);
          `}
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        "
      >
        ${isRecommended ? `
          <!-- Animated gradient border overlay -->
          <div class="pricing-gradient-border" style="
            position: absolute; inset: -2px; border-radius: calc(var(--radius-lg) + 2px);
            background: linear-gradient(135deg, var(--accent), var(--primary), #8B5CF6, var(--accent));
            background-size: 300% 300%;
            animation: pricingGradientBorder 4s ease infinite;
            z-index: -1;
          "></div>
          <!-- Most Popular Badge -->
          <div class="pricing-badge" style="
            position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, var(--accent), var(--primary));
            color: #fff; font-size: 12px; font-weight: 700;
            padding: 6px 20px; border-radius: var(--radius-round);
            letter-spacing: 0.05em; text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(19, 150, 226, 0.35);
            animation: pricingBadgeBounce 2s ease-in-out infinite 2s;
            white-space: nowrap;
          ">⭐ Most Popular</div>
        ` : ''}

        <!-- Card Inner Content -->
        <div style="padding: 36px 32px 32px; flex: 1; display: flex; flex-direction: column; ${isRecommended ? 'background: var(--bg-card); border-radius: calc(var(--radius-lg) - 2px);' : ''}">

          <!-- Plan Header -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="font-size: 28px; line-height: 1;">${plan.icon}</span>
              <h3 style="
                font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700;
                color: var(--text-primary); margin: 0;
              ">${plan.name}</h3>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
              ${plan.subtitle}
            </p>
          </div>

          <!-- Price Display -->
          <div class="pricing-price-block" style="margin-bottom: 28px; min-height: 80px;">
            <!-- Monthly price -->
            <div class="pricing-monthly-price" style="transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);">
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="
                  font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800;
                  color: var(--text-primary); line-height: 1;
                  ${plan.id !== 'free' ? 'background: linear-gradient(135deg, var(--text-primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}
                ">${plan.monthlyDisplay}</span>
                <span style="font-size: 14px; color: var(--text-muted); font-weight: 400;">/month</span>
              </div>
              ${plan.id === 'free' ? '<p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">Free forever</p>' : ''}
            </div>
            <!-- Yearly price (hidden by default) -->
            <div class="pricing-yearly-price" style="display: none; transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);">
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="
                  font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800;
                  color: var(--text-primary); line-height: 1;
                  ${plan.id !== 'free' ? 'background: linear-gradient(135deg, var(--text-primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}
                ">${plan.yearlyDisplay}</span>
                <span style="font-size: 14px; color: var(--text-muted); font-weight: 400;">/year</span>
              </div>
              ${plan.yearlyPerMonth ? `
                <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
                  That's just <strong>${plan.yearlyPerMonth}/mo</strong>
                </p>
              ` : ''}
              ${plan.yearlySavings ? `
                <span class="pricing-savings-badge" style="
                  display: inline-block; margin-top: 8px;
                  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.06));
                  color: var(--success); font-size: 12px; font-weight: 700;
                  padding: 4px 12px; border-radius: var(--radius-round);
                  border: 1px solid rgba(16, 185, 129, 0.2);
                  letter-spacing: 0.03em;
                ">${plan.yearlySavings}</span>
              ` : ''}
              ${plan.id === 'free' ? '<p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">Free forever</p>' : ''}
            </div>
          </div>

          <!-- Divider -->
          <div style="
            height: 1px; width: 100%;
            background: linear-gradient(90deg, transparent, var(--border-color), transparent);
            margin-bottom: 24px;
          "></div>

          <!-- Features List -->
          <ul style="list-style: none; padding: 0; margin: 0 0 28px 0; flex: 1; display: flex; flex-direction: column; gap: 4px;">
            ${featuresHtml}
          </ul>

          <!-- CTA Button -->
          <button
            class="btn ${plan.id === 'pro' ? 'btn-accent' : plan.id === 'elite' ? 'btn-primary' : 'btn-outline'} pricing-cta-btn"
            data-plan-id="${plan.id}"
            ${plan.ctaDisabled ? 'disabled' : ''}
            style="
              width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 700;
              border-radius: var(--radius-md); cursor: ${plan.ctaDisabled ? 'default' : 'pointer'};
              transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
              ${plan.ctaDisabled ? 'opacity: 0.55; pointer-events: none;' : ''}
              ${plan.id === 'pro' ? `
                background: linear-gradient(135deg, var(--accent), #0d7bc5);
                border: none; color: #fff;
                box-shadow: 0 4px 20px rgba(19, 150, 226, 0.3);
              ` : ''}
              ${plan.id === 'elite' ? `
                background: linear-gradient(135deg, var(--primary), #1a3d7a);
                border: none; color: #fff;
                box-shadow: 0 4px 20px rgba(18, 44, 94, 0.3);
              ` : ''}
            "
          >${plan.cta}</button>
        </div>
      </div>
    `;
  };

  // Build comparison table
  const buildComparisonTable = () => {
    const rows = comparisonFeatures.map((row, i) => {
      const renderCell = (val) => {
        if (val === true) return '<span style="color: var(--success); font-weight: 700; font-size: 16px;">✓</span>';
        if (val === false) return '<span style="color: var(--text-muted); font-size: 14px;">—</span>';
        return `<span style="color: var(--text-primary); font-size: 13px; font-weight: 600;">${val}</span>`;
      };
      return `
        <tr style="
          border-bottom: 1px solid var(--border-color);
          animation: pricingFadeInUp 0.5s ease-out ${200 + i * 50}ms both;
          transition: background 0.2s ease;
        " onmouseenter="this.style.background='var(--bg-card-hover)'" onmouseleave="this.style.background='transparent'">
          <td style="padding: 14px 16px; font-size: 14px; color: var(--text-primary); text-align: left;">${row.feature}</td>
          <td style="padding: 14px 16px; text-align: center;">${renderCell(row.free)}</td>
          <td style="padding: 14px 16px; text-align: center; background: rgba(19, 150, 226, 0.03);">${renderCell(row.pro)}</td>
          <td style="padding: 14px 16px; text-align: center;">${renderCell(row.elite)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
          <thead>
            <tr style="background: linear-gradient(135deg, rgba(18, 44, 94, 0.04), rgba(19, 150, 226, 0.04));">
              <th style="padding: 16px; text-align: left; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-secondary); width: 40%;">Feature</th>
              <th style="padding: 16px; text-align: center; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-secondary); width: 20%;">
                🎯 Free
              </th>
              <th style="padding: 16px; text-align: center; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--accent); width: 20%; background: rgba(19, 150, 226, 0.03); position: relative;">
                ⚡ Pro
                <div style="position: absolute; top: -1px; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--primary)); border-radius: 3px 3px 0 0;"></div>
              </th>
              <th style="padding: 16px; text-align: center; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-secondary); width: 20%;">
                👑 Elite
              </th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  };

  // Build FAQ accordion
  const buildFAQ = () => {
    return faqs.map((faq, i) => `
      <div class="pricing-faq-item" data-faq-index="${i}" style="
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        animation: pricingFadeInUp 0.5s ease-out ${300 + i * 80}ms both;
      ">
        <button class="pricing-faq-toggle" data-faq-index="${i}" style="
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; background: none; border: none;
          font-size: 15px; font-weight: 600; color: var(--text-primary);
          font-family: 'Inter', sans-serif; cursor: pointer;
          text-align: left; gap: 16px;
          transition: background 0.2s ease;
        ">
          <span>${faq.q}</span>
          <span class="pricing-faq-chevron" style="
            flex-shrink: 0; width: 24px; height: 24px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; background: rgba(19, 150, 226, 0.08);
            color: var(--accent); font-size: 14px;
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease;
          ">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 4.5L6 7.5L9 4.5"/>
            </svg>
          </span>
        </button>
        <div class="pricing-faq-answer" style="
          max-height: 0; overflow: hidden; padding: 0 24px;
          transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), padding 0.3s ease;
        ">
          <p style="
            font-size: 14px; line-height: 1.7; color: var(--text-secondary);
            padding-bottom: 20px; margin: 0;
          ">${faq.a}</p>
        </div>
      </div>
    `).join('');
  };

  // ===================== RENDER THE PAGE =====================

  container.innerHTML = `
    <div class="pricing-page" style="
      max-width: 1200px; margin: 0 auto;
      padding: 40px 24px 80px;
    ">

      <!-- ===== HERO HEADER ===== -->
      <div class="pricing-header" style="
        text-align: center; margin-bottom: 56px;
        animation: pricingFadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0ms both;
      ">
        <!-- Decorative top element -->
        <div style="
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, rgba(19, 150, 226, 0.08), rgba(18, 44, 94, 0.06));
          border: 1px solid rgba(19, 150, 226, 0.15);
          border-radius: var(--radius-round); padding: 8px 20px;
          font-size: 13px; font-weight: 600; color: var(--accent);
          margin-bottom: 20px; letter-spacing: 0.03em;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Simple, Transparent Pricing
        </div>

        <h1 style="
          font-family: 'Outfit', sans-serif; font-size: clamp(28px, 5vw, 42px);
          font-weight: 800; color: var(--text-primary);
          line-height: 1.15; margin: 0 0 16px 0; letter-spacing: -0.03em;
        ">
          Invest in Your
          <span style="
            background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          "> PTE Success</span>
        </h1>

        <p style="
          font-size: 17px; color: var(--text-secondary);
          max-width: 560px; margin: 0 auto 32px; line-height: 1.6;
        ">
          Choose the plan that fits your preparation journey. Upgrade anytime, cancel anytime. No surprises.
        </p>

        <!-- ===== BILLING TOGGLE ===== -->
        <div class="pricing-billing-toggle" style="
          display: inline-flex; align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-round); padding: 5px;
          gap: 0; position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        ">
          <button class="pricing-toggle-btn active" data-cycle="monthly" style="
            position: relative; z-index: 1; padding: 10px 28px;
            border: none; border-radius: var(--radius-round);
            font-size: 14px; font-weight: 600; cursor: pointer;
            background: transparent; color: var(--text-secondary);
            transition: color 0.3s ease;
          ">Monthly</button>
          <button class="pricing-toggle-btn" data-cycle="yearly" style="
            position: relative; z-index: 1; padding: 10px 28px;
            border: none; border-radius: var(--radius-round);
            font-size: 14px; font-weight: 600; cursor: pointer;
            background: transparent; color: var(--text-secondary);
            transition: color 0.3s ease;
            display: flex; align-items: center; gap: 8px;
          ">
            Yearly
            <span class="pricing-yearly-pill" style="
              display: inline-block; background: linear-gradient(135deg, var(--success), #059669);
              color: #fff; font-size: 11px; font-weight: 700;
              padding: 2px 8px; border-radius: var(--radius-round);
              line-height: 1.4;
            ">-33%</span>
          </button>
          <!-- Sliding indicator -->
          <div class="pricing-toggle-slider" style="
            position: absolute; top: 5px; left: 5px;
            height: calc(100% - 10px);
            width: calc(50% - 5px);
            background: var(--primary);
            border-radius: var(--radius-round);
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            z-index: 0;
            box-shadow: 0 2px 8px rgba(18, 44, 94, 0.2);
          "></div>
        </div>
      </div>


      <!-- ===== PRICING CARDS ===== -->
      <div class="pricing-grid" style="
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 28px; align-items: stretch;
        margin-bottom: 80px; position: relative;
      ">
        ${buildPricingCard(plans.free, 0)}
        ${buildPricingCard(plans.pro, 1)}
        ${buildPricingCard(plans.elite, 2)}
      </div>


      <!-- ===== FEATURE COMPARISON TABLE ===== -->
      <div style="
        margin-bottom: 80px;
        animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 600ms both;
      ">
        <div style="text-align: center; margin-bottom: 36px;">
          <h2 style="
            font-family: 'Outfit', sans-serif; font-size: clamp(22px, 4vw, 30px);
            font-weight: 700; color: var(--text-primary); margin: 0 0 10px 0;
          ">Compare All Features</h2>
          <p style="font-size: 15px; color: var(--text-secondary); margin: 0;">
            A detailed look at what each plan includes
          </p>
        </div>
        ${buildComparisonTable()}
      </div>


      <!-- ===== FAQ SECTION ===== -->
      <div style="
        margin-bottom: 80px;
        animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 700ms both;
      ">
        <div style="text-align: center; margin-bottom: 36px;">
          <h2 style="
            font-family: 'Outfit', sans-serif; font-size: clamp(22px, 4vw, 30px);
            font-weight: 700; color: var(--text-primary); margin: 0 0 10px 0;
          ">Frequently Asked Questions</h2>
          <p style="font-size: 15px; color: var(--text-secondary); margin: 0;">
            Everything you need to know about our plans
          </p>
        </div>
        <div style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
          ${buildFAQ()}
        </div>
      </div>


      <!-- ===== TRUST BADGES ===== -->
      <div style="
        display: flex; flex-wrap: wrap; justify-content: center; gap: 24px;
        padding: 40px 0; border-top: 1px solid var(--border-color);
        animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 800ms both;
      ">
        ${[
          { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`, text: 'Powered by Razorpay' },
          { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`, text: '256-bit SSL' },
          { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`, text: 'Cancel Anytime' },
          { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, text: 'Money-back Guarantee' },
        ].map((badge, i) => `
          <div style="
            display: flex; align-items: center; gap: 10px;
            padding: 12px 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            font-size: 13px; font-weight: 600;
            transition: all 0.3s ease;
            animation: pricingFadeInUp 0.5s ease-out ${900 + i * 100}ms both;
          " onmouseenter="this.style.borderColor='var(--accent)'; this.style.color='var(--accent)'; this.style.boxShadow='0 4px 20px rgba(19, 150, 226, 0.1)';"
             onmouseleave="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)'; this.style.boxShadow='none';">
            ${badge.icon}
            <span>${badge.text}</span>
          </div>
        `).join('')}
      </div>


      <!-- ===== BOTTOM CTA ===== -->
      <div style="
        text-align: center; padding: 48px 24px;
        background: linear-gradient(135deg, rgba(19, 150, 226, 0.04), rgba(18, 44, 94, 0.04));
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        animation: pricingFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1000ms both;
      ">
        <h3 style="
          font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700;
          color: var(--text-primary); margin: 0 0 10px 0;
        ">Still have questions?</h3>
        <p style="font-size: 14px; color: var(--text-secondary); margin: 0 0 24px 0;">
          Our team is here to help you choose the right plan for your PTE journey.
        </p>
        <button id="pricing-contact-btn" class="btn btn-outline" style="
          padding: 12px 32px; font-size: 14px; font-weight: 600;
          border-radius: var(--radius-round);
        ">Contact Support</button>
      </div>

    </div>
  `;

  // ===================== INTERACTIVITY =====================

  let billingCycle = 'monthly';

  // Toggle handler
  const toggleBtns = container.querySelectorAll('.pricing-toggle-btn');
  const slider = container.querySelector('.pricing-toggle-slider');
  const monthlyPrices = container.querySelectorAll('.pricing-monthly-price');
  const yearlyPrices = container.querySelectorAll('.pricing-yearly-price');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cycle = btn.dataset.cycle;
      if (cycle === billingCycle) return;
      billingCycle = cycle;

      // Update active states
      toggleBtns.forEach(b => {
        b.classList.remove('active');
        b.style.color = 'var(--text-secondary)';
      });
      btn.classList.add('active');
      btn.style.color = '#fff';

      // Slide the indicator
      if (cycle === 'yearly') {
        slider.style.transform = 'translateX(100%)';
      } else {
        slider.style.transform = 'translateX(0)';
      }

      // Swap prices with animation
      monthlyPrices.forEach(el => {
        if (cycle === 'yearly') {
          el.style.opacity = '0';
          el.style.transform = 'translateY(-10px)';
          setTimeout(() => { el.style.display = 'none'; }, 300);
        } else {
          el.style.display = 'block';
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 20);
        }
      });

      yearlyPrices.forEach(el => {
        if (cycle === 'yearly') {
          el.style.display = 'block';
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 20);
        } else {
          el.style.opacity = '0';
          el.style.transform = 'translateY(10px)';
          setTimeout(() => { el.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // Set initial active toggle styling
  const activeToggle = container.querySelector('.pricing-toggle-btn.active');
  if (activeToggle) {
    activeToggle.style.color = '#fff';
  }

  // CTA button click handlers
  const ctaBtns = container.querySelectorAll('.pricing-cta-btn');
  ctaBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const planId = btn.dataset.planId;
      if (planId === 'free' || btn.disabled) return;

      // Add loading state
      const originalText = btn.textContent;
      btn.textContent = 'Processing...';
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';

      try {
        const { CheckoutCoordinator } = await import('../checkout-coordinator.js?v=19');
        await CheckoutCoordinator.checkout(planId, billingCycle);
      } catch (err) {
        console.error('Checkout error:', err);
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    });

    // Hover effects for non-disabled buttons
    if (!btn.disabled) {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = btn.dataset.planId === 'pro'
          ? '0 8px 30px rgba(19, 150, 226, 0.4)'
          : btn.dataset.planId === 'elite'
            ? '0 8px 30px rgba(18, 44, 94, 0.4)'
            : '0 4px 20px rgba(0,0,0,0.08)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = btn.dataset.planId === 'pro'
          ? '0 4px 20px rgba(19, 150, 226, 0.3)'
          : btn.dataset.planId === 'elite'
            ? '0 4px 20px rgba(18, 44, 94, 0.3)'
            : 'none';
      });
    }
  });

  // Card hover effects
  const cards = container.querySelectorAll('.pricing-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('premium')) {
        card.style.transform = 'translateY(-6px)';
        card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08)';
        card.style.borderColor = 'var(--border-color-hover)';
      }
    });
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('premium')) {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '';
        card.style.borderColor = 'var(--border-color)';
      }
    });
  });

  // FAQ accordion
  const faqToggles = container.querySelectorAll('.pricing-faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const index = toggle.dataset.faqIndex;
      const item = container.querySelector(`.pricing-faq-item[data-faq-index="${index}"]`);
      const answer = item.querySelector('.pricing-faq-answer');
      const chevron = toggle.querySelector('.pricing-faq-chevron');
      const isOpen = item.classList.contains('open');

      // Close all others
      container.querySelectorAll('.pricing-faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          const otherAnswer = openItem.querySelector('.pricing-faq-answer');
          const otherChevron = openItem.querySelector('.pricing-faq-chevron');
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.paddingTop = '0';
          otherChevron.style.transform = 'rotate(0deg)';
          openItem.style.borderColor = 'var(--border-color)';
          openItem.style.background = 'transparent';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
        answer.style.paddingTop = '0';
        chevron.style.transform = 'rotate(0deg)';
        item.style.borderColor = 'var(--border-color)';
        item.style.background = 'transparent';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingTop = '4px';
        chevron.style.transform = 'rotate(180deg)';
        item.style.borderColor = 'var(--accent)';
        item.style.background = 'rgba(19, 150, 226, 0.02)';
      }
    });

    // Hover effects on FAQ items
    const item = toggle.closest('.pricing-faq-item');
    toggle.addEventListener('mouseenter', () => {
      if (!item.classList.contains('open')) {
        toggle.style.background = 'rgba(19, 150, 226, 0.02)';
      }
    });
    toggle.addEventListener('mouseleave', () => {
      if (!item.classList.contains('open')) {
        toggle.style.background = 'none';
      }
    });
  });

  // Contact support button
  const contactBtn = container.querySelector('#pricing-contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      // Could navigate to a support page or open a modal
      window.open('mailto:support@aspireeducation.com', '_blank');
    });
  }

  // Responsive: Handle window resize for pricing grid
  const applyResponsive = () => {
    const grid = container.querySelector('.pricing-grid');
    if (!grid) return;
    if (window.innerWidth <= 768) {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gap = '24px';
      // Reset scale on recommended card for mobile
      const proCard = grid.querySelector('.pricing-card.premium');
      if (proCard) {
        proCard.style.transform = 'scale(1)';
        proCard.style.order = '-1'; // Show Pro first on mobile
      }
    } else if (window.innerWidth <= 1024) {
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.gap = '24px';
    } else {
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      grid.style.gap = '28px';
    }
  };

  applyResponsive();
  window.addEventListener('resize', applyResponsive);
}
