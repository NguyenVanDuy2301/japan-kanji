import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, CheckCircle2 } from "lucide-react";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await studyService.getDueReviews();
        // Shuffle the due reviews for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setVocabularies(shuffled);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (inputRef.current && feedback === "none") {
      inputRef.current.focus();
    }
  }, [currentIndex, feedback]);

  const normalizeString = (str: string) => {
    return str.toLowerCase().trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== "none") return;
    if (!inputValue.trim()) return;

    const currentVocab = vocabularies[currentIndex];
    
    // Check answer (allow match for meaning, romaji, or onyomi/kunyomi)
    const answer = normalizeString(inputValue);
    const isCorrect = 
      answer === normalizeString(currentVocab.meaning) ||
      answer === normalizeString(currentVocab.onyomi || "") ||
      answer === normalizeString(currentVocab.kunyomi || "") ||
      answer === normalizeString(currentVocab.hanViet || "");

    setFeedback(isCorrect ? "correct" : "incorrect");

    // Submit to backend
    try {
      await studyService.submitReview(currentVocab.id, isCorrect);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }

    // Wait and move to next
    setTimeout(() => {
      if (currentIndex < vocabularies.length - 1) {
        setInputValue("");
        setFeedback("none");
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-neutral-700">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Bạn đã xong!</h2>
          <p className="text-neutral-400 mb-8">Không có từ vựng nào cần ôn tập hôm nay. Hãy quay lại vào ngày mai nhé!</p>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-neutral-700">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Tuyệt Vời!</h2>
          <p className="text-neutral-400 mb-8">Bạn đã hoàn thành phiên ôn tập. Tiếp tục duy trì thói quen học tập này nhé!</p>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl transition-colors shadow-lg"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = (currentIndex / vocabularies.length) * 100;

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10 relative">
        <button 
          onClick={() => navigate('/')}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 max-w-md mx-6">
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm font-medium text-neutral-400 mt-2">
            Còn lại: {vocabularies.length - currentIndex}
          </div>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-lg mx-auto">
        
        {/* Kanji Display */}
        <div className={`w-full bg-neutral-800 rounded-3xl p-12 text-center shadow-2xl border border-neutral-700 transition-all duration-300 ${feedback === 'correct' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : feedback === 'incorrect' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-8">Ôn Tập Kanji</h3>
          <span className="text-[120px] font-bold text-white leading-none block mb-6">{currentVocab.kanji}</span>
          
          {feedback !== "none" && (
            <div className={`mt-6 pt-6 border-t border-neutral-700 text-left animate-in slide-in-from-bottom-2 fade-in duration-300`}>
              <div className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Đáp Án</div>
              <p className="text-xl font-bold text-white">{currentVocab.meaning} ({currentVocab.hanViet})</p>
              <div className="flex gap-4 mt-2">
                <span className="text-orange-400">{currentVocab.onyomi}</span>
                <span className="text-blue-400">{currentVocab.kunyomi}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full mt-8 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={feedback !== "none"}
            placeholder="Nhập nghĩa hoặc cách đọc (Romaji)..."
            className={`w-full bg-neutral-800 text-white border-2 rounded-2xl py-5 px-6 text-xl focus:outline-none transition-colors ${feedback === 'correct' ? 'border-green-500 bg-green-500/10' : feedback === 'incorrect' ? 'border-red-500 bg-red-500/10' : 'border-neutral-700 focus:border-neutral-500'}`}
          />
          {feedback === "correct" && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500">
              <Check size={28} />
            </div>
          )}
          {feedback === "incorrect" && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-500">
              <X size={28} />
            </div>
          )}
        </form>

      </main>
      
    </div>
  );
}
