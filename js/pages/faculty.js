/* Faculty Advisor Dashboard Page Component */

import { Database } from '../db.js?v=31';

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

  // Communicative skills totals for class averages
  let sumSpeaking = 0;
  let sumWriting = 0;
  let sumReading = 0;
  let sumListening = 0;
  let studentsWithScores = 0;

  let riskCount = 0;
  let idleCount = 0;
  let totalDrillsCount = 0;
  let drillsCompletedCount = 0;

  if (totalStudents > 0) {
    let sumTarget = 0;
    let sumStreak = 0;
    myStudents.forEach(s => {
      const prog = s.progress || {};
      sumTarget += prog.targetScore || 79;
      totalPoints += prog.points || 0;
      sumStreak += prog.streak || 0;
      
      const scoreHist = prog.scoreHistory || [];
      const lastScore = scoreHist[scoreHist.length - 1] || { overall: 0 };
      const target = prog.targetScore || 79;
      const overall = lastScore.overall || 0;

      // Risk computation
      if (overall === 0 || (target - overall > 10)) {
        riskCount++;
      }

      // Idle computation
      if ((prog.streak || 0) === 0) {
        idleCount++;
      }

      // Assignments counts
      const asms = prog.assignments || [];
      asms.forEach(asm => {
        totalDrillsCount++;
        if (asm.status === 'completed') {
          drillsCompletedCount++;
        }
      });

      if (scoreHist.length > 0) {
        sumSpeaking += lastScore.speaking || 0;
        sumWriting += lastScore.writing || 0;
        sumReading += lastScore.reading || 0;
        sumListening += lastScore.listening || 0;
        studentsWithScores++;
      }
    });
    avgTarget = Math.round(sumTarget / totalStudents);
    avgStreak = Math.round(sumStreak / totalStudents);
  }

  const classAvgSpeaking = studentsWithScores > 0 ? Math.round(sumSpeaking / studentsWithScores) : 0;
  const classAvgWriting = studentsWithScores > 0 ? Math.round(sumWriting / studentsWithScores) : 0;
  const classAvgReading = studentsWithScores > 0 ? Math.round(sumReading / studentsWithScores) : 0;
  const classAvgListening = studentsWithScores > 0 ? Math.round(sumListening / studentsWithScores) : 0;
  const drillsPct = totalDrillsCount > 0 ? Math.round((drillsCompletedCount / totalDrillsCount) * 100) : 0;

  // Render Page Structure
  container.innerHTML = `
    <div class="faculty-dashboard-container">
      
      <!-- ATTENTION & RISK DECK -->
      <div class="attention-deck-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div class="card-glass-glow attention-card warning-glow" style="padding: 16px; display: flex; align-items: center; gap: 15px; border-color: rgba(239, 68, 68, 0.15);">
          <div style="font-size: 24px; background: rgba(239,68,68,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid rgba(239,68,68,0.2); color: var(--error);">⚠️</div>
          <div>
            <h4 style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin: 0; letter-spacing: 0.5px;">At Risk Scholars</h4>
            <p style="font-size: 15px; font-weight: 700; color: var(--error); margin: 2px 0 0 0;">${riskCount} Scholars need help</p>
          </div>
        </div>
        <div class="card-glass-glow attention-card warning-glow" style="padding: 16px; display: flex; align-items: center; gap: 15px; border-color: rgba(245, 158, 11, 0.15);">
          <div style="font-size: 24px; background: rgba(245,158,11,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid rgba(245,158,11,0.2); color: var(--warning);">🕒</div>
          <div>
            <h4 style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin: 0; letter-spacing: 0.5px;">Inactive Scholars</h4>
            <p style="font-size: 15px; font-weight: 700; color: var(--warning); margin: 2px 0 0 0;">${idleCount} Idle (0 streak)</p>
          </div>
        </div>
        <div class="card-glass-glow attention-card success-glow" style="padding: 16px; display: flex; align-items: center; gap: 15px; border-color: rgba(16, 185, 129, 0.15);">
          <div style="font-size: 24px; background: rgba(16,185,129,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid rgba(16,185,129,0.2); color: var(--success);">🎯</div>
          <div>
            <h4 style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin: 0; letter-spacing: 0.5px;">Drills Completed</h4>
            <p style="font-size: 15px; font-weight: 700; color: var(--success); margin: 2px 0 0 0;">${drillsCompletedCount}/${totalDrillsCount} Drills (${drillsPct}%)</p>
          </div>
        </div>
      </div>
      
      <!-- TOP SECTION: HEADER PANELS -->
      <div class="faculty-header-grid" style="display: grid; grid-template-columns: 1.15fr 1.6fr 1.25fr; gap: 20px; margin-bottom: 24px;">
        
        <!-- Faculty Code Display Card -->
        <div class="card-glass-glow faculty-code-panel" style="padding: 20px; display:flex; flex-direction:column; justify-content:center;">
          <h4 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 10px;">Advisor Credentials</h4>
          <div style="font-size: 24px; font-weight: 800; font-family: monospace; color: var(--accent); letter-spacing: 1.5px; margin-bottom: 10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span id="faculty-code-span">${currentUser.faculty_code}</span>
            <button id="btn-faculty-copy" class="btn btn-sm btn-outline shadow-neon" style="margin-top: 0; padding: 4px 10px; font-size: 11px;">Copy</button>
          </div>
          <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4; margin:0;">Students link this ID in their profile settings to share mistake and practice telemetry.</p>
        </div>

        <!-- Metrics Deck Card -->
        <div class="card-glass classroom-stats-deck" style="padding: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; align-items: center;">
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 24px; font-weight: 800; color: var(--text-primary);">${totalStudents}</div>
            <div class="stat-lbl" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-top: 4px;">Scholars</div>
          </div>
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 24px; font-weight: 800; color: var(--accent);">${totalPoints}</div>
            <div class="stat-lbl" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-top: 4px;">Total Pts</div>
          </div>
          <div class="stat-cell" style="text-align: center; border-right: 1px solid var(--border-color);">
            <div class="stat-num" style="font-size: 24px; font-weight: 800; color: var(--success);">🔥 ${avgStreak}</div>
            <div class="stat-lbl" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-top: 4px;">Avg Streak</div>
          </div>
          <div class="stat-cell" style="text-align: center;">
            <div class="stat-num" style="font-size: 24px; font-weight: 800; color: var(--warning);">PTE ${avgTarget || 79}</div>
            <div class="stat-lbl" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-top: 4px;">Avg Target</div>
          </div>
        </div>

        <!-- Class Weak Spot Matrix -->
        <div class="card-glass class-weak-spots-panel" style="padding: 16px; display:flex; flex-direction:column; justify-content:center;">
          <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px;">Class Averages</h4>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:1px;">
                <span style="color:var(--text-muted);">Speaking</span>
                <span style="font-weight:700; color:var(--accent);">${classAvgSpeaking}/90</span>
              </div>
              <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; overflow:hidden;"><div style="background:var(--accent); width:${(classAvgSpeaking/90)*100}%; height:100%;"></div></div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:1px;">
                <span style="color:var(--text-muted);">Writing</span>
                <span style="font-weight:700; color:var(--primary);">${classAvgWriting}/90</span>
              </div>
              <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; overflow:hidden;"><div style="background:var(--primary); width:${(classAvgWriting/90)*100}%; height:100%;"></div></div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:1px;">
                <span style="color:var(--text-muted);">Reading</span>
                <span style="font-weight:700; color:var(--success);">${classAvgReading}/90</span>
              </div>
              <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; overflow:hidden;"><div style="background:var(--success); width:${(classAvgReading/90)*100}%; height:100%;"></div></div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:1px;">
                <span style="color:var(--text-muted);">Listening</span>
                <span style="font-weight:700; color:var(--warning);">${classAvgListening}/90</span>
              </div>
              <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; overflow:hidden;"><div style="background:var(--warning); width:${(classAvgListening/90)*100}%; height:100%;"></div></div>
            </div>
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
                <th style="padding: 12px 16px; text-align: center;">Risk Status</th>
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
      <div class="modal-card" style="max-width: 900px; width: 95%; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
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
        
        <div class="modal-body" style="padding: 24px; max-height: 75vh; overflow-y: auto;">
          
          <!-- Competency & History Grid -->
          <div class="grid-cols-2" style="gap:20px; display:grid; grid-template-columns: 1.1fr 0.9fr; margin-bottom: 20px;">
            
            <!-- Competency Matrix -->
            <div class="card-glass" style="padding:16px;">
              <h4 style="font-size:13px; color:var(--text-primary); margin-bottom:12px;">Competency Score Matrix</h4>
              <div id="telemetry-skills-matrix" style="display:flex; flex-direction:column; gap:10px;">
                <!-- Filled dynamically -->
              </div>
            </div>

            <!-- Score History logs -->
            <div class="card-glass" style="padding:16px;">
              <h4 style="font-size:13px; color:var(--text-primary); margin-bottom:12px;">Chronological Evaluation Logs</h4>
              <div id="telemetry-history-logs" style="max-height: 150px; overflow-y:auto; padding-right:4px;">
                <!-- Filled dynamically -->
              </div>
            </div>

          </div>

          <!-- Section Diagnostics & Weakness Analysis -->
          <div class="card-glass" style="padding: 16px; margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; color: var(--text-primary); margin-bottom: 12px; display:flex; align-items:center; gap:6px;">
              <span>📈 PTE Section Diagnostics & AI Alerts</span>
            </h4>
            <div id="telemetry-diagnostics-container">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Homework Drill Assignments System -->
          <div class="grid-cols-2" style="gap:20px; display:grid; grid-template-columns: 1.1fr 0.9fr; margin-bottom: 20px;">
            
            <!-- Current Assignments List -->
            <div class="card-glass" style="padding: 16px; display: flex; flex-direction: column;">
              <h4 style="font-size: 13.5px; color: var(--text-primary); margin-bottom: 12px;">📋 Active homework Drill Status</h4>
              <div id="telemetry-assignments-list" style="flex: 1; max-height: 250px; overflow-y: auto; padding-right: 4px;">
                <!-- Filled dynamically -->
              </div>
            </div>

            <!-- Create Assignment Form -->
            <div class="card-glass" style="padding: 16px;">
              <h4 style="font-size: 13.5px; color: var(--text-primary); margin-bottom: 12px;">🎯 Assign New Practice Drill</h4>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
                <div style="display: flex; gap: 8px;">
                  <div style="flex: 1.2;">
                    <label style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); display:block; margin-bottom: 2px;">Task type</label>
                    <select id="telemetry-assign-tasktype" style="width: 100%; padding: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); border-radius: 4px;">
                      <option value="speaking">Speaking (All Types)</option>
                      <option value="read-aloud">-- Read Aloud</option>
                      <option value="repeat-sentence">-- Repeat Sentence</option>
                      <option value="writing">Writing (All Types)</option>
                      <option value="write-essay">-- Write Essay</option>
                      <option value="reading">Reading (All Types)</option>
                      <option value="fib-dropdown">-- FIB Dropdown</option>
                      <option value="listening">Listening (All Types)</option>
                      <option value="summarize-spoken">-- SST Summarize Spoken</option>
                      <option value="write-dictation">-- WFD Write From Dictation</option>
                      <option value="any">Any General Task</option>
                    </select>
                  </div>
                  <div style="flex: 0.8;">
                    <label style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); display:block; margin-bottom: 2px;">Target Drills</label>
                    <select id="telemetry-assign-count" style="width: 100%; padding: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); border-radius: 4px;">
                      <option value="1">1 Drill</option>
                      <option value="2">2 Drills</option>
                      <option value="3" selected>3 Drills</option>
                      <option value="5">5 Drills</option>
                      <option value="10">10 Drills</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); display:block; margin-bottom: 2px;">Due Date</label>
                  <input type="date" id="telemetry-assign-duedate" style="width: 100%; padding: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); display:block; margin-bottom: 2px;">Coach Instructions / Advice</label>
                  <input type="text" id="telemetry-assign-notes" placeholder="Focus on oral fluency / spelling..." style="width: 100%; padding: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); border-radius: 4px;">
                </div>
                <div>
                  <label style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); display:block; margin-bottom: 2px;">Assignment Scope</label>
                  <select id="telemetry-assign-scope" style="width: 100%; padding: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); border-radius: 4px;">
                    <option value="individual" selected>Assign to this Scholar only</option>
                    <option value="classroom">Assign to ALL linked Scholars</option>
                  </select>
                </div>
                <button id="btn-telemetry-assign" class="btn btn-accent btn-sm shadow-neon" style="margin-top: 6px; width: 100%; font-weight: 600; padding: 6px 12px; border-radius: 4px;">Push Practice Drill</button>
              </div>
            </div>

          </div>

          <!-- Advisor Training Journal & Feedback note -->
          <div class="card-glass-glow" style="padding: 16px; margin-bottom: 20px; border-color: rgba(0, 198, 255, 0.15);">
            <h4 style="font-size: 13.5px; color: var(--text-primary); margin-bottom: 10px;">✍️ Advisor Feedback Journal</h4>
            
            <!-- Notes Feed Timeline -->
            <div id="telemetry-notes-feed" style="max-height: 180px; overflow-y: auto; padding-right: 4px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
              <!-- Filled dynamically -->
            </div>

            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">Add a new coaching template recommendation, practice guidance, or advice note below:</p>
            <textarea id="telemetry-advisor-note" placeholder="Write feedback, recommendations, or adjustments for this student..." style="width: 100%; height: 75px; font-size: 12px; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.15); color: var(--text-primary); resize: none; margin-bottom: 10px; font-family: inherit; line-height: 1.4;"></textarea>
            <div style="display:flex; justify-content:flex-end;">
              <button id="btn-save-advisor-note" class="btn btn-primary btn-sm shadow-neon" style="margin-top:0; padding: 6px 14px; font-weight:600; border-radius: 4px;">Push Advice Note</button>
            </div>
          </div>

          <!-- Mistakes Telemetry Panel -->
          <div class="card-glass" style="padding: 16px;">
            <h4 style="font-size: 13.5px; color: var(--text-primary); margin-bottom: 10px; display:flex; align-items:center; justify-content:space-between; width:100%;">
              <span>⚠️ Mistakes & Study List</span>
              <span id="telemetry-mistakes-badge" class="badge-q-type" style="background: rgba(239,68,68,0.1); color: var(--error); border-color: rgba(239,68,68,0.2); font-weight: 700;">0 Tasks</span>
            </h4>
            <div id="telemetry-mistakes-list" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;">
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
          copyBtn.textContent = "Copy";
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
          <td colspan="8" style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px;">
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
      
      // Compute Risk Profile
      const target = prog.targetScore || 79;
      const overall = lastScore.overall || 0;
      let riskLabel = "On Track";
      let riskBadgeStyle = "background: rgba(16,185,129,0.08); color: var(--success); border-color: rgba(16,185,129,0.15);";
      
      if (overall === 0) {
        riskLabel = "At Risk (Idle)";
        riskBadgeStyle = "background: rgba(239,68,68,0.08); color: var(--error); border-color: rgba(239,68,68,0.15);";
      } else {
        const diff = target - overall;
        if (diff > 10) {
          riskLabel = "At Risk";
          riskBadgeStyle = "background: rgba(239,68,68,0.08); color: var(--error); border-color: rgba(239,68,68,0.15);";
        } else if (diff > 0) {
          riskLabel = "Needs Review";
          riskBadgeStyle = "background: rgba(245,158,11,0.08); color: var(--warning); border-color: rgba(245,158,11,0.15);";
        }
      }

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 12px 16px; vertical-align: middle;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom: 6px;">
            <img src="${s.avatar || generateInitialsSvg(s.name)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
            <div>
              <div style="font-weight:600; color:var(--text-primary); font-size:13.5px;">${s.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${s.email}</div>
            </div>
          </div>
          <!-- Mini Communicative Skills bars -->
          <div style="display: flex; gap: 8px; font-size: 8px; width: 100%; max-width: 200px;">
            <div style="flex: 1;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:7.5px;"><span>S</span><span>${lastScore.speaking || 0}</span></div>
              <div style="background:rgba(255,255,255,0.05); height:2px; border-radius:1px;"><div style="background:var(--accent); width:${((lastScore.speaking || 0)/90)*100}%; height:100%; border-radius:1px;"></div></div>
            </div>
            <div style="flex: 1;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:7.5px;"><span>W</span><span>${lastScore.writing || 0}</span></div>
              <div style="background:rgba(255,255,255,0.05); height:2px; border-radius:1px;"><div style="background:var(--primary); width:${((lastScore.writing || 0)/90)*100}%; height:100%; border-radius:1px;"></div></div>
            </div>
            <div style="flex: 1;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:7.5px;"><span>R</span><span>${lastScore.reading || 0}</span></div>
              <div style="background:rgba(255,255,255,0.05); height:2px; border-radius:1px;"><div style="background:var(--success); width:${((lastScore.reading || 0)/90)*100}%; height:100%; border-radius:1px;"></div></div>
            </div>
            <div style="flex: 1;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:7.5px;"><span>L</span><span>${lastScore.listening || 0}</span></div>
              <div style="background:rgba(255,255,255,0.05); height:2px; border-radius:1px;"><div style="background:var(--warning); width:${((lastScore.listening || 0)/90)*100}%; height:100%; border-radius:1px;"></div></div>
            </div>
          </div>
        </td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--warning); vertical-align: middle;">PTE ${target}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--accent); font-size: 14px; vertical-align: middle;">${overall} <span style="font-size:10px; color:var(--text-muted); font-weight:400;">/90</span></td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--success); vertical-align: middle;">🔥 ${prog.streak || 0}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight:600; color:var(--text-primary); vertical-align: middle;">${prog.points || 0} pts</td>
        <td style="padding: 12px 16px; text-align: center; vertical-align: middle;">
          <span class="badge-q-type" style="background: ${mistakesCount > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)'}; color: ${mistakesCount > 0 ? 'var(--error)' : 'var(--success)'}; border-color: ${mistakesCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}; font-weight:700;">
            ${mistakesCount} Tasks
          </span>
        </td>
        <td style="padding: 12px 16px; text-align: center; vertical-align: middle;">
          <span class="badge-q-type" style="${riskBadgeStyle} font-weight:700;">
            ${riskLabel}
          </span>
        </td>
        <td style="padding: 12px 16px; text-align: center; vertical-align: middle;">
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
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
          <span style="font-weight:600; color:var(--text-primary);">${sk.name}</span>
          <span style="font-weight:700; color:${sk.color}">${sk.score} <span style="font-weight:400; color:var(--text-muted); font-size:9.5px;">/90</span></span>
        </div>
        <div style="background:rgba(255,255,255,0.05); height:5px; border-radius:2.5px; overflow:hidden; width:100%;">
          <div style="background:${sk.color}; width:${(sk.score / 90) * 100}%; height:100%; border-radius:2.5px;"></div>
        </div>
      `;
      matrixContainer.appendChild(row);
    });

    // Populate history logs
    const historyContainer = document.getElementById('telemetry-history-logs');
    historyContainer.innerHTML = '';
    if (scoreHist.length === 0) {
      historyContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size:12px;">No practice evaluations recorded yet.</div>`;
    } else {
      scoreHist.slice().reverse().forEach(log => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.fontSize = '11.5px';
        item.style.padding = '6px 0';
        item.style.borderBottom = '1px dashed var(--border-color)';
        item.innerHTML = `
          <span style="color:var(--text-secondary);">${log.date || 'Practice Session'}</span>
          <span style="font-weight:700; color:var(--accent);">PTE ${log.overall}</span>
        `;
        historyContainer.appendChild(item);
      });
    }

    // Populate diagnostics & weak spots
    const diagnosticsContainer = document.getElementById('telemetry-diagnostics-container');
    const completedList = prog.completedTasks || [];
    
    // Count practices of key tasks
    const raCount = completedList.filter(id => id.startsWith('RA') || id.includes('read-aloud')).length;
    const rsCount = completedList.filter(id => id.startsWith('RS') || id.includes('repeat-sentence')).length;
    const weCount = completedList.filter(id => id.startsWith('WE') || id.includes('essay')).length;
    const wfdCount = completedList.filter(id => id.startsWith('WFD') || id.includes('dictation')).length;
    
    let alertsHtml = '';
    if (rsCount === 0) {
      alertsHtml += `<div style="padding: 8px 12px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 4px; color: var(--error); margin-bottom: 8px; font-size: 11.5px; display: flex; gap: 8px; align-items: center;">
        <span>🔴</span>
        <div><b>Practice Gap:</b> Repeat Sentence (RS) has 0 drills completed. RS represents ~30% of Speaking/Listening weight.</div>
      </div>`;
    }
    if (wfdCount === 0) {
      alertsHtml += `<div style="padding: 8px 12px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 4px; color: var(--error); margin-bottom: 8px; font-size: 11.5px; display: flex; gap: 8px; align-items: center;">
        <span>🔴</span>
        <div><b>Practice Gap:</b> Write From Dictation (WFD) has 0 drills completed. WFD is the highest-weight Listening/Writing task.</div>
      </div>`;
    } else if (lastScore.listening < 65 && lastScore.listening > 0) {
      alertsHtml += `<div style="padding: 8px 12px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); border-radius: 4px; color: var(--warning); margin-bottom: 8px; font-size: 11.5px; display: flex; gap: 8px; align-items: center;">
        <span>🟡</span>
        <div><b>Listening Remediation:</b> Listening average is ${lastScore.listening}/90. Increase Write From Dictation drills.</div>
      </div>`;
    }
    
    const oralFluency = lastScore.speaking >= 79 ? 'A+ (Fluent)' : (lastScore.speaking >= 65 ? 'B (Moderate)' : (lastScore.speaking > 0 ? 'C (Needs Work)' : 'N/A'));
    const grammar = lastScore.writing >= 79 ? 'A+ (Accurate)' : (lastScore.writing >= 65 ? 'B (Good)' : (lastScore.writing > 0 ? 'C (Review)' : 'N/A'));
    
    diagnosticsContainer.innerHTML = `
      ${alertsHtml === '' ? `
        <div style="padding: 8px 12px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); border-radius: 4px; color: var(--success); margin-bottom: 12px; font-size: 11.5px; display: flex; gap: 8px; align-items: center;">
          <span>🟩</span>
          <div><b>PTE Metrics Safe:</b> Scholar is performing consistently. All diagnostics thresholds are satisfied.</div>
        </div>
      ` : alertsHtml}
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px; font-size: 11px;">
        <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">
          <span style="color:var(--text-muted); display:block; font-size: 9px; text-transform: uppercase;">Repeat Sentence</span>
          <span style="font-weight: 700; color: var(--text-primary); font-size: 12px; display:block; margin-top: 2px;">${rsCount} Completed</span>
        </div>
        <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">
          <span style="color:var(--text-muted); display:block; font-size: 9px; text-transform: uppercase;">Write Dictation</span>
          <span style="font-weight: 700; color: var(--text-primary); font-size: 12px; display:block; margin-top: 2px;">${wfdCount} Completed</span>
        </div>
        <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">
          <span style="color:var(--text-muted); display:block; font-size: 9px; text-transform: uppercase;">Oral Fluency</span>
          <span style="font-weight: 700; color: var(--accent); font-size: 12px; display:block; margin-top: 2px;">${oralFluency}</span>
        </div>
        <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">
          <span style="color:var(--text-muted); display:block; font-size: 9px; text-transform: uppercase;">Grammar Range</span>
          <span style="font-weight: 700; color: var(--primary); font-size: 12px; display:block; margin-top: 2px;">${grammar}</span>
        </div>
      </div>
    `;

    // Populate assignments list
    const assignmentsList = document.getElementById('telemetry-assignments-list');
    const populateAssignments = () => {
      const asms = prog.assignments || [];
      assignmentsList.innerHTML = '';
      if (asms.length === 0) {
        assignmentsList.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size:12px; border: 1px dashed var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">No active drills assigned yet. Use the tool on the right to assign homework.</div>`;
      } else {
        asms.slice().reverse().forEach(asm => {
          const pct = Math.min(Math.round((asm.completedCount / asm.targetCount) * 100), 100);
          let badgeStyle = "background: rgba(0, 198, 255, 0.08); color: var(--accent); border-color: rgba(0, 198, 255, 0.15);";
          let statusText = "Pending";
          
          if (asm.status === 'completed') {
            badgeStyle = "background: rgba(16, 185, 129, 0.08); color: var(--success); border-color: rgba(16, 185, 129, 0.15);";
            statusText = "Completed";
          } else {
            const isOverdue = new Date(asm.dueDate) < new Date();
            if (isOverdue) {
              badgeStyle = "background: rgba(239, 68, 68, 0.08); color: var(--error); border-color: rgba(239, 68, 68, 0.15);";
              statusText = "Overdue";
            }
          }
          
          const div = document.createElement('div');
          div.style.padding = '8px 12px';
          div.style.border = '1px solid var(--border-color)';
          div.style.borderRadius = '4px';
          div.style.marginBottom = '8px';
          div.style.background = 'rgba(255,255,255,0.01)';
          div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <span style="font-weight: 600; color: var(--text-primary); font-size:12px;">${asm.title}</span>
              <span class="badge-q-type" style="${badgeStyle} font-size: 9px; font-weight:700;">${statusText}</span>
            </div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 6px; display:flex; justify-content:space-between;">
              <span>Target: ${asm.completedCount}/${asm.targetCount} drills</span>
              <span>Due: ${asm.dueDate}</span>
            </div>
            <div style="background: rgba(255,255,255,0.05); height: 4px; border-radius: 2px; overflow:hidden;">
              <div style="background: var(--accent); width: ${pct}%; height: 100%;"></div>
            </div>
            ${asm.notes ? `<div style="font-size: 9.5px; color: var(--text-muted); font-style: italic; margin-top: 4px;">Advice: "${asm.notes}"</div>` : ''}
          `;
          assignmentsList.appendChild(div);
        });
      }
    };
    populateAssignments();

    // Setup due date picker default value (7 days out)
    const dueInput = document.getElementById('telemetry-assign-duedate');
    if (dueInput) {
      const weekOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      dueInput.value = weekOut.toISOString().split('T')[0];
    }

    // Bind Assign button
    const assignBtn = document.getElementById('btn-telemetry-assign');
    if (assignBtn) {
      const newAssignBtn = assignBtn.cloneNode(true);
      assignBtn.parentNode.replaceChild(newAssignBtn, assignBtn);
      
      newAssignBtn.addEventListener('click', () => {
        const taskType = document.getElementById('telemetry-assign-tasktype').value;
        const count = parseInt(document.getElementById('telemetry-assign-count').value);
        const dueDateVal = document.getElementById('telemetry-assign-duedate').value;
        const notes = document.getElementById('telemetry-assign-notes').value.trim();
        const scope = document.getElementById('telemetry-assign-scope').value;

        const taskLabels = {
          'speaking': 'Speaking Exercises',
          'read-aloud': 'Read Aloud Drills',
          'repeat-sentence': 'Repeat Sentence Drills',
          'writing': 'Writing Exercises',
          'write-essay': 'Write Essay Drills',
          'reading': 'Reading Exercises',
          'fib-dropdown': 'FIB Dropdown Drills',
          'listening': 'Listening Exercises',
          'summarize-spoken': 'SST Summarize Spoken Drills',
          'write-dictation': 'WFD Write From Dictation Drills',
          'any': 'PTE Practice Exercises'
        };

        const formattedDueDate = dueDateVal ? new Date(dueDateVal).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });

        const newAsmObj = {
          id: 'asm-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          title: `Practice ${count} ${taskLabels[taskType] || 'PTE Drills'}`,
          taskType,
          targetCount: count,
          completedCount: 0,
          completedTasks: [],
          status: 'pending',
          assignedDate: new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
          dueDate: formattedDueDate,
          notes,
          advisorName: currentUser.name
        };

        if (scope === 'individual') {
          if (!student.progress.assignments) student.progress.assignments = [];
          student.progress.assignments.push(newAsmObj);
          
          Database.saveAccount(student);
          
          // Refresh local caches
          const idx = myStudents.findIndex(ms => ms.email === student.email);
          if (idx !== -1) myStudents[idx] = student;
          
          window.showToast(`Homework drill assigned to ${student.name}!`, "success");
        } else {
          // Assign to entire classroom
          const accountsList = Database.getAccounts();
          accountsList.forEach(acc => {
            if (acc.role === 'student' && acc.linked_faculty_id === currentUser.faculty_code) {
              if (!acc.progress) acc.progress = {};
              if (!acc.progress.assignments) acc.progress.assignments = [];
              
              // Push copy of assignment
              const individualAsm = { ...newAsmObj, id: 'asm-' + Math.random().toString(36).substring(2, 8).toUpperCase() };
              acc.progress.assignments.push(individualAsm);
              Database.saveAccount(acc);
            }
          });
          
          // Sync classroom progress in myStudents
          myStudents.forEach(ms => {
            if (!ms.progress) ms.progress = {};
            if (!ms.progress.assignments) ms.progress.assignments = [];
            ms.progress.assignments.push({ ...newAsmObj });
          });
          
          window.showToast(`Homework drill assigned to all ${myStudents.length} scholars!`, "success");
        }

        // Clear input notes
        document.getElementById('telemetry-assign-notes').value = '';
        populateAssignments();
        renderFaculty(container); // Refresh parent view metrics
      });
    }

    // Populate notes feed
    const notesFeed = document.getElementById('telemetry-notes-feed');
    const populateNotesFeed = () => {
      const notesLog = prog.advisorFeedbackLog || [];
      notesFeed.innerHTML = '';
      
      // Backwards compatibility fallback
      if (notesLog.length === 0 && prog.advisorFeedback) {
        notesLog.push({
          date: 'Recent Note',
          text: prog.advisorFeedback,
          author: prog.advisorName || currentUser.name
        });
      }

      if (notesLog.length === 0) {
        notesFeed.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:12px; border: 1px dashed var(--border-color); border-radius: 4px; background: rgba(255,255,255,0.01);">No notes journal entries yet.</div>`;
      } else {
        notesLog.forEach(note => {
          const card = document.createElement('div');
          card.style.padding = '8px 12px';
          card.style.borderLeft = '2px solid var(--accent)';
          card.style.background = 'rgba(255,255,255,0.01)';
          card.style.fontSize = '11.5px';
          card.style.borderRadius = '0 4px 4px 0';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:9.5px; color:var(--text-muted); margin-bottom: 2px;">
              <span>Coach ${note.author || 'Advisor'}</span>
              <span>${note.date}</span>
            </div>
            <div style="color:var(--text-primary); line-height: 1.4; word-break: break-word;">${note.text}</div>
          `;
          notesFeed.appendChild(card);
        });
      }
    };
    populateNotesFeed();

    // Save advisor feedback note button binder
    const saveNoteBtn = document.getElementById('btn-save-advisor-note');
    if (saveNoteBtn) {
      const newBtn = saveNoteBtn.cloneNode(true);
      saveNoteBtn.parentNode.replaceChild(newBtn, saveNoteBtn);
      
      newBtn.addEventListener('click', () => {
        const feedbackValue = document.getElementById('telemetry-advisor-note').value.trim();
        if (!feedbackValue) return;

        // Update student progress profile
        if (!student.progress) student.progress = {};
        if (!student.progress.advisorFeedbackLog) student.progress.advisorFeedbackLog = [];
        
        const newNoteObj = {
          date: new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
          text: feedbackValue,
          author: currentUser.name
        };
        
        student.progress.advisorFeedbackLog.push(newNoteObj);
        student.progress.advisorFeedback = feedbackValue; // backwards compatibility
        student.progress.advisorName = currentUser.name;
        
        // Save to database
        Database.saveAccount(student);
        
        // Refresh local cache representation of student progress in myStudents array
        const idx = myStudents.findIndex(ms => ms.email === student.email);
        if (idx !== -1) myStudents[idx] = student;
        
        window.showToast(`Advice note posted to ${student.name}'s cockpit journal!`, "success");
        document.getElementById('telemetry-advisor-note').value = '';
        populateNotesFeed();
      });
    }

    // Populate mistakes list
    const mistakesBadge = document.getElementById('telemetry-mistakes-badge');
    mistakesBadge.textContent = `${uncleared.length} Task${uncleared.length === 1 ? '' : 's'}`;

    const mistakesList = document.getElementById('telemetry-mistakes-list');
    mistakesList.innerHTML = '';

    if (uncleared.length === 0) {
      mistakesList.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; border: 1px dashed var(--border-color); border-radius:var(--radius-sm); background:rgba(16,185,129,0.02); gap:8px; width:100%;">
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
        item.style.padding = '8px 12px';
        item.style.background = 'rgba(255,255,255,0.01)';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = 'var(--radius-sm)';
        item.style.marginBottom = '6px';
        
        let typeBadgeColor = 'var(--accent)';
        if (question && question.taskType) {
          if (question.taskType.includes('write') || question.taskType.includes('essay')) typeBadgeColor = 'var(--primary)';
          if (question.taskType.includes('read') || question.taskType.includes('fib')) typeBadgeColor = 'var(--success)';
          if (question.taskType.includes('listen') || question.taskType.includes('sst')) typeBadgeColor = 'var(--warning)';
        }

        item.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="badge-q-type" style="background: rgba(255,255,255,0.03); color: ${typeBadgeColor}; border-color: ${typeBadgeColor}44; font-size:10px; font-weight:700; text-transform: uppercase;">
              ${question ? question.id : qId}
            </span>
            <div>
              <div style="font-size:12px; font-weight:600; color:var(--text-primary);">${question ? question.title : 'PTE Practice Exercise'}</div>
              <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px; text-transform: capitalize;">Difficulty: ${question ? question.difficulty : 'Medium'} | Type: ${(question && question.taskType) ? question.taskType.replace('-', ' ') : 'Exercise'}</div>
            </div>
          </div>
          <span style="font-size:10.5px; font-weight:600; padding:2px 6px; border-radius:3px; background:rgba(239,68,68,0.1); color:var(--error);">Uncleared</span>
        `;
        mistakesList.appendChild(item);
      });
    }

    // Show modal
    modal.classList.remove('hidden');
  };
}
