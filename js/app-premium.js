/* FluentAI Main Application Coordinator & Entrypoint */

import { Database } from './db.js?v=37';
import { Router } from './router.js?v=37';
import { Tutor } from './components/tutor.js?v=37';
import { RazorpayCheckout } from './razorpay-checkout.js?v=37';

// Page Views
import { renderLanding } from './pages/landing.js?v=37';
import { renderDashboard } from './pages/dashboard.js?v=37';
import { renderFaculty } from './pages/faculty.js?v=37';
import { renderPractice } from './pages/practice-premium.js?v=37';
import { renderMockTest } from './pages/mocktest.js?v=37';
import { renderScoring } from './pages/scoring.js?v=37';
import { renderProfile } from './pages/profile.js?v=37';
import { renderPricing } from './pages/pricing.js?v=37';
import { renderPaymentSuccess, renderPaymentCancel } from './pages/payment-status.js?v=37';

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

let lastSyncTime = 0;
async function syncServerSession(force = false) {
  const now = Date.now();
  if (!force && now - lastSyncTime < 10000) {
    return;
  }
  lastSyncTime = now;

  const user = Database.getUser();
  if (!user || !user.authenticated) return;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout for quick page load
  
  try {
    const res = await fetch('/api/accounts', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const serverAccounts = await res.json();
      if (Array.isArray(serverAccounts)) {
        localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
        const email = user.email.toLowerCase().trim();
        const match = serverAccounts.find(a => a.email.toLowerCase() === email);
        if (match) {
          const updatedUser = {
            name: match.name,
            email: match.email,
            avatar: match.avatar || user.avatar || null,
            authenticated: true,
            role: match.role || 'student',
            faculty_code: match.faculty_code || null,
            linked_faculty_id: match.linked_faculty_id || null
          };
          
          const oldProgressStr = localStorage.getItem(`fluentai_progress_${email}`);
          const oldUserStr = localStorage.getItem("fluentai_user");
          const newProgressStr = JSON.stringify(match.progress);
          const newUserStr = JSON.stringify(updatedUser);
          
          if (oldProgressStr !== newProgressStr || oldUserStr !== newUserStr) {
            localStorage.setItem("fluentai_user", newUserStr);
            if (match.progress) {
              localStorage.setItem(`fluentai_progress_${email}`, newProgressStr);
              localStorage.setItem("fluentai_progress", newProgressStr);
            }
            
            if (Router.currentRoute === 'dashboard' || Router.currentRoute === 'faculty') {
              Router.handleRouting();
            }
          }
        }
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("Failed to sync server session (offline or timeout)", err);
  }
}
window.syncServerSession = syncServerSession;

document.addEventListener('DOMContentLoaded', async () => {
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

  // Sync server session before routing so that pages load with the latest data
  await syncServerSession();

  // 2. Initialize Routing configuration
  Router.init({
    landing: renderLanding,
    dashboard: renderDashboard,
    faculty: renderFaculty,
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
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('onboarding-firstname').value.trim();
      const surname = document.getElementById('onboarding-surname').value.trim();
      const fullName = `${firstName} ${surname}`.trim();
      
      const temp = window.tempRegistrationDetails || {};
      const role = document.getElementById('onboarding-role') ? document.getElementById('onboarding-role').value : (temp.role || 'student');
      const targetScore = role === 'faculty' ? 90 : parseInt(document.getElementById('onboarding-target').value);
      const examDate = role === 'faculty' ? '' : document.getElementById('onboarding-month').value;
      const facultyId = role === 'student' ? (document.getElementById('onboarding-faculty-id') ? document.getElementById('onboarding-faculty-id').value.trim().toUpperCase() : (temp.facultyId || '')) : '';
      
      const email = temp.email || 'user@example.com';
      
      // Validate faculty ID in onboarding if student links one
      if (role === 'student' && facultyId) {
        let accounts = Database.getAccounts();
        try {
          const res = await fetch('/api/accounts');
          if (res.ok) {
            const serverAccounts = await res.json();
            if (Array.isArray(serverAccounts)) {
              localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
              accounts = serverAccounts;
            }
          }
        } catch (err) {
          console.error("Failed to sync accounts during onboarding validation", err);
        }
        const facultyExists = accounts.some(a => a.role === 'faculty' && a.faculty_code === facultyId);
        if (!facultyExists) {
          window.showToast("Faculty ID not found. Please verify the code or clear it.", "error");
          return;
        }
      }

      let facultyCode = null;
      if (role === 'faculty') {
        facultyCode = 'FAC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      }
      
      // Setup progress profile
      const progressProfile = {
        streak: 0,
        points: 0,
        targetScore,
        targetSpeaking: targetScore,
        targetWriting: targetScore,
        targetReading: targetScore,
        targetListening: targetScore,
        examDate,
        scoreHistory: [],
        completedTasks: [],
        unclearedTasks: [],
        tutorHistory: role === 'faculty'
          ? [ { sender: "tutor", text: `Welcome to Aspire Faculty Room, Coach ${firstName}! Here you can monitor your students' practice telemetry and mistake patterns.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } ]
          : [ { sender: "tutor", text: `Welcome to Aspire, ${firstName}! I'm your AI PTE trainer. Let's start practicing to hit your target of PTE ${targetScore}!`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } ]
      };
      
      // Save the account
      Database.saveAccount({
        name: fullName,
        email: email,
        password: temp.password || '',
        avatar: temp.avatar || null,
        progress: progressProfile,
        role: role,
        faculty_code: facultyCode,
        linked_faculty_id: role === 'student' ? facultyId : null
      });
      
      // Authenticate user
      Database.updateUser({
        name: fullName,
        email: email,
        avatar: temp.avatar || null,
        authenticated: true,
        role: role,
        faculty_code: facultyCode,
        linked_faculty_id: role === 'student' ? facultyId : null
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
      window.location.hash = role === 'faculty' ? '#faculty' : '#dashboard';
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
    const user = Database.getUser();
    if (user && user.role === 'faculty') {
      badge.textContent = "Faculty Account";
      badge.style.color = "var(--accent)";
    } else {
      const sub = Database.getSubscription();
      const planInfo = Database.getPlanInfo(sub.plan);
      badge.textContent = planInfo.badge;
      badge.style.color = planInfo.color;
    }
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

  // Login form role toggles
  const loginRoleStudentBtn = document.getElementById('login-role-student-btn');
  const loginRoleFacultyBtn = document.getElementById('login-role-faculty-btn');
  const loginRoleInput = document.getElementById('login-role');

  if (loginRoleStudentBtn && loginRoleFacultyBtn && loginRoleInput) {
    const setLoginRole = (role) => {
      loginRoleInput.value = role;
      if (role === 'student') {
        loginRoleStudentBtn.classList.add('active');
        loginRoleFacultyBtn.classList.remove('active');
      } else {
        loginRoleFacultyBtn.classList.add('active');
        loginRoleStudentBtn.classList.remove('active');
      }
    };
    
    loginRoleStudentBtn.addEventListener('click', () => setLoginRole('student'));
    loginRoleFacultyBtn.addEventListener('click', () => setLoginRole('faculty'));
  }

  // Registration Multi-Step Logic
  const chooseStudentRoleCard = document.getElementById('choose-student-role-card');
  const chooseFacultyRoleCard = document.getElementById('choose-faculty-role-card');
  const registerRoleStep = document.getElementById('register-role-step');
  const registerFormStep = document.getElementById('register-form-step');
  const registerRoleInput = document.getElementById('register-role');
  const registerStudentFields = document.getElementById('register-student-fields');
  const registerModalTitle = document.getElementById('register-modal-title');
  const registerModalSubtitle = document.getElementById('register-modal-subtitle');
  const registerBackToRoles = document.getElementById('register-back-to-roles');

  const transitionToRegisterForm = (role) => {
    if (registerRoleInput) registerRoleInput.value = role;
    
    // Hide Step 1, Show Step 2
    if (registerRoleStep) registerRoleStep.classList.add('hidden');
    if (registerFormStep) registerFormStep.classList.remove('hidden');
    
    if (role === 'student') {
      if (registerStudentFields) registerStudentFields.classList.remove('hidden');
      if (registerModalTitle) registerModalTitle.textContent = "Create Student Account";
      if (registerModalSubtitle) registerModalSubtitle.textContent = "Unlock AI grades and progress metrics";
      // Update form required attributes for student fields
      const targetSelect = document.getElementById('register-target');
      if (targetSelect) targetSelect.required = true;
    } else {
      if (registerStudentFields) registerStudentFields.classList.add('hidden');
      if (registerModalTitle) registerModalTitle.textContent = "Create Faculty Account";
      if (registerModalSubtitle) registerModalSubtitle.textContent = "Configure your teaching credentials and details";
      // Update form required attributes
      const targetSelect = document.getElementById('register-target');
      if (targetSelect) targetSelect.required = false;
    }
    
    // Refresh Google button state
    renderOfficialGoogleButtons();
  };

  if (chooseStudentRoleCard) {
    chooseStudentRoleCard.addEventListener('click', () => transitionToRegisterForm('student'));
  }
  if (chooseFacultyRoleCard) {
    chooseFacultyRoleCard.addEventListener('click', () => transitionToRegisterForm('faculty'));
  }
  if (registerBackToRoles) {
    registerBackToRoles.addEventListener('click', (e) => {
      e.preventDefault();
      if (registerRoleStep) registerRoleStep.classList.remove('hidden');
      if (registerFormStep) registerFormStep.classList.add('hidden');
      if (registerModalTitle) registerModalTitle.textContent = "Join Aspire PTE";
      if (registerModalSubtitle) registerModalSubtitle.textContent = "Choose your account type to get started";
    });
  }

  // Onboarding role selectors
  const onboardingRoleStudentBtn = document.getElementById('onboarding-role-student-btn');
  const onboardingRoleFacultyBtn = document.getElementById('onboarding-role-faculty-btn');
  const onboardingRoleInput = document.getElementById('onboarding-role');
  const onboardingTargetGroup = document.getElementById('onboarding-target-group');
  const onboardingMonthGroup = document.getElementById('onboarding-month-group');
  const onboardingFacultyIdGroup = document.getElementById('onboarding-faculty-id-group');

  const setOnboardingRole = (role) => {
    if (!onboardingRoleInput) return;
    onboardingRoleInput.value = role;
    if (role === 'student') {
      if (onboardingRoleStudentBtn) onboardingRoleStudentBtn.classList.add('active');
      if (onboardingRoleFacultyBtn) onboardingRoleFacultyBtn.classList.remove('active');
      if (onboardingTargetGroup) onboardingTargetGroup.style.display = 'block';
      if (onboardingMonthGroup) onboardingMonthGroup.style.display = 'block';
      if (onboardingFacultyIdGroup) onboardingFacultyIdGroup.style.display = 'block';
    } else {
      if (onboardingRoleFacultyBtn) onboardingRoleFacultyBtn.classList.add('active');
      if (onboardingRoleStudentBtn) onboardingRoleStudentBtn.classList.remove('active');
      if (onboardingTargetGroup) onboardingTargetGroup.style.display = 'none';
      if (onboardingMonthGroup) onboardingMonthGroup.style.display = 'none';
      if (onboardingFacultyIdGroup) onboardingFacultyIdGroup.style.display = 'none';
    }
  };

  if (onboardingRoleStudentBtn && onboardingRoleFacultyBtn) {
    onboardingRoleStudentBtn.addEventListener('click', () => setOnboardingRole('student'));
    onboardingRoleFacultyBtn.addEventListener('click', () => setOnboardingRole('faculty'));
  }
  
  window.setOnboardingRole = setOnboardingRole;

  const showOnboardingModal = () => {
    const temp = window.tempRegistrationDetails || {};
    const user = Database.getUser() || {};
    const role = temp.role || user.role || 'student';

    const onboardingModal = document.getElementById('onboarding-modal');
    overlay.classList.remove('hidden');
    if (onboardingModal) onboardingModal.classList.remove('hidden');
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');

    const roleInput = document.getElementById('onboarding-role');
    if (roleInput) roleInput.value = role;

    const roleGroup = document.getElementById('onboarding-role-group');
    if (roleGroup) roleGroup.style.display = 'none';

    const title = document.getElementById('onboarding-modal-title');
    const subtitle = document.getElementById('onboarding-modal-subtitle');
    const targetGroup = document.getElementById('onboarding-target-group');
    const monthGroup = document.getElementById('onboarding-month-group');
    const facultyIdGroup = document.getElementById('onboarding-faculty-id-group');

    if (role === 'faculty') {
      if (title) title.textContent = "Complete Faculty Profile Setup";
      if (subtitle) subtitle.textContent = "Configure your teaching credentials and details";
      if (targetGroup) targetGroup.style.display = 'none';
      if (monthGroup) monthGroup.style.display = 'none';
      if (facultyIdGroup) facultyIdGroup.style.display = 'none';
    } else {
      if (title) title.textContent = "Complete Student Profile Setup";
      if (subtitle) subtitle.textContent = "Configure your target scores and test timeline";
      if (targetGroup) targetGroup.style.display = 'block';
      if (monthGroup) monthGroup.style.display = 'block';
      if (facultyIdGroup) facultyIdGroup.style.display = 'block';
    }

    populateOnboardingMonths();
  };
  window.showOnboardingModal = showOnboardingModal;

  const showModal = (modalToShow) => {
    try {
      console.log("showModal called with:", modalToShow);
      console.log("overlay:", overlay);
      console.log("loginModal:", loginModal);
      console.log("registerModal:", registerModal);
      
      if (overlay) overlay.classList.remove('hidden');
      const onboardingModal = document.getElementById('onboarding-modal');
      if (onboardingModal) onboardingModal.classList.add('hidden');
      
      if (modalToShow === 'login') {
        if (loginModal) {
          loginModal.classList.remove('hidden');
        } else {
          console.error("loginModal is null!");
        }
        if (registerModal) {
          registerModal.classList.add('hidden');
        }
      } else {
        if (registerModal) {
          registerModal.classList.remove('hidden');
        } else {
          console.error("registerModal is null!");
        }
        if (loginModal) {
          loginModal.classList.add('hidden');
        }
        
        // Reset registration modal to Step 1 (Role Selection) on open
        if (registerRoleStep) registerRoleStep.classList.remove('hidden');
        if (registerFormStep) registerFormStep.classList.add('hidden');
        if (registerModalTitle) registerModalTitle.textContent = "Join Aspire PTE";
        if (registerModalSubtitle) registerModalSubtitle.textContent = "Choose your account type to get started";
      }
      // Refresh Google Sign-In button state when modal is displayed
      renderOfficialGoogleButtons();
    } catch (err) {
      console.error("Exception in showModal:", err);
      alert("Error opening modal: " + err.message + "\n" + err.stack);
    }
  };

  const hideModal = () => {
    overlay.classList.add('hidden');
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    const onboardingModal = document.getElementById('onboarding-modal');
    if (onboardingModal) onboardingModal.classList.add('hidden');
  };

  if (openLoginBtn) openLoginBtn.addEventListener('click', () => showModal('login'));
  if (openRegisterBtn) openRegisterBtn.addEventListener('click', () => showModal('register'));
  closeBtns.forEach(btn => btn.addEventListener('click', hideModal));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });

  const toLoginLinks = document.querySelectorAll('.to-login-btn-link');
  toLoginLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showModal('login');
    });
  });
  if (toRegisterLink) toRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showModal('register'); });


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
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    
    let accounts = Database.getAccounts();
    let account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (!account) {
      try {
        const res = await fetch('/api/accounts');
        const serverAccounts = await res.json();
        if (Array.isArray(serverAccounts)) {
          localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
          accounts = serverAccounts;
          account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to sync accounts during login check", err);
      }
    }
    
    if (account) {
      if (account.password === password) {
        // Self-healing: if the user account role in database does not match the active role selected in the UI
        const activeRole = loginRoleInput ? loginRoleInput.value : 'student';
        if (account.role !== activeRole) {
          account.role = activeRole;
          if (activeRole === 'faculty') {
            if (!account.faculty_code) {
              account.faculty_code = 'FAC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            }
            account.linked_faculty_id = null;
            if (!account.progress || !account.progress.tutorHistory) {
              account.progress = {
                streak: 0,
                points: 0,
                targetScore: 90,
                targetSpeaking: 90,
                targetWriting: 90,
                targetReading: 90,
                targetListening: 90,
                examDate: '',
                scoreHistory: [],
                completedTasks: [],
                unclearedTasks: [],
                tutorHistory: [ { sender: "tutor", text: `Welcome to Aspire Faculty Room! Here you can monitor your students' practice telemetry and mistake patterns.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } ]
              };
            } else {
              account.progress.examDate = '';
              account.progress.targetScore = 90;
            }
          } else {
            account.faculty_code = null;
            if (!account.progress) {
              account.progress = {
                streak: 0,
                points: 0,
                targetScore: 79,
                targetSpeaking: 79,
                targetWriting: 79,
                targetReading: 79,
                targetListening: 79,
                examDate: '',
                scoreHistory: [],
                completedTasks: [],
                unclearedTasks: [],
                tutorHistory: []
              };
            }
          }
          Database.saveAccount(account);
        }

        Database.updateUser({
          name: account.name,
          email: account.email,
          avatar: account.avatar || null,
          authenticated: true,
          role: account.role || 'student',
          faculty_code: account.faculty_code || null,
          linked_faculty_id: account.linked_faculty_id || null
        });
        if (account.progress) {
          Database.updateProgress(account.progress);
        }
        hideModal();
        window.location.hash = (account.role === 'faculty') ? '#faculty' : '#dashboard';
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


  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role') ? document.getElementById('register-role').value : 'student';
    const target = role === 'faculty' ? 90 : (document.getElementById('register-target') ? parseInt(document.getElementById('register-target').value) : 79);
    const facultyId = role === 'student' && document.getElementById('register-faculty-id') ? document.getElementById('register-faculty-id').value.trim().toUpperCase() : '';

    let accounts = Database.getAccounts();
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const serverAccounts = await res.json();
        if (Array.isArray(serverAccounts)) {
          localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
          accounts = serverAccounts;
        }
      }
    } catch (err) {
      console.error("Failed to sync accounts during registration validation", err);
    }

    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      window.showToast("Email address already registered. Please login instead.", "warning");
      return;
    }

    // Validate faculty code if student links one
    if (role === 'student' && facultyId) {
      const facultyExists = accounts.some(a => a.role === 'faculty' && a.faculty_code === facultyId);
      if (!facultyExists) {
        window.showToast("Faculty ID not found. Please verify the code or clear it.", "error");
        return;
      }
    }

    // Save registration details in temp state
    window.tempRegistrationDetails = {
      name,
      email,
      password,
      target,
      role,
      facultyId
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

    // Set role & prepopulate onboarding
    if (window.setOnboardingRole) {
      window.setOnboardingRole(role);
    }
    const onboardingFacultyIdInput = document.getElementById('onboarding-faculty-id');
    if (onboardingFacultyIdInput) onboardingFacultyIdInput.value = facultyId;

    // Hide register modal and open onboarding modal
    showOnboardingModal();
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
  window.handleGoogleCredentialResponse = async function(response) {
    const payload = parseJwt(response.credential);
    if (payload) {
      const email = payload.email.toLowerCase().trim();
      let accounts = Database.getAccounts();
      let account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      
      if (!account) {
        try {
          const res = await fetch('/api/accounts');
          const serverAccounts = await res.json();
          if (Array.isArray(serverAccounts)) {
            localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
            accounts = serverAccounts;
            account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
          }
        } catch (err) {
          console.error("Failed to sync accounts during Google login check", err);
        }
      }
      
      // Google Login role check: determine active role based on visible step/tab
      const activeRole = !loginModal.classList.contains('hidden')
        ? (loginRoleInput ? loginRoleInput.value : 'student')
        : (document.getElementById('register-role') ? document.getElementById('register-role').value : 'student');

      if (account) {
        // Self-healing: if the user account role in database does not match the active role selected in the UI
        if (account.role !== activeRole) {
          account.role = activeRole;
          if (activeRole === 'faculty') {
            if (!account.faculty_code) {
              account.faculty_code = 'FAC-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            }
            account.linked_faculty_id = null;
            if (!account.progress || !account.progress.tutorHistory) {
              account.progress = {
                streak: 0,
                points: 0,
                targetScore: 90,
                targetSpeaking: 90,
                targetWriting: 90,
                targetReading: 90,
                targetListening: 90,
                examDate: '',
                scoreHistory: [],
                completedTasks: [],
                unclearedTasks: [],
                tutorHistory: [ { sender: "tutor", text: `Welcome to Aspire Faculty Room! Here you can monitor your students' practice telemetry and mistake patterns.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } ]
              };
            } else {
              account.progress.examDate = '';
              account.progress.targetScore = 90;
            }
          } else {
            account.faculty_code = null;
            if (!account.progress) {
              account.progress = {
                streak: 0,
                points: 0,
                targetScore: 79,
                targetSpeaking: 79,
                targetWriting: 79,
                targetReading: 79,
                targetListening: 79,
                examDate: '',
                scoreHistory: [],
                completedTasks: [],
                unclearedTasks: [],
                tutorHistory: []
              };
            }
          }
          Database.saveAccount(account);
        }

        // Existing user logs in
        Database.updateUser({
          name: account.name,
          email: account.email,
          avatar: payload.picture || account.avatar || null,
          authenticated: true,
          role: account.role || 'student',
          faculty_code: account.faculty_code || null,
          linked_faculty_id: account.linked_faculty_id || null
        });
        if (account.progress) {
          Database.updateProgress(account.progress);
        }
        hideModal();
        window.location.hash = (account.role === 'faculty') ? '#faculty' : '#dashboard';
        
        // Notify other components of auth updates
        document.dispatchEvent(new CustomEvent('auth-updated'));
        
        window.showToast(`Welcome back, ${account.name}!`, 'success');
      } else {
        // New Google user: go to the onboarding setup page
        window.tempRegistrationDetails = {
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          provider: 'google',
          role: activeRole // Use the active role from the UI selection!
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
        showOnboardingModal();
        if (window.setOnboardingRole) {
          window.setOnboardingRole(activeRole); // Onboard with the active role!
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
    if (user.role === 'faculty') {
      return; // Faculty accounts do not need student exam target onboarding
    }
    const progress = Database.getProgress();
    if (!progress.examDate) {
      if (window.showOnboardingModal) {
        window.showOnboardingModal();
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
