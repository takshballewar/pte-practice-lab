/* FluentAI Progress Dashboard & SVG Custom Graphs */

import { Database } from '../db.js?v=33';
import { Router } from '../router.js?v=33';

export function renderDashboard(container) {
  const progress = Database.getProgress();
  const user = Database.getUser() || {};
  
  // Calculate average score for circular chart
  const lastScore = progress.scoreHistory[progress.scoreHistory.length - 1] || {
    speaking: 0,
    writing: 0,
    reading: 0,
    listening: 0,
    overall: 0
  };
  const overallAvg = lastScore.overall;
  const targetPct = progress.targetScore ? Math.round((overallAvg / progress.targetScore) * 100) : 0;

  // Countdown calculations
  const calculateDaysLeft = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const daysLeft = calculateDaysLeft(progress.examDate);

  container.innerHTML = `
    <div class="grid-dashboard">
      <!-- LEFT HAND CONTENT: SCORING TRENDS & SKILLS -->
      <div class="dashboard-left-deck">
        <!-- SCORE OVERVIEW BANNER -->
        <div class="grid-cols-2" style="margin-bottom: 24px;">
          <!-- Core Target Card -->
          <div class="card-glass-glow overview-score-box">
            <div class="score-details">
              <h3>Overall Skill Average</h3>
              <div class="huge-score">${overallAvg}<span>/90</span></div>
              <p style="font-size:12px; color:var(--text-secondary); margin-top:8px;">Target Score: <b>PTE ${progress.targetScore}</b></p>
            </div>
            
            <div class="overall-progress-indicator">
              <svg class="svg-ring" width="100" height="100">
                <circle class="svg-ring-bg" stroke-width="6" fill="transparent" r="45" cx="50" cy="50"/>
                <!-- stroke-dashoffset = circumference - (pct / 100 * circumference) -->
                <!-- Circumference = 2 * PI * r = 2 * 3.14159 * 45 = 282.74 -->
                <circle id="dash-circle-fill" class="svg-ring-fill" stroke-width="6" fill="transparent" r="45" cx="50" cy="50"
                  stroke-dashoffset="${282.74 - (Math.min(targetPct, 100) / 100) * 282.74}"/>
                <defs>
                  <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--accent)"/>
                    <stop offset="100%" stop-color="var(--primary)"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-percentage">${targetPct}%</div>
            </div>
          </div>

          <!-- Streak tracker card -->
          <div class="card-glass streak-tracker-widget">
            <div class="card-title-flex" style="margin-bottom: 8px;">
              <span class="tracker-title">Practice Consistency (Weekly Logs)</span>
              <span style="font-size:12px; color:var(--warning); font-weight:600;">🔥 ${progress.streak} Day Streak</span>
            </div>
            <div class="streak-days-row">
              <div class="streak-day completed"><span class="day-label">Mon</span><div class="day-indicator">M</div></div>
              <div class="streak-day completed"><span class="day-label">Tue</span><div class="day-indicator">T</div></div>
              <div class="streak-day completed"><span class="day-label">Wed</span><div class="day-indicator">W</div></div>
              <div class="streak-day completed"><span class="day-label">Thu</span><div class="day-indicator">T</div></div>
              <div class="streak-day today"><span class="day-label">Fri</span><div class="day-indicator">F</div></div>
              <div class="streak-day"><span class="day-label">Sat</span><div class="day-indicator">S</div></div>
              <div class="streak-day"><span class="day-label">Sun</span><div class="day-indicator">S</div></div>
            </div>
          </div>
        </div>

        <!-- PROGRESS TREND GRAPH CARD -->
        <div class="card-glass progression-trend-card" style="margin-bottom: 24px;">
          <div class="card-title-flex">
            <h3>Chronological Progression Trend</h3>
            <span style="font-size: 12px; color: var(--text-muted);">PTE Academic Index</span>
          </div>
          <div class="chart-canvas-wrapper" id="dashboard-trend-chart-box">
            <!-- Programmatic SVG Trend Line Chart -->
          </div>
        </div>

        <!-- SKILLS MATRIX DISPLAY -->
        <div class="dashboard-skills-section">
          <h3>Target Competency Matrix</h3>
          <div class="skills-deck-grid">
            
            <!-- Speaking -->
            <div class="card-glass mini-skill-card">
              <div class="skill-header-flex">
                <div class="skill-icon-name">
                  <div class="skill-circle-icon" style="background:rgba(0,198,255,0.1); color:var(--accent);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                  </div>
                  <span class="skill-name-label">Speaking</span>
                </div>
                <span class="skill-score-label" style="color:var(--accent);">${lastScore.speaking}</span>
              </div>
              <div class="progressbar-outer"><div class="progressbar-inner speaking-color" style="width:${(lastScore.speaking/90)*100}%"></div></div>
              <div class="skill-meta"><span>Last: Read Aloud</span><a href="#practice" style="color:var(--accent); text-decoration:none;">Practice</a></div>
            </div>

            <!-- Writing -->
            <div class="card-glass mini-skill-card">
              <div class="skill-header-flex">
                <div class="skill-icon-name">
                  <div class="skill-circle-icon" style="background:rgba(108,99,255,0.1); color:var(--primary);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </div>
                  <span class="skill-name-label">Writing</span>
                </div>
                <span class="skill-score-label" style="color:var(--primary);">${lastScore.writing}</span>
              </div>
              <div class="progressbar-outer"><div class="progressbar-inner writing-color" style="width:${(lastScore.writing/90)*100}%"></div></div>
              <div class="skill-meta"><span>Last: Essay</span><a href="#practice" style="color:var(--primary); text-decoration:none;">Practice</a></div>
            </div>

            <!-- Reading -->
            <div class="card-glass mini-skill-card">
              <div class="skill-header-flex">
                <div class="skill-icon-name">
                  <div class="skill-circle-icon" style="background:rgba(16,185,129,0.1); color:var(--success);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </div>
                  <span class="skill-name-label">Reading</span>
                </div>
                <span class="skill-score-label" style="color:var(--success);">${lastScore.reading}</span>
              </div>
              <div class="progressbar-outer"><div class="progressbar-inner reading-color" style="width:${(lastScore.reading/90)*100}%"></div></div>
              <div class="skill-meta"><span>Last: FIB blanks</span><a href="#practice" style="color:var(--success); text-decoration:none;">Practice</a></div>
            </div>

            <!-- Listening -->
            <div class="card-glass mini-skill-card">
              <div class="skill-header-flex">
                <div class="skill-icon-name">
                  <div class="skill-circle-icon" style="background:rgba(245,158,11,0.1); color:var(--warning);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  </div>
                  <span class="skill-name-label">Listening</span>
                </div>
                <span class="skill-score-label" style="color:var(--warning);">${lastScore.listening}</span>
              </div>
              <div class="progressbar-outer"><div class="progressbar-inner listening-color" style="width:${(lastScore.listening/90)*100}%"></div></div>
              <div class="skill-meta"><span>Last: SST Spoken</span><a href="#practice" style="color:var(--warning); text-decoration:none;">Practice</a></div>
            </div>

          </div>
        </div>
      </div>

      <!-- RIGHT HAND CONTENT: AI ADVISOR, RADAR & COUNTDOWNS -->
      <div class="dashboard-right-deck">
        <!-- FACULTY COACHING BOARD -->
        ${progress.linked_faculty_id || user.linked_faculty_id ? `
        <div class="card-glass-glow faculty-coaching-card" style="margin-bottom: 24px; border-color: rgba(139, 92, 246, 0.25);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">👨‍🏫</span>
              <h4 style="font-size:12.5px; color:var(--text-primary); margin:0;">Coach's Training Desk</h4>
            </div>
            <span style="font-size:9.5px; font-family:monospace; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:3px; color:var(--text-muted);">
              ID: ${progress.linked_faculty_id || user.linked_faculty_id}
            </span>
          </div>

          <!-- Coach Feedback -->
          ${progress.advisorFeedback ? `
          <div style="background: rgba(139, 92, 246, 0.05); padding: 10px; border-left: 2px solid var(--accent); border-radius: 0 4px 4px 0; margin-bottom: 12px; font-size: 11px;">
            <div style="font-size: 9px; color: var(--text-muted); margin-bottom: 2px; font-weight:700;">LATEST COACH FEEDBACK</div>
            <div style="color:var(--text-primary); line-height: 1.4;">"${progress.advisorFeedback}"</div>
          </div>
          ` : ''}

          <!-- Assigned Drills -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px;">Active Drills Assigned</span>
            ${(!progress.assignments || progress.assignments.filter(a => a.status === 'pending').length === 0) ? `
              <div style="font-size:10.5px; color:var(--text-muted); text-align:center; padding: 10px; border: 1px dashed var(--border-color); border-radius:4px; background:rgba(255,255,255,0.01);">
                No pending drills assigned by your coach.
              </div>
            ` : progress.assignments.filter(a => a.status === 'pending').map(asm => {
                const pct = Math.round((asm.completedCount / asm.targetCount) * 100);
                return `
                <div style="padding: 8px; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: 4px; font-size:11px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                    <span style="font-weight:600; color:var(--text-primary);">${asm.title}</span>
                    <span style="color:var(--accent); font-weight:700;">${asm.completedCount}/${asm.targetCount}</span>
                  </div>
                  <div style="background: rgba(255,255,255,0.05); height: 3px; border-radius: 1.5px; overflow:hidden; margin-top:4px; margin-bottom:4px;">
                    <div style="background: var(--accent); width: ${pct}%; height: 100%;"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:9.5px; color:var(--text-muted); margin-top:2px;">
                    <span>Due: ${asm.dueDate}</span>
                    <a href="#practice" style="color:var(--accent); text-decoration:none; font-weight:600;">Practice Now &rarr;</a>
                  </div>
                </div>
                `;
            }).join('')}
          </div>
        </div>
        ` : `
        <!-- Unlinked advisor callout -->
        <div class="card-glass" style="margin-bottom: 24px; padding: 16px; font-size: 11.5px; line-height: 1.4; border-color: rgba(255,255,255,0.02);">
          <h4 style="margin: 0 0 6px 0; color: var(--text-secondary); display:flex; align-items:center; gap:6px;">
            <span>👨‍🏫 Link Coach Profile</span>
          </h4>
          <p style="color: var(--text-muted); margin: 0 0 10px 0;">Enter your Coach's Faculty ID in profile settings to sync mistake telemetry and receive training assignments.</p>
          <a href="#profile" class="btn btn-outline btn-xs" style="margin-top:0; text-align:center; display:block; font-size:10px; font-weight:600; text-transform:none; border-color:var(--accent); color:var(--accent);">Open Profile Settings</a>
        </div>
        `}

        <!-- AI RECOMMENDATION CARD -->
        <div class="card-glass-glow ai-recommendation-card" style="margin-bottom: 24px;">
          <div class="ai-recommend-header">
            <span class="ai-spark-icon">✨</span>
            <span style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--accent);">AI Tutor Recommendation</span>
          </div>
          <div class="ai-recommend-body">
            <h4>Focus on Writing Essay structure</h4>
            <p>Your spelling is flawless, but your lexical diversity matches are currently holding back your Writing score (average ${lastScore.writing}). Practice essay structures to boost synonyms usage.</p>
            <button id="dashboard-cta-recommend" class="btn btn-accent btn-sm shadow-neon" style="width:100%;">Practice Recommended Task</button>
          </div>
        </div>

        <!-- COMPETENCY SPIDER CHART -->
        <div class="card-glass" style="margin-bottom: 24px;">
          <h3>Competency Radar Matrix</h3>
          <div class="radar-chart-container" id="dashboard-radar-box">
            <!-- Programmatic SVG Radar spider web -->
          </div>
        </div>

        <!-- countdown to PTE -->
        <div class="card-glass" style="margin-bottom: 24px;">
          <h3>Official Exam Target</h3>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Date: <b>${progress.examDate || 'Not Set'}</b></p>
          <div class="dashboard-countdown-box">
            <div class="countdown-unit">
              <span class="countdown-val">${daysLeft}</span>
              <span class="countdown-lbl">Days</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-val">14</span>
              <span class="countdown-lbl">Hours</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-val">45</span>
              <span class="countdown-lbl">Mins</span>
            </div>
          </div>
          <button id="dashboard-mock-btn" class="btn btn-primary btn-sm shadow-neon" style="width:100%; margin-top: 16px;">Enter Mock Exam Room</button>
        </div>

      </div>
    </div>
  `;

  // Bind Actions
  document.getElementById('dashboard-cta-recommend').addEventListener('click', () => {
    Router.navigate('practice');
  });

  document.getElementById('dashboard-mock-btn').addEventListener('click', () => {
    Router.navigate('mocktest');
  });



  // Render Programmatic charts
  renderTrendChart(progress.scoreHistory);
  renderRadarChart(lastScore);
}

// Renders custom interactive line chart using SVG
function renderTrendChart(history) {
  const chartBox = document.getElementById('dashboard-trend-chart-box');
  if (!chartBox) return;

  if (!history || history.length === 0) {
    chartBox.innerHTML = `
      <div style="height: 220px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: rgba(255,255,255,0.02);">
        No score history yet. Start practice or a mock test to see your progress trend!
      </div>
    `;
    return;
  }

  const width = chartBox.clientWidth;
  const height = 220;
  
  // Calculate SVG plot coordinates
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = 90;
  const minVal = 50;

  // Build grid lines
  let gridLinesHTML = '';
  const gridTicks = [50, 60, 70, 80, 90];
  gridTicks.forEach(tick => {
    const y = paddingTop + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
    gridLinesHTML += `
      <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
      <text class="chart-axis-text" x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end">${tick}</text>
    `;
  });

  // Plot data lines
  const points = history.map((entry, idx) => {
    const x = paddingLeft + (idx / (history.length - 1)) * chartW;
    const y = paddingTop + chartH - ((entry.overall - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, overall: entry.overall, date: entry.date };
  });

  // Build line path
  let pathD = '';
  points.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y}`;
    } else {
      pathD += ` L ${p.x} ${p.y}`;
    }
  });

  // Build path area fill
  let areaD = pathD + ` L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

  // Draw points circles & labels
  let pointsHTML = '';
  let labelsHTML = '';
  points.forEach(p => {
    pointsHTML += `
      <circle class="chart-dots" cx="${p.x}" cy="${p.y}" r="5" />
      <text class="chart-axis-text" x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="var(--accent)" font-weight="600">${p.overall}</text>
    `;
    labelsHTML += `
      <text class="chart-axis-text" x="${p.x}" y="${height - 10}" text-anchor="middle">${p.date}</text>
    `;
  });

  chartBox.innerHTML = `
    <svg class="svg-chart" width="${width}" height="${height}">
      <defs>
        <linearGradient id="chart-glow-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1396e2" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#1396e2" stop-opacity="0.01"/>
        </linearGradient>
        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#122c5e"/>
          <stop offset="100%" stop-color="#1396e2"/>
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridLinesHTML}
      
      <!-- Area Fill -->
      <path d="${areaD}" fill="url(#chart-glow-fill)" />
      
      <!-- Line -->
      <path d="${pathD}" class="chart-line" stroke="url(#line-gradient)" />
      
      <!-- Dots -->
      ${pointsHTML}
      
      <!-- X Labels -->
      ${labelsHTML}
    </svg>
  `;
}

// Renders spider radar chart using SVG
function renderRadarChart(scores) {
  const radarBox = document.getElementById('dashboard-radar-box');
  if (!radarBox) return;

  const width = 240;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 80;

  // Radar categories (speaking, writing, reading, listening)
  const skills = [
    { name: "Speaking", val: scores.speaking },
    { name: "Writing", val: scores.writing },
    { name: "Reading", val: scores.reading },
    { name: "Listening", val: scores.listening }
  ];

  // 4 corners of radar (90 degree intervals)
  const angles = [0, 90, 180, 270];

  const getCoordinates = (angleDegrees, radius) => {
    const angleRad = (angleDegrees - 90) * (Math.PI / 180);
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);
    return { x, y };
  };

  // Draw concentric polygon web borders (grids 50, 70, 90)
  let websHTML = '';
  const concentric = [30, 55, 80]; // Radii representing score divisions
  concentric.forEach(rad => {
    let pts = angles.map(ang => {
      const { x, y } = getCoordinates(ang, rad);
      return `${x},${y}`;
    }).join(' ');
    websHTML += `<polygon class="radar-web" points="${pts}" />`;
  });

  // Draw axis lines & labels
  let axesHTML = '';
  skills.forEach((skill, idx) => {
    const ang = angles[idx];
    const borderPt = getCoordinates(ang, maxRadius);
    const labelPt = getCoordinates(ang, maxRadius + 16);
    
    axesHTML += `
      <line class="radar-axis-line" x1="${cx}" y1="${cy}" x2="${borderPt.x}" y2="${borderPt.y}" />
      <text class="chart-axis-text" x="${labelPt.x}" y="${labelPt.y + 4}" text-anchor="middle">${skill.name}</text>
    `;
  });

  // Calculate scores polygon points
  const scorePoints = skills.map((skill, idx) => {
    const scale = skill.val / 90; // scale factor
    const rad = scale * maxRadius;
    const { x, y } = getCoordinates(angles[idx], rad);
    return `${x},${y}`;
  }).join(' ');

  radarBox.innerHTML = `
    <svg width="${width}" height="${height}">
      <!-- Web meshes -->
      ${websHTML}
      
      <!-- Axis spokes -->
      ${axesHTML}
      
      <!-- Score Polygon -->
      <polygon class="radar-polygon" points="${scorePoints}" />
    </svg>
  `;
}
