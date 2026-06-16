/* FluentAI Main Application Coordinator & Entrypoint */

import { Database } from './db.js?v=18';
import { Router } from './router.js?v=18';
import { Tutor } from './components/tutor.js?v=18';
import { RazorpayCheckout } from './razorpay-checkout.js?v=18';

// Page Views
import { renderLanding } from './pages/landing.js?v=18';
import { renderDashboard } from './pages/dashboard.js?v=18';
import { renderPractice } from './pages/practice-premium.js?v=18';
import { renderMockTest } from './pages/mocktest.js?v=18';
import { renderScoring } from './pages/scoring.js?v=18';
import { renderProfile } from './pages/profile.js?v=18';
import { renderPricing } from './pages/pricing.js?v=18';
import { renderPaymentSuccess, renderPaymentCancel } from './pages/payment-status.js?v=18';

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

  // 9. Onboarding Setup Form Handler
  const onboardingForm = document.getElementById('onboarding-form');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('onboarding-firstname').value.trim();
      const surname = document.getElementById('onboarding-surname').value.trim();
      const fullName = `${firstName} ${surname}`.trim();
      
      const targetScore = parseInt(document.getElementById('onboarding-target').value);
      const targetSpeaking = targetScore;
      const targetWriting = targetScore;
      const targetReading = targetScore;
      const targetListening = targetScore;
      const examDate = document.getElementById('onboarding-month').value;
      
      const temp = window.tempRegistrationDetails || {};
      const email = temp.email || 'user@example.com';
      
      // Setup progress profile
      const progressProfile = {
        streak: 0,
        points: 0,
        targetScore,
        targetSpeaking,
        targetWriting,
        targetReading,
        targetListening,
        examDate,
        scoreHistory: [],
        completedTasks: [],
        unclearedTasks: [],
        tutorHistory: [
          { sender: "tutor", text: `Welcome to Aspire, ${firstName}! I'm your AI PTE trainer. Let's start practicing to hit your target of PTE ${targetScore}!`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        ]
      };
      
      // Save the account
      Database.saveAccount({
        name: fullName,
        email: email,
        password: temp.password || '',
        avatar: temp.avatar || null,
        progress: progressProfile
      });
      
      // Authenticate user
      Database.updateUser({
        name: fullName,
        email: email,
        avatar: temp.avatar || null,
        authenticated: true
      });
      
      // Save progress
      Database.updateProgress(progressProfile);
      
      // Clean up temp details
      delete window.tempRegistrationDetails;
      
      const overlay = document.getElementById('auth-modal-overlay');
      const onboardingModal = document.getElementById('onboarding-modal');
      if (overlay) overlay.classList.add('hidden');
      if (onboardingModal) onboardingModal.classList.add('hidden');
      
      // Refresh user interfaces and navigate
      document.dispatchEvent(new CustomEvent('auth-updated'));
      Router.navigate('dashboard');
      Router.handleRouting();
      
      window.showToast(`Account successfully created for ${fullName}!`, "success");
    });
  }

  // 10. Check if onboarding is needed
  setTimeout(checkOnboarding, 500);
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

  // Password Strength Real-time Feedback
  const registerPasswordInput = document.getElementById('register-password');
  const strengthWrapper = document.getElementById('password-strength-wrapper');
  const strengthBarFill = document.getElementById('strength-bar-fill');
  const strengthText = document.getElementById('strength-text');

  if (registerPasswordInput && strengthWrapper && strengthBarFill && strengthText) {
    registerPasswordInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val) {
        strengthWrapper.style.display = 'none';
        return;
      }
      
      strengthWrapper.style.display = 'block';
      
      let score = 0;
      if (val.length >= 8) score++;
      if (/[a-z]/.test(val)) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      
      if (val.length < 6) {
        strengthBarFill.style.width = '33%';
        strengthBarFill.style.background = '#ef4444'; // Red
        strengthText.textContent = 'Weak Password';
        strengthText.style.color = '#ef4444';
      } else if (score >= 4 && val.length >= 8) {
        strengthBarFill.style.width = '100%';
        strengthBarFill.style.background = '#10b981'; // Green
        strengthText.textContent = 'Strong Password';
        strengthText.style.color = '#10b981';
      } else {
        strengthBarFill.style.width = '66%';
        strengthBarFill.style.background = '#f97316'; // Orange
        strengthText.textContent = 'Medium Password';
        strengthText.style.color = '#f97316';
      }
    });
  }

  // Handle forms submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    const accounts = Database.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (account) {
      if (account.password === password) {
        Database.updateUser({
          name: account.name,
          email: account.email,
          avatar: account.avatar || null,
          authenticated: true
        });
        if (account.progress) {
          Database.updateProgress(account.progress);
        }
        hideModal();
        Router.navigate('dashboard');
        // Notify other components of auth updates
        document.dispatchEvent(new CustomEvent('auth-updated'));
        window.showToast(`Welcome back, ${account.name}!`, "success");
      } else {
        window.showToast("Incorrect ID or password. Please try again.", "error");
      }
    } else {
      window.showToast("Incorrect ID or password. Please try again.", "error");
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const target = parseInt(document.getElementById('register-target').value);

    const accounts = Database.getAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      window.showToast("Email address already registered. Please login instead.", "warning");
      return;
    }

    // Save registration details in temp state
    window.tempRegistrationDetails = {
      name,
      email,
      password,
      target
    };

    // Prepopulate name/surname in the onboarding form
    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';
    
    const firstInput = document.getElementById('onboarding-firstname');
    const surnameInput = document.getElementById('onboarding-surname');
    if (firstInput) firstInput.value = firstName;
    if (surnameInput) surnameInput.value = surname;
    
    const onboardingTarget = document.getElementById('onboarding-target');
    if (onboardingTarget) {
      onboardingTarget.value = target.toString();
      onboardingTarget.dispatchEvent(new Event('change'));
    }

    // Hide register modal and open onboarding modal
    const onboardingModal = document.getElementById('onboarding-modal');
    registerModal.classList.add('hidden');
    if (onboardingModal) {
      onboardingModal.classList.remove('hidden');
      populateOnboardingMonths();
    }
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
      const email = payload.email;
      const accounts = Database.getAccounts();
      const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      
      if (account) {
        // Existing user logs in
        Database.updateUser({
          name: account.name,
          email: account.email,
          avatar: payload.picture || account.avatar || null,
          authenticated: true
        });
        if (account.progress) {
          Database.updateProgress(account.progress);
        }
        hideModal();
        Router.navigate('dashboard');
        
        // Notify other components of auth updates
        document.dispatchEvent(new CustomEvent('auth-updated'));
        
        window.showToast(`Welcome back, ${account.name}!`, 'success');
      } else {
        // New Google user: go to the onboarding setup page
        window.tempRegistrationDetails = {
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          provider: 'google'
        };
        
        // Pre-fill name and surname
        const nameParts = payload.name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        
        const firstInput = document.getElementById('onboarding-firstname');
        const surnameInput = document.getElementById('onboarding-surname');
        if (firstInput) firstInput.value = firstName;
        if (surnameInput) surnameInput.value = surname;
        
        // Hide standard modals and open onboarding modal
        const onboardingModal = document.getElementById('onboarding-modal');
        loginModal.classList.add('hidden');
        registerModal.classList.add('hidden');
        
        if (onboardingModal) {
          onboardingModal.classList.remove('hidden');
          populateOnboardingMonths();
        }
        
        window.showToast("Google account authenticated. Please configure your target settings.", "info");
      }
    } else {
      window.showToast("Google Authentication failed.", 'error');
    }
  };

  const handleGoogleAuthAction = (e) => {
    e.preventDefault();
    window.showToast("Google Sign-In is initializing. Please click the official Google button above.", "warning");
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

    // Collapse sidebar on nav link click
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link, .nav-link-cockpit-glass, .btn-logout')) {
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
    { title: "Streak alert: Keep up the daily practice!", time: "2 days ago", unread: false }
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

function checkOnboarding() {
  const user = Database.getUser();
  if (user && user.authenticated) {
    const progress = Database.getProgress();
    if (!progress.examDate) {
      const overlay = document.getElementById('auth-modal-overlay');
      const onboardingModal = document.getElementById('onboarding-modal');
      const loginModal = document.getElementById('login-modal');
      const registerModal = document.getElementById('register-modal');
      
      if (overlay && onboardingModal) {
        overlay.classList.remove('hidden');
        onboardingModal.classList.remove('hidden');
        if (loginModal) loginModal.classList.add('hidden');
        if (registerModal) registerModal.classList.add('hidden');
        
        populateOnboardingMonths();
      }
    }
  }
}

function populateOnboardingMonths() {
  const monthSelect = document.getElementById('onboarding-month');
  if (!monthSelect) return;
  
  monthSelect.innerHTML = '';
  
  const currentDate = new Date();
  const options = { month: 'long', year: 'numeric' };
  
  for (let i = 0; i < 12; i++) {
    const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const dateString = futureDate.toLocaleDateString('en-US', options);
    const valDate = new Date(futureDate.getFullYear(), futureDate.getMonth(), 15);
    const valString = valDate.toISOString().split('T')[0];
    
    const option = document.createElement('option');
    option.value = valString;
    option.textContent = dateString;
    if (i === 1) {
      option.selected = true; // Default to next month
    }
    monthSelect.appendChild(option);
  }
}
