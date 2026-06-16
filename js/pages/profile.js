/* FluentAI Profile & AI Study Plan Generator Component */

import { Database } from '../db.js?v=25';

function generateInitialsSvg(name) {
  const initialsText = name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TS';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:%231396e2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="75" cy="75" r="75" fill="url(%23avatarGrad)" />
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">${initialsText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export function renderProfile(container) {
  const user = Database.getUser();
  const progress = Database.getProgress();

  const renderView = () => {
    const avatarUrl = user && user.avatar ? user.avatar : generateInitialsSvg(user ? user.name : 'Vivek Ballewar');
    container.innerHTML = `
      <div class="profile-grid">
        <!-- LEFT COLUMN: AVATAR CARD & TARGET STATS -->
        <aside class="profile-sidebar-card card-glass">
          <div class="profile-large-avatar">
            <img src="${avatarUrl}" alt="User Avatar Large">
          </div>
          <h3 style="font-size: 18px; margin-bottom: 4px;">${user ? user.name : 'Vivek Ballewar'}</h3>
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
              
              <div class="input-group">
                <label for="prof-target-speaking">Target Speaking</label>
                <select id="prof-target-speaking">
                  <option value="50" ${progress.targetSpeaking === 50 ? 'selected' : ''}>PTE 50</option>
                  <option value="65" ${progress.targetSpeaking === 65 ? 'selected' : ''}>PTE 65</option>
                  <option value="79" ${progress.targetSpeaking === 79 || !progress.targetSpeaking ? 'selected' : ''}>PTE 79</option>
                  <option value="90" ${progress.targetSpeaking === 90 ? 'selected' : ''}>PTE 90</option>
                </select>
              </div>
              <div class="input-group">
                <label for="prof-target-writing">Target Writing</label>
                <select id="prof-target-writing">
                  <option value="50" ${progress.targetWriting === 50 ? 'selected' : ''}>PTE 50</option>
                  <option value="65" ${progress.targetWriting === 65 ? 'selected' : ''}>PTE 65</option>
                  <option value="79" ${progress.targetWriting === 79 || !progress.targetWriting ? 'selected' : ''}>PTE 79</option>
                  <option value="90" ${progress.targetWriting === 90 ? 'selected' : ''}>PTE 90</option>
                </select>
              </div>
              <div class="input-group">
                <label for="prof-target-reading">Target Reading</label>
                <select id="prof-target-reading">
                  <option value="50" ${progress.targetReading === 50 ? 'selected' : ''}>PTE 50</option>
                  <option value="65" ${progress.targetReading === 65 ? 'selected' : ''}>PTE 65</option>
                  <option value="79" ${progress.targetReading === 79 || !progress.targetReading ? 'selected' : ''}>PTE 79</option>
                  <option value="90" ${progress.targetReading === 90 ? 'selected' : ''}>PTE 90</option>
                </select>
              </div>
              <div class="input-group">
                <label for="prof-target-listening">Target Listening</label>
                <select id="prof-target-listening">
                  <option value="50" ${progress.targetListening === 50 ? 'selected' : ''}>PTE 50</option>
                  <option value="65" ${progress.targetListening === 65 ? 'selected' : ''}>PTE 65</option>
                  <option value="79" ${progress.targetListening === 79 || !progress.targetListening ? 'selected' : ''}>PTE 79</option>
                  <option value="90" ${progress.targetListening === 90 ? 'selected' : ''}>PTE 90</option>
                </select>
              </div>
              
              <div style="grid-column:1/-1; display:flex; justify-content:flex-end;">
                <button type="submit" class="btn btn-primary btn-sm shadow-neon">Save profile updates</button>
              </div>
            </form>
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

        </main>
      </div>
      <footer style="text-align: center; margin-top: 40px; font-size: 13.5px; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 20px;">
        Developed by Dhruv Gadamwar and Taksh Ballewar
      </footer>
    `;

    // Hook config form submits
    document.getElementById('profile-config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('prof-name').value;
      const newEmail = document.getElementById('prof-email').value;
      const newTarget = parseInt(document.getElementById('prof-target').value);
      const newExamDate = document.getElementById('prof-exam-date').value;
      const newSpeaking = parseInt(document.getElementById('prof-target-speaking').value);
      const newWriting = parseInt(document.getElementById('prof-target-writing').value);
      const newReading = parseInt(document.getElementById('prof-target-reading').value);
      const newListening = parseInt(document.getElementById('prof-target-listening').value);

      // Update User details
      const oldUser = Database.getUser();
      const updatedUser = {
        ...oldUser,
        name: newName,
        email: newEmail,
        authenticated: true
      };
      Database.updateUser(updatedUser);

      // Update progress
      const currentProg = Database.getProgress();
      currentProg.targetScore = newTarget;
      currentProg.targetSpeaking = newSpeaking;
      currentProg.targetWriting = newWriting;
      currentProg.targetReading = newReading;
      currentProg.targetListening = newListening;
      currentProg.examDate = newExamDate;
      Database.updateProgress(currentProg);

      // Save to accounts list
      Database.saveAccount({
        name: newName,
        email: newEmail,
        progress: currentProg
      });

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
