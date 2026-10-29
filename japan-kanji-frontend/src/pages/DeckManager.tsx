import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deckService, type DeckResponse } from "../services/deck.service";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { vocabularyService } from "../services/vocabulary.service";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  BookOpen,
  Check,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";

export default function DeckManager() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [deckVocabs, setDeckVocabs] = useState<VocabularyResponse[]>([]);
  const [searchResults, setSearchResults] = useState<VocabularyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeckData = useCallback(async () => {
    if (!deckId) return;
    setIsLoading(true);
    try {
      const [deckData, vocabsData] = await Promise.all([
        deckService.getDeck(Number(deckId)),
        studyService.getPractice(Number(deckId)),
      ]);
      setDeck(deckData);
      setDeckVocabs(vocabsData);
    } catch (error) {
      console.error("Failed to fetch deck data:", error);
      toast("Không thể tải thông tin bộ bài.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, toast]);

  useEffect(() => {
    fetchDeckData();
  }, [fetchDeckData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await vocabularyService.searchVocabularies(
        searchQuery,
        0,
        20
      );
      setSearchResults(results.content);
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      toast("Lỗi khi tìm kiếm từ vựng.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddVocabulary = async (vocab: VocabularyResponse) => {
    if (!deckId) return;
    try {
      await deckService.addVocabulary(Number(deckId), vocab.id);
      setDeckVocabs([...deckVocabs, vocab]);
      toast(`Đã thêm "${vocab.kanji}" vào bộ bài.`);
    } catch (error) {
      console.error("Failed to add vocabulary:", error);
      toast("Không thể thêm từ vựng này.", "error");
    }
  };

  const handleRemoveVocabulary = async (vocab: VocabularyResponse) => {
    if (!deckId) return;
    try {
      await deckService.removeVocabulary(Number(deckId), vocab.id);
      setDeckVocabs(deckVocabs.filter((v) => v.id !== vocab.id));
      toast(`Đã gỡ "${vocab.kanji}" khỏi bộ bài.`, "info");
    } catch (error) {
      console.error("Failed to remove vocabulary:", error);
      toast("Không thể xóa từ vựng khỏi bộ bài.", "error");
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-8">
          <header className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-8 w-64" />
            </div>
          </header>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
            <Skeleton className="h-full w-full rounded-2xl" />
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 hairline-b pb-5">
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] transition-colors group cursor-pointer"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Quay lại Tổng quan</span>
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-accent-1)] shadow-xs">
                <BookOpen size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-1)]">
                  {deck?.title}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] mt-0.5">
                  {deck?.description ||
                    "Thêm hoặc gỡ chữ Hán trong bộ bài cá nhân của bạn"}
                </p>
              </div>
            </div>
          </div>

          {deckVocabs.length > 0 && (
            <button
              onClick={() => navigate(`/study/lesson/${deckId}`)}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent-1)] hover:bg-[var(--color-accent-2)] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Play size={14} className="fill-current" />
              <span>Học bộ bài này ({deckVocabs.length})</span>
            </button>
          )}
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Left Column: Deck Vocabularies */}
          <div className="bg-[var(--color-paper-1)] rounded-2xl border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex flex-col min-h-[420px] max-h-[680px]">
            <div className="p-5 hairline-b flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--color-ink-1)]">
                Từ vựng trong bộ bài
              </h2>
              <span className="bg-[var(--color-paper-2)] text-[var(--color-ink-1)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-border-subtle)] tabular-nums">
                {deckVocabs.length} từ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[var(--color-paper-2)]/50">
              {deckVocabs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-ink-2)] border border-dashed border-[var(--color-border-strong)] rounded-xl p-10 bg-[var(--color-paper-1)]">
                  <BookOpen
                    size={36}
                    className="mb-3 text-[var(--color-ink-3)]"
                  />
                  <p className="font-semibold text-sm text-[var(--color-ink-1)] text-center">
                    Bộ bài đang trống
                  </p>
                  <p className="text-xs text-[var(--color-ink-2)] text-center mt-1">
                    Hãy tìm kiếm chữ Hán ở cột bên phải và bấm "Thêm" vào bộ
                    bài.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {deckVocabs.map((vocab) => (
                      <motion.div
                        key={vocab.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-colors group shadow-2xs"
                      >
                        <div className="flex gap-4 items-center min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] flex items-center justify-center text-2xl font-serif font-bold text-[var(--color-ink-1)] group-hover:text-[var(--color-accent-1)] transition-colors shrink-0">
                            {vocab.kanji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[var(--color-ink-1)] truncate">
                                {vocab.meaning}
                              </span>
                              <span className="text-[11px] font-bold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-md shrink-0">
                                {vocab.hanViet}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-[var(--color-ink-2)] mt-1 truncate">
                              {vocab.kunyomi || vocab.onyomi || "—"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveVocabulary(vocab)}
                          className="p-2.5 rounded-lg text-[var(--color-ink-3)] hover:text-white hover:bg-[var(--color-accent-1)] transition-colors cursor-pointer shrink-0"
                          title="Xóa khỏi bộ bài"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Global Search */}
          <div className="bg-[var(--color-paper-1)] rounded-2xl border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex flex-col min-h-[420px] max-h-[680px]">
            <div className="p-5 hairline-b">
              <h2 className="text-sm font-bold text-[var(--color-ink-1)] mb-3">
                Tìm kiếm từ Kho Từ Điển Chung
              </h2>
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(false);
                  }}
                  placeholder="Nhập Kanji, Hán Việt hoặc Nghĩa..."
                  className="w-full pl-10 pr-28 py-2.5 rounded-xl bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-ink-1)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors font-medium placeholder:text-[var(--color-ink-3)]"
                />
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-accent-1)] transition-colors"
                  size={17}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white px-3.5 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={isSearching}
                >
                  {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[var(--color-paper-2)]/50">
              <div className="space-y-2.5">
                {searchResults.map((vocab) => {
                  const isAlreadyAdded = deckVocabs.some(
                    (v) => v.id === vocab.id
                  );
                  return (
                    <div
                      key={vocab.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                        isAlreadyAdded
                          ? "bg-[var(--color-paper-2)] border-[var(--color-border-subtle)] opacity-75"
                          : "bg-[var(--color-paper-1)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] shadow-2xs"
                      }`}
                    >
                      <div className="flex gap-4 items-center min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] flex items-center justify-center text-2xl font-serif font-bold text-[var(--color-ink-1)] shrink-0">
                          {vocab.kanji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--color-ink-1)] truncate">
                              {vocab.meaning}
                            </span>
                            <span className="text-[11px] font-bold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-md shrink-0">
                              {vocab.hanViet}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-[var(--color-ink-2)] mt-1 truncate">
                            {vocab.kunyomi || vocab.onyomi || "—"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          !isAlreadyAdded && handleAddVocabulary(vocab)
                        }
                        disabled={isAlreadyAdded}
                        className={`px-3 py-2 rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5 shrink-0 ${
                          isAlreadyAdded
                            ? "text-[var(--color-emerald-1)] bg-emerald-50 border border-emerald-200 cursor-default"
                            : "text-white bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] cursor-pointer active:scale-95"
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check size={14} />
                            <span>Đã có</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Thêm</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {searchResults.length === 0 &&
                  !isSearching &&
                  hasSearched &&
                  searchQuery && (
                    <div className="text-center py-12 px-4 rounded-xl text-sm text-[var(--color-ink-2)] font-medium border border-dashed border-[var(--color-border-strong)] bg-[var(--color-paper-1)]">
                      Không tìm thấy từ vựng nào phù hợp với "{searchQuery}".
                    </div>
                  )}

                {!hasSearched && searchResults.length === 0 && (
                  <div className="text-center py-12 px-4 rounded-xl text-xs text-[var(--color-ink-3)] border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-paper-1)]/60">
                    Nhập từ khóa ở ô tìm kiếm phía trên để tra cứu kho từ vựng
                    toàn hệ thống.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
