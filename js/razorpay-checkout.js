/**
 * Razorpay Checkout Module for Aspire Education PTE Platform
 * 
 * Provides a unified checkout interface that:
 *  - Uses real Razorpay Checkout when a Key ID is configured
 *  - Integrates with the backend for secure order creation if Secret Key is set
 *  - Falls back to a beautiful Razorpay Simulation Modal when no keys are configured
 *  - Persists subscription state using the Database module
 */

import { Database } from './db.js?v=11';

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

const RazorpayCheckout = {
  /** @type {string | null} Razorpay Key ID */
  keyId: null,

  /**
   * Initialize Razorpay configurations.
   */
  async init() {
    this.keyId = localStorage.getItem('stripe_publishable_key') || localStorage.getItem('razorpay_key_id') || null;
    
    // Auto-migrate old Stripe key settings to Razorpay if they start with rzp
    if (this.keyId && this.keyId.startsWith('rzp_')) {
      localStorage.setItem('razorpay_key_id', this.keyId);
    } else {
      this.keyId = localStorage.getItem('razorpay_key_id') || null;
    }
  },

  /**
   * Start checkout flow for a plan.
   * 
   * @param {string} planId - 'pro' or 'elite'
   * @param {string} billingCycle - 'monthly' or 'yearly'
   */
  async checkout(planId, billingCycle) {
    const priceKey = `${planId}_${billingCycle}`;
    const amount = PLAN_PRICES[priceKey] || 0;
    
    if (!this.keyId || this.keyId.trim() === '') {
      console.log(`[Razorpay Demo] Simulating Razorpay checkout for ${priceKey}`);
      return this._simulateRazorpayCheckout(planId, billingCycle, amount);
    }

    const user = Database.getUser() || { name: 'PTE Scholar', email: 'scholar@aspirepte.ai' };
    const planLabel = PLAN_LABELS[planId] || planId;
    const cycleLabel = CYCLE_LABELS[billingCycle] || billingCycle;

    // Show loading spinner
    window.showToast?.('Opening secure payment gateway...', 'info');

    // ── Check if we should call backend to create a secure Razorpay Order ──
    let orderId = null;
    const secretKey = localStorage.getItem('stripe_secret_key') || localStorage.getItem('razorpay_secret_key') || '';
    
    if (secretKey && secretKey.trim() !== '') {
      try {
        const response = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-secret-key': secretKey
          },
          body: JSON.stringify({
            amount: amount,
            plan: planId,
            cycle: billingCycle
          })
        });

        const result = await response.json();
        if (response.ok && result.id) {
          orderId = result.id;
        } else {
          console.warn('[Razorpay] Backend order creation failed, falling back to client-only mode:', result.error);
        }
      } catch (err) {
        console.error('[Razorpay] Error creating order via backend:', err);
      }
    }

    // ── Open Razorpay Standard Checkout Modal ──
    const options = {
      key: this.keyId,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "Aspire Education",
      description: `${planLabel} - ${cycleLabel} Subscription`,
      image: "assets/logo.png",
      order_id: orderId,
      handler: async (response) => {
        // Payment successful
        console.log('[Razorpay] Payment Success Response:', response);
        
        // Optional backend signature verification
        let verified = true;
        if (orderId && secretKey) {
          try {
            const verifyResp = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-razorpay-secret-key': secretKey
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyResult = await verifyResp.json();
            verified = verifyResp.ok && verifyResult.status === 'ok';
            if (!verified) {
              window.showToast?.('Payment verification failed: signature mismatch.', 'error');
              return;
            }
          } catch (e) {
            console.error('[Razorpay] Error verifying payment:', e);
          }
        }

        if (verified) {
          // Persist subscription in DB
          Database.setSubscription(planId, billingCycle);
          window.location.hash = `#payment-success?plan=${planId}&cycle=${billingCycle}&payment_id=${response.razorpay_payment_id}`;
        }
      },
      modal: {
        ondismiss: () => {
          console.log('[Razorpay] Checkout modal dismissed by user');
          window.location.hash = '#payment-cancel';
        }
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: {
        color: "#1396e2"
      }
    };

    try {
      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK not loaded. Check script injection.');
      }
    } catch (err) {
      console.error('[Razorpay] Failed to open Checkout:', err);
      window.showToast?.('Razorpay initialization failed. Running in demo mode instead.', 'warning');
      return this._simulateRazorpayCheckout(planId, billingCycle, amount);
    }
  },

  /**
   * Beautiful simulated Razorpay Checkout overlay dialog.
   * 
   * @private
   */
  _simulateRazorpayCheckout(planId, billingCycle, amount) {
    const planLabel = PLAN_LABELS[planId] || planId;
    const cycleLabel = CYCLE_LABELS[billingCycle] || billingCycle;
    const user = Database.getUser() || { name: 'PTE Scholar', email: 'scholar@aspirepte.ai' };

    // Build Razorpay Mock Modal
    const overlay = document.createElement('div');
    overlay.id = 'razorpay-mock-modal';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(4px);
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff;
        width: 100%;
        max-width: 400px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        overflow: hidden;
        animation: rzpModalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      " id="rzp-card">
        
        <!-- Header -->
        <div style="background: #1e2530; color: #fff; padding: 24px; position: relative;">
          <button id="rzp-close-btn" style="
            position: absolute; right: 16px; top: 16px;
            background: none; border: none; color: #a0aec0;
            font-size: 24px; cursor: pointer; line-height: 1;
          ">&times;</button>
          
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="
              width: 40px; height: 40px; border-radius: 6px;
              background: #1396e2; display: flex; align-items: center;
              justify-content: center; font-size: 20px; font-weight: bold;
            ">🎓</div>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:600; font-family:'Outfit',sans-serif;">Aspire Education</h3>
              <p style="margin:2px 0 0 0; font-size:12px; color:#a0aec0;">${planLabel} - ${cycleLabel}</p>
            </div>
          </div>
          <div style="margin-top: 18px; font-size: 22px; font-weight: 700; font-family:'Outfit',sans-serif;">
            ₹${amount.toLocaleString('en-IN')}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display:flex; flex-direction:column; gap:16px;">
          
          <!--Prefills info-->
          <div style="font-size: 13px; color: #4a5568; background:#f7fafc; padding:12px; border-radius:6px; border:1px solid #edf2f7;">
            <div><strong>Prefill Details:</strong></div>
            <div style="margin-top:4px;">${user.name} (${user.email})</div>
          </div>

          <!-- Mode Banner -->
          <div style="
            background: #feebc8; border: 1px solid #fbd38d; color: #c05621;
            padding: 10px 14px; border-radius: 8px; font-size: 13.5px;
            display: flex; gap: 8px; align-items: center;
          ">
            <span>🧪</span>
            <strong>Razorpay Test Mode</strong>
          </div>

          <!-- Payment Methods Options -->
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:6px;">
            <button class="rzp-pay-method" data-method="upi" style="
              display: flex; align-items: center; justify-content: space-between;
              padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0;
              background: #fff; cursor: pointer; text-align: left; transition: all 0.2s;
            ">
              <span style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color:#2d3748;">
                <span>📱</span> UPI / QR Code (Google Pay, PhonePe)
              </span>
              <span style="font-size:12px; color:#1396e2; font-weight:700;">PAY NOW</span>
            </button>

            <button class="rzp-pay-method" data-method="card" style="
              display: flex; align-items: center; justify-content: space-between;
              padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0;
              background: #fff; cursor: pointer; text-align: left; transition: all 0.2s;
            ">
              <span style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color:#2d3748;">
                <span>💳</span> Credit / Debit Card
              </span>
              <span style="font-size:12px; color:#1396e2; font-weight:700;">PAY NOW</span>
            </button>

            <button class="rzp-pay-method" data-method="netbanking" style="
              display: flex; align-items: center; justify-content: space-between;
              padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0;
              background: #fff; cursor: pointer; text-align: left; transition: all 0.2s;
            ">
              <span style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600; color:#2d3748;">
                <span>🏦</span> Net Banking
              </span>
              <span style="font-size:12px; color:#1396e2; font-weight:700;">PAY NOW</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f7fafc; padding:16px; text-align:center; border-top:1px solid #edf2f7; font-size:11px; color:#a0aec0; display:flex; align-items:center; justify-content:center; gap:4px;">
          🛡️ Secured by Razorpay checkout engine (Simulated)
        </div>
      </div>

      <style>
        @keyframes rzpModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .rzp-pay-method:hover {
          border-color: #1396e2 !important;
          background: rgba(19, 150, 226, 0.02) !important;
          transform: translateY(-1px);
        }
      </style>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#rzp-close-btn');
    const dismiss = () => {
      overlay.remove();
      window.location.hash = '#payment-cancel';
    };
    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    const payMethods = overlay.querySelectorAll('.rzp-pay-method');
    payMethods.forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.getAttribute('data-method');
        btn.disabled = true;
        btn.textContent = 'Processing Payment...';
        btn.style.opacity = '0.7';

        // Simulate short gateway processing wait
        setTimeout(() => {
          overlay.remove();
          // Persist sub state
          Database.setSubscription(planId, billingCycle);
          const paymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 14);
          window.location.hash = `#payment-success?plan=${planId}&cycle=${billingCycle}&payment_id=${paymentId}`;
        }, 1500);
      });
    });
  }
};

export { RazorpayCheckout };
