import { useEffect, useState, useRef, useCallback } from "react";
import { Search, X, Edit3, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KanjiStrokeDraw } from "../components/kanji/KanjiStrokeDraw";
import { HandwritingPad } from "../components/kanji/HandwritingPad";
import { KanjiCardSkeleton } from "../components/ui/KanjiCardSkeleton";
import {
  kanjiService,
  type KanjiResponse,
  type KanjiDetailsResponse,
} from "../services/kanji.service";

const PAGE_SIZE = 30;

function formatReading(reading: string | null) {
  if (!reading) return [];
  return reading
    .split(",")
    .map((r) => {
      let cleaned = r.trim().replace(/\./g, "-");
      cleaned = cleaned.replace(/^-|-$/g, "");
      return cleaned;
    })
    .filter(Boolean);
}

function getCombinedReadings(kunyomi: string | null, onyomi: string | null) {
  const k = formatReading(kunyomi);
  const o = formatReading(onyomi);
  const combined = [...k, ...o];
  return combined.length > 0 ? combined.join(", ") : "—";
}

export default function KanjiDictionary() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [kanjis, setKanjis] = useState<KanjiResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKanji, setSelectedKanji] =
    useState<KanjiDetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showHandwritingPad, setShowHandwritingPad] = useState(false);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchKanjis = useCallback(async (q: string, p: number) => {
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const results = await kanjiService.searchKanji(q, p, PAGE_SIZE);
      if (p === 0) {
        setKanjis(results.content);
      } else {
        setKanjis((prev) => {
          const existingIds = new Set(prev.map((k) => k.id));
          const newItems = results.content.filter(
            (k) => !existingIds.has(k.id)
          );
          return [...prev, ...newItems];
        });
      }
      setTotalPages(results.totalPages);
      setPage(p);
    } catch (error) {
      console.error("Failed to search kanji:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Khi từ khoá tìm kiếm thay đổi, luôn reset về trang 0 và gọi duy nhất 1 lần
  useEffect(() => {
    setPage(0);
    setTotalPages(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
    fetchKanjis(debouncedQuery, 0);
  }, [debouncedQuery, fetchKanjis]);

  const hasMore = page < totalPages - 1;

  // Cuộn vô hạn bằng IntersectionObserver tự nhiên trên lưới CSS Grid (không bị cắt dòng cuối)
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !isFetchingRef.current) {
          fetchKanjis(debouncedQuery, page + 1);
        }
      },
      {
        root,
        rootMargin: "160px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, debouncedQuery, page, fetchKanjis]);

  const handleSelectKanji = async (character: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await kanjiService.getKanjiDetails(character);
      setSelectedKanji(details);
    } catch (error) {
      console.error("Failed to fetch kanji details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <>
      <main
        id="scroll-container"
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 relative"
      >
        <div className="max-w-6xl mx-auto space-y-10 pb-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--color-ink-1)] mb-2 tracking-tight">
              Từ Điển Hán Tự
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-ink-2)] mb-6">
              Tra cứu âm Hán Việt, bộ thủ, thứ tự nét viết và các từ ghép ứng
              dụng thực tế.
            </p>

            {/* Editorial Search Bar with Handwriting Trigger */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-accent-1)] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-28 py-4 rounded-2xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] focus:border-[var(--color-ink-1)] focus:outline-none text-base font-medium shadow-[var(--shadow-card)] transition-colors text-[var(--color-ink-1)] placeholder:text-[var(--color-ink-3)]"
                placeholder="Nhập chữ Hán, Romaji, hoặc Âm Hán Việt..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1.5 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={() => setShowHandwritingPad(!showHandwritingPad)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    showHandwritingPad
                      ? "bg-[var(--color-accent-1)] text-white"
                      : "bg-[var(--color-paper-2)] text-[var(--color-ink-1)] hover:bg-[var(--color-paper-3)] border border-[var(--color-border-subtle)]"
                  }`}
                  title="Tra bằng nét vẽ tay"
                >
                  <Edit3 size={15} />
                  <span className="hidden sm:inline">Vẽ tay</span>
                </button>
              </div>

              <AnimatePresence>
                {showHandwritingPad && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="absolute left-0 right-0 top-full mt-3 z-40"
                  >
                    <HandwritingPad
                      onSelect={(kanji) => {
                        setQuery((prev) => prev + kanji);
                      }}
                      onClose={() => setShowHandwritingPad(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {isLoading && kanjis.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <KanjiCardSkeleton key={i} />
              ))}
            </div>
          ) : kanjis.length === 0 && !isLoading ? (
            <div className="py-16 px-6 bg-[var(--color-paper-1)] rounded-2xl border border-dashed border-[var(--color-border-strong)] text-center flex flex-col items-center justify-center">
              <Search size={40} className="text-[var(--color-ink-3)] mb-3" />
              <p className="text-lg font-bold text-[var(--color-ink-1)]">
                Không tìm thấy chữ Hán phù hợp
              </p>
              <p className="text-sm text-[var(--color-ink-2)] mt-1">
                Hãy thử tìm bằng chữ Hán, âm Hán Việt hoặc mở bảng vẽ tay.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {kanjis.map((k) => (
                  <div
                    key={k.id}
                    onClick={() => handleSelectKanji(k.character)}
                    className="group bg-[var(--color-paper-1)] rounded-xl pt-6 flex flex-col items-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] cursor-pointer transition-all duration-200 hover:-translate-y-1 text-center overflow-hidden h-full"
                  >
                    <div className="text-5xl font-serif font-bold text-[var(--color-ink-1)] mb-3 group-hover:text-[var(--color-accent-1)] group-hover:scale-105 transition-all px-4 flex-1 flex items-center justify-center">
                      {k.character}
                    </div>
                    <div className="text-sm font-bold text-[var(--color-accent-1)] px-4">
                      {k.hanViet}
                    </div>
                    <div className="text-xs font-medium text-[var(--color-ink-2)] mt-0.5 line-clamp-1 px-4 pb-3">
                      {k.meaning}
                    </div>
                    <div
                      className="mt-auto px-4 py-2.5 w-full bg-[var(--color-paper-2)] border-t border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-ink-2)] truncate text-center"
                      title={getCombinedReadings(k.kunyomi, k.onyomi)}
                    >
                      {getCombinedReadings(k.kunyomi, k.onyomi)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Điểm mốc tự động tải thêm trang tiếp theo khi cuộn xuống gần cuối */}
              <div ref={loadMoreSentinelRef} className="h-4 w-full" />

              {isLoading && kanjis.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <KanjiCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Kanji Details Modal */}
      <AnimatePresence>
        {selectedKanji && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedKanji(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="bg-[var(--color-paper-1)] rounded-2xl max-w-3xl w-full shadow-[var(--shadow-elevated)] overflow-hidden max-h-[90vh] flex flex-col border border-[var(--color-border-subtle)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-4 hairline-b flex items-center justify-between bg-[var(--color-paper-2)]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink-2)]">
                  <BookOpen
                    size={15}
                    className="text-[var(--color-accent-1)]"
                  />
                  <span>Chi tiết Hán tự & Thứ tự nét viết</span>
                </div>
                <button
                  onClick={() => setSelectedKanji(null)}
                  className="text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] p-1.5 rounded-lg hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                {isLoadingDetails ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-1)] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <div className="flex-shrink-0">
                        <KanjiStrokeDraw kanji={selectedKanji.character} />
                      </div>
                      <div className="flex-1 space-y-5 w-full text-center md:text-left">
                        <div>
                          <span className="inline-block text-xs font-bold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] px-2.5 py-1 rounded-md mb-2">
                            Âm Hán Việt
                          </span>
                          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--color-ink-1)]">
                            {selectedKanji.hanViet}
                          </h2>
                          <p className="text-lg font-medium text-[var(--color-ink-2)] mt-1">
                            {selectedKanji.meaning}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="bg-[var(--color-paper-2)] rounded-xl p-3.5 border border-[var(--color-border-subtle)]">
                            <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-1">
                              Số nét viết
                            </span>
                            <span className="font-bold text-lg text-[var(--color-ink-1)] tabular-nums">
                              {selectedKanji.strokeCount} nét
                            </span>
                          </div>
                          <div className="bg-[var(--color-paper-2)] rounded-xl p-3.5 border border-[var(--color-border-subtle)]">
                            <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-1">
                              Bộ thủ
                            </span>
                            <span className="font-serif font-bold text-lg text-[var(--color-accent-1)]">
                              {selectedKanji.radical || "—"}
                            </span>
                          </div>
                          <div className="bg-[var(--color-paper-2)] rounded-xl p-3.5 border border-[var(--color-border-subtle)]">
                            <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-1">
                              Âm Onyomi
                            </span>
                            <span className="font-semibold text-sm text-[var(--color-ink-1)]">
                              {selectedKanji.onyomi
                                ? formatReading(selectedKanji.onyomi).join(", ")
                                : "—"}
                            </span>
                          </div>
                          <div className="bg-[var(--color-paper-2)] rounded-xl p-3.5 border border-[var(--color-border-subtle)]">
                            <span className="block text-[11px] font-semibold text-[var(--color-ink-2)] mb-1">
                              Âm Kunyomi
                            </span>
                            <span className="font-semibold text-sm text-[var(--color-ink-1)]">
                              {selectedKanji.kunyomi
                                ? formatReading(selectedKanji.kunyomi).join(
                                    ", "
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Examples Section */}
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-ink-1)] mb-4 hairline-b pb-2.5">
                        Từ vựng có chứa chữ {selectedKanji.character}
                      </h3>

                      {selectedKanji.examples &&
                      selectedKanji.examples.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedKanji.examples.map((ex) => (
                            <div
                              key={ex.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-paper-2)]/70 hover:bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] transition-colors gap-3"
                            >
                              <div>
                                <span className="text-2xl font-serif font-bold text-[var(--color-ink-1)] block">
                                  {ex.kanji}
                                </span>
                                <span className="text-xs font-medium text-[var(--color-ink-2)] mt-0.5 block">
                                  {formatReading(ex.kunyomi || ex.onyomi).join(
                                    ", "
                                  )}{" "}
                                  ({ex.hanViet})
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm text-[var(--color-ink-1)] block">
                                  {ex.meaning}
                                </span>
                                <span className="inline-block text-[10px] font-bold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-md mt-1">
                                  {ex.jlptLevel}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 rounded-xl bg-[var(--color-paper-2)] text-sm text-[var(--color-ink-2)] border border-[var(--color-border-subtle)]">
                          Chưa có từ vựng ví dụ nào trong hệ thống.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
