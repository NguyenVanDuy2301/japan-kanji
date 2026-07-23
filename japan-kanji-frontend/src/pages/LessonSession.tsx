import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, RefreshCw, Bookmark } from "lucide-react";
import { studyService } from "../services/study.service";
import { deckService } from "../services/deck.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import Flashcard from "../components/ui/Flashcard";

export default function LessonSession() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'new' | 'practice' | 'loading'>('loading');

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        if (!deckId) return;
        
        // Check if deck is saved
        const savedDecks = await deckService.getSavedDecks();
        setIsSaved(savedDecks.some(d => d.id === Number(deckId)));

        let data = await studyService.getLessons(Number(deckId), 10);
        
        if (data.length > 0) {
          setMode('new');
        } else {
          // No new words -> fallback to practice mode automatically
          data = await studyService.getPractice(Number(deckId));
          setMode('practice');
        }
        
        setVocabularies(data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [deckId]);

  const handleToggleSave = async () => {
    if (!deckId || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await deckService.unsaveDeck(Number(deckId));
        setIsSaved(false);
      } else {
        await deckService.saveDeck(Number(deckId));
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save deck:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex < vocabularies.length && mode === 'new') {
      const currentVocab = vocabularies[currentIndex];
      // Mark as studied by submitting an initial review
      try {
        await studyService.submitReview(currentVocab.id, true);
      } catch (error) {
        console.error("Failed to submit review:", error);
      }
    }

    if (currentIndex < vocabularies.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-neutral-700">
          <div className="w-20 h-20 bg-neutral-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-neutral-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Bộ bài trống!
          </h2>
          <p className="text-neutral-400 mb-8">
            Bộ bài này chưa có từ vựng nào. Hãy thêm từ vựng trước khi học.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-neutral-700">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Hoàn Thành {mode === 'practice' ? 'Luyện Tập' : 'Bài Học'}!</h2>
          <p className="text-neutral-400 mb-8">Bạn đã học {vocabularies.length} chữ Kanji hôm nay. Làm tốt lắm!</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsFinished(false);
              }}
              className="w-full py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl transition-colors shadow-lg"
            >
              Học Lại Ngay Bây Giờ
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = ((currentIndex) / vocabularies.length) * 100;

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
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm font-medium text-neutral-400 mt-2">
            {currentIndex + 1} / {vocabularies.length}
          </div>
        </div>
        <button 
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
            isSaved 
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
          }`}
          title={isSaved ? "Hủy lưu bộ bài" : "Lưu bộ bài"}
        >
          <Bookmark size={24} className={isSaved ? "fill-current" : ""} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-lg mx-auto">
        
        {mode === 'practice' && (
          <div className="absolute top-4 bg-neutral-800 text-neutral-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-neutral-700 animate-fade-in shadow-lg z-20">
            Đang ở chế độ Luyện Tập
          </div>
        )}

        <Flashcard 
          vocabulary={currentVocab} 
          isFlipped={isFlipped} 
          onFlip={() => setIsFlipped(!isFlipped)} 
        />

        {/* Controls */}
        <div className="mt-12 flex justify-center w-full max-w-md">
          {isFlipped ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="w-full py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-2xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 text-lg"
            >
              Đã Thuộc <Check size={24} className="text-green-600" />
            </button>
          ) : (
            <button 
              onClick={() => setIsFlipped(true)}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg border border-neutral-700"
            >
              Xem Đáp Án <RefreshCw size={20} className="text-neutral-400" />
            </button>
          )}
        </div>
      </main>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/10 blur-[120px]"></div>
      </div>
    </div>
  );
}
