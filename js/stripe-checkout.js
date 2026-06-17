/**
 * Stripe Checkout Module for Aspire Education PTE Platform
 */

import { Database } from './db.js?v=33';

const PLAN_PRICES = {
  pro_monthly: 'price_pro_monthly_placeholder',
  pro_yearly: 'price_pro_yearly_placeholder',
  elite_monthly: 'price_elite_monthly_placeholder',
  elite_yearly: 'price_elite_yearly_placeholder'
};

const StripeCheckout = {
  stripeInstance: null,
  publishableKey: null,
  priceIds: PLAN_PRICES,

  async init() {
    this.publishableKey = localStorage.getItem('stripe_publishable_key');

    // Load price IDs overrides from storage
    Object.keys(this.priceIds).forEach(key => {
      const override = localStorage.getItem(`stripe_price_${key}`);
      if (override) this.priceIds[key] = override;
    });

    if (this.publishableKey && typeof window.Stripe === 'function') {
      try {
        this.stripeInstance = window.Stripe(this.publishableKey);
        console.log('[Stripe] Initialized Stripe Checkout');
      } catch (err) {
        console.warn('[Stripe] Failed to initialize Stripe.js:', err);
        this.stripeInstance = null;
      }
    }
  },

  async checkout(planId, billingCycle) {
    const priceKey = `${planId}_${billingCycle}`;
    const priceId = this.priceIds[priceKey];

    if (!this.stripeInstance || !priceId || priceId.includes('placeholder')) {
      console.warn('[Stripe] Stripe is not configured properly. Falling back to Demo Mode.');
      // Fallback checkout simulation via CheckoutCoordinator
      const { CheckoutCoordinator } = await import('./checkout-coordinator.js?v=33');
      return CheckoutCoordinator._simulateDemoCheckout(planId, billingCycle);
    }

    try {
      const secretKey = localStorage.getItem('stripe_secret_key') || '';
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-stripe-secret-key': secretKey
        },
        body: JSON.stringify({
          priceId: priceId,
          plan: planId,
          cycle: billingCycle
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('[Stripe] Checkout error:', err);
      window.showToast?.('Stripe error: ' + err.message, 'error');
    }
  }
};

export { StripeCheckout };
