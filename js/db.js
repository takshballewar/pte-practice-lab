/* FluentAI PTE Database and Grading Engine (Client-Side Storage) */

// Core database structure with pre-seeded PTE practice resources
const DEFAULT_QUESTIONS = {
  speaking: [
    {
      id: "SP-101",
      title: "Read Aloud: Coastal Ecosystems",
      difficulty: "medium",
      prepTime: 40,
      readTime: 40,
      text: "Coastal development has accelerated significantly over the past three decades. The resulting growth in tourism and infrastructure has provided economic opportunities, but it has also placed unprecedented stress on fragile marine ecosystems, threatening biodiversity and altering local shorelines.",
      modelAnswer: "Coastal development has accelerated significantly over the past three decades. The resulting growth in tourism and infrastructure has provided economic opportunities, but it has also placed unprecedented stress on fragile marine ecosystems, threatening biodiversity and altering local shorelines.",
      tips: [
        "Pay special attention to punctuation: pause slightly at the comma and stop fully at the period.",
        "Ensure clear articulation of clusters like 'infrastructure', 'ecosystems', and 'shorelines'.",
        "Maintain a steady, continuous rhythm; don't rush through the text."
      ],
      taskType: "read-aloud"
    },
    {
      id: "SP-102",
      title: "Read Aloud: Macroeconomic Policy",
      difficulty: "easy",
      prepTime: 40,
      readTime: 40,
      text: "Macroeconomic policies are designed to stabilize national economies by regulating inflation and interest rates. By adjusting monetary reserves, central banks can manage consumer spending, encourage long-term business investments, and mitigate structural unemployment during economic contractions.",
      modelAnswer: "Macroeconomic policies are designed to stabilize national economies by regulating inflation and interest rates. By adjusting monetary reserves, central banks can manage consumer spending, encourage long-term business investments, and mitigate structural unemployment during economic contractions.",
      tips: [
        "Stress key nouns like 'policies', 'economies', and 'inflation'.",
        "Keep a steady flow and avoid long pauses between sentences.",
        "Articulate word endings clearly, especially plurals like 'reserves' and 'investments'."
      ],
      taskType: "read-aloud"
    },
    {
      id: "SP-103",
      title: "Describe Image: Geothermal Heat Pump",
      difficulty: "hard",
      prepTime: 25,
      readTime: 40,
      text: "A schematic diagrams of a closed-loop geothermal heat pump system. It showcases a suburban house connected to underground pipes filled with water and antifreeze. Arrows indicate heat extraction from the earth (at 55°F) in winter, and heat dissipation back into the ground during summer.",
      modelAnswer: "This diagram displays a closed-loop geothermal system that regulates a household's temperature. It consists of subterranean piping loops carrying water and antifreeze. During winter, heat is extracted from the constant 55 degrees Fahrenheit earth and pumped indoors. Conversely, in summer, the process reverses as warm air from the residence is dissipated into the cool ground, proving geothermal energy is an efficient, sustainable thermal solution.",
      tips: [
        "Name the title or main subject of the diagram in your first sentence.",
        "Discuss key variables: winter extraction (heating) vs. summer dissipation (cooling).",
        "State a logical conclusion or summarize the overall purpose at the end."
      ],
      taskType: "describe-image"
    },
    {
      id: "SP-104",
      title: "Repeat Sentence: Global Warming",
      difficulty: "easy",
      prepTime: 3,
      readTime: 15,
      text: "The increase in greenhouse gases is warming the planet at an alarming rate.",
      modelAnswer: "The increase in greenhouse gases is warming the planet at an alarming rate.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      tips: ["Listen carefully to the rhythm and intonation.", "Do not try to write the words down; rely on your short-term auditory memory."],
      taskType: "repeat-sentence"
    },
    {
      id: "SP-105",
      title: "Re-Tell Lecture: Printing Press",
      difficulty: "medium",
      prepTime: 10,
      readTime: 40,
      text: "The printing press revolutionized communication in Europe by making books affordable, fostering high literacy rates, and seeding the scientific revolution.",
      modelAnswer: "The lecture discussed the profound impact of the printing press on European history. The speaker emphasized that book affordability increased, which consequently led to higher literacy rates. Additionally, this technology seeded the scientific revolution, proving that mass communication serves as a driver of societal evolution.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      tips: ["Take notes of key nouns and verbs during the lecture.", "Use standard templates to structure your summary fluidly."],
      taskType: "retell-lecture"
    },
    {
      id: "SP-106",
      title: "Answer Short Question: Ocean Salinity",
      difficulty: "easy",
      questionText: "What is the primary substance that makes ocean water salty?",
      correctAnswers: ["salt", "sodium chloride"],
      tips: ["Keep your answer extremely concise, usually just one or two words.", "Answer immediately after the tone ends."],
      taskType: "short-question"
    },
    {
      id: "SP-107",
      title: "Summarize Group Discussion: Hybrid Work",
      difficulty: "medium",
      prepTime: 10,
      readTime: 40,
      text: "A discussion among three business leaders discussing the trade-offs of permanent hybrid work models.",
      modelAnswer: "The managers debated hybrid work schedules, focusing on employee flexibility versus collaboration constraints. While one executive highlighted productivity improvements, another raised concerns about reduced team cohesion. Ultimately, they resolved that a structured three-day in-office policy balances operational needs with worker satisfaction.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      tips: ["Identify the different viewpoints expressed by the speakers.", "Summarize the final consensus of the group."],
      taskType: "group-discussion"
    },
    {
      id: "SP-108",
      title: "Respond to a Situation: Missed Flight",
      difficulty: "hard",
      prepTime: 20,
      readTime: 40,
      text: "You missed your flight to an important conference because of a taxi delay. Call the event organizer and explain your situation.",
      modelAnswer: "Hello, this is Taksh Sharma. I am calling to inform you that due to an unexpected taxi delay, I have unfortunately missed my flight to the conference. I am currently booking the next available flight, which will arrive at four PM. I apologize for this inconvenience and will update you once I board.",
      tips: ["Address all parts of the prompt: state what happened, apologize, and propose a solution.", "Maintain a polite and professional tone throughout."],
      taskType: "respond-situation"
    }
  ],
  writing: [
    {
      id: "WR-201",
      title: "Write Essay: Free Higher Education",
      difficulty: "medium",
      timeLimit: 1200,
      prompt: "In many nations, the government subsidizes university tuition fees, making higher education free for all qualified citizens. Do you believe the advantages of free higher education outweigh the economic burdens it places on national budgets? Provide reasons and examples to support your view.",
      minWords: 200,
      maxWords: 300,
      tips: [
        "Structure your essay clearly: Introduction, two Body Paragraphs, and a logical Conclusion.",
        "Ensure your word count remains strictly between 200 and 300 words to avoid scoring penalties.",
        "Incorporate academic transitional words like 'Consequently', 'Furthermore', 'To begin with'."
      ],
      taskType: "write-essay"
    },
    {
      id: "WR-202",
      title: "Summarize Written Text: Renewable Transition",
      difficulty: "easy",
      timeLimit: 600,
      prompt: "The transition to renewable energy sources represents one of the most critical challenges of the twenty-first century. Fossil fuels have powered industrial progress for over two hundred years, but their combustion has introduced unprecedented volumes of carbon dioxide into the atmosphere, triggering global warming. Solar and wind technologies offer cleaner alternatives, yet integrating them into existing power grids presents technical hurdles. Because wind and sunlight are intermittent, grid operators must construct grid-scale storage batteries or utilize backup power plants to ensure a steady electricity supply. Despite these challenges, falling costs are driving rapid adoption. The price of solar panels has plummeted by eighty percent over the past decade, making green power economically competitive with coal and gas in most regions. Consequently, the transition is accelerating, driven not just by ecological necessity but also by market forces.",
      minWords: 5,
      maxWords: 75,
      tips: [
        "Your summary must be written in exactly ONE single sentence.",
        "Start with a capital letter and end with exactly one period.",
        "Ensure your sentence is between 5 and 75 words in length."
      ],
      taskType: "summarize-written"
    }
  ],
  reading: [
    {
      id: "RD-301",
      title: "Fill in the Blanks (Dropdown): Clean Solutions",
      difficulty: "medium",
      paragraphHTML: "The expansion of clean energy solutions is no longer a futuristic goal; it has become an <span class='blank-box' data-index='0'></span> necessity for modern industrial economies. Governments worldwide are introducing regulatory <span class='blank-box' data-index='1'></span> to reduce reliance on carbon fuels, encouraging private investors to allocate capital toward sustainable ventures. In turn, technological breakthroughs have significantly lowered the cost of wind and solar installations, proving that environmental protection can be <span class='blank-box' data-index='2'></span> viable.",
      correctAnswers: ["immediate", "incentives", "economically"],
      wordsPool: ["economically", "incentives", "immediate", "redundant", "hindrances", "academically"],
      explanations: {
        0: "'immediate necessity' is a strong collocation signifying urgency.",
        1: "'regulatory incentives' refers to laws or policies that encourage positive action.",
        2: "The adverb 'economically' correctly modifies the adjective 'viable'."
      },
      taskType: "fib-dropdown"
    },
    {
      id: "RD-302",
      title: "Fill in the Blanks (Dropdown): Cognitive Play",
      difficulty: "hard",
      paragraphHTML: "Child psychologists have long recognized that play is not merely a leisure activity but a vital component of cognitive development. Through unstructured play, children learn to <span class='blank-box' data-index='0'></span> complex social dynamics and experiment with creative problem-solving. Over-structured environments, conversely, can <span class='blank-box' data-index='1'></span> this natural curiosity, limiting a child's ability to develop self-regulatory skills. Therefore, experts recommend a balanced <span class='blank-box' data-index='2'></span> that blends guided education with open-ended exploration.",
      correctAnswers: ["navigate", "stifle", "approach"],
      wordsPool: ["stifle", "navigate", "approach", "obstruct", "encourage", "barrier"],
      explanations: {
        0: "'navigate social dynamics' is a common metaphorical phrase.",
        1: "The verb 'stifle' fits the context of suppressing or restricting curiosity.",
        2: "The noun 'approach' fits the context of a method or system."
      },
      taskType: "fib-dropdown"
    },
    {
      id: "RD-303",
      title: "Multiple Choice, Multiple Answers: Renewables",
      difficulty: "medium",
      questionText: "Which of the following are mentioned as intermittent renewable energy sources in modern grids?",
      options: ["Solar energy", "Wind power", "Geothermal energy", "Coal combustion"],
      correctAnswers: ["Solar energy", "Wind power"],
      tips: ["Read the options carefully; more than one answer is correct.", "Negative marking may apply, so only select choices you are certain about."],
      taskType: "mcq-multiple-reading"
    },
    {
      id: "RD-304",
      title: "Re-order Paragraphs: Mars Rover",
      difficulty: "medium",
      paragraphs: [
        "Finally, they successfully launched the rover towards Mars, initiating a new era of deep space research.",
        "First, aerospace engineers designed the planetary exploration rover inside vacuum chambers.",
        "Next, they tested the rover's wheels in desert terrains to ensure they could navigate rocky soil."
      ],
      correctOrder: [1, 2, 0],
      tips: ["Look for transition words like 'First', 'Next', and 'Finally' to establish chronology.", "Identify the topic sentence that introduces the main subject."],
      taskType: "reorder-paragraphs"
    },
    {
      id: "RD-305",
      title: "Fill in the Blanks (Drag & Drop): Ancient Egypt",
      difficulty: "easy",
      paragraphHTML: "Ancient Egypt was famous for its majestic <span class='blank-box' data-index='0'></span> built as tombs for pharaohs. The Nile river provided essential <span class='blank-box' data-index='1'></span> for agricultural cultivation.",
      correctAnswers: ["pyramids", "irrigation"],
      wordsPool: ["pyramids", "irrigation", "skyscrapers", "navigation"],
      explanations: {
        0: "Pyramids were built as pharaoh tombs.",
        1: "The Nile river was used for irrigation of crops."
      },
      taskType: "fib-drag-drop"
    },
    {
      id: "RD-306",
      title: "Multiple Choice, Single Answer: Photosynthesis",
      difficulty: "easy",
      questionText: "What is the primary gaseous byproduct of photosynthesis released into the atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctAnswers: ["Oxygen"],
      tips: ["Focus on the primary byproduct mentioned.", "Double check the chemical formula equivalents if listed."],
      taskType: "mcq-single-reading"
    }
  ],
  listening: [
    {
      id: "LS-401",
      title: "Summarize Spoken Text: Agricultural Economics",
      difficulty: "medium",
      timeLimit: 600,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      lectureText: "Welcome back, class. Today we are examining the shifts in agricultural economics, specifically the impact of government subsidies. For decades, Western nations have subsidized key crops like corn, wheat, and soy. The primary objective was simple: stabilize food supplies and ensure agricultural communities remain financially viable. However, this policy has created unintended consequences. First, subsidies distort global markets, making it nearly impossible for farmers in developing nations to compete. Second, it incentivizes agricultural monoculture—growing single crops on a massive scale—which depletes soil nutrients and increases dependency on chemical fertilizers. Economists now argue that agricultural funds should transition away from volume-based subsidies and instead reward ecological practices like crop rotation and organic farming.",
      keywords: ["agricultural", "economics", "subsidies", "food supplies", "monoculture", "developing nations", "fertilizers", "crop rotation", "ecological"],
      minWords: 50,
      maxWords: 70,
      tips: [
        "Write between 50 and 70 words.",
        "Make sure to include core concepts: subsidies, monoculture, and ecological farming."
      ],
      taskType: "summarize-spoken"
    },
    {
      id: "LS-402",
      title: "Multiple Choice, Multiple Answers: Volcanoes",
      difficulty: "medium",
      questionText: "Select all types of volcanic eruptions described in the geological lecture.",
      lectureText: "Volcanoes exhibit distinct eruption styles based on magma viscosity and gas content. Effusive eruptions are characterized by the steady, gentle flow of low-viscosity basaltic lava, which builds broad shield structures. In contrast, explosive eruptions fragment viscous magma, violently launching ash, pumice, and pyroclastic debris high into the atmosphere.",
      options: ["Effusive eruptions", "Explosive eruptions", "Underground eruptions", "Atmospheric eruptions"],
      correctAnswers: ["Effusive eruptions", "Explosive eruptions"],
      tips: ["Listen for the classification terminology used by the speaker.", "Select only options that are explicitly validated by the audio."],
      taskType: "mcq-multiple-listening"
    },
    {
      id: "LS-403",
      title: "Fill in the Blanks: Machine Learning",
      difficulty: "medium",
      text: "The rise of machine learning has transformed the software development lifecycle by introducing automated testing.",
      gappedText: "The rise of <span class='gap-input' data-index='0'></span> has transformed the software development lifecycle by introducing <span class='gap-input' data-index='1'></span>.",
      correctAnswers: ["machine learning", "automated testing"],
      tips: ["Type the exact words you hear in the recording.", "Ensure correct spelling and capitalization where necessary."],
      taskType: "fib-listening"
    },
    {
      id: "LS-404",
      title: "Highlight Correct Summary: Central Banks",
      difficulty: "medium",
      lectureText: "The central bank decided to lower interest rates to stimulate economic growth. This decision encouraged businesses to borrow and invest, creating new jobs.",
      options: [
        "The central bank lowered interest rates to stimulate growth, resulting in increased business investments and job creation.",
        "The central bank raised interest rates to control inflation, leading to lower spending and business contraction."
      ],
      correctAnswers: ["The central bank lowered interest rates to stimulate growth, resulting in increased business investments and job creation."],
      tips: ["Compare the summaries side by side and select the one that represents the overall lecture theme best."],
      taskType: "highlight-summary"
    },
    {
      id: "LS-405",
      title: "Multiple Choice, Single Answer: Deep Sea",
      difficulty: "easy",
      questionText: "What depth boundary defines the entry to the deep sea zone according to the oceanographer?",
      lectureText: "Oceanographers divide the marine environment into vertical zones based on light penetration. The epipelagic or sunlit zone extends from the surface to about two hundred meters. Below two hundred meters, in the mesopelagic zone, sunlight becomes insufficient for photosynthesis, marking the official ecological entry to the deep sea.",
      options: ["Below 200 meters", "Above 100 meters", "Exactly sea level", "Over 10,000 meters"],
      correctAnswers: ["Below 200 meters"],
      tips: ["Listen for numerical values and their matching qualifiers (above, below, around)."],
      taskType: "mcq-single-listening"
    },
    {
      id: "LS-406",
      title: "Select Missing Word: Silicon Semiconductors",
      difficulty: "easy",
      lectureText: "To capture sunlight efficiently, modern solar panels use silicon semiconductors that convert photons directly into electricity.",
      beepWord: "electricity",
      options: ["electricity", "heat", "sound", "water"],
      correctAnswers: ["electricity"],
      tips: ["Focus on the grammar and logic of the closing sentence to predict the beeped word."],
      taskType: "missing-word"
    },
    {
      id: "LS-407",
      title: "Highlight Incorrect Words: Water Cycle",
      difficulty: "easy",
      text: "Water evaporates from the oceans, condenses in the atmosphere, and falls as precipitation on the land.",
      spokenText: "Water evaporates from the lakes, condenses in the atmosphere, and falls as rain on the land.",
      incorrectWords: ["oceans", "precipitation"],
      correctReplacements: ["lakes", "rain"],
      tips: ["Follow the written text with your cursor as the audio plays.", "Click on any word that differs from what the speaker says."],
      taskType: "highlight-incorrect"
    },
    {
      id: "LS-408",
      title: "Write from Dictation: Academic Integrity",
      difficulty: "easy",
      text: "Academic integrity is fundamental to the university experience.",
      modelAnswer: "Academic integrity is fundamental to the university experience.",
      tips: ["Type exactly what you hear, maintaining correct spelling and punctuation.", "Write down keywords first if it helps your recall."],
      taskType: "write-dictation"
    }
  ]
};

const DEFAULT_VOCABULARY = [
  { word: "Alleviate", ipa: "/əˈliːvieɪt/", pos: "verb", definition: "To make suffering, deficiency, or a problem less severe.", example: "The government implemented green initiatives to alleviate urban pollution." },
  { word: "Anomalous", ipa: "/əˈnɒmələs/", pos: "adjective", definition: "Deviating from what is standard, normal, or expected.", example: "The scientific team noted anomalous weather patterns in the Antarctic." },
  { word: "Corroborate", ipa: "/kəˈrɒbəreɪt/", pos: "verb", definition: "To confirm or give support to a statement, theory, or finding.", example: "The laboratory findings corroborated the clinical trial data." },
  { word: "Dichotomy", ipa: "/daɪˈkɒtəmi/", pos: "noun", definition: "A division or contrast between two things that are represented as being opposed.", example: "There is a strict dichotomy between theoretical physics and experimental applications." },
  { word: "Equivocal", ipa: "/ɪˈkwɪvəkl/", pos: "adjective", definition: "Open to more than one interpretation; ambiguous or uncertain.", example: "The research results were equivocal, requiring further investigations." },
  { word: "Juxtapose", ipa: "/ˌdʒʌkstəˈpəʊz/", pos: "verb", definition: "To place two things close together for contrasting effect.", example: "The exhibition juxtaposed classic oil paintings with modern neon installations." }
];

// Pre-load historic progress logs to populate the dashboard charts
const DEFAULT_PROGRESS = {
  streak: 5,
  points: 350,
  targetScore: 79,
  examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days in the future
  scoreHistory: [
    { date: "May 10", speaking: 65, writing: 68, reading: 62, listening: 64, overall: 65 },
    { date: "May 18", speaking: 70, writing: 72, reading: 68, listening: 70, overall: 70 },
    { date: "May 25", speaking: 74, writing: 70, reading: 72, listening: 75, overall: 73 },
    { date: "June 02", speaking: 76, writing: 75, reading: 74, listening: 78, overall: 76 },
    { date: "June 08", speaking: 80, writing: 74, reading: 78, listening: 81, overall: 78 }
  ],
  completedTasks: ["SP-101", "RD-301"],
  unclearedTasks: [],
  tutorHistory: [
    { sender: "tutor", text: "Welcome to Aspire! I'm your AI PTE trainer. I can help you decode PTE exam structures, offer essay outlines, or analyze your practice outputs. What skill are we targeting today?", time: new Date(Date.now() - 3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]
};

const COMMON_SPELLING_ERRORS = {
  "goverment": "government",
  "enviroment": "environment",
  "seperate": "separate",
  "recieve": "receive",
  "definitly": "definitely",
  "untill": "until",
  "accomodate": "accommodate",
  "truely": "truly",
  "collegue": "colleague",
  "agressively": "aggressively"
};

const BACKUP_QUESTIONS = {
  speaking: [
    {
      id: "SP-109",
      title: "Read Aloud: Solar Power Expansion",
      difficulty: "easy",
      prepTime: 40,
      readTime: 40,
      text: "Solar power expansion has reached record highs in multiple countries. Due to technological efficiency improvements and substantial policy subsidies, renewable installations are now faster to deploy than fossil fuel power plants, speeding up the transition to clean grids.",
      modelAnswer: "Solar power expansion has reached record highs in multiple countries. Due to technological efficiency improvements and substantial policy subsidies, renewable installations are now faster to deploy than fossil fuel power plants, speeding up the transition to clean grids.",
      tips: ["Focus on the sound /ʃ/ in 'expansion' and 'substantial'.", "Keep a steady pacing through the list of nouns."],
      taskType: "read-aloud"
    },
    {
      id: "SP-110",
      title: "Read Aloud: Artificial Intelligence in Agriculture",
      difficulty: "medium",
      prepTime: 40,
      readTime: 40,
      text: "Artificial intelligence is revolutionizing the agricultural sector by optimizing crop yields and reducing resource consumption. Machine learning models analyze satellite imagery and soil data to predict pest outbreaks, enabling farmers to apply targeted interventions and minimize chemical use.",
      modelAnswer: "Artificial intelligence is revolutionizing the agricultural sector by optimizing crop yields and reducing resource consumption. Machine learning models analyze satellite imagery and soil data to predict pest outbreaks, enabling farmers to apply targeted interventions and minimize chemical use.",
      tips: ["Pronounce 'agricultural' and 'imagery' clearly.", "Pause briefly at commas to maintain phrasing."],
      taskType: "read-aloud"
    },
    {
      id: "SP-111",
      title: "Repeat Sentence: University Library",
      difficulty: "easy",
      prepTime: 3,
      readTime: 15,
      text: "The new engineering building is located next to the main university library.",
      modelAnswer: "The new engineering building is located next to the main university library.",
      tips: ["Replicate the falling intonation at the end of the sentence.", "Speak immediately when the status changes to Recording."],
      taskType: "repeat-sentence"
    },
    {
      id: "SP-112",
      title: "Repeat Sentence: Research Methodology",
      difficulty: "medium",
      prepTime: 3,
      readTime: 15,
      text: "You should read the introductory chapter before starting your research methodology section.",
      modelAnswer: "You should read the introductory chapter before starting your research methodology section.",
      tips: ["Maintain a constant speaking pace.", "Do not pause mid-sentence."],
      taskType: "repeat-sentence"
    },
    {
      id: "SP-113",
      title: "Describe Image: Global Energy Mix",
      difficulty: "medium",
      prepTime: 25,
      readTime: 40,
      text: "A bar chart depicting the global energy consumption mix: fossil fuels stand at 75%, hydroelectricity is at 15%, solar energy has grown to 6%, and wind energy contributes 4%.",
      modelAnswer: "This bar chart represents the global energy consumption mix. The vertical axis measures percentage contribution, while the horizontal axis displays different energy types. Fossil fuels represent the dominant source at seventy-five percent, followed by hydroelectricity at fifteen percent. Renewable sources, specifically solar and wind energy, contribute six and four percent respectively. In conclusion, although clean energy is growing, global grids remain heavily dependent on traditional fossil fuels.",
      tips: ["Identify the title of the chart: Global Energy Mix.", "List the highest value (Fossil Fuels, 75%) and compare it with renewables (Solar 6%, Wind 4%).", "Structure the summary with an introductory and concluding sentence."],
      taskType: "describe-image"
    },
    {
      id: "SP-114",
      title: "Re-Tell Lecture: Rise of E-commerce",
      difficulty: "medium",
      prepTime: 10,
      readTime: 40,
      text: "Traditional brick-and-mortar retail stores are facing intense pressure from the rapid expansion of digital commerce. E-commerce platforms leverage machine learning algorithms to recommend products and offer expedited shipping, altering consumer purchasing behaviors and forcing retailers to adopt omni-channel strategies.",
      modelAnswer: "The speaker discussed the competitive pressures brick-and-mortar retail stores face from digital commerce. The lecture highlighted that e-commerce sites use machine learning recommendation systems to capture consumers. Additionally, next-day shipping models have altered buyer habits, necessitating that traditional merchants pivot towards omni-channel sales frameworks.",
      tips: ["Structure using: 'The speaker argued that...', 'Furthermore, he noted...', 'Finally, the lecture concluded that...'", "Focus on fluency and continuous speaking flow over perfect recall."],
      taskType: "retell-lecture"
    },
    {
      id: "SP-115",
      title: "Answer Short Question: Study of Stars",
      difficulty: "easy",
      questionText: "What scientific discipline studies celestial bodies, stars, and galaxies?",
      correctAnswers: ["astronomy"],
      tips: ["Provide a direct, single-word response.", "Speak clearly into the microphone."],
      taskType: "short-question"
    },
    {
      id: "SP-116",
      title: "Answer Short Question: Primary Colors",
      difficulty: "easy",
      questionText: "What color is produced by mixing blue and yellow pigments together?",
      correctAnswers: ["green"],
      tips: ["Reply with a short answer immediately after the beep.", "Avoid preamble words like 'The answer is'."],
      taskType: "short-question"
    },
    {
      id: "SP-117",
      title: "Summarize Group Discussion: Workplace Automation",
      difficulty: "medium",
      prepTime: 10,
      readTime: 40,
      text: "A meeting panel discusses the implications of robotics and automation on clerical labor markets, weighing retraining programs against direct technological unemployment.",
      modelAnswer: "The panel examined workplace automation and its impact on administrative jobs. The speakers debated structural unemployment risks versus proactive worker retraining initiatives. While one manager advocated for automated scheduling tools, another stressed the value of human empathy in public-facing roles, resolving that collaborative human-in-the-loop systems maximize operations.",
      tips: ["Mention the primary topic: workplace automation and administrative labor.", "Identify the trade-off discussed: automated scheduling versus human empathy."],
      taskType: "group-discussion"
    },
    {
      id: "SP-118",
      title: "Respond to a Situation: Group Assignment Delay",
      difficulty: "medium",
      prepTime: 20,
      readTime: 40,
      text: "Your group partner has fallen ill and cannot finish their section of the presentation slides before tomorrow's seminar. Call your lecturer and explain the situation.",
      modelAnswer: "Dear Professor, this is Taksh Sharma. I am calling to inform you that my group partner has unfortunately fallen ill and is unable to complete their section of our slides for tomorrow's seminar. I have consolidated the finished sections and would like to request a one-day extension to finalize the slides, or ask if I may present our current draft. Thank you for your understanding.",
      tips: ["Clearly explain the situation (partner illness).", "Propose a reasonable solution (requesting a short extension or presenting draft slides)."],
      taskType: "respond-situation"
    }
  ],
  writing: [
    {
      id: "WR-203",
      title: "Write Essay: Remote Work Shifts",
      difficulty: "medium",
      timeLimit: 1200,
      prompt: "Many corporations are transitioning to permanent remote work systems. Discuss whether working from home benefits employee productivity and corporate operations, or if it reduces collaboration and innovation. Provide relevant examples.",
      minWords: 200,
      maxWords: 300,
      tips: ["Structure your essay with clear paragraphs.", "Discuss both productivity gains and collaboration losses."],
      taskType: "write-essay"
    },
    {
      id: "WR-204",
      title: "Summarize Written Text: Quantum Computing Basics",
      difficulty: "hard",
      prompt: "Quantum computing represents a paradigm shift in information processing, utilizing the principles of quantum mechanics to perform calculations. Traditional computers encode data in bits, which can exist as either 0 or 1. In contrast, quantum computers employ qubits, which can occupy a state of superposition, representing both 0 and 1 simultaneously. This property, along with quantum entanglement, allows quantum devices to solve complex mathematical problems and simulate molecular structures exponentially faster than classical supercomputers. However, maintaining qubit stability requires extreme cooling systems, presenting major engineering barriers to commercialization.",
      minWords: 5,
      maxWords: 75,
      tips: ["Summarize the text in exactly ONE sentence.", "Connect the description of qubits (superposition) with the challenge of qubit stability (cooling)."],
      taskType: "summarize-written"
    }
  ],
  reading: [
    {
      id: "RD-307",
      title: "Fill in the Blanks (Dropdown): Marine Biodiversity",
      difficulty: "medium",
      paragraphHTML: "The conservation of marine biodiversity requires global regulatory frameworks. Overfishing has <span class='blank-box' data-index='0'></span> oceanic food webs, causing top-level predators to decrease. By establishing marine reserves, societies can protect vulnerable habitats, allowing coral reefs to <span class='blank-box' data-index='1'></span> and fish populations to recover over time.",
      correctAnswers: ["disrupted", "flourish"],
      wordsPool: ["disrupted", "flourish", "stifled", "accelerated", "decay"],
      explanations: {
        0: "'disrupted' fits the context of damage to food webs.",
        1: "'flourish' is the correct verb describing coral growth in protected habitats."
      },
      taskType: "fib-dropdown"
    },
    {
      id: "RD-308",
      title: "Fill in the Blanks (Drag & Drop): Urbanization and Heat",
      difficulty: "medium",
      paragraphHTML: "Urbanization alters local microclimates through the creation of urban heat islands. Concrete and asphalt absorb solar radiation during the day and <span class='blank-box' data-index='0'></span> it as thermal energy at night. Introducing vegetation and green roofs can <span class='blank-box' data-index='1'></span> this effect by promoting evaporative cooling and providing shade.",
      correctAnswers: ["release", "mitigate"],
      wordsPool: ["release", "mitigate", "absorb", "intensify", "neglect"],
      explanations: {
        0: "Concrete absorbs heat during the day and 'releases' it at night.",
        1: "Vegetation helps 'mitigate' or reduce the heat island effect."
      },
      taskType: "fib-drag-drop"
    },
    {
      id: "RD-309",
      title: "Reorder Paragraphs: History of Coffee",
      difficulty: "medium",
      paragraphs: [
        "From the Arabian Peninsula, coffee culture spread to Egypt, Persia, and Turkey, where coffee houses became central cultural hubs.",
        "Coffee cultivation and trade began on the Arabian Peninsula, where it was first cultivated in Yemen in the 15th century.",
        "These establishments, known as schools of the wise, were popular venues for political discussions and musical performances.",
        "European travelers eventually brought stories of this dark beverage back, leading to the establishment of European coffee houses in the 17th century."
      ],
      correctOrder: [1, 0, 2, 3],
      tips: ["Identify Yemen as the chronological origin (sentence 1).", "Connect 'Arabian Peninsula' in sentence 1 with 'From the Arabian Peninsula' in sentence 2."],
      taskType: "reorder-paragraphs"
    },
    {
      id: "RD-310",
      title: "MCQ Single Answer: Photosynthesis Efficiency",
      difficulty: "medium",
      questionText: "Which of the following factors is described as the primary limiting factor for light-dependent reactions of photosynthesis in dense forest understories?",
      options: [
        "Carbon dioxide concentration in the ambient air",
        "The availability of soil nitrogen and phosphorus",
        "Light intensity filtering through the upper canopy",
        "Atmospheric relative humidity levels"
      ],
      correctAnswers: ["Light intensity filtering through the upper canopy"],
      tips: ["Analyze the phrase 'dense forest understories' to associate it with shade and light limitations."],
      taskType: "mcq-single-reading"
    },
    {
      id: "RD-311",
      title: "MCQ Multiple Answers: Climate Adaptation Policies",
      difficulty: "hard",
      questionText: "According to the passage, what are the two main strategies proposed for urban climate change adaptation? (Select 2 options)",
      options: [
        "Retrofitting buildings with high-albedo cool roofs",
        "Relocating all coastal populations to inland cities",
        "Expanding urban green infrastructure and bioswales",
        "Banning the import of all internal combustion vehicles",
        "Replacing municipal water lines with recycled copper piping"
      ],
      correctAnswers: [
        "Retrofitting buildings with high-albedo cool roofs",
        "Expanding urban green infrastructure and bioswales"
      ],
      tips: ["Look for options that discuss realistic urban adjustments (roofs, green infrastructure)."],
      taskType: "mcq-multiple-reading"
    }
  ],
  listening: [
    {
      id: "LS-409",
      title: "Summarize Spoken Text: Peatland Sequestration",
      difficulty: "medium",
      timeLimit: 600,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      lectureText: "Hello everyone. Today we are looking at natural carbon sequestration, specifically the role of peatlands. Peatlands cover only three percent of the global land surface, yet they store twice as much carbon as all the world's forests combined. When peatlands are drained for agriculture, they oxidize, releasing massive volumes of greenhouse gases. Economists argue that preserving peatlands is the most cost-effective method to mitigate emissions, and governments must incentivize peatland restoration.",
      keywords: ["peatlands", "carbon sequestration", "greenhouse gases", "forests", "restore", "emissions"],
      minWords: 50,
      maxWords: 70,
      tips: ["Mention that peatlands store twice as much carbon as forests.", "Explain that draining peatlands releases greenhouse gases."],
      taskType: "summarize-spoken"
    },
    {
      id: "LS-410",
      title: "Summarize Spoken Text: Nanotechnology in Medicine",
      difficulty: "hard",
      timeLimit: 600,
      lectureText: "Nanotechnology is reshaping cancer treatments through targeted drug delivery. Standard chemotherapy damages both healthy and malignant cells, causing severe side effects. Nanoparticles can be engineered to encapsulate chemotherapeutic drugs and release them only when they bind to specific receptors on cancer cell membranes. This increases treatment efficacy while safeguarding healthy tissue, representing a breakthrough in oncology.",
      keywords: ["nanotechnology", "cancer", "chemotherapy", "nanoparticles", "targeted delivery", "oncology"],
      minWords: 50,
      maxWords: 70,
      tips: ["Discuss the contrast between chemotherapy and nanoparticles.", "Highlight targeted delivery benefits."],
      taskType: "summarize-spoken"
    },
    {
      id: "LS-411",
      title: "Fill in the Blanks: Economic Inflation",
      difficulty: "medium",
      text: "Central banks monitor consumer price indices to gauge inflation pressures. If demand outpaces supply, prices rise, eroding purchasing power. Consequently, policymakers may increase interest rates to cool economic growth, balancing price stability with sustainable employment.",
      gappedText: "Central banks monitor consumer price indices to gauge inflation <span class='gap-input' data-index='0'></span>. If demand outpaces supply, prices rise, eroding purchasing <span class='gap-input' data-index='1'></span>. Consequently, policymakers may increase interest rates to cool economic <span class='gap-input' data-index='2'></span>, balancing price stability.",
      correctAnswers: ["pressures", "power", "growth"],
      tips: ["Focus on spelling accuracy for 'pressures' and 'power'."],
      taskType: "fib-listening"
    },
    {
      id: "LS-412",
      title: "Highlight Incorrect Words: Roman Engineering",
      difficulty: "medium",
      text: "Roman engineers constructed durable aqueducts and roadways that linked the vast empire together. By utilizing volcanic ash in their concrete mixtures, they created structures that survived for centuries, even when submerged in saltwater.",
      spokenText: "Roman builders constructed durable aqueducts and bridges that linked the vast territory together. By utilizing volcanic soil in their concrete mixtures, they created structures that survived for centuries, even when submerged in saltwater.",
      incorrectWords: ["engineers", "roadways", "empire", "ash"],
      correctReplacements: ["builders", "bridges", "territory", "soil"],
      tips: ["Track the transcript cursor with your mouse as the voice speaks."],
      taskType: "highlight-incorrect"
    },
    {
      id: "LS-413",
      title: "Write from Dictation: Academic Integrity",
      difficulty: "easy",
      text: "Academic integrity is fundamental to the university experience.",
      modelAnswer: "Academic integrity is fundamental to the university experience.",
      tips: ["Double check your spelling of 'fundamental' and 'integrity'."],
      taskType: "write-dictation"
    },
    {
      id: "LS-414",
      title: "Write from Dictation: Peer-Reviewed Journal",
      difficulty: "medium",
      text: "The final results of this study will be published in a peer-reviewed journal.",
      modelAnswer: "The final results of this study will be published in a peer-reviewed journal.",
      tips: ["Be sure to add the hyphen in 'peer-reviewed' and end with a period."],
      taskType: "write-dictation"
    },
    {
      id: "LS-415",
      title: "Select Missing Word: Dark Matter",
      difficulty: "hard",
      text: "Astronomers observe the gravitational effects of dark matter throughout galactic clusters. Although it does not emit or absorb light, it constitutes the vast majority of the universe's mass. Understanding its composition remains one of physics' greatest challenges.",
      lectureText: "Astronomers observe the gravitational effects of dark matter throughout galactic clusters. Although it does not emit or absorb light, it constitutes the vast majority of the universe's mass. Understanding its composition remains one of physics' greatest [beep].",
      options: ["challenges", "rewards", "mysteries", "theories"],
      correctAnswers: ["challenges"],
      tips: ["Listen for context clues related to solving problems ('greatest challenge')."],
      taskType: "missing-word"
    },
    {
      id: "LS-416",
      title: "Highlight Correct Summary: Renewable Energy Grid",
      difficulty: "medium",
      lectureText: "Integrating solar and wind energy into national grids requires grid-scale energy storage. Unlike natural gas plants, wind and solar are intermittent sources. Battery storage installations store surplus electricity during peak production hours and release it during high demand, ensuring a stable and reliable energy supply.",
      options: [
        "Wind and solar energy are highly reliable sources that do not require any storage solutions to power modern cities.",
        "Because renewable energy is intermittent, grid-scale batteries are essential to store excess power and release it during high demand to keep grids stable.",
        "Natural gas power plants are being replaced by solar arrays that can generate power continuously throughout the night."
      ],
      correctAnswers: ["Because renewable energy is intermittent, grid-scale batteries are essential to store excess power and release it during high demand to keep grids stable."],
      tips: ["Eliminate options that contradict basic energy facts (like solar generating power at night)."],
      taskType: "highlight-summary"
    },
    {
      id: "LS-417",
      title: "MCQ Single Answer: Marine Ecosystems",
      difficulty: "easy",
      lectureText: "Estuaries are highly productive ecosystems where freshwater from rivers mixes with salty ocean water. These environments serve as critical nurseries for various fish species, providing abundant nutrients and protection from deep-sea predators.",
      questionText: "What is the primary characteristic of estuaries mentioned in the recording?",
      options: [
        "They are dry regions with minimal biodiversity",
        "They are areas where fresh and saltwater mix, acting as nurseries for fish",
        "They are deep oceanic trenches with high water pressure"
      ],
      correctAnswers: ["They are areas where fresh and saltwater mix, acting as nurseries for fish"],
      tips: ["Listen for the description of saline mixing."],
      taskType: "mcq-single-listening"
    },
    {
      id: "LS-418",
      title: "MCQ Multiple Answers: Deep Space Probe",
      difficulty: "hard",
      lectureText: "The Voyager space probes have entered interstellar space, sending back valuable data about the cosmic ray intensity outside our solar system. The probes rely on radioisotope thermoelectric generators, which convert heat from decaying plutonium into electricity. However, as the heat source decays, scientists must prioritize which scientific instruments to keep operational.",
      questionText: "Based on the recording, what are the two main challenges currently faced by the Voyager mission team? (Select 2 options)",
      options: [
        "Managing the diminishing electrical power supply",
        "Navigating the probe through intense asteroid belts",
        "Determining which instruments to power down to conserve energy",
        "Securing additional funding from international space agencies",
        "Defending the spacecraft from solar flares"
      ],
      correctAnswers: [
        "Managing the diminishing electrical power supply",
        "Determining which instruments to power down to conserve energy"
      ],
      tips: ["Identify the power sources mentioned (plutonium decay, prioritizing instruments)."],
      taskType: "mcq-multiple-listening"
    }
  ]
};

const PROCEDURAL_SUBJECTS = [
  "marine biology", "quantum computing", "behavioral economics", "medieval archaeology", "environmental engineering",
  "cognitive psychology", "renewable energy design", "urban sociology", "astrophysics", "bioinformatics",
  "macroeconomic policy", "organic chemistry", "paleontology", "geological seismology", "robotics automation"
];

const PROCEDURAL_CHALLENGES = [
  "rapid degradation of coastal habitats", "volatility of neural network learning rates", "correlation between inflation and consumer confidence",
  "preservation of carbonized parchment documents", "mitigation of microplastic pollution in rivers", "cognitive load experienced during multitasking",
  "efficiency limits of thin-film solar panels", "social stratification in hyper-dense urban centers", "detection of low-frequency gravitational waves",
  "alignment of gene sequences in complex organisms", "integration of automated systems in factories", "depletion of underground water tables",
  "erratic behavior of magnetic fields near magma", "ethical implications of automated facial recognition", "carbon footprint of global data centers"
];

const PROCEDURAL_METHODOLOGIES = [
  "high-resolution satellite imagery", "deep neural network simulations", "rigorous randomized control trials",
  "advanced multispectral imaging technology", "automated gas chromatography", "functional magnetic resonance imaging",
  "quantum-mechanical modeling algorithms", "longitudinal survey data analysis", "cryogenic interferometric sensors",
  "parallelized sequencing pipelines", "multi-spectral lidar scanning", "statistical time-series forecasting",
  "isotope analysis of sediment cores", "machine learning pattern recognition", "high-speed thermodynamic cameras"
];

const PROCEDURAL_OBSERVATIONS = [
  "coastal ecosystems are far more resilient than previously estimated", "computational overhead increases non-linearly with model depth",
  "consumer habits are highly influenced by localized peer choices", "ink compositions vary drastically across historical epochs",
  "pollutant concentrations peak during specific seasonal runoff events", "attentional blink duration is directly proportional to visual complexity",
  "doping silicon with gallium increases photon conversion rates", "social cohesion varies inversely with neighborhood turnover rates",
  "binary neutron star mergers produce distinctive electromagnetic counterparts", "non-coding DNA segments exhibit highly conserved regulatory patterns",
  "predictive algorithms often amplify historical dataset biases", "soil depletion rates are decelerated by crop rotation practices",
  "tectonic stress buildup is highly correlated with micro-seismic swarms", "extreme temperature fluctuations trigger cellular membrane degradation",
  "geothermal heat output remains remarkably constant despite atmospheric shifts"
];

const PROCEDURAL_APPLICATIONS = [
  "sustainable fishery management models", "resource-efficient machine learning deployment", "targeted fiscal policymaking",
  "preservation methodologies for ancient texts", "freshwater conservation guidelines", "classroom curriculum development",
  "photovoltaic cell manufacturing", "inclusive urban planning strategies", "cosmological expansion modeling",
  "precision medicine and gene therapy research", "unbiased algorithmic decision systems", "regenerative agricultural policies",
  "early-warning seismic mitigation systems", "robust biological crop protection", "geothermal heating systems"
];

const PROCEDURAL_NOUNS = [
  "ecological stability", "artificial general intelligence", "macroeconomic stability", "historical records", "environmental health",
  "educational psychology", "clean power generation", "social justice", "cosmological evolution", "genomic integrity",
  "algorithmic fairness", "agricultural sustainability", "geological safety", "biochemical resilience", "sustainable development"
];

const PROCEDURAL_DISTRACTORS = [
  "arbitrary", "paradoxical", "equilibrium", "corroborate", "fluctuate", "facilitate", "subsequent", "conjecture",
  "empirical", "plausible", "correlation", "causality", "ambiguous", "proliferation", "synthesis", "manifest",
  "hypothetical", "cognitive", "dynamic", "intrinsic", "holistic", "systemic", "resilience", "delineate"
];

export const Database = {
  parseCleanJson(text) {
    if (!text || typeof text !== 'string') return null;
    let clean = text.trim();
    
    // Strip markdown code block wrappers if any
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
    }
    
    // Fallback: search for first '{' and last '}' to extract JSON substring if there's other text
    const startIdx = clean.indexOf('{');
    const endIdx = clean.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      clean = clean.substring(startIdx, endIdx + 1);
    }
    
    return JSON.parse(clean);
  },

  areWordsSimilar(w1, w2) {
    if (!w1 || !w2) return false;
    const clean1 = w1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = w2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean1 === clean2) return true;
    
    // Check if one is a plural or tense variation of the other (e.g. ecosystem vs ecosystems)
    const stem = (w) => w.replace(/(ing|ed|es|s)$/, '');
    if (stem(clean1) === stem(clean2) && Math.abs(clean1.length - clean2.length) <= 3) return true;
    
    // Simple edit distance for close typos (length >= 4)
    if (clean1.length >= 4 && clean2.length >= 4) {
      let diff = 0;
      const minLen = Math.min(clean1.length, clean2.length);
      for (let i = 0; i < minLen; i++) {
        if (clean1[i] !== clean2[i]) diff++;
      }
      diff += Math.abs(clean1.length - clean2.length);
      if (diff <= 1) return true; // At most 1 character difference
    }
    
    return false;
  },

  safeSaveQuestions(questions) {
    try {
      localStorage.setItem('fluentai_questions', JSON.stringify(questions));
      return true;
    } catch (e) {
      console.warn("localStorage write failed (quota exceeded):", e);
      return false;
    }
  },

  init() {
    const dbVersion = "v10";
    if (localStorage.getItem("fluentai_db_version") !== dbVersion) {
      this.safeSaveQuestions(DEFAULT_QUESTIONS);
      localStorage.setItem("fluentai_db_version", dbVersion);
      localStorage.setItem("fluentai_progress", JSON.stringify(DEFAULT_PROGRESS));
      localStorage.setItem("fluentai_vocabulary", JSON.stringify(DEFAULT_VOCABULARY));
    }

    if (!localStorage.getItem("fluentai_questions")) {
      this.safeSaveQuestions(DEFAULT_QUESTIONS);
    }
    if (!localStorage.getItem("fluentai_vocabulary")) {
      localStorage.setItem("fluentai_vocabulary", JSON.stringify(DEFAULT_VOCABULARY));
    }
    if (!localStorage.getItem("fluentai_progress")) {
      localStorage.setItem("fluentai_progress", JSON.stringify(DEFAULT_PROGRESS));
    }
    if (!localStorage.getItem("fluentai_user")) {
      const defaultUser = {
        name: "Taksh Sharma",
        email: "taksh@example.com",
        authenticated: true
      };
      localStorage.setItem("fluentai_user", JSON.stringify(defaultUser));
    }

    // Auto-seed to 2000 questions per category if needed
    try {
      const questions = this.getQuestions();
      const skills = ['speaking', 'writing', 'reading', 'listening'];
      let needsSeed = false;
      for (const skill of skills) {
        if (!questions[skill] || questions[skill].length < 2000) {
          needsSeed = true;
          break;
        }
      }
      if (needsSeed) {
        console.log("Auto-seeding database to 2,000 questions per category...");
        this.bulkSeedQuestions(2000);
      }
    } catch (e) {
      console.error("Failed to auto-seed database", e);
    }

    // Trigger session question generation
    this.addNewSessionQuestion();
  },

  generateProceduralQuestion(taskType) {
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pickMultiple = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    const subject = pickRandom(PROCEDURAL_SUBJECTS);
    const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
    const challenge = pickRandom(PROCEDURAL_CHALLENGES);
    const methodology = pickRandom(PROCEDURAL_METHODOLOGIES);
    const observation = pickRandom(PROCEDURAL_OBSERVATIONS);
    const application = pickRandom(PROCEDURAL_APPLICATIONS);
    const noun = pickRandom(PROCEDURAL_NOUNS);
    
    // Create random question title
    const academicTitles = [
      `Comparative Studies in ${capitalizedSubject}`,
      `Key Challenges in ${capitalizedSubject} Research`,
      `The Impact of ${capitalizedSubject} on ${noun.charAt(0).toUpperCase() + noun.slice(1)}`,
      `Analyzing ${noun.charAt(0).toUpperCase() + noun.slice(1)} via ${capitalizedSubject}`,
      `Modern Applications of ${capitalizedSubject}`
    ];
    const title = pickRandom(academicTitles);
    const id = `PROC-${taskType.toUpperCase().substring(0, 3)}-${Date.now()}`;
    const difficulty = pickRandom(["easy", "medium", "hard"]);

    if (taskType === 'read-aloud') {
      const text = `Recent advancements in ${subject} have shed light on ${challenge}. Researchers using ${methodology} discovered that ${observation}. This observation has profound implications for ${application}, suggesting a paradigm shift in how we analyze ${noun}.`;
      return {
        id,
        title: `Read Aloud: ${title}`,
        difficulty,
        prepTime: 40,
        readTime: 40,
        text,
        modelAnswer: text,
        tips: [`Pay attention to academic terms like ${pickRandom(PROCEDURAL_DISTRACTORS)}.`, "Maintain steady pacing and clear articulation."],
        taskType: 'read-aloud'
      };
    }

    if (taskType === 'repeat-sentence') {
      const sentenceTemplates = [
        `The study of ${subject} requires the analysis of ${noun}.`,
        `${capitalizedSubject} is considered key to understanding modern ${noun}.`,
        `Researchers found that ${subject} affects ${noun} under various conditions.`,
        `The lecture on ${subject} will cover the impact of ${challenge} tomorrow.`,
        `Please ensure your research proposal on ${subject} is submitted before Friday.`
      ];
      const text = pickRandom(sentenceTemplates);
      return {
        id,
        title: `Repeat Sentence: ${title}`,
        difficulty,
        text,
        tips: ["Listen carefully to the intonation and repeat exact words in sequence.", "Avoid long pauses between words."],
        taskType: 'repeat-sentence'
      };
    }

    if (taskType === 'describe-image') {
      const chartTypes = ["bar chart", "line graph", "pie chart", "flow diagram"];
      const chartType = pickRandom(chartTypes);
      const dataLabels = [
        ["2020", "2022", "2024", "2026"],
        ["Control Group", "Experimental A", "Experimental B", "Reference Group"],
        ["North Region", "South Region", "East Region", "West Region"]
      ];
      const labels = pickRandom(dataLabels);
      const val1 = Math.floor(Math.random() * 40) + 15;
      const val2 = Math.floor(Math.random() * 50) + 30;
      const val3 = Math.floor(Math.random() * 60) + 40;
      const val4 = Math.floor(Math.random() * 70) + 50;
      const values = [val1, val2, val3, val4];

      let text = `The diagram shows a ${chartType} describing ${title}. `;
      text += `The highest value is recorded at ${labels[values.indexOf(Math.max(...values))]} with ${Math.max(...values)} percent, while the lowest is at ${labels[values.indexOf(Math.min(...values))]} with ${Math.min(...values)} percent. `;
      text += `Overall, we can see a clear trend related to ${noun}.`;

      return {
        id,
        title: `Describe Image: ${title}`,
        difficulty,
        text: `Interactive SVG ${chartType} detailing comparative data points for ${title}.`,
        modelAnswer: text,
        tips: ["Identify the highest and lowest values in the chart.", "State a clear overview or trend at the end.", "Maintain fluency without hesitations."],
        taskType: 'describe-image',
        proceduralData: {
          chartType,
          labels,
          values,
          title
        }
      };
    }

    if (taskType === 'retell-lecture' || taskType === 'group-discussion') {
      const lectureText = `Good morning everyone. Today we are discussing the recent findings in the field of ${subject}. The key challenge we are facing today is ${challenge}. To analyze this, our laboratory team applied ${methodology}. Surprisingly, we observed that ${observation}. In conclusion, these findings will directly improve ${application} and redefine how we manage ${noun}. Thank you.`;
      return {
        id,
        title: `${taskType === 'retell-lecture' ? 'Re-Tell Lecture' : 'Group Discussion'}: ${title}`,
        difficulty,
        lectureText,
        modelAnswer: `The speaker was discussing ${subject}, specifically focusing on ${challenge}. He mentioned that using ${methodology}, researchers discovered that ${observation}. Ultimately, this has huge applications for ${application} and the conservation of ${noun}.`,
        tips: ["Note key nouns and verbs during the lecture.", "Use a structured template to organize your summary spoken response.", "Speak clearly and continuously."],
        taskType
      };
    }

    if (taskType === 'short-question') {
      const qTemplates = [
        { q: `If someone is studying ${subject}, are they analyzing physical or social sciences?`, a: ["physical", "social"] },
        { q: `What device is typically used to capture data from ${methodology}?`, a: ["camera", "sensor", "satellite"] },
        { q: `Is the concept of ${noun} related to ecology or physics?`, a: ["ecology", "physics", "both"] }
      ];
      const selected = pickRandom(qTemplates);
      return {
        id,
        title: `Answer Short Question: ${title}`,
        difficulty: "easy",
        questionText: selected.q,
        correctAnswers: selected.a,
        tips: ["Provide a direct, one-word or short phrase answer.", "Listen to the keyword in the question."],
        taskType: 'short-question'
      };
    }

    if (taskType === 'respond-situation') {
      const text = `You are a researcher in ${subject} working on ${challenge}. A colleague asks for your help using ${methodology} to verify their results. How would you professionally accept the invitation and propose a meeting tomorrow?`;
      const modelAnswer = `Hello, I would be delighted to assist you with ${methodology}. I believe it is a key tool for solving the issues related to ${challenge}. Let's schedule a meeting in my office tomorrow morning to discuss the details.`;
      return {
        id,
        title: `Respond to a Situation: ${title}`,
        difficulty,
        text,
        modelAnswer,
        tips: ["Maintain a professional, polite, and helpful tone.", "Address all aspects of the situation prompt."],
        taskType: 'respond-situation'
      };
    }

    if (taskType === 'write-essay') {
      const prompt = `In today's modern world, issues surrounding ${challenge} have sparked heated debate. Some argue that investing resources in ${subject} is the key solution, while others believe that resources should be directed elsewhere. Discuss both views and give your opinion.`;
      return {
        id,
        title: `Write Essay: ${title}`,
        difficulty,
        timeLimit: 1200,
        prompt,
        minWords: 200,
        maxWords: 300,
        tips: ["Use a 4-paragraph structure: Introduction, Body 1, Body 2, Conclusion.", "Check your spelling and punctuation before submitting."],
        taskType: 'write-essay'
      };
    }

    if (taskType === 'summarize-written') {
      const prompt = `While ${subject} has made significant strides in academic circles, the practical resolution of ${challenge} remains elusive. Traditional systems often fail to incorporate ${methodology}, leading to inaccurate models of ${noun}. However, a recent paradigm shift indicates that when ${observation}, practitioners can achieve sustainable solutions. Therefore, integrating these disciplines is essential for the future of ${application}.`;
      return {
        id,
        title: `Summarize Written Text: ${title}`,
        difficulty,
        prompt,
        minWords: 5,
        maxWords: 75,
        tips: ["Write exactly ONE single sentence.", "Ensure your sentence starts with a capital letter and ends with a single period.", "Use conjunctions like 'although', 'which', or 'because' to connect ideas."],
        taskType: 'summarize-written'
      };
    }

    if (taskType === 'fib-dropdown' || taskType === 'fib-drag-drop') {
      const gap1 = pickRandom(PROCEDURAL_DISTRACTORS);
      const gap2 = pickRandom(PROCEDURAL_NOUNS.map(n => n.split(" ")[0]));
      
      const paragraphHTML = `The study of ${subject} offers a <span class='blank-box' data-index='0'></span> approach to understanding ${challenge}. By analyzing the core layers of ${noun}, researchers can <span class='blank-box' data-index='1'></span> new pathways for ${application}.`;
      const correctAnswers = ["systemic", "facilitate"];
      const wordsPool = ["systemic", "facilitate", gap1, gap2, ...pickMultiple(PROCEDURAL_DISTRACTORS, 2)];
      const uniquePool = Array.from(new Set(wordsPool));
      
      return {
        id,
        title: `Fill in the Blanks: ${title}`,
        difficulty,
        paragraphHTML,
        correctAnswers,
        wordsPool: uniquePool,
        explanations: {
          "0": "A systemic approach matches the academic tone indicating a whole-system study.",
          "1": "'Facilitate' is a verb meaning to make an action or process easy or easier."
        },
        taskType
      };
    }

    if (taskType === 'reorder-paragraphs') {
      const paragraphs = [
        `Historically, research in ${subject} has been limited by traditional technologies.`,
        `However, the introduction of ${methodology} has completely transformed the scientific landscape.`,
        `By applying these modern techniques, scholars observed that ${observation}.`,
        `Ultimately, these findings have paved the way for sustainable development in ${application}.`
      ];
      const indices = [0, 1, 2, 3];
      const shuffledIndices = [...indices].sort(() => Math.random() - 0.5);
      const shuffledParagraphs = shuffledIndices.map(idx => paragraphs[idx]);
      const correctOrder = indices.map(idx => shuffledIndices.indexOf(idx));

      return {
        id,
        title: `Re-order Paragraphs: ${title}`,
        difficulty,
        paragraphs: shuffledParagraphs,
        correctOrder,
        tips: ["Look for logical transitions like 'However', 'By applying these', and 'Ultimately'.", "Identify the independent introductory sentence."],
        taskType: 'reorder-paragraphs'
      };
    }

    if (taskType === 'summarize-spoken') {
      const lectureText = `In this lecture, we explore how ${subject} addresses ${challenge}. Through ${methodology}, we observed that ${observation}. This has massive value for ${application} and ${noun}.`;
      return {
        id,
        title: `Summarize Spoken Text: ${title}`,
        difficulty,
        timeLimit: 600,
        lectureText,
        keywords: [subject.split(" ")[0], noun.split(" ")[0]],
        minWords: 50,
        maxWords: 70,
        tips: ["Write between 50 and 70 words.", "Include key vocabulary mentioned in the audio lecture."],
        taskType: 'summarize-spoken'
      };
    }

    if (taskType === 'fib-listening') {
      const text = `The introduction of ${subject} is vital for resolving ${challenge} in modern society.`;
      const gappedText = `The introduction of <span class='gap-input' data-index='0'></span> is vital for resolving <span class='gap-input' data-index='1'></span> in modern society.`;
      return {
        id,
        title: `Fill in the Blanks (Listening): ${title}`,
        difficulty,
        text,
        gappedText,
        correctAnswers: [subject.split(" ")[0], challenge.split(" ")[0]],
        tips: ["Type the exact words you hear, making sure spelling is 100% correct.", "Use tab to quickly move to the next input field."],
        taskType: 'fib-listening'
      };
    }

    if (taskType === 'highlight-incorrect') {
      const correctWords = [subject.split(" ")[0], "resolving"];
      const replacedWords = ["engineering", "ignoring"];
      const text = `The introduction of ${correctWords[0]} is vital for ${correctWords[1]} the main issues of ${challenge}.`;
      const spokenText = `The introduction of ${replacedWords[0]} is vital for ${replacedWords[1]} the main issues of ${challenge}.`;
      return {
        id,
        title: `Highlight Incorrect Words: ${title}`,
        difficulty,
        text,
        spokenText,
        incorrectWords: replacedWords,
        correctReplacements: correctWords,
        tips: ["Read the screen as the audio plays.", "Click on words that differ between what is written and spoken."],
        taskType: 'highlight-incorrect'
      };
    }

    if (taskType === 'write-dictation') {
      const text = `${capitalizedSubject} has played a key role in supporting ${noun}.`;
      return {
        id,
        title: `Write from Dictation: ${title}`,
        difficulty,
        text,
        modelAnswer: text,
        tips: ["Listen intently to the entire sentence before writing.", "Ensure proper capitalization and spelling."],
        taskType: 'write-dictation'
      };
    }

    const questionText = `Which aspect of ${subject} directly contributes to resolving ${challenge}?`;
    const options = [
      `The implementation of ${methodology} to track data.`,
      `The absolute elimination of all variables associated with ${noun}.`,
      `A random baseline comparison across unrelated disciplines.`,
      `None of the above options are correct.`
    ];
    return {
      id,
      title: `Multiple Choice: ${title}`,
      difficulty,
      questionText,
      options,
      correctAnswers: [options[0]],
      tips: ["Identify keywords in the prompt question text.", "Eliminate choices containing absolute words like 'all' or 'never'."],
      taskType: taskType || 'mcq-single-reading'
    };
  },

  async callLLM(systemPrompt, userPrompt = "", isJson = false) {
    const geminiApiKey = localStorage.getItem('gemini_api_key');
    const openaiApiKey = localStorage.getItem('openai_api_key');

    if (geminiApiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt + (userPrompt ? `\n\nUser Input:\n${userPrompt}` : "")
            }]
          }],
          generationConfig: isJson ? { responseMimeType: 'application/json' } : {}
        })
      });

      if (!response.ok) {
        throw new Error("Gemini API call failed");
      }

      const resJson = await response.json();
      if (resJson.candidates && resJson.candidates[0] && resJson.candidates[0].content && resJson.candidates[0].content.parts[0]) {
        return resJson.candidates[0].content.parts[0].text;
      }
      throw new Error("Invalid response from Gemini API");
    }

    if (openaiApiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: isJson ? { type: "json_object" } : undefined,
          messages: [
            { role: 'system', content: systemPrompt },
            ...(userPrompt ? [{ role: 'user', content: userPrompt }] : [])
          ]
        })
      });

      if (!response.ok) {
        throw new Error("OpenAI API call failed");
      }

      const resJson = await response.json();
      return resJson.choices[0].message.content;
    }

    throw new Error("No API key configured");
  },

  getQuestions() {
    try {
      const stored = localStorage.getItem("fluentai_questions");
      if (!stored) return DEFAULT_QUESTIONS;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse fluentai_questions from localStorage, resetting to defaults", e);
      localStorage.removeItem("fluentai_questions");
      return DEFAULT_QUESTIONS;
    }
  },

  getVocabulary() {
    try {
      const stored = localStorage.getItem("fluentai_vocabulary");
      if (!stored) return DEFAULT_VOCABULARY;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse fluentai_vocabulary from localStorage, resetting to defaults", e);
      localStorage.removeItem("fluentai_vocabulary");
      return DEFAULT_VOCABULARY;
    }
  },

  getProgress() {
    try {
      const stored = localStorage.getItem("fluentai_progress");
      if (!stored) return DEFAULT_PROGRESS;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse fluentai_progress from localStorage, resetting to defaults", e);
      localStorage.removeItem("fluentai_progress");
      return DEFAULT_PROGRESS;
    }
  },

  updateProgress(updated) {
    localStorage.setItem("fluentai_progress", JSON.stringify(updated));
  },

  getUser() {
    try {
      const stored = localStorage.getItem("fluentai_user");
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse fluentai_user from localStorage", e);
      localStorage.removeItem("fluentai_user");
      return null;
    }
  },

  updateUser(user) {
    localStorage.setItem("fluentai_user", JSON.stringify(user));
  },

  clearUserData() {
    localStorage.removeItem("fluentai_user");
    localStorage.setItem("fluentai_progress", JSON.stringify(DEFAULT_PROGRESS));
  },

  /* ==========================================================================
     AI PTE GRADING ENGINE
     ========================================================================== */
  
  // Grade Reading Fill in the Blanks
  gradeReadingFIB(questionId, answers) {
    const questions = this.getQuestions();
    const question = questions.reading.find(q => q.id === questionId);
    if (!question) return { score: 0, feedback: [] };

    let correctCount = 0;
    const details = [];

    question.correctAnswers.forEach((correct, index) => {
      const userAns = answers[index];
      const isCorrect = userAns && userAns.toLowerCase() === correct.toLowerCase();
      if (isCorrect) correctCount++;
      
      details.push({
        index,
        userAnswer: userAns || "[Empty]",
        correctAnswer: correct,
        isCorrect,
        explanation: question.explanations[index]
      });
    });

    const maxScore = question.correctAnswers.length;
    // Map to PTE scale (0-90)
    const scaledScore = Math.round((correctCount / maxScore) * 90);

    // Record progress
    this.recordScore("reading", scaledScore);
    this.markTaskCompleted(questionId, scaledScore);

    return {
      score: scaledScore,
      correctCount,
      maxScore,
      details
    };
  },

  // Grade Listening Fill in the Blanks
  gradeListeningFIB(questionId, answers) {
    const questions = this.getQuestions();
    const question = questions.listening.find(q => q.id === questionId);
    if (!question) return { score: 0, details: [] };

    let correctCount = 0;
    const details = [];

    question.correctAnswers.forEach((correct, index) => {
      const userAns = (answers[index] || "").trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const cleanCorrect = correct.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const isCorrect = userAns === cleanCorrect;
      if (isCorrect) correctCount++;
      
      details.push({
        index,
        userAnswer: answers[index] || "[Empty]",
        correctAnswer: correct,
        isCorrect
      });
    });

    const maxScore = question.correctAnswers.length;
    const pct = maxScore > 0 ? (correctCount / maxScore) : 0;
    const score = Math.round(20 + pct * 70); // Normalise to 20-90 scale

    // Record progress
    this.recordScore("listening", score);
    this.markTaskCompleted(questionId, score);

    return {
      score,
      isCorrect: score === 90,
      correctCount,
      maxScore,
      details,
      correctAnswers: question.correctAnswers,
      modelAnswer: question.correctAnswers.join(', ')
    };
  },

  // Grade Writing Essay (Write Essay)
  gradeWritingEssay(questionId, text) {
    const questions = this.getQuestions();
    const question = questions.writing.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 1. Structure and Word Count Scoring
    let wordCountScore = 0;
    if (wordCount >= 200 && wordCount <= 300) {
      wordCountScore = 2; // Full marks
    } else if ((wordCount >= 120 && wordCount < 200) || (wordCount > 300 && wordCount <= 380)) {
      wordCountScore = 1; // Partial marks
    }

    // 2. Grammar & Spelling Analyzer
    const spellingErrors = [];
    const grammarSuggestions = [];
    
    // Analyze words for spelling errors
    words.forEach(word => {
      // Remove punctuation marks
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (COMMON_SPELLING_ERRORS[cleanWord]) {
        spellingErrors.push({
          error: word,
          correction: COMMON_SPELLING_ERRORS[cleanWord],
          type: "spelling"
        });
      }
    });

    // Check sentence spacing and punctuation grammar
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    sentences.forEach(s => {
      const trimmed = s.trim();
      if (trimmed.length > 0) {
        // Check for capitalization
        if (trimmed[0] !== trimmed[0].toUpperCase()) {
          grammarSuggestions.push({
            text: trimmed.slice(0, 15) + "...",
            correction: "Start sentences with a capital letter.",
            type: "grammar"
          });
        }
      }
    });

    // Extract keywords from prompt for content score
    const promptText = question.prompt || question.title || "";
    const promptWords = promptText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !["should", "about", "would", "their", "there", "other", "essay", "write", "agree", "disagree", "opinion", "people", "these", "those"].includes(w));
    
    // Check overlap with prompt words using fuzzy similarity
    let promptOverlap = 0;
    const uniquePromptWords = [...new Set(promptWords)];
    uniquePromptWords.forEach(word => {
      const hasWord = words.some(userW => this.areWordsSimilar(word, userW));
      if (hasWord) {
        promptOverlap++;
      }
    });

    const targetOverlap = Math.min(5, Math.ceil(uniquePromptWords.length * 0.45));
    const contentScore = targetOverlap > 0 ? Math.min(3, Math.round((promptOverlap / targetOverlap) * 3)) : 2;

    // Standard scoring variables
    const spellingScore = Math.max(0, 2 - Math.floor(spellingErrors.length / 2));
    const grammarScore = Math.max(0, 2 - Math.floor(grammarSuggestions.length / 2));
    const vocabScore = wordCount > 100 ? (text.match(/(subsid|cultivat|yield|consequent|foster|robust)/g) ? 2 : 1) : 0;

    // Total PTE writing sub-grades (max 12 points normalized to 0-90)
    const rawTotal = wordCountScore + spellingScore + grammarScore + contentScore + vocabScore;
    const maxRaw = 11; // 2 + 2 + 2 + 3 + 2
    let scaledScore = Math.round((rawTotal / maxRaw) * 90);
    if (wordCount < 50) scaledScore = 0; // PTE rules: minimal response gets zero

    // Record progress
    this.recordScore("writing", scaledScore);
    this.markTaskCompleted(questionId, scaledScore);

    // Dynamic error highlights text markup
    let markedText = text;
    spellingErrors.forEach(err => {
      // Simple regex highlighting matching word (case sensitive)
      const regex = new RegExp(`\\b${err.error}\\b`, "g");
      markedText = markedText.replace(regex, `<span class="word-bad" title="Spelling error: replace with '${err.correction}'">${err.error}</span>`);
    });

    // Highlight some positive vocabulary terms
    const positiveWords = ["democratizes", "subsidizing", "consequently", "furthermore", "demands", "substantive", "sustainable", "monoculture", "intermittent"];
    positiveWords.forEach(pword => {
      const regex = new RegExp(`\\b${pword}\\b`, "gi");
      markedText = markedText.replace(regex, `<span class="word-good" title="Advanced vocabulary term">${pword}</span>`);
    });

    return {
      score: scaledScore,
      wordCount,
      subScores: {
        grammar: Math.round((grammarScore / 2) * 90),
        spelling: Math.round((spellingScore / 2) * 90),
        vocabulary: Math.round((vocabScore / 2) * 90),
        content: Math.round((contentScore / 3) * 90)
      },
      spellingErrors,
      grammarSuggestions,
      markedText
    };
  },

  // Grade Speaking Read Aloud
  // Grade Speaking general fallback
  gradeSpeakingReadAloud(questionId, offlineTranscript) {
    const questions = this.getQuestions();
    const question = questions.speaking.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const type = question.taskType || 'read-aloud';
    const targetText = type === 'repeat-sentence' || type === 'read-aloud'
      ? question.text
      : (question.modelAnswer || question.text || '');

    // If an offline transcript is available from browser speech recognition
    if (offlineTranscript && typeof offlineTranscript === 'string' && offlineTranscript.trim().length > 0) {
      const targetWords = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);
      const spokenWords = offlineTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);

      let matches = 0;
      targetWords.forEach(word => {
        if (spokenWords.some(spoken => this.areWordsSimilar(word, spoken))) {
          matches++;
        }
      });

      const matchRatio = targetWords.length > 0 ? (matches / targetWords.length) : 0;
      
      // Calculate dynamic PTE scores based on matchRatio
      const contentScore = Math.round(matchRatio * 90);
      const pronScore = Math.round(Math.min(90, Math.max(15, matchRatio * 85 + (Math.random() * 8 - 4))));
      const fluencyScore = Math.round(Math.min(90, Math.max(15, matchRatio * 88 + (Math.random() * 6 - 3))));
      const overall = Math.round((contentScore + pronScore + fluencyScore) / 3);

      // Highlight matched words
      const marked = targetText.split(' ').map(word => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (spokenWords.some(spoken => this.areWordsSimilar(clean, spoken))) {
          return `<span class="word-good">${word}</span>`;
        } else {
          return `<span class="word-bad" title="Word omitted or mispronounced during offline check">${word}</span>`;
        }
      }).join(' ');

      const tips = [
        ...(question.tips || []),
        `Offline Speech recognition matched ${matches} of ${targetWords.length} target words correctly.`
      ];

      // Record progress
      this.recordScore("speaking", overall);
      this.markTaskCompleted(questionId, overall);

      return {
        score: overall,
        pronunciation: pronScore,
        fluency: fluencyScore,
        content: contentScore,
        markedText: marked,
        tips
      };
    }

    // Default simulated backup if no speech is detected or mic blocked
    const seed = questionId.charCodeAt(questionId.length - 1) % 15;
    const pronScore = 15; // low scores when no speech detected
    const fluencyScore = 10;
    const contentScore = 0;
    const overall = Math.round((pronScore + fluencyScore + contentScore) / 3);

    const words = targetText.split(" ");
    const markedWords = words.map(word => `<span class="word-bad" title="No audio or speech detected">${word}</span>`);

    // Record progress
    this.recordScore("speaking", overall);
    this.markTaskCompleted(questionId, overall);

    return {
      score: overall,
      pronunciation: pronScore,
      fluency: fluencyScore,
      content: contentScore,
      markedText: markedWords.join(" "),
      tips: [
        ...(question.tips || []),
        "No speech detected. Please ensure your microphone is enabled and speak clearly into it."
      ]
    };
  },

  // Grade Listening Summarize Spoken Text (SST)
  gradeListeningSST(questionId, text) {
    const questions = this.getQuestions();
    const question = questions.listening.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 1. Length constraints (50 - 70 words)
    let lengthScore = 0;
    if (wordCount >= 50 && wordCount <= 70) {
      lengthScore = 2;
    } else if ((wordCount >= 40 && wordCount < 50) || (wordCount > 70 && wordCount <= 80)) {
      lengthScore = 1;
    }

    // 2. Keyword check (Lecture alignment) using fuzzy similarity
    let matchedKeywordsCount = 0;
    const matchedKeywords = [];
    if (question.keywords) {
      question.keywords.forEach(keyword => {
        const hasWord = words.some(userW => this.areWordsSimilar(keyword, userW));
        if (hasWord) {
          matchedKeywordsCount++;
          matchedKeywords.push(keyword);
        }
      });
    }

    const maxKeywords = (question.keywords && question.keywords.length > 0) ? question.keywords.length : 1;
    const keywordRatio = matchedKeywordsCount / maxKeywords;
    const contentScore = Math.round(keywordRatio * 2);

    // Analyze spelling errors
    const spellingErrors = [];
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (COMMON_SPELLING_ERRORS[cleanWord]) {
        spellingErrors.push({
          error: word,
          correction: COMMON_SPELLING_ERRORS[cleanWord]
        });
      }
    });
    const spellingScore = Math.max(0, 2 - spellingErrors.length);

    // Check sentence spacing and capitalization grammar
    let grammarViolations = 0;
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    sentences.forEach(s => {
      const trimmed = s.trim();
      if (trimmed.length > 0) {
        if (trimmed[0] !== trimmed[0].toUpperCase()) {
          grammarViolations++;
        }
      }
    });
    if (text.trim().length > 0 && !/[.!?]$/.test(text.trim())) {
      grammarViolations++;
    }
    const grammarScore = Math.max(0, 2 - grammarViolations);
    
    // Total raw (max 8)
    const rawTotal = lengthScore + contentScore + spellingScore + grammarScore;
    const scaledScore = Math.round((rawTotal / 8) * 90);

    // Record progress
    this.recordScore("listening", scaledScore);
    this.markTaskCompleted(questionId, scaledScore);

    // Helper to replace text only, avoiding matching inside HTML tags
    const replaceTextOnly = (sourceText, searchWord, replacementTemplateFn) => {
      const parts = sourceText.split(/(<[^>]+>)/g);
      for (let i = 0; i < parts.length; i++) {
        if (!parts[i].startsWith('<')) {
          const escaped = searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, "gi");
          parts[i] = parts[i].replace(regex, replacementTemplateFn);
        }
      }
      return parts.join('');
    };

    let markedText = text;
    spellingErrors.forEach(err => {
      markedText = replaceTextOnly(markedText, err.error, (match) => `<span class="word-bad" title="Spelling error: replace with '${err.correction}'">${match}</span>`);
    });

    // Highlight matched keywords
    matchedKeywords.forEach(keyword => {
      markedText = replaceTextOnly(markedText, keyword, (match) => `<span class="word-good" style="font-weight:600; color:var(--accent);">${match}</span>`);
    });

    return {
      score: scaledScore,
      wordCount,
      matchedKeywords,
      subScores: {
        content: Math.round((contentScore / 2) * 90),
        spelling: Math.round((spellingScore / 2) * 90),
        grammar: Math.round((grammarScore / 2) * 90)
      },
      critiqueText: `Your response contains ${wordCount} words. You captured key lecture concepts including: ${matchedKeywords.slice(0, 4).join(', ')}. Keep grammatical structures clean to maintain accuracy.`,
      markedText
    };
  },

  // Grade Write from Dictation
  gradeWriteFromDictation(questionId, text) {
    const questions = this.getQuestions();
    const question = questions.listening.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const targetWords = question.modelAnswer.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    const userWords = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);

    let correctCount = 0;
    const details = [];

    targetWords.forEach(word => {
      const match = userWords.some(userW => this.areWordsSimilar(word, userW));
      if (match) correctCount++;
      details.push({ word, isCorrect: match });
    });

    const overall = targetWords.length > 0 ? Math.round((correctCount / targetWords.length) * 90) : 90;
    
    // Highlight words
    const marked = question.modelAnswer.split(/\s+/).map(word => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (userWords.some(userW => this.areWordsSimilar(clean, userW))) {
        return `<span class="word-good">${word}</span>`;
      } else {
        return `<span class="word-bad" title="Word omitted or misspelled">${word}</span>`;
      }
    }).join(' ');

    this.recordScore("listening", overall);
    this.markTaskCompleted(questionId, overall);

    return {
      score: overall,
      correctCount,
      maxScore: targetWords.length,
      modelAnswer: question.modelAnswer,
      markedText: marked,
      details
    };
  },

  // Grade Re-order Paragraphs
  gradeReorderParagraphs(questionId, userOrder) {
    const questions = this.getQuestions();
    const question = questions.reading.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const correctOrder = question.correctOrder;
    let scorePairs = 0;
    let maxPairs = correctOrder.length - 1;

    // Adjacent pairs matching
    for (let i = 0; i < userOrder.length - 1; i++) {
      const idxA = userOrder[i];
      const idxB = userOrder[i + 1];
      const correctIdxA = correctOrder.indexOf(idxA);
      if (correctIdxA !== -1 && correctOrder[correctIdxA + 1] === idxB) {
        scorePairs++;
      }
    }

    const overall = maxPairs > 0 ? Math.round((scorePairs / maxPairs) * 90) : 90;

    this.recordScore("reading", overall);
    this.markTaskCompleted(questionId, overall);

    return {
      score: overall,
      scorePairs,
      maxPairs,
      correctOrder
    };
  },

  // Grade Highlight Incorrect Words
  gradeHighlightIncorrect(questionId, selectedWordIndices) {
    const questions = this.getQuestions();
    const question = questions.listening.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const textWords = question.text.split(/\s+/);
    const spokenWords = question.spokenText.split(/\s+/);
    const incorrectIndices = [];

    textWords.forEach((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSpoken = spokenWords[idx] ? spokenWords[idx].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      if (cleanWord && cleanSpoken && cleanWord !== cleanSpoken) {
        incorrectIndices.push(idx);
      }
    });

    let correctClicks = 0;
    let incorrectClicks = 0;

    selectedWordIndices.forEach(idx => {
      if (incorrectIndices.includes(idx)) {
        correctClicks++;
      } else {
        incorrectClicks++;
      }
    });

    const rawScore = Math.max(0, correctClicks - incorrectClicks);
    const maxScore = incorrectIndices.length;
    const overall = maxScore > 0 ? Math.round((rawScore / maxScore) * 90) : 90;

    // Highlight text
    const marked = textWords.map((word, idx) => {
      const isSelected = selectedWordIndices.includes(idx);
      const isActualIncorrect = incorrectIndices.includes(idx);
      
      if (isSelected) {
        if (isActualIncorrect) {
          return `<span class="word-good" style="border-bottom: 2px solid var(--success);">${word}</span>`;
        } else {
          return `<span class="word-bad" style="border-bottom: 2px solid var(--error);">${word}</span>`;
        }
      } else if (isActualIncorrect) {
        return `<span style="border-bottom: 2px dashed var(--warning);" title="This word was incorrect in audio but not selected">${word}</span>`;
      }
      return word;
    }).join(' ');

    this.recordScore("listening", overall);
    this.markTaskCompleted(questionId, overall);

    return {
      score: overall,
      correctClicks,
      incorrectClicks,
      maxScore,
      markedText: marked,
      incorrectIndices
    };
  },

  // Grade Short Answer & Situation Responses
  gradeShortAnswer(questionId, userResponse) {
    const questions = this.getQuestions();
    let question = null;
    let skill = 'speaking';

    for (const cat of ['speaking', 'listening', 'writing', 'reading']) {
      const q = questions[cat].find(item => item.id === questionId);
      if (q) {
        question = q;
        skill = cat;
        break;
      }
    }

    if (!question) return { score: 0 };

    const cleanResponse = userResponse.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    const answers = question.correctAnswers || [question.modelAnswer];
    const isCorrect = answers.some(ans => cleanResponse.includes(ans.toLowerCase().replace(/[^a-z0-9\s]/g, '')));
    const score = isCorrect ? 90 : 20; // some points for effort

    this.recordScore(skill, score);
    this.markTaskCompleted(questionId, score);

    return {
      score,
      isCorrect,
      correctAnswers: answers,
      modelAnswer: question.modelAnswer || answers[0]
    };
  },

  /* ==========================================================================
     OPENAI ASYNCHRONOUS API ENGINES
     ========================================================================== */
  
  async gradeListeningFIBAsync(questionId, answers) {
    return Promise.resolve(this.gradeListeningFIB(questionId, answers));
  },

  async gradeWritingEssayAsync(questionId, text) {
    const hasKey = localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key');
    if (!hasKey) {
      // Fall back to offline simulation
      return Promise.resolve(this.gradeWritingEssay(questionId, text));
    }

    const questions = this.getQuestions();
    const question = questions.writing.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const systemPrompt = `You are a certified Pearson PTE Academic grading AI engine.
Analyze the following argumentative student response written for the prompt:
"${question.prompt}"

Evaluate it strictly based on PTE criteria:
1. Content (relevance to prompt)
2. Grammar (syntactic correctness)
3. Spelling (typos)
4. Vocabulary / Lexical Range (diversity and academic terms)

You MUST respond with a single, valid JSON object matching the following structure:
{
  "score": 78,
  "wordCount": 242,
  "subScores": {
    "grammar": 80,
    "spelling": 85,
    "vocabulary": 75,
    "content": 72
  },
  "spellingErrors": [
    { "error": "misspelled_word", "correction": "correction", "type": "spelling" }
  ],
  "grammarSuggestions": [
    { "text": "incorrect sentence text", "correction": "capitalization or punctuation suggestion", "type": "grammar" }
  ],
  "synonyms": [
    { "original": "weak_word", "alternatives": ["strong_synonym_1", "strong_synonym_2"] }
  ],
  "markedText": "Original text markup containing word annotations, e.g. replacing 'misspelled' with '<span class=\\"word-bad\\" title=\\"Spelling error: replace with \\'correct\\'\\">misspelled</span>' and advanced words with '<span class=\\"word-good\\" title=\\"Advanced vocabulary\\">advanced</span>'"
}

Ensure markedText contains the exact student essay with HTML spans:
- Use <span class="word-bad" title="Spelling error: replace with '...'">(misspelled word)</span> for spelling mistakes.
- Use <span class="word-good" title="Advanced vocabulary">(advanced word)</span> for strong academic words.
Return ONLY the JSON string. Do not include markdown code block tags (\`\`\`json).`;

    try {
      const resultText = await this.callLLM(systemPrompt, text, true);
      const parsed = this.parseCleanJson(resultText);

      // Record progress
      this.recordScore("writing", parsed.score);
      await this.markTaskCompleted(questionId, parsed.score);

      return parsed;
    } catch (err) {
      console.error("AI grading failed, running offline simulation backup.", err);
      return this.gradeWritingEssay(questionId, text);
    }
  },

  async gradeListeningSSTAsync(questionId, text) {
    const hasKey = localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key');
    if (!hasKey) {
      return Promise.resolve(this.gradeListeningSST(questionId, text));
    }

    const questions = this.getQuestions();
    const question = questions.listening.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    const systemPrompt = `You are a certified Pearson PTE Academic grading AI engine.
Analyze the following student summary written for the agricultural subsidies lecture:
"${question.lectureText}"

Evaluate it strictly based on PTE criteria:
1. Content (incorporation of key concepts like subsidies, monoculture, ecological practices)
2. Grammar & Structure
3. Spelling accuracy
4. Word length constraints (strictly 50-70 words)

You MUST respond with a single, valid JSON object matching the following structure:
{
  "score": 80,
  "wordCount": 58,
  "matchedKeywords": ["subsidies", "monoculture", "ecological"],
  "subScores": {
    "content": 80,
    "spelling": 90,
    "grammar": 80
  },
  "critiqueText": "Detailed feedback summary...",
  "markedText": "Original text markup with highlights for good vocab/errors using <span class=\\"word-good\\">...</span> or <span class=\\"word-bad\\">...</span>"
}
Return ONLY the JSON string. Do not include markdown code block tags (\`\`\`json).`;

    try {
      const resultText = await this.callLLM(systemPrompt, text, true);
      const parsed = this.parseCleanJson(resultText);

      // Record progress
      this.recordScore("listening", parsed.score);
      await this.markTaskCompleted(questionId, parsed.score);

      return parsed;
    } catch (err) {
      console.error("AI grading failed, running offline simulation backup.", err);
      return this.gradeListeningSST(questionId, text);
    }
  },

  async gradeSpeakingReadAloudAsync(questionId, audioBlob, offlineTranscript) {
    const openaiApiKey = localStorage.getItem('openai_api_key');
    const geminiApiKey = localStorage.getItem('gemini_api_key');

    if (!openaiApiKey && !geminiApiKey) {
      return Promise.resolve(this.gradeSpeakingReadAloud(questionId, offlineTranscript));
    }

    const questions = this.getQuestions();
    const question = questions.speaking.find(q => q.id === questionId);
    if (!question) return { score: 0 };

    let transcriptText = '';

    if (openaiApiKey && audioBlob) {
      try {
        let extension = 'webm';
        if (audioBlob.type) {
          if (audioBlob.type.includes('wav')) extension = 'wav';
          else if (audioBlob.type.includes('mp4')) extension = 'mp4';
          else if (audioBlob.type.includes('mpeg')) extension = 'mp3';
          else if (audioBlob.type.includes('ogg')) extension = 'ogg';
        }

        const formData = new FormData();
        formData.append('file', audioBlob, `speaking.${extension}`);
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          transcriptText = data.text || '';
        }
      } catch (err) {
        console.error("Whisper transcription failed, falling back to browser offline transcript", err);
      }
    } else if (geminiApiKey && audioBlob) {
      try {
        const base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        let mimeType = audioBlob.type || 'audio/webm';
        if (mimeType.includes(';')) {
          mimeType = mimeType.split(';')[0];
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Audio
                  }
                },
                {
                  text: "You are an expert audio transcription engine. Please transcribe the attached speaking audio response exactly as spoken, with no other commentary. Output ONLY the raw transcript text. If nothing is spoken or there is only noise, return an empty string."
                }
              ]
            }]
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.candidates?.[0]?.content?.parts?.[0]?.text) {
            transcriptText = resJson.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (geminiTranscribeErr) {
        console.error("Gemini transcription failed", geminiTranscribeErr);
      }
    }

    if (!transcriptText && offlineTranscript) {
      transcriptText = offlineTranscript;
    }

    if (!transcriptText.trim()) {
      return this.gradeSpeakingReadAloud(questionId, offlineTranscript);
    }

    try {
      // 2. Build custom prompt based on taskType
      const type = question.taskType || 'read-aloud';
      let taskTitle = "Speaking: Read Aloud";
      let criteriaText = `Compare the student's transcribed spoken text against the target reference text they were asked to read aloud.
Target Reference Text:
"${question.text}"
Evaluate strictly on content (percentage of target words correctly spoken in correct sequence), pronunciation (clarity, phonetic accuracy), and oral fluency (continuous natural pacing, minimal hesitations).`;

      if (type === 'repeat-sentence') {
        taskTitle = "Speaking: Repeat Sentence";
        criteriaText = `Compare the student's transcribed spoken text against the target reference sentence they heard and were asked to repeat.
Target Reference Text:
"${question.text}"
Evaluate strictly on content (3 points if all words repeated in sequence, 2 points if >50% words in sequence, 1 point if >0% words in sequence, 0 points if no match), pronunciation, and oral fluency.`;
      } else if (type === 'describe-image') {
        taskTitle = "Speaking: Describe Image";
        criteriaText = `Evaluate the student's spoken response describing a diagram.
Diagram Description: "${question.text}"
Model Answer Reference: "${question.modelAnswer}"
Evaluate content (identifying main features, variables, relationships, and a logical summary/conclusion), pronunciation, and oral fluency.`;
      } else if (type === 'retell-lecture' || type === 'group-discussion') {
        taskTitle = `Speaking: ${type === 'retell-lecture' ? 'Re-tell Lecture' : 'Summarize Group Discussion'}`;
        criteriaText = `Evaluate the student's spoken response summarizing a lecture/discussion.
Lecture Key Details: "${question.text}"
Model Answer Reference: "${question.modelAnswer}"
Evaluate content (identifying key concepts, supporting details, relationships, and a logical summary), pronunciation, and oral fluency.`;
      } else if (type === 'respond-situation') {
        taskTitle = "Speaking: Respond to a Situation";
        criteriaText = `Evaluate the student's spoken response to a given situation description.
Situation Scenario: "${question.text}"
Model Answer Reference: "${question.modelAnswer}"
Evaluate content (relevance to prompt context, politeness, addressing all required aspects, and providing a clear resolution), pronunciation, and oral fluency.`;
      }

      const systemPrompt = `You are a certified Pearson PTE Academic grading AI engine specializing in ${taskTitle}.
${criteriaText}

You MUST respond with a single, valid JSON object matching the following structure:
{
  "score": 82,
  "pronunciation": 80,
  "fluency": 85,
  "content": 82,
  "markedText": "Reference text containing HTML span highlights representing student speech accuracy relative to the prompt (or model answer if no prompt text exists): use <span class=\\"word-good\\">word</span> for correct, <span class=\\"word-warn\\" title=\\"Hesitation, substitution, or slight mispronunciation\\">word</span> for substituted or hesitant words, and <span class=\\"word-bad\\" title=\\"Omitted or completely mispronounced\\">word</span> for completely omitted or mispronounced words. Ensure the punctuation and casing of the original reference text remains exactly the same.",
  "tips": [
    "Pronunciation was mostly accurate, but focus on the plural ending in 'ecosystems'.",
    "Fluency was strong. Avoid pauses in the middle of noun phrases."
  ]
}

Return ONLY the JSON string. Do not include markdown code block tags (\`\`\`json).`;

      try {
        const resultText = await this.callLLM(systemPrompt, `Spoken Transcript: "${transcriptText}"`, true);
        const parsed = this.parseCleanJson(resultText);

        // Record progress
        this.recordScore("speaking", parsed.score);
        await this.markTaskCompleted(questionId, parsed.score);
        
        return parsed;
      } catch (parseErr) {
        console.error("JSON parsing of GPT response failed, falling back to local heuristic matching.", parseErr);
      }

      // 3. Fallback Heuristics matching if GPT response parsing fails
      const targetTextForMatch = type === 'repeat-sentence' || type === 'read-aloud' ? question.text : (question.modelAnswer || question.text);
      const targetWords = targetTextForMatch.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      const spokenWords = transcriptText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

      let matches = 0;
      targetWords.forEach(word => {
        if (spokenWords.some(spoken => this.areWordsSimilar(word, spoken))) matches++;
      });

      const contentPct = targetWords.length > 0 ? (matches / targetWords.length) : 0;
      const contentScore = Math.round(contentPct * 90);
      const seed = questionId.charCodeAt(questionId.length - 1) % 15;
      const pronScore = Math.round(75 + (seed % 10) * contentPct);
      const fluencyScore = Math.round(78 + (seed % 12) * contentPct - 2);
      const overall = Math.round((pronScore + fluencyScore + contentScore) / 3);

      const marked = targetTextForMatch.split(' ').map(word => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (spokenWords.some(spoken => this.areWordsSimilar(clean, spoken))) {
          return `<span class="word-good">${word}</span>`;
        } else {
          return `<span class="word-bad" title="Word omitted or mispronounced during speaking task">${word}</span>`;
        }
      }).join(' ');

      this.recordScore("speaking", overall);
      await this.markTaskCompleted(questionId, overall);

      return {
        score: overall,
        pronunciation: pronScore,
        fluency: fluencyScore,
        content: contentScore,
        markedText: marked,
        tips: [
          ...question.tips,
          `Speech recognition matched ${matches} of ${targetWords.length} target words correctly. Keep your pronunciation accurate.`
        ]
      };

    } catch (err) {
      console.error("OpenAI Whisper speaking evaluation failed, running simulated grader.", err);
      return this.gradeSpeakingReadAloud(questionId, offlineTranscript);
    }
  },

  // Grade Answer Short Question (with Whisper/Gemini transcription)
  async gradeShortAnswerAsync(questionId, audioBlob, offlineTranscript) {
    const openaiApiKey = localStorage.getItem('openai_api_key');
    const geminiApiKey = localStorage.getItem('gemini_api_key');
    let transcriptText = offlineTranscript || '';

    if (openaiApiKey && audioBlob) {
      try {
        let extension = 'webm';
        if (audioBlob.type) {
          if (audioBlob.type.includes('wav')) extension = 'wav';
          else if (audioBlob.type.includes('mp4')) extension = 'mp4';
          else if (audioBlob.type.includes('mpeg')) extension = 'mp3';
          else if (audioBlob.type.includes('ogg')) extension = 'ogg';
        }

        const formData = new FormData();
        formData.append('file', audioBlob, `speaking.${extension}`);
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          transcriptText = data.text || '';
        }
      } catch (e) {
        console.error("Whisper short question transcription failed, using offline", e);
      }
    } else if (geminiApiKey && audioBlob) {
      try {
        const base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        let mimeType = audioBlob.type || 'audio/webm';
        if (mimeType.includes(';')) {
          mimeType = mimeType.split(';')[0];
        }
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Audio
                  }
                },
                {
                  text: "You are an audio transcription engine. Please transcribe the attached speaking audio response exactly as spoken, with no other commentary. Output ONLY the raw transcript text. If nothing is spoken or there is only noise, return an empty string."
                }
              ]
            }]
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.candidates?.[0]?.content?.parts?.[0]?.text) {
            transcriptText = resJson.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (e) {
        console.error("Gemini short question transcription failed, using offline", e);
      }
    }

    return this.gradeShortAnswer(questionId, transcriptText);
  },

  /* Helpers */
  recordScore(skill, score) {
    const progress = this.getProgress();
    const lastHistory = progress.scoreHistory[progress.scoreHistory.length - 1];
    
    // Update daily overall average
    const newHistory = [...progress.scoreHistory];
    const today = new Date().toLocaleDateString([], { month: 'short', day: '2-digit' });
    
    // Create new log or update today's log
    const index = newHistory.findIndex(h => h.date === today);
    if (index !== -1) {
      newHistory[index][skill] = Math.round((newHistory[index][skill] + score) / 2);
      newHistory[index].overall = Math.round((newHistory[index].speaking + newHistory[index].writing + newHistory[index].reading + newHistory[index].listening) / 4);
    } else {
      const newEntry = {
        date: today,
        speaking: lastHistory.speaking,
        writing: lastHistory.writing,
        reading: lastHistory.reading,
        listening: lastHistory.listening,
        overall: 0
      };
      newEntry[skill] = score;
      newEntry.overall = Math.round((newEntry.speaking + newEntry.writing + newEntry.reading + newEntry.listening) / 4);
      
      // Keep history limited to last 6 entries
      if (newHistory.length >= 6) {
        newHistory.shift();
      }
      newHistory.push(newEntry);
    }
    
    progress.scoreHistory = newHistory;
    progress.points += 25;
    this.updateProgress(progress);
  },

  async markTaskCompleted(questionId, score = null) {
    const progress = this.getProgress();
    const targetScore = progress.targetScore || 65;

    // If score is provided, check if score >= targetScore
    const isCleared = (score !== null) ? (score >= targetScore) : true;

    if (isCleared) {
      // Clear it from the database forever!
      const questions = this.getQuestions();
      let deleted = false;
      for (const cat of ['speaking', 'writing', 'reading', 'listening']) {
        const index = questions[cat].findIndex(q => q.id === questionId);
        if (index !== -1) {
          questions[cat].splice(index, 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        this.safeSaveQuestions(questions);
        document.dispatchEvent(new CustomEvent('questions-updated'));
        console.log(`Question ${questionId} cleared and deleted forever (score ${score} >= target ${targetScore})`);
      }

      // Add to completed, remove from uncleared
      if (!progress.completedTasks.includes(questionId)) {
        progress.completedTasks.push(questionId);
      }
      if (progress.unclearedTasks) {
        progress.unclearedTasks = progress.unclearedTasks.filter(id => id !== questionId);
      }
    } else {
      // If it is not cleared (has mistakes), save it to Uncleared!
      if (!progress.unclearedTasks) {
        progress.unclearedTasks = [];
      }
      if (!progress.unclearedTasks.includes(questionId)) {
        progress.unclearedTasks.push(questionId);
      }
      // Remove from completedTasks
      progress.completedTasks = progress.completedTasks.filter(id => id !== questionId);
      
      console.log(`Question ${questionId} not cleared (score ${score} < target ${targetScore}). Stored in study list.`);

      // Rename it with AI in background
      try {
        await this.renameQuestionWithAI(questionId);
      } catch (err) {
        console.error("Failed to rename uncleared question", err);
      }
    }

    this.updateProgress(progress);
  },

  addNewSessionQuestion() {
    if (!sessionStorage.getItem('aspire_session_started')) {
      sessionStorage.setItem('aspire_session_started', 'true');
      this.generateAndAppendNewQuestion();
    }
  },

  async generateAndAppendNewQuestion(targetTaskType = null, currentQuestionId = null) {
    const getSkillFromTaskType = (type) => {
      if (['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'short-question', 'group-discussion', 'respond-situation'].includes(type)) {
        return 'speaking';
      }
      if (['write-essay', 'summarize-written'].includes(type)) {
        return 'writing';
      }
      if (['fib-dropdown', 'mcq-multiple-reading', 'reorder-paragraphs', 'fib-drag-drop', 'mcq-single-reading'].includes(type)) {
        return 'reading';
      }
      if (['summarize-spoken', 'mcq-multiple-listening', 'fib-listening', 'highlight-summary', 'mcq-single-listening', 'missing-word', 'highlight-incorrect', 'write-dictation'].includes(type)) {
        return 'listening';
      }
      return null;
    };

    const questions = this.getQuestions();
    let parentSkill = 'speaking';
    let specificType = targetTaskType;

    if (targetTaskType) {
      parentSkill = getSkillFromTaskType(targetTaskType) || 'speaking';
    } else {
      const skills = ['speaking', 'writing', 'reading', 'listening'];
      parentSkill = skills[Math.floor(Math.random() * skills.length)];
      const parentQs = questions[parentSkill] || [];
      if (parentQs.length > 0) {
        specificType = parentQs[Math.floor(Math.random() * parentQs.length)].taskType;
      } else {
        specificType = 'read-aloud';
      }
    }

    const progress = this.getProgress();
    const completed = progress.completedTasks || [];

    // 1. Try backup questions first
    const backupList = BACKUP_QUESTIONS[parentSkill] || [];
    for (const q of backupList) {
      if (q.taskType === specificType) {
        const exists = questions[parentSkill].some(existing => existing.id === q.id);
        const isCompleted = completed.includes(q.id);
        if (!exists && !isCompleted) {
          questions[parentSkill].push(q);
          this.safeSaveQuestions(questions);
          console.log(`Appended backup question ${q.id} of type ${specificType} to ${parentSkill}`);
          document.dispatchEvent(new CustomEvent('questions-updated'));
          return q;
        }
      }
    }

    const apiKey = localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      console.log("No API key configured. Generating a brand new procedural question...");
      const newProceduralQ = this.generateProceduralQuestion(specificType);
      if (newProceduralQ) {
        const activeQs = this.getQuestions();
        activeQs[parentSkill].push(newProceduralQ);
        this.safeSaveQuestions(activeQs);
        console.log(`Successfully generated and appended procedural question: ${newProceduralQ.id}`);
        document.dispatchEvent(new CustomEvent('questions-updated'));
        return newProceduralQ;
      }
      
      console.log("Procedural generation failed. Fallback to cycling existing questions.");
      const sameTypeQs = questions[parentSkill].filter(q => q.taskType === specificType);
      const catQs = sameTypeQs.length > 0 ? sameTypeQs : (questions[parentSkill] || []);
      if (catQs.length > 0) {
        let candidates = catQs.filter(q => !completed.includes(q.id));
        if (currentQuestionId) {
          candidates = candidates.filter(q => q.id !== currentQuestionId);
        }
        if (candidates.length === 0) {
          // Fallback if all are completed: cycle through any except current
          candidates = catQs;
          if (currentQuestionId) {
            candidates = catQs.filter(q => q.id !== currentQuestionId);
            if (candidates.length === 0) {
              candidates = catQs;
            }
          }
        }
        const chosenQ = candidates[Math.floor(Math.random() * candidates.length)];
        return chosenQ;
      }
      return null;
    }

    console.log(`Generating a new dynamic question via OpenAI for type ${specificType}...`);
    try {
      let schemaPrompt = "";
      if (specificType === 'read-aloud') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Read Aloud: [Add Title]",
  "difficulty": "medium",
  "prepTime": 40,
  "readTime": 40,
  "text": "A paragraph of 50-70 words to read aloud...",
  "modelAnswer": "Same paragraph text...",
  "tips": ["Stress nouns", "Pause at commas"],
  "taskType": "read-aloud"
}`;
      } else if (specificType === 'repeat-sentence') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Repeat Sentence: [Add Title]",
  "difficulty": "medium",
  "text": "A simple sentence of 8-15 words to repeat...",
  "tips": ["Listen to the intonation", "Speak clearly"],
  "taskType": "repeat-sentence"
}`;
      } else if (specificType === 'describe-image') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Describe Image: [Add Title]",
  "difficulty": "medium",
  "text": "Describe the details of this image...",
  "tips": ["Identify trends", "Mention highest values"],
  "taskType": "describe-image"
}`;
      } else if (specificType === 'retell-lecture') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Re-Tell Lecture: [Add Title]",
  "difficulty": "medium",
  "lectureText": "A short lecture text to retell...",
  "tips": ["Take notes of keywords", "Summarize core points"],
  "taskType": "retell-lecture"
}`;
      } else if (specificType === 'short-question') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Answer Short Question: [Add Title]",
  "difficulty": "easy",
  "questionText": "A simple general knowledge question...",
  "correctAnswers": ["answer1", "answer2"],
  "tips": ["Give a short direct answer"],
  "taskType": "short-question"
}`;
      } else if (specificType === 'group-discussion') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Summarize Group Discussion: [Add Title]",
  "difficulty": "medium",
  "lectureText": "A group discussion text...",
  "tips": ["Note different viewpoints"],
  "taskType": "group-discussion"
}`;
      } else if (specificType === 'respond-situation') {
        schemaPrompt = `{
  "id": "SP-NEW-\${Date.now()}",
  "title": "Respond to a Situation: [Add Title]",
  "difficulty": "medium",
  "text": "A situation description prompt...",
  "tips": ["Speak politely and professionally"],
  "taskType": "respond-situation"
}`;
      } else if (specificType === 'write-essay') {
        schemaPrompt = `{
  "id": "WR-NEW-\${Date.now()}",
  "title": "Write Essay: [Add Title]",
  "difficulty": "medium",
  "timeLimit": 1200,
  "prompt": "An essay topic to argue for/against...",
  "minWords": 200,
  "maxWords": 300,
  "tips": ["Structure paragraphs", "State clear examples"],
  "taskType": "write-essay"
}`;
      } else if (specificType === 'summarize-written') {
        schemaPrompt = `{
  "id": "WR-NEW-\${Date.now()}",
  "title": "Summarize Written Text: [Add Title]",
  "difficulty": "medium",
  "prompt": "A text of 150-200 words to summarize in one sentence...",
  "minWords": 5,
  "maxWords": 75,
  "tips": ["Write exactly ONE sentence", "Use conjunctions"],
  "taskType": "summarize-written"
}`;
      } else if (specificType === 'fib-dropdown' || specificType === 'fib-drag-drop') {
        schemaPrompt = `{
  "id": "RD-NEW-\${Date.now()}",
  "title": "Fill in the Blanks: [Add Title]",
  "difficulty": "medium",
  "paragraphHTML": "Text with <span class='blank-box' data-index='0'></span> and <span class='blank-box' data-index='1'></span>...",
  "correctAnswers": ["word1", "word2"],
  "wordsPool": ["word1", "word2", "distractor1", "distractor2", "distractor3"],
  "explanations": {
    "0": "Explanation for blank 0",
    "1": "Explanation for blank 1"
  },
  "taskType": "\${specificType}"
}`;
      } else if (specificType === 'reorder-paragraphs') {
        schemaPrompt = `{
  "id": "RD-NEW-\${Date.now()}",
  "title": "Re-order Paragraphs: [Add Title]",
  "difficulty": "medium",
  "paragraphs": ["Paragraph 1", "Paragraph 2", "Paragraph 3", "Paragraph 4"],
  "correctOrder": [0, 1, 2, 3],
  "tips": ["Identify the introductory sentence"],
  "taskType": "reorder-paragraphs"
}`;
      } else if (specificType === 'summarize-spoken') {
        schemaPrompt = `{
  "id": "LS-NEW-\${Date.now()}",
  "title": "Summarize Spoken Text: [Add Title]",
  "difficulty": "medium",
  "timeLimit": 600,
  "lectureText": "A lecture text to summarize in 50-70 words...",
  "keywords": ["keyword1", "keyword2"],
  "minWords": 50,
  "maxWords": 70,
  "tips": ["Include key lecture points"],
  "taskType": "summarize-spoken"
}`;
      } else if (specificType === 'fib-listening') {
        schemaPrompt = `{
  "id": "LS-NEW-\${Date.now()}",
  "title": "Fill in the Blanks: [Add Title]",
  "difficulty": "medium",
  "text": "The full spoken text...",
  "gappedText": "Text with <span class='gap-input' data-index='0'></span> and <span class='gap-input' data-index='1'></span>...",
  "correctAnswers": ["word1", "word2"],
  "tips": ["Type exact words heard"],
  "taskType": "fib-listening"
}`;
      } else if (specificType === 'highlight-incorrect') {
        schemaPrompt = `{
  "id": "LS-NEW-\${Date.now()}",
  "title": "Highlight Incorrect Words: [Add Title]",
  "difficulty": "medium",
  "text": "The correct written text...",
  "spokenText": "The modified spoken text with some words replaced...",
  "incorrectWords": ["word1", "word2"],
  "correctReplacements": ["word1_spoken", "word2_spoken"],
  "tips": ["Read along with speech"],
  "taskType": "highlight-incorrect"
}`;
      } else if (specificType === 'write-dictation') {
        schemaPrompt = `{
  "id": "LS-NEW-\${Date.now()}",
  "title": "Write from Dictation: [Add Title]",
  "difficulty": "medium",
  "text": "Academic integrity is fundamental to the university experience.",
  "modelAnswer": "Academic integrity is fundamental to the university experience.",
  "tips": ["Type exactly what you hear, maintaining correct spelling and punctuation."],
  "taskType": "write-dictation"
}`;
      } else {
        schemaPrompt = `{
  "id": "LS-NEW-\${Date.now()}",
  "title": "MCQ: [Add Title]",
  "difficulty": "medium",
  "questionText": "The question prompt...",
  "lectureText": "Optional lecture text...",
  "options": ["Option 1", "Option 2", "Option 3"],
  "correctAnswers": ["Option 1"],
  "tips": ["Eliminate clearly wrong answers"],
  "taskType": "\${specificType}"
}`;
      }

      const systemPrompt = `You are an expert PTE Academic curriculum developer.
Generate a new, high-quality practice question object matching this schema for the specific taskType: "${specificType}":
${schemaPrompt}

Return ONLY a valid JSON object matching the schema. Do not include markdown code block tags (\`\`\`json).`;

      const resultText = await this.callLLM(systemPrompt, "", true);
      const parsed = this.parseCleanJson(resultText);
      
      if (parsed.id && parsed.title) {
        const activeQuestions = this.getQuestions();
        activeQuestions[parentSkill].push(parsed);
        this.safeSaveQuestions(activeQuestions);
        console.log(`Successfully generated and appended custom question: ${parsed.id}`);
        document.dispatchEvent(new CustomEvent('questions-updated'));
        return parsed;
      }
    } catch (err) {
      console.error("Failed to generate custom question via OpenAI", err);
      throw err;
    }

    // Fallback if OpenAI failed
    const sameTypeQs = questions[parentSkill].filter(q => q.taskType === specificType);
    const catQs = sameTypeQs.length > 0 ? sameTypeQs : (questions[parentSkill] || []);
    if (catQs.length > 0) {
      const progress = this.getProgress();
      const completed = progress.completedTasks || [];
      let candidates = catQs.filter(q => !completed.includes(q.id));
      if (currentQuestionId) {
        candidates = candidates.filter(q => q.id !== currentQuestionId);
      }
      if (candidates.length === 0) {
        // Fallback: if all completed, cycle through any except current
        candidates = catQs;
        if (currentQuestionId) {
          candidates = catQs.filter(q => q.id !== currentQuestionId);
          if (candidates.length === 0) {
            candidates = catQs;
          }
        }
      }
      const chosenQ = candidates[Math.floor(Math.random() * candidates.length)];
      return chosenQ;
    }
    return null;
  },

  async markQuestionUncleared(questionId, isUncleared) {
    const progress = this.getProgress();
    if (!progress.unclearedTasks) {
      progress.unclearedTasks = [];
    }

    if (isUncleared) {
      if (!progress.unclearedTasks.includes(questionId)) {
        progress.unclearedTasks.push(questionId);
      }
      // Remove from completed
      progress.completedTasks = progress.completedTasks.filter(id => id !== questionId);
      this.updateProgress(progress);

      // Rename question with AI
      await this.renameQuestionWithAI(questionId);
    } else {
      progress.unclearedTasks = progress.unclearedTasks.filter(id => id !== questionId);
      this.updateProgress(progress);

      // Delete forever from database!
      const questions = this.getQuestions();
      let deleted = false;
      for (const cat of ['speaking', 'writing', 'reading', 'listening']) {
        const index = questions[cat].findIndex(q => q.id === questionId);
        if (index !== -1) {
          questions[cat].splice(index, 1);
          deleted = true;
          break;
        }
      }
      if (deleted) {
        this.safeSaveQuestions(questions);
        console.log(`Question ${questionId} manually cleared and deleted forever!`);
      }
      document.dispatchEvent(new CustomEvent('questions-updated'));
    }
  },

  async renameQuestionWithAI(questionId) {
    const questions = this.getQuestions();
    let questionObj = null;
    let foundCat = null;
    for (const cat of ['speaking', 'writing', 'reading', 'listening']) {
      const q = questions[cat].find(item => item.id === questionId);
      if (q) {
        questionObj = q;
        foundCat = cat;
        break;
      }
    }

    if (!questionObj) return;

    let contentText = "";
    if (foundCat === 'speaking') {
      contentText = questionObj.text || "";
    } else if (foundCat === 'writing') {
      contentText = questionObj.prompt || "";
    } else if (foundCat === 'reading') {
      contentText = questionObj.paragraphHTML || "";
    } else if (foundCat === 'listening') {
      contentText = questionObj.lectureText || "";
    }

    const hasKey = localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key');
    let generatedName = "";

    if (hasKey) {
      try {
        const systemPrompt = `You are a helpful assistant. Given a PTE practice task, generate a very short, concise topic name (maximum 4 words) describing what this question is about.
For example, if it's about coastal ecosystems and tourism, return 'Coastal Ecosystems'.
If it's about geothermal heat pump schematic, return 'Geothermal Heat Pump'.
If it's about remote work shifts and collaboration, return 'Remote Work'.

Return ONLY the plain text title, nothing else. No markdown, no quotes, no extra characters.`;

        const resultText = await this.callLLM(systemPrompt, `Task Prompt:\n${contentText || questionObj.title}`, false);
        generatedName = resultText.trim().replace(/^["']|["']$/g, '');
      } catch (err) {
        console.error("Failed to rename question with AI", err);
      }
    }

    if (!generatedName) {
      const cleaned = questionObj.title.replace(/^(Uncleared:\s*|Read Aloud:\s*|Write Essay:\s*|Fill in the Blanks:\s*|Summarize Spoken Text:\s*|Describe Image:\s*)/i, '');
      generatedName = cleaned;
    }

    // Keep prefix if appropriate
    let prefix = "";
    if (foundCat === 'speaking') prefix = "Read Aloud";
    else if (foundCat === 'writing') prefix = "Write Essay";
    else if (foundCat === 'reading') prefix = "Fill in the Blanks";
    else if (foundCat === 'listening') prefix = "Summarize Spoken Text";

    questionObj.title = `${prefix ? prefix + ': ' : ''}Uncleared ${generatedName}`;
    this.safeSaveQuestions(questions);
    document.dispatchEvent(new CustomEvent('questions-updated'));
  },

  bulkSeedQuestions(countPerCategory) {
    const questions = this.getQuestions();
    const skills = ['speaking', 'writing', 'reading', 'listening'];
    const taskTypesMap = {
      speaking: ['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'short-question'],
      writing: ['write-essay', 'summarize-written'],
      reading: ['fib-dropdown', 'reorder-paragraphs', 'fib-drag-drop'],
      listening: ['summarize-spoken', 'write-dictation', 'highlight-incorrect', 'fib-listening']
    };

    skills.forEach(skill => {
      const types = taskTypesMap[skill];
      const existingCount = questions[skill] ? questions[skill].length : 0;
      if (!questions[skill]) questions[skill] = [];
      const needed = Math.max(0, countPerCategory - existingCount);
      
      const now = Date.now();
      for (let i = 0; i < needed; i++) {
        const type = types[i % types.length];
        const newQ = this.generateProceduralQuestion(type);
        if (newQ) {
          newQ.id = `SEEDED-${type.toUpperCase().substring(0, 3)}-${now}-${i}`;
          questions[skill].push(newQ);
        }
      }
    });

    this.safeSaveQuestions(questions);
    document.dispatchEvent(new CustomEvent('questions-updated'));
  },

  resetQuestions() {
    this.safeSaveQuestions(DEFAULT_QUESTIONS);
    this.bulkSeedQuestions(2000);
    document.dispatchEvent(new CustomEvent('questions-updated'));
  },

  /* ==========================================================================
     SUBSCRIPTION & PAYMENT MANAGEMENT
     ========================================================================== */

  // Subscription plan constants
  PLANS: {
    FREE: 'free',
    PRO: 'pro',
    ELITE: 'elite'
  },

  // Get current user subscription
  getSubscription() {
    try {
      const sub = localStorage.getItem('aspire_subscription');
      if (sub) {
        const parsed = JSON.parse(sub);
        // Check if subscription is still valid (not expired)
        if (parsed.status === 'active') {
          return parsed;
        }
      }
      return { plan: 'free', billingCycle: null, status: 'active', startDate: null };
    } catch (e) {
      console.warn('Error reading subscription:', e);
      return { plan: 'free', billingCycle: null, status: 'active', startDate: null };
    }
  },

  // Set/update subscription
  setSubscription(planId, billingCycle) {
    const subscription = {
      plan: planId,
      billingCycle: billingCycle,
      startDate: new Date().toISOString(),
      status: 'active',
      // Calculate next billing date
      nextBillingDate: billingCycle === 'yearly' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('aspire_subscription', JSON.stringify(subscription));
    document.dispatchEvent(new CustomEvent('subscription-changed', { detail: subscription }));
    return subscription;
  },

  // Cancel subscription (reverts to free)
  cancelSubscription() {
    const subscription = {
      plan: 'free',
      billingCycle: null,
      status: 'active',
      startDate: null
    };
    localStorage.setItem('aspire_subscription', JSON.stringify(subscription));
    document.dispatchEvent(new CustomEvent('subscription-changed', { detail: subscription }));
    return subscription;
  },

  // Check if a feature requires a premium plan
  isPremiumFeature(feature) {
    const sub = this.getSubscription();
    const premiumFeatures = {
      'ai-scoring': ['pro', 'elite'],
      'mock-tests': ['pro', 'elite'],
      'unlimited-practice': ['pro', 'elite'],
      'study-resources': ['elite'],
      'unlimited-mocks': ['elite'],
      'priority-feedback': ['elite'],
      'tutor-sessions': ['elite'],
      'custom-study-plans': ['elite'],
      'exam-strategies': ['elite']
    };
    const requiredPlans = premiumFeatures[feature];
    if (!requiredPlans) return true; // Feature not restricted
    return requiredPlans.includes(sub.plan);
  },

  // Get plan display info
  getPlanInfo(planId) {
    const plans = {
      free: { name: 'Free', color: '#64748B', icon: '🆓', badge: 'Free Plan' },
      pro: { name: 'Pro', color: '#1396e2', icon: '⚡', badge: 'Pro Plan' },
      elite: { name: 'Elite', color: '#8B5CF6', icon: '👑', badge: 'Elite Plan' }
    };
    return plans[planId] || plans.free;
  }
};

