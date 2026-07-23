import type { VocabularyResponse } from "../../types/vocabulary.types";

interface FlashcardProps {
  vocabulary: VocabularyResponse;
  isFlipped: boolean;
  onFlip?: () => void;
}

export default function Flashcard({ vocabulary, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div 
      className="relative w-full max-w-md aspect-[3/4] cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={onFlip}
    >
      <div 
        className={`w-full h-full relative transition-transform duration-500`}
        style={{ 
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 border-4 border-neutral-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-[120px] font-bold text-neutral-900 leading-none mb-4">{vocabulary.kanji}</span>
          <p className="text-neutral-400 font-medium">Chạm để lật</p>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 w-full h-full bg-neutral-800 rounded-3xl shadow-2xl flex flex-col p-8 border border-neutral-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            
            <div className="w-full">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Âm Hán Việt</h3>
              <p className="text-2xl font-bold text-neutral-200">{vocabulary.hanViet || "-"}</p>
            </div>

            <div className="w-full h-px bg-neutral-700 my-2"></div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Nghĩa</h3>
              <p className="text-3xl font-bold text-white">{vocabulary.meaning}</p>
            </div>

            <div className="w-full h-px bg-neutral-700 my-2"></div>

            <div className="grid grid-cols-2 gap-6 w-full pt-2">
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Âm On</h3>
                <p className="text-xl font-medium text-orange-400">{vocabulary.onyomi || "-"}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Âm Kun</h3>
                <p className="text-xl font-medium text-blue-400">{vocabulary.kunyomi || "-"}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
