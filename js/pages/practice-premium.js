/* FluentAI Practice Laboratory View & Interactive Workspace & Flashcards */

import { Database } from '../db.js?v=13';
import { Router } from '../router.js?v=13';

// Global showToast is loaded from window scope

// All 22 official PTE question categories with their respective score weightings and skill associations
const CATEGORIES = {
  speaking: [
    { type: 'read-aloud', title: 'Read Aloud', weights: [{ val: '9%', skill: 'speaking' }], hasStar: true, icon: '🎙️' },
    { type: 'repeat-sentence', title: 'Repeat Sentence', weights: [{ val: '16%', skill: 'speaking' }, { val: '17%', skill: 'listening' }], hasStar: true, icon: '🔄' },
    { type: 'describe-image', title: 'Describe Image', weights: [{ val: '31%', skill: 'speaking' }], hasStar: true, icon: '📊' },
    { type: 'retell-lecture', title: 'Re-Tell Lecture', weights: [{ val: '13%', skill: 'speaking' }, { val: '13%', skill: 'listening' }], hasStar: true, icon: '🗣️' },
    { type: 'short-question', title: 'Answer Short Question', weights: [{ val: '4%', skill: 'speaking' }], hasStar: true, icon: '❓' },
    { type: 'group-discussion', title: 'Summarize Group Discussion', weights: [{ val: '19%', skill: 'speaking' }, { val: '20%', skill: 'listening' }], hasStar: true, icon: '👥' },
    { type: 'respond-situation', title: 'Respond to a Situation', weights: [{ val: '13%', skill: 'speaking' }], hasStar: true, icon: '💼' }
  ],
  writing: [
    { type: 'summarize-written', title: 'Summarize Written Text', weights: [{ val: '23%', skill: 'reading' }, { val: '28%', skill: 'writing' }], hasStar: true, icon: '📝' },
    { type: 'write-essay', title: 'Write Essay', weights: [{ val: '31%', skill: 'writing' }], hasStar: true, icon: '✍️' }
  ],
  reading: [
    { type: 'fib-dropdown', title: 'Fill in the Blanks (Dropdown)', weights: [{ val: '25%', skill: 'reading' }], hasStar: false, icon: '📖' },
    { type: 'mcq-multiple-reading', title: 'Multiple Choice, Multiple Answers', weights: [{ val: '5%', skill: 'reading' }], hasStar: false, icon: '✅' },
    { type: 'reorder-paragraphs', title: 'Re-order Paragraphs', weights: [{ val: '9%', skill: 'reading' }], hasStar: false, icon: '🔀' },
    { type: 'fib-drag-drop', title: 'Fill in the Blanks (Drag & Drop)', weights: [{ val: '20%', skill: 'reading' }], hasStar: false, icon: '👇' },
    { type: 'mcq-single-reading', title: 'Multiple Choice, Single Answer', weights: [{ val: '3%', skill: 'reading' }], hasStar: false, icon: '🔘' }
  ],
  listening: [
    { type: 'summarize-spoken', title: 'Summarize Spoken Text', weights: [{ val: '10%', skill: 'listening' }, { val: '18%', skill: 'writing' }], hasStar: true, icon: '🎧' },
    { type: 'mcq-multiple-listening', title: 'Multiple Choice, Multiple Answers', weights: [{ val: '3%', skill: 'listening' }], hasStar: false, icon: '✔️' },
    { type: 'fib-listening', title: 'Fill in the Blanks', weights: [{ val: '8%', skill: 'listening' }], hasStar: false, icon: '✏️' },
    { type: 'highlight-summary', title: 'Highlight Correct Summary', weights: [{ val: '2%', skill: 'listening' }, { val: '3%', skill: 'reading' }], hasStar: false, icon: '💡' },
    { type: 'mcq-single-listening', title: 'Multiple Choice, Single Answer', weights: [{ val: '2%', skill: 'listening' }], hasStar: false, icon: '🎯' },
    { type: 'missing-word', title: 'Select Missing Word', weights: [{ val: '1%', skill: 'listening' }], hasStar: false, icon: '🔍' },
    { type: 'highlight-incorrect', title: 'Highlight Incorrect Words', weights: [{ val: '8%', skill: 'listening' }, { val: '13%', skill: 'reading' }], hasStar: false, icon: '🚫' },
    { type: 'write-dictation', title: 'Write from Dictation', weights: [{ val: '13%', skill: 'listening' }, { val: '23%', skill: 'writing' }], hasStar: true, icon: '✍️' }
  ]
};

function getSkillIconSVG(skill) {
  let colorStart = '#0A84FF';
  let colorEnd = '#64D2FF';
  if (skill === 'speaking') { colorStart = '#FF453A'; colorEnd = '#FF9F0A'; }
  else if (skill === 'writing') { colorStart = '#FF9500'; colorEnd = '#FFCC00'; }
  else if (skill === 'reading') { colorStart = '#34C759'; colorEnd = '#30B0C7'; }
  
  const gradientId = `skill-grad-${skill}`;

  return `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:16px; height:16px;">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorStart}" />
          <stop offset="100%" stop-color="${colorEnd}" />
        </linearGradient>
      </defs>
      ${skill === 'speaking' ? `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="url(#${gradientId})"/><path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M12 18v4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>` : ''}
      ${skill === 'writing' ? `<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${skill === 'reading' ? `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${skill === 'listening' ? `<path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    </svg>
  `;
}

function getCategoryIconSVG(type, skill) {
  let colorStart = '#0A84FF';
  let colorEnd = '#64D2FF';
  if (skill === 'speaking') { colorStart = '#FF453A'; colorEnd = '#FF9F0A'; }
  else if (skill === 'writing') { colorStart = '#FF9500'; colorEnd = '#FFCC00'; }
  else if (skill === 'reading') { colorStart = '#34C759'; colorEnd = '#30B0C7'; }
  
  const gradientId = `grad-${type}`;

  const baseSvg = (content) => `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:22px; height:22px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorStart}" />
          <stop offset="100%" stop-color="${colorEnd}" />
        </linearGradient>
      </defs>
      ${content}
    </svg>
  `;

  switch (type) {
    case 'read-aloud':
      return baseSvg(`<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="url(#${gradientId})"/><path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M12 18v4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'repeat-sentence':
      return baseSvg(`<path d="M17 2.5a8.5 8.5 0 1 0 4.5 7.5" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M19 2v4h-4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M12 8v4l3 2" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'describe-image':
      return baseSvg(`<rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="M7 16V10" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M12 16V7" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><path d="M17 16v-5" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'retell-lecture':
      return baseSvg(`<path d="M11 5 6 9H2v6h4l5 4V5Z" fill="url(#${gradientId})"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'short-question':
      return baseSvg(`<circle cx="12" cy="12" r="10" stroke="url(#${gradientId})" stroke-width="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'group-discussion':
      return baseSvg(`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="url(#${gradientId})" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'respond-situation':
      return baseSvg(`<rect x="2" y="7" width="20" height="14" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'summarize-written':
      return baseSvg(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#${gradientId})" stroke-width="2"/><path d="M14 2v6h6M16 13H8M16 17H8" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'write-essay':
      return baseSvg(`<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'fib-dropdown':
      return baseSvg(`<rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="m15 10-3 3-3-3" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6h2M6 18h8" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'mcq-multiple-reading':
    case 'mcq-multiple-listening':
      return baseSvg(`<rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="m9 11 2 2 4-4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'reorder-paragraphs':
      return baseSvg(`<path d="M8 3v18M8 3 4 7M8 21l-4-4M16 21V3M16 21l4-4M16 3l4 4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'fib-drag-drop':
      return baseSvg(`<rect x="3" y="11" width="18" height="10" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="M12 2v9M9 5l3-3 3 3" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'mcq-single-reading':
    case 'mcq-single-listening':
    case 'missing-word':
      return baseSvg(`<circle cx="12" cy="12" r="10" stroke="url(#${gradientId})" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="url(#${gradientId})"/>`);
    case 'summarize-spoken':
      return baseSvg(`<path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6v6M9 10h6" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'fib-listening':
      return baseSvg(`<path d="M2 10h3M9 10h6M20 10h2M12 4v12M12 20h.01" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'highlight-summary':
      return baseSvg(`<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5h6Z" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 18h6M10 22h4" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'highlight-incorrect':
      return baseSvg(`<rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#${gradientId})" stroke-width="2"/><path d="m9 9 6 6M15 9l-6 6" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round"/>`);
    case 'write-dictation':
      return baseSvg(`<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="url(#${gradientId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="3" stroke="url(#${gradientId})" stroke-width="2"/>`);
    default:
      return baseSvg(`<circle cx="12" cy="12" r="10" stroke="url(#${gradientId})" stroke-width="2"/>`);
  }
}

export function renderPractice(container, params) {
  let activeQuestion = null;
  let selectedCategory = null; 
  let questionHistory = [];
  let selectedSkillTab = 'speaking';
  let searchQuery = '';
  let filterDifficulty = 'all';
  let filterStatus = 'all';
  let workspaceKeyDownHandler = null;

  let allQuestions = [];
  const rebuildAllQuestions = () => {
    const freshQuestions = Database.getQuestions();
    allQuestions = [];
    Object.keys(freshQuestions).forEach(skill => {
      freshQuestions[skill].forEach(q => {
        allQuestions.push({
          ...q,
          skill
        });
      });
    });
  };
  rebuildAllQuestions();

  if (params && params.questionId) {
    activeQuestion = allQuestions.find(q => q.id === params.questionId);
    if (activeQuestion) {
      selectedCategory = activeQuestion.taskType;
      if (['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'short-question', 'group-discussion', 'respond-situation'].includes(activeQuestion.taskType)) selectedSkillTab = 'speaking';
      else if (['write-essay', 'summarize-written'].includes(activeQuestion.taskType)) selectedSkillTab = 'writing';
      else if (['fib-dropdown', 'mcq-multiple-reading', 'reorder-paragraphs', 'fib-drag-drop', 'mcq-single-reading'].includes(activeQuestion.taskType)) selectedSkillTab = 'reading';
      else selectedSkillTab = 'listening';
    }
  }

  const triggerQuestionGeneration = async (btn, isWorkspace = false) => {
    let currentCategoryMeta = null;
    if (selectedCategory) {
      Object.keys(CATEGORIES).forEach(skill => {
        const match = CATEGORIES[skill].find(c => c.type === selectedCategory);
        if (match) currentCategoryMeta = match;
      });
    }

    const originalText = isWorkspace ? `New Question →` : `✨ Generate AI ${currentCategoryMeta ? currentCategoryMeta.title : 'Question'}`;
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Generating...</span>`;
    
    try {
      const taskType = isWorkspace ? activeQuestion.taskType : selectedCategory;
      const currentId = isWorkspace && activeQuestion ? activeQuestion.id : null;
      const newQ = await Database.generateAndAppendNewQuestion(taskType, currentId);
      if (newQ) {
        rebuildAllQuestions();
        if (isWorkspace && activeQuestion) {
          questionHistory.push(activeQuestion.id);
        }
        activeQuestion = allQuestions.find(q => q.id === newQ.id);
        cleanupWorkspaceAssets();
        renderView();
        showToast(`New question generated and loaded successfully!\nLoaded: "${newQ.title}"`, 'success');
      } else {
        showToast("Could not generate question. Fallback duplicate generated.", 'warning');
        rebuildAllQuestions();
        renderView();
      }
    } catch (e) {
      console.error(e);
      showToast(`Error generating dynamic question:\n${e.message || e}`, 'error');
      btn.disabled = false;
      btn.innerHTML = `<span>${originalText}</span>`;
    }
  };

  // Render initial workspace split panels skeleton once
  container.innerHTML = `
    <div class="practice-hub-container">
      <!-- Ambient macOS-style liquid glass background blobs -->
      <div class="glass-ambient-blob blob-1"></div>
      <div class="glass-ambient-blob blob-2"></div>
      <div class="glass-ambient-blob blob-3"></div>
      <div class="glass-ambient-blob blob-4"></div>

      <!-- Main Hub Panel -->
      <div class="hub-main-content" id="hub-main-content"></div>

      <!-- Fullscreen Focus Workspace Modal/Overlay -->
      <div class="focus-workspace-overlay hidden" id="focus-workspace-overlay">
        <div class="focus-card" id="focus-card">
          <!-- Zen Mode Active Banner Alert -->
          <div class="zen-mode-alert" id="zen-mode-alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px; height:14px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Zen Mode Active. Press ESC or click the yellow dot to exit.</span>
          </div>

          <div class="focus-header">
            <div style="display:flex; align-items:center;">
              <!-- macOS Style Controls -->
              <div class="mac-window-controls">
                <button class="mac-dot close" id="mac-close-btn" title="Close Workspace"></button>
                <button class="mac-dot minimize" id="mac-zen-toggle-btn" title="Toggle Zen Mode"></button>
                <button class="mac-dot maximize" id="mac-expand-toggle-btn" title="Toggle Fullscreen Width"></button>
              </div>
              <div class="focus-title-area">
                <span class="focus-cat-badge" id="focus-cat-badge"></span>
                <h2 class="focus-q-title" id="focus-q-title"></h2>
              </div>
            </div>
            <button class="btn-focus-close" id="focus-close-btn" aria-label="Close Practice Mode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span>Close Focus</span>
            </button>
          </div>
          <div class="focus-workspace-body">
            <div class="focus-split-layout">
              <!-- Workspace Area -->
              <div class="focus-main-area">
                <div class="focus-workspace-toolbar">
                  <button id="stage-zen-btn" class="btn btn-outline btn-sm">🧘 Zen Mode</button>
                  <button id="stage-hint-btn" class="btn btn-outline btn-sm">💡 Tip</button>
                  <button id="stage-uncleared-btn" class="btn btn-sm btn-outline-danger">Mark Uncleared</button>
                  <button id="stage-generate-btn" class="btn btn-primary btn-sm">Generate AI</button>
                  <button id="focus-sidebar-toggle-btn" class="focus-sidebar-toggle-btn" title="Toggle Insights Sidebar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                  </button>
                </div>
                <div id="practice-active-interactive-box"></div>
              </div>

              <!-- Collapsible Sidebar -->
              <div class="focus-glass-sidebar" id="focus-glass-sidebar">
                <!-- Content injected dynamically by renderFocusWorkspace -->
              </div>
            </div>
          </div>
        </div>
        
        <!-- Hint Card overlay -->
        <div id="practice-hint-card" class="card-glass-glow hidden">
          <div class="card-title-flex">
            <h4>AI Practice Tips & Templates</h4>
            <button id="practice-hint-close" class="btn-close-only">&times;</button>
          </div>
          <ul id="practice-hint-list"></ul>
        </div>
      </div>
    </div>
  `;

  const hubContent = document.getElementById('hub-main-content');
  const focusOverlay = document.getElementById('focus-workspace-overlay');
  const focusCard = document.getElementById('focus-card');
  const focusCloseBtn = document.getElementById('focus-close-btn');
  const focusCatBadge = document.getElementById('focus-cat-badge');
  const focusQTitle = document.getElementById('focus-q-title');
  const macCloseBtn = document.getElementById('mac-close-btn');
  const macZenBtn = document.getElementById('mac-zen-toggle-btn');
  const macExpandBtn = document.getElementById('mac-expand-toggle-btn');
  const sidebarToggleBtn = document.getElementById('focus-sidebar-toggle-btn');
  const focusSidebar = document.getElementById('focus-glass-sidebar');
  const stageZenBtn = document.getElementById('stage-zen-btn');

  // Set default category on initial load (disabled here to load landing grid by default)
  // if (!selectedCategory && CATEGORIES[selectedSkillTab] && CATEGORIES[selectedSkillTab].length > 0) {
  //   selectedCategory = CATEGORIES[selectedSkillTab][0].type;
  // }

  const renderCategoryGrid = () => {
    const progress = Database.getProgress();
    if (!progress.completedTasks) progress.completedTasks = [];

    const skills = ['speaking', 'writing', 'reading', 'listening'];
    const tabsHtml = skills.map(skill => {
      const skillDisplayName = skill.charAt(0).toUpperCase() + skill.slice(1);
      return `<button class="hub-tab-btn ${selectedSkillTab === skill ? 'active' : ''}" data-tab="${skill}">${skillDisplayName}</button>`;
    }).join('');

    const categoriesList = CATEGORIES[selectedSkillTab] || [];
    const gridCardsHtml = categoriesList.map(cat => {
      const catQuestions = allQuestions.filter(q => q.taskType === cat.type);
      const catTotal = catQuestions.length;
      const catCleared = progress.completedTasks.filter(id => allQuestions.some(q => q.id === id && q.taskType === cat.type)).length;
      const pct = catTotal > 0 ? Math.round((catCleared / catTotal) * 100) : 0;
      const formattedWeight = cat.weights.map(w => w.val).join(' / ');
      
      return `
        <div class="category-card" data-type="${cat.type}">
          <div class="category-card-header">
            <span class="category-card-icon">${cat.icon}</span>
            <span class="category-card-weight">Weight: ${formattedWeight}</span>
          </div>
          <h3 class="category-card-title">${cat.title}</h3>
          <p class="category-card-desc">Prepare and practice official PTE ${cat.title} questions with real-time AI scoring.</p>
          <div class="category-card-progress">
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="progress-bar-lbl">${catCleared}/${catTotal} Cleared (${pct}%)</span>
          </div>
          <button class="category-card-btn">Practice Now →</button>
        </div>
      `;
    }).join('');

    hubContent.className = `hub-main-content skill-${selectedSkillTab}`;
    hubContent.innerHTML = `
      <div class="hub-header">
        <h1 class="hub-title">PTE Practice Laboratory</h1>
        <p class="hub-subtitle">Immersive AI-powered exam prep workspace</p>
        <div class="hub-tabs">
          ${tabsHtml}
        </div>
      </div>
      <div class="category-grid">
        ${gridCardsHtml}
      </div>
    `;

    hubContent.querySelectorAll('.hub-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSkillTab = btn.getAttribute('data-tab');
        selectedCategory = null;
        activeQuestion = null;
        renderView();
      });
    });

    hubContent.querySelectorAll('.category-card').forEach((card, idx) => {
      card.classList.add('animate-fade-in-up');
      card.style.animationDelay = `${idx * 0.08}s`;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('click', () => {
        selectedCategory = card.getAttribute('data-type');
        activeQuestion = null;
        renderView();
      });
    });
  };

  const renderCategoryDetail = () => {
    const progress = Database.getProgress();
    if (!progress.completedTasks) progress.completedTasks = [];
    if (!progress.unclearedTasks) progress.unclearedTasks = [];

    const filteredQuestions = allQuestions.filter(q => {
      const matchCategory = q.taskType === selectedCategory;
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      
      let matchStatus = false;
      const isCompleted = progress.completedTasks.includes(q.id);
      const isUncleared = progress.unclearedTasks.includes(q.id);
      
      if (filterStatus === 'all') {
        matchStatus = true;
      } else if (filterStatus === 'completed') {
        matchStatus = isCompleted;
      } else if (filterStatus === 'uncleared') {
        matchStatus = isUncleared;
      }
      
      const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDiff && matchStatus && matchSearch;
    });

    const questionsHtml = filteredQuestions.map((q, idx) => {
      const isCompleted = progress.completedTasks.includes(q.id);
      const isUncleared = progress.unclearedTasks.includes(q.id);
      
      let statusClass = 'available';
      if (isCompleted) statusClass = 'completed';
      else if (isUncleared) statusClass = 'uncleared';

      return `
        <div class="cockpit-q-card animate-fade-in-up" data-qid="${q.id}" style="animation-delay: ${Math.min(idx * 0.04, 0.4)}s;">
          <div class="cockpit-q-info">
            <div class="cockpit-q-id-title">
              <span class="cockpit-q-status-dot ${statusClass}"></span>
              <span class="cockpit-q-title" title="${q.title}">${q.title}</span>
            </div>
            <div class="cockpit-q-meta">
              <span class="cockpit-q-id">${q.id}</span>
              <span class="cockpit-q-diff ${q.difficulty}">${q.difficulty}</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5" style="width:12px; height:12px; flex-shrink:0;"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;
    }).join('');

    let currentCategoryMeta = null;
    Object.keys(CATEGORIES).forEach(skill => {
      const match = CATEGORIES[skill].find(c => c.type === selectedCategory);
      if (match) currentCategoryMeta = match;
    });

    const formattedWeight = currentCategoryMeta.weights.map(w => w.val).join(' / ');
    const categoryQuestions = allQuestions.filter(q => q.taskType === selectedCategory);
    
    const catTotal = categoryQuestions.length;
    const catCleared = progress.completedTasks.filter(id => allQuestions.some(q => q.id === id && q.taskType === selectedCategory)).length;
    const pct = catTotal > 0 ? Math.round((catCleared / catTotal) * 100) : 0;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;

    const uncompletedQuestions = categoryQuestions.filter(q => !progress.completedTasks.includes(q.id));
    const quickStartQId = uncompletedQuestions.length > 0 
      ? uncompletedQuestions[Math.floor(Math.random() * uncompletedQuestions.length)].id 
      : (categoryQuestions.length > 0 ? categoryQuestions[0].id : null);

    hubContent.className = `hub-main-content skill-${selectedSkillTab}`;
    hubContent.innerHTML = `
      <div class="detail-header-row">
        <button class="btn-back-hub" id="back-to-hub-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px; height:14px; margin-right:4px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>All Categories</span>
        </button>
        <div class="detail-title-area">
          <span class="detail-cat-icon">${currentCategoryMeta.icon}</span>
          <h2 class="detail-cat-title">${currentCategoryMeta.title} Exercises</h2>
        </div>
      </div>

      <div class="detail-split-workspace">
        <!-- Directory column -->
        <div class="cockpit-col cockpit-questions-col" style="height: auto; min-height: 500px;">
          <div class="cockpit-search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink:0;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="cockpit-search-input" id="cockpit-search-input" value="${searchQuery}" placeholder="Search exercises...">
          </div>
          <div class="cockpit-filters-row">
            <select class="cockpit-filter-select" id="cockpit-filter-diff">
              <option value="all" ${filterDifficulty === 'all' ? 'selected' : ''}>Diff: All</option>
              <option value="easy" ${filterDifficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${filterDifficulty === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${filterDifficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
            <select class="cockpit-filter-select" id="cockpit-filter-status">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Status: All</option>
              <option value="completed" ${filterStatus === 'completed' ? 'selected' : ''}>Cleared</option>
              <option value="uncleared" ${filterStatus === 'uncleared' ? 'selected' : ''}>Uncleared</option>
            </select>
          </div>
          <div class="cockpit-questions-list">
            ${questionsHtml}
            ${filteredQuestions.length === 0 ? `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12px;">No exercises match filters.</div>` : ''}
          </div>
        </div>

        <!-- Dashboard / summary stage panel -->
        <div class="cockpit-col cockpit-stage-col" style="height: auto; min-height: 500px;">
          <div class="cockpit-welcome-stage">
            <div class="cockpit-welcome-banner">
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="dock-icon-circle bg-${selectedSkillTab}" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  ${getCategoryIconSVG(selectedCategory, selectedSkillTab)}
                </div>
                <div>
                  <h3 style="font-family:'Outfit',sans-serif; font-size:18px; font-weight:700; margin:0;">${currentCategoryMeta.title} Dashboard</h3>
                  <p style="font-size:11.5px; color:var(--text-secondary); margin:2px 0 0 0;">Exam Weight: <b>${formattedWeight}</b></p>
                </div>
              </div>

              <p style="font-size:13.5px; line-height:1.6; color:var(--text-secondary); margin:10px 0 0 0;">
                Select an exercise from the directory list on the left to start a distraction-free practice session, or launch a quick random practice card below.
              </p>

              <div style="display:flex; align-items:center; justify-content:center; margin:20px 0;">
                <div class="circular-ring-small" style="position:relative; width:100px; height:100px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.03));">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="ringGrad-${selectedSkillTab}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="var(--accent)" />
                        <stop offset="100%" stop-color="var(--accent)" style="filter: brightness(1.25);" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" stroke="rgba(0, 0, 0, 0.04)" stroke-width="6" fill="transparent" />
                    <circle id="detail-progress-circle" cx="50" cy="50" r="45" stroke="url(#ringGrad-${selectedSkillTab})" stroke-width="6" fill="transparent"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
                            style="transform: rotate(-90deg); transform-origin: 50px 50px; transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1); stroke-linecap: round;" />
                  </svg>
                  <div class="ring-small-pct" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-family:'Outfit',sans-serif; font-size:17px; font-weight:800; color:var(--text-primary);">${pct}%</div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:14px;">
                <span style="font-size:12px; color:var(--text-secondary); font-weight:700;">✅ ${catCleared}/${catTotal} Cleared</span>
                ${quickStartQId ? `<button id="stage-quick-btn" class="btn btn-primary btn-sm shadow-neon" data-qid="${quickStartQId}">⚡ Quick Start</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    document.getElementById('back-to-hub-btn').addEventListener('click', () => {
      selectedCategory = null;
      activeQuestion = null;
      renderView();
    });

    const searchEl = hubContent.querySelector('.cockpit-search-input');
    if (searchEl) {
      searchEl.addEventListener('input', () => {
        searchQuery = searchEl.value;
        renderQuestionsListOnly();
      });
    }

    const diffEl = document.getElementById('cockpit-filter-diff');
    if (diffEl) {
      diffEl.addEventListener('change', () => {
        filterDifficulty = diffEl.value;
        renderView();
      });
    }

    const statusEl = document.getElementById('cockpit-filter-status');
    if (statusEl) {
      statusEl.addEventListener('change', () => {
        filterStatus = statusEl.value;
        renderView();
      });
    }

    hubContent.querySelectorAll('.cockpit-q-card').forEach(card => {
      card.addEventListener('click', () => {
        const qid = card.getAttribute('data-qid');
        activeQuestion = allQuestions.find(q => q.id === qid);
        questionHistory = [];
        cleanupWorkspaceAssets();
        renderView();
      });
    });

    const quickBtn = document.getElementById('stage-quick-btn');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        const qid = quickBtn.getAttribute('data-qid');
        activeQuestion = allQuestions.find(q => q.id === qid);
        questionHistory = [];
        cleanupWorkspaceAssets();
        renderView();
      });
    }

    // Animate circular ring draw-in dynamically
    setTimeout(() => {
      const circle = document.getElementById('detail-progress-circle');
      if (circle) {
        circle.style.strokeDashoffset = `${offset}`;
      }
    }, 80);
  };

  const renderQuestionsListOnly = () => {
    const progress = Database.getProgress();
    if (!progress.completedTasks) progress.completedTasks = [];
    if (!progress.unclearedTasks) progress.unclearedTasks = [];

    const filteredQuestions = allQuestions.filter(q => {
      const matchCategory = q.taskType === selectedCategory;
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      
      let matchStatus = false;
      const isCompleted = progress.completedTasks.includes(q.id);
      const isUncleared = progress.unclearedTasks.includes(q.id);
      
      if (filterStatus === 'all') {
        matchStatus = true;
      } else if (filterStatus === 'completed') {
        matchStatus = isCompleted;
      } else if (filterStatus === 'uncleared') {
        matchStatus = isUncleared;
      }
      
      const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDiff && matchStatus && matchSearch;
    });

    const listDeck = hubContent.querySelector('.cockpit-questions-list');
    if (!listDeck) return;

    listDeck.innerHTML = filteredQuestions.map(q => {
      const isCompleted = progress.completedTasks.includes(q.id);
      const isUncleared = progress.unclearedTasks.includes(q.id);
      
      let statusClass = 'available';
      if (isCompleted) statusClass = 'completed';
      else if (isUncleared) statusClass = 'uncleared';

      return `
        <div class="cockpit-q-card" data-qid="${q.id}">
          <div class="cockpit-q-info">
            <div class="cockpit-q-id-title">
              <span class="cockpit-q-status-dot ${statusClass}"></span>
              <span class="cockpit-q-title" title="${q.title}">${q.title}</span>
            </div>
            <div class="cockpit-q-meta">
              <span class="cockpit-q-id">${q.id}</span>
              <span class="cockpit-q-diff ${q.difficulty}">${q.difficulty}</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5" style="width:12px; height:12px; flex-shrink:0;"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;
    }).join('') + (filteredQuestions.length === 0 ? `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12px;">No exercises match filters.</div>` : '');

    listDeck.querySelectorAll('.cockpit-q-card').forEach(card => {
      card.addEventListener('click', () => {
        const qid = card.getAttribute('data-qid');
        activeQuestion = allQuestions.find(q => q.id === qid);
        questionHistory = [];
        cleanupWorkspaceAssets();
        renderView();
      });
    });
  };

  const getSidebarRubricHtml = (type) => {
    switch (type) {
      case 'read-aloud':
        return `
          <li><b>Content (5 pts)</b>: All words read correctly without omissions or substitutions.</li>
          <li><b>Oral Fluency (5 pts)</b>: Natural, smooth pacing. No hesitation or unnatural pauses.</li>
          <li><b>Pronunciation (5 pts)</b>: Vowels and consonants clearly articulated in standard accent.</li>
        `;
      case 'repeat-sentence':
        return `
          <li><b>Content (3 pts)</b>: All words repeated in the correct order.</li>
          <li><b>Oral Fluency (5 pts)</b>: Smooth, continuous speech. No stuttering or halting.</li>
          <li><b>Pronunciation (5 pts)</b>: Accurate phonetics and syllable stress.</li>
        `;
      case 'describe-image':
        return `
          <li><b>Content (5 pts)</b>: Accurately describes key elements, trends, and relationships in the chart.</li>
          <li><b>Oral Fluency (5 pts)</b>: Even tempo without pauses over 2 seconds.</li>
          <li><b>Pronunciation (5 pts)</b>: Proper articulation.</li>
        `;
      case 'retell-lecture':
        return `
          <li><b>Content (5 pts)</b>: Summarises main ideas, key facts, and conclusions of the lecture.</li>
          <li><b>Oral Fluency (5 pts)</b>: Smooth storytelling tempo.</li>
          <li><b>Pronunciation (5 pts)</b>: Clear speaking pronunciation.</li>
        `;
      case 'write-essay':
        return `
          <li><b>Content (3 pts)</b>: Directly answers prompt with sound arguments.</li>
          <li><b>Form (2 pts)</b>: Length matches required range (200-300 words).</li>
          <li><b>Grammar (2 pts)</b>: Sophisticated grammar with minimal errors.</li>
          <li><b>Vocabulary (2 pts)</b>: Rich academic phrasing and diverse word choices.</li>
        `;
      case 'summarize-written':
        return `
          <li><b>Content (2 pts)</b>: Covers all key points of the text.</li>
          <li><b>Form (1 pt)</b>: Exactly one single, complete sentence (5-75 words).</li>
          <li><b>Grammar (2 pts)</b>: Clean syntax.</li>
          <li><b>Vocabulary (2 pts)</b>: Appropriate semantic equivalents.</li>
        `;
      case 'fib-dropdown':
      case 'fib-drag-drop':
        return `
          <li><b>Grammar (1 pt/blank)</b>: Subject-verb agreement, tenses, part-of-speech context.</li>
          <li><b>Collocations (1 pt/blank)</b>: Natural English phrases (e.g., "take into account").</li>
          <li><b>Contextual Clues</b>: Reading surrounding sentences for meaning.</li>
        `;
      case 'reorder-paragraphs':
        return `
          <li><b>Coherence (1 pt/pair)</b>: Logic-based paragraph ordering.</li>
          <li><b>Transition markers</b>: Identifying pronouns, conjunctions, and chronological order signals.</li>
        `;
      case 'summarize-spoken':
        return `
          <li><b>Content (2 pts)</b>: Represents main points of the recording.</li>
          <li><b>Form (2 pts)</b>: Single paragraph, 50-70 words.</li>
          <li><b>Spelling & Grammar (2 pts)</b>: Standard English conventions.</li>
        `;
      case 'write-dictation':
        return `
          <li><b>Content (1 pt per word)</b>: Every word spelled correctly in the exact sequence spoken.</li>
          <li><b>Spelling (1 pt per word)</b>: Crucial for listening score.</li>
        `;
      default:
        return `
          <li><b>Content (2 pts)</b>: Directly matches prompt guidelines.</li>
          <li><b>Form (2 pts)</b>: Structure complies with PTE conventions.</li>
          <li><b>Language Use (2 pts)</b>: Grammatical accuracy and vocabulary choice.</li>
        `;
    }
  };

  const getSidebarSkillAlignmentHtml = (type, skill) => {
    let distributions = [];
    if (type === 'read-aloud') distributions = [{ name: 'Speaking', val: 65 }, { name: 'Reading', val: 35 }];
    else if (type === 'repeat-sentence') distributions = [{ name: 'Speaking', val: 60 }, { name: 'Listening', val: 40 }];
    else if (type === 'describe-image') distributions = [{ name: 'Speaking', val: 100 }];
    else if (type === 'retell-lecture') distributions = [{ name: 'Speaking', val: 70 }, { name: 'Listening', val: 30 }];
    else if (type === 'write-essay') distributions = [{ name: 'Writing', val: 100 }];
    else if (type === 'summarize-written') distributions = [{ name: 'Writing', val: 55 }, { name: 'Reading', val: 45 }];
    else if (type === 'fib-dropdown' || type === 'fib-drag-drop') distributions = [{ name: 'Reading', val: 75 }, { name: 'Writing', val: 25 }];
    else if (type === 'reorder-paragraphs') distributions = [{ name: 'Reading', val: 100 }];
    else if (type === 'summarize-spoken') distributions = [{ name: 'Listening', val: 50 }, { name: 'Writing', val: 50 }];
    else if (type === 'write-dictation') distributions = [{ name: 'Listening', val: 50 }, { name: 'Writing', val: 50 }];
    else {
      if (skill === 'speaking') distributions = [{ name: 'Speaking', val: 100 }];
      else if (skill === 'writing') distributions = [{ name: 'Writing', val: 100 }];
      else if (skill === 'reading') distributions = [{ name: 'Reading', val: 100 }];
      else distributions = [{ name: 'Listening', val: 100 }];
    }

    return distributions.map(d => `
      <div class="gauge-row">
        <span class="gauge-name" style="width: 60px;">${d.name}</span>
        <div class="gauge-bar-outer" style="flex-grow:1; margin: 0 10px;">
          <div class="gauge-bar-inner" style="width: ${d.val}%;"></div>
        </div>
        <span class="gauge-name" style="font-weight:700; width:30px; text-align:right;">${d.val}%</span>
      </div>
    `).join('');
  };

  const renderFocusWorkspace = () => {
    const progress = Database.getProgress();
    if (!progress.completedTasks) progress.completedTasks = [];
    if (!progress.unclearedTasks) progress.unclearedTasks = [];

    const isUncleared = progress.unclearedTasks.includes(activeQuestion.id);
    let currentCategoryMeta = null;
    Object.keys(CATEGORIES).forEach(skill => {
      const match = CATEGORIES[skill].find(c => c.type === activeQuestion.taskType);
      if (match) currentCategoryMeta = match;
    });

    focusOverlay.className = `focus-workspace-overlay skill-${selectedSkillTab}`;
    focusCatBadge.textContent = currentCategoryMeta ? currentCategoryMeta.title : activeQuestion.taskType;
    focusQTitle.textContent = `${activeQuestion.id}: ${activeQuestion.title}`;

    // Update buttons state
    const unclearedBtn = document.getElementById('stage-uncleared-btn');
    if (isUncleared) {
      unclearedBtn.className = 'btn btn-sm btn-danger';
      unclearedBtn.innerHTML = 'Marked Uncleared';
    } else {
      unclearedBtn.className = 'btn btn-sm btn-outline-danger';
      unclearedBtn.innerHTML = 'Mark Uncleared';
    }

    // Bind Close Button & Red macOS Dot
    const handleCloseFocus = () => {
      activeQuestion = null;
      cleanupWorkspaceAssets();
      renderView();
    };
    focusCloseBtn.onclick = handleCloseFocus;
    macCloseBtn.onclick = handleCloseFocus;

    // Bind Zen Mode Toggles (Yellow Dot & Toolbar Button)
    const toggleZenMode = () => {
      focusCard.classList.toggle('zen-active');
      if (focusCard.classList.contains('zen-active')) {
        showToast("Zen Focus Mode enabled. Minimize distractions!", "success");
      } else {
        showToast("Zen Focus Mode disabled.", "info");
      }
    };
    macZenBtn.onclick = toggleZenMode;
    stageZenBtn.onclick = toggleZenMode;

    // Bind Fullscreen Width Toggle (Green Dot)
    macExpandBtn.onclick = () => {
      focusCard.classList.toggle('max-width-full');
      if (focusCard.classList.contains('max-width-full')) {
        showToast("Workspace expanded to fullscreen viewport.", "info");
      } else {
        showToast("Workspace restored to centered layout.", "info");
      }
    };

    // Bind Sidebar Toggle
    sidebarToggleBtn.onclick = () => {
      if (focusSidebar.classList.contains('hidden')) {
        focusSidebar.classList.remove('hidden');
        sidebarToggleBtn.style.background = 'rgba(0, 0, 0, 0.08)';
        sidebarToggleBtn.style.color = 'var(--text-primary)';
      } else {
        focusSidebar.classList.add('hidden');
        sidebarToggleBtn.style.background = 'transparent';
        sidebarToggleBtn.style.color = 'var(--text-muted)';
      }
    };

    // Bind Keyboard ESC listener
    if (workspaceKeyDownHandler) {
      document.removeEventListener('keydown', workspaceKeyDownHandler);
    }
    workspaceKeyDownHandler = (e) => {
      if (e.key === 'Escape') {
        if (focusCard.classList.contains('zen-active')) {
          focusCard.classList.remove('zen-active');
          showToast("Zen Focus Mode disabled.", "info");
        } else if (!focusOverlay.classList.contains('hidden')) {
          handleCloseFocus();
        }
      }
    };
    document.addEventListener('keydown', workspaceKeyDownHandler);

    // Bind Tip Button
    document.getElementById('stage-hint-btn').onclick = () => {
      const tipCard = document.getElementById('practice-hint-card');
      const tipList = document.getElementById('practice-hint-list');
      tipList.innerHTML = (activeQuestion.tips || ["Focus on grammatical cohesion.", "Maintain pacing details."]).map(tip => `<li>${tip}</li>`).join('');
      tipCard.classList.remove('hidden');
    };

    document.getElementById('practice-hint-close').onclick = () => {
      document.getElementById('practice-hint-card').classList.add('hidden');
    };

    // Bind Uncleared Button
    unclearedBtn.onclick = async () => {
      const currentlyUncleared = progress.unclearedTasks.includes(activeQuestion.id);
      unclearedBtn.disabled = true;
      
      if (currentlyUncleared) {
        unclearedBtn.innerHTML = `<span>Clearing...</span>`;
        await Database.markQuestionUncleared(activeQuestion.id, false);
        rebuildAllQuestions();
        showToast("Question cleared and deleted forever from your study bank!", 'success');
        cleanupWorkspaceAssets();
        activeQuestion = null;
        renderView();
      } else {
        unclearedBtn.innerHTML = `<span>Marking...</span>`;
        await Database.markQuestionUncleared(activeQuestion.id, true);
        rebuildAllQuestions();
        showToast(`Question successfully marked as Uncleared and saved!`, 'success');
        renderView();
      }
    };

    // Bind Generate Button
    const genBtn = document.getElementById('stage-generate-btn');
    genBtn.onclick = () => triggerQuestionGeneration(genBtn, true);

    const subbox = document.getElementById('practice-active-interactive-box');
    const type = activeQuestion.taskType;

    // Render dynamic sidebar content
    const rubricHtml = getSidebarRubricHtml(type);
    const skillAlignmentHtml = getSidebarSkillAlignmentHtml(type, selectedSkillTab);
    const tipListHtml = (activeQuestion.tips || ["Maintain natural rhythm.", "Avoid long pauses."]).map(t => `<li>${t}</li>`).join('');

    focusSidebar.innerHTML = `
      <div class="sidebar-section">
        <h4>📊 Skill Distribution</h4>
        <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.02);">
          ${skillAlignmentHtml}
        </div>
      </div>
      <div class="sidebar-section">
        <h4>🎯 Official Rubric</h4>
        <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.02);">
          <ul class="rubric-list">
            ${rubricHtml}
          </ul>
        </div>
      </div>
      <div class="sidebar-section">
        <h4>💡 Quick Guide</h4>
        <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.02);">
          <ul class="rubric-list" style="padding-left:14px;">
            ${tipListHtml}
          </ul>
        </div>
      </div>
    `;
    
    // Ensure sidebar is visible when loading a new exercise
    focusSidebar.classList.remove('hidden');
    sidebarToggleBtn.style.background = 'rgba(0, 0, 0, 0.08)';
    sidebarToggleBtn.style.color = 'var(--text-primary)';
    focusCard.classList.remove('zen-active');
    focusCard.classList.remove('max-width-full');

    if (type === 'read-aloud' || type === 'describe-image' || type === 'repeat-sentence' || type === 'retell-lecture' || type === 'group-discussion' || type === 'short-question' || type === 'respond-situation') {
      renderSpeakingWorkspace(subbox);
    } else if (type === 'write-essay' || type === 'summarize-written') {
      renderWritingWorkspace(subbox);
    } else if (type === 'fib-dropdown' || type === 'fib-drag-drop') {
      renderReadingWorkspace(subbox);
    } else if (type === 'reorder-paragraphs') {
      renderReorderParagraphsWorkspace(subbox);
    } else if (type === 'summarize-spoken') {
      renderListeningWorkspace(subbox);
    } else if (type === 'write-dictation') {
      renderWriteFromDictationWorkspace(subbox);
    } else if (type === 'highlight-incorrect') {
      renderHighlightIncorrectWorkspace(subbox);
    } else if (type === 'fib-listening') {
      renderListeningFIBWorkspace(subbox);
    } else {
      renderGenericMCQWorkspace(subbox);
    }
  };

  const renderView = () => {
    const overlay = document.getElementById('focus-workspace-overlay');
    if (activeQuestion) {
      overlay.classList.remove('hidden');
      renderFocusWorkspace();
    } else {
      overlay.classList.add('hidden');
      cleanupWorkspaceAssets();
      if (selectedCategory) {
        renderCategoryDetail();
      } else {
        renderCategoryGrid();
      }
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error("Failed to play beep sound", e);
    }
  };

  const getWaveformHTML = () => {
    return `
      <div class="waveform-vis-container" id="prac-waveform-vis">
        ${Array.from({ length: 24 }).map(() => `<div class="waveform-bar"></div>`).join('')}
      </div>
    `;
  };

  const setupPremiumAudioPlayer = (playBtnId, timelineFillId, timeLblId, textToSpeak, duration, onEndCallback) => {
    const play = document.getElementById(playBtnId);
    const fill = document.getElementById(timelineFillId);
    const lbl = document.getElementById(timeLblId);
    if (!play || !fill || !lbl) return;

    let playing = false;
    let current = 0;
    let timer = null;
    let utterance = null;
    let isPaused = false;

    const toggleWaveform = (active) => {
      const wave = document.getElementById('prac-waveform-vis');
      if (wave) {
        if (active) wave.classList.add('playing');
        else wave.classList.remove('playing');
      }
    };

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const updateTimeline = (pct) => {
      fill.style.width = `${pct}%`;
      if (fill.parentElement) {
        fill.parentElement.style.setProperty('--progress-pct', `${pct}%`);
      }
    };

    const stopAudio = () => {
      if (timer) clearInterval(timer);
      window.speechSynthesis.cancel();
      playing = false;
      isPaused = false;
      toggleWaveform(false);
      if (play) {
        play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      }
      updateTimeline(0);
      if (lbl) lbl.textContent = `0:00 / ${formatTime(duration)}`;
    };

    play.addEventListener('click', () => {
      if (playing) {
        clearInterval(timer);
        playing = false;
        toggleWaveform(false);
        play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        window.speechSynthesis.pause();
        isPaused = true;
      } else {
        playing = true;
        toggleWaveform(true);
        play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        
        if (isPaused && utterance) {
          window.speechSynthesis.resume();
          isPaused = false;
        } else {
          window.speechSynthesis.cancel();
          utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 1.0;
          utterance.onend = () => {
            clearInterval(timer);
            playing = false;
            current = 0;
            updateTimeline(0);
            toggleWaveform(false);
            lbl.textContent = `0:00 / ${formatTime(duration)}`;
            play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            isPaused = false;
            if (onEndCallback) onEndCallback();
          };
          window.speechSynthesis.speak(utterance);
        }

        timer = setInterval(() => {
          current++;
          const pct = Math.min(100, (current / duration) * 100);
          updateTimeline(pct);
          lbl.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
          if (current >= duration) {
            clearInterval(timer);
            playing = false;
            current = 0;
            updateTimeline(0);
            toggleWaveform(false);
            lbl.textContent = `0:00 / ${formatTime(duration)}`;
            play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            window.speechSynthesis.cancel();
            isPaused = false;
            if (onEndCallback) onEndCallback();
          }
        }, 1000);
      }
    });

    window.lecturePlayer = { pause: stopAudio };
  };

  const cleanupWorkspaceAssets = () => {
    if (workspaceKeyDownHandler) {
      document.removeEventListener('keydown', workspaceKeyDownHandler);
      workspaceKeyDownHandler = null;
    }
    if (window.speakingTimerInterval) clearInterval(window.speakingTimerInterval);
    if (window.audioStream) {
      window.audioStream.getTracks().forEach(track => track.stop());
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window.speechRecognitionInstance) {
      window.speechRecognitionInstance.stop();
      window.speechRecognitionInstance = null;
    }
    if (window.lecturePlayer) window.lecturePlayer.pause();
  };

  /* ==========================================================================
     INDIVIDUAL WORKSPACE RENDERERS
     ========================================================================== */

  // 1. Unified Speaking Workspace Renderer
  const renderSpeakingWorkspace = (subbox) => {
    const type = activeQuestion.taskType;
    
    // Prep time and read time configurations
    let prepTimeLimit = activeQuestion.prepTime || 40;
    let recordTimeLimit = activeQuestion.readTime || 40;
    
    if (type === 'repeat-sentence') {
      prepTimeLimit = 3;
      recordTimeLimit = 10;
    } else if (type === 'short-question') {
      prepTimeLimit = 3;
      recordTimeLimit = 8;
    } else if (type === 'respond-situation') {
      prepTimeLimit = 20;
      recordTimeLimit = 40;
    } else if (type === 'retell-lecture' || type === 'group-discussion') {
      prepTimeLimit = 10;
      recordTimeLimit = 40;
    }

    const needsPlayback = (type === 'repeat-sentence' || type === 'retell-lecture' || type === 'group-discussion' || type === 'short-question' || type === 'respond-situation');

    // Render workspace skeleton
    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p id="prac-speak-inst-text"></p>
      </div>

      <!-- Describe Image SVG diagram (only for Describe Image) -->
      <div id="prac-speak-diagram-box" class="hidden"></div>

      <!-- Text Prompt (only for Read Aloud) -->
      <div id="prac-speak-prompt-box" class="sim-prompt-box hidden" style="margin-bottom:20px; font-size:16px;">
        <p>${activeQuestion.text || ''}</p>
      </div>

      <!-- Playback Container (for listening-based speaking tasks) -->
      <div id="prac-speak-player-box" class="lecture-player-container hidden" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px; height:18px;"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;" id="prac-speak-player-title">Audio Prompt</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;" id="prac-speak-player-subtitle">Listen to the reference recording</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-speak-play-btn" class="btn-play-trigger" title="Play Prompt">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-speak-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-speak-time-lbl" style="font-size:12px; color:var(--text-muted); font-family:monospace;">0:00 / 0:08</span>
        </div>
        ${getWaveformHTML()}
      </div>

      <!-- Audio Recorder Deck -->
      <div class="audio-recorder-deck" style="margin-bottom:20px;">
        <div class="recorder-status-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="rec-status" style="display:flex; align-items:center; gap:8px;">
            <span id="prac-speak-dot" class="rec-status-dot" style="width:10px; height:10px; border-radius:50%; background-color:var(--text-muted); display:inline-block;"></span>
            <span id="prac-speak-txt" style="font-weight:600; font-size:13.5px; color:var(--text-primary);">Status: Ready</span>
          </span>
          <span id="prac-speak-timer" style="font-size:13px; font-weight:600; color:var(--accent);">Prep Time: ${prepTimeLimit}s</span>
        </div>
        <div class="visualizer-wrapper">
          <canvas id="prac-speak-canvas" class="visualizer-canvas" width="600" height="80"></canvas>
          <div id="prac-speak-placeholder" class="visualizer-placeholder">Waveform activates when recording</div>
        </div>
      </div>

      <!-- Control Button Panel -->
      <div style="display:flex; gap:12px;">
        <button id="prac-speak-primary-btn" class="btn btn-primary shadow-neon">Start Recording</button>
        <button id="prac-speak-submit-btn" class="btn btn-accent hidden">Submit response for evaluation</button>
      </div>
    `;

    // Dynamic Element Handles
    const instText = document.getElementById('prac-speak-inst-text');
    const diagramBox = document.getElementById('prac-speak-diagram-box');
    const promptBox = document.getElementById('prac-speak-prompt-box');
    const playerBox = document.getElementById('prac-speak-player-box');
    const playBtn = document.getElementById('prac-speak-play-btn');
    const timelineFill = document.getElementById('prac-speak-timeline-fill');
    const timeLbl = document.getElementById('prac-speak-time-lbl');
    const statusTxt = document.getElementById('prac-speak-txt');
    const statusDot = document.getElementById('prac-speak-dot');
    const timerVal = document.getElementById('prac-speak-timer');
    const placeholder = document.getElementById('prac-speak-placeholder');
    const primaryBtn = document.getElementById('prac-speak-primary-btn');
    const submitBtn = document.getElementById('prac-speak-submit-btn');
    const canvas = document.getElementById('prac-speak-canvas');
    const ctx = canvas.getContext('2d');

    // Setup visual instructions & cards based on taskType
    let instructionHTML = '';
    if (type === 'read-aloud') {
      instructionHTML = 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read.';
      promptBox.classList.remove('hidden');
    } else if (type === 'describe-image') {
      instructionHTML = 'Look at the diagram below. In 25 seconds, you must describe the main details of the diagram. You have 40 seconds to speak.';
      diagramBox.classList.remove('hidden');
      renderDescribeImageDiagram(diagramBox);
    } else if (type === 'repeat-sentence') {
      instructionHTML = 'You will hear a sentence. Please repeat the sentence exactly as you hear it. Audio will begin automatically after a short countdown.';
      playerBox.classList.remove('hidden');
      document.getElementById('prac-speak-player-title').textContent = 'Repeat Sentence';
    } else if (type === 'retell-lecture') {
      instructionHTML = 'You will hear a short lecture clip. Please re-tell the lecture in your own words. Click play to start listening.';
      playerBox.classList.remove('hidden');
      document.getElementById('prac-speak-player-title').textContent = 'PTE Lecture Audio';
    } else if (type === 'group-discussion') {
      instructionHTML = 'You will hear a discussion among multiple speakers. Please summarize the key viewpoints. Click play to start listening.';
      playerBox.classList.remove('hidden');
      document.getElementById('prac-speak-player-title').textContent = 'Group Discussion Audio';
    } else if (type === 'short-question') {
      instructionHTML = 'You will hear a short question. Speak a single word or short phrase response. Click play to listen.';
      playerBox.classList.remove('hidden');
      document.getElementById('prac-speak-player-title').textContent = 'Short Question Audio';
    } else if (type === 'respond-situation') {
      instructionHTML = 'Listen to the prompt situation description. Then, speak your response as required. Click play to listen.';
      playerBox.classList.remove('hidden');
      document.getElementById('prac-speak-player-title').textContent = 'Situation Description Audio';
    }
    instText.innerHTML = `<b>Task:</b> ${instructionHTML}`;

    // Audio recording & visualizer variables
    let recording = false;
    let prepTimer = null;
    let recTimer = null;
    let secondsLeft = prepTimeLimit;
    let recSecondsLeft = recordTimeLimit;
    let audioPlaying = false;
    let animationId;
    let analyser;
    let dataArray;
    let playbackInterval;
    let phase = 0;

    // Reset globally recorded variables
    window.recordedAudioBlob = null;
    if (window.offlineSpeechTranscript) delete window.offlineSpeechTranscript;

    // Draw random simulated sound wave if mic blocked
    const drawMockWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isLightTheme = document.body.classList.contains('light-theme');
      const waves = [
        {
          color: isLightTheme ? 'rgba(0, 122, 255, 0.65)' : 'rgba(10, 132, 255, 0.75)',
          freq: 3.5,
          phaseShift: 0,
          ampMult: 1.0
        },
        {
          color: isLightTheme ? 'rgba(175, 82, 222, 0.55)' : 'rgba(191, 90, 242, 0.65)',
          freq: 4.8,
          phaseShift: Math.PI / 2,
          ampMult: 0.7
        },
        {
          color: isLightTheme ? 'rgba(52, 199, 89, 0.45)' : 'rgba(48, 209, 88, 0.55)',
          freq: 2.2,
          phaseShift: -Math.PI / 3,
          ampMult: 0.4
        }
      ];

      const baseAmp = (canvas.height / 3.5) * (0.8 + 0.2 * Math.sin(phase * 0.5));

      waves.forEach(wave => {
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = isLightTheme ? 2 : 2.5;
        ctx.beginPath();
        
        const step = 2;
        for (let x = 0; x <= canvas.width; x += step) {
          const t = x / canvas.width;
          const taper = Math.sin(t * Math.PI);
          const y = canvas.height / 2 + 
                    Math.sin(t * Math.PI * wave.freq + phase + wave.phaseShift) * 
                    baseAmp * wave.ampMult * taper;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      phase += 0.08;
      animationId = requestAnimationFrame(drawMockWave);
    };

    // Helper: trigger audio playback (used by both manual click and auto-play)
    const triggerAudioPlayback = () => {
      if (audioPlaying) return;
      audioPlaying = true;
      playBtn.disabled = true;
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px; height:14px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      statusTxt.textContent = 'Status: Listening to prompt audio...';
      
      const wave = document.getElementById('prac-waveform-vis');
      if (wave) wave.classList.add('playing');

      const textToSpeak = activeQuestion.questionText || activeQuestion.text;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Setup speech synthesis rates
      utterance.rate = type === 'repeat-sentence' ? 0.95 : 1.0; 

      // Simulate progress bar filling
      const speechDuration = Math.max(3, Math.min(12, Math.round(textToSpeak.split(' ').length * 0.45)));
      let playCurrent = 0;
      timeLbl.textContent = `0:00 / 0:${speechDuration.toString().padStart(2, '0')}`;
      
      playbackInterval = setInterval(() => {
        playCurrent += 0.1;
        const pct = Math.min(100, (playCurrent / speechDuration) * 100);
        timelineFill.style.width = `${pct}%`;
        if (timelineFill.parentElement) {
          timelineFill.parentElement.style.setProperty('--progress-pct', `${pct}%`);
        }
        const currentSec = Math.floor(playCurrent);
        timeLbl.textContent = `0:${currentSec.toString().padStart(2, '0')} / 0:${speechDuration.toString().padStart(2, '0')}`;
        if (playCurrent >= speechDuration) {
          clearInterval(playbackInterval);
          if (wave) wave.classList.remove('playing');
        }
      }, 100);

      utterance.onend = () => {
        clearInterval(playbackInterval);
        timelineFill.style.width = '100%';
        if (timelineFill.parentElement) {
          timelineFill.parentElement.style.setProperty('--progress-pct', '100%');
        }
        timeLbl.textContent = `0:${speechDuration.toString().padStart(2, '0')} / 0:${speechDuration.toString().padStart(2, '0')}`;
        audioPlaying = false;
        playBtn.innerHTML = `<span>🔊 Played</span>`;
        statusDot.style.backgroundColor = 'var(--success)';
        statusTxt.textContent = 'Status: Prompt completed. Unlocking recording.';
        if (wave) wave.classList.remove('playing');
        
        // Small delay before starting preparation automatically
        setTimeout(() => {
          startPrepCountdown();
        }, 600);
      };

      window.speechSynthesis.speak(utterance);
    };

    // If needs playback: lock recording controls until audio finishes
    if (needsPlayback) {
      primaryBtn.disabled = true;
      primaryBtn.textContent = 'Listen to prompt first';
      statusTxt.textContent = 'Status: Please listen to the recording prompt first.';
      statusDot.style.backgroundColor = 'var(--warning)';

      // Manual play button click handler (for non-repeat-sentence types)
      playBtn.addEventListener('click', () => {
        triggerAudioPlayback();
      });

      // AUTO-PLAY with 3-second countdown for Repeat Sentence
      if (type === 'repeat-sentence') {
        playBtn.style.display = 'none'; // Hide manual play button
        statusTxt.textContent = 'Status: Get ready — audio starts in 3 seconds...';
        statusDot.style.backgroundColor = '#fbbf24';
        timerVal.textContent = 'Starting in: 3s';
        timerVal.style.color = '#fbbf24';

        let countdownSec = 3;
        const countdownTimer = setInterval(() => {
          countdownSec--;
          if (countdownSec > 0) {
            timerVal.textContent = `Starting in: ${countdownSec}s`;
            statusTxt.textContent = `Status: Get ready — audio starts in ${countdownSec} second${countdownSec > 1 ? 's' : ''}...`;
          } else {
            clearInterval(countdownTimer);
            timerVal.textContent = 'Playing...';
            timerVal.style.color = 'var(--accent)';
            statusTxt.textContent = 'Status: Playing audio — listen carefully!';
            statusDot.style.backgroundColor = 'var(--accent)';
            triggerAudioPlayback();
          }
        }, 1000);
      }
    } else {
      // Direct preparation for Read Aloud and Describe Image
      startPrepCountdown();
    }

    function startPrepCountdown() {
      if (playbackInterval) clearInterval(playbackInterval);
      window.speechSynthesis.cancel();

      // Show and configure buttons
      primaryBtn.disabled = false;
      primaryBtn.className = 'btn btn-primary shadow-neon';
      primaryBtn.textContent = 'Skip Prep & Record';
      statusTxt.textContent = 'Status: Preparing response...';
      statusDot.className = 'rec-status-dot';
      statusDot.style.backgroundColor = '#fbbf24'; // Amber

      secondsLeft = prepTimeLimit;
      timerVal.textContent = `Prep Time: ${secondsLeft}s`;
      timerVal.style.color = '#fbbf24';

      prepTimer = setInterval(() => {
        secondsLeft--;
        timerVal.textContent = `Prep Time: ${secondsLeft}s`;
        if (secondsLeft <= 0) {
          clearInterval(prepTimer);
          startRecordingFlow();
        }
      }, 1000);

      primaryBtn.onclick = () => {
        clearInterval(prepTimer);
        startRecordingFlow();
      };
    }

    const startRecordingFlow = () => {
      recording = true;
      primaryBtn.textContent = "Stop Recording";
      primaryBtn.className = "btn btn-danger";
      statusTxt.textContent = "Status: Recording... Speak Now";
      statusDot.className = "rec-status-dot pulse-red";
      statusDot.style.backgroundColor = 'var(--error)';
      placeholder.classList.add('hidden');

      // Setup offline browser SpeechRecognition for fallback/feedback
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        window.offlineSpeechTranscript = '';
        recognition.onresult = (event) => {
          let resultText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) resultText += event.results[i][0].transcript + ' ';
          }
          window.offlineSpeechTranscript += resultText;
        };
        recognition.start();
        window.speechRecognitionInstance = recognition;
      }

      // Initialize real audio analyser & recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = window.audioContext.createMediaStreamSource(stream);
          analyser = window.audioContext.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          
          const bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);

          const chunks = [];
          let mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          mediaRecorder.onstop = () => {
            window.recordedAudioBlob = new Blob(chunks, { type: 'audio/webm' });
          };
          mediaRecorder.start();
          window.mediaRecorder = mediaRecorder;

           const drawReal = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;

            const minAmp = 2;
            const maxAmp = canvas.height / 2.2;
            const volumeAmp = minAmp + (average / 255) * maxAmp * 1.8;

            const isLightTheme = document.body.classList.contains('light-theme');
            const waves = [
              {
                color: isLightTheme ? 'rgba(0, 122, 255, 0.65)' : 'rgba(10, 132, 255, 0.75)',
                freq: 3.5,
                phaseShift: 0,
                ampMult: 1.0
              },
              {
                color: isLightTheme ? 'rgba(175, 82, 222, 0.55)' : 'rgba(191, 90, 242, 0.65)',
                freq: 4.8,
                phaseShift: Math.PI / 2,
                ampMult: 0.7
              },
              {
                color: isLightTheme ? 'rgba(52, 199, 89, 0.45)' : 'rgba(48, 209, 88, 0.55)',
                freq: 2.2,
                phaseShift: -Math.PI / 3,
                ampMult: 0.4
              }
            ];

            waves.forEach(wave => {
              ctx.strokeStyle = wave.color;
              ctx.lineWidth = isLightTheme ? 2 : 2.5;
              ctx.beginPath();
              
              const step = 2;
              for (let x = 0; x <= canvas.width; x += step) {
                const t = x / canvas.width;
                const taper = Math.sin(t * Math.PI);
                const y = canvas.height / 2 + 
                          Math.sin(t * Math.PI * wave.freq + phase + wave.phaseShift) * 
                          volumeAmp * wave.ampMult * taper;
                
                if (x === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              ctx.stroke();
            });

            phase += 0.05 + (average / 255) * 0.15;
            animationId = requestAnimationFrame(drawReal);
          };
          drawReal();
          window.audioStream = stream;
        })
        .catch(err => {
          console.warn("Mic context blocked or denied, drawing mock wave.", err);
          drawMockWave();
        });

      recSecondsLeft = recordTimeLimit;
      timerVal.textContent = `Recording: ${recSecondsLeft}s`;
      timerVal.style.color = 'var(--error)';

      recTimer = setInterval(() => {
        recSecondsLeft--;
        timerVal.textContent = `Recording: ${recSecondsLeft}s`;
        if (recSecondsLeft <= 0) {
          stopRecordingFlow();
        }
      }, 1000);

      primaryBtn.onclick = () => {
        stopRecordingFlow();
      };
    };

    const stopRecordingFlow = () => {
      clearInterval(recTimer);
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

      recording = false;
      primaryBtn.classList.add('hidden');
      submitBtn.classList.remove('hidden');
      statusTxt.textContent = "Status: Recording complete. Submit for evaluation.";
      statusDot.className = "rec-status-dot";
      statusDot.style.backgroundColor = 'var(--success)';
      timerVal.textContent = "Complete";
      timerVal.style.color = "var(--success)";
    };

    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = "AI Speech Diagnostics in Progress...";
      
      try {
        let result;
        if (type === 'short-question') {
          result = await Database.gradeShortAnswerAsync(activeQuestion.id, window.recordedAudioBlob, window.offlineSpeechTranscript);
        } else {
          result = await Database.gradeSpeakingReadAloudAsync(activeQuestion.id, window.recordedAudioBlob, window.offlineSpeechTranscript);
        }

        delete window.offlineSpeechTranscript;
        localStorage.setItem('latest_grading_result', JSON.stringify(result));
        localStorage.setItem('latest_practice_question_id', activeQuestion.id);
        localStorage.setItem('latest_practice_question_title', activeQuestion.title);
        localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
        // Map back to scoring subcategory layout
        Router.navigate(`scoring?type=practice&task=speaking&score=${result.score}`);
      } catch (err) {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit response for evaluation";
      }
    });
  };

  // 2. Describe Image Interactive SVG Diagram
  const renderDescribeImageDiagram = (diagramBox) => {
    const isGeothermal = activeQuestion.id === 'SP-103' || activeQuestion.title.toLowerCase().includes('geothermal');

    if (isGeothermal) {
      diagramBox.innerHTML = `
        <div class="describe-image-container" style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; width:100%;">
          <h4 style="margin-bottom:12px; font-weight:600; font-size:15px; color:var(--text-primary);">Interactive Geothermal Heat Pump Diagram</h4>
          
          <!-- Mode Switcher -->
          <div style="display:flex; gap:10px; margin-bottom:16px;">
            <button id="btn-di-winter" class="btn btn-outline btn-sm active" style="font-size:11.5px; border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.05);">Winter Mode (Heating)</button>
            <button id="btn-di-summer" class="btn btn-outline btn-sm" style="font-size:11.5px; border-color: #3b82f6; color: #3b82f6; background:transparent;">Summer Mode (Cooling)</button>
          </div>

          <!-- SVG Diagram -->
          <svg id="geothermal-svg" width="100%" height="240" viewBox="0 0 500 240" style="max-width: 480px; border-radius: var(--radius-sm); background: #0b0f19;">
            <!-- Earth ground layers -->
            <rect x="0" y="100" width="500" height="140" fill="url(#earth-grad)"/>
            <line x1="0" y1="100" x2="500" y2="100" stroke="#4ade80" stroke-width="3"/> <!-- Grass line -->
            
            <!-- Constant ground temperature text label -->
            <text x="250" y="210" fill="#9ca3af" font-size="12" text-anchor="middle" font-weight="600">Subterranean Ground Loop - Constant 55°F</text>
            
            <!-- Suburban House -->
            <g transform="translate(180, 20)">
              <!-- Roof -->
              <polygon points="70,0 0,50 140,50" fill="#e11d48"/>
              <!-- Base structure -->
              <rect x="15" y="50" width="110" height="60" fill="#f1f5f9" rx="2"/>
              <!-- Door -->
              <rect x="55" y="75" width="30" height="35" fill="#78350f"/>
              <!-- Window -->
              <rect x="25" y="65" width="20" height="20" fill="#60a5fa" rx="1"/>
              <rect x="95" y="65" width="20" height="20" fill="#60a5fa" rx="1"/>
              <!-- Label -->
              <text x="70" y="100" fill="#1e293b" font-size="11" font-weight="700" text-anchor="middle">Suburban Home</text>
            </g>

            <!-- Heat Pump Box inside the House -->
            <rect x="200" y="90" width="100" height="35" fill="#475569" rx="4" stroke="#ffffff" stroke-width="1.5"/>
            <text x="250" y="112" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">HEAT PUMP UNIT</text>

            <!-- Subterranean Pipes Loop -->
            <path id="loop-pipe" d="M 220,125 Q 220,180 250,180 T 280,125" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round" style="transition: stroke 0.3s ease;"/>
            <path id="loop-pipe-inner" d="M 220,125 Q 220,180 250,180 T 280,125" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>

            <!-- Arrows indicating heat flow -->
            <g id="winter-arrows" class="heat-arrows">
              <path d="M 215,165 L 215,135" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-red)"/>
              <path d="M 235,175 Q 220,175 220,150" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-red)"/>
              <text x="90" y="150" fill="#f87171" font-size="11" font-weight="600">Heat Extraction (Winter)</text>
            </g>

            <g id="summer-arrows" class="heat-arrows" style="display:none;">
              <path d="M 285,135 L 285,165" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow-blue)"/>
              <path d="M 265,175 Q 280,175 280,150" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow-blue)"/>
              <text x="410" y="150" fill="#60a5fa" font-size="11" font-weight="600" text-anchor="end">Heat Dissipation (Summer)</text>
            </g>

            <!-- Marker definitions for arrows -->
            <defs>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
              </marker>
              <linearGradient id="earth-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#451a03"/>
                <stop offset="100%" stop-color="#1c1917"/>
              </linearGradient>
            </defs>
          </svg>
          <div style="font-size:12.5px; color:var(--text-muted); margin-top:10px; text-align:center;">
            <i>${activeQuestion.text || ''}</i>
          </div>
        </div>
      `;

      const btnWinter = document.getElementById('btn-di-winter');
      const btnSummer = document.getElementById('btn-di-summer');
      const winterArrows = document.getElementById('winter-arrows');
      const summerArrows = document.getElementById('summer-arrows');
      const loopPipe = document.getElementById('loop-pipe');

      btnWinter.addEventListener('click', () => {
        btnWinter.classList.add('active');
        btnWinter.style.background = 'rgba(239, 68, 68, 0.05)';
        btnSummer.classList.remove('active');
        btnSummer.style.background = 'transparent';
        winterArrows.style.display = 'block';
        summerArrows.style.display = 'none';
        loopPipe.setAttribute('stroke', '#ef4444');
      });

      btnSummer.addEventListener('click', () => {
        btnSummer.classList.add('active');
        btnSummer.style.background = 'rgba(59, 130, 246, 0.05)';
        btnWinter.classList.remove('active');
        btnWinter.style.background = 'transparent';
        winterArrows.style.display = 'none';
        summerArrows.style.display = 'block';
        loopPipe.setAttribute('stroke', '#3b82f6');
      });
    } else {
      // Render dynamic premium bar chart for generated describe-image question
      const title = activeQuestion.title.replace('Describe Image: ', '');
      diagramBox.innerHTML = `
        <div class="describe-image-container" style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; width:100%;">
          <h4 style="margin-bottom:16px; font-weight:600; font-size:15px; color:var(--text-primary);">${title}</h4>
          
          <svg width="100%" height="240" viewBox="0 0 500 240" style="max-width: 480px; border-radius: var(--radius-sm); background: #0b0f19; padding: 10px;">
            <!-- Grid lines -->
            <line x1="50" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="50" y1="130" x2="450" y2="130" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="50" y1="180" x2="450" y2="180" stroke="var(--border-color)" stroke-width="2"/>
            
            <!-- Bars representing dynamic levels -->
            <rect x="80" y="60" width="50" height="120" rx="3" fill="url(#blue-grad)"/>
            <text x="105" y="195" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Fossil Fuels</text>
            <text x="105" y="50" fill="#60a5fa" font-size="11" font-weight="700" text-anchor="middle">75%</text>
            
            <rect x="180" y="132" width="50" height="48" rx="3" fill="url(#purple-grad)"/>
            <text x="205" y="195" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Hydroelectric</text>
            <text x="205" y="122" fill="#a855f7" font-size="11" font-weight="700" text-anchor="middle">15%</text>
            
            <rect x="280" y="160" width="50" height="20" rx="3" fill="url(#pink-grad)"/>
            <text x="305" y="195" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Solar Energy</text>
            <text x="305" y="150" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">6%</text>
            
            <rect x="380" y="168" width="50" height="12" rx="3" fill="url(#green-grad)"/>
            <text x="405" y="195" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Wind Energy</text>
            <text x="405" y="158" fill="#2ecc71" font-size="11" font-weight="700" text-anchor="middle">4%</text>
            
            <!-- Gradients -->
            <defs>
              <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#1d4ed8"/>
              </linearGradient>
              <linearGradient id="purple-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6b21a8"/>
              </linearGradient>
              <linearGradient id="pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/>
              </linearGradient>
              <linearGradient id="green-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2ecc71"/><stop offset="100%" stop-color="#27ae60"/>
              </linearGradient>
            </defs>
          </svg>
          <div style="font-size:12.5px; color:var(--text-muted); margin-top:10px; text-align:center;">
            <i>${activeQuestion.text || ''}</i>
          </div>
        </div>
      `;
    }
  };

  // 4. Writing (Write Essay / Summarize Written Text)
  const renderWritingWorkspace = (subbox) => {
    const isEssay = activeQuestion.taskType === 'write-essay';
    const goalText = isEssay ? "Goal: 200 - 300 words" : "Goal: 5 - 75 words (exactly ONE sentence)";
    
    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;"><p><b>Task Prompt:</b> ${activeQuestion.prompt || activeQuestion.text}</p></div>
      <div class="essay-editor-wrapper" style="margin-bottom:20px;">
        <div class="editor-toolbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="circular-progress-container">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle class="circular-progress-bg" cx="24" cy="24" r="18"></circle>
                <circle class="circular-progress-bar" id="prac-progress-bar" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097"></circle>
              </svg>
              <span class="circular-progress-text" id="prac-wcount">0</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Words</span>
              <span style="font-size:11px; color:var(--text-muted);">${goalText}</span>
            </div>
          </div>
        </div>
        <textarea id="prac-textarea" class="notes-paper-textarea" placeholder="Start drafting your writing content here..."></textarea>
      </div>
      <button id="prac-write-submit-btn" class="btn btn-primary shadow-neon">Submit response for AI Grading</button>
    `;

    const txt = document.getElementById('prac-textarea');
    const badge = document.getElementById('prac-wcount');
    const submit = document.getElementById('prac-write-submit-btn');
    const progressBar = document.getElementById('prac-progress-bar');

    txt.addEventListener('input', () => {
      const words = txt.value.trim();
      const count = words === "" ? 0 : words.split(/\s+/).length;
      badge.textContent = count;
      
      const maxWords = isEssay ? 300 : 75;
      const percentage = Math.min(count / maxWords, 1);
      const offset = 113.097 - (percentage * 113.097);
      if (progressBar) {
        progressBar.style.strokeDashoffset = offset;
        
        const isValid = isEssay ? (count >= 200 && count <= 300) : (count >= 5 && count <= 75);
        if (isValid) {
          progressBar.style.stroke = "var(--success)";
        } else if (count > maxWords) {
          progressBar.style.stroke = "var(--error)";
        } else {
          progressBar.style.stroke = "var(--accent)";
        }
      }
    });

    submit.addEventListener('click', async () => {
      if (!txt.value.trim()) {
        showToast("Please write a response.", 'warning');
        return;
      }
      submit.disabled = true;
      submit.textContent = "AI Evaluation in Progress...";
      try {
        const result = await Database.gradeWritingEssayAsync(activeQuestion.id, txt.value);
        localStorage.setItem('latest_grading_result', JSON.stringify(result));
        localStorage.setItem('latest_practice_question_id', activeQuestion.id);
        localStorage.setItem('latest_practice_question_title', activeQuestion.title);
        localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
        Router.navigate(`scoring?type=practice&task=writing&score=${result.score}`);
      } catch (err) {
        console.error(err);
        submit.disabled = false;
        submit.textContent = "Submit response for AI Grading";
      }
    });
  };

  // 5. Reading (Fill in the Blanks - Dropdown or Drag & Drop)
  const renderReadingWorkspace = (subbox) => {
    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;"><p>Drag correct word values into matching spaces.</p></div>
      <div class="sim-prompt-box drag-text-box" style="margin-bottom:20px;">
        <p id="prac-reading-paragraph">${activeQuestion.paragraphHTML}</p>
      </div>
      <div id="prac-reading-pool" class="draggable-words-pool" style="margin-bottom:20px;">
        ${activeQuestion.wordsPool.map((word, idx) => `<span id="prac-word-${idx}" class="word-pill" draggable="true" data-word="${word}">${word}</span>`).join('')}
      </div>
      <button id="prac-reading-submit-btn" class="btn btn-primary shadow-neon">Verify blanks</button>
    `;

    const wordPills = subbox.querySelectorAll('.word-pill');
    const blanks = subbox.querySelectorAll('.blank-box');
    const localAnswers = {};

    wordPills.forEach(pill => {
      pill.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', pill.getAttribute('data-word'));
        e.dataTransfer.setData('element/id', pill.id);
      });
    });

    blanks.forEach(box => {
      box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('drag-over'); });
      box.addEventListener('dragleave', () => { box.classList.remove('drag-over'); });
      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('drag-over');
        const word = e.dataTransfer.getData('text/plain');
        const id = e.dataTransfer.getData('element/id');
        const el = document.getElementById(id);
        const idx = box.getAttribute('data-index');

        if (box.hasChildNodes()) {
          const prev = box.querySelector('.word-pill');
          document.getElementById('prac-reading-pool').appendChild(prev);
        }

        if (el) {
          box.innerHTML = '';
          box.appendChild(el);
          localAnswers[idx] = word;
        }
      });
    });

    document.getElementById('prac-reading-paragraph').addEventListener('click', (e) => {
      if (e.target.classList.contains('word-pill')) {
        const box = e.target.parentNode;
        const idx = box.getAttribute('data-index');
        document.getElementById('prac-reading-pool').appendChild(e.target);
        box.textContent = '';
        delete localAnswers[idx];
      }
    });

    document.getElementById('prac-reading-submit-btn').addEventListener('click', () => {
      const result = Database.gradeReadingFIB(activeQuestion.id, localAnswers);
      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=reading&score=${result.score}`);
    });
  };

  // 6. Re-order Paragraphs
  const renderReorderParagraphsWorkspace = (subbox) => {
    const shuffled = activeQuestion.paragraphs.map((p, index) => ({ text: p, index }));
    shuffled.sort(() => Math.random() - 0.5);

    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p>Drag the paragraphs below to arrange them into a correct chronological order.</p>
      </div>

      <div class="sortable-list-container" id="reorder-paragraphs-deck">
        ${shuffled.map(p => `
          <div class="sortable-item" draggable="true" data-index="${p.index}">
            <span class="sort-handle">☰</span>
            <div class="sort-text">${p.text}</div>
          </div>
        `).join('')}
      </div>

      <button id="reorder-paragraphs-submit-btn" class="btn btn-primary shadow-neon" style="margin-top:20px;">Verify Order</button>
    `;

    const deck = document.getElementById('reorder-paragraphs-deck');
    const items = deck.querySelectorAll('.sortable-item');

    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    deck.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(deck, e.clientY);
      const dragging = document.querySelector('.dragging');
      if (afterElement == null) {
        deck.appendChild(dragging);
      } else {
        deck.insertBefore(dragging, afterElement);
      }
    });

    const getDragAfterElement = (container, y) => {
      const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    document.getElementById('reorder-paragraphs-submit-btn').addEventListener('click', () => {
      const userOrder = [...deck.querySelectorAll('.sortable-item')].map(el => parseInt(el.getAttribute('data-index')));
      const result = Database.gradeReorderParagraphs(activeQuestion.id, userOrder);
      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=reading&score=${result.score}`);
    });
  };

  // 7. Listening (Summarize Spoken Text)
  const renderListeningWorkspace = (subbox) => {
    const textToSpeak = activeQuestion.lectureText;
    const duration = getAudioDuration(textToSpeak);

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p>Play the audio track and write a summary (50-70 words).</p>
      </div>
      
      <div class="lecture-player-container" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;">${activeQuestion.title}</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;">Lecture Audio</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-play-btn" class="btn-play-trigger" title="Play Lecture">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div id="prac-timeline" class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-time-lbl" class="player-time-lbl">0:00 / 0:00</span>
        </div>
        ${getWaveformHTML()}
      </div>

      <div class="essay-editor-wrapper" style="margin-bottom:20px;">
        <div class="editor-toolbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="circular-progress-container">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle class="circular-progress-bg" cx="24" cy="24" r="18"></circle>
                <circle class="circular-progress-bar" id="prac-list-progress-bar" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097"></circle>
              </svg>
              <span class="circular-progress-text" id="prac-list-wcount">0</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Words</span>
              <span style="font-size:11px; color:var(--text-muted);">Goal: 50 - 70 words</span>
            </div>
          </div>
        </div>
        <textarea id="prac-list-textarea" class="notes-paper-textarea" placeholder="Summarize key details..."></textarea>
      </div>

      <button id="prac-list-submit-btn" class="btn btn-primary shadow-neon">Grade Summary</button>
    `;

    setupPremiumAudioPlayer('prac-play-btn', 'prac-timeline-fill', 'prac-time-lbl', textToSpeak, duration);

    const text = document.getElementById('prac-list-textarea');
    const wcount = document.getElementById('prac-list-wcount');
    const submit = document.getElementById('prac-list-submit-btn');
    const listProgressBar = document.getElementById('prac-list-progress-bar');

    text.addEventListener('input', () => {
      const count = text.value.trim() === "" ? 0 : text.value.trim().split(/\s+/).length;
      wcount.textContent = count;
      
      const maxWords = 70;
      const percentage = Math.min(count / maxWords, 1);
      const offset = 113.097 - (percentage * 113.097);
      if (listProgressBar) {
        listProgressBar.style.strokeDashoffset = offset;
        
        const isValid = (count >= 50 && count <= 70);
        if (isValid) {
          listProgressBar.style.stroke = "var(--success)";
        } else if (count > maxWords) {
          listProgressBar.style.stroke = "var(--error)";
        } else {
          listProgressBar.style.stroke = "var(--accent)";
        }
      }
    });

    submit.addEventListener('click', async () => {
      if (window.lecturePlayer) window.lecturePlayer.pause();
      submit.disabled = true;
      submit.textContent = "AI Evaluation...";
      try {
        const result = await Database.gradeListeningSSTAsync(activeQuestion.id, text.value);
        localStorage.setItem('latest_grading_result', JSON.stringify(result));
        localStorage.setItem('latest_practice_question_id', activeQuestion.id);
        localStorage.setItem('latest_practice_question_title', activeQuestion.title);
        localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
        Router.navigate(`scoring?type=practice&task=listening&score=${result.score}`);
      } catch (err) {
        console.error(err);
        submit.disabled = false;
        submit.textContent = "Grade Summary";
      }
    });
  };

  // 8. Write from Dictation
  const renderWriteFromDictationWorkspace = (subbox) => {
    const textToSpeak = activeQuestion.text;
    const duration = getAudioDuration(textToSpeak);

    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p>Listen carefully to the spoken sentence, then type it in the text box below with correct spelling and punctuation.</p>
      </div>

      <div class="lecture-player-container" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;">Write from Dictation</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;">Listen to the spoken sentence</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-play-btn" class="btn-play-trigger" title="Play Dictation">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div id="prac-timeline" class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-time-lbl" class="player-time-lbl">0:00 / 0:00</span>
        </div>
        ${getWaveformHTML()}
      </div>

      <div class="essay-editor-wrapper" style="margin-bottom:20px;">
        <textarea id="prac-dictation-input" class="notes-paper-textarea" placeholder="Type the sentence you heard..." style="height: 100px;"></textarea>
      </div>

      <button id="prac-dictation-submit-btn" class="btn btn-primary shadow-neon">Check spelling and transcription</button>
    `;

    setupPremiumAudioPlayer('prac-play-btn', 'prac-timeline-fill', 'prac-time-lbl', textToSpeak, duration);

    const inputEl = document.getElementById('prac-dictation-input');
    const submitBtn = document.getElementById('prac-dictation-submit-btn');

    submitBtn.addEventListener('click', () => {
      if (window.lecturePlayer) window.lecturePlayer.pause();
      const val = inputEl.value;
      if (!val.trim()) {
        showToast("Please write a response.", 'warning');
        return;
      }
      const result = Database.gradeWriteFromDictation(activeQuestion.id, val);
      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=listening&score=${result.score}`);
    });
  };

  // 9. Highlight Incorrect Words
  const renderHighlightIncorrectWorkspace = (subbox) => {
    const textWords = activeQuestion.text.split(/\s+/);
    const textToSpeak = activeQuestion.spokenText;
    const duration = getAudioDuration(textToSpeak);

    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p>1. Play the audio lecture. <br> 2. Read along and click on any written words that do not match the spoken audio.</p>
      </div>

      <div class="lecture-player-container" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;">Highlight Incorrect Words</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;">Play spoken lecture</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-play-btn" class="btn-play-trigger" title="Play Audio">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div id="prac-timeline" class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-time-lbl" class="player-time-lbl">0:00 / 0:00</span>
        </div>
        ${getWaveformHTML()}
      </div>

      <div class="interactive-text-paragraph" id="incorrect-words-paragraph">
        ${textWords.map((word, idx) => `<span class="clickable-word" data-index="${idx}">${word}</span>`).join(' ')}
      </div>

      <button id="highlight-incorrect-submit-btn" class="btn btn-primary shadow-neon" style="margin-top:20px;">Check Choices</button>
    `;

    setupPremiumAudioPlayer('prac-play-btn', 'prac-timeline-fill', 'prac-time-lbl', textToSpeak, duration);

    const paragraphEl = document.getElementById('incorrect-words-paragraph');

    paragraphEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('clickable-word')) {
        e.target.classList.toggle('selected');
      }
    });

    document.getElementById('highlight-incorrect-submit-btn').addEventListener('click', () => {
      if (window.lecturePlayer) window.lecturePlayer.pause();
      const selectedWords = paragraphEl.querySelectorAll('.clickable-word.selected');
      const selectedIndices = Array.from(selectedWords).map(el => parseInt(el.getAttribute('data-index')));
      const result = Database.gradeHighlightIncorrect(activeQuestion.id, selectedIndices);
      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=listening&score=${result.score}`);
    });
  };

  // 9.5 Listening Fill in the Blanks Workspace
  const renderListeningFIBWorkspace = (subbox) => {
    const textToSpeak = activeQuestion.text;
    const duration = getAudioDuration(textToSpeak);

    const processedGappedText = activeQuestion.gappedText.replace(
      /<span class=['"]gap-input['"] data-index=['"](\d+)['"]><\/span>/g,
      (match, idx) => `<input type="text" class="fib-listening-input" data-index="${idx}" placeholder="${parseInt(idx) + 1}" style="background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-sm); padding: 4px 8px; width: 150px; outline: none; display: inline-block; font-size: 14.5px;">`
    );

    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p>1. Play the audio lecture.<br>2. Fill in the gapped text fields below based on the recording.</p>
      </div>

      <div class="lecture-player-container" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;">Fill in the Blanks</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;">Play spoken lecture</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-play-btn" class="btn-play-trigger" title="Play Audio">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div id="prac-timeline" class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-time-lbl" class="player-time-lbl">0:00 / 0:00</span>
        </div>
        ${getWaveformHTML()}
      </div>

      <div class="sim-prompt-box drag-text-box" style="margin-bottom:20px; line-height: 2;">
        <p id="prac-listening-fib-paragraph">${processedGappedText}</p>
      </div>

      <button id="prac-listening-fib-submit-btn" class="btn btn-primary shadow-neon">Verify blanks</button>
    `;

    setupPremiumAudioPlayer('prac-play-btn', 'prac-timeline-fill', 'prac-time-lbl', textToSpeak, duration);

    document.getElementById('prac-listening-fib-submit-btn').addEventListener('click', () => {
      if (window.lecturePlayer) window.lecturePlayer.pause();
      const inputs = subbox.querySelectorAll('.fib-listening-input');
      const localAnswers = {};
      inputs.forEach(input => {
        const idx = input.getAttribute('data-index');
        localAnswers[idx] = input.value;
      });

      const result = Database.gradeListeningFIB(activeQuestion.id, localAnswers);
      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=listening&score=${result.score}`);
    });
  };

  // 10. Generic Multiple Choice Workspace / Fallback
  const renderGenericMCQWorkspace = (subbox) => {
    const isMulti = activeQuestion.taskType.includes('mcq-multiple') || activeQuestion.taskType.includes('highlight-summary');
    const options = activeQuestion.options || ["Option A", "Option B", "Option C"];
    const hasAudio = !!(activeQuestion.lectureText || activeQuestion.spokenText || activeQuestion.text);
    
    subbox.innerHTML = `
      <div class="sim-instructions" style="margin-bottom:16px;">
        <p><b>Question/Prompt:</b> ${activeQuestion.questionText || activeQuestion.title}</p>
      </div>

      ${hasAudio ? `
      <div class="lecture-player-container" style="margin-bottom:20px;">
        <div class="player-details-row">
          <div class="player-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:600; margin:0;" id="prac-play-title">${activeQuestion.title}</h4>
            <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0 0;" id="prac-play-subtitle">Listen to the audio reference</p>
          </div>
        </div>
        <div class="player-controls-flex" style="margin-top:8px;">
          <button id="prac-play-btn" class="btn-play-trigger" title="Play Prompt">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div id="prac-timeline" class="player-timeline-outer" style="flex-grow:1;">
            <div id="prac-timeline-fill" class="player-timeline-inner" style="position:absolute; top:0; left:0; height:100%; width:0%; transition: width 0.1s linear;"></div>
          </div>
          <span id="prac-time-lbl" class="player-time-lbl">0:00 / 0:00</span>
        </div>
        ${getWaveformHTML()}
      </div>
      ` : ''}

      <div style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
        ${options.map((opt, idx) => `
          <label style="display:flex; align-items:center; gap:12px; padding:14px; background:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer;">
            <input type="${isMulti ? 'checkbox' : 'radio'}" name="mcq-option" value="${opt}" style="width:16px; height:16px;">
            <span style="font-size:14px;">${opt}</span>
          </label>
        `).join('')}
      </div>

      <button id="mcq-submit-btn" class="btn btn-primary shadow-neon" style="margin-top:20px;">Submit Answer</button>
    `;

    if (hasAudio) {
      const isMissingWord = activeQuestion.taskType === 'missing-word';
      let textToSpeak = activeQuestion.lectureText || activeQuestion.spokenText || activeQuestion.text;
      
      if (isMissingWord && activeQuestion.beepWord) {
        const idx = textToSpeak.toLowerCase().lastIndexOf(activeQuestion.beepWord.toLowerCase());
        if (idx !== -1) {
          textToSpeak = textToSpeak.substring(0, idx);
        }
      }

      const duration = getAudioDuration(textToSpeak);
      setupPremiumAudioPlayer('prac-play-btn', 'prac-timeline-fill', 'prac-time-lbl', textToSpeak, duration, () => {
        if (isMissingWord) {
          playBeep();
        }
      });
    }

    document.getElementById('mcq-submit-btn').addEventListener('click', () => {
      if (window.lecturePlayer) window.lecturePlayer.pause();
      const checkedInputs = [...subbox.querySelectorAll('input:checked')].map(input => input.value);
      if (checkedInputs.length === 0) {
        showToast("Please select at least one choice.", 'warning');
        return;
      }
      
      const answers = activeQuestion.correctAnswers || [];
      let isCorrect = false;
      if (isMulti) {
        isCorrect = answers.every(ans => checkedInputs.includes(ans)) && checkedInputs.every(input => answers.includes(input));
      } else {
        isCorrect = checkedInputs.length === 1 && checkedInputs[0] === answers[0];
      }
      const score = isCorrect ? 90 : 20;

      const result = {
        score,
        isCorrect,
        correctAnswers: answers,
        modelAnswer: answers.join(', ')
      };

      Database.recordScore(activeQuestion.skill, score);
      Database.markTaskCompleted(activeQuestion.id);

      localStorage.setItem('latest_grading_result', JSON.stringify(result));
      localStorage.setItem('latest_practice_question_id', activeQuestion.id);
      localStorage.setItem('latest_practice_question_title', activeQuestion.title);
      localStorage.setItem('latest_practice_question_object', JSON.stringify(activeQuestion));
      Router.navigate(`scoring?type=practice&task=${activeQuestion.skill}&score=${result.score}`);
    });
  };

  // Event listener setup
  const handleQuestionsUpdated = () => {
    rebuildAllQuestions();
    renderView();
  };
  document.addEventListener('questions-updated', handleQuestionsUpdated);
  
  // Clean up
  window.addEventListener('hashchange', () => {
    document.removeEventListener('questions-updated', handleQuestionsUpdated);
    cleanupWorkspaceAssets();
  }, { once: true });

  renderView();
}
