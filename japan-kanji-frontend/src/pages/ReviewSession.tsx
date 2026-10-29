import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, X, Eye } from "lucide-react";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/Skeleton";
import { Confetti } from "../components/ui/Confetti";
import clsx from "clsx";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [cardState, setCardState] = useState<
    "inputting" | "correct" | "failed" | "submitting"
  >("inputting");

  const [shakeKey, setShakeKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonGoodRef = useRef<HTMLButtonElement>(null);
  const buttonAgainRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    setInputValue("");
    setWrongCount(0);
    setCardState("inputting");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIndex]);

  useEffect(() => {
    if (cardState === "correct") {
      setTimeout(() => buttonGoodRef.current?.focus(), 100);
    } else if (cardState === "failed") {
      setTimeout(() => buttonAgainRef.current?.focus(), 100);
    }
  }, [cardState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const normalizeString = (str: string) => str.toLowerCase().trim();

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardState !== "inputting") return;
    if (!inputValue.trim()) return;

    const answer = normalizeString(inputValue);
    const currentVocab = vocabularies[currentIndex];

    const isCorrect =
      answer === normalizeString(currentVocab.onyomi || "") ||
      answer === normalizeString(currentVocab.kunyomi || "") ||
      answer === normalizeString(currentVocab.meaning || "") ||
      answer === normalizeString(currentVocab.hanViet || "");

    if (isCorrect) {
      setCardState("correct");
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      if (newCount >= 3) {
        setCardState("failed");
      } else {
        setShakeKey((prev) => prev + 1);
        setInputValue("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
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
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col min-h-[540px] bg-[var(--color-paper-1)] rounded-2xl shadow-[var(--shadow-elevated)] p-8 border border-[var(--color-border-subtle)]">
          <Skeleton className="h-5 w-32 mb-8 mx-auto" />
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-36 w-36 rounded-2xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (isFinished || vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {vocabularies.length > 0 && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="max-w-md w-full bg-[var(--color-paper-1)] rounded-2xl p-10 text-center shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)] relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={34} className="text-[var(--color-emerald-1)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-ink-1)] mb-2">
            {vocabularies.length === 0
              ? "Không có từ đến hạn"
              : "Hoàn Tất Phiên Ôn Tập!"}
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] mb-8">
            {vocabularies.length === 0
              ? "Bạn không có chữ Hán nào cần ôn tập lúc này. Hãy nghỉ ngơi hoặc học thêm từ mới nhé."
              : `Bạn đã hoàn thành ôn tập ${vocabularies.length} chữ Hán theo lịch SM-2 hôm nay!`}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3.5 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Quay về Tổng quan
          </button>
        </motion.div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];
  const progress = (currentIndex / vocabularies.length) * 100;
  const isAnswerRevealed =
    cardState === "correct" ||
    cardState === "failed" ||
    cardState === "submitting";

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
        <button
          onClick={() => navigate("/")}
          className="p-2.5 rounded-xl text-[var(--color-ink-inverse-2)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Quay lại Tổng quan"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 max-w-md mx-6 flex items-center gap-4">
          <div className="h-2 flex-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-emerald-1)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-inverse-2)] tabular-nums">
            Còn {vocabularies.length - currentIndex}
          </span>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          key={currentVocab.id}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="w-full max-w-[440px] min-h-[540px] bg-[var(--color-paper-1)] rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden flex flex-col border border-[var(--color-border-subtle)]"
        >
          <div className="flex-1 flex flex-col justify-center">
            {/* Top: Kanji Display */}
            <motion.div
              layout
              className={clsx(
                "p-8 flex flex-col items-center text-center relative z-10",
                !isAnswerRevealed && "kanji-practice-grid flex-1 justify-center"
              )}
            >
              <span
                className={clsx(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-3 transition-colors",
                  wrongCount > 0 && !isAnswerRevealed
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-1)]"
                    : "bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border border-[var(--color-border-subtle)]"
                )}
              >
                {wrongCount > 0 && !isAnswerRevealed
                  ? `Nhập chưa đúng (${wrongCount}/3 lần)`
                  : "Ôn tập chủ động SRS"}
              </span>

              <motion.h1
                layout="position"
                className={clsx(
                  "font-serif font-bold text-[var(--color-ink-1)] leading-none transition-all duration-300",
                  isAnswerRevealed ? "text-[80px] my-2" : "text-[136px] my-6"
                )}
              >
                {currentVocab.kanji}
              </motion.h1>

              <AnimatePresence>
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={clsx(
                      "absolute top-5 right-5 p-2 rounded-full",
                      cardState === "correct"
                        ? "bg-emerald-50 text-[var(--color-emerald-1)]"
                        : "bg-[var(--color-accent-soft)] text-[var(--color-accent-1)]"
                    )}
                  >
                    {cardState === "correct" ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <X size={24} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Middle: Revealed Details */}
            <AnimatePresence>
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="px-8 pb-8 text-center relative z-0 origin-top"
                >
                  <div className="space-y-5 pt-5 hairline-t">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink-3)] mb-1">
                        Nghĩa tiếng Việt
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-ink-1)]">
                        {currentVocab.meaning}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink-3)] mb-1">
                        Âm Hán Việt
                      </p>
                      <p className="text-xl font-serif font-bold text-[var(--color-accent-1)]">
                        {currentVocab.hanViet || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-0.5">
                          Âm Onyomi
                        </span>
                        <span className="font-bold text-sm text-[var(--color-ink-1)]">
                          {currentVocab.onyomi || "—"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-0.5">
                          Âm Kunyomi
                        </span>
                        <span className="font-bold text-sm text-[var(--color-ink-1)]">
                          {currentVocab.kunyomi || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <div className="p-5 bg-[var(--color-paper-2)] hairline-t mt-auto">
            <AnimatePresence mode="wait">
              {!isAnswerRevealed ? (
                <motion.div
                  key="input-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <form onSubmit={handleInputSubmit} className="relative">
                    <motion.div
                      key={shakeKey}
                      initial={false}
                      animate={shakeKey > 0 ? { x: [-8, 8, -8, 8, 0] } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 12,
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Nhập nghĩa, âm Hán Việt hoặc cách đọc..."
                        className={clsx(
                          "w-full bg-[var(--color-paper-1)] text-[var(--color-ink-1)] border rounded-xl focus:outline-none py-3.5 px-4 text-sm transition-colors font-medium shadow-2xs",
                          wrongCount > 0
                            ? "border-[var(--color-accent-1)] bg-[var(--color-accent-soft)] text-[var(--color-accent-1)]"
                            : "border-[var(--color-border-strong)] focus:border-[var(--color-ink-1)]"
                        )}
                      />
                    </motion.div>
                  </form>
                  <button
                    type="button"
                    onClick={handleShowAnswer}
                    className="mt-3.5 text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] text-xs font-semibold transition-colors w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Chưa nhớ ra? Xem đáp án ngay</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="quality-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  {cardState === "correct" ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleSubmitQuality(0)}
                        className="py-2.5 bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-xs font-bold border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                      >
                        Học lại (0)
                      </button>
                      <button
                        onClick={() => handleSubmitQuality(3)}
                        className="py-2.5 bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-xs font-bold border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                      >
                        Hơi khó (3)
                      </button>
                      <button
                        ref={buttonGoodRef}
                        onClick={() => handleSubmitQuality(4)}
                        className="col-span-2 py-3.5 bg-[var(--color-emerald-1)] hover:opacity-95 text-white font-semibold text-sm rounded-xl transition-opacity shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-emerald-1)] focus:ring-offset-2 cursor-pointer"
                      >
                        Nhớ tốt — Tiếp tục (Enter)
                      </button>
                      <button
                        onClick={() => handleSubmitQuality(5)}
                        className="col-span-2 py-2.5 bg-[var(--color-paper-1)] text-[var(--color-ink-1)] text-xs font-bold border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                      >
                        Quá dễ — Tăng quãng nghỉ (5)
                      </button>
                    </div>
                  ) : (
                    <button
                      ref={buttonAgainRef}
                      onClick={() => handleSubmitQuality(0)}
                      className="w-full py-3.5 bg-[var(--color-accent-1)] hover:bg-[var(--color-accent-2)] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-1)] focus:ring-offset-2 cursor-pointer"
                    >
                      Ôn lại vào ngày mai (Enter)
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
