/**
 * Unified Checkout Coordinator for Aspire Education PTE Platform
 * 
 * Dynamically routes checkout requests to the selected active payment gateway:
 *  - Stripe (Session redirect)
 *  - Razorpay (Standard modal checkout)
 *  - Manual Transfer (Mock bank details and upload slip dialog)
 *  - Demo Mode (Fully simulated payment overlay)
 */

import { Database } from './db.js?v=25';

const PLAN_PRICES = {
  pro_monthly: 999,
  pro_yearly: 7999,
  elite_monthly: 1999,
  elite_yearly: 14999
};

const PLAN_LABELS = {
  pro: 'Pro Plan',
  elite: 'Elite Plan',
  free: 'Free Plan'
};

const CYCLE_LABELS = {
  monthly: 'Monthly',
  yearly: 'Yearly'
};

const CheckoutCoordinator = {
  /**
   * Initialize all checkout modules.
   */
  async init() {
    const gateway = this.getActiveGateway();
    console.log(`[Checkout] Active Payment Gateway: ${gateway.toUpperCase()}`);

    if (gateway === 'stripe') {
      const { StripeCheckout } = await import('./stripe-checkout.js?v=25');
      await StripeCheckout.init();
    } else if (gateway === 'razorpay') {
      const { RazorpayCheckout } = await import('./razorpay-checkout.js?v=25');
      await RazorpayCheckout.init();
    }
  },

  /**
   * Get selected payment gateway from localStorage.
   * Defaults to 'demo' if none configured.
   * 
   * @returns {string} - 'stripe' | 'razorpay' | 'manual' | 'demo'
   */
  getActiveGateway() {
    return localStorage.getItem('active_payment_gateway') || 'demo';
  },

  /**
   * Route the checkout requests.
   * 
   * @param {string} planId - 'pro' or 'elite'
   * @param {string} billingCycle - 'monthly' or 'yearly'
   */
  async checkout(planId, billingCycle) {
    const gateway = this.getActiveGateway();
    
    switch (gateway) {
      case 'stripe':
        try {
          const { StripeCheckout } = await import('./stripe-checkout.js?v=25');
          await StripeCheckout.checkout(planId, billingCycle);
        } catch (err) {
          console.error('[Checkout] Failed to load Stripe Checkout module:', err);
          window.showToast?.('Stripe checkout error. Check browser logs.', 'error');
        }
        break;

      case 'razorpay':
        try {
          const { RazorpayCheckout } = await import('./razorpay-checkout.js?v=25');
          await RazorpayCheckout.checkout(planId, billingCycle);
        } catch (err) {
          console.error('[Checkout] Failed to load Razorpay Checkout module:', err);
          window.showToast?.('Razorpay checkout error. Check browser logs.', 'error');
        }
        break;

      case 'manual':
        this._showManualTransferDialog(planId, billingCycle);
        break;

      case 'demo':
      default:
        this._simulateDemoCheckout(planId, billingCycle);
        break;
    }
  },

  /**
   * Shows a premium dialog explaining UPI/Bank transfer details
   * and providing a mock receipt upload.
   * 
   * @private
   */
  _showManualTransferDialog(planId, billingCycle) {
    const priceKey = `${planId}_${billingCycle}`;
    const amount = PLAN_PRICES[priceKey] || 0;
    const planLabel = PLAN_LABELS[planId] || planId;
    const cycleLabel = CYCLE_LABELS[billingCycle] || billingCycle;

    // Get configured manual bank details from localStorage
    const bankName = localStorage.getItem('manual_bank_name') || 'State Bank of India';
    const accNumber = localStorage.getItem('manual_acc_number') || '39010203040';
    const ifscCode = localStorage.getItem('manual_ifsc_code') || 'SBIN0001234';
    const upiId = localStorage.getItem('manual_upi_id') || 'pay@aspirepte.ai';

    const overlay = document.createElement('div');
    overlay.id = 'manual-transfer-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(8px);
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff;
        border-radius: 20px;
        max-width: 460px;
        width: 90%;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
        animation: manualModalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      " id="manual-card">
        
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #122c5e, #1a3a7a);
          color: #fff; padding: 24px; position: relative;
        ">
          <button id="manual-close-btn" style="
            position: absolute; right: 16px; top: 16px;
            background: none; border: none; color: rgba(255,255,255,0.7);
            font-size: 24px; cursor: pointer;
          ">&times;</button>
          
          <h3 style="margin: 0; font-size: 18px; font-family:'Outfit', sans-serif; font-weight:700;">Offline Payment Bank Details</h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity:0.85;">
            Transfer the amount manually and upload the receipt/slip to activate your plan.
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display:flex; flex-direction:column; gap:16px; max-height: 70vh; overflow-y: auto;">
          
          <div style="text-align: center; margin-bottom: 8px;">
            <span style="font-size: 13px; color: var(--text-secondary); text-transform:uppercase; font-weight:600; letter-spacing:0.05em;">Total Transfer Amount</span>
            <div style="font-size: 32px; font-weight: 800; color: #122c5e; font-family:'Outfit', sans-serif; margin-top:2px;">
              ₹${amount.toLocaleString('en-IN')}
            </div>
            <span style="font-size:12.5px; color:#6366f1; background:rgba(99,102,241,0.08); padding:3px 12px; border-radius:12px; font-weight:600; display:inline-block; margin-top:4px;">
              ${planLabel} · ${cycleLabel}
            </span>
          </div>

          <!-- Divider -->
          <div style="height:1px; background:#edf2f7; width:100%;"></div>

          <!-- Bank Details -->
          <div style="display:flex; flex-direction:column; gap:8px; font-size:13.5px; color:#2d3748;">
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span style="color:#718096;">Bank Name:</span>
              <strong style="color:#1a202c;">${bankName}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span style="color:#718096;">Account Number:</span>
              <strong style="color:#1a202c;">${accNumber}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span style="color:#718096;">IFSC Code:</span>
              <strong style="color:#1a202c;">${ifscCode}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0; border-top:1px dashed #edf2f7; padding-top:8px; margin-top:4px;">
              <span style="color:#718096; display:flex; align-items:center; gap:4px;">UPI ID:</span>
              <strong style="color:#1396e2;">${upiId}</strong>
            </div>
          </div>

          <!-- QR Code section -->
          <div style="
            background: #f8fafc; border: 1px dashed #e2e8f0;
            border-radius: 12px; padding: 16px; text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
          ">
            <!-- Mock QR -->
            <div style="
              width: 100px; height: 100px; background: #fff; border: 1px solid #e2e8f0;
              display: flex; align-items: center; justify-content: center; border-radius: 8px;
            ">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a0aec0;" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <line x1="7" y1="7" x2="7" y2="7.01"/>
                <line x1="17" y1="7" x2="17" y2="7.01"/>
                <line x1="17" y1="17" x2="17" y2="17.01"/>
                <line x1="7" y1="17" x2="7" y2="17.01"/>
              </svg>
            </div>
            <div style="font-size: 12px; color: #718096;">Scan QR with any UPI App (GPay, PhonePe, Paytm)</div>
          </div>

          <!-- Divider -->
          <div style="height:1px; background:#edf2f7; width:100%;"></div>

          <!-- Receipt Upload Form -->
          <form id="manual-upload-form" style="display:flex; flex-direction:column; gap:12px;">
            <div class="input-group" style="margin-bottom:0;">
              <label style="font-size:12.5px; font-weight:600; color:#4a5568; margin-bottom:6px;">Upload Payment Receipt (Image/PDF)</label>
              <input type="file" id="manual-receipt-file" accept="image/*,application/pdf" required style="
                width: 100%; border: 1px solid #cbd5e0; padding: 10px;
                border-radius: 8px; font-size:13px; background:#fff; cursor:pointer;
              ">
            </div>
            <button type="submit" id="manual-submit-btn" class="btn btn-primary btn-block shadow-neon" style="
              background: linear-gradient(135deg, #122c5e, #1a3a7a); padding: 12px 20px; font-size:14.5px; border-radius:10px;
            ">Submit Verification Slip</button>
          </form>
        </div>
      </div>

      <style>
        @keyframes manualModalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      </style>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#manual-close-btn');
    const dismiss = () => overlay.remove();
    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    const uploadForm = overlay.querySelector('#manual-upload-form');
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = overlay.querySelector('#manual-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading receipt...';
      submitBtn.style.opacity = '0.75';

      setTimeout(() => {
        submitBtn.textContent = 'Verifying Transaction...';
        
        setTimeout(() => {
          overlay.remove();
          
          // Persist subscription in DB
          Database.setSubscription(planId, billingCycle);
          
          // Redirect to success
          const mockPaymentId = 'txn_manual_' + Math.random().toString(36).substring(2, 14);
          window.location.hash = `#payment-success?plan=${planId}&cycle=${billingCycle}&payment_id=${mockPaymentId}`;
          
          window.showToast?.('Manual payment receipt verified. Welcome!', 'success');
        }, 1500);
      }, 1500);
    });
  },

  /**
   * Simulates a checkout overlay during Demo Mode.
   * 
   * @private
   */
  _simulateDemoCheckout(planId, billingCycle) {
    const planLabel = PLAN_LABELS[planId] || planId;
    const cycleLabel = CYCLE_LABELS[billingCycle] || billingCycle;

    const overlay = document.createElement('div');
    overlay.id = 'stripe-demo-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Processing payment');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFFFFF;
        border-radius: 24px;
        padding: 48px 40px;
        max-width: 420px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1);
        transform: scale(0.92);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      " id="stripe-demo-card">

        <div style="
          width: 64px; height: 64px;
          border: 4px solid #E2E8F0;
          border-top-color: #1396e2;
          border-radius: 50%;
          margin: 0 auto 28px;
          animation: stripe-spin 0.8s linear infinite;
        "></div>

        <h3 style="
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 6px;
        ">Processing Payment…</h3>

        <p style="
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #64748B;
          margin: 0 0 24px;
          line-height: 1.5;
        ">
          <strong style="color:#334155;">${planLabel}</strong> · ${cycleLabel}
        </p>

        <div style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFF8E1;
          border: 1px solid #FFE082;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #F59E0B;
        ">
          <span>🧪</span> Demo Mode — No real charges
        </div>
      </div>

      <style>
        @keyframes stripe-spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const card = overlay.querySelector('#stripe-demo-card');
      if (card) {
        card.style.transform = 'scale(1)';
        card.style.opacity = '1';
      }
    });

    setTimeout(() => {
      // Persist in DB
      Database.setSubscription(planId, billingCycle);
      
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        window.location.hash = `#payment-success?plan=${planId}&cycle=${billingCycle}`;
      }, 300);
    }, 2200);
  }
};

export { CheckoutCoordinator };
