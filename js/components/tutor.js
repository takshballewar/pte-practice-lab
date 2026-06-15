/* FluentAI Context-Aware Floating AI Tutor Chatbot Component */

import { Database } from '../db.js?v=12';
import { Router } from '../router.js?v=12';

export const Tutor = {
  initialized: false,
  isOpen: false,

  init() {
    if (this.initialized) return;
    
    // Bind global HTML elements
    const bubble = document.getElementById('tutor-toggle');
    const panel = document.getElementById('tutor-panel');
    const closeBtn = document.getElementById('tutor-close');
    const form = document.getElementById('tutor-chat-form');
    const input = document.getElementById('tutor-message-input');

    if (!bubble || !panel || !closeBtn || !form || !input) return;

    // Toggle opening
    bubble.addEventListener('click', () => this.togglePanel());
    closeBtn.addEventListener('click', () => this.togglePanel());

    // Submit text form
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text === '') return;

      this.addUserMessage(text);
      input.value = '';
      
      // Simulate AI response
      this.generateAIResponse(text);
    });

    // Watch navigation hashchange to swap suggested prompts dynamically
    window.addEventListener('hashchange', () => this.updateSuggestedPrompts());

    // Load history
    this.loadChatHistory();
    this.updateSuggestedPrompts();
    
    this.initialized = true;
    
    // Auto show user notifications on onboarding
    const progress = Database.getProgress();
    if (progress.tutorHistory.length <= 1) {
      setTimeout(() => {
        const widget = document.getElementById('tutor-widget');
        if (widget) widget.classList.remove('hidden');
      }, 1500);
    }
  },

  togglePanel() {
    const panel = document.getElementById('tutor-panel');
    if (!panel) return;
    
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      panel.classList.remove('hidden');
      this.scrollToBottom();
      // Clear status badges
      const statusBadge = document.querySelector('.tutor-status-badge');
      if (statusBadge) statusBadge.style.boxShadow = 'none';
    } else {
      panel.classList.add('hidden');
    }
  },

  loadChatHistory() {
    const progress = Database.getProgress();
    const chatContainer = document.getElementById('tutor-messages');
    if (!chatContainer) return;

    chatContainer.innerHTML = '';
    progress.tutorHistory.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `tutor-bubble-msg ${msg.sender}`;
      bubble.innerHTML = msg.text;
      chatContainer.appendChild(bubble);
    });
    this.scrollToBottom();
  },

  addUserMessage(text) {
    const chatContainer = document.getElementById('tutor-messages');
    if (!chatContainer) return;

    const bubble = document.createElement('div');
    bubble.className = 'tutor-bubble-msg user';
    bubble.textContent = text;
    chatContainer.appendChild(bubble);
    
    this.scrollToBottom();

    // Persist to DB
    const progress = Database.getProgress();
    progress.tutorHistory.push({
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    Database.updateProgress(progress);
  },

  addTutorMessage(htmlText) {
    const chatContainer = document.getElementById('tutor-messages');
    if (!chatContainer) return;

    const bubble = document.createElement('div');
    bubble.className = 'tutor-bubble-msg tutor';
    bubble.innerHTML = htmlText;
    chatContainer.appendChild(bubble);
    
    this.scrollToBottom();

    // Persist to DB
    const progress = Database.getProgress();
    progress.tutorHistory.push({
      sender: "tutor",
      text: htmlText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    Database.updateProgress(progress);
  },

  showTypingIndicator() {
    const chatContainer = document.getElementById('tutor-messages');
    if (!chatContainer) return null;

    const indicator = document.createElement('div');
    indicator.className = 'tutor-bubble-msg tutor typing-indicator-bubble';
    indicator.id = 'tutor-typing-indicator';
    indicator.innerHTML = `
      <span style="display:inline-flex; gap:3px;">
        <span class="typing-dot" style="width:6px; height:6px; background-color:var(--text-muted); border-radius:50%; animation:typingBreathe 1s infinite alternate;"></span>
        <span class="typing-dot" style="width:6px; height:6px; background-color:var(--text-muted); border-radius:50%; animation:typingBreathe 1s infinite alternate 0.2s;"></span>
        <span class="typing-dot" style="width:6px; height:6px; background-color:var(--text-muted); border-radius:50%; animation:typingBreathe 1s infinite alternate 0.4s;"></span>
      </span>
      <style>
        @keyframes typingBreathe { 0% { opacity: 0.3; transform:translateY(0); } 100% { opacity: 1; transform:translateY(-2px); } }
      </style>
    `;
    chatContainer.appendChild(indicator);
    this.scrollToBottom();
    return indicator;
  },

  removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  },

  scrollToBottom() {
    const chatContainer = document.getElementById('tutor-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  },

  updateSuggestedPrompts() {
    const promptsBox = document.getElementById('tutor-quick-prompts');
    if (!promptsBox) return;

    const hash = window.location.hash.substring(1) || 'landing';
    
    let suggested = [];
    if (hash === 'dashboard') {
      suggested = [
        "Suggest an improvement plan",
        "How is the PTE overall score calculated?"
      ];
    } else if (hash === 'practice') {
      suggested = [
        "Give essay writing templates",
        "Describe Image templates"
      ];
    } else if (hash === 'mocktest') {
      suggested = [
        "PTE Mock Test timing rules",
        "What are essay length limits?"
      ];
    } else if (hash === 'scoring') {
      suggested = [
        "Explain writing diagnostics",
        "How to score 90 in speaking?"
      ];
    } else {
      suggested = [
        "Tell me about PTE academic rules",
        "How does AI grading work?"
      ];
    }

    promptsBox.innerHTML = '';
    suggested.forEach(prompt => {
      const btn = document.createElement('button');
      btn.className = 'tutor-prompt-btn';
      btn.textContent = prompt;
      btn.addEventListener('click', () => {
        this.addUserMessage(prompt);
        this.generateAIResponse(prompt);
      });
      promptsBox.appendChild(btn);
    });
  },

  generateAIResponse(query) {
    const indicator = this.showTypingIndicator();
    
    setTimeout(() => {
      this.removeTypingIndicator(indicator);
      
      const q = query.toLowerCase();
      let reply = "";

      if (q.includes("improvement") || q.includes("plan")) {
        reply = `Based on your recent scores, your lowest indicator is <b>Writing (average 74)</b>, mainly due to restricted lexical range. I suggest:
          <br><br>
          1. Practice <b>Write Essay (WR-201)</b>.
          <br>
          2. Use synonyms like <i>'imperative'</i> instead of <i>'important'</i>.
          <br>
          3. Complete 5 drag-drop reading blanks weekly to master collocations.`;
      } else if (q.includes("calculate") || q.includes("overall")) {
        reply = `PTE Academic overall scores are an average of the four enabling/communicative skills (Speaking, Writing, Reading, Listening) mapped on a scale of <b>10 to 90</b>. Enabling skills like spelling, pronunciation, and oral fluency directly feed into these four communicative metrics.`;
      } else if (q.includes("essay") || q.includes("template")) {
        reply = `Here is a standard high-scoring template for argumentative essay writing (200-300 words):
          <br><br>
          <b>Intro:</b> <i>"The debate surrounding [Topic] has garnered significant attention... While critics argue [A], I believe the advantages outweigh..."</i>
          <br>
          <b>Body 1:</b> <i>"To begin with, [Point 1]... For instance, [Example]..."</i>
          <br>
          <b>Body 2:</b> <i>"Furthermore, [Point 2]... Consequently, [Effect]..."</i>
          <br>
          <b>Conclusion:</b> <i>"In conclusion, though [Counterpoint], it stands as a cornerstone... Ultimately, benefits transcend..."</i>`;
      } else if (q.includes("image") || q.includes("describe")) {
        reply = `For Describe Image tasks, follow the <b>4-step flow</b> to maintain oral fluency:
          <br><br>
          1. <b>Introduction:</b> State the title and axis (<i>"This diagram showcases..."</i>) - 8 seconds.
          <br>
          2. <b>Key Detail 1:</b> Identify the highest value (<i>"The maximum percentage is recorded in..."</i>) - 10 seconds.
          <br>
          3. <b>Key Detail 2:</b> Identify lowest / secondary value (<i>"In contrast, the minimum volume is seen in..."</i>) - 10 seconds.
          <br>
          4. <b>Conclusion:</b> Synthesize (<i>"In conclusion, the data demonstrates that..."</i>) - 7 seconds.`;
      } else if (q.includes("timing") || q.includes("limit") || q.includes("mock")) {
        reply = `In the PTE Exam, individual tasks have specific timers:
          <br><br>
          - <b>Read Aloud:</b> 40s preparation, 40s speaking.
          - <b>Write Essay:</b> 20 minutes (strict).
          - <b>FIB Reading:</b> Approx 2 mins per paragraph.
          - <b>Summarize Spoken Text:</b> 10 minutes (strict, 50-70 words).
          <br><br>
          Our Mock Test simulation mirrors these exact timing protocols.`;
      } else if (q.includes("spelling") || q.includes("write")) {
        reply = `PTE accepts US, British, Canadian, and Australian spellings, but you must <b>be consistent</b>. If you write <i>"subsidize"</i> (US), write <i>"initialize"</i>. Mixing <i>"colour"</i> (UK) and <i>"subsidize"</i> (US) will result in spelling point deductions.`;
      } else if (q.includes("speaking") || q.includes("90")) {
        reply = `To score 90 in Speaking:
          <br><br>
          1. <b>Oral Fluency is King:</b> Maintain a steady pace. Never repeat words, stutter, or self-correct, even if you make a mispronunciation.
          2. <b>Articulation:</b> Keep your voice clear and avoid swallowing syllable endings.
          3. <b>Avoid Pauses:</b> Avoid pausing for more than 2 seconds, or the microphone will shut off.`;
      } else {
        reply = `I'm on it! Feel free to ask about spelling collocations, essay templates, oral fluency timing rules, or radar chart metrics. You can also try: <i>"Give essay writing templates"</i> or <i>"How to score 90 in speaking?"</i>.`;
      }

      this.addTutorMessage(reply);
      
      // Make tutor widget flash with a subtle glow in background to draw attention
      const bubble = document.getElementById('tutor-toggle');
      if (bubble && !this.isOpen) {
        bubble.classList.add('pulse-glow');
        const statusBadge = document.querySelector('.tutor-status-badge');
        if (statusBadge) statusBadge.style.boxShadow = '0 0 10px var(--success)';
      }
    }, 1200); // realistic typing wait
  }
};
