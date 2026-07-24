import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Hybrid State
  const [inputValue, setInputValue] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [cardState, setCardState] = useState<"inputting" | "correct" | "failed" | "submitting">("inputting");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonGoodRef = useRef<HTMLButtonElement>(null);
  const buttonAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Inject 3D CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .preserve-3d { transform-style: preserve-3d; }
      .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .animate-shake { animation: shake 0.3s ease-in-out; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await studyService.getDueReviews();
        setVocabularies([...data].sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Reset state on new card
  useEffect(() => {
    setInputValue("");
    setWrongCount(0);
    setCardState("inputting");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIndex]);

  // Focus buttons when card flips
  useEffect(() => {
    if (cardState === "correct") {
      setTimeout(() => buttonGoodRef.current?.focus(), 100);
    } else if (cardState === "failed") {
      setTimeout(() => buttonAgainRef.current?.focus(), 100);
    }
  }, [cardState]);

  const normalizeString = (str: string) => str.toLowerCase().trim();

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardState !== "inputting") return;
    if (!inputValue.trim()) return;

    const answer = normalizeString(inputValue);
    const currentVocab = vocabularies[currentIndex];
    
    // Logic: Only check On or Kun reading
    const isCorrect = 
      answer === normalizeString(currentVocab.onyomi || "") ||
      answer === normalizeString(currentVocab.kunyomi || "") ||
      // Fallback in case romaji reading wasn't stored properly, but user knows the meaning
      answer === normalizeString(currentVocab.meaning || "");

    if (isCorrect) {
      setCardState("correct");
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      if (newCount >= 3) {
        setCardState("failed");
      } else {
        // Shake and clear
        setInputValue("");
        if (inputRef.current) {
          inputRef.current.classList.add('animate-shake', 'border-red-500', 'bg-red-500/10');
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.classList.remove('animate-shake', 'border-red-500', 'bg-red-500/10');
              inputRef.current.focus();
            }
          }, 400);
        }
      }
    }
  };

  const handleShowAnswer = () => {
    if (cardState === "inputting") {
      setCardState("failed");
    }
  };

  const handleSubmitQuality = async (quality: number) => {
    if (cardState === "submitting") return;
    setCardState("submitting");

    const currentVocab = vocabularies[currentIndex];
    try {
      await studyService.submitReview(currentVocab.id, quality);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }

    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-red-500 rounded-full" /></div>;
  }

  if (isFinished || vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-neutral-700">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h2 className="text-3xl font-bold text-white mb-4">Tuyệt Vời!</h2>
          <p className="text-neutral-400 mb-8">{vocabularies.length === 0 ? "Không có từ vựng nào cần ôn tập hôm nay." : "Bạn đã hoàn thành phiên ôn tập."}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl shadow-lg transition-colors">Về Trang Chủ</button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = (currentIndex / vocabularies.length) * 100;
  const isFlipped = cardState === "correct" || cardState === "failed" || cardState === "submitting";

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans flex flex-col overflow-x-hidden relative">
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10 w-full max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"><ArrowLeft size={24} /></button>
        <div className="flex-1 mx-6">
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-center text-sm font-medium text-neutral-400 mt-2">Còn lại: {vocabularies.length - currentIndex}</div>
        </div>
        <div className="w-12 h-12"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-md mx-auto">
        
        {/* 3D Flip Card Container */}
        <div className="w-full relative" style={{ perspective: '1000px' }}>
          
          <div 
            className="relative w-full h-[380px] transition-transform duration-700 preserve-3d"
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
          >
            {/* Front of Card */}
            <div className={`absolute inset-0 backface-hidden w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-10 text-center shadow-2xl border transition-colors flex flex-col items-center justify-center ${wrongCount > 0 ? 'border-red-500/50' : 'border-neutral-700'}`}>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest absolute top-8">Ôn Tập Kanji</h3>
              <span className="text-[120px] font-bold text-white leading-none my-auto">{currentVocab.kanji}</span>
              {wrongCount > 0 && <span className="absolute bottom-8 text-red-400 text-sm font-medium animate-pulse">Sai {wrongCount}/3 lần</span>}
            </div>

            {/* Back of Card */}
            <div 
              className={`absolute inset-0 backface-hidden w-full h-full bg-gradient-to-br rounded-3xl p-10 shadow-2xl border flex flex-col items-center text-center justify-center
                ${cardState === "correct" ? 'from-green-900/40 to-neutral-900 border-green-500/50' : 'from-red-900/40 to-neutral-900 border-red-500/50'}
              `}
              style={{ transform: 'rotateY(180deg)' }}
            >
              <span className="text-6xl font-bold text-white/10 absolute top-6">{currentVocab.kanji}</span>
              <h2 className="text-4xl font-bold text-white mb-2 z-10">{currentVocab.meaning}</h2>
              <p className="text-xl text-blue-300 mb-8 z-10 font-serif">{currentVocab.hanViet}</p>
              
              <div className="flex flex-col gap-3 w-full max-w-[200px] text-base z-10">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">On</span>
                  <span className="text-orange-400 font-medium">{currentVocab.onyomi || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Kun</span>
                  <span className="text-blue-400 font-medium">{currentVocab.kunyomi || "—"}</span>
                </div>
              </div>

              {cardState === "correct" && <div className="absolute top-6 right-6 text-green-500"><CheckCircle2 size={32} /></div>}
              {cardState === "failed" && <div className="absolute top-6 right-6 text-red-500"><X size={32} /></div>}
            </div>
          </div>
        </div>

        {/* Input Area (Visible only when not flipped) */}
        <div className={`w-full mt-8 transition-all duration-300 ${isFlipped ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
          <form onSubmit={handleInputSubmit} className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isFlipped}
              placeholder="Nhập Romaji..."
              className="w-full bg-neutral-800 text-white border-2 border-neutral-700 focus:border-blue-500 rounded-2xl py-5 px-6 text-xl focus:outline-none transition-colors shadow-lg"
            />
          </form>
          <button 
            type="button"
            onClick={handleShowAnswer}
            className="w-full mt-4 py-3 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
          >
            Quên từ này? Xem đáp án ngay
          </button>
        </div>

        {/* SM-2 Quality Buttons (Visible only when flipped) */}
        <div className={`w-full transition-all duration-500 ease-out ${isFlipped ? 'opacity-100 translate-y-0 mt-8' : 'opacity-0 translate-y-8 h-0 overflow-hidden pointer-events-none'}`}>
          
          {cardState === "correct" ? (
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => handleSubmitQuality(0)} className="py-4 bg-neutral-800 hover:bg-neutral-700 text-red-400 font-bold rounded-2xl border border-neutral-700 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg">
                <span className="text-sm">Lại</span>
              </button>
              <button onClick={() => handleSubmitQuality(3)} className="py-4 bg-neutral-800 hover:bg-neutral-700 text-orange-400 font-bold rounded-2xl border border-neutral-700 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg">
                <span className="text-sm">Khó</span>
              </button>
              {/* GOOD is Highlighted/Focused by default */}
              <button 
                ref={buttonGoodRef}
                onClick={() => handleSubmitQuality(4)} 
                className="py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl border-2 border-green-400 transition-all flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 outline-none focus:ring-4 focus:ring-green-500/50"
              >
                <span className="text-base">Tốt (Enter)</span>
              </button>
              <button onClick={() => handleSubmitQuality(5)} className="py-4 bg-neutral-800 hover:bg-neutral-700 text-blue-400 font-bold rounded-2xl border border-neutral-700 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg">
                <span className="text-sm">Dễ</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1">
              <button 
                ref={buttonAgainRef}
                onClick={() => handleSubmitQuality(0)} 
                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl border-2 border-red-400 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] outline-none focus:ring-4 focus:ring-red-500/50"
              >
                <span className="text-lg">Ôn Lại Lần Sau (Enter)</span>
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
