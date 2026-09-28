'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Languages,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Edit3,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  Brain,
  MessageSquare,
  Network,
  Share2,
  Bookmark,
  Trash2,
  Zap,
  ListOrdered,
  FileCode,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Plus,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface AnalyzedDoc {
  filename: string;
  size_mb: number;
  page_count: number;
  word_count: number;
  preview_snippet: string;
  sample_text?: string;
}

interface SavedNote {
  id: string;
  title: string;
  date: string;
  subject: string;
  level: string;
  type: string;
  markdown: string;
}

interface Flashcard {
  front: string;
  back: string;
  tag?: string;
}

interface QuizItem {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

interface QuestionItem {
  type: string;
  question: string;
  marks: number;
  model_answer: string;
}

// Helper: Format bold, code, italics, and page references inline
function formatInlineText(text: string) {
  // Regex to match:
  // 1. **bold**
  // 2. `inline code`
  // 3. [Page X] or (Page X) or (Pages X-Y)
  // 4. *italic*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[Pages?\s+[\d\-–\s]+\]|\(Pages?\s+[\d\-–\s]+\)|\*[^*\n]+\*)/gi);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-500/20 text-purple-200 font-mono text-xs border border-purple-500/30"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.slice(1, -1).includes('*')) {
      return (
        <em key={idx} className="italic text-purple-200/90 font-normal">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^[\[\(]Pages?\s+[\d\-–\s]+[\]\)]$/i.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded-md text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 select-none shadow-sm whitespace-nowrap"
        >
          📄 {part.replace(/[[\]()]/g, '')}
        </span>
      );
    }
    return part;
  });
}

// Helper: Client TOC extractor
function extractClientToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = md.split('\n');
  let count = 1;
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed) continue;

    // 1. Markdown headings (#, ##, ###)
    const hashMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (hashMatch) {
      const hashes = hashMatch[1];
      const title = hashMatch[2].replace(/[*_`#]/g, '').trim();
      items.push({
        id: `sec-${count}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title,
        level: hashes.length,
      });
      count++;
      continue;
    }

    // 2. Numbered sections like 1. Reading Comprehension or 1.1 General Tips
    const numMatch = trimmed.match(/^(\d+(\.\d+)?)\s+([A-Z].+)$/);
    if (numMatch && numMatch[3].length < 70) {
      const level = numMatch[2] ? 3 : 2;
      const title = `${numMatch[1]} ${numMatch[3].replace(/[*_`#]/g, '').trim()}`;
      items.push({
        id: `sec-${count}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title,
        level,
      });
      count++;
      continue;
    }

    // 3. Standalone major sections
    if (trimmed === 'Executive Concept Summary' || trimmed === 'Timeline (Key Dates)') {
      items.push({
        id: `sec-${count}-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: trimmed,
        level: 2,
      });
      count++;
    }
  }
  return items;
}

export default function AiNotesGenerator() {
  // Mode: student vs teacher
  const [mode, setMode] = useState<'student' | 'teacher'>('student');

  // Input tab: 'upload' vs 'paste'
  const [inputTab, setInputTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Flow steps: 1 = input, 2 = analyzed, 3 = customize, 4 = generating, 5 = result
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Analyzed doc metadata
  const [analyzedDoc, setAnalyzedDoc] = useState<AnalyzedDoc | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Configuration options
  const [notesType, setNotesType] = useState<string>('detailed');
  const [educationLevel, setEducationLevel] = useState<string>('class_10');
  const [language, setLanguage] = useState<string>('english');
  const [preserveTerms, setPreserveTerms] = useState<boolean>(true);
  const [notesLength, setNotesLength] = useState<string>('medium');
  const [isAdvOpen, setIsAdvOpen] = useState<boolean>(false);

  const [advOptions, setAdvOptions] = useState<Record<string, boolean>>({
    definitions: true,
    examples: true,
    formulas: true,
    dates: true,
    key_terms: true,
    important_questions: true,
    exam_tips: true,
    page_references: true,
    source_quotes: false,
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('Analyzing your document...');
  const [genError, setGenError] = useState<string | null>(null);

  // Notes Result state
  const [notesMarkdown, setNotesMarkdown] = useState<string>('');
  const [notesTitle, setNotesTitle] = useState<string>('Study Notes');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Refine actions state
  const [isRefining, setIsRefining] = useState<boolean>(false);

  // "Ask From These Notes" state
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<{ q: string; a: string }[]>([]);

  // Study Tools Modals
  const [activeModal, setActiveModal] = useState<'flashcards' | 'quiz' | 'questions' | 'mindmap' | 'history' | null>(null);
  const [isLoadingTool, setIsLoadingTool] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');

  // Speech TTS
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Saved Notes History
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('axom_ai_saved_notes');
      if (data) {
        setSavedNotes(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading saved notes:', e);
    }
  }, []);

  // Save notes to localStorage
  const saveNoteToHistory = (title: string, md: string) => {
    try {
      const newNote: SavedNote = {
        id: 'note_' + Date.now(),
        title: title || 'Study Notes',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        subject: educationLevel.replace('_', ' ').toUpperCase(),
        level: educationLevel,
        type: notesType,
        markdown: md,
      };
      const updated = [newNote, ...savedNotes.filter((n) => n.title !== title)].slice(0, 30);
      setSavedNotes(updated);
      localStorage.setItem('axom_ai_saved_notes', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving note:', e);
    }
  };

  const deleteSavedNote = (id: string) => {
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    localStorage.setItem('axom_ai_saved_notes', JSON.stringify(updated));
  };

  const loadSavedNote = (note: SavedNote) => {
    setNotesTitle(note.title);
    setNotesMarkdown(note.markdown);
    setToc(extractClientToc(note.markdown));
    setStep(5);
    setActiveModal(null);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.txt', '.doc', '.rtf', '.md'].includes(ext)) {
      setAnalyzeError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setSelectedFile(file);
    setAnalyzeError(null);
    analyzeUploadedContent(file, null);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setAnalyzeError('Please paste some text to generate notes.');
      return;
    }
    setAnalyzeError(null);
    analyzeUploadedContent(null, pastedText);
  };

  // Step 2: Analyze Content
  const analyzeUploadedContent = async (file: File | null, text: string | null) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('text', text);
    }

    try {
      const res = await fetch('/api/ai-notes/analyze/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze document.');
      }

      setAnalyzedDoc({
        filename: data.filename,
        size_mb: data.size_mb,
        page_count: data.page_count,
        word_count: data.word_count,
        preview_snippet: data.preview_snippet,
        sample_text: data.sample_text,
      });
      setStep(2);
    } catch (err: any) {
      setAnalyzeError(err.message || 'Error processing document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 4 & 5: Generate Notes
  const handleGenerateNotes = async () => {
    setStep(4);
    setIsGenerating(true);
    setGenError(null);
    setGenerationProgress(15);
    setProgressLabel('Reading and analyzing document...');

    // Progress step simulation
    const timer1 = setTimeout(() => {
      setGenerationProgress(35);
      setProgressLabel('Identifying chapters and conceptual flow...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGenerationProgress(60);
      setProgressLabel('Extracting key definitions, formulas & examples...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setGenerationProgress(80);
      setProgressLabel('Organizing structured study notes & exam points...');
    }, 4500);

    const timer4 = setTimeout(() => {
      setGenerationProgress(92);
      setProgressLabel('Polishing layout and formatting takeaways...');
    }, 6500);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else if (pastedText) {
      formData.append('text', pastedText);
    } else if (analyzedDoc?.sample_text) {
      formData.append('text', analyzedDoc.sample_text);
    }

    formData.append('notes_type', notesType);
    formData.append('education_level', educationLevel);
    formData.append('language', language);
    formData.append('length', notesLength);
    formData.append('mode', mode);
    formData.append('preserve_terms', preserveTerms ? 'true' : 'false');

    const activeAdvKeys = Object.keys(advOptions).filter((k) => advOptions[k]);
    formData.append('advanced_options', JSON.stringify(activeAdvKeys));

    try {
      const res = await fetch('/api/ai-notes/generate/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate study notes.');
      }

      setNotesTitle(data.title || 'Study Notes');
      setNotesMarkdown(data.notes_markdown);
      setToc(data.toc || extractClientToc(data.notes_markdown));
      saveNoteToHistory(data.title || 'Study Notes', data.notes_markdown);

      setGenerationProgress(100);
      setProgressLabel('Notes generated successfully!');
      setTimeout(() => {
        setStep(5);
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      setGenError(err.message || 'Error occurred while generating notes.');
      setIsGenerating(false);
      setStep(3); // go back to options on error
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    }
  };

  // Refine Action Handler
  const handleRefineAction = async (action: string, targetLanguage?: string) => {
    setIsRefining(true);
    const formData = new FormData();
    formData.append('action', action);
    formData.append('notes_markdown', notesMarkdown);
    if (targetLanguage) {
      formData.append('target_language', targetLanguage);
    }

    try {
      const res = await fetch('/api/ai-notes/refine/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Refinement failed.');
      }
      setNotesMarkdown(data.notes_markdown);
      if (data.title) setNotesTitle(data.title);
      setToc(data.toc || extractClientToc(data.notes_markdown));
      saveNoteToHistory(data.title || notesTitle, data.notes_markdown);
    } catch (e: any) {
      alert(e.message || 'Failed to refine notes.');
    } finally {
      setIsRefining(false);
    }
  };

  // Ask Question Handler
  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) return;
    const q = askQuestion.trim();
    setAskQuestion('');
    setIsAsking(true);

    const formData = new FormData();
    formData.append('question', q);
    formData.append('notes_context', notesMarkdown);

    try {
      const res = await fetch('/api/ai-notes/ask/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setChatLog((prev) => [...prev, { q, a: data.answer }]);
      } else {
        alert(data.error || 'Could not answer query.');
      }
    } catch (e: any) {
      alert('Error asking question: ' + e.message);
    } finally {
      setIsAsking(false);
    }
  };

  // Study Tools Fetcher
  const handleOpenStudyTool = async (type: 'flashcards' | 'quiz' | 'questions' | 'mindmap') => {
    setActiveModal(type);
    setIsLoadingTool(true);
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setSelectedAnswers({});
    setShowQuizResults(false);

    const formData = new FormData();
    formData.append('tool_type', type);
    formData.append('notes_text', notesMarkdown);

    try {
      const res = await fetch('/api/ai-notes/study-tools/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate study tool.');
      }

      if (type === 'flashcards') {
        const cards = Array.isArray(data.data) ? data.data : [];
        setFlashcards(cards);
      } else if (type === 'quiz') {
        const quizes = Array.isArray(data.data) ? data.data : [];
        setQuizList(quizes);
      } else if (type === 'questions') {
        const qList = Array.isArray(data.data) ? data.data : [];
        setQuestionsList(qList);
      } else if (type === 'mindmap') {
        setMermaidCode(data.mermaid_code || '');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating study material.');
    } finally {
      setIsLoadingTool(false);
    }
  };

  // Export DOCX
  const handleExportDocx = async () => {
    const formData = new FormData();
    formData.append('title', notesTitle);
    formData.append('notes_markdown', notesMarkdown);

    try {
      const res = await fetch('/api/ai-notes/export-docx/', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('DOCX export failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${notesTitle.replace(/[^a-zA-Z0-9_\-]+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Failed to download Word document: ' + e.message);
    }
  };

  // Export PDF (Browser Print with clean stylesheet)
  const handleExportPdf = () => {
    window.print();
  };

  // Copy to clipboard
  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notesMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Speech TTS
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const plainText = notesMarkdown.replace(/[#*`_>]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 4000));
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Render Markdown with rich styling
  const renderedContent = useMemo(() => {
    if (!notesMarkdown) return null;

    const lines = notesMarkdown.split('\n');
    const elements: React.ReactNode[] = [];
    let secIdx = 1;

    const isTableRow = (l: string) => {
      const t = l.trim();
      return t.length > 0 && t.includes('|') && (t.match(/\|/g) || []).length >= 2;
    };

    const isSeparator = (rowStr: string) => {
      return /^\|?(\s*:?-{2,}:?\s*\|?)+$/.test(rowStr.trim());
    };

    const splitRow = (rowStr: string) => {
      let clean = rowStr.trim();
      if (clean.startsWith('|')) clean = clean.substring(1);
      if (clean.endsWith('|')) clean = clean.substring(0, clean.length - 1);
      return clean.split('|').map((c) => c.trim());
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`spacer-${i}`} className="h-2" />);
        continue;
      }

      // Horizontal dividers (---, ***, ___)
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        elements.push(
          <div key={`hr-${i}`} className="my-6 sm:my-8 border-t border-purple-500/20" />
        );
        continue;
      }

      // Markdown Tables (| Header | Header | ... |)
      if (isTableRow(trimmed)) {
        const tableLines: string[] = [];
        let j = i;
        while (j < lines.length) {
          const curTrimmed = lines[j].trim();
          if (isTableRow(curTrimmed)) {
            tableLines.push(curTrimmed);
            j++;
          } else if (curTrimmed === '') {
            // Lookahead: is the next non-empty line also a table row?
            let nextK = j + 1;
            while (nextK < lines.length && lines[nextK].trim() === '') {
              nextK++;
            }
            if (nextK < lines.length && isTableRow(lines[nextK].trim())) {
              j = nextK;
            } else {
              break;
            }
          } else {
            break;
          }
        }
        i = j - 1; // Advance outer loop

        const sepIndex = tableLines.findIndex(isSeparator);
        let headers: string[] = [];
        const dataRows: string[][] = [];

        if (sepIndex > 0) {
          headers = splitRow(tableLines[0]);
          for (let r = sepIndex + 1; r < tableLines.length; r++) {
            if (!isSeparator(tableLines[r])) {
              dataRows.push(splitRow(tableLines[r]));
            }
          }
        } else if (tableLines.length > 1) {
          headers = splitRow(tableLines[0]);
          for (let r = 1; r < tableLines.length; r++) {
            if (!isSeparator(tableLines[r])) {
              dataRows.push(splitRow(tableLines[r]));
            }
          }
        } else {
          dataRows.push(splitRow(tableLines[0]));
        }

        elements.push(
          <div
            key={`table-${i}`}
            className="my-6 overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-950/60 shadow-xl backdrop-blur-md"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                {headers.length > 0 && (
                  <thead>
                    <tr className="border-b border-purple-500/30 bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900/90">
                      {headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 sm:px-6 py-3.5 font-bold text-purple-200 tracking-wider uppercase whitespace-nowrap"
                        >
                          {formatInlineText(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-white/5">
                  {dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-purple-500/10 transition-colors duration-150 even:bg-white/[0.02]"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-4 sm:px-6 py-3 text-slate-300 leading-relaxed align-top"
                        >
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        continue;
      }

      // Title (# ...)
      if (trimmed.startsWith('# ')) {
        elements.push(
          <div key={`h1-${i}`} className="border-b border-purple-500/20 pb-4 mb-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>AI Generated Study Notes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {trimmed.substring(2)}
            </h1>
          </div>
        );
        continue;
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        const titleText = trimmed.substring(3);
        const slug = `sec-${secIdx}-${titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        secIdx++;
        elements.push(
          <div key={`h2-${i}`} id={slug} className="pt-6 pb-2 border-b border-white/10 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-indigo-300 flex items-center gap-2">
              <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full inline-block shrink-0" />
              <span>{titleText}</span>
            </h2>
          </div>
        );
        continue;
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        const titleText = trimmed.substring(4);
        const isExam = titleText.toLowerCase().includes('exam') || titleText.includes('⭐');
        elements.push(
          <div key={`h3-${i}`} className={`mt-5 mb-2 ${isExam ? 'p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300' : ''}`}>
            <h3 className="text-base sm:text-lg font-bold text-purple-200 flex items-center gap-2">
              {isExam && <span>⭐</span>}
              <span>{titleText}</span>
            </h3>
          </div>
        );
        continue;
      }

      // Numbered Subsection: 1.1 General Tips, 1.2 Passage 1...
      const subMatch = trimmed.match(/^(\d+\.\d+(\.\d+)?)\s+(.*)$/);
      if (subMatch) {
        const num = subMatch[1];
        const title = subMatch[3];
        const slug = `sec-${secIdx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        secIdx++;
        elements.push(
          <div key={`sub-${i}`} id={slug} className="pt-6 pb-1 scroll-mt-24">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                {num}
              </span>
              <span>{formatInlineText(title)}</span>
            </h3>
          </div>
        );
        continue;
      }

      // Major Section: 1. Reading Comprehension Strategies, 2. Vocabulary & Spelling
      const secMatch = trimmed.match(/^(\d+)\.\s+([A-Z].*)$/);
      if (secMatch && (secMatch[2].length < 60 || !secMatch[2].endsWith('.'))) {
        const num = secMatch[1];
        const title = secMatch[2];
        const slug = `sec-${secIdx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        secIdx++;
        elements.push(
          <div key={`sec-${i}`} id={slug} className="pt-8 pb-2 border-b border-purple-500/20 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-purple-600/30">
                {num}
              </span>
              <span>{formatInlineText(title)}</span>
            </h2>
          </div>
        );
        continue;
      }

      // Standalone Title: Executive Concept Summary, Timeline (Key Dates)
      if (trimmed === 'Executive Concept Summary' || trimmed === 'Timeline (Key Dates)') {
        const slug = `sec-${secIdx}-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        secIdx++;
        elements.push(
          <div key={`head-${i}`} id={slug} className="pt-6 pb-2 border-b border-purple-500/20 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-indigo-300 flex items-center gap-2">
              <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full inline-block shrink-0" />
              <span>{trimmed}</span>
            </h2>
          </div>
        );
        continue;
      }

      // Isolated Single Digits: 1, 2, 3 followed by text
      const digitOnly = trimmed.match(/^(\d+)$/);
      if (digitOnly && i + 1 < lines.length) {
        let nextIdx = i + 1;
        while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
          nextIdx++;
        }
        if (nextIdx < lines.length && !lines[nextIdx].trim().startsWith('#') && !lines[nextIdx].trim().startsWith('|')) {
          const nextContent = lines[nextIdx].trim();
          elements.push(
            <div
              key={`numcard-${i}`}
              className="flex items-start gap-3 my-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition text-slate-200 text-sm sm:text-base"
            >
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-purple-600/30">
                {digitOnly[1]}
              </span>
              <div className="flex-1 leading-relaxed">{formatInlineText(nextContent)}</div>
            </div>
          );
          i = nextIdx;
          continue;
        }
      }

      // Callouts: Key Idea / Key Takeaway
      if (trimmed.startsWith('Key Idea:') || trimmed.startsWith('Key Takeaway:')) {
        elements.push(
          <div
            key={`callout-${i}`}
            className="my-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-lg"
          >
            <span className="text-xl shrink-0">💡</span>
            <div className="flex-1">
              <strong className="text-emerald-300 font-semibold block mb-0.5">Key Idea</strong>
              {formatInlineText(trimmed.replace(/^Key (Idea|Takeaway):\s*/i, ''))}
            </div>
          </div>
        );
        continue;
      }

      // Callout: Moral
      if (trimmed.startsWith('Moral:')) {
        elements.push(
          <div
            key={`moral-${i}`}
            className="my-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-lg"
          >
            <span className="text-xl shrink-0">⚖️</span>
            <div className="flex-1">
              <strong className="text-indigo-300 font-semibold block mb-0.5">Moral</strong>
              {formatInlineText(trimmed.replace(/^Moral:\s*/i, ''))}
            </div>
          </div>
        );
        continue;
      }

      // Callout: Study / Reading / Exam Tip
      if (
        trimmed.startsWith('Reading tip:') ||
        trimmed.startsWith('Tip:') ||
        trimmed.startsWith('Exam Tip:')
      ) {
        elements.push(
          <div
            key={`tip-${i}`}
            className="my-4 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-lg"
          >
            <span className="text-xl shrink-0">📌</span>
            <div className="flex-1">
              <strong className="text-amber-300 font-semibold block mb-0.5">Study Tip</strong>
              {formatInlineText(trimmed.replace(/^(Reading tip|Tip|Exam Tip):\s*/i, ''))}
            </div>
          </div>
        );
        continue;
      }

      // Callout: Brief Summary
      if (trimmed.startsWith('Brief Summary –') || trimmed.startsWith('Brief Summary:')) {
        elements.push(
          <div
            key={`sum-${i}`}
            className="my-4 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/25 text-purple-200 text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-lg"
          >
            <span className="text-xl shrink-0">📝</span>
            <div className="flex-1">
              <strong className="text-purple-300 font-semibold block mb-0.5">Summary</strong>
              {formatInlineText(trimmed.replace(/^Brief Summary\s*[–:]\s*/i, ''))}
            </div>
          </div>
        );
        continue;
      }

      // Blockquotes (> ...)
      if (trimmed.startsWith('>')) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="my-3 pl-4 py-2 border-l-4 border-purple-500 bg-purple-500/5 rounded-r-xl text-slate-300 italic text-sm leading-relaxed"
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
        continue;
      }

      // Bullet points (- ... or * ...)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        elements.push(
          <li key={`li-${i}`} className="ml-5 my-1 text-slate-200 text-sm sm:text-base leading-relaxed list-disc marker:text-purple-400">
            {formatInlineText(content)}
          </li>
        );
        continue;
      }

      // Numbered items (1. ...)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-slate-200 text-sm sm:text-base">
            <span className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed">{formatInlineText(numMatch[2])}</div>
          </div>
        );
        continue;
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${i}`} className="my-2 text-slate-300 text-sm sm:text-base leading-relaxed">
          {formatInlineText(trimmed)}
        </p>
      );
    }

    return elements;
  }, [notesMarkdown]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* PRINT STYLESHEET (Applies only when user clicks Export PDF / Prints) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-notes-area,
          #printable-notes-area * {
            visibility: visible;
          }
          #printable-notes-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20mm;
          }
          #printable-notes-area h1,
          #printable-notes-area h2,
          #printable-notes-area h3,
          #printable-notes-area p,
          #printable-notes-area li {
            color: black !important;
          }
          #printable-notes-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 16px 0 !important;
          }
          #printable-notes-area th,
          #printable-notes-area td {
            border: 1px solid #333 !important;
            padding: 8px 12px !important;
            color: black !important;
            text-align: left !important;
          }
          #printable-notes-area th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
          #printable-notes-area tr {
            page-break-inside: avoid !important;
          }
          #printable-notes-area hr {
            border-color: #ccc !important;
            margin: 16px 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP HEADER & MODE CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">AI Notes Generator</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Transform textbooks, chapters & PDFs into structured study notes with AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-950/80 p-1 border border-white/10 shadow-inner">
            <button
              onClick={() => setMode('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'student'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap size={14} />
              <span>Student Mode</span>
            </button>
            <button
              onClick={() => setMode('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'teacher'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span>Teacher Mode</span>
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={() => setActiveModal('history')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition shadow-sm"
          >
            <Bookmark size={14} className="text-purple-400" />
            <span>My Notes ({savedNotes.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD & INPUT SCREEN */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Tabs: Upload File vs Paste Text */}
            <div className="flex border-b border-white/10 mb-8 max-w-sm">
              <button
                onClick={() => setInputTab('upload')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                  inputTab === 'upload'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadCloud size={16} />
                <span>Upload Document</span>
              </button>
              <button
                onClick={() => setInputTab('paste')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                  inputTab === 'paste'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 size={16} />
                <span>Paste Text</span>
              </button>
            </div>

            {analyzeError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{analyzeError}</span>
              </div>
            )}

            {/* TAB 1: FILE UPLOAD DROPZONE */}
            {inputTab === 'upload' && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer p-8 sm:p-14 rounded-3xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                    : 'border-white/15 bg-slate-950/40 hover:border-purple-500/50 hover:bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.doc,.rtf,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-20 h-20 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all shadow-xl">
                  {isAnalyzing ? (
                    <Loader2 size={36} className="animate-spin text-fuchsia-400" />
                  ) : (
                    <UploadCloud size={36} />
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isAnalyzing ? 'Analyzing Document Structure...' : 'Upload your study material'}
                </h3>
                <p className="text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
                  Drag & drop your chapter PDF, DOCX or TXT here, or click to browse files
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50 transition">
                  <FileText size={16} />
                  <span>Browse Files</span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📄 PDF</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📝 DOCX</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📋 TXT</span>
                  <span className="text-slate-400">• Up to 50 MB</span>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE TEXT */}
            {inputTab === 'paste' && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste chapter text, textbook paragraphs, lecture notes, or syllabus content here..."
                    rows={12}
                    className="w-full p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/15 text-slate-200 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500 transition leading-relaxed resize-y"
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-slate-900/90 px-3 py-1 rounded-lg border border-white/10">
                    {pastedText.split(/\s+/).filter(Boolean).length} words • {pastedText.length} characters
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePasteSubmit}
                    disabled={isAnalyzing || !pastedText.trim()}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-105 transition disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing Text...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Text</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: FILE ANALYZED SCREEN */}
      {/* ========================================================================= */}
      {step === 2 && analyzedDoc && (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/15 shadow-2xl">
            {/* Document Card Header */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-fuchsia-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <FileCheck size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate mb-1.5">{analyzedDoc.filename}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                    📖 Pages: <strong className="text-white">{analyzedDoc.page_count}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                    💾 Size: <strong className="text-white">{analyzedDoc.size_mb} MB</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                    📝 Words: <strong className="text-white">{analyzedDoc.word_count.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Checkmark Flow */}
            <div className="space-y-3.5 mb-8 px-2">
              <div className="flex items-center gap-3 text-sm text-emerald-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Check size={14} />
                </div>
                <span>File uploaded successfully</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Check size={14} />
                </div>
                <span>Text and structure extracted</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Check size={14} />
                </div>
                <span>Document analyzed & ready for notes synthesis</span>
              </div>
            </div>

            {/* Sample Snippet */}
            {analyzedDoc.preview_snippet && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 leading-relaxed italic mb-8">
                &ldquo;{analyzedDoc.preview_snippet}&rdquo;
              </div>
            )}

            {/* Continue Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                ← Choose Another File
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] transition"
              >
                <span>Continue to Options</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CUSTOMIZATION OPTIONS SCREEN */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl space-y-8">
            {/* Header info */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Customize Your Study Notes</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Tailor depth, curriculum level, language, and specific study aids.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-purple-400 hover:text-purple-300 transition"
              >
                Change Document
              </button>
            </div>

            {/* 1. NOTES TYPE CARDS */}
            <div>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-400" />
                <span>What type of notes do you want?</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'quick',
                    title: '⚡ Quick Notes',
                    sub: 'Fast revision & formulas',
                    desc: 'Crisp bullet points, high-yield facts, formula sheets for last-minute cramming.',
                  },
                  {
                    id: 'detailed',
                    title: '📖 Detailed Notes',
                    sub: 'Complete topic breakdown',
                    desc: 'In-depth conceptual explanations, full chapter coverage, step-by-step logic.',
                  },
                  {
                    id: 'exam',
                    title: '🎯 Exam Notes',
                    sub: 'Probable questions & tips',
                    desc: 'Highlighted definitions, probable board questions, scoring tips & answer outlines.',
                  },
                  {
                    id: 'simple',
                    title: '🧒 Simple Notes',
                    sub: 'Easy language & analogies',
                    desc: 'Complex concepts translated into friendly, everyday language with relatable metaphors.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setNotesType(item.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative ${
                      notesType === item.id
                        ? 'border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-slate-950/40 hover:border-purple-500/40 hover:bg-slate-950/60'
                    }`}
                  >
                    {notesType === item.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                        <Check size={12} />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs font-semibold text-purple-300 mb-2">{item.sub}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. EDUCATION LEVEL & NOTES LANGUAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education Level */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-400" />
                  <span>Target Education / Class Level</span>
                </label>
                <div className="relative">
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                  >
                    <option value="class_5">Class 5 (Primary / Foundation)</option>
                    <option value="class_6">Class 6 (Middle School)</option>
                    <option value="class_7">Class 7 (Middle School)</option>
                    <option value="class_8">Class 8 (Middle School)</option>
                    <option value="class_9">Class 9 (Secondary School)</option>
                    <option value="class_10">Class 10 (Secondary / Board Exams)</option>
                    <option value="class_11">Class 11 (Higher Secondary)</option>
                    <option value="class_12">Class 12 (Board & Entrance Exams)</option>
                    <option value="college">College / Undergraduate (B.A., B.Sc., B.Tech)</option>
                    <option value="university">University / Postgraduate (Master's / Research)</option>
                    <option value="professional">Professional / Competitive Exams (UPSC, APSC, SSC)</option>
                    <option value="general">General Audience / Lifelong Learner</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Languages size={16} className="text-fuchsia-400" />
                  <span>Notes Language</span>
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                  >
                    <option value="english">English (Standard)</option>
                    <option value="assamese">Assamese (অসমীয়া)</option>
                    <option value="hinglish">Hinglish (Hindi in English Script)</option>
                    <option value="hindi">Hindi (मानक हिन्दी)</option>
                    <option value="bengali">Bengali (বাংলা)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Technical terms checkbox */}
                {language !== 'english' && (
                  <label className="flex items-center gap-2.5 mt-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preserveTerms}
                      onChange={(e) => setPreserveTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-white/20 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <span>
                      Keep core technical & scientific terms in <strong>English</strong> (e.g. <em>Photosynthesis</em>, <em>Newton's Laws</em>)
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* 3. NOTES LENGTH */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sliders size={16} className="text-emerald-400" />
                <span>Notes Length & Depth</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'very_short', label: 'Very Short', count: '~400 words' },
                  { id: 'short', label: 'Short', count: '~800 words' },
                  { id: 'medium', label: 'Medium', count: '~1,500 words' },
                  { id: 'detailed', label: 'Detailed', count: '~2,500 words' },
                  { id: 'very_detailed', label: 'Exhaustive', count: 'Full Depth' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setNotesLength(l.id)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition ${
                      notesLength === l.id
                        ? 'border-purple-500 bg-purple-500/20 text-white font-bold'
                        : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{l.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{l.count}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. ADVANCED OPTIONS COLLAPSIBLE */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsAdvOpen(!isAdvOpen)}
                className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-slate-200 hover:text-white transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>⚙️ Advanced Learning Inclusions</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({Object.values(advOptions).filter(Boolean).length} enabled)
                  </span>
                </div>
                {isAdvOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isAdvOpen && (
                <div className="p-4 pt-0 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'definitions', label: 'Include key definitions' },
                    { id: 'examples', label: 'Include practical examples' },
                    { id: 'formulas', label: 'Include formulas & units' },
                    { id: 'dates', label: 'Include important dates/timeline' },
                    { id: 'key_terms', label: 'Include glossary of terms' },
                    { id: 'important_questions', label: 'Include likely exam questions' },
                    { id: 'exam_tips', label: 'Include exam scoring tips ⭐' },
                    { id: 'page_references', label: 'Include source page references' },
                    { id: 'source_quotes', label: 'Include textbook direct quotes' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none p-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <input
                        type="checkbox"
                        checked={!!advOptions[opt.id]}
                        onChange={(e) =>
                          setAdvOptions((prev) => ({
                            ...prev,
                            [opt.id]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* GENERATE BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleGenerateNotes}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
              >
                <Sparkles size={20} className="animate-spin text-fuchsia-300" style={{ animationDuration: '4s' }} />
                <span>🚀 Generate Notes Now</span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Powered by Axom AI Pedagogical Model • 100% Free Daily Quota
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: GENERATION PROGRESS INDICATOR */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="max-w-xl mx-auto text-center py-16 animate-in fade-in duration-300">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-6 relative">
              <Sparkles size={36} className="animate-pulse text-fuchsia-400" />
              <div className="absolute inset-0 rounded-3xl border-2 border-purple-500/40 animate-ping opacity-25" />
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">Analyzing your document...</h3>
            <p className="text-sm text-purple-300 mb-8 font-medium">{progressLabel}</p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 mb-8 overflow-hidden border border-white/10 p-0.5">
              <div
                className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            {/* Step Checkpoints */}
            <div className="space-y-3 text-left max-w-sm mx-auto text-xs sm:text-sm">
              <div className={`flex items-center gap-3 ${generationProgress >= 20 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={16} className={generationProgress >= 20 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Reading document & extracting paragraphs</span>
              </div>
              <div className={`flex items-center gap-3 ${generationProgress >= 40 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={16} className={generationProgress >= 40 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Identifying chapters & core subject themes</span>
              </div>
              <div className={`flex items-center gap-3 ${generationProgress >= 65 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={16} className={generationProgress >= 65 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Finding important concepts, formulas & definitions</span>
              </div>
              <div className={`flex items-center gap-3 ${generationProgress >= 85 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={16} className={generationProgress >= 85 ? 'text-emerald-400' : 'text-slate-600'} />
                <span>Organizing topics with exam scoring points</span>
              </div>
              <div className={`flex items-center gap-3 ${generationProgress >= 95 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Loader2 size={16} className={generationProgress >= 95 ? 'animate-spin text-fuchsia-400' : 'text-slate-600'} />
                <span>Generating structured notes...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: GENERATED NOTES RESULT VIEW */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* ACTION BUTTONS TOOLBAR */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-2">
              {/* Edit Toggle */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isEditMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Edit3 size={14} />
                <span>{isEditMode ? 'View Notes' : 'Edit'}</span>
              </button>

              {/* Study Tools: Flashcards, Quiz, Questions, MindMap */}
              <button
                onClick={() => handleOpenStudyTool('flashcards')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
              >
                <Brain size={14} />
                <span>Make Flashcards</span>
              </button>

              <button
                onClick={() => handleOpenStudyTool('quiz')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
              >
                <HelpCircle size={14} />
                <span>Generate Quiz</span>
              </button>

              <button
                onClick={() => handleOpenStudyTool('questions')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              >
                <ListOrdered size={14} />
                <span>Practice Questions</span>
              </button>

              <button
                onClick={() => handleOpenStudyTool('mindmap')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-semibold transition"
              >
                <Network size={14} />
                <span>Mind Map</span>
              </button>

              {/* TTS Listen */}
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSpeaking
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            </div>

            {/* Export & Copy buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportDocx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                <Download size={14} />
                <span>Export DOCX</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition"
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: NOTES CONTENT + TOC SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* LEFT / CENTER: NOTES BODY */}
            <div
              id="printable-notes-area"
              className="lg:col-span-3 p-6 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative"
            >
              {isRefining && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
                  <Loader2 size={36} className="animate-spin text-purple-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Updating your notes with AI...</p>
                </div>
              )}

              {isEditMode ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400">Markdown Editor Mode</span>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
                    >
                      Save & Preview
                    </button>
                  </div>
                  <textarea
                    value={notesMarkdown}
                    onChange={(e) => setNotesMarkdown(e.target.value)}
                    rows={28}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-white/15 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">{renderedContent}</div>
              )}

              {/* INLINE AI ACTIONS ("Make it Shorter / Longer") */}
              <div className="mt-12 pt-6 border-t border-white/10 no-print">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
                  <Sparkles size={14} className="text-purple-400" />
                  <span>AI Actions — Quick Refinements</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRefineAction('shorter')}
                    disabled={isRefining}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    🤏 Make Shorter
                  </button>
                  <button
                    onClick={() => handleRefineAction('longer')}
                    disabled={isRefining}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    🔍 Explain More
                  </button>
                  <button
                    onClick={() => handleRefineAction('simpler')}
                    disabled={isRefining}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    🧒 Make Simpler
                  </button>
                  <button
                    onClick={() => handleRefineAction('add_examples')}
                    disabled={isRefining}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    💡 Add Examples
                  </button>
                  <button
                    onClick={() => handleRefineAction('add_exam_points')}
                    disabled={isRefining}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    ⭐ Add Exam Points
                  </button>
                </div>
              </div>

              {/* "ASK FROM THESE NOTES" SECTION */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-950/60 to-indigo-950/30 border border-purple-500/25 no-print">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                  <MessageSquare size={16} className="text-purple-400" />
                  <span>💬 Ask about these notes</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Have a doubt? Ask any concept question and AI will answer strictly based on this document.
                </p>

                {chatLog.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
                    {chatLog.map((chat, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs sm:text-sm">
                        <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 font-medium">
                          <strong>Q:</strong> {chat.q}
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 leading-relaxed">
                          <strong>A:</strong> {chat.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="E.g., What is the difference between exothermic and endothermic reactions?"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={isAsking || !askQuestion.trim()}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition disabled:opacity-50"
                  >
                    {isAsking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: TABLE OF CONTENTS (TOC) */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 no-print">
              <div className="p-5 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-white/10 shadow-xl">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ListOrdered size={14} className="text-purple-400" />
                  <span>CONTENTS</span>
                </h4>

                {toc.length === 0 ? (
                  <p className="text-xs text-slate-500">No chapters detected</p>
                ) : (
                  <ul className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                    {toc.map((item, idx) => (
                      <li key={idx}>
                        <a
                          href={`#${item.id}`}
                          className={`block py-1 px-2 rounded-lg text-xs leading-snug transition truncate ${
                            item.level === 1
                              ? 'font-bold text-white hover:bg-white/5'
                              : item.level === 2
                              ? 'font-medium text-purple-200 hover:bg-purple-500/10 pl-3'
                              : 'text-slate-400 hover:text-slate-200 pl-5'
                          }`}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Start New Document Button */}
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedFile(null);
                  setPastedText('');
                  setAnalyzedDoc(null);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition"
              >
                <Plus size={14} />
                <span>Upload New Chapter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FLASHCARDS */}
      {/* ========================================================================= */}
      {activeModal === 'flashcards' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-purple-300 mb-6">
              <Brain size={18} />
              <span>Interactive Revision Flashcards</span>
            </div>

            {isLoadingTool ? (
              <div className="py-20 text-center">
                <Loader2 size={36} className="animate-spin text-purple-400 mx-auto mb-3" />
                <p className="text-sm text-slate-300">Generating flashcards from notes...</p>
              </div>
            ) : flashcards.length === 0 ? (
              <p className="text-center py-12 text-slate-400">No flashcards could be generated.</p>
            ) : (
              <div>
                <div className="text-xs text-slate-400 text-center mb-2">
                  Card {currentCardIdx + 1} of {flashcards.length}
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="cursor-pointer min-h-[220px] p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/30 flex flex-col items-center justify-center text-center shadow-xl hover:border-purple-500/60 transition group select-none relative"
                >
                  <span className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {isCardFlipped ? 'ANSWER / CONCEPT' : 'QUESTION / TERM'}
                  </span>

                  <div className="text-lg sm:text-xl font-bold text-white mb-2 leading-relaxed">
                    {isCardFlipped ? flashcards[currentCardIdx].back : flashcards[currentCardIdx].front}
                  </div>

                  <span className="text-xs text-purple-400/80 group-hover:text-purple-300 mt-4 transition">
                    (Click to {isCardFlipped ? 'flip back' : 'reveal answer'})
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4 mt-6">
                  <button
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                      setIsCardFlipped(false);
                    }}
                    disabled={currentCardIdx === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/40 transition"
                  >
                    Flip Card
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
                      setIsCardFlipped(false);
                    }}
                    disabled={currentCardIdx === flashcards.length - 1}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUIZ GENERATOR */}
      {/* ========================================================================= */}
      {activeModal === 'quiz' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-6">
              <HelpCircle size={18} />
              <span>Chapter Mastery Quiz</span>
            </div>

            {isLoadingTool ? (
              <div className="py-20 text-center">
                <Loader2 size={36} className="animate-spin text-indigo-400 mx-auto mb-3" />
                <p className="text-sm text-slate-300">Crafting multiple choice questions...</p>
              </div>
            ) : quizList.length === 0 ? (
              <p className="text-center py-12 text-slate-400">No quiz questions could be generated.</p>
            ) : (
              <div className="space-y-6">
                {quizList.map((item, qIdx) => (
                  <div key={qIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {qIdx + 1}. {item.question}
                    </h4>

                    <div className="space-y-2">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = selectedAnswers[qIdx] === optIdx;
                        const isCorrect = showQuizResults && optIdx === item.answer_index;
                        const isWrong = showQuizResults && isChosen && optIdx !== item.answer_index;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => {
                              if (!showQuizResults) {
                                setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                              }
                            }}
                            className={`cursor-pointer p-3 rounded-xl border text-xs sm:text-sm transition flex items-center gap-3 ${
                              isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                                : isWrong
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                : isChosen
                                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showQuizResults && item.explanation && (
                      <div className="mt-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                        <strong>Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  {!showQuizResults ? (
                    <button
                      onClick={() => setShowQuizResults(true)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
                    >
                      Submit & Check Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setShowQuizResults(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      Reset Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXAM PRACTICE QUESTIONS */}
      {/* ========================================================================= */}
      {activeModal === 'questions' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 mb-6">
              <ListOrdered size={18} />
              <span>Exam Practice Questions & Model Answers</span>
            </div>

            {isLoadingTool ? (
              <div className="py-20 text-center">
                <Loader2 size={36} className="animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-slate-300">Generating standard exam question set...</p>
              </div>
            ) : questionsList.length === 0 ? (
              <p className="text-center py-12 text-slate-400">No questions generated.</p>
            ) : (
              <div className="space-y-5">
                {questionsList.map((q, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {q.type} • {q.marks} Marks
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-relaxed">
                      Q{idx + 1}. {q.question}
                    </h4>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <span className="font-semibold text-emerald-400 block mb-1">Model Answer:</span>
                      {q.model_answer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MIND MAP (MERMAID) */}
      {/* ========================================================================= */}
      {activeModal === 'mindmap' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-fuchsia-500/30 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-fuchsia-300 mb-6">
              <Network size={18} />
              <span>Chapter Mind Map</span>
            </div>

            {isLoadingTool ? (
              <div className="py-20 text-center">
                <Loader2 size={36} className="animate-spin text-fuchsia-400 mx-auto mb-3" />
                <p className="text-sm text-slate-300">Constructing concept node tree...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 overflow-x-auto text-xs font-mono text-purple-300 leading-relaxed">
                  <pre>{mermaidCode || 'graph TD\n  Chapter["Study Material"] --> A["Core Concepts"]\n  Chapter --> B["Exam Takeaways"]'}</pre>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Copy this diagram code into any Mermaid renderer or Obsidian note to visualize full hierarchy.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SAVED NOTES HISTORY */}
      {/* ========================================================================= */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-base font-bold text-white mb-6">
              <Bookmark size={20} className="text-purple-400" />
              <span>My Saved Study Notes</span>
            </div>

            {savedNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FileText size={36} className="mx-auto text-slate-600 mb-2" />
                <p className="text-sm">You haven&apos;t generated any notes yet.</p>
                <p className="text-xs text-slate-400">Notes you create will be automatically saved here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-purple-500/40 transition flex items-center justify-between gap-4 group"
                  >
                    <div
                      onClick={() => loadSavedNote(note)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition truncate">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{note.date}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] text-purple-400 font-semibold">{note.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadSavedNote(note)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-semibold hover:bg-purple-600 hover:text-white transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => deleteSavedNote(note.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
