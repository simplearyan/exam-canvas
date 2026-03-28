import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, BookOpen, CheckCircle, AlertCircle, 
  GraduationCap, LogOut, ChevronRight, ChevronLeft, 
  Award, FileText, User, XCircle, BarChart3, Bookmark,
  AlertTriangle, Settings, Plus, Edit3, Trash2, Save,
  Eye, ListChecks, Shuffle, Copy, ArrowUp, ArrowDown,
  Folder, Calendar, Lock, Unlock, Presentation, PenTool,
  Square, Circle, Minus, MousePointer2, Eraser, MoveRight, Trash
} from 'lucide-react';

// --- Mock Database for IITM Subjects and Questions ---
const INITIAL_EXAM_DATA = [
  {
    id: 'cs101',
    name: 'Programming in Python',
    code: 'CS101',
    duration: 15,
    totalMarks: 40,
    questions: [
      { id: 1, text: "Which of the following is an immutable data type in Python?", options: ["List", "Dictionary", "Set", "Tuple"], answer: 3, solution: "In Python, Tuples are immutable, meaning their elements cannot be changed after they are created. Lists, Dictionaries, and Sets are mutable." },
      { id: 2, text: "What is the output of `print(2 ** 3 ** 2)`?", options: ["64", "512", "4096", "None of the above"], answer: 1, solution: "Exponentiation `**` is evaluated from right to left in Python. So, `2 ** 3 ** 2` is evaluated as `2 ** (3 ** 2)` -> `2 ** 9` -> `512`." },
      { id: 3, text: "Which keyword is used to create a function in Python?", options: ["function", "def", "fun", "create"], answer: 1, solution: "The `def` keyword is used to declare a function in Python." },
      { id: 4, text: "What does the `len()` function do?", options: ["Returns the memory size of an object", "Returns the number of items in an object", "Returns the largest item in an iterable", "Converts a string to a list"], answer: 1, solution: "The `len()` function returns the length (number of items) of an object like a string, list, tuple, etc." }
    ]
  },
  {
    id: 'ma101',
    name: 'Mathematics for Data Science I',
    code: 'MA101',
    duration: 20,
    totalMarks: 40,
    questions: [
      { id: 1, text: "What is the derivative of $f(x) = e^x$?", options: ["$x \\cdot e^{x-1}$", "$e^x$", "$\\ln(x)$", "$\\frac{1}{x}$"], answer: 1, solution: "The exponential function $e^x$ is unique because its derivative is exactly itself. Therefore, $\\frac{d}{dx} e^x = e^x$." },
      { id: 2, text: "What is the determinant of an identity matrix of size $n \\times n$?", options: ["$0$", "$n$", "$1$", "$n!$"], answer: 2, solution: "The determinant of any identity matrix $I_n$ is the product of its diagonal elements, which are all $1$. Thus, $\\det(I) = 1$." },
      { id: 3, text: "If two events $A$ and $B$ are independent, what is $P(A \\cap B)$?", options: ["$P(A) + P(B)$", "$P(A) - P(B)$", "$P(A) \\cdot P(B)$", "$\\frac{P(A)}{P(B)}$"], answer: 2, solution: "By definition of independent events, the probability of both occurring is the product of their individual probabilities: $P(A \\cap B) = P(A)P(B)$." },
      { id: 4, text: "Evaluate the limit: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$$", options: ["$0$", "$1$", "$\\infty$", "Undefined"], answer: 1, solution: "This is a fundamental trigonometric limit. As $x$ approaches $0$, the value of $\\frac{\\sin(x)}{x}$ approaches $1$." }
    ]
  },
  {
    id: 'ct101',
    name: 'Computational Thinking',
    code: 'CT101',
    duration: 10,
    totalMarks: 30,
    questions: [
      { id: 1, text: "Which of these is NOT a pillar of computational thinking?", options: ["Decomposition", "Pattern Recognition", "Memorization", "Abstraction"], answer: 2, solution: "The 4 pillars of computational thinking are Decomposition, Pattern Recognition, Abstraction, and Algorithmic Thinking. Memorization is not one of them." },
      { id: 2, text: "What is a pseudo-code?", options: ["A programming language", "A way to write algorithms using English-like statements", "A compiler error", "Machine level code"], answer: 1, solution: "Pseudo-code is a detailed yet readable description of what a computer program or algorithm must do, expressed in a formally-styled natural language rather than in a programming language." },
      { id: 3, text: "Which sorting algorithm repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Insertion Sort"], answer: 2, solution: "Bubble Sort works by repeatedly swapping the adjacent elements if they are in the wrong order." }
    ]
  }
];

const INITIAL_MOCK_EXAMS = [
  {
    id: 'mock_q1_2024',
    name: 'Quiz 1 - 2024',
    examCode: 'MOCK-Q1-24',
    examType: 'Mock Practice',
    subjectIds: ['cs101', 'ma101'],
    submissionRule: 'anytime' 
  },
  {
    id: 'mock_q2_2025_sept',
    name: 'Quiz 2 - 2025 Sept',
    examCode: 'MOCK-Q2-25',
    examType: 'Mock Practice',
    subjectIds: ['cs101', 'ct101'],
    submissionRule: 'last_10_mins'
  },
  {
    id: 'mock_end_term',
    name: 'End Term Exam',
    examCode: 'END-TERM-25',
    examType: 'Term Exam',
    subjectIds: ['cs101', 'ma101', 'ct101'],
    submissionRule: 'auto_only'
  },
  {
    id: 'mock_q1_2025_aug',
    name: 'Quiz 1 - 2025 Aug',
    examCode: 'MOCK-Q1-25A',
    examType: 'Quiz',
    subjectIds: ['ma101', 'ct101'],
    submissionRule: 'anytime'
  },
  {
    id: 'mock_q1_mar',
    name: 'Quiz 1 - Mar',
    examCode: 'MOCK-Q1-MAR',
    examType: 'Quiz',
    subjectIds: ['cs101'],
    submissionRule: 'auto_only'
  }
];

// --- Helper Component to Render LaTeX seamlessly ---
const LatexRenderer = ({ text, isReady, className="" }) => {
  const containerRef = useRef(null);
  
  const safeText = text !== undefined && text !== null ? String(text) : "";

  useEffect(() => {
    if (isReady && window.renderMathInElement && containerRef.current) {
      window.renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false,
      });
    }
  }, [safeText, isReady]);

  return <span key={safeText} ref={containerRef} className={className}>{safeText}</span>;
};

// --- Modern Whiteboard Engine Component ---
const WhiteboardOverlay = ({ isEnabled, qId, tool, color, strokeWidth, elementsMap, setElementsMap }) => {
  const canvasRef = useRef(null);
  const [roughReady, setRoughReady] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [rc, setRc] = useState(null);

  // Load rough.js dynamically
  useEffect(() => {
    if (window.rough) {
      setRoughReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/roughjs@latest/bundled/rough.js';
    document.body.appendChild(script);
    script.onload = () => setRoughReady(true);
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (roughReady && canvasRef.current && isEnabled) {
      const canvas = canvasRef.current;
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redraw();
      };
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      
      setRc(window.rough.canvas(canvas));
      
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [roughReady, isEnabled, qId]); // Re-bind on qId change

  // Force redraw when elements or current path changes
  useEffect(() => {
      redraw();
  }, [elementsMap, currentPath, qId, rc]);

  const redraw = () => {
      if (!rc || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const elements = elementsMap[qId] || [];
      
      // Draw saved elements
      elements.forEach(el => {
          if (el.type === 'pen' || el.type === 'eraser') {
              ctx.beginPath();
              ctx.moveTo(el.points[0].x, el.points[0].y);
              for (let i = 1; i < el.points.length; i++) {
                  ctx.lineTo(el.points[i].x, el.points[i].y);
              }
              if(el.type === 'eraser') {
                  ctx.globalCompositeOperation = 'destination-out';
                  ctx.strokeStyle = 'rgba(0,0,0,1)';
                  ctx.lineWidth = el.strokeWidth * 5;
              } else {
                  ctx.globalCompositeOperation = 'source-over';
                  ctx.strokeStyle = el.color;
                  ctx.lineWidth = el.strokeWidth;
              }
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.stroke();
              ctx.globalCompositeOperation = 'source-over'; // Reset
          } else {
             drawRoughElement(el);
          }
      });

      // Draw current path in progress
      if (currentPath) {
          if (currentPath.type === 'pen' || currentPath.type === 'eraser') {
              ctx.beginPath();
              ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
              for (let i = 1; i < currentPath.points.length; i++) {
                  ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
              }
              if(currentPath.type === 'eraser') {
                  ctx.globalCompositeOperation = 'destination-out';
                  ctx.strokeStyle = 'rgba(0,0,0,1)';
                  ctx.lineWidth = currentPath.strokeWidth * 5;
              } else {
                  ctx.globalCompositeOperation = 'source-over';
                  ctx.strokeStyle = currentPath.color;
                  ctx.lineWidth = currentPath.strokeWidth;
              }
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.stroke();
              ctx.globalCompositeOperation = 'source-over';
          } else {
              drawRoughElement(currentPath);
          }
      }
  };

  const drawRoughElement = (el) => {
      // By passing the saved seed, RoughJS will reliably redraw the exact same squiggles every time, preventing jitter!
      const roughOptions = { 
          stroke: el.color, 
          strokeWidth: el.strokeWidth, 
          roughness: 1.5, 
          bowing: 1,
          seed: el.seed || 1 
      };
      
      if (el.type === 'line') {
          rc.line(el.x1, el.y1, el.x2, el.y2, roughOptions);
      } else if (el.type === 'rectangle') {
          rc.rectangle(el.x1, el.y1, el.x2 - el.x1, el.y2 - el.y1, roughOptions);
      } else if (el.type === 'ellipse') {
          rc.ellipse(el.x1 + (el.x2-el.x1)/2, el.y1 + (el.y2-el.y1)/2, Math.abs(el.x2-el.x1), Math.abs(el.y2-el.y1), roughOptions);
      } else if (el.type === 'arrow') {
          const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
          const headlen = 15 + (el.strokeWidth * 2); 
          rc.line(el.x1, el.y1, el.x2, el.y2, roughOptions);
          rc.line(el.x2, el.y2, el.x2 - headlen * Math.cos(angle - Math.PI / 6), el.y2 - headlen * Math.sin(angle - Math.PI / 6), roughOptions);
          rc.line(el.x2, el.y2, el.x2 - headlen * Math.cos(angle + Math.PI / 6), el.y2 - headlen * Math.sin(angle + Math.PI / 6), roughOptions);
      }
  };

  const getCoordinates = (e) => {
      if (e.touches && e.touches.length > 0) {
          return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
  };

  const handlePointerDown = (e) => {
      if (tool === 'pointer') return;
      const rect = canvasRef.current.getBoundingClientRect();
      const coords = getCoordinates(e);
      const x = coords.clientX - rect.left;
      const y = coords.clientY - rect.top;
      setIsDrawing(true);

      // Generate a static seed for the shape immediately on mousedown
      const seed = Math.floor(Math.random() * 2147483648);

      if (tool === 'pen' || tool === 'eraser') {
          setCurrentPath({ type: tool, points: [{x, y}], color, strokeWidth });
      } else {
          setCurrentPath({ type: tool, x1: x, y1: y, x2: x, y2: y, color, strokeWidth, seed });
      }
  };

  const handlePointerMove = (e) => {
      if (!isDrawing || tool === 'pointer') return;
      const rect = canvasRef.current.getBoundingClientRect();
      const coords = getCoordinates(e);
      const x = coords.clientX - rect.left;
      const y = coords.clientY - rect.top;

      if (tool === 'pen' || tool === 'eraser') {
          setCurrentPath(prev => ({ ...prev, points: [...prev.points, {x, y}] }));
      } else {
          setCurrentPath(prev => ({ ...prev, x2: x, y2: y }));
      }
  };

  const handlePointerUp = () => {
      if (tool === 'pointer' || !isDrawing) return;
      setIsDrawing(false);
      if (currentPath) {
          const newElements = [...(elementsMap[qId] || []), currentPath];
          setElementsMap({ ...elementsMap, [qId]: newElements });
          setCurrentPath(null);
      }
  };

  if (!isEnabled) return null;

  return (
      <div className="absolute inset-0 z-[60] pointer-events-none">
          {/* Canvas covers the whole question panel */}
          <canvas 
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseOut={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onTouchCancel={handlePointerUp}
              className={`w-full h-full absolute inset-0 touch-none ${tool === 'pointer' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
          />
      </div>
  );
};

export default function IITMExamPortal() {
  // Global App State
  const [role, setRole] = useState('student'); 
  const [examData, setExamData] = useState(INITIAL_EXAM_DATA);
  const [mockExams, setMockExams] = useState(INITIAL_MOCK_EXAMS);
  const [screen, setScreen] = useState('dashboard'); 
  const [katexReady, setKatexReady] = useState(false);
  
  // Teacher State
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingMockExam, setEditingMockExam] = useState(null);

  // Whiteboard State
  const [wbTool, setWbTool] = useState('pointer');
  const [wbColor, setWbColor] = useState('#ef4444');
  const [wbStrokeWidth, setWbStrokeWidth] = useState(3);
  const [wbElementsMap, setWbElementsMap] = useState({});

  useEffect(() => {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        if (data.examData) setExamData(data.examData);
        if (data.mockExams) setMockExams(data.mockExams);
        if (data.whiteboardData) setWbElementsMap(data.whiteboardData);
      })
      .catch(err => console.error("Could not load data.json", err));
  }, []);

  // Student State
  const [activeMockExam, setActiveMockExam] = useState(null);
  const [subject, setSubject] = useState(null); 
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [globalAnswers, setGlobalAnswers] = useState({}); 
  const [globalVisited, setGlobalVisited] = useState({}); 
  const [globalReview, setGlobalReview] = useState({});   
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // Modals & Popups
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Computed state for current subject and active mock
  const currentAnswers = subject ? (globalAnswers[subject.id] || {}) : {};
  const currentVisited = subject ? (globalVisited[subject.id] || {}) : {};
  const currentReview = subject ? (globalReview[subject.id] || {}) : {};
  const activeMockExamSubjects = activeMockExam ? examData.filter(s => activeMockExam.subjectIds.includes(s.id)) : [];

  // --- Dynamic KaTeX Loader ---
  useEffect(() => {
    if (document.getElementById('katex-css')) {
      setKatexReady(true);
      return;
    }
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'katex-js';
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      const autoRender = document.createElement('script');
      autoRender.id = 'katex-auto-render';
      autoRender.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
      document.head.appendChild(autoRender);
      autoRender.onload = () => setKatexReady(true);
    };
  }, []);

  // --- Anti-Cheat Logic (Proctoring) ---
  useEffect(() => {
    if (role !== 'student' || screen !== 'exam' || isReviewMode) return;

    const preventDefaultActions = (e) => e.preventDefault();
    const handleVisibilityChange = () => {
      // Don't trigger if they are just on the submit confirmation modal
      if (document.hidden && !showSubmitConfirm) setWarningCount((prev) => prev + 1);
    };

    document.addEventListener('contextmenu', preventDefaultActions);
    document.addEventListener('copy', preventDefaultActions);
    document.addEventListener('cut', preventDefaultActions);
    document.addEventListener('paste', preventDefaultActions);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', preventDefaultActions);
      document.removeEventListener('copy', preventDefaultActions);
      document.removeEventListener('cut', preventDefaultActions);
      document.removeEventListener('paste', preventDefaultActions);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [screen, role, isReviewMode, showSubmitConfirm]);

  useEffect(() => {
    if (role === 'student' && screen === 'exam' && !isReviewMode && warningCount > 0) {
      if (warningCount >= 3) {
        submitExam();
        alert("Your exam has been automatically submitted due to navigating away from the window multiple times.");
      } else {
        setShowWarningModal(true);
      }
    }
  }, [warningCount, screen, role, isReviewMode]);

  // --- Timer Logic ---
  useEffect(() => {
    let timer;
    // Pause timer if warning modal or submit confirmation modal is open
    if (screen === 'exam' && !isReviewMode && role === 'student' && timeLeft > 0 && !showWarningModal && !showSubmitConfirm) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (screen === 'exam' && !isReviewMode && role === 'student' && timeLeft === 0 && !showWarningModal && subject) {
      submitExam();
    }
    return () => clearInterval(timer);
  }, [screen, timeLeft, showWarningModal, showSubmitConfirm, isReviewMode, subject, role]);

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Role Switching ---
  function toggleRole() {
    if (role === 'student') {
        setRole('teacher');
        setScreen('admin-dashboard');
    } else {
        setRole('student');
        setScreen('dashboard');
        setIsReviewMode(false);
        setActiveMockExam(null);
    }
  }

  // --- Student Handlers ---
  function handleMockSelect(mock) {
    setActiveMockExam(mock);
    const mockSubjects = examData.filter(sub => mock.subjectIds.includes(sub.id));
    if(mockSubjects.length > 0) {
        setSubject(mockSubjects[0]);
        setScreen('instructions');
    } else {
        alert("This mock exam currently has no valid subjects configured.");
    }
  }

  function startExam() {
    if (!globalVisited[subject.id]) {
      setGlobalVisited({ ...globalVisited, [subject.id]: { [subject.questions[0]?.id]: true } });
    }
    setCurrentQIndex(0);
    setIsReviewMode(false);
    
    if (timeLeft === 0) {
        const totalDurationMins = activeMockExamSubjects.reduce((acc, sub) => acc + sub.duration, 0);
        setTimeLeft(totalDurationMins * 60);
    }
    setScreen('exam');
  }

  function startReviewMode() {
      setIsReviewMode(true);
      setCurrentQIndex(0);
      setScreen('exam');
  }

  function switchSubject(newSubjectId) {
    const newSub = examData.find(s => s.id === newSubjectId);
    if (newSub) {
      setSubject(newSub);
      setCurrentQIndex(0);
      setGlobalVisited({ 
          ...globalVisited, 
          [newSub.id]: { ...(globalVisited[newSub.id] || {}), [newSub.questions[0]?.id]: true } 
      });
    }
  }

  function handleOptionSelect(optIndex) {
    if (isReviewMode || role === 'teacher') return;
    const qId = subject.questions[currentQIndex].id;
    setGlobalAnswers({
        ...globalAnswers,
        [subject.id]: { ...currentAnswers, [qId]: optIndex }
    });
  }

  function clearResponse() {
    if (isReviewMode || role === 'teacher') return;
    const qId = subject.questions[currentQIndex].id;
    const newSubAnswers = { ...currentAnswers };
    delete newSubAnswers[qId];
    setGlobalAnswers({ ...globalAnswers, [subject.id]: newSubAnswers });
  }

  function toggleReview() {
      const qId = subject.questions[currentQIndex].id;
      setGlobalReview({
          ...globalReview,
          [subject.id]: { ...currentReview, [qId]: !currentReview[qId] }
      });
  }

  function navigateQuestion(index) {
    setCurrentQIndex(index);
    setGlobalVisited({
        ...globalVisited,
        [subject.id]: { ...currentVisited, [subject.questions[index].id]: true }
    });
  }

  function nextQuestion() {
    if (currentQIndex < subject.questions.length - 1) {
      navigateQuestion(currentQIndex + 1);
    }
  }

  function prevQuestion() {
    if (currentQIndex > 0) {
      navigateQuestion(currentQIndex - 1);
    }
  }

  function submitExam() {
    let calculatedScore = 0;
    let totalMarksAll = 0;

    activeMockExamSubjects.forEach(sub => {
        totalMarksAll += sub.totalMarks;
        const subAnswers = globalAnswers[sub.id] || {};
        sub.questions.forEach((q) => {
          if (subAnswers[q.id] === q.answer) {
              calculatedScore += (sub.totalMarks / sub.questions.length);
          }
        });
    });

    setScore(calculatedScore);
    setShowWarningModal(false); 
    setShowSubmitConfirm(false);
    setSubject({...subject, globalTotalMarks: totalMarksAll}); 
    setScreen('result');
  }

  function getQuestionStatus(qId) {
    if (currentAnswers[qId] !== undefined) return currentReview[qId] ? 'answered-review' : 'answered';
    if (currentVisited[qId]) return currentReview[qId] ? 'review' : 'unanswered';
    return 'not-visited';
  }

  // --- Teacher / Admin Handlers ---
  function startTeacherMockPreview(mock) {
      setActiveMockExam(mock);
      const mockSubjects = examData.filter(s => mock.subjectIds.includes(s.id));
      if (mockSubjects.length > 0) {
          setSubject(mockSubjects[0]);
          setCurrentQIndex(0);
          setScreen('exam');
      } else {
          alert("This mock exam has no subjects to preview.");
      }
  }

  function startTeacherSubjectPreview(sub) {
      // Create a temporary mock object to reuse the same exam UI components flawlessly
      const tempMock = {
          id: 'temp_preview',
          name: `${sub.name}`,
          examCode: sub.code,
          examType: 'Instructor Preview',
          subjectIds: [sub.id],
          submissionRule: 'anytime'
      };
      setActiveMockExam(tempMock);
      setSubject(sub);
      setCurrentQIndex(0);
      setScreen('exam');
  }

  function handleEditSubject(sub) {
      setEditingSubject({...sub});
      setScreen('admin-subject');
  }

  function handleCreateSubject() {
      setEditingSubject({
          id: `sub_${Date.now()}`,
          name: 'New Subject',
          code: 'CODE101',
          duration: 30,
          totalMarks: 50,
          questions: []
      });
      setScreen('admin-subject');
  }

  function saveSubject() {
      const existingIdx = examData.findIndex(s => s.id === editingSubject.id);
      let newData = [...examData];
      if (existingIdx >= 0) newData[existingIdx] = editingSubject;
      else newData.push(editingSubject);
      setExamData(newData);
      setScreen('admin-dashboard');
  }

  function deleteSubject(id) {
      if(!window.confirm("Delete this entire subject?")) return;
      setExamData(examData.filter(s => s.id !== id));
      const updatedMocks = mockExams.map(mock => ({
          ...mock,
          subjectIds: mock.subjectIds.filter(sid => sid !== id)
      }));
      setMockExams(updatedMocks);
  }

  function handleEditQuestion(q) {
      setEditingQuestion({...q});
      setScreen('admin-question');
  }

  function handleCreateQuestion() {
      setEditingQuestion({
          id: Date.now(),
          text: 'New Question Text',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 0,
          solution: 'Explanation goes here.'
      });
      setScreen('admin-question');
  }

  function saveQuestion() {
      let updatedQuestions = [...editingSubject.questions];
      const existingIdx = updatedQuestions.findIndex(q => q.id === editingQuestion.id);
      
      if (existingIdx >= 0) updatedQuestions[existingIdx] = editingQuestion;
      else updatedQuestions.push(editingQuestion);

      setEditingSubject({...editingSubject, questions: updatedQuestions});
      setScreen('admin-subject');
  }

  function deleteQuestion(id) {
      if(!window.confirm("Delete this question?")) return;
      setEditingSubject({
          ...editingSubject, 
          questions: editingSubject.questions.filter(q => q.id !== id)
      });
  }

  function moveQuestionUp(index) {
      if (index === 0) return;
      const newQuestions = [...editingSubject.questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      setEditingSubject({ ...editingSubject, questions: newQuestions });
  }

  function moveQuestionDown(index) {
      if (index === editingSubject.questions.length - 1) return;
      const newQuestions = [...editingSubject.questions];
      [newQuestions[index + 1], newQuestions[index]] = [newQuestions[index], newQuestions[index + 1]];
      setEditingSubject({ ...editingSubject, questions: newQuestions });
  }

  function shuffleCurrentQuestions() {
      let shuffledQs = [...editingSubject.questions];
      for (let i = shuffledQs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQs[i], shuffledQs[j]] = [shuffledQs[j], shuffledQs[i]];
      }
      setEditingSubject({ ...editingSubject, questions: shuffledQs });
  }

  function handleCreateVariant() {
      if (!editingSubject.questions || editingSubject.questions.length === 0) {
          alert("Add some questions first before creating a variant!");
          return;
      }
      
      let shuffledQs = [...editingSubject.questions];
      for (let i = shuffledQs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQs[i], shuffledQs[j]] = [shuffledQs[j], shuffledQs[i]];
      }

      const variantCode = `${editingSubject.code}-V${Math.floor(Math.random() * 90) + 10}`;
      const newVariant = {
          ...editingSubject,
          id: `sub_${Date.now()}`,
          name: `${editingSubject.name} (Variant)`,
          code: variantCode,
          questions: shuffledQs
      };

      setExamData([...examData, newVariant]);
      alert(`Shuffled variant created successfully!\nNew Code: ${variantCode}`);
      setScreen('admin-dashboard');
  }

  // Admin Mock Handlers
  function handleCreateMockExam() {
      setEditingMockExam({
          id: `mock_${Date.now()}`,
          name: 'New Mock Exam',
          examCode: 'MOCK-NEW',
          examType: 'Mock Practice',
          subjectIds: [],
          submissionRule: 'anytime'
      });
      setScreen('admin-mock');
  }

  function handleEditMockExam(mock) {
      setEditingMockExam({...mock});
      setScreen('admin-mock');
  }

  function deleteMockExam(id) {
      if(!window.confirm("Delete this mock exam configuration?")) return;
      setMockExams(mockExams.filter(m => m.id !== id));
  }

  function saveMockExam() {
      if(editingMockExam.subjectIds.length === 0) {
          alert("Please select at least one subject for this mock exam.");
          return;
      }
      const existingIdx = mockExams.findIndex(m => m.id === editingMockExam.id);
      let newData = [...mockExams];
      if (existingIdx >= 0) newData[existingIdx] = editingMockExam;
      else newData.push(editingMockExam);
      setMockExams(newData);
      setScreen('admin-dashboard');
  }

  function toggleSubjectInMock(subjectId) {
      const currentIds = [...editingMockExam.subjectIds];
      if (currentIds.includes(subjectId)) {
          setEditingMockExam({ ...editingMockExam, subjectIds: currentIds.filter(id => id !== subjectId) });
      } else {
          setEditingMockExam({ ...editingMockExam, subjectIds: [...currentIds, subjectId] });
      }
  }

  function exportDatabase() {
      const payload = {
          examData,
          mockExams,
          whiteboardData: wbElementsMap
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      URL.revokeObjectURL(url);
  }

  // --- UI Screens : TEACHER / ADMIN ---

  const renderAdminDashboard = () => (
      <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 md:p-10 mb-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-2xl md:text-4xl font-black mb-2 flex items-center"><Settings className="mr-3 w-8 h-8 text-blue-400" /> Instructor Dashboard</h2>
                  <p className="text-slate-300 font-medium">Configure Mock Exams, build Subjects, and manage questions.</p>
              </div>
              <button onClick={exportDatabase} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-transform active:scale-95 whitespace-nowrap">
                  <Save className="w-5 h-5 mr-3" /> Export Database (JSON)
              </button>
          </div>

          {/* MOCK EXAMS CONFIGURATION */}
          <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
                      <Folder className="mr-3 text-indigo-600 w-6 h-6 md:w-7 md:h-7" /> Mock Exam Configurations
                  </h3>
                  <button onClick={handleCreateMockExam} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm transition text-sm">
                      <Plus className="w-4 h-4 mr-2" /> Create Mock Exam
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockExams.map(mock => {
                      const subs = examData.filter(s => mock.subjectIds.includes(s.id));
                      const totalQ = subs.reduce((acc, curr) => acc + curr.questions.length, 0);
                      const totalD = subs.reduce((acc, curr) => acc + curr.duration, 0);
                      
                      let ruleLabel = "Submit Anytime";
                      let ruleColor = "bg-green-100 text-green-800 border-green-200";
                      let RuleIcon = Unlock;
                      if (mock.submissionRule === 'last_10_mins') { ruleLabel = "Last 10 Mins Only"; ruleColor = "bg-yellow-100 text-yellow-800 border-yellow-200"; RuleIcon = Clock; }
                      if (mock.submissionRule === 'auto_only') { ruleLabel = "Auto Submit Only"; ruleColor = "bg-red-100 text-red-800 border-red-200"; RuleIcon = Lock; }

                      return (
                      <div key={mock.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col group">
                          <div className="h-2 bg-indigo-600 w-full group-hover:bg-indigo-500 transition-colors"></div>
                          <div className="p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-col space-y-1.5">
                                      <span className="bg-indigo-50 text-indigo-800 text-xs font-black px-2 py-1 rounded uppercase border border-indigo-100 w-max">
                                          {mock.examType || 'Mock Exam'}
                                      </span>
                                      <span className="text-xs font-bold text-gray-500">{mock.examCode}</span>
                                  </div>
                                  <div className="flex space-x-2">
                                      <button onClick={() => handleEditMockExam(mock)} className="text-gray-400 hover:text-indigo-600 transition" title="Edit Configurations"><Edit3 className="w-4 h-4" /></button>
                                      <button onClick={() => deleteMockExam(mock.id)} className="text-gray-400 hover:text-red-600 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3 mt-1">{mock.name}</h4>
                              <div className="space-y-1.5 mb-4">
                                  <div className="text-sm text-gray-500 flex items-center"><ListChecks className="w-4 h-4 mr-2 text-gray-400" /> {totalQ} Total Questions | {subs.length} Sections</div>
                                  <div className="text-sm text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {totalD} Mins Total Duration</div>
                              </div>
                              <div className={`mt-auto text-xs font-bold px-2.5 py-1.5 rounded-md border flex items-center w-max mb-3 ${ruleColor}`}>
                                  <RuleIcon className="w-3.5 h-3.5 mr-1.5" /> {ruleLabel}
                              </div>
                              <button 
                                  onClick={() => startTeacherMockPreview(mock)}
                                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2 rounded-lg transition-all duration-300 shadow-sm text-sm flex justify-center items-center"
                              >
                                  <Presentation className="w-4 h-4 mr-2" /> Classroom Preview
                              </button>
                          </div>
                      </div>
                  )})}
              </div>
          </div>

          <hr className="my-10 border-gray-200" />

          {/* SUBJECTS BANK */}
          <div>
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
                      <BookOpen className="mr-3 text-blue-600 w-6 h-6 md:w-7 md:h-7" /> Subject Bank
                  </h3>
                  <button onClick={handleCreateSubject} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm transition text-sm">
                      <Plus className="w-4 h-4 mr-2" /> Create Subject
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examData.map(sub => (
                      <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                          <div className="p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="bg-blue-50 text-blue-800 text-xs font-black px-2 py-1 rounded uppercase border border-blue-100">{sub.code}</span>
                                  <div className="flex space-x-2">
                                      <button onClick={() => handleEditSubject(sub)} className="text-gray-400 hover:text-blue-600 transition" title="Edit Subject"><Edit3 className="w-4 h-4" /></button>
                                      <button onClick={() => deleteSubject(sub.id)} className="text-gray-400 hover:text-red-600 transition" title="Delete Subject"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">{sub.name}</h4>
                              <div className="text-sm text-gray-500 flex items-center mb-1"><ListChecks className="w-4 h-4 mr-2 text-gray-400" /> {sub.questions.length} Questions</div>
                              <div className="text-sm text-gray-500 flex items-center mb-2"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {sub.duration} Mins | {sub.totalMarks} Marks</div>
                              
                              <div className="mt-auto pt-4 border-t border-gray-100">
                                  <button 
                                      onClick={() => startTeacherSubjectPreview(sub)}
                                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2 rounded-lg transition-all duration-300 shadow-sm text-sm flex justify-center items-center"
                                  >
                                      <Presentation className="w-4 h-4 mr-2" /> Classroom Preview
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderAdminMockEdit = () => (
      <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
              <div className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center"><Folder className="w-5 h-5 mr-2" /> Mock Exam Configurator</h3>
                  <div className="flex space-x-3">
                      <button onClick={() => setScreen('admin-dashboard')} className="text-indigo-200 hover:text-white font-medium px-2 py-1">Cancel</button>
                      <button onClick={saveMockExam} className="bg-white text-indigo-900 hover:bg-gray-100 px-4 py-1.5 rounded font-bold text-sm flex items-center transition shadow-sm">
                          <Save className="w-4 h-4 mr-2" /> Save Config
                      </button>
                  </div>
              </div>
              
              <div className="p-6 space-y-6">
                  {/* Mock Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">Mock Exam Name</label>
                          <input type="text" value={editingMockExam.name} onChange={e => setEditingMockExam({...editingMockExam, name: e.target.value})} className="w-full border border-gray-300 rounded p-3 focus:ring-indigo-500 focus:border-indigo-500 font-medium" placeholder="E.g. Quiz 1 - 2024" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">Exam Code</label>
                          <input type="text" value={editingMockExam.examCode || ''} onChange={e => setEditingMockExam({...editingMockExam, examCode: e.target.value})} className="w-full border border-gray-300 rounded p-3 focus:ring-indigo-500 focus:border-indigo-500 font-medium uppercase" placeholder="E.g. MOCK-Q1-24" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">Exam Type</label>
                          <select 
                              value={editingMockExam.examType || 'Mock Practice'} 
                              onChange={e => setEditingMockExam({...editingMockExam, examType: e.target.value})}
                              className="w-full border border-gray-300 rounded p-3 focus:ring-indigo-500 font-medium text-gray-700 bg-white"
                          >
                              <option value="Mock Practice">Mock Practice</option>
                              <option value="Quiz">Quiz</option>
                              <option value="Term Exam">Term Exam</option>
                              <option value="Assignment">Assignment</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">Submission Policy</label>
                          <select 
                              value={editingMockExam.submissionRule} 
                              onChange={e => setEditingMockExam({...editingMockExam, submissionRule: e.target.value})}
                              className="w-full border border-gray-300 rounded p-3 focus:ring-indigo-500 font-medium text-gray-700 bg-white"
                          >
                              <option value="anytime">Open (Can submit anytime)</option>
                              <option value="last_10_mins">Restricted (Submit only in last 10 minutes)</option>
                              <option value="auto_only">Strict (Auto-submits only at end of timer)</option>
                          </select>
                      </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Subject Selection */}
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Bundle Subjects</label>
                      <p className="text-xs text-gray-500 mb-4">Select the subjects to include in this mock exam. The total duration and marks will be aggregated automatically.</p>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                          {examData.length === 0 && <div className="text-gray-400 italic">No subjects available in the bank. Create a subject first.</div>}
                          {examData.map(sub => {
                              const isSelected = editingMockExam.subjectIds.includes(sub.id);
                              return (
                                  <label key={sub.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                      <input 
                                          type="checkbox" 
                                          checked={isSelected}
                                          onChange={() => toggleSubjectInMock(sub.id)}
                                          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mr-4"
                                      />
                                      <div className="flex-1">
                                          <div className="font-bold text-gray-900">{sub.name} <span className="ml-2 text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase">{sub.code}</span></div>
                                          <div className="text-xs text-gray-500 mt-1">{sub.questions.length} Questions | {sub.duration} Mins | {sub.totalMarks} Marks</div>
                                      </div>
                                  </label>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderAdminSubjectEdit = () => (
      <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">Edit Subject Details</h3>
                  <div className="flex space-x-3">
                      <button onClick={handleCreateVariant} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center transition" title="Create a shuffled copy of this exam">
                          <Copy className="w-4 h-4 mr-2" /> Create Variant
                      </button>
                      <button onClick={saveSubject} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center transition">
                          <Save className="w-4 h-4 mr-2" /> Save Subject
                      </button>
                  </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject Name</label>
                      <input type="text" value={editingSubject.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 font-medium" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject Code</label>
                      <input type="text" value={editingSubject.code} onChange={e => setEditingSubject({...editingSubject, code: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 font-medium uppercase" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Minutes)</label>
                      <input type="number" value={editingSubject.duration} onChange={e => setEditingSubject({...editingSubject, duration: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 font-medium" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
                      <input type="number" value={editingSubject.totalMarks} onChange={e => setEditingSubject({...editingSubject, totalMarks: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 font-medium" />
                  </div>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">Questions ({editingSubject.questions.length})</h3>
                  <div className="flex space-x-3">
                      <button onClick={shuffleCurrentQuestions} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold text-sm flex items-center transition" title="Randomly re-order these questions">
                          <Shuffle className="w-4 h-4 mr-2" /> Shuffle
                      </button>
                      <button onClick={handleCreateQuestion} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center transition">
                          <Plus className="w-4 h-4 mr-2" /> Add Question
                      </button>
                  </div>
              </div>
              <div className="p-0">
                  {editingSubject.questions.length === 0 && <p className="p-6 text-gray-500 text-center">No questions added yet.</p>}
                  {editingSubject.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start">
                          <div className="flex space-x-1 md:space-x-2 mr-3 shrink-0 pt-0.5">
                              <button onClick={() => moveQuestionUp(idx)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 bg-white border border-gray-200 rounded shadow-sm transition" title="Move Up"><ArrowUp className="w-3 h-3 md:w-4 md:h-4" /></button>
                              <button onClick={() => moveQuestionDown(idx)} disabled={idx === editingSubject.questions.length - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 bg-white border border-gray-200 rounded shadow-sm transition" title="Move Down"><ArrowDown className="w-3 h-3 md:w-4 md:h-4" /></button>
                          </div>
                          <div className="flex-1 pr-4">
                              <span className="font-bold text-gray-800 mr-2">Q{idx+1}.</span>
                              <span className="text-gray-600"><LatexRenderer text={q.text} isReady={katexReady} /></span>
                          </div>
                          <div className="flex space-x-2 shrink-0">
                              <button onClick={() => handleEditQuestion(q)} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded shadow-sm transition"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded shadow-sm transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderAdminQuestionEdit = () => (
      <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center"><Edit3 className="w-5 h-5 mr-2" /> Question Editor</h3>
                  <div className="flex space-x-3">
                      <button onClick={() => setScreen('admin-subject')} className="text-gray-300 hover:text-white font-medium px-2 py-1">Cancel</button>
                      <button onClick={saveQuestion} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold text-sm flex items-center transition">
                          <Save className="w-4 h-4 mr-2" /> Save
                      </button>
                  </div>
              </div>
              
              <div className="p-6 space-y-6">
                  {/* Question Text */}
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Question Text (Supports KaTeX via $ or $$)</label>
                      <textarea rows="3" value={editingQuestion.text} onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})} className="w-full border border-gray-300 rounded p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g., What is $x^2$?" />
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 shadow-inner">
                          <strong className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Live Preview</strong>
                          <LatexRenderer text={editingQuestion.text || "Type above to preview..."} isReady={katexReady} />
                      </div>
                  </div>

                  {/* Options */}
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Options & Correct Answer</label>
                      <div className="space-y-3">
                          {editingQuestion.options.map((opt, idx) => (
                              <div key={idx} className="flex items-start space-x-3 bg-gray-50 p-3 rounded border border-gray-200">
                                  <input 
                                      type="radio" 
                                      name="correct_answer" 
                                      checked={editingQuestion.answer === idx}
                                      onChange={() => setEditingQuestion({...editingQuestion, answer: idx})}
                                      className="mt-3 w-5 h-5 accent-blue-600 cursor-pointer"
                                  />
                                  <div className="flex-1">
                                      <input 
                                          type="text" 
                                          value={opt} 
                                          onChange={e => {
                                              let newOpts = [...editingQuestion.options];
                                              newOpts[idx] = e.target.value;
                                              setEditingQuestion({...editingQuestion, options: newOpts});
                                          }} 
                                          className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 text-sm mb-2" 
                                          placeholder={`Option ${String.fromCharCode(65+idx)}`}
                                      />
                                      <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100"><LatexRenderer text={opt || "Preview"} isReady={katexReady} /></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Solution / Explanation */}
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Solution / Explanation (For Mock Review)</label>
                      <textarea rows="3" value={editingQuestion.solution || ""} onChange={e => setEditingQuestion({...editingQuestion, solution: e.target.value})} className="w-full border border-gray-300 rounded p-3 focus:ring-blue-500" placeholder="Explain the correct answer..." />
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900 shadow-inner">
                          <strong className="text-xs text-green-600 uppercase tracking-widest block mb-1">Live Solution Preview</strong>
                          <LatexRenderer text={editingQuestion.solution || "Type solution to preview..."} isReady={katexReady} />
                      </div>
                  </div>

              </div>
          </div>
      </div>
  );

  // --- UI Screens : EXAM & RESULTS (Student & Instructor Review) ---
  
  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl shadow-lg border border-red-950 p-6 md:p-10 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none hidden md:block">
          <BookOpen className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black mb-2">Welcome back, Alex</h2>
        <p className="text-red-100 font-medium text-sm md:text-lg">Select a comprehensive mock assessment to begin your practice.</p>
      </div>

      <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-3 text-red-800 w-6 h-6 md:w-7 md:h-7" /> Available Mock Exams
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockExams.map((mock) => {
          const subs = examData.filter(s => mock.subjectIds.includes(s.id));
          if (subs.length === 0) return null; // Skip if empty mock

          const totalQ = subs.reduce((acc, curr) => acc + curr.questions.length, 0);
          const totalD = subs.reduce((acc, curr) => acc + curr.duration, 0);
          const totalM = subs.reduce((acc, curr) => acc + curr.totalMarks, 0);

          let ruleLabel = "Open Submit";
          if (mock.submissionRule === 'last_10_mins') ruleLabel = "Last 10 Mins Submit";
          if (mock.submissionRule === 'auto_only') ruleLabel = "Auto-Submit Only";

          return (
          <div key={mock.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
            <div className="h-2 bg-red-900 w-full group-hover:bg-red-700 transition-colors"></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col space-y-1">
                    <span className="bg-red-50 text-red-900 text-[10px] font-black w-max px-2 py-1 rounded uppercase tracking-widest border border-red-100">
                      {mock.examType || 'Mock Exam'}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{mock.examCode}</span>
                </div>
                <div className={`flex items-center text-xs font-bold ${mock.submissionRule === 'auto_only' ? 'text-red-600' : 'text-gray-500'} group-hover:text-red-800 transition-colors`}>
                    {mock.submissionRule === 'auto_only' ? <Lock className="w-3.5 h-3.5 mr-1" /> : <Unlock className="w-3.5 h-3.5 mr-1" />}
                    {ruleLabel}
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-1">{mock.name}</h4>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                  {subs.map(s => <span key={s.id} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold border border-gray-200">{s.code}</span>)}
              </div>
              
              <div className="space-y-1.5 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-auto">
                <div className="flex items-center text-xs font-medium text-gray-600">
                  <FileText className="w-3.5 h-3.5 mr-2 text-gray-400" /> {totalQ} Questions Total
                </div>
                <div className="flex items-center text-xs font-medium text-gray-600">
                  <Award className="w-3.5 h-3.5 mr-2 text-gray-400" /> {totalM} Marks Total
                </div>
                <div className="flex items-center text-xs font-medium text-gray-600">
                  <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" /> {totalD} Mins Total Duration
                </div>
              </div>
              
              <button 
                onClick={() => handleMockSelect(mock)}
                className="w-full bg-white hover:bg-red-900 text-red-900 hover:text-white border-2 border-red-900 font-bold py-2 rounded-lg transition-all duration-300 shadow-sm text-sm"
              >
                Launch Mock Exam
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );

  const renderInstructions = () => {
    const totalQ = activeMockExamSubjects.reduce((acc, curr) => acc + curr.questions.length, 0);
    const totalD = activeMockExamSubjects.reduce((acc, curr) => acc + curr.duration, 0);
    const totalM = activeMockExamSubjects.reduce((acc, curr) => acc + curr.totalMarks, 0);

    return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] bg-gray-50 animate-fade-in p-4 md:p-6 items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden max-h-full">
        <div className="bg-red-900 text-white p-6 md:p-8 relative shrink-0 z-10">
          <div className="flex items-center space-x-3 mb-3">
            <span className="bg-red-800 text-red-100 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest border border-red-700">
              {activeMockExam.examType || 'Mock Exam'}
            </span>
            <span className="text-sm font-bold text-red-200">{activeMockExam.examCode}</span>
          </div>
          <h2 className="text-3xl font-black mb-1">{activeMockExam.name}</h2>
          <p className="text-red-200 font-medium">General Instructions & Guidelines</p>
        </div>
        
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="prose max-w-none text-gray-700 text-sm md:text-base">
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                <span>The examination comprises <strong>{totalQ} questions</strong> across {activeMockExamSubjects.length} sections. Total time allotted is <strong>{totalD} minutes</strong>.</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <span>The clock is set at the server. The countdown timer will display the remaining time available.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                <span>There is <strong className="text-gray-900">NO negative marking</strong> for incorrect answers in this module.</span>
              </li>
              
              {activeMockExam.submissionRule === 'last_10_mins' && (
                  <li className="flex items-start">
                    <Lock className="w-5 h-5 text-indigo-600 mr-3 shrink-0 mt-0.5" />
                    <span><strong>Submission Restricted:</strong> You will only be able to manually submit the exam during the <strong>last 10 minutes</strong>. Before that, the submit button is disabled.</span>
                  </li>
              )}
              {activeMockExam.submissionRule === 'auto_only' && (
                  <li className="flex items-start">
                    <Lock className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
                    <span><strong>Strict Auto-Submit:</strong> Manual early submission is disabled for this mock exam. You must sit through the entire duration. The exam will <strong>automatically submit</strong> when the timer reaches 0:00.</span>
                  </li>
              )}

              <li className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
                <span><strong>Anti-Cheat Enabled:</strong> Right-clicking, copying, and switching tabs are monitored. Navigating away from the window 3 times will result in automatic submission.</span>
              </li>
            </ul>

            <div className="bg-slate-50 p-5 md:p-6 rounded-xl border border-slate-200 mb-8">
                <h4 className="font-bold text-gray-900 mb-3">Subjects Included:</h4>
                <div className="space-y-2">
                    {activeMockExamSubjects.map(sub => (
                        <div key={sub.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center text-gray-700">
                                <span className="font-mono text-xs font-bold bg-white border border-gray-300 px-1.5 py-0.5 rounded mr-3 text-gray-600">{sub.code}</span>
                                <span className="font-medium">{sub.name}</span>
                            </div>
                            <span className="font-bold text-gray-500">{sub.questions.length} Qs | {sub.totalMarks} Marks</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 p-5 md:p-6 rounded-xl border border-gray-200 mb-2">
              <h4 className="font-bold text-gray-900 mb-5">Question Palette Legend:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-medium">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 font-bold mr-3 shadow-sm">1</div> 
                  Not Visited
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mr-3 shadow-sm">2</div> 
                  Not Answered
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3 shadow-sm">3</div> 
                  Answered
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold mr-3 shadow-sm">4</div> 
                  Marked for Review
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-10">
          <button 
            onClick={() => { setScreen('dashboard'); setActiveMockExam(null); }}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-bold w-full sm:w-auto py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={startExam}
            className="bg-red-900 hover:bg-red-800 text-white font-bold py-3 px-10 rounded-lg shadow-lg shadow-red-900/20 w-full sm:w-auto transition-transform active:scale-95"
          >
            I am ready to begin
          </button>
        </div>
      </div>
    </div>
    );
  };

  const renderExam = () => {
    if (!subject || !subject.questions || subject.questions.length === 0) return <div>No questions available.</div>;
    const question = subject.questions[currentQIndex];
    
    const isTeacherPreview = role === 'teacher';
    const showReviewStyles = isReviewMode || isTeacherPreview;

    // Calculate palette stats for current subject
    const answeredCount = Object.keys(currentAnswers).length;
    let reviewCount = 0;
    let answeredReviewCount = 0;
    
    Object.keys(currentReview).forEach(qId => {
        if(currentReview[qId]) {
            if(currentAnswers[qId] !== undefined) answeredReviewCount++;
            else reviewCount++;
        }
    });

    const trueUnanswered = Object.keys(currentVisited).length - answeredCount - reviewCount;
    const notVisitedCount = subject.questions.length - Object.keys(currentVisited).length;

    // Check submission rules for UI
    const rule = activeMockExam?.submissionRule || 'anytime';
    const canSubmit = rule === 'anytime' || (rule === 'last_10_mins' && timeLeft <= 600);

    return (
      <div className={`flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] animate-fade-in relative ${showReviewStyles ? 'bg-indigo-50' : 'bg-gray-100'}`}>
        
        {/* Custom Confirmation Modal for Submitting */}
        {showSubmitConfirm && !showReviewStyles && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Submit Assessment?</h3>
              <p className="text-gray-600 mb-8 font-medium">
                Are you sure you want to submit? You will not be able to change your answers after submission.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => { setShowSubmitConfirm(false); submitExam(); }} className="flex-1 bg-red-900 hover:bg-red-800 text-white font-bold py-3 rounded-lg shadow-md transition-colors">
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proctored Warning Modal (Hidden in Review/Preview Mode) */}
        {showWarningModal && !showReviewStyles && !showSubmitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-red-600 animate-fade-in">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">Warning!</h3>
              <p className="text-gray-600 mb-6 font-medium">
                You have navigated away from the exam window. This activity is monitored.
                <br /><br />
                <span className="text-red-600 font-bold text-lg">Warning {warningCount} of 3</span>
                <br />
                <span className="text-sm">On your 3rd warning, the exam will automatically submit.</span>
              </p>
              <button 
                onClick={() => setShowWarningModal(false)}
                className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                I Understand, Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* Exam Sub-Header: Horizontal Subject Switcher & Timer */}
        <div className={`${showReviewStyles ? 'bg-indigo-900' : 'bg-white'} border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 z-10 gap-3 transition-colors relative`}>
            
            {/* Subject Switcher (Horizontal Scroll) */}
            <div className="w-full md:w-3/4 flex items-center overflow-x-auto hide-scroll space-x-2 pb-1 md:pb-0">
                {activeMockExamSubjects.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={() => switchSubject(sub.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 flex items-center ${
                            subject.id === sub.id
                            ? (showReviewStyles ? 'bg-indigo-800 border-indigo-400 text-white shadow-sm' : 'bg-red-50 border-red-900 text-red-900 shadow-sm')
                            : (showReviewStyles ? 'bg-indigo-950 border-transparent text-indigo-300 hover:bg-indigo-800 hover:text-white' : 'bg-white border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900')
                        }`}
                    >
                        <span className={`mr-2 opacity-60 font-mono text-[10px] tracking-wider uppercase`}>{sub.code}</span> {sub.name}
                    </button>
                ))}
            </div>

            {/* Timer & Submit / Exit Review */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end space-x-4 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                {isTeacherPreview ? (
                  <>
                    <div className="flex items-center text-indigo-200 font-bold text-sm bg-indigo-800 px-3 py-1 rounded">
                      <Presentation className="w-4 h-4 mr-2" /> Instructor Preview
                    </div>
                    <button onClick={() => setScreen('admin-dashboard')} className="bg-white hover:bg-gray-100 text-indigo-900 px-4 py-1.5 rounded text-xs font-bold shadow-sm whitespace-nowrap transition-colors">
                        Exit Preview
                    </button>
                  </>
                ) : isReviewMode ? (
                  <>
                    <div className="flex items-center text-indigo-200 font-bold text-sm bg-indigo-800 px-3 py-1 rounded">
                      <Eye className="w-4 h-4 mr-2" /> Mock Review Mode
                    </div>
                    <button onClick={() => setScreen('result')} className="bg-white hover:bg-gray-100 text-indigo-900 px-4 py-1.5 rounded text-xs font-bold shadow-sm whitespace-nowrap transition-colors">
                        Back to Results
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-red-900 font-bold">
                        <Clock className="w-4 h-4 mr-1.5" />
                        <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    {rule === 'auto_only' ? (
                        <div className="bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold shadow-inner flex items-center">
                            <Lock className="w-3.5 h-3.5 mr-1.5"/> Auto-submits at 0:00
                        </div>
                    ) : (
                        <button 
                            onClick={() => { if(canSubmit) setShowSubmitConfirm(true); }} 
                            disabled={!canSubmit}
                            title={!canSubmit ? "Can only submit in the last 10 minutes" : "Submit Exam"}
                            className={`px-4 py-1.5 rounded text-xs font-bold shadow-sm whitespace-nowrap transition-colors ${
                                canSubmit ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                            }`}
                        >
                            {canSubmit ? 'Submit Exam' : 'Submit Locked'}
                        </button>
                    )}
                  </>
                )}
            </div>
        </div>

        {/* Main Exam Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
          
          {/* Left Panel: Question Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-[4px_0_10px_rgba(0,0,0,0.03)] z-10 relative">
            
            {/* Whiteboard Overlay (Only visible in Teacher Preview mode) */}
            <WhiteboardOverlay 
                isEnabled={isTeacherPreview} 
                qId={question.id} 
                tool={wbTool}
                color={wbColor}
                strokeWidth={wbStrokeWidth}
                elementsMap={wbElementsMap}
                setElementsMap={setWbElementsMap}
            />

            {/* Question Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center shrink-0">
              <span className="font-bold text-lg text-gray-800">Question {currentQIndex + 1}</span>
              <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-500 font-medium">Marks: <strong className="text-gray-800">+{subject.totalMarks / subject.questions.length}</strong></span>
              </div>
            </div>
            
            {/* Question Text & Options */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <h3 className="text-lg md:text-xl text-gray-900 font-medium mb-6 leading-relaxed">
                <LatexRenderer text={question.text} isReady={katexReady} />
              </h3>
              
              <div className="space-y-3 max-w-3xl">
                {question.options.map((opt, idx) => {
                  const isSelected = currentAnswers[question.id] === idx;
                  const isCorrectAnswer = question.answer === idx;
                  const alphaLabel = String.fromCharCode(65 + idx);

                  // Dynamic styling for Render Modes
                  let labelClass = "border border-gray-300 hover:bg-gray-50";
                  let circleClass = "border-gray-400 bg-white";
                  let textClass = "text-gray-800";
                  let circleContent;

                  if (isTeacherPreview) {
                      if (isCorrectAnswer) {
                          labelClass = "border-2 border-green-500 bg-green-50 shadow-sm";
                          circleClass = "border-green-600 bg-green-500 text-white";
                          textClass = "text-green-900 font-medium";
                          circleContent = <CheckCircle className="w-4 h-4 text-white" />;
                      } else {
                          labelClass = "border border-gray-200 opacity-60";
                          circleClass = "border-gray-300 bg-white";
                          textClass = "text-gray-500";
                          circleContent = <span className="text-[10px] font-bold text-gray-400">{alphaLabel}</span>;
                      }
                  } else if (isReviewMode) {
                      if (isCorrectAnswer) {
                          labelClass = "border-2 border-green-500 bg-green-50 shadow-sm";
                          circleClass = "border-green-600 bg-green-500 text-white";
                          textClass = "text-green-900 font-medium";
                      } else if (isSelected && !isCorrectAnswer) {
                          labelClass = "border-2 border-red-500 bg-red-50 shadow-sm";
                          circleClass = "border-red-600 bg-red-500 text-white";
                          textClass = "text-red-900 font-medium";
                      } else {
                          labelClass = "border border-gray-200 opacity-60";
                      }
                      
                      if (isCorrectAnswer || isSelected) {
                          circleContent = isCorrectAnswer ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />;
                      } else {
                          circleContent = <span className={`text-[10px] font-bold text-gray-400`}>{alphaLabel}</span>;
                      }
                  } else {
                      // Normal Exam Mode styling
                      if (isSelected) {
                          labelClass = "border-2 border-red-900 bg-red-50";
                          circleClass = "border-red-900 bg-red-900";
                          textClass = "text-gray-900 font-medium";
                          circleContent = <div className="w-2 h-2 rounded-full bg-white"></div>;
                      } else {
                          circleContent = <span className="text-[10px] font-bold text-gray-500">{alphaLabel}</span>;
                      }
                  }

                  return (
                    <label 
                      key={idx} 
                      className={`flex items-start p-3 md:p-4 rounded-lg transition-colors ${!showReviewStyles ? 'cursor-pointer' : ''} ${labelClass}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center mr-3 shrink-0 ${circleClass}`}>
                        {circleContent}
                      </div>
                      <input 
                        type="radio" 
                        name={`q${question.id}`} 
                        className="hidden" 
                        checked={isSelected}
                        onChange={() => handleOptionSelect(idx)}
                        disabled={showReviewStyles}
                      />
                      <span className={`text-base ${textClass}`}>
                        <LatexRenderer text={opt} isReady={katexReady} />
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Solution Box (Shown in Review Mode or Teacher Preview) */}
              {showReviewStyles && (
                  <div className="mt-8 p-5 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner max-w-3xl">
                      <h4 className="flex items-center text-indigo-800 font-black mb-3"><BookOpen className="w-5 h-5 mr-2" /> Solution Explanation</h4>
                      <div className="text-gray-800 font-medium leading-relaxed relative z-50">
                          {question.solution ? (
                              <LatexRenderer text={question.solution} isReady={katexReady} />
                          ) : (
                              <span className="italic text-gray-500">No solution provided by the instructor for this question.</span>
                          )}
                      </div>
                  </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="bg-gray-50 border-t border-gray-200 p-3 md:p-4 grid grid-cols-2 md:flex md:justify-between items-center gap-2 shrink-0 z-50 relative">
                <div className="col-span-2 md:col-span-1 flex space-x-2 w-full md:w-auto">
                    {!showReviewStyles && (
                        <>
                            <button 
                                onClick={toggleReview}
                                className={`flex-1 md:flex-none px-4 py-2 border rounded font-bold text-sm transition-colors flex items-center justify-center ${
                                    currentReview[question.id] 
                                    ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-inner' 
                                    : 'bg-white border-yellow-400 text-yellow-600 hover:bg-yellow-50'
                                }`}
                            >
                                <Bookmark className="w-4 h-4 mr-1.5" /> 
                                <span className="hidden sm:inline">{currentReview[question.id] ? 'Unmark Review' : 'Mark for Review'}</span>
                                <span className="sm:hidden">Review</span>
                            </button>
                            <button 
                                onClick={clearResponse}
                                disabled={currentAnswers[question.id] === undefined}
                                className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 text-sm font-bold hover:bg-gray-100 disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>
                
                <div className="col-span-2 md:col-span-1 flex space-x-2 w-full md:w-auto justify-end">
                    <button 
                        onClick={prevQuestion}
                        disabled={currentQIndex === 0}
                        className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-white disabled:opacity-40 text-sm flex items-center justify-center bg-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </button>
                    <button 
                        onClick={nextQuestion}
                        disabled={currentQIndex === subject.questions.length - 1}
                        className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:hover:bg-green-600 text-white rounded font-bold text-sm flex items-center justify-center shadow-sm"
                    >
                        {showReviewStyles ? 'Next' : 'Save & Next'} <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
          </div>

          {/* Right Panel: Question Palette & Exam Info */}
          <div className="w-full md:w-72 bg-white flex flex-col shrink-0 overflow-y-auto md:overflow-hidden md:border-l border-gray-200 h-48 md:h-auto z-50">
            
            {/* Exam Info Module */}
            <div className="p-4 border-b border-gray-200 bg-slate-50 shrink-0">
               <div className="flex flex-col">
                   <p className="font-black text-gray-900 leading-tight text-sm uppercase">{activeMockExam.name}</p>
                   <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{activeMockExam.examCode} • {activeMockExam.examType}</p>
               </div>
            </div>

            {/* Status Legend (Hidden in Review/Preview mode to save space) */}
            {!showReviewStyles && (
                <div className="p-3 border-b border-gray-200 shrink-0 bg-white hidden md:block">
                <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[10px] font-bold text-gray-600">
                    <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-500 text-white flex justify-center items-center mr-1.5">{answeredCount - answeredReviewCount}</span> Answered</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 text-white flex justify-center items-center mr-1.5">{trueUnanswered}</span> Not Ans</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-white border border-gray-300 text-gray-500 flex justify-center items-center mr-1.5">{notVisitedCount}</span> Not Visit</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-yellow-400 text-yellow-900 flex justify-center items-center mr-1.5">{reviewCount}</span> Review</div>
                    <div className="flex items-center col-span-2"><span className="w-4 h-4 rounded-full bg-green-500 border-2 border-yellow-400 text-white flex justify-center items-center mr-1.5">{answeredReviewCount}</span> Ans & Review</div>
                </div>
                </div>
            )}
            
            {isTeacherPreview && (
                <div className="p-3 border-b border-gray-200 shrink-0 bg-indigo-50 hidden md:block">
                    <p className="text-xs font-bold text-indigo-800 text-center uppercase tracking-widest">Classroom Preview</p>
                    <p className="text-[10px] font-medium text-indigo-600 text-center mt-1">Student metrics hidden</p>
                </div>
            )}

            <div className="p-4 flex-1 overflow-y-auto hide-scroll bg-slate-50 md:bg-transparent">
              <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider hidden md:block">Palette</h4>
              <div className="flex flex-wrap gap-2 justify-start">
                {subject.questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const isCorrect = q.answer === currentAnswers[q.id];
                  
                  let btnClass = "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-colors border ";
                  
                  if (isTeacherPreview) {
                      btnClass += "bg-white text-gray-600 border-gray-300 hover:bg-gray-100";
                  } else if (isReviewMode) {
                      // Review Mode Palette logic
                      if (currentAnswers[q.id] !== undefined) {
                          if (isCorrect) btnClass += "bg-green-500 text-white border-green-600";
                          else btnClass += "bg-red-500 text-white border-red-600";
                      } else {
                          btnClass += "bg-gray-200 text-gray-500 border-gray-300"; // Skipped
                      }
                  } else {
                      // Normal Exam Palette logic
                      if (status === 'answered') btnClass += "bg-green-500 text-white border-green-600";
                      else if (status === 'unanswered') btnClass += "bg-red-500 text-white border-red-600";
                      else if (status === 'review') btnClass += "bg-yellow-400 text-yellow-900 border-yellow-500";
                      else if (status === 'answered-review') btnClass += "bg-green-500 text-white border-2 border-yellow-400 ring-2 ring-yellow-400 ring-inset";
                      else btnClass += "bg-white text-gray-600 border-gray-300 hover:bg-gray-100";
                  }

                  if (currentQIndex === idx) btnClass += " ring-2 ring-offset-2 ring-gray-800";

                  return (
                    <button 
                      key={q.id}
                      onClick={() => navigateQuestion(idx)}
                      className={btnClass}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Annotation Tools (Moved to bottom) */}
            {isTeacherPreview && (
                <div className="p-3 border-t border-gray-200 shrink-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
                    <h4 className="text-[10px] font-bold text-indigo-900 mb-2 flex items-center uppercase tracking-widest">
                        <PenTool className="w-3 h-3 mr-1.5" /> Annotation Tools
                    </h4>
                    
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        <button onClick={() => setWbTool('pointer')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='pointer'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Pointer"><MousePointer2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('pen')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='pen'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Pen"><PenTool className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('line')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='line'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Line"><Minus className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('arrow')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='arrow'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Arrow"><MoveRight className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('rectangle')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='rectangle'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Rectangle"><Square className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('ellipse')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='ellipse'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Ellipse"><Circle className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setWbTool('eraser')} className={`p-1.5 flex justify-center rounded-md transition-colors border ${wbTool==='eraser'?'bg-indigo-100 border-indigo-300 text-indigo-700':'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`} title="Eraser"><Eraser className="w-3.5 h-3.5"/></button>
                    </div>

                    {wbTool !== 'pointer' && wbTool !== 'eraser' && (
                        <div className="flex justify-between items-center mb-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {/* Colors */}
                            <div className="flex space-x-1.5">
                                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#0f172a'].map(c => (
                                    <button key={c} onClick={()=>setWbColor(c)} className={`w-4 h-4 rounded-full transition-transform ${wbColor===c?'ring-2 ring-offset-1 ring-indigo-500 scale-110':''}`} style={{backgroundColor: c}}></button>
                                ))}
                            </div>
                            
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>

                            {/* Thickness */}
                            <div className="flex space-x-1">
                                {[2, 4, 8].map(w => (
                                    <button key={w} onClick={()=>setWbStrokeWidth(w)} className={`w-6 h-6 flex items-center justify-center rounded transition-colors border ${wbStrokeWidth===w?'bg-slate-200 border-slate-300':'hover:bg-slate-200 border-transparent'}`}>
                                        <div className="bg-slate-700 rounded-full" style={{width: w*1.5, height: w*1.5}}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={() => setWbElementsMap({...wbElementsMap, [question.id]: []})} className="w-full text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 border border-gray-200 py-1.5 rounded-md transition-colors flex items-center justify-center">
                        <Trash className="w-3.5 h-3.5 mr-1.5" /> Clear Board
                    </button>
                </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  const renderResult = () => {
    const totalPossibleMarks = subject.globalTotalMarks || subject.totalMarks; 
    const percentage = (score / totalPossibleMarks) * 100;
    let feedback = "";
    if (percentage >= 90) feedback = "Outstanding Performance!";
    else if (percentage >= 60) feedback = "Good Job! You passed.";
    else feedback = "Needs Improvement. Keep studying.";

    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-gray-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-red-900"></div>
          
          <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-red-900" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{activeMockExam?.name || "Exam"} Completed</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm md:text-base">All Sections Submitted Successfully</p>

          <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Score</p>
            <div className="text-5xl md:text-6xl font-black text-red-900 flex items-baseline justify-center">
              {score.toFixed(1)} <span className="text-2xl md:text-3xl text-gray-400 font-bold ml-2">/ {totalPossibleMarks}</span>
            </div>
            
            <p className={`mt-4 font-bold text-base md:text-lg ${percentage >= 40 ? 'text-green-600' : 'text-red-500'}`}>
              {feedback} ({percentage.toFixed(0)}%)
            </p>
          </div>

          <div className="flex flex-col space-y-3">
              <button 
                onClick={startReviewMode}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-lg shadow transition-colors flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" /> Review Responses & Solutions
              </button>
              <button 
                onClick={() => {
                    setScreen('dashboard');
                    setActiveMockExam(null);
                    setGlobalAnswers({});
                    setGlobalVisited({});
                    setGlobalReview({});
                    setTimeLeft(0);
                    setWarningCount(0);
                }}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" /> Return to Dashboard
              </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className={`min-h-screen flex flex-col font-sans ${role === 'student' && screen === 'exam' && !isReviewMode ? 'select-none' : ''} ${role === 'teacher' ? 'bg-slate-50' : 'bg-gray-50'}`}>
      
      {/* Global Header */}
      <header className={`${role === 'teacher' ? 'bg-slate-950' : 'bg-red-900'} text-white px-4 md:px-6 py-3 shadow-md flex justify-between items-center z-20 shrink-0 transition-colors duration-300`}>
        <div className="flex items-center">
          {/* Faux IITM Logo */}
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-3 font-black text-red-900 font-serif text-sm">
            IIT
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight leading-none mb-0.5">Indian Institute of Technology Madras</h1>
            <p className={`text-[9px] font-bold tracking-widest uppercase ${role==='teacher' ? 'text-blue-300' : 'text-red-200'}`}>
                {role === 'teacher' ? 'INSTRUCTOR DASHBOARD' : 'ONLINE EXAM PORTAL'}
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold tracking-tight">IITM {role==='teacher'?'Admin':'Exam'}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <button onClick={toggleRole} className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors ${role === 'teacher' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-red-700 text-red-200 hover:bg-red-800'}`}>
                Switch to {role === 'teacher' ? 'Student' : 'Instructor'} Mode
            </button>

            {/* User Profile Snippet */}
            <div className={`hidden md:flex items-center rounded-full pr-4 pl-1 py-1 border shadow-sm ${role === 'teacher' ? 'bg-slate-900 border-slate-700' : 'bg-red-950/40 border-red-800'}`}>
            <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role === 'teacher' ? 'Prof' : 'Alex'}&backgroundColor=${role === 'teacher' ? '3b82f6' : 'f87171'}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full bg-white mr-3 border border-gray-200" 
                draggable="false"
            />
            <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white leading-none mb-1">{role === 'teacher' ? 'Prof. Smith' : 'Alex Doe'}</span>
                <span className={`text-[10px] font-mono leading-none tracking-wider ${role === 'teacher' ? 'text-blue-300' : 'text-red-200'}`}>
                    {role === 'teacher' ? 'FACULTY' : '21F100XXXX'}
                </span>
            </div>
            </div>
        </div>
      </header>

      {/* Dynamic Content Area */}
      {role === 'student' && screen === 'dashboard' && renderDashboard()}
      {role === 'student' && screen === 'instructions' && renderInstructions()}
      {role === 'student' && screen === 'exam' && renderExam()}
      {role === 'student' && screen === 'result' && renderResult()}

      {role === 'teacher' && screen === 'admin-dashboard' && renderAdminDashboard()}
      {role === 'teacher' && screen === 'admin-subject' && renderAdminSubjectEdit()}
      {role === 'teacher' && screen === 'admin-question' && renderAdminQuestionEdit()}
      {role === 'teacher' && screen === 'admin-mock' && renderAdminMockEdit()}
      {role === 'teacher' && screen === 'exam' && renderExam()}
      
    </div>
  );
}