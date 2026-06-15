/* FluentAI Profile & AI Study Plan Generator Component */

import { Database } from '../db.js?v=8';

export function renderProfile(container) {
  const user = Database.getUser();
  const progress = Database.getProgress();

  const renderView = () => {
    const avatarUrl = user && user.avatar ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
    container.innerHTML = `
      <div class="profile-grid">
        <!-- LEFT COLUMN: AVATAR CARD & TARGET STATS -->
        <aside class="profile-sidebar-card card-glass">
          <div class="profile-large-avatar">
            <img src="${avatarUrl}" alt="User Avatar Large">
          </div>
          <h3 style="font-size: 18px; margin-bottom: 4px;">${user ? user.name : 'Taksh Sharma'}</h3>
          <span style="font-size:12px; color:var(--accent); font-weight:600; text-transform:uppercase;">Premium Scholar</span>
          
          <div style="width:100%; border-top:1px solid var(--border-color); margin-top:20px; padding-top:20px; text-align:left; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; font-size:13.5px;">
              <span style="color:var(--text-secondary);">Target Score:</span>
              <span style="font-weight:700; color:var(--text-primary);">PTE ${progress.targetScore}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13.5px;">
              <span style="color:var(--text-secondary);">Practice points:</span>
              <span style="font-weight:700; color:var(--accent);">${progress.points} pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13.5px;">
              <span style="color:var(--text-secondary);">Tasks completed:</span>
              <span style="font-weight:700; color:var(--success);">${progress.completedTasks.length} tasks</span>
            </div>
          </div>
        </aside>

        <!-- RIGHT COLUMN: FORMS & PLAN GENERATOR -->
        <main style="display:flex; flex-direction:column; gap:24px;">
          
          <!-- SETTINGS CONFIG CARD -->
          <div class="card-glass">
            <h3 style="margin-bottom: 20px;">Diagnostic Target Settings</h3>
            
            <form id="profile-config-form" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
              <div class="input-group">
                <label for="prof-name">Full Name</label>
                <input type="text" id="prof-name" value="${user ? user.name : ''}" required>
              </div>
              <div class="input-group">
                <label for="prof-email">Email Address</label>
                <input type="email" id="prof-email" value="${user ? user.email : ''}" required>
              </div>
              <div class="input-group">
                <label for="prof-target">Target Score Scale</label>
                <select id="prof-target">
                  <option value="65" ${progress.targetScore === 65 ? 'selected' : ''}>PTE 65 (Competent English)</option>
                  <option value="79" ${progress.targetScore === 79 ? 'selected' : ''}>PTE 79 (Superior English)</option>
                  <option value="90" ${progress.targetScore === 90 ? 'selected' : ''}>PTE 90 (Perfect Score)</option>
                </select>
              </div>
              <div class="input-group">
                <label for="prof-exam-date">Target Examination Date</label>
                <input type="date" id="prof-exam-date" value="${progress.examDate}">
              </div>
              
              <div style="grid-column:1/-1; display:flex; justify-content:flex-end;">
                <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save profile updates</button>
              </div>
            </form>
          </div>

          <!-- OPENAI API KEY CONFIG CARD -->
          <div class="card-glass">
            <h3 style="margin-bottom: 8px;">OpenAI API Key Integration</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Provide an API Key to enable real AI scoring and analysis. Stored securely on your device.
            </p>
            <form id="profile-openai-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="input-group" style="margin-bottom:0;">
                <label for="prof-openai-key">OpenAI API Key (sk-...)</label>
                <input type="password" id="prof-openai-key" placeholder="sk-proj-••••••••••••••••" value="">
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span id="openai-status-badge" class="badge-status locked" style="padding: 6px 12px; border-radius: var(--radius-sm); font-size:12px; font-weight:bold;">Disconnected</span>
                <div style="display:flex; gap:10px;">
                  <button type="button" id="btn-test-openai" class="btn btn-outline btn-sm">Test Connection</button>
                  <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save Key</button>
                </div>
              </div>
            </form>
          </div>

          <!-- GEMINI API KEY CONFIG CARD -->
          <div class="card-glass">
            <h3 style="margin-bottom: 8px;">Google Gemini API Key Integration (Free Tier)</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Provide a free Google Gemini API Key to enable unlimited, dynamic question generation and AI feedback.
            </p>
            <form id="profile-gemini-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="input-group" style="margin-bottom:0;">
                <label for="prof-gemini-key">Gemini API Key</label>
                <input type="password" id="prof-gemini-key" placeholder="AIzaSy••••••••••••••••" value="">
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span id="gemini-status-badge" class="badge-status locked" style="padding: 6px 12px; border-radius: var(--radius-sm); font-size:12px; font-weight:bold;">Disconnected</span>
                <div style="display:flex; gap:10px;">
                  <button type="button" id="btn-test-gemini" class="btn btn-outline btn-sm">Test Connection</button>
                  <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save Key</button>
                </div>
              </div>
            </form>
          </div>

          <!-- GOOGLE CLIENT ID CONFIG CARD -->
          <div class="card-glass">
            <h3 style="margin-bottom: 8px;">Google Client ID Integration (OAuth Sign-In)</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Provide your Google OAuth Client ID from your Google Cloud Console to enable actual Google Sign-In on the landing page and login modals.
            </p>
            <form id="profile-google-auth-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="input-group" style="margin-bottom:0;">
                <label for="prof-google-client-id">Google Client ID</label>
                <input type="text" id="prof-google-client-id" placeholder="123456789-abcdef.apps.googleusercontent.com" value="">
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span id="google-auth-status-badge" class="badge-status locked" style="padding: 6px 12px; border-radius: var(--radius-sm); font-size:12px; font-weight:bold;">Disconnected</span>
                <div style="display:flex; gap:10px;">
                   <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save Client ID</button>
                </div>
              </div>
            </form>
          </div>

          <!-- UNIFIED PAYMENT GATEWAY CONFIG CARD -->
          <div class="card-glass">
            <h3 style="margin-bottom: 8px;">Payment Gateway Settings</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Choose your active payment gateway and configure the corresponding keys or bank details.
            </p>
            
            <form id="profile-gateway-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="input-group" style="margin-bottom:8px;">
                <label for="prof-active-gateway">Active Payment Gateway</label>
                <select id="prof-active-gateway" style="padding: 10px 14px; border-radius: 8px; border:1px solid var(--border-color); background:transparent; font-size:14px; color:var(--text-primary); outline:none;">
                  <option value="demo">Interactive Demo Simulation (No Keys Required)</option>
                  <option value="stripe">Stripe Checkout Gateway (International Credit Cards)</option>
                  <option value="razorpay">Razorpay Checkout Gateway (UPI, Cards, Netbanking — India)</option>
                  <option value="manual">Manual Bank Transfer / UPI QR Code Upload</option>
                </select>
              </div>

              <!-- Stripe Config Block -->
              <div id="gateway-config-stripe" class="gateway-config-block hidden" style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-stripe-key">Stripe Publishable Key</label>
                    <input type="password" id="prof-stripe-key" placeholder="pk_test_••••••••" value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-stripe-secret">Stripe Secret Key</label>
                    <input type="password" id="prof-stripe-secret" placeholder="sk_test_••••••••" value="">
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-price-pro-monthly">Pro Monthly Price ID</label>
                    <input type="text" id="prof-price-pro-monthly" placeholder="price_..." value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-price-pro-yearly">Pro Yearly Price ID</label>
                    <input type="text" id="prof-price-pro-yearly" placeholder="price_..." value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-price-elite-monthly">Elite Monthly Price ID</label>
                    <input type="text" id="prof-price-elite-monthly" placeholder="price_..." value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-price-elite-yearly">Elite Yearly Price ID</label>
                    <input type="text" id="prof-price-elite-yearly" placeholder="price_..." value="">
                  </div>
                </div>
              </div>

              <!-- Razorpay Config Block -->
              <div id="gateway-config-razorpay" class="gateway-config-block hidden" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="input-group" style="margin-bottom:0;">
                  <label for="prof-razorpay-key">Razorpay Key ID</label>
                  <input type="password" id="prof-razorpay-key" placeholder="rzp_test_••••" value="">
                </div>
                <div class="input-group" style="margin-bottom:0;">
                  <label for="prof-razorpay-secret">Razorpay Secret Key</label>
                  <input type="password" id="prof-razorpay-secret" placeholder="••••••••••••••••••••" value="">
                </div>
              </div>

              <!-- Manual Config Block -->
              <div id="gateway-config-manual" class="gateway-config-block hidden" style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-manual-bank">Bank Name</label>
                    <input type="text" id="prof-manual-bank" placeholder="State Bank of India" value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-manual-acc">Account Number</label>
                    <input type="text" id="prof-manual-acc" placeholder="39010203040" value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-manual-ifsc">IFSC Code</label>
                    <input type="text" id="prof-manual-ifsc" placeholder="SBIN0001234" value="">
                  </div>
                  <div class="input-group" style="margin-bottom:0;">
                    <label for="prof-manual-upi">UPI ID</label>
                    <input type="text" id="prof-manual-upi" placeholder="pay@aspirepte.ai" value="">
                  </div>
                </div>
              </div>

              <!-- Demo Config Block -->
              <div id="gateway-config-demo" class="gateway-config-block" style="font-size:12.5px; color:#4a5568; background:#f7fafc; padding:12px; border-radius:8px; border:1px solid #edf2f7; line-height:1.4;">
                💡 Interactive Demo Mode is active. Checkout buttons will trigger simulated payment overlays. No credentials required.
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span id="gateway-status-badge" class="badge-status active" style="padding: 6px 12px; border-radius: var(--radius-sm); font-size:12px; font-weight:bold;">Demo Active</span>
                <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save Payment Settings</button>
              </div>
            </form>
          </div>

          <!-- NOTIFICATION PREFERENCES -->
          <div class="card-glass">
            <h3 style="margin-bottom:16px;">System alerts & preferences</h3>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13.5px; color:var(--text-secondary);">
              <label class="checkbox-container">
                <input type="checkbox" checked>
                <span class="checkbox-mark"></span>
                Send me weekly email diagnostics reports containing progress trends
              </label>
              <label class="checkbox-container">
                <input type="checkbox" checked>
                <span class="checkbox-mark"></span>
                Ping diagnostic reminder notifications on study streaks
              </label>
              <label class="checkbox-container">
                <input type="checkbox">
                <span class="checkbox-mark"></span>
                Participate in early pilot testing for next-generation speech scoring models
              </label>
            </div>
          </div>

          <!-- AI WEEKLY STUDY PLANNER -->
          <div class="card-glass-glow plan-generator-wrapper">
            <div class="card-title-flex">
              <div>
                <h3 style="color:var(--text-primary); font-size:18px;">AI Study Planner Generator</h3>
                <p style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">Compiles custom study timelines tailored to target scores.</p>
              </div>
              <button id="btn-generate-planner" class="btn btn-accent btn-sm shadow-neon">Regenerate schedule</button>
            </div>
            
            <div id="study-planner-table-container">
              <!-- Planner schedule rendered programmatically -->
            </div>
          </div>

          <!-- BULK SEED DATABASE CONFIG CARD -->
          <div class="card-glass" style="margin-top:20px;">
            <h3 style="margin-bottom: 8px;">Bulk Database Expansion</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Instantly expand your question bank using our procedural academic generator. 
              <br>⚠️ <i>Note: Storing 2,000 per category (8,000 total) may exceed the browser's 5MB localStorage limit in some configurations. 500 or 1,000 per category is recommended.</i>
            </p>
            <div style="display:flex; align-items:center; gap:16px; flex-wrap: wrap;">
              <select id="bulk-seed-count" style="padding: 8px 12px; border-radius: 8px; border:1px solid var(--border-color); background:transparent; font-size:13.5px; color:var(--text-primary); outline:none;">
                <option value="100">100 questions / category (400 total)</option>
                <option value="500">500 questions / category (2,000 total)</option>
                <option value="1000">1,000 questions / category (4,000 total)</option>
                <option value="2000" selected>2,000 questions / category (8,000 total) [Max Limit]</option>
              </select>
              <button id="btn-bulk-seed" class="btn btn-primary btn-sm shadow-neon">⚡ Seed Database</button>
            </div>
          </div>

          <!-- DANGER ZONE CARD -->
          <div class="card-glass" style="border: 1px solid rgba(255, 71, 87, 0.2); margin-top:20px;">
            <h3 style="color:var(--error); margin-bottom: 8px;">Danger Zone</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
              Reset your custom generated questions or clear all progress statistics.
            </p>
            <div style="display:flex; gap:12px;">
              <button id="btn-reset-questions" type="button" class="btn btn-outline btn-sm" style="color:var(--error); border-color:var(--error); background: transparent;">Reset Question Bank</button>
              <button id="btn-clear-progress" type="button" class="btn btn-danger btn-sm">Clear All Progress</button>
            </div>
          </div>

        </main>
      </div>
    `;

    // Initialise OpenAI Key fields
    const keyInput = document.getElementById('prof-openai-key');
    const openaiForm = document.getElementById('profile-openai-form');
    const statusBadge = document.getElementById('openai-status-badge');
    const testBtn = document.getElementById('btn-test-openai');

    const savedKey = localStorage.getItem('openai_api_key') || '';
    if (savedKey) {
      keyInput.value = savedKey;
      statusBadge.textContent = "Connected";
      statusBadge.className = "badge-status active";
    }

    openaiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newKey = keyInput.value.trim();
      if (newKey) {
        localStorage.setItem('openai_api_key', newKey);
        statusBadge.textContent = "Connected";
        statusBadge.className = "badge-status active";
        
        const saveBtn = openaiForm.querySelector('button[type="submit"]');
        saveBtn.textContent = "Key Saved!";
        saveBtn.style.background = "var(--success)";
        setTimeout(() => {
          saveBtn.textContent = "Save Key";
          saveBtn.style.background = "";
        }, 1000);
      } else {
        localStorage.removeItem('openai_api_key');
        statusBadge.textContent = "Disconnected";
        statusBadge.className = "badge-status locked";
      }
    });

    testBtn.addEventListener('click', async () => {
      const testKey = keyInput.value.trim();
      if (!testKey) {
        alert("Please enter a key before testing.");
        return;
      }
      testBtn.textContent = "Testing...";
      testBtn.disabled = true;

      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${testKey}`
          }
        });
        if (response.ok) {
          statusBadge.textContent = "Connected";
          statusBadge.className = "badge-status active";
          alert("Connection successful! API key is valid.");
        } else {
          statusBadge.textContent = "Invalid Key";
          statusBadge.className = "badge-status locked";
          alert("Authentication failed. Please verify your key.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error testing API connection.");
      } finally {
        testBtn.textContent = "Test Connection";
        testBtn.disabled = false;
      }
    });

    // Initialise Gemini Key fields
    const geminiKeyInput = document.getElementById('prof-gemini-key');
    const geminiForm = document.getElementById('profile-gemini-form');
    const geminiStatusBadge = document.getElementById('gemini-status-badge');
    const geminiTestBtn = document.getElementById('btn-test-gemini');

    const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
    if (savedGeminiKey) {
      geminiKeyInput.value = savedGeminiKey;
      geminiStatusBadge.textContent = "Connected";
      geminiStatusBadge.className = "badge-status active";
    }

    geminiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newKey = geminiKeyInput.value.trim();
      if (newKey) {
        localStorage.setItem('gemini_api_key', newKey);
        geminiStatusBadge.textContent = "Connected";
        geminiStatusBadge.className = "badge-status active";
        
        const saveBtn = geminiForm.querySelector('button[type="submit"]');
        saveBtn.textContent = "Key Saved!";
        saveBtn.style.background = "var(--success)";
        setTimeout(() => {
          saveBtn.textContent = "Save Key";
          saveBtn.style.background = "";
        }, 1000);
      } else {
        localStorage.removeItem('gemini_api_key');
        geminiStatusBadge.textContent = "Disconnected";
        geminiStatusBadge.className = "badge-status locked";
      }
    });

    geminiTestBtn.addEventListener('click', async () => {
      const testKey = geminiKeyInput.value.trim();
      if (!testKey) {
        alert("Please enter a key before testing.");
        return;
      }
      geminiTestBtn.textContent = "Testing...";
      geminiTestBtn.disabled = true;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Ping"
              }]
            }]
          })
        });
        if (response.ok) {
          geminiStatusBadge.textContent = "Connected";
          geminiStatusBadge.className = "badge-status active";
          alert("Connection successful! Gemini API key is valid.");
        } else {
          geminiStatusBadge.textContent = "Invalid Key";
          geminiStatusBadge.className = "badge-status locked";
          alert("Authentication failed. Please verify your key.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error testing API connection.");
      } finally {
        geminiTestBtn.textContent = "Test Connection";
        geminiTestBtn.disabled = false;
      }
    });

    // Initialise Google OAuth Client ID fields
    const googleClientIdInput = document.getElementById('prof-google-client-id');
    const googleAuthForm = document.getElementById('profile-google-auth-form');
    const googleAuthStatusBadge = document.getElementById('google-auth-status-badge');

    const savedClientId = localStorage.getItem('google_client_id') || '';
    if (savedClientId) {
      googleClientIdInput.value = savedClientId;
      googleAuthStatusBadge.textContent = "Connected";
      googleAuthStatusBadge.className = "badge-status active";
    }

    googleAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newClientId = googleClientIdInput.value.trim();
      if (newClientId) {
        localStorage.setItem('google_client_id', newClientId);
        googleAuthStatusBadge.textContent = "Connected";
        googleAuthStatusBadge.className = "badge-status active";
        
        const saveBtn = googleAuthForm.querySelector('button[type="submit"]');
        saveBtn.textContent = "Client ID Saved!";
        saveBtn.style.background = "var(--success)";
        setTimeout(() => {
          saveBtn.textContent = "Save Client ID";
          saveBtn.style.background = "";
        }, 1000);
      } else {
        localStorage.removeItem('google_client_id');
        googleAuthStatusBadge.textContent = "Disconnected";
        googleAuthStatusBadge.className = "badge-status locked";
      }
    });

    // Initialise Unified Payment Gateway Settings
    const activeGatewaySelect = document.getElementById('prof-active-gateway');
    const gatewayStatusBadge = document.getElementById('gateway-status-badge');
    const gatewayForm = document.getElementById('profile-gateway-form');

    const savedGateway = localStorage.getItem('active_payment_gateway') || 'demo';
    activeGatewaySelect.value = savedGateway;

    const toggleGatewayBlocks = (val) => {
      document.querySelectorAll('.gateway-config-block').forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
      });
      const selectedBlock = document.getElementById(`gateway-config-${val}`);
      if (selectedBlock) {
        selectedBlock.classList.remove('hidden');
        selectedBlock.style.display = (val === 'razorpay' || val === 'manual' || val === 'stripe') ? 'grid' : 'block';
      }

      // Update badge
      if (val === 'demo') {
        gatewayStatusBadge.textContent = "Demo Active";
        gatewayStatusBadge.className = "badge-status active";
      } else if (val === 'manual') {
        gatewayStatusBadge.textContent = "Manual Transfer Active";
        gatewayStatusBadge.className = "badge-status active";
      } else if (val === 'stripe') {
        const pub = localStorage.getItem('stripe_publishable_key');
        const sec = localStorage.getItem('stripe_secret_key');
        if (pub && sec) {
          gatewayStatusBadge.textContent = "Stripe Live Active";
          gatewayStatusBadge.className = "badge-status active";
        } else if (pub || sec) {
          gatewayStatusBadge.textContent = "Stripe Partially Configured";
          gatewayStatusBadge.className = "badge-status warning";
        } else {
          gatewayStatusBadge.textContent = "Stripe Demo Fallback";
          gatewayStatusBadge.className = "badge-status locked";
        }
      } else if (val === 'razorpay') {
        const rzk = localStorage.getItem('razorpay_key_id');
        const rzs = localStorage.getItem('razorpay_secret_key');
        if (rzk && rzs) {
          gatewayStatusBadge.textContent = "Razorpay Live Active";
          gatewayStatusBadge.className = "badge-status active";
        } else if (rzk || rzs) {
          gatewayStatusBadge.textContent = "Razorpay Partially Configured";
          gatewayStatusBadge.className = "badge-status warning";
        } else {
          gatewayStatusBadge.textContent = "Razorpay Demo Fallback";
          gatewayStatusBadge.className = "badge-status locked";
        }
      }
    };

    activeGatewaySelect.addEventListener('change', (e) => {
      toggleGatewayBlocks(e.target.value);
    });

    // Populate existing Stripe settings inputs
    const stripeKeyInput = document.getElementById('prof-stripe-key');
    const stripeSecretInput = document.getElementById('prof-stripe-secret');
    const priceProMonthlyInput = document.getElementById('prof-price-pro-monthly');
    const priceProYearlyInput = document.getElementById('prof-price-pro-yearly');
    const priceEliteMonthlyInput = document.getElementById('prof-price-elite-monthly');
    const priceEliteYearlyInput = document.getElementById('prof-price-elite-yearly');

    stripeKeyInput.value = localStorage.getItem('stripe_publishable_key') || '';
    stripeSecretInput.value = localStorage.getItem('stripe_secret_key') || '';
    
    const priceKeys = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'];
    const priceInputs = {
      pro_monthly: priceProMonthlyInput,
      pro_yearly: priceProYearlyInput,
      elite_monthly: priceEliteMonthlyInput,
      elite_yearly: priceEliteYearlyInput
    };
    priceKeys.forEach(k => {
      if (priceInputs[k]) priceInputs[k].value = localStorage.getItem(`stripe_price_${k}`) || '';
    });

    // Populate existing Razorpay settings inputs
    const rzpKeyInput = document.getElementById('prof-razorpay-key');
    const rzpSecretInput = document.getElementById('prof-razorpay-secret');
    rzpKeyInput.value = localStorage.getItem('razorpay_key_id') || '';
    rzpSecretInput.value = localStorage.getItem('razorpay_secret_key') || '';

    // Populate existing Manual settings inputs
    const manualBankInput = document.getElementById('prof-manual-bank');
    const manualAccInput = document.getElementById('prof-manual-acc');
    const manualIfscInput = document.getElementById('prof-manual-ifsc');
    const manualUpiInput = document.getElementById('prof-manual-upi');

    manualBankInput.value = localStorage.getItem('manual_bank_name') || 'State Bank of India';
    manualAccInput.value = localStorage.getItem('manual_acc_number') || '39010203040';
    manualIfscInput.value = localStorage.getItem('manual_ifsc_code') || 'SBIN0001234';
    manualUpiInput.value = localStorage.getItem('manual_upi_id') || 'pay@aspirepte.ai';

    // Set initial block displays
    toggleGatewayBlocks(savedGateway);

    // Save form configurations
    gatewayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const selected = activeGatewaySelect.value;
      localStorage.setItem('active_payment_gateway', selected);

      // Save Stripe details
      if (stripeKeyInput.value.trim()) localStorage.setItem('stripe_publishable_key', stripeKeyInput.value.trim());
      else localStorage.removeItem('stripe_publishable_key');

      if (stripeSecretInput.value.trim()) localStorage.setItem('stripe_secret_key', stripeSecretInput.value.trim());
      else localStorage.removeItem('stripe_secret_key');

      priceKeys.forEach(k => {
        if (priceInputs[k] && priceInputs[k].value.trim()) {
          localStorage.setItem(`stripe_price_${k}`, priceInputs[k].value.trim());
        } else {
          localStorage.removeItem(`stripe_price_${k}`);
        }
      });

      // Save Razorpay details
      if (rzpKeyInput.value.trim()) localStorage.setItem('razorpay_key_id', rzpKeyInput.value.trim());
      else localStorage.removeItem('razorpay_key_id');

      if (rzpSecretInput.value.trim()) localStorage.setItem('razorpay_secret_key', rzpSecretInput.value.trim());
      else localStorage.removeItem('razorpay_secret_key');

      // Save Manual details
      localStorage.setItem('manual_bank_name', manualBankInput.value.trim() || 'State Bank of India');
      localStorage.setItem('manual_acc_number', manualAccInput.value.trim() || '39010203040');
      localStorage.setItem('manual_ifsc_code', manualIfscInput.value.trim() || 'SBIN0001234');
      localStorage.setItem('manual_upi_id', manualUpiInput.value.trim() || 'pay@aspirepte.ai');

      toggleGatewayBlocks(selected);

      // Re-initialize active coordinators
      import('../checkout-coordinator.js?v=8').then(({ CheckoutCoordinator }) => {
        CheckoutCoordinator.init();
      }).catch(err => console.error(err));

      const saveBtn = gatewayForm.querySelector('button[type="submit"]');
      saveBtn.textContent = "Payment Settings Saved!";
      saveBtn.style.background = "var(--success)";
      setTimeout(() => {
        saveBtn.textContent = "Save Payment Settings";
        saveBtn.style.background = "";
      }, 1000);
    });

    // Hook config form submits
    document.getElementById('profile-config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('prof-name').value;
      const newEmail = document.getElementById('prof-email').value;
      const newTarget = parseInt(document.getElementById('prof-target').value);
      const newExamDate = document.getElementById('prof-exam-date').value;

      // Update User details
      Database.updateUser({
        name: newName,
        email: newEmail,
        authenticated: true
      });

      // Update progress
      const currentProg = Database.getProgress();
      currentProg.targetScore = newTarget;
      currentProg.examDate = newExamDate;
      Database.updateProgress(currentProg);

      // Flash feedback and reload
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.textContent = "Updates Saved!";
      submitBtn.style.background = "var(--success)";
      
      setTimeout(() => {
        renderView();
      }, 1000);
    });

    // Hook Planner generator
    document.getElementById('btn-generate-planner').addEventListener('click', () => {
      generateWeeklySchedule();
    });

    // Hook Danger Zone buttons
    document.getElementById('btn-reset-questions').addEventListener('click', () => {
      if (confirm("Are you sure you want to reset the question bank to the defaults? This will clear all custom generated questions.")) {
        Database.resetQuestions();
        alert("Question bank has been reset successfully!");
        renderView();
      }
    });

    document.getElementById('btn-bulk-seed').addEventListener('click', async () => {
      const countSelect = document.getElementById('bulk-seed-count');
      const count = parseInt(countSelect.value);
      
      const seedBtn = document.getElementById('btn-bulk-seed');
      const originalText = seedBtn.textContent;
      
      seedBtn.disabled = true;
      seedBtn.innerHTML = `<span>⏳ Seeding ${count} Qs...</span>`;
      
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        Database.bulkSeedQuestions(count);
        alert(`Database successfully expanded! Seeded up to ${count} questions per category.`);
      } catch (err) {
        console.error(err);
        alert(`Failed to seed database: ${err.message || err}`);
      } finally {
        seedBtn.disabled = false;
        seedBtn.textContent = originalText;
        renderView();
      }
    });

    document.getElementById('btn-clear-progress').addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all your practice progress, scores, and streak history? This cannot be undone.")) {
        Database.clearUserData();
        alert("Progress cleared successfully! The page will now reload.");
        window.location.reload();
      }
    });

    // Populate schedule table initially
    generateWeeklySchedule(true);
  };

  const generateWeeklySchedule = (isInitial = false) => {
    const tableBox = document.getElementById('study-planner-table-container');
    if (!tableBox) return;

    // Loading skeleton first if triggered manually
    if (!isInitial) {
      tableBox.innerHTML = `
        <div class="loading-skeleton-container" style="margin-top:16px;">
          <div class="skeleton" style="height:36px; width:100%;"></div>
          <div class="skeleton" style="height:120px; width:100%;"></div>
        </div>
      `;
    }

    setTimeout(() => {
      const currentTarget = parseInt(document.getElementById('prof-target').value) || progress.targetScore;
      
      // Dynamic planning schedules based on target level
      let schedule = [];
      if (currentTarget >= 90) {
        // High Intensity
        schedule = [
          { day: "Monday", skill: "Speaking (RA)", task: "3 Read Aloud passages", time: "30 mins" },
          { day: "Tuesday", skill: "Writing (WE)", task: "1 Essay (Advanced Lexicon)", time: "40 mins" },
          { day: "Wednesday", skill: "Reading (FIB)", task: "10 Collocation blanks", time: "25 mins" },
          { day: "Thursday", skill: "Listening (SST)", task: "2 Spoken summary transcripts", time: "30 mins" },
          { day: "Friday", skill: "Full Mock Test", task: "1 Simulated Examination", time: "45 mins" },
          { day: "Saturday", skill: "Vocabulary Drill", task: "Review 15 Lexicon Flashcards", time: "15 mins" },
          { day: "Sunday", skill: "Rest / Diagnostics", task: "Review AI error highlights", time: "10 mins" }
        ];
      } else if (currentTarget >= 79) {
        // Medium Intensity
        schedule = [
          { day: "Monday", skill: "Speaking (RA)", task: "2 Read Aloud passages", time: "20 mins" },
          { day: "Tuesday", skill: "Writing (WE)", task: "1 Argumentative Essay", time: "30 mins" },
          { day: "Wednesday", skill: "Reading (FIB)", task: "5 Fill in the blanks", time: "15 mins" },
          { day: "Thursday", skill: "Listening (SST)", task: "1 Summarize lecture summary", time: "20 mins" },
          { day: "Friday", skill: "Full Mock Test", task: "1 Test simulation", time: "45 mins" },
          { day: "Saturday", skill: "Vocabulary", task: "Review 10 flashcards", time: "10 mins" },
          { day: "Sunday", skill: "Rest", task: "Review daily streak goals", time: "5 mins" }
        ];
      } else {
        // Core Focus
        schedule = [
          { day: "Monday", skill: "Speaking (RA)", task: "1 Read Aloud passage", time: "15 mins" },
          { day: "Tuesday", skill: "Writing (WE)", task: "Review Essay outline structures", time: "15 mins" },
          { day: "Wednesday", skill: "Reading (FIB)", task: "3 Fill in the Blanks", time: "10 mins" },
          { day: "Thursday", skill: "Listening (SST)", task: "1 Audio lecture review", time: "15 mins" },
          { day: "Friday", skill: "Practice Review", task: "Review completed exercises", time: "20 mins" },
          { day: "Saturday", skill: "Vocabulary", task: "Review 5 flashcards", time: "10 mins" },
          { day: "Sunday", skill: "Rest", task: "Weekly review", time: "5 mins" }
        ];
      }

      tableBox.innerHTML = `
        <table class="weekly-schedule-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Focus Area</th>
              <th>Task Target</th>
              <th>Study Time</th>
            </tr>
          </thead>
          <tbody>
            ${schedule.map(row => `
              <tr>
                <td><b>${row.day}</b></td>
                <td><span class="badge-q-type">${row.skill}</span></td>
                <td>${row.task}</td>
                <td style="color:var(--accent); font-weight:600;">${row.time}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }, isInitial ? 0 : 500); // simulation delay for AI generator
  };

  // Run initial render
  renderView();
}
