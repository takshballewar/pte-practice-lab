/* Faculty Advisor Dashboard Page Component */

import { Database } from '../db.js?v=29';

function generateInitialsSvg(name) {
  const initialsText = name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
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

function findQuestionById(qId) {
  const questions = Database.getQuestions();
  const all = [
    ...(questions.speaking || []),
    ...(questions.writing || []),
    ...(questions.reading || []),
    ...(questions.listening || [])
  ];
  return all.find(q => q.id === qId);
}

export async function renderFaculty(container) {
  // Show a premium loading skeleton first while we sync accounts
  container.innerHTML = `
    <div style="height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
      <div class="loading-spinner" style="width: 44px; height: 44px; border: 4px solid rgba(139,92,246,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">Synchronizing classroom telemetry from database...</p>
    </div>
  `;

  // Sync from sqlite database
  let accounts = [];
  try {
    const res = await fetch('/api/accounts');
    const serverAccounts = await res.json();
    if (Array.isArray(serverAccounts)) {
      localStorage.setItem("fluentai_accounts", JSON.stringify(serverAccounts));
      accounts = serverAccounts;
    } else {
      accounts = Database.getAccounts();
    }
  } catch (err) {
    console.error("Failed to sync accounts for faculty dashboard", err);
    accounts = Database.getAccounts();
  }

  const currentUser = Database.getUser();
  if (!currentUser) {
    container.innerHTML = `<p style="padding: 40px; text-align: center; color: var(--text-muted);">Please sign in as Faculty to view this deck.</p>`;
    return;
  }

  // Filter students linked to this faculty
  const myStudents = accounts.filter(a => a.role === 'student' && a.linked_faculty_id === currentUser.faculty_code);

  // Compute classroom summary metrics
  const totalStudents = myStudents.length;
  let avgTarget = 0;
  let totalPoints = 0;
  let avgStreak = 0;

  if (totalStudents > 0) {
    let sumTarget = 0;
    let sumStreak = 0;
    myStudents.forEach(s => {
      const prog = s.progress || {};
      sumTarget += prog.targetScore || 79;
      totalPoints += prog.points || 0;
      sumStreak += prog.streak || 0;
    });
    avgTarget = Math.round(sumTarget / totalStudents);
    avgStreak = Math.round(sumStreak / totalStudents);
  }

  // Render Page Structure
  container.innerHTML = `
    <div class="faculty-dashboard-container">
      
      <!-- TOP SECTION: HEADER PANELS -->
      <div class="faculty-header-grid" style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- Faculty Code Display Card -->
        <div class="card-glass-glow faculty-code-panel" style="padding: 24px; display:flex; flex-direction:column; justify-content:center;">
          <h4 style="font-size: 13.5px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 12px;">Your Advisor Credentials</h4>
          <div style="font-size: 26px; font-weight: 800; font-family: monospace; color: var(--accent); letter-spacing: 2px; margin-bottom: 12px; display:flex; align-items:center; gap:12px;">
            <span id="faculty-code-span">${currentUser.faculty_code}</span>
            <button id="btn-faculty-copy" class="btn btn-sm btn-outline shadow-neon" style="margin-top: 0; padding: 4px 10px; font-size: 11px;">Copy Code</button>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">Students should enter this Faculty ID in their <b>AI Study Cockpit</b> settings. Once linked, their mistakes and practice grades will auto-populate in your cockpit below.</p>
        </div>

        <!-- Metrics Deck Card -->
        <div class="card-glass classroom-stats-deck" style="padding: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: center;">
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 28px; font-weight: 800; color: var(--text-primary);">${totalStudents}</div>
            <div class="stat-lbl" style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-top: 6px;">Students</div>
          </div>
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 28px; font-weight: 800; color: var(--accent);">${totalPoints}</div>
            <div class="stat-lbl" style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-top: 6px;">Total Points</div>
          </div>
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 28px; font-weight: 800; color: var(--success);">🔥 ${avgStreak}</div>
            <div class="stat-lbl" style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-top: 6px;">Avg. Streak</div>
          </div>
          <div class="stat-cell" style="text-align: center;">
            <div class="stat-num" style="font-size: 28px; font-weight: 800; color: var(--warning);">PTE ${avgTarget || 79}</div>
            <div class="stat-lbl" style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-top: 6px;">Avg. Target</div>
          </div>
        </div>
      </div>

      <!-- MIDDLE SECTION: STUDENTS ROSTER -->
      <div class="card-glass Roster-container" style="padding: 24px;">
        <div class="card-title-flex" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; color: var(--text-primary);">Classroom Roster</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Monitor real-time progress and diagnostics across active scholars.</p>
          </div>
          <div class="search-box-wrapper" style="width: 250px;">
            <input type="text" id="roster-search-input" placeholder="Search students by name..." style="width:100%; font-size:12.5px; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); color: var(--text-primary);">
          </div>
        </div>

        <div class="roster-table-wrapper" style="overflow-x: auto; width: 100%;">
          <table class="weekly-schedule-table roster-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border-color);">
                <th style="padding: 12px 16px;">Student</th>
                <th style="padding: 12px 16px; text-align: center;">Target PTE</th>
                <th style="padding: 12px 16px; text-align: center;">Latest Overall Avg</th>
                <th style="padding: 12px 16px; text-align: center;">Active Streak</th>
                <th style="padding: 12px 16px; text-align: center;">Practice Points</th>
                <th style="padding: 12px 16px; text-align: center;">Mistakes Count</th>
                <th style="padding: 12px 16px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody id="roster-table-body">
              <!-- Rendered programmatically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- STUDENT TELEMETRY DETAILED INSPECTOR MODAL -->
    <div id="telemetry-modal" class="modal-overlay hidden" style="z-index: 10000;">
      <div class="modal-card" style="max-width: 850px; width: 90%; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:14px;">
            <img id="telemetry-avatar" src="" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--accent);">
            <div>
              <h2 id="telemetry-student-name" style="font-size:18px; color:var(--text-primary); font-weight:700;">Student Telemetry</h2>
              <p id="telemetry-student-email" style="font-size:12px; color:var(--text-muted); margin-top:2px;">student@domain.com</p>
            </div>
          </div>
          <button class="modal-close-btn" id="telemetry-modal-close" style="font-size: 24px; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">&times;</button>
        </div>
        
        <div class="modal-body" style="padding: 24px; max-height: 70vh; overflow-y: auto;">
          <div class="grid-cols-2" style="gap:24px; display:grid; grid-template-columns: 1fr 1fr; margin-bottom: 24px;">
            
            <!-- Competency Matrix -->
            <div class="card-glass" style="padding:16px;">
              <h4 style="font-size:13.5px; color:var(--text-primary); margin-bottom:16px;">Competency Score Matrix</h4>
              <div id="telemetry-skills-matrix" style="display:flex; flex-direction:column; gap:12px;">
                <!-- Filled dynamically -->
              </div>
            </div>

            <!-- Score History logs -->
            <div class="card-glass" style="padding:16px;">
              <h4 style="font-size:13.5px; color:var(--text-primary); margin-bottom:16px;">Chronological Evaluation Logs</h4>
              <div id="telemetry-history-logs" style="max-height: 180px; overflow-y:auto;">
                <!-- Filled dynamically -->
              </div>
            </div>

          </div>

          <!-- Mistakes Telemetry Panel -->
          <div class="card-glass" style="padding: 20px;">
            <h4 style="font-size: 14px; color: var(--text-primary); margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
              <span>⚠️ Outstanding Mistakes & Study List</span>
              <span id="telemetry-mistakes-badge" class="badge-q-type" style="background: rgba(239,68,68,0.1); color: var(--error); border-color: rgba(239,68,68,0.2);">0 Tasks</span>
            </h4>
            <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 16px;">These are practice questions where the student failed to meet their target score threshold.</p>
            
            <div id="telemetry-mistakes-list" style="display:flex; flex-direction:column; gap:10px;">
              <!-- Filled dynamically -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Copy code action
  const copyBtn = document.getElementById('btn-faculty-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const codeSpan = document.getElementById('faculty-code-span');
      if (codeSpan) {
        navigator.clipboard.writeText(codeSpan.textContent);
        copyBtn.textContent = "Copied!";
        copyBtn.style.background = "var(--success)";
        copyBtn.style.color = "white";
        setTimeout(() => {
          copyBtn.textContent = "Copy Code";
          copyBtn.style.background = "transparent";
          copyBtn.style.color = "var(--accent)";
        }, 1500);
      }
    });
  }

  // Populate Roster Table initially
  const rosterBody = document.getElementById('roster-table-body');
  
  const populateRoster = (filterText = "") => {
    rosterBody.innerHTML = '';
    const filtered = myStudents.filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()));
    
    if (filtered.length === 0) {
      rosterBody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 13.5px;">
            No linked students found matching "${filterText}".
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(s => {
      const prog = s.progress || {};
      const scoreHist = prog.scoreHistory || [];
      const lastScore = scoreHist[scoreHist.length - 1] || { overall: 0 };
      const mistakesCount = (prog.unclearedTasks || []).length;
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 12px 16px; display:flex; align-items:center; gap:10px;">
          <img src="${s.avatar || generateInitialsSvg(s.name)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
          <div>
            <div style="font-weight:600; color:var(--text-primary); font-size:13.5px;">${s.name}</div>
            <div style="font-size:11px; color:var(--text-muted);">${s.email}</div>
          </div>
        </td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--warning);">PTE ${prog.targetScore || 79}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--accent); font-size: 14px;">${lastScore.overall} <span style="font-size:10px; color:var(--text-muted); font-weight:400;">/90</span></td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--success);">🔥 ${prog.streak || 0}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--text-primary);">${prog.points || 0} pts</td>
        <td style="padding: 12px 16px; text-align: center;">
          <span class="badge-q-type" style="background: ${mistakesCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}; color: ${mistakesCount > 0 ? 'var(--error)' : 'var(--success)'}; border-color: ${mistakesCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}; font-weight:700;">
            ${mistakesCount} Tasks
          </span>
        </td>
        <td style="padding: 12px 16px; text-align: center;">
          <button class="btn btn-sm btn-outline btn-telemetry" data-email="${s.email}" style="margin-top: 0; font-size: 12px; font-weight:600;">Inspect Telemetry</button>
        </td>
      `;
      rosterBody.appendChild(tr);
    });

    // Wire up inspect buttons
    document.querySelectorAll('.btn-telemetry').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentEmail = e.target.getAttribute('data-email');
        const student = myStudents.find(s => s.email === studentEmail);
        if (student) openTelemetryModal(student);
      });
    });
  };

  populateRoster();

  // Search filter keyup listener
  const searchInput = document.getElementById('roster-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      populateRoster(e.target.value);
    });
  }

  // Telemetry modal logic
  const modal = document.getElementById('telemetry-modal');
  const closeBtn = document.getElementById('telemetry-modal-close');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const openTelemetryModal = (student) => {
    const prog = student.progress || {};
    const scoreHist = prog.scoreHistory || [];
    const lastScore = scoreHist[scoreHist.length - 1] || { speaking: 0, writing: 0, reading: 0, listening: 0, overall: 0 };
    const uncleared = prog.unclearedTasks || [];

    // Populate header
    document.getElementById('telemetry-student-name').textContent = student.name;
    document.getElementById('telemetry-student-email').textContent = student.email;
    document.getElementById('telemetry-avatar').src = student.avatar || generateInitialsSvg(student.name);

    // Populate skills matrix
    const matrixContainer = document.getElementById('telemetry-skills-matrix');
    matrixContainer.innerHTML = '';
    const skills = [
      { name: "Speaking", score: lastScore.speaking, color: "var(--accent)" },
      { name: "Writing", score: lastScore.writing, color: "var(--primary)" },
      { name: "Reading", score: lastScore.reading, color: "var(--success)" },
      { name: "Listening", score: lastScore.listening, color: "var(--warning)" }
    ];

    skills.forEach(sk => {
      const row = document.createElement('div');
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
          <span style="font-weight:600; color:var(--text-primary);">${sk.name}</span>
          <span style="font-weight:700; color:${sk.color}">${sk.score} <span style="font-weight:400; color:var(--text-muted); font-size:10px;">/90</span></span>
        </div>
        <div style="background:rgba(255,255,255,0.05); height:6px; border-radius:3px; overflow:hidden; width:100%;">
          <div style="background:${sk.color}; width:${(sk.score / 90) * 100}%; height:100%; border-radius:3px;"></div>
        </div>
      `;
      matrixContainer.appendChild(row);
    });

    // Populate history logs
    const historyContainer = document.getElementById('telemetry-history-logs');
    historyContainer.innerHTML = '';
    if (scoreHist.length === 0) {
      historyContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size:12.5px;">No practice evaluations recorded yet.</div>`;
    } else {
      scoreHist.slice().reverse().forEach(log => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.fontSize = '12px';
        item.style.padding = '8px 0';
        item.style.borderBottom = '1px dashed var(--border-color)';
        item.innerHTML = `
          <span style="color:var(--text-secondary);">${log.date || 'Practice Session'}</span>
          <span style="font-weight:700; color:var(--accent);">Overall PTE ${log.overall}</span>
        `;
        historyContainer.appendChild(item);
      });
    }

    // Populate mistakes list
    const mistakesBadge = document.getElementById('telemetry-mistakes-badge');
    mistakesBadge.textContent = `${uncleared.length} Task${uncleared.length === 1 ? '' : 's'}`;

    const mistakesList = document.getElementById('telemetry-mistakes-list');
    mistakesList.innerHTML = '';

    if (uncleared.length === 0) {
      mistakesList.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; border: 1px dashed var(--border-color); border-radius:var(--radius-sm); background:rgba(16,185,129,0.02); gap:8px;">
          <span style="font-size:24px; color:var(--success);">✅</span>
          <p style="font-weight:600; color:var(--success); font-size:13px; margin:0;">Zero outstanding mistakes!</p>
          <p style="font-size:11px; color:var(--text-muted); margin:0;">Student has cleared all practiced tasks within score targets.</p>
        </div>
      `;
    } else {
      uncleared.forEach(qId => {
        const question = findQuestionById(qId);
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '10px 14px';
        item.style.background = 'rgba(255,255,255,0.01)';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = 'var(--radius-sm)';
        
        let typeBadgeColor = 'var(--accent)';
        if (question && question.taskType) {
          if (question.taskType.includes('write') || question.taskType.includes('essay')) typeBadgeColor = 'var(--primary)';
          if (question.taskType.includes('read') || question.taskType.includes('fib')) typeBadgeColor = 'var(--success)';
          if (question.taskType.includes('listen') || question.taskType.includes('sst')) typeBadgeColor = 'var(--warning)';
        }

        item.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="badge-q-type" style="background: rgba(255,255,255,0.03); color: ${typeBadgeColor}; border-color: ${typeBadgeColor}44; font-size:10.5px; font-weight:700; text-transform: uppercase;">
              ${question ? question.id : qId}
            </span>
            <div>
              <div style="font-size:12.5px; font-weight:600; color:var(--text-primary);">${question ? question.title : 'PTE Practice Exercise'}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px; text-transform: capitalize;">Difficulty: ${question ? question.difficulty : 'Medium'} | Type: ${(question && question.taskType) ? question.taskType.replace('-', ' ') : 'Exercise'}</div>
            </div>
          </div>
          <span style="font-size:11px; font-weight:600; padding:3px 8px; border-radius:3px; background:rgba(239,68,68,0.1); color:var(--error);">Uncleared</span>
        `;
        mistakesList.appendChild(item);
      });
    }

    // Show modal
    modal.classList.remove('hidden');
  };
}
