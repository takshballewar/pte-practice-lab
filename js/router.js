/* FluentAI SPA Hash Router and Page Views Lifecycle Coordinator */

import { Database } from './db.js?v=11';

function generateInitialsSvg(name) {
  const initialsText = name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TS';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:%231396e2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(%23avatarGrad)" />
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">${initialsText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export const Router = {
  routes: {},
  currentRoute: null,

  init(routesConfig) {
    this.routes = routesConfig;
    
    // Bind hash change events
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Trigger initial routing on load
    this.handleRouting();
  },

  handleRouting() {
    let hash = window.location.hash.substring(1) || '';
    
    // Guard: Redirect authenticated users to dashboard if they land on root or landing page
    const user = Database.getUser();
    const isAuthenticated = user && user.authenticated;
    
    if (!hash || hash === 'landing') {
      if (isAuthenticated) {
        window.location.hash = '#dashboard';
        return;
      } else {
        hash = 'landing';
      }
    }
    
    // Support routing parameters (e.g. #scoring?type=speaking&id=SP-101)
    let params = {};
    if (hash.includes('?')) {
      const parts = hash.split('?');
      hash = parts[0];
      const queryStr = parts[1];
      const urlSearchParams = new URLSearchParams(queryStr);
      for (const [key, value] of urlSearchParams.entries()) {
        params[key] = value;
      }
    }

    // Resolve route function
    let routeHandler = this.routes[hash];
    
    // Guard Clause: Private routes require login
    if (hash !== 'landing' && hash !== 'pricing' && !isAuthenticated) {
      // Redirect to landing
      window.location.hash = '#landing';
      // Automatically trigger login dialog overlay after a small delay
      setTimeout(() => {
        const overlay = document.getElementById('auth-modal-overlay');
        const loginModal = document.getElementById('login-modal');
        if (overlay && loginModal) {
          overlay.classList.remove('hidden');
          loginModal.classList.remove('hidden');
        }
      }, 300);
      return;
    }

    // Toggle layout shell depending on route type
    const appContainer = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const authButtons = document.querySelector('.auth-buttons-wrapper');
    const userMenu = document.querySelector('.user-profile-menu-wrapper');
    const viewTitle = document.getElementById('view-title');
    const streakWidget = document.querySelector('.streak-widget');
    const pointsWidget = document.querySelector('.points-widget');
    const logoArea = document.querySelector('.mobile-logo-area');
    const menuToggle = document.getElementById('menu-toggle');

    // Auto collapse sidebar on navigation
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');

    if (hash === 'landing' || (hash === 'pricing' && !isAuthenticated)) {
      appContainer.classList.add('logged-out');
      appContainer.classList.remove('logged-in');
      sidebar.classList.add('hidden');
      authButtons.classList.remove('hidden');
      userMenu.classList.add('hidden');
      if (viewTitle) viewTitle.classList.add('hidden');
      if (streakWidget) streakWidget.classList.add('hidden');
      if (pointsWidget) pointsWidget.classList.add('hidden');
      if (logoArea) logoArea.style.display = 'flex';
      if (menuToggle) menuToggle.style.display = 'none';
    } else {
      appContainer.classList.remove('logged-out');
      appContainer.classList.add('logged-in');
      sidebar.classList.remove('hidden');
      authButtons.classList.add('hidden');
      userMenu.classList.remove('hidden');
      if (viewTitle) viewTitle.classList.remove('hidden');
      if (streakWidget) streakWidget.classList.remove('hidden');
      if (pointsWidget) pointsWidget.classList.remove('hidden');
      if (logoArea) logoArea.style.display = 'flex';
      if (menuToggle) menuToggle.style.display = 'flex';

      // Update sidebar nav active styling
      document.querySelectorAll('.sidebar-nav .nav-link, .sidebar-nav .nav-link-cockpit-glass').forEach(link => {
        const routeAttr = link.getAttribute('data-route');
        if (routeAttr === hash || (hash === 'practice' && routeAttr === 'practice') || (hash === 'scoring' && routeAttr === 'practice')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Update topbar user details
      const userProgress = Database.getProgress();
      const streakCount = document.getElementById('streak-count');
      const pointsCount = document.getElementById('points-count');
      if (streakCount) streakCount.textContent = userProgress.streak;
      if (pointsCount) pointsCount.textContent = userProgress.points;
      
      const initials = document.getElementById('user-initials');
      const displayName = document.getElementById('user-display-name');
      const menuName = document.getElementById('menu-user-name');
      const menuEmail = document.getElementById('menu-user-email');
      const userAvatarImg = document.getElementById('user-avatar-img');

      if (user) {
        if (initials) initials.textContent = user.name.split(' ').map(n=>n[0]).join('');
        if (displayName) displayName.textContent = user.name;
        if (menuName) menuName.textContent = user.name;
        if (menuEmail) menuEmail.textContent = user.email;
        if (userAvatarImg) {
          userAvatarImg.src = user.avatar || generateInitialsSvg(user.name);
        }
      }
    }

    // Set page header title
    if (viewTitle) {
      const titles = {
        dashboard: "Progress Dashboard",
        practice: "PTE Practice Lab",
        mocktest: "Mock Examination Arena",
        profile: "AI Study Cockpit",
        scoring: "AI Evaluation Analytics",
        pricing: "Subscription Plans",
        'payment-success': "Payment Successful",
        'payment-cancel': "Payment Cancelled"
      };
      viewTitle.textContent = titles[hash] || "Aspire AI Lab";
    }

    // Execute route component page render
    if (routeHandler) {
      this.currentRoute = hash;
      const viewport = document.getElementById('viewport');
      
      // Apply fade transition
      viewport.style.opacity = 0;
      
      setTimeout(() => {
        // Clear viewport
        viewport.innerHTML = '';
        
        // Execute render
        routeHandler(viewport, params);
        
        // Restore opacity
        viewport.style.opacity = 1;
        viewport.style.transition = 'opacity 0.25s ease';
      }, 150);
    } else {
      console.error(`Route hash not recognized: ${hash}`);
    }
  },

  navigate(hashPath) {
    window.location.hash = hashPath;
  }
};
