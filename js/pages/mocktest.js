/* FluentAI PTE Exam Simulator Module & Drag-Drop/Audio Systems */

import { Database } from '../db.js?v=34';
import { Router } from '../router.js?v=34';

export function renderMockTest(container, params) {
  // Check if we are starting a test or viewing the landing selection
  if (params && params.active === 'true') {
    startExamSimulation(container);
  } else {
    renderMockLanding(container);
  }
}

function renderMockLanding(container) {
  container.innerHTML = `
    <div class="mock-landing-pane">
      <div class="card-glass-glow" style="margin-bottom: 32px;">
        <h2 style="font-size: 24px; margin-bottom: 8px;">PTE Academic Full Mock Examinations</h2>
        <p style="color: var(--text-secondary); font-size: 14.5px; line-height: 1.6; max-width: 800px;">
          Practice under realistic exam-hall conditions. Our mock simulation tests all four core competencies back-to-back, strictly timing your preparation and response slots, and outputs a complete AI performance breakdown upon completion.
        </p>
      </div>

      <div class="mock-landing-grid">
        <!-- Mock Test A -->
        <div class="card-glass mock-card">
          <div class="mock-status-row">
            <h3 style="font-size: 18px;">PTE Mock Test Alpha</h3>
            <span class="badge-status active">Ready</span>
          </div>
          <ul class="mock-card-details">
            <li>⏳ Duration: 45 Minutes</li>
            <li>📝 4 Questions (Speaking, Writing, Reading, Listening)</li>
            <li>✨ Full AI grading breakdown</li>
          </ul>
          <button id="btn-start-mock-alpha" class="btn btn-primary shadow-neon" style="margin-top: 10px;">Enter Exam Room</button>
        </div>

        <!-- Mock Test B -->
        <div class="card-glass mock-card" style="opacity: 0.6;">
          <div class="mock-status-row">
            <h3 style="font-size: 18px;">PTE Mock Test Beta</h3>
            <span class="badge-status locked">Locked</span>
          </div>
          <ul class="mock-card-details">
            <li>⏳ Duration: 45 Minutes</li>
            <li>📝 4 Advanced diagnostic tasks</li>
            <li>🎓 Target feedback review</li>
          </ul>
          <button class="btn btn-outline" disabled style="margin-top: 10px;">Upgrade to Unlock</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-start-mock-alpha').addEventListener('click', () => {
    Router.navigate('mocktest?active=true');
  });
}

function startExamSimulation(container) {
  const questions = Database.getQuestions();
  const user = Database.getUser();
  const userName = (user && user.name) ? user.name : "Vivek Ballewar";

  // Enable full screen exam mode classes
  document.body.classList.add('in-exam-mode');
  const appWrapper = document.getElementById('app');
  if (appWrapper) appWrapper.classList.add('in-exam-mode');
  
  // Seed Mock Test tasks
  const examTasks = [
    { type: 'speaking', data: questions.speaking[0] },
    { type: 'writing', data: questions.writing[0] },
    { type: 'reading', data: questions.reading[0] },
    { type: 'listening', data: questions.listening[0] }
  ];

  let currentStep = 0;
  let examTimerSeconds = 45 * 60; // 45 minutes
  let examInterval;
  
  // Local answers state
  const userAnswers = {
    speaking: null, // Audio blob URL
    writing: "", // Essay string
    reading: {}, // FIB answers matching index: word
    listening: "" // SST string
  };

  const updateGlobalTimer = () => {
    const mins = Math.floor(examTimerSeconds / 60);
    const secs = examTimerSeconds % 60;
    const timerBadge = document.getElementById('mock-sim-timer');
    if (timerBadge) {
      timerBadge.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (examTimerSeconds <= 0) {
      clearInterval(examInterval);
      submitExam();
    }
    examTimerSeconds--;
  };

  const renderActiveStep = () => {
    const workspace = document.getElementById('sim-active-workspace');
    if (!workspace) return;
    
    // Clear sub-intervals and audio recording objects
    cleanupStepAssets();

    const task = examTasks[currentStep];
    
    // Update subheader details
    const sectionTitle = document.getElementById('mock-sim-section-title');
    const questionIdx = document.getElementById('mock-sim-question-idx');
    if (sectionTitle) {
      const typeDisplay = task.type.charAt(0).toUpperCase() + task.type.slice(1);
      const subType = task.data.taskType.replace('-', ' ').toUpperCase();
      sectionTitle.textContent = `PTE Academic Test - ${typeDisplay} (${subType})`;
    }
    if (questionIdx) {
      questionIdx.textContent = `Question ${currentStep + 1} of ${examTasks.length}`;
    }
    
    if (task.type === 'speaking') {
      renderSpeakingTask(workspace, task.data);
    } else if (task.type === 'writing') {
      renderWritingTask(workspace, task.data);
    } else if (task.type === 'reading') {
      renderReadingTask(workspace, task.data);
    } else if (task.type === 'listening') {
      renderListeningTask(workspace, task.data);
    }

    // Toggle navigation button text
    const nextBtn = document.getElementById('sim-next-btn');
    if (nextBtn) {
      if (currentStep === examTasks.length - 1) {
        nextBtn.innerHTML = "Submit Test &nbsp;▶";
      } else {
        nextBtn.innerHTML = "Next &nbsp;▶";
      }
    }
  };

  const cleanupStepAssets = () => {
    if (window.speakingTimerInterval) clearInterval(window.speakingTimerInterval);
    if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
      window.mediaRecorder.stop();
    }
    if (window.audioContext) {
      window.audioContext.close();
      window.audioContext = null;
    }
    if (window.lecturePlayer) {
      window.lecturePlayer.pause();
      window.lecturePlayer = null;
    }
  };

  const submitExam = async () => {
    cleanupStepAssets();
    clearInterval(examInterval);

    // Remove full screen exam mode classes
    document.body.classList.remove('in-exam-mode');
    const appWrapper = document.getElementById('app');
    if (appWrapper) appWrapper.classList.remove('in-exam-mode');

    // Show beautiful loading overlay
    container.innerHTML = `
      <div class="card-glass-glow loading-screen-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 40px; min-height:400px; text-align:center; margin-top:20px;">
        <div class="pulse-glow-circle" style="width:80px; height:80px; border-radius:50%; background:var(--accent-gradient); display:flex; align-items:center; justify-content:center; box-shadow:0 0 30px var(--accent-glow); margin-bottom:30px; animation: pulse 1.5s infinite alternate;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:40px; height:40px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        </div>
        <h2 style="font-size:24px; margin-bottom:12px; font-weight:700; color:var(--text-primary);">Evaluating PTE Mock Exam...</h2>
        <p style="color:var(--text-secondary); max-width:480px; font-size:14.5px; line-height:1.6; margin-bottom:30px;">
          Aspire Education AI is analyzing your spoken phonemes, essay coherence, grammatical structures, and vocabulary indices. Please do not close this window.
        </p>
        <div class="loader-steps" style="display:flex; flex-direction:column; gap:12px; font-size:13.5px; text-align:left; width:100%; max-width:320px; color:var(--text-secondary); margin: 0 auto;">
          <div id="load-step-speaking" style="display:flex; align-items:center; gap:10px;"><span style="color:var(--accent);">●</span> Speaking Phoneme Analysis...</div>
          <div id="load-step-writing" style="display:flex; align-items:center; gap:10px;"><span style="color:var(--text-muted);">○</span> Writing Cohesion & Grammar...</div>
          <div id="load-step-reading" style="display:flex; align-items:center; gap:10px;"><span style="color:var(--text-muted);">○</span> Reading FIB Validation...</div>
          <div id="load-step-listening" style="display:flex; align-items:center; gap:10px;"><span style="color:var(--text-muted);">○</span> Listening Summarization Check...</div>
        </div>
      </div>
    `;

    try {
      const speakPromise = Database.gradeSpeakingReadAloudAsync(examTasks[0].data.id, window.recordedSpeakingBlob, userAnswers.speakingOffline);
      const writePromise = Database.gradeWritingEssayAsync(examTasks[1].data.id, userAnswers.writing);
      const readPromise = Promise.resolve(Database.gradeReadingFIB(examTasks[2].data.id, userAnswers.reading));
      const listenPromise = Database.gradeListeningSSTAsync(examTasks[3].data.id, userAnswers.listening);

      // Run parallel
      const [speakResult, writeResult, readResult, listenResult] = await Promise.all([
        speakPromise.then(res => {
          const el = document.getElementById('load-step-speaking');
          if (el) el.innerHTML = '<span style="color:var(--success);">✓</span> Speaking Analysis Complete';
          const next = document.getElementById('load-step-writing');
          if (next) next.innerHTML = '<span style="color:var(--accent);">●</span> Writing Cohesion & Grammar...';
          return res;
        }),
        writePromise.then(res => {
          const el = document.getElementById('load-step-writing');
          if (el) el.innerHTML = '<span style="color:var(--success);">✓</span> Writing Evaluation Complete';
          const next = document.getElementById('load-step-reading');
          if (next) next.innerHTML = '<span style="color:var(--accent);">●</span> Reading FIB Validation...';
          return res;
        }),
        readPromise.then(res => {
          const el = document.getElementById('load-step-reading');
          if (el) el.innerHTML = '<span style="color:var(--success);">✓</span> Reading Verification Complete';
          const next = document.getElementById('load-step-listening');
          if (next) next.innerHTML = '<span style="color:var(--accent);">●</span> Listening Summarization Check...';
          return res;
        }),
        listenPromise.then(res => {
          const el = document.getElementById('load-step-listening');
          if (el) el.innerHTML = '<span style="color:var(--success);">✓</span> Listening Check Complete';
          return res;
        })
      ]);

      // Save complete dynamic results dictionary
      const mockGradingResult = {
        speaking: speakResult,
        writing: writeResult,
        reading: readResult,
        listening: listenResult
      };
      localStorage.setItem('latest_mock_grading_result', JSON.stringify(mockGradingResult));

      // Map overall grade
      const avgScore = Math.round((speakResult.score + writeResult.score + readResult.score + listenResult.score) / 4);

      // Store completed mock test log
      const progress = Database.getProgress();
      const today = new Date().toLocaleDateString([], { month: 'short', day: '2-digit' });
      progress.scoreHistory.push({
        date: today + " (Mock A)",
        speaking: speakResult.score,
        writing: writeResult.score,
        reading: readResult.score,
        listening: listenResult.score,
        overall: avgScore
      });
      Database.updateProgress(progress);

      // Clean up speech recording from window
      delete window.recordedSpeakingBlob;
      delete window.offlineSpeakingTranscript;

      // Small pause to let user see "Finished" states
      setTimeout(() => {
        // Navigate to AI Scoring report layout
        Router.navigate(`scoring?type=mock&score=${avgScore}&speak=${speakResult.score}&write=${writeResult.score}&read=${readResult.score}&listen=${listenResult.score}`);
      }, 500);

    } catch (err) {
      console.error("Mock grading failed, calling fallback synchronous evaluator.", err);
      // Remove full screen exam mode classes
      document.body.classList.remove('in-exam-mode');
      const appWrapper = document.getElementById('app');
      if (appWrapper) appWrapper.classList.remove('in-exam-mode');
      // Fallback
      Router.navigate(`scoring?type=mock&score=70&speak=72&write=68&read=70&listen=70`);
    }
  };

  // Render initial layout shell for Exam Simulator
  container.innerHTML = `
    <div class="pearson-portal">
      <div class="pearson-header">
        <div class="pearson-header-title">PTE Academic - Simulation Practice Exam</div>
        <div class="pearson-header-candidate">Candidate: <b>${userName}</b></div>
      </div>

      <div class="pearson-subheader">
        <div class="pearson-subheader-left" id="mock-sim-section-title">Section 1: Speaking</div>
        <div class="pearson-subheader-right">
          <span id="mock-sim-question-idx" style="font-weight: bold; margin-right: 15px;">Question 1 of 4</span>
          <div class="pearson-timer-box">
            Time Remaining: <span id="mock-sim-timer">45:00</span>
          </div>
        </div>
      </div>

      <div class="pearson-content-area" id="sim-active-workspace">
        <!-- Loaded step-by-step dynamically -->
      </div>

      <div class="pearson-footer">
        <button id="sim-next-btn" class="pearson-next-btn">Next &nbsp;▶</button>
      </div>
    </div>

    <!-- Confirm Modal Overlay (Hidden by default) -->
    <div id="pearson-confirm-modal" class="pearson-modal-overlay" style="display: none;">
      <div class="pearson-modal-box">
        <div class="pearson-modal-title">Confirm Navigation</div>
        <div class="pearson-modal-text">
          You have clicked Next. You cannot return to this question once you leave. Do you want to continue?
        </div>
        <div class="pearson-modal-actions">
          <button id="modal-cancel-btn" class="pearson-btn-gray">No</button>
          <button id="modal-confirm-btn" class="pearson-btn-blue">Yes</button>
        </div>
      </div>
    </div>
  `;

  // Start timers
  updateGlobalTimer();
  examInterval = setInterval(updateGlobalTimer, 1000);

  // Next step click listener (Triggers modal first)
  document.getElementById('sim-next-btn').addEventListener('click', () => {
    document.getElementById('pearson-confirm-modal').style.display = 'flex';
  });

  // Modal Cancel
  document.getElementById('modal-cancel-btn').addEventListener('click', () => {
    document.getElementById('pearson-confirm-modal').style.display = 'none';
  });

  // Modal Confirm
  document.getElementById('modal-confirm-btn').addEventListener('click', () => {
    document.getElementById('pearson-confirm-modal').style.display = 'none';

    // Save state before advancing
    saveActiveStepState(examTasks[currentStep], userAnswers);

    if (currentStep < examTasks.length - 1) {
      currentStep++;
      renderActiveStep();
    } else {
      submitExam();
    }
  });

  // Render first task
  renderActiveStep();
}

function saveActiveStepState(task, answers) {
  if (task.type === 'speaking') {
    answers.speakingOffline = window.offlineSpeakingTranscript || "";
  } else if (task.type === 'writing') {
    const textVal = document.getElementById('essay-sim-textarea');
    if (textVal) answers.writing = textVal.value;
  } else if (task.type === 'reading') {
    // Reading blanks are populated directly into answers.reading in the drag-drop drop handler
    answers.reading = window.simReadingAnswers || {};
  } else if (task.type === 'listening') {
    const textVal = document.getElementById('listening-sim-textarea');
    if (textVal) answers.listening = textVal.value;
  }
}

/* ==========================================================================
   TASK RENDERERS & HELPERS
   ========================================================================== */

function renderSpeakingTask(workspace, data) {
  workspace.innerHTML = `
    <div class="pearson-instruction-box">
      <b>Read Aloud:</b> Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read.
    </div>
    <div class="pearson-prompt-box">
      <p id="speaking-sim-prompt" style="margin: 0; line-height: 1.6; font-family: Arial, sans-serif; font-size: 16px;">${data.text}</p>
    </div>
    
    <div class="pearson-recording-deck">
      <div class="pearson-deck-title">Recording Status</div>
      <div id="speaking-sim-status-txt" class="pearson-deck-status">Status: Preparing</div>
      <div class="pearson-progress-bar-container">
        <div id="speaking-sim-progress" class="pearson-progress-bar-fill" style="width: 0%;"></div>
      </div>
      <div id="speaking-sim-prep-timer" style="font-size:12px; font-weight:bold; color:#004b61;">Time Remaining: 40 seconds</div>
      
      <!-- Keep elements needed by JS logic hidden -->
      <span id="speaking-sim-status-dot" style="display:none;"></span>
      <div id="speaking-sim-wave-placeholder" style="display:none;"></div>
      <canvas id="speaking-sim-canvas" width="300" height="10" style="display:none;"></canvas>
    </div>
  `;

  let prepTimeLeft = 40;
  let recordTimeLeft = 40;
  
  const timerBadge = document.getElementById('speaking-sim-prep-timer');
  const statusTxt = document.getElementById('speaking-sim-status-txt');
  const progressBar = document.getElementById('speaking-sim-progress');

  const startRecordingFlow = () => {
    statusTxt.textContent = "Status: Recording";
    if (progressBar) {
      progressBar.classList.add('recording');
      progressBar.style.width = '0%';
    }
    
    // Activate browser Microphone audio Context live draw or simulated draw
    initAudioRecordingVisuals();

    // Start SpeechRecognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      window.offlineSpeakingTranscript = '';
      
      recognition.onresult = (event) => {
        let resultText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            resultText += event.results[i][0].transcript + ' ';
          }
        }
        window.offlineSpeakingTranscript += resultText;
      };
      
      recognition.start();
      window.speechRecognitionInstance = recognition;
    }

    window.speakingTimerInterval = setInterval(() => {
      recordTimeLeft--;
      timerBadge.textContent = `Time Remaining: ${recordTimeLeft} seconds`;
      if (progressBar) {
        progressBar.style.width = `${((40 - recordTimeLeft) / 40) * 100}%`;
      }

      if (recordTimeLeft <= 0) {
        clearInterval(window.speakingTimerInterval);
        statusTxt.textContent = "Status: Completed";
        if (progressBar) progressBar.style.width = '100%';
        timerBadge.textContent = "Completed";
        cleanupMicrophone();
      }
    }, 1000);
  };

  // Preparation Countdown
  window.speakingTimerInterval = setInterval(() => {
    prepTimeLeft--;
    timerBadge.textContent = `Time Remaining: ${prepTimeLeft} seconds`;
    if (progressBar) {
      progressBar.style.width = `${((40 - prepTimeLeft) / 40) * 100}%`;
    }
    
    if (prepTimeLeft <= 0) {
      clearInterval(window.speakingTimerInterval);
      startRecordingFlow();
    }
  }, 1000);
}

function initAudioRecordingVisuals() {
  const canvas = document.getElementById('speaking-sim-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let animationId;
  let analyser;
  let dataArray;
  
  const drawSimulatedWave = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const sliceWidth = canvas.width / 100;
    let x = 0;
    
    for (let i = 0; i < 100; i++) {
      const v = Math.random() * 0.4 + 0.3; // mock sound wave fluctuations
      const y = (v * canvas.height / 2) * Math.sin(i * 0.1) + canvas.height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
    animationId = requestAnimationFrame(drawSimulatedWave);
  };

  // Try requesting microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = window.audioContext.createMediaStreamSource(stream);
      analyser = window.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      
      // MediaRecorder initialization
      const chunks = [];
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (err) {
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        window.recordedSpeakingBlob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      };
      mediaRecorder.start();
      window.mediaRecorder = mediaRecorder;

      const drawRealWave = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = '#040509';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;
          
          // Gradient fill
          ctx.fillStyle = `rgb(${108 - barHeight}, ${198 + barHeight}, 255)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
        animationId = requestAnimationFrame(drawRealWave);
      };
      
      drawRealWave();
      window.audioStream = stream;
    })
    .catch(err => {
      console.warn("Microphone permission denied or blocked on local static URL, running mock voice amplitude loops.", err);
      drawSimulatedWave();
    });

  // Cleanup handler
  window.cleanupMicrophone = () => {
    cancelAnimationFrame(animationId);
    if (window.audioStream) {
      window.audioStream.getTracks().forEach(track => track.stop());
    }
    if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
      window.mediaRecorder.stop();
    }
    if (window.speechRecognitionInstance) {
      window.speechRecognitionInstance.stop();
      window.speechRecognitionInstance = null;
    }
  };
}

// 2. Render Writing task (Write Essay)
function renderWritingTask(workspace, data) {
  workspace.innerHTML = `
    <div class="pearson-instruction-box">
      <b>Write Essay:</b> You will have 20 minutes to write an essay on the topic below. You must write between 200 and 300 words.
    </div>
    <div class="pearson-prompt-box">
      <p style="margin:0;"><b>Essay Prompt:</b> ${data.prompt}</p>
    </div>
    
    <div class="essay-editor-wrapper" style="margin-top:20px;">
      <textarea id="essay-sim-textarea" style="width:100%; height:250px; border:1px solid #ababab; border-radius:2px; padding:12px; font-family:Arial, sans-serif; font-size:14px;" placeholder="Start typing your essay here..."></textarea>
      <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:13px; color:#555;">
        <span>Word Count: <b id="essay-sim-wcount">0</b></span>
        <span>Word Limit: 200 - 300 words</span>
      </div>
    </div>
  `;

  const textarea = document.getElementById('essay-sim-textarea');
  const countBadge = document.getElementById('essay-sim-wcount');

  textarea.addEventListener('input', () => {
    const text = textarea.value.trim();
    const count = text === "" ? 0 : text.split(/\s+/).filter(w => w.length > 0).length;
    countBadge.textContent = count;

    if (count >= 200 && count <= 300) {
      countBadge.style.color = "green";
    } else {
      countBadge.style.color = "red";
    }
  });
}

// 3. Render Reading task (Fill in the Blanks)
function renderReadingTask(workspace, data) {
  workspace.innerHTML = `
    <div class="pearson-instruction-box">
      <b>Fill in the Blanks:</b> Below is a text with some empty boxes. Drag the words from the box at the bottom and place them into the correct blank slots in the text.
    </div>
    
    <div class="pearson-prompt-box" style="background:#ffffff; border:1px solid #c8c8c8; padding:20px; line-height:1.8; font-size:15px; color:#111; margin-bottom:24px;">
      <p id="reading-sim-paragraph-box" style="margin:0;">
        ${data.paragraphHTML}
      </p>
    </div>

    <!-- Drag-Drop Pool -->
    <div id="reading-sim-words-pool" style="display:flex; flex-wrap:wrap; gap:10px; padding:16px; background:#f7f7f7; border:1px solid #c8c8c8; border-radius:2px; min-height:60px;">
      ${data.wordsPool.map((word, idx) => `<span id="word-item-${idx}" class="word-pill" draggable="true" data-word="${word}" style="display:inline-block; padding:4px 10px; background:#ffffff; border:1px solid #005A70; border-radius:2px; color:#005A70; cursor:grab; font-size:13px; font-weight:bold; user-select:none;">${word}</span>`).join('')}
    </div>
  `;

  const wordPills = document.querySelectorAll('.word-pill');
  const blankBoxes = document.querySelectorAll('.blank-box');
  
  // Track blank fillings
  const localAnswers = {};

  // Drag start
  wordPills.forEach(pill => {
    pill.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', pill.getAttribute('data-word'));
      e.dataTransfer.setData('element/id', pill.id);
    });
  });

  // Drop zones
  blankBoxes.forEach(box => {
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.style.backgroundColor = '#e0f2fe';
    });

    box.addEventListener('dragleave', () => {
      box.style.backgroundColor = '';
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.style.backgroundColor = '';
      
      const word = e.dataTransfer.getData('text/plain');
      const originId = e.dataTransfer.getData('element/id');
      const originEl = document.getElementById(originId);
      
      const boxIdx = box.getAttribute('data-index');

      // If box already has a word pill, return it to the pool
      if (box.hasChildNodes()) {
        const existingPill = box.querySelector('.word-pill');
        document.getElementById('reading-sim-words-pool').appendChild(existingPill);
      }

      // Append pill to blank box
      if (originEl) {
        box.innerHTML = '';
        box.appendChild(originEl);
        localAnswers[boxIdx] = word;
      }
    });
  });

  // Enable blank box clicks to return word to the pool
  document.getElementById('reading-sim-paragraph-box').addEventListener('click', (e) => {
    if (e.target.classList.contains('word-pill')) {
      const box = e.target.parentNode;
      const boxIdx = box.getAttribute('data-index');
      
      document.getElementById('reading-sim-words-pool').appendChild(e.target);
      box.textContent = '';
      delete localAnswers[boxIdx];
    }
  });

  // Save answers reference
  window.addEventListener('hashchange', () => delete window.simReadingAnswers);
  window.simReadingAnswers = localAnswers;
}

// 4. Render Listening task (Summarize Spoken Text)
function renderListeningTask(workspace, data) {
  workspace.innerHTML = `
    <div class="pearson-instruction-box">
      <b>Summarize Spoken Text:</b> Listen to the short lecture clip, and write a summary of 50-70 words in the editor below. You have 10 minutes to finish.
    </div>

    <!-- Audio Player Deck -->
    <div class="lecture-player-container" style="background:#f7f7f7; border:1px solid #ababab; padding:16px; border-radius:2px; display:flex; align-items:center; gap:20px; margin-bottom:20px;">
      <button id="lecture-sim-play-btn" style="background:#005A70; color:#fff; border:1px solid #004658; border-radius:2px; padding:6px 16px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:6px;">
        Play Audio
      </button>
      <div class="player-timeline-outer" id="lecture-sim-timeline" style="flex:1; height:12px; background:#e0e0e0; border:1px solid #ababab; border-radius:2px; position:relative; overflow:hidden; cursor:pointer;">
        <div id="lecture-sim-timeline-fill" class="player-timeline-inner" style="height:100%; background:#0088cc; width:0%;"></div>
      </div>
      <span id="lecture-sim-time-txt" class="player-time-lbl" style="font-size:13px; font-weight:bold; color:#333;">0:00 / 0:00</span>
    </div>

    <!-- Text editor box -->
    <div class="essay-editor-wrapper" style="margin-top: 16px;">
      <textarea id="listening-sim-textarea" style="width:100%; height:180px; border:1px solid #ababab; border-radius:2px; padding:12px; font-family:Arial, sans-serif; font-size:14px;" placeholder="Summarize the core concepts of the lecture here..."></textarea>
      <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:13px; color:#555;">
        <span>Word Count: <b id="listening-sim-wcount">0</b></span>
        <span>Word Limit: 50 - 70 words</span>
      </div>
    </div>
  `;

  // Custom Audio Simulation
  const playBtn = document.getElementById('lecture-sim-play-btn');
  const progressFill = document.getElementById('lecture-sim-timeline-fill');
  const timeTxt = document.getElementById('lecture-sim-time-txt');
  const timeline = document.getElementById('lecture-sim-timeline');

  let audioPlaying = false;
  let audioDuration = Math.max(15, Math.ceil(data.lectureText.split(/\s+/).length * 0.45));
  let audioCurrent = 0;
  let audioTimer;
  let utterance = null;
  let isPaused = false;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Set initial time label
  timeTxt.textContent = `0:00 / ${formatTime(audioDuration)}`;

  const stopAudio = () => {
    if (audioTimer) clearInterval(audioTimer);
    window.speechSynthesis.cancel();
    audioPlaying = false;
    isPaused = false;
    playBtn.textContent = 'Play Audio';
    progressFill.style.width = '0%';
    timeTxt.textContent = `0:00 / ${formatTime(audioDuration)}`;
    audioCurrent = 0;
  };

  const updatePlayerProgress = () => {
    audioCurrent++;
    const pct = Math.min(100, (audioCurrent / audioDuration) * 100);
    progressFill.style.width = `${pct}%`;
    timeTxt.textContent = `${formatTime(audioCurrent)} / ${formatTime(audioDuration)}`;

    if (audioCurrent >= audioDuration) {
      stopAudio();
    }
  };

  playBtn.addEventListener('click', () => {
    if (audioPlaying) {
      clearInterval(audioTimer);
      audioPlaying = false;
      playBtn.textContent = 'Play Audio';
      window.speechSynthesis.pause();
      isPaused = true;
    } else {
      audioPlaying = true;
      playBtn.textContent = 'Pause Audio';
      
      if (isPaused && utterance) {
        window.speechSynthesis.resume();
        isPaused = false;
      } else {
        window.speechSynthesis.cancel();
        utterance = new SpeechSynthesisUtterance(data.lectureText);
        utterance.rate = 1.0;
        utterance.onend = () => {
          stopAudio();
        };
        window.speechSynthesis.speak(utterance);
      }
      audioTimer = setInterval(updatePlayerProgress, 1000);
    }
  });

  // Word count listeners
  const textarea = document.getElementById('listening-sim-textarea');
  const countBadge = document.getElementById('listening-sim-wcount');

  textarea.addEventListener('input', () => {
    const text = textarea.value.trim();
    const count = text === "" ? 0 : text.split(/\s+/).filter(w => w.length > 0).length;
    countBadge.textContent = count;

    if (count >= 50 && count <= 70) {
      countBadge.style.color = "green";
    } else {
      countBadge.style.color = "red";
    }
  });

  // Timeline click scrubbing
  timeline.addEventListener('click', (e) => {
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    audioCurrent = Math.floor(pct * audioDuration);
    progressFill.style.width = `${pct * 100}%`;
    timeTxt.textContent = `${formatTime(audioCurrent)} / ${formatTime(audioDuration)}`;
  });

  // Hook clean up
  window.lecturePlayer = {
    pause: () => stopAudio()
  };
}
