/* FluentAI Main Application Coordinator & Entrypoint */

import { Database } from './db.js?v=8';
import { Router } from './router.js?v=8';
import { Tutor } from './components/tutor.js?v=8';
import { RazorpayCheckout } from './razorpay-checkout.js?v=8';

// Page Views
import { renderLanding } from './pages/landing.js?v=8';
import { renderDashboard } from './pages/dashboard.js?v=8';
import { renderPractice } from './pages/practice-premium.js?v=8';
import { renderMockTest } from './pages/mocktest.js?v=8';
import { renderScoring } from './pages/scoring.js?v=8';
import { renderProfile } from './pages/profile.js?v=8';
import { renderPricing } from './pages/pricing.js?v=8';
import { renderPaymentSuccess, renderPaymentCancel } from './pages/payment-status.js?v=8';

// Global custom Toast utility
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-content">${message.replace(/\n/g, '<br>')}</div>
    <button class="toast-close">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    });
  };

  closeBtn.addEventListener('click', dismiss);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(dismiss, 3500);
};

document.addEventListener('DOMContentLoaded', () => {
  // Always force light theme permanently for brand alignment
  localStorage.setItem('aspire_theme', 'light');
  document.body.className = 'light-theme';

  // Reset the Google Client ID once to clear the old credential from the user's browser,
  // allowing them to configure a new one in the Profile settings.
  if (!localStorage.getItem('google_client_id_cleared_v1')) {
    localStorage.removeItem('google_client_id');
    localStorage.setItem('google_client_id_cleared_v1', 'true');
  }

  // 1. Initialize local mock database
  Database.init();

  // 2. Initialize Routing configuration
  Router.init({
    landing: renderLanding,
    dashboard: renderDashboard,
    practice: renderPractice,
    mocktest: renderMockTest,
    scoring: renderScoring,
    profile: renderProfile,
    pricing: renderPricing,
    'payment-success': renderPaymentSuccess,
    'payment-cancel': renderPaymentCancel
  });

  // 3. Initialize AI Tutor Chatbot
  Tutor.init();

  // 4. Bind Authentication UI Modals
  initAuthUI();

  // 5. Bind Layout Navigation & Dropdowns
  initLayoutUI();

  // 6. Initialize Razorpay Checkout (loads in demo mode if no key configured)
  RazorpayCheckout.init();

  // 7. Expose Database globally for Razorpay checkout module
  window.__appModules = { Database };

  // 8. Update sidebar subscription badge on load & subscription changes
  updateSidebarSubscriptionBadge();
  document.addEventListener('subscription-changed', updateSidebarSubscriptionBadge);
});

function updateSidebarSubscriptionBadge() {
  const badge = document.getElementById('user-tier-badge');
  if (badge) {
    const sub = Database.getSubscription();
    const planInfo = Database.getPlanInfo(sub.plan);
    badge.textContent = planInfo.badge;
    badge.style.color = planInfo.color;
  }
}

/* ==========================================================================
   AUTHENTICATION UI LOGIC
   ========================================================================== */
function initAuthUI() {
  const overlay = document.getElementById('auth-modal-overlay');
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');

  const openLoginBtn = document.getElementById('login-modal-open-btn');
  const openRegisterBtn = document.getElementById('register-modal-open-btn');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  const toRegisterLink = document.getElementById('to-register-btn');
  const toLoginLink = document.getElementById('to-login-btn');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const googleLoginBtn = document.getElementById('google-login-btn');
  const googleRegisterBtn = document.getElementById('google-register-btn');

  const showModal = (modalToShow) => {
    overlay.classList.remove('hidden');
    if (modalToShow === 'login') {
      loginModal.classList.remove('hidden');
      registerModal.classList.add('hidden');
    } else {
      registerModal.classList.remove('hidden');
      loginModal.classList.add('hidden');
    }
    // Refresh Google Sign-In button state when modal is displayed
    renderOfficialGoogleButtons();
  };

  const hideModal = () => {
    overlay.classList.add('hidden');
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
  };

  if (openLoginBtn) openLoginBtn.addEventListener('click', () => showModal('login'));
  if (openRegisterBtn) openRegisterBtn.addEventListener('click', () => showModal('register'));
  closeBtns.forEach(btn => btn.addEventListener('click', hideModal));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });

  if (toRegisterLink) toRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showModal('register'); });
  if (toLoginLink) toLoginLink.addEventListener('click', (e) => { e.preventDefault(); showModal('login'); });

  // Handle forms submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    
    // Log user in
    Database.updateUser({
      name: "Taksh Sharma",
      email: email,
      authenticated: true
    });
    
    hideModal();
    Router.navigate('dashboard');
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const target = parseInt(document.getElementById('register-target').value);

    // Create user profile
    Database.updateUser({
      name,
      email,
      authenticated: true
    });

    // Seed target settings
    const progress = Database.getProgress();
    progress.targetScore = target;
    Database.updateProgress(progress);

    hideModal();
    Router.navigate('dashboard');
  });

  // Google JWT Credential Decoder helper
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse Google JWT", e);
      return null;
    }
  }

  // Global Google credential handler
  window.handleGoogleCredentialResponse = function(response) {
    const payload = parseJwt(response.credential);
    if (payload) {
      Database.updateUser({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        authenticated: true
      });
      hideModal();
      Router.navigate('dashboard');
      
      // Notify other components of auth updates
      document.dispatchEvent(new CustomEvent('auth-updated'));
      
      window.showToast(`Welcome back, ${payload.given_name || payload.name}!`, 'success');
    } else {
      window.showToast("Google Authentication failed.", 'error');
    }
  };

  // Simulated fallback handler
  const runGoogleSimulation = () => {
    Database.updateUser({
      name: "Google Scholar",
      email: "scholar@gmail.com",
      authenticated: true
    });
    hideModal();
    Router.navigate('dashboard');
    document.dispatchEvent(new CustomEvent('auth-updated'));
    window.showToast("Welcome back, Google Scholar (Simulated)!", "success");
  };

  const handleGoogleAuthAction = (e) => {
    e.preventDefault();
    runGoogleSimulation();
  };

  if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuthAction);
  if (googleRegisterBtn) googleRegisterBtn.addEventListener('click', handleGoogleAuthAction);

  // Render official Google Buttons if Client ID is configured
  const renderOfficialGoogleButtons = () => {
    let googleClientId = localStorage.getItem('google_client_id');
    // Self-healing: if the saved ID is invalid (like a GitHub token), clear it
    if (googleClientId && (!googleClientId.endsWith('.apps.googleusercontent.com') || googleClientId.startsWith('ghp_'))) {
      localStorage.removeItem('google_client_id');
      googleClientId = null;
    }
    if (!googleClientId || googleClientId.trim() === "") {
      // Use your production Google Client ID as default
      googleClientId = "715659602623-in0muf5nr7pcebptds6ftnodoborro65.apps.googleusercontent.com";
    }
    const googleLoginContainer = document.getElementById('google-login-btn-container');
    const googleRegisterContainer = document.getElementById('google-register-btn-container');

    if (googleClientId && typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: window.handleGoogleCredentialResponse
        });

        if (googleLoginContainer) {
          googleLoginContainer.classList.remove('hidden');
          googleLoginContainer.style.display = 'block';
          if (googleLoginBtn) {
            googleLoginBtn.classList.add('hidden');
            googleLoginBtn.style.display = 'none';
          }
          google.accounts.id.renderButton(googleLoginContainer, {
            theme: "outline",
            size: "large",
            width: "320",
            text: "signin_with"
          });
        }

        if (googleRegisterContainer) {
          googleRegisterContainer.classList.remove('hidden');
          googleRegisterContainer.style.display = 'block';
          if (googleRegisterBtn) {
            googleRegisterBtn.classList.add('hidden');
            googleRegisterBtn.style.display = 'none';
          }
          google.accounts.id.renderButton(googleRegisterContainer, {
            theme: "outline",
            size: "large",
            width: "320",
            text: "signup_with"
          });
        }

        // Trigger One-Tap prompt automatically
        google.accounts.id.prompt();
      } catch (err) {
        console.error("Error rendering official Google buttons", err);
      }
    } else {
      // Clear containers and show fallback buttons
      if (googleLoginContainer) {
        googleLoginContainer.innerHTML = '';
        googleLoginContainer.classList.add('hidden');
        googleLoginContainer.style.display = 'none';
      }
      if (googleLoginBtn) {
        googleLoginBtn.classList.remove('hidden');
        googleLoginBtn.style.display = 'flex';
      }
      if (googleRegisterContainer) {
        googleRegisterContainer.innerHTML = '';
        googleRegisterContainer.classList.add('hidden');
        googleRegisterContainer.style.display = 'none';
      }
      if (googleRegisterBtn) {
        googleRegisterBtn.classList.remove('hidden');
        googleRegisterBtn.style.display = 'flex';
      }
    }
  };

  // Try to render when library is loaded
  const checkGoogleLoaded = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts) {
      renderOfficialGoogleButtons();
      clearInterval(checkGoogleLoaded);
    }
  }, 300);
  setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
}

/* ==========================================================================
   LAYOUT ACTIONS & DROPDOWNS
   ========================================================================== */
function initLayoutUI() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  // Sidebar toggle behavior with backdrop overlay
  if (menuToggle && sidebar) {
    const openSidebar = () => {
      sidebar.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
    };

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    // Close on click outside sidebar
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
        closeSidebar();
      }
    });

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSidebar();
      });
    }
  }

  // Header user menu dropdown toggle
  const userBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-menu-dropdown');

  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
      notificationMenu.classList.add('hidden'); // Close notifications if open
    });

    document.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
    });
  }

  // Header notifications dropdown toggle
  const notificationBtn = document.getElementById('notification-btn');
  const notificationMenu = document.getElementById('notification-menu');

  if (notificationBtn && notificationMenu) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationMenu.classList.toggle('hidden');
      userDropdown.classList.add('hidden'); // Close user menu if open
      
      // Hide badge-dot when read
      const dot = notificationBtn.querySelector('.badge-dot');
      if (dot) dot.classList.add('hidden');
    });

    document.addEventListener('click', () => {
      notificationMenu.classList.add('hidden');
    });
  }

  // Populate dynamic notifications
  populateNotifications();

  // Bind Logouts
  const logoutHandler = () => {
    Database.clearUserData();
    Router.navigate('landing');
  };

  const logoutBtn = document.getElementById('logout-btn');
  const menuLogoutBtn = document.getElementById('menu-logout-btn');

  if (logoutBtn) logoutBtn.addEventListener('click', logoutHandler);
  if (menuLogoutBtn) menuLogoutBtn.addEventListener('click', logoutHandler);

  // Theme Toggle (Dark / Light Mode)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  if (themeToggleBtn && sunIcon && moonIcon) {
    const savedTheme = localStorage.getItem('aspire_theme') || 'light';
    
    const applyTheme = (theme) => {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      } else {
        document.body.classList.remove('light-theme');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
    };

    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.body.classList.contains('light-theme');
      const nextTheme = isCurrentlyLight ? 'dark' : 'light';
      localStorage.setItem('aspire_theme', nextTheme);
      applyTheme(nextTheme);
    });
  }
}

function populateNotifications() {
  const list = document.getElementById('notifications-list');
  const clearBtn = document.getElementById('clear-notifications');
  if (!list) return;

  const notifications = [
    { title: "Weekly study schedule generated", time: "2 hours ago", unread: true },
    { title: "Speaking Read Aloud task graded: PTE 80", time: "1 day ago", unread: false },
    { title: "Streak alert: 5 days and counting!", time: "2 days ago", unread: false }
  ];

  const render = () => {
    list.innerHTML = notifications.map(notif => `
      <div class="notification-item ${notif.unread ? 'unread' : ''}">
        <span style="font-weight:600;">${notif.title}</span>
        <span class="notification-time">${notif.time}</span>
      </div>
    `).join('');
  };

  render();

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifications.length = 0;
      list.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12.5px;">No new notifications.</div>`;
      const dot = document.querySelector('#notification-btn .badge-dot');
      if (dot) dot.classList.add('hidden');
    });
  }
}
