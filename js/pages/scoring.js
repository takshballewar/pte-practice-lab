/* FluentAI post-exam AI Evaluation & Detailed Feedback Page */

import { Database } from '../db.js?v=36';
import { Router } from '../router.js?v=36';

export function renderScoring(container, params) {
  // Read params
  const isMock = params && params.type === 'mock';
  let overall = params && params.score ? parseInt(params.score) : 76;

  // Retrieve user progress
  const progress = Database.getProgress();
  const latestHistory = progress.scoreHistory[progress.scoreHistory.length - 1] || {
    speaking: 80,
    writing: 74,
    reading: 78,
    listening: 81
  };

  let speakVal = latestHistory.speaking;
  let writeVal = latestHistory.writing;
  let readVal = latestHistory.reading;
  let listenVal = latestHistory.listening;

  // Load evaluations from localStorage
  const mockGradingJson = localStorage.getItem('latest_mock_grading_result');
  const gradingJson = localStorage.getItem('latest_grading_result');

  let mockGrading = null;
  let grading = null;

  if (isMock) {
    if (mockGradingJson) {
      try {
        mockGrading = JSON.parse(mockGradingJson);
        speakVal = mockGrading.speaking.score;
        writeVal = mockGrading.writing.score;
        readVal = mockGrading.reading.score;
        listenVal = mockGrading.listening.score;
        overall = Math.round((speakVal + writeVal + readVal + listenVal) / 4);
      } catch (e) {
        console.error("Error loading mock grading JSON", e);
      }
    }
    
    // Seed default mock evaluations if no key exists / parse fails
    if (!mockGrading) {
      mockGrading = {
        speaking: {
          score: 80,
          pronunciation: 76,
          fluency: 82,
          content: 82,
          markedText: 'Coastal development has <span class="word-good">accelerated</span> significantly over the past three decades. The resulting growth in tourism and <span class="word-warn" title="Hesitation gap: 0.8s pause registered. Keep voice steady.">infrastructure</span> has provided economic opportunities, but it has also placed <span class="word-bad" title="Mispronunciation: \'un-pre-ce-den-ted\' - check stress placement on the second syllable.">unprecedented</span> stress on fragile marine <span class="word-good">ecosystems</span>, threatening biodiversity and altering local shorelines.',
          tips: [
            "Pay special attention to punctuation: pause slightly at the comma and stop fully at the period.",
            "Ensure clear articulation of clusters like 'infrastructure', 'ecosystems', and 'shorelines'.",
            "Fluency was strong, but focus on the pacing of complex syllables."
          ]
        },
        writing: {
          score: 74,
          wordCount: 245,
          subScores: { grammar: 74, spelling: 80, vocabulary: 70, content: 72 },
          markedText: 'Governments worldwide should <span class="word-bad" title="Syntax typo: replace \'subsidise\' with \'subsidize\' (US spelling is preferred by PTE test centers)">subsidise</span> higher education programs because it fosters <span class="word-good" title="Advanced vocab usage">intellectual</span> capital. Critics believe this places heavy strains on the national <span class="word-warn" title="Collocation warning: \'financial budget\' is slightly redundant; use \'national budget\' or \'treasury\' instead">financial budget</span>, yet long-term returns in income tax revenues alleviate this challenge.',
          spellingErrors: [{ error: "subsidise", correction: "subsidize" }],
          grammarSuggestions: [],
          synonyms: [{ original: "important", alternatives: ["paramount", "crucial", "indispensable"] }]
        },
        reading: {
          score: 78,
          correctCount: 2,
          maxScore: 3,
          details: [
            { index: 0, userAnswer: "immediate", correctAnswer: "immediate", isCorrect: true, explanation: "'immediate necessity' is a strong collocation signifying urgency." },
            { index: 1, userAnswer: "hindrances", correctAnswer: "incentives", isCorrect: false, explanation: "'regulatory incentives' refers to laws or policies that encourage positive action." },
            { index: 2, userAnswer: "economically", correctAnswer: "economically", isCorrect: true, explanation: "The adverb 'economically' correctly modifies the adjective 'viable'." }
          ]
        },
        listening: {
          score: 81,
          wordCount: 58,
          matchedKeywords: ["subsidies", "monoculture", "ecological"],
          subScores: { content: 80, spelling: 90, grammar: 80 },
          critiqueText: "Your response contains 58 words. You captured key lecture concepts including: subsidies, monoculture, ecological farming. Keep grammatical structures clean to maintain accuracy.",
          markedText: 'The agricultural lecture explains that governments <span class="word-good">subsidize</span> key crops which stabilises food supply. However, this distorts global trade markets and promotes agricultural <span class="word-good">monoculture</span>, depleting soil quality. Therefore, economists recommend moving funds to reward <span class="word-good">ecological</span> practices like crop rotation.'
        }
      };
    }
  } else {
    // Individual task scoring
    const taskType = params && params.task ? params.task : 'writing';
    if (gradingJson) {
      try {
        grading = JSON.parse(gradingJson);
        if (taskType === 'speaking') speakVal = grading.score;
        else if (taskType === 'writing') writeVal = grading.score;
        else if (taskType === 'reading') readVal = grading.score;
        else if (taskType === 'listening') listenVal = grading.score;
        overall = grading.score;
      } catch (e) {
        console.error("Error loading task grading JSON", e);
      }
    }

    if (!grading) {
      // Seed fallback single task grading structures
      if (taskType === 'speaking') {
        grading = {
          score: speakVal,
          pronunciation: 75,
          fluency: 82,
          content: 82,
          markedText: 'Coastal development has <span class="word-good">accelerated</span> significantly over the past three decades. The resulting growth in tourism and <span class="word-warn" title="Hesitation gap: 0.8s pause registered. Keep voice steady.">infrastructure</span> has provided economic opportunities, but it has also placed <span class="word-bad" title="Mispronunciation: \'un-pre-ce-den-ted\' - check stress placement on the second syllable.">unprecedented</span> stress on fragile marine <span class="word-good">ecosystems</span>, threatening biodiversity and altering local shorelines.',
          tips: [
            "Pacing: Your oral fluency is 82. You had a minor hesitation pause before \"infrastructure\". Keep breathing continuous.",
            "Acoustics: Correct pronunciation stress on: unprecedented. Pronounce it as /ʌnˈpresɪdentɪd/."
          ]
        };
      } else if (taskType === 'reading') {
        grading = {
          score: readVal,
          correctCount: 2,
          maxScore: 3,
          details: [
            { index: 0, userAnswer: "immediate", correctAnswer: "immediate", isCorrect: true, explanation: "'immediate necessity' is a strong collocation signifying urgency." },
            { index: 1, userAnswer: "hindrances", correctAnswer: "incentives", isCorrect: false, explanation: "'regulatory incentives' refers to laws or policies that encourage positive action." },
            { index: 2, userAnswer: "economically", correctAnswer: "economically", isCorrect: true, explanation: "The adverb 'economically' correctly modifies the adjective 'viable'." }
          ]
        };
      } else if (taskType === 'listening') {
        grading = {
          score: listenVal,
          wordCount: 58,
          matchedKeywords: ["subsidies", "monoculture", "ecological"],
          subScores: { content: 80, spelling: 90, grammar: 80 },
          critiqueText: "Your response contains 58 words. You captured key lecture concepts including: subsidies, monoculture, ecological farming. Keep grammatical structures clean to maintain accuracy.",
          markedText: 'The agricultural lecture explains that governments <span class="word-good">subsidize</span> key crops which stabilises food supply. However, this distorts global trade markets and promotes agricultural <span class="word-good">monoculture</span>, depleting soil quality. Therefore, economists recommend moving funds to reward <span class="word-good">ecological</span> practices like crop rotation.'
        };
      } else {
        // Default writing essay fallback
        grading = {
          score: writeVal,
          wordCount: 245,
          subScores: { grammar: 74, spelling: 85, vocabulary: 70, content: 72 },
          markedText: 'To begin with, free education democratizes access to knowledge, ensuring that academic merit, rather than financial background, dictates an individual\'s career path. When higher education is restricted to those who can afford it, society suffers a massive loss of potential talent. By funding university tuition, governments cultivate a highly skilled workforce, which in turn fosters scientific innovation, boosts productivity, and attracts global investments. For instance, countries like Germany and Norway have maintained robust economies while funding higher education, proving that public investment in intellect yields substantial national returns.',
          spellingErrors: [],
          grammarSuggestions: [],
          synonyms: [{ original: "important", alternatives: ["paramount", "crucial", "indispensable"] }]
        };
      }
    }
  }

  const questionId = localStorage.getItem('latest_practice_question_id');
  const questionTitle = localStorage.getItem('latest_practice_question_title') || 'Practice Task';
  const targetScore = progress.targetScore || 65;
  const isCleared = overall >= targetScore;

  container.innerHTML = `
    <div class="scoring-header card-glass-glow" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="font-size: 24px; margin-bottom: 8px;">AI Performance Analysis</h2>
        <p style="color:var(--text-secondary); font-size:14.5px; margin:0;">Your test submission has been graded against the Pearson PTE Academic metrics engine.</p>
      </div>
      <div style="background:var(--accent-gradient); box-shadow:0 0 20px var(--accent-glow); padding:10px 24px; border-radius:var(--radius-md); text-align:center; min-width:130px;">
        <span style="font-size:11px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px; color:rgba(255,255,255,0.85); display:block; margin-bottom:2px;">Overall Score</span>
        <strong style="font-size:28px; font-weight:800; color:white;">${overall} <span style="font-size:14px; font-weight:400; color:rgba(255,255,255,0.75);">/90</span></strong>
      </div>
    </div>

    ${!isMock && questionId ? `
      <div class="card-glass-glow" style="margin-top: 20px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border: 1.5px solid ${isCleared ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}; border-left: 5px solid ${isCleared ? 'var(--success)' : 'var(--error)'};">
        <div style="flex-grow: 1; max-width: 70%; text-align: left;">
          <h4 style="font-size:15px; margin: 0 0 4px 0; font-weight:700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            ${isCleared ? '<span>🎉</span> Question Cleared & Deleted' : '<span>⚠️</span> Question Uncleared & Stored'}
          </h4>
          <p style="font-size:12.5px; color:var(--text-secondary); margin:0; line-height: 1.5;">
            ${isCleared 
              ? `Your score of <b>${overall}</b> meets your target of <b>${targetScore}</b>. This question has been cleared and deleted forever from your practice pool.` 
              : `Your score of <b>${overall}</b> is below your target of <b>${targetScore}</b>. It has been saved to your "Uncleared" study list.`}
          </p>
        </div>
        <div>
          ${isCleared 
            ? `<button id="btn-scoring-restore" class="btn btn-outline btn-sm" style="color:var(--error); border-color:var(--error);">Keep / Save as Uncleared</button>` 
            : `<button id="btn-scoring-clear-delete" class="btn btn-outline btn-sm" style="color:var(--success); border-color:var(--success);">Clear & Delete Forever</button>`}
        </div>
      </div>
    ` : ''}

    <!-- MAIN SCOREBOARD CARD -->
    <div class="card-glass scoring-metrics-deck" style="margin-top:20px;">
      <div class="metric-card">
        <div class="metric-title">Speaking Score</div>
        <div class="metric-score">${speakVal}<span>/90</span></div>
        <div class="progressbar-outer" style="margin-top:8px;"><div class="progressbar-inner speaking-color" style="width:${(speakVal/90)*100}%"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Writing Score</div>
        <div class="metric-score">${writeVal}<span>/90</span></div>
        <div class="progressbar-outer" style="margin-top:8px;"><div class="progressbar-inner writing-color" style="width:${(writeVal/90)*100}%"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Reading Score</div>
        <div class="metric-score">${readVal}<span>/90</span></div>
        <div class="progressbar-outer" style="margin-top:8px;"><div class="progressbar-inner reading-color" style="width:${(readVal/90)*100}%"></div></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Listening Score</div>
        <div class="metric-score">${listenVal}<span>/90</span></div>
        <div class="progressbar-outer" style="margin-top:8px;"><div class="progressbar-inner listening-color" style="width:${(listenVal/90)*100}%"></div></div>
      </div>
    </div>

    ${isMock ? `
      <!-- MOCK EXAM TABS SELECTOR -->
      <div class="scoring-tabs-row" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-top:20px;">
        <button class="btn btn-outline btn-sm active" data-tab="speaking">Speaking (RA)</button>
        <button class="btn btn-outline btn-sm" data-tab="writing">Writing (WE)</button>
        <button class="btn btn-outline btn-sm" data-tab="reading">Reading (FIB)</button>
        <button class="btn btn-outline btn-sm" data-tab="listening">Listening (SST)</button>
      </div>
    ` : ''}

    <!-- OVERALL COMPARED CARD & DETAILED GRID -->
    <div class="scoring-detailed-layout">
      <!-- Graded content highlights -->
      <div class="card-glass">
        <div class="card-title-flex">
          <span class="response-card-heading" id="scoring-annotations-title">Phoneme & Syntax Highlights (Annotated Text)</span>
          <span style="font-size: 11px; color: var(--text-muted);">Hover highlighted words for diagnostic tips</span>
        </div>
        
        <div class="markup-panel">
          <p id="scoring-annotated-markup" style="line-height: 1.8; font-size: 14.5px;">
            <!-- Rendered dynamically -->
          </p>
        </div>

        <div style="display:flex; gap:16px; margin-top:20px; font-size:12.5px; color:var(--text-secondary);">
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--success);"></span> Correctly Pronounced / Advanced</span>
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--warning);"></span> Minor Hesitation / Warning</span>
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--error);"></span> Mispronounced / Typo / Error</span>
        </div>
      </div>

      <!-- AI critique panel -->
      <div class="scoring-sidebar-panels">
        <!-- Diagnostic sub scores -->
        <div class="card-glass">
          <h3 style="margin-bottom:16px; font-size:16px;">AI Subscore Diagnostic</h3>
          <div id="scoring-subscores-container" style="display:flex; flex-direction:column; gap:14px;">
            <!-- Loaded dynamically -->
          </div>
        </div>

        <!-- AI Suggestions list -->
        <div class="card-glass">
          <h3 style="margin-bottom:16px; font-size:16px;">AI Coaching Directives</h3>
          <div class="critic-feedback-list" id="scoring-directives-list">
            <!-- Loaded dynamically -->
          </div>
        </div>

        <!-- Action tools -->
        <div style="display:flex; gap:12px;">
          <button id="btn-scoring-retry" class="btn btn-outline" style="flex-grow:1;">${isMock ? 'Retry Practice Tasks' : 'Try Once Again'}</button>
          <button id="btn-scoring-dashboard" class="btn btn-primary shadow-neon" style="flex-grow:1;">Back to Dashboard</button>
        </div>
      </div>
    </div>
  `;

  // Dynamic elements
  const markupEl = document.getElementById('scoring-annotated-markup');
  const titleEl = document.getElementById('scoring-annotations-title');
  const subscoresEl = document.getElementById('scoring-subscores-container');
  const directivesEl = document.getElementById('scoring-directives-list');

  // Evaluator function mapper
  const renderEvaluation = (taskType, result) => {
    // Detect specialized sub-task types based on result properties
    const isReorder = result && result.correctOrder !== undefined;
    const isDictation = result && result.modelAnswer !== undefined && taskType === 'listening' && result.correctCount !== undefined;
    const isHighlightIncorrect = result && result.incorrectIndices !== undefined;
    const isShortAnswer = result && result.isCorrect !== undefined;

    if (isReorder) {
      titleEl.textContent = "Re-order Paragraphs Sequence Analysis";
      markupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <p style="font-size:14px; color:var(--text-secondary); margin-bottom:8px;">
            PTE Reading Re-order paragraphs are graded based on correct adjacent pairs of paragraphs.
          </p>
          <div style="background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <strong>Your Adjacent Pair Score:</strong> <span style="color:var(--accent); font-weight:700; font-size:15px;">${result.scorePairs} / ${result.maxPairs} pairs</span>
          </div>
        </div>
      `;
      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Adjacent Pairs</span><span>${result.scorePairs} / ${result.maxPairs}</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner reading-color" style="width:${result.maxPairs > 0 ? (result.scorePairs/result.maxPairs)*100 : 100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>PTE Reading Scale</span><span>${result.score}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner reading-color" style="width:${(result.score/90)*100}%;"></div></div>
        </div>
      `;
      directivesEl.innerHTML = `
        <div class="critic-item">
          <b>Sequence feedback:</b> Review cohesion links, logical pronouns, and time-stamps in the paragraphs to find the correct adjacent ordering.
        </div>
      `;
      return;
    }

    if (isDictation) {
      titleEl.textContent = "Write from Dictation Transcription Check";
      markupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:6px;">
            <b>Reference sentence:</b><br>
            <span style="font-size:16px; line-height:1.6; color:var(--text-primary); display:block; margin-top:8px;">${result.markedText}</span>
          </p>
          <p style="font-size:13.5px; color:var(--text-secondary); border-top: 1px solid var(--border-color); padding-top:10px; margin-top:8px;">
            <b>Correct Words Captured:</b> <strong style="color:var(--success); font-size:15px;">${result.correctCount} / ${result.maxScore}</strong>
          </p>
        </div>
      `;
      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Transcription Precision</span><span>${result.correctCount} / ${result.maxScore}</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${result.maxScore > 0 ? (result.correctCount/result.maxScore)*100 : 100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>PTE Listening Scale</span><span>${result.score}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${(result.score/90)*100}%;"></div></div>
        </div>
      `;
      directivesEl.innerHTML = `
        <div class="critic-item">
          <b>Dictation Advice:</b> Listen closely to suffixes (plurals, -ed, -ing). Spelling mistakes and omitting small function words are the main sources of lost points.
        </div>
      `;
      return;
    }

    if (isHighlightIncorrect) {
      titleEl.textContent = "Highlight Incorrect Words Results";
      markupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <p style="font-size:14px; color:var(--text-secondary); margin-bottom:8px;">
            Annotated text: selected words are highlighted green (correct mismatches) or red (incorrect matches).
          </p>
          <div class="interactive-text-paragraph" style="font-size:15px; line-height:1.8;">
            ${result.markedText}
          </div>
          <div style="margin-top:12px; font-size:13px; color:var(--text-secondary); display:flex; gap:16px; flex-wrap:wrap;">
            <span>Correct picks: <strong style="color:var(--success);">${result.correctClicks}</strong></span>
            <span>Incorrect picks: <strong style="color:var(--error);">${result.incorrectClicks}</strong></span>
            <span>Total potential mismatches: <strong style="color:var(--accent);">${result.maxScore}</strong></span>
          </div>
        </div>
      `;
      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Precision Rate</span><span>${Math.max(0, result.correctClicks - result.incorrectClicks)} / ${result.maxScore}</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${result.maxScore > 0 ? (Math.max(0, result.correctClicks - result.incorrectClicks)/result.maxScore)*100 : 100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>PTE Listening Scale</span><span>${result.score}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${(result.score/90)*100}%;"></div></div>
        </div>
      `;
      directivesEl.innerHTML = `
        <div class="critic-item">
          <b>PTE Negative Marking:</b> Incorrect clicks trigger a -1 score penalty. Avoid guessing or clicking words unless you are sure of the audio discrepancy.
        </div>
      `;
      return;
    }

    if (isShortAnswer) {
      titleEl.textContent = "Short Answer Verification Review";
      markupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="padding:14px; border-radius:var(--radius-sm); border:1px solid ${result.isCorrect ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 71, 87, 0.2)'}; background:${result.isCorrect ? 'rgba(46, 213, 115, 0.04)' : 'rgba(255, 71, 87, 0.04)'};">
            <div style="font-weight:700; font-size:15px; margin-bottom:6px; color:${result.isCorrect ? 'var(--success)' : 'var(--error)'};">
               ${result.isCorrect ? '✓ Correct Answer' : '⚠️ Review Suggested'}
            </div>
            <p style="font-size:13.5px; color:var(--text-secondary); margin:0;">
              Correct keywords: <b>"${result.correctAnswers.join('" or "')}"</b>
            </p>
          </div>
        </div>
      `;
      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Accuracy Rate</span><span>${result.isCorrect ? '100%' : '0%'}</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner speaking-color" style="width:${result.isCorrect ? 100 : 20}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>PTE Scale Score</span><span>${result.score}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner speaking-color" style="width:${(result.score/90)*100}%;"></div></div>
        </div>
      `;
      directivesEl.innerHTML = `
        <div class="critic-item">
          <b>Direct Response Advice:</b> Focus on answering directly using single words or simple collocations. Answer within the recording time window.
        </div>
      `;
      return;
    }

    // 1. Update title
    const titles = {
      speaking: "Pronunciation & Phoneme Diagnostic",
      writing: "Essay Grammar & Vocabulary Annotation",
      reading: "Collocations & Context Blanks Analysis",
      listening: "SST Audio Summary Review"
    };
    titleEl.textContent = titles[taskType] || "AI Response Diagnostic";

    // 2. Render annotations and subscores depending on type
    if (taskType === 'speaking') {
      markupEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px; flex-wrap:wrap; gap:8px;">
          <span style="font-size:12px; color:var(--text-muted);">💡 Click any highlighted word to hear its correct pronunciation</span>
          <button id="btn-read-whole-passage" class="btn btn-outline-glow btn-sm" style="display:flex; align-items:center; gap:6px; font-size:11.5px; padding:4px 10px;">
            <span>🔊 Read Whole Paragraph</span>
          </button>
        </div>
        <div class="speaking-annotated-text" style="font-size:16.5px; line-height:1.8; color:var(--text-primary);">
          ${result.markedText || `<p>${result.text}</p>`}
        </div>
      `;
      
      // Wire up click-to-hear and whole paragraph reader
      setTimeout(() => {
        const textContainer = container.querySelector('.speaking-annotated-text');
        if (textContainer) {
          textContainer.addEventListener('click', (e) => {
            const span = e.target.closest('span');
            if (span) {
              const wordText = span.textContent.trim();
              const cleanWord = wordText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
              if (cleanWord) {
                window.speechSynthesis.cancel(); // Interrupt any ongoing speech
                const utterance = new SpeechSynthesisUtterance(cleanWord);
                utterance.rate = 0.85; // slightly slower for pronunciation clarity
                window.speechSynthesis.speak(utterance);
                
                // Temporary scale flash effect for touch feedback
                span.style.transform = 'scale(1.1)';
                span.style.transition = 'transform 0.1s ease';
                setTimeout(() => {
                  span.style.transform = 'scale(1)';
                }, 100);
              }
            }
          });
        }

        const readWholeBtn = document.getElementById('btn-read-whole-passage');
        if (readWholeBtn && textContainer) {
          readWholeBtn.addEventListener('click', () => {
            const textContent = textContainer.textContent.trim();
            if (textContent) {
              window.speechSynthesis.cancel(); // Interrupt any ongoing speech
              const utterance = new SpeechSynthesisUtterance(textContent);
              utterance.rate = 0.9;
              window.speechSynthesis.speak(utterance);
            }
          });
        }
      }, 50);
      
      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Oral Fluency</span><span>${result.fluency || 78}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner speaking-color" style="width:${((result.fluency || 78)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Pronunciation</span><span>${result.pronunciation || 75}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner speaking-color" style="width:${((result.pronunciation || 75)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Content Match</span><span>${result.content || 80}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner speaking-color" style="width:${((result.content || 80)/90)*100}%;"></div></div>
        </div>
      `;

      directivesEl.innerHTML = (result.tips || []).map(tip => `
        <div class="critic-item">
          ${tip}
        </div>
      `).join('');
      if (!directivesEl.innerHTML) {
        directivesEl.innerHTML = '<div style="color:var(--text-muted); font-size:13px;">No critical errors flagged. Focus on rhythm and speed.</div>';
      }

    } else if (taskType === 'writing') {
      markupEl.innerHTML = `
        <div style="white-space: pre-wrap; font-family: inherit;">${result.markedText}</div>
        <div style="margin-top:16px; font-size:12.5px; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:10px;">
          Word Count: <strong style="color:var(--text-primary);">${result.wordCount} words</strong> (PTE Target: 200 - 300)
        </div>
      `;

      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Grammatical Range</span><span>${result.subScores?.grammar || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner writing-color" style="width:${((result.subScores?.grammar || 70)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Spelling Accuracy</span><span>${result.subScores?.spelling || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner writing-color" style="width:${((result.subScores?.spelling || 70)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Lexical Diversity</span><span>${result.subScores?.vocabulary || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner writing-color" style="width:${((result.subScores?.vocabulary || 70)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Content Cohesion</span><span>${result.subScores?.content || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner writing-color" style="width:${((result.subScores?.content || 70)/90)*100}%;"></div></div>
        </div>
      `;

      let directivesHtml = '';
      if (result.spellingErrors && result.spellingErrors.length > 0) {
        result.spellingErrors.forEach(err => {
          directivesHtml += `
            <div class="critic-item grammar-err">
              <b>Spelling typo:</b> Found "<b>${err.error}</b>". Replace with "<b>${err.correction}</b>".
            </div>
          `;
        });
      }
      if (result.grammarSuggestions && result.grammarSuggestions.length > 0) {
        result.grammarSuggestions.forEach(err => {
          directivesHtml += `
            <div class="critic-item grammar-err">
              <b>Grammar advice:</b> ${err.correction} (at: <i>"${err.text}"</i>)
            </div>
          `;
        });
      }
      if (result.synonyms && result.synonyms.length > 0) {
        directivesHtml += `
          <div class="critic-item vocab-tip">
            <b>Lexical upgrades:</b> Consider replacing simple verbs with academic synonyms:
            <div class="synonyms-group" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
              ${result.synonyms.map(syn => `<span class="synonym-item" style="font-size:11px; padding:3px 8px; border-radius:12px; background:rgba(108, 198, 255, 0.08); border:1px solid var(--accent); color:var(--text-primary);">${syn.original} ➔ ${syn.alternatives.join(', ')}</span>`).join('')}
            </div>
          </div>
        `;
      }
      if (!directivesHtml) {
        directivesHtml = '<div class="critic-item" style="color:var(--success);">✓ Excellent writing structure, vocabulary usage, and grammar accuracy! No warnings flagged.</div>';
      }
      directivesEl.innerHTML = directivesHtml;

    } else if (taskType === 'reading') {
      const pct = Math.round((result.correctCount / result.maxScore) * 100);
      
      markupEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${result.details.map(d => `
            <div style="padding:12px 14px; border-radius:var(--radius-sm); border:1px solid ${d.isCorrect ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 71, 87, 0.2)'}; background:${d.isCorrect ? 'rgba(46, 213, 115, 0.04)' : 'rgba(255, 71, 87, 0.04)'};">
              <div class="card-title-flex" style="font-weight:600; font-size:13.5px; margin-bottom:6px;">
                <span>Blank #${d.index + 1}: ${d.isCorrect ? 'Correct' : 'Incorrect'}</span>
                <span style="color:${d.isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight:700;">Entered: "${d.userAnswer}"</span>
              </div>
              <p style="font-size:12.5px; color:var(--text-secondary); margin:0; line-height:1.4;">
                ${!d.isCorrect ? `Target answer: <b style="color:var(--success);">"${d.correctAnswer}"</b>.<br>` : ''}
                <b>Context Tip:</b> ${d.explanation}
              </p>
            </div>
          `).join('')}
        </div>
      `;

      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Collocation Accuracy</span><span>${result.correctCount} / ${result.maxScore}</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner reading-color" style="width:${pct}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>PTE Reading Scale</span><span>${result.score}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner reading-color" style="width:${(result.score/90)*100}%;"></div></div>
        </div>
      `;

      directivesEl.innerHTML = `
        <div class="critic-item vocab-tip">
          <b>Reading advice:</b> Review the collocation rules and grammatical hints for missed blanks. Focus on standard preposition usage.
        </div>
        ${result.correctCount === result.maxScore ? `
          <div class="critic-item" style="color:var(--success);">
            ✓ Perfect score! You correctly identified all reading blanks.
          </div>
        ` : ''}
      `;

    } else if (taskType === 'listening') {
      markupEl.innerHTML = `
        <div style="white-space: pre-wrap; font-family: inherit; line-height: 1.8;">${result.markedText}</div>
        <div style="margin-top:16px; font-size:12.5px; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:10px;">
          Word Count: <strong style="color:var(--text-primary);">${result.wordCount} words</strong> (PTE Target: 50 - 70)
        </div>
      `;

      subscoresEl.innerHTML = `
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Key Topics Capture</span><span>${result.subScores?.content || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${((result.subScores?.content || 70)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Spelling Accuracy</span><span>${result.subScores?.spelling || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${((result.subScores?.spelling || 70)/90)*100}%;"></div></div>
        </div>
        <div>
          <div class="card-title-flex" style="font-size:13px; font-weight:500; margin-bottom:4px;">
            <span>Grammatical Cohesion</span><span>${result.subScores?.grammar || 70}/90</span>
          </div>
          <div class="progressbar-outer" style="height:4px;"><div class="progressbar-inner listening-color" style="width:${((result.subScores?.grammar || 70)/90)*100}%;"></div></div>
        </div>
      `;

      directivesEl.innerHTML = `
        <div class="critic-item">
          <b>AI Summary Critique:</b> ${result.critiqueText}
        </div>
        <div class="critic-item vocab-tip">
          <b>Lecture keywords matched:</b>
          <div class="synonyms-group" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
            ${(result.matchedKeywords || []).map(k => `<span class="synonym-item" style="font-size:11px; padding:3px 8px; border-radius:12px; background:rgba(108, 198, 255, 0.08); border:1px solid var(--accent); color:var(--text-primary);">${k}</span>`).join('')}
          </div>
        </div>
      `;
    }
  };

  // Initial render
  if (isMock) {
    // Start with speaking tab
    renderEvaluation('speaking', mockGrading.speaking);

    // Bind tab clicks
    container.querySelectorAll('.scoring-tabs-row button').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.scoring-tabs-row button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        if (mockGrading && mockGrading[tab]) {
          renderEvaluation(tab, mockGrading[tab]);
        }
      });
    });
  } else {
    // Render individual task type
    const taskType = params && params.task ? params.task : 'writing';
    renderEvaluation(taskType, grading);
  }

  // Bind Button handlers
  document.getElementById('btn-scoring-retry').addEventListener('click', () => {
    if (isMock) {
      Router.navigate('practice');
    } else {
      const questionId = localStorage.getItem('latest_practice_question_id');
      if (questionId) {
        Router.navigate(`practice?questionId=${questionId}`);
      } else {
        Router.navigate('practice');
      }
    }
  });

  document.getElementById('btn-scoring-dashboard').addEventListener('click', () => {
    Router.navigate('dashboard');
  });

  const restoreBtn = document.getElementById('btn-scoring-restore');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', async () => {
      restoreBtn.disabled = true;
      restoreBtn.textContent = "Restoring...";
      const questionId = localStorage.getItem('latest_practice_question_id');
      const questionObjStr = localStorage.getItem('latest_practice_question_object');
      if (questionId && questionObjStr) {
        try {
          const questionObj = JSON.parse(questionObjStr);
          
          // Re-insert question into fluentai_questions database if missing
          const questions = JSON.parse(localStorage.getItem('fluentai_questions') || '{}');
          const getSkillFromTaskType = (type) => {
            if (['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'short-question', 'group-discussion', 'respond-situation'].includes(type)) return 'speaking';
            if (['write-essay', 'summarize-written'].includes(type)) return 'writing';
            if (['fib-dropdown', 'mcq-multiple-reading', 'reorder-paragraphs', 'fib-drag-drop', 'mcq-single-reading'].includes(type)) return 'reading';
            if (['summarize-spoken', 'mcq-multiple-listening', 'fib-listening', 'highlight-summary', 'mcq-single-listening', 'missing-word', 'highlight-incorrect', 'write-dictation'].includes(type)) return 'listening';
            return 'speaking';
          };
          const parentSkill = getSkillFromTaskType(questionObj.taskType);
          
          if (questions[parentSkill]) {
            const exists = questions[parentSkill].some(q => q.id === questionId);
            if (!exists) {
              questions[parentSkill].push(questionObj);
              localStorage.setItem('fluentai_questions', JSON.stringify(questions));
            }
          }
          
          // Now mark it uncleared
          await Database.markQuestionUncleared(questionId, true);
          alert("Question successfully saved back into your 'Uncleared' study deck!");
          Router.navigate('practice');
        } catch (e) {
          console.error("Failed to restore question", e);
          alert("Error restoring question to study deck.");
          restoreBtn.disabled = false;
          restoreBtn.textContent = "Keep / Save as Uncleared";
        }
      }
    });
  }

  const clearDeleteBtn = document.getElementById('btn-scoring-clear-delete');
  if (clearDeleteBtn) {
    clearDeleteBtn.addEventListener('click', async () => {
      clearDeleteBtn.disabled = true;
      clearDeleteBtn.textContent = "Clearing...";
      const questionId = localStorage.getItem('latest_practice_question_id');
      if (questionId) {
        await Database.markQuestionUncleared(questionId, false);
        alert("Question cleared and deleted forever from your study bank!");
        Router.navigate('practice');
      }
    });
  }
}
