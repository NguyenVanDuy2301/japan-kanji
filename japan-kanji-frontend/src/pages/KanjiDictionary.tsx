import { useEffect, useState, forwardRef } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { Search, X, Edit3 } from "lucide-react";
import Sidebar from "../components/ui/Sidebar";
import { KanjiStrokeDraw } from "../components/kanji/KanjiStrokeDraw";
import { HandwritingPad } from "../components/kanji/HandwritingPad";
import { KanjiCardSkeleton } from "../components/ui/KanjiCardSkeleton";
import {
  kanjiService,
  type KanjiResponse,
  type KanjiDetailsResponse,
} from "../services/kanji.service";

export default function KanjiDictionary() {
  const formatReading = (reading: string | null) => {
    if (!reading) return [];
    return reading
      .split(",")
      .map((r) => {
        let cleaned = r.trim().replace(/\./g, "-");
        cleaned = cleaned.replace(/^-|-$/g, "");
        return cleaned;
      })
      .filter(Boolean);
  };

  const getCombinedReadings = (
    kunyomi: string | null,
    onyomi: string | null
  ) => {
    const k = formatReading(kunyomi);
    const o = formatReading(onyomi);
    const combined = [...k, ...o];
    return combined.length > 0 ? combined.join(", ") : "—";
  };

  const [query, setQuery] = useState("");
  const [kanjis, setKanjis] = useState<KanjiResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKanji, setSelectedKanji] =
    useState<KanjiDetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showHandwritingPad, setShowHandwritingPad] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    setPage(0);
    setKanjis([]);
  }, [debouncedQuery]);

  useEffect(() => {
    fetchKanjis(debouncedQuery, page);
  }, [debouncedQuery, page]);

  const fetchKanjis = async (q: string, p: number) => {
    setIsLoading(true);
    try {
      const results = await kanjiService.searchKanji(q, p, 15);
      if (p === 0) {
        setKanjis(results.content);
      } else {
        setKanjis((prev) => {
          // Prevent duplicates by checking ids
          const existingIds = new Set(prev.map((k) => k.id));
          const newItems = results.content.filter(
            (k) => !existingIds.has(k.id)
          );
          return [...prev, ...newItems];
        });
      }
      setTotalPages(results.totalPages);
    } catch (error) {
      console.error("Failed to search kanji:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const loadMore = () => {
    if (!isLoading && page < totalPages - 1) {
      setPage((p) => p + 1);
    }
  };

  const GridContainer = forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {props.children}
      </div>
    );
  });
  GridContainer.displayName = "GridContainer";

  return (
    <div className="flex h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
      <Sidebar />

      <main
        id="scroll-container"
        ref={setScrollParent}
        className="flex-1 overflow-y-auto p-8 lg:p-12 relative"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-extrabold text-[var(--color-ink-1)] mb-4 tracking-tight">
              Từ Điển Kanji
            </h1>
            <p className="text-lg text-[var(--color-ink-2)] mb-8">
              Tra cứu thông tin chữ Hán, bộ thủ, số nét và các từ vựng liên quan
              một cách nhanh chóng.
            </p>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-accent-1)] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-16 py-5 rounded-none bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] focus:border-[var(--color-ink-1)] focus:ring-0 text-lg shadow-sm transition-all focus:shadow-md text-[var(--color-ink-1)] placeholder:text-[var(--color-ink-3)]"
                placeholder="Nhập chữ Hán, Romaji, hoặc Nghĩa Hán Việt..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  onClick={() => setShowHandwritingPad(!showHandwritingPad)}
                  className={`p-2 rounded-full transition-colors ${
                    showHandwritingPad
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-neutral-100"
                  }`}
                  title="Tra bằng nét vẽ"
                >
                  <Edit3 size={20} />
                </button>
              </div>

              {/* Popover Bảng vẽ */}
              {showHandwritingPad && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 animate-in fade-in slide-in-from-top-2">
                  <HandwritingPad
                    onSelect={(kanji) => {
                      setQuery((prev) => prev + kanji);
                    }}
                    onClose={() => setShowHandwritingPad(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {isLoading && !kanjis.length ? (
            <GridContainer>
              {Array.from({ length: 15 }).map((_, i) => (
                <KanjiCardSkeleton key={i} />
              ))}
            </GridContainer>
          ) : kanjis.length === 0 && !isLoading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <Search size={48} className="text-[var(--color-ink-3)] mb-4" />
              <p className="text-xl font-bold text-[var(--color-ink-1)]">
                Không tìm thấy chữ Hán
              </p>
              <p className="text-[var(--color-ink-2)] mt-2">
                Vui lòng thử lại với một từ khóa khác.
              </p>
            </div>
          ) : (
            scrollParent && (
              <VirtuosoGrid
                customScrollParent={scrollParent}
                data={kanjis}
                endReached={loadMore}
                useWindowScroll={false}
                overscan={200}
                components={{
                  List: GridContainer,
                  Footer: () =>
                    isLoading ? (
                      <div className="mt-6">
                        <GridContainer>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <KanjiCardSkeleton key={i} />
                          ))}
                        </GridContainer>
                      </div>
                    ) : null,
                }}
                itemContent={(_, k) => (
                  <div
                    key={k.id}
                    onClick={() => handleSelectKanji(k.character)}
                    className="bg-[var(--color-paper-1)] pt-6 flex flex-col items-center shadow-sm hover:shadow-lg border border-[var(--color-ink-2)] cursor-pointer transition-all hover:border-[var(--color-ink-1)] hover:-translate-y-1 text-center group overflow-hidden h-full"
                  >
                    <div className="text-5xl font-serif font-bold text-[var(--color-ink-1)] mb-4 group-hover:text-[var(--color-accent-1)] transition-colors px-6 flex-1 flex items-center justify-center">
                      {k.character}
                    </div>
                    <div className="text-lg font-bold text-[var(--color-ink-1)] px-6">
                      {k.hanViet}
                    </div>
                    <div className="text-sm text-[var(--color-ink-2)] mt-1 line-clamp-1 px-6 pb-2">
                      {k.meaning}
                    </div>
                    <div
                      className="mt-auto px-6 py-2.5 w-full bg-[var(--color-paper-2)] border-t border-[var(--color-ink-2)] text-sm font-medium text-[var(--color-ink-1)] truncate text-center"
                      title={getCombinedReadings(k.kunyomi, k.onyomi)}
                    >
                      {getCombinedReadings(k.kunyomi, k.onyomi)}
                    </div>
                  </div>
                )}
              />
            )
          )}
        </div>
      </main>

      {/* Kanji Details Modal */}
      {selectedKanji && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedKanji(null)}
        >
          <div
            className="bg-[var(--color-paper-1)] max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transform transition-transform animate-in fade-in zoom-in-95 duration-200 border border-[oklch(0.85_0.01_250)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 py-5 hairline-b flex items-center justify-between bg-[var(--color-paper-1)]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink-2)]">
                Chi tiết chữ Hán
              </h3>
              <button
                onClick={() => setSelectedKanji(null)}
                className="text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] p-2 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-[var(--color-ink-3)] border-t-[var(--color-ink-1)] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex-shrink-0">
                      <KanjiStrokeDraw kanji={selectedKanji.character} />
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                      <div>
                        <h2 className="text-4xl font-bold text-[var(--color-ink-1)] mb-2">
                          {selectedKanji.hanViet}
                        </h2>
                        <p className="text-xl text-[var(--color-ink-2)]">
                          {selectedKanji.meaning}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-px bg-[var(--color-ink-2)] border border-[var(--color-ink-2)]">
                        <div className="bg-[var(--color-paper-1)] p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">
                            Số nét
                          </span>
                          <span className="font-medium text-lg text-[var(--color-ink-1)]">
                            {selectedKanji.strokeCount}
                          </span>
                        </div>
                        <div className="bg-[var(--color-paper-1)] p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">
                            Bộ thủ
                          </span>
                          <span className="font-serif font-bold text-lg text-[var(--color-accent-1)]">
                            {selectedKanji.radical}
                          </span>
                        </div>
                        <div className="bg-[var(--color-paper-1)] p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">
                            Onyomi
                          </span>
                          <span className="font-medium text-[var(--color-ink-1)]">
                            {selectedKanji.onyomi
                              ? formatReading(selectedKanji.onyomi).join(", ")
                              : "-"}
                          </span>
                        </div>
                        <div className="bg-[var(--color-paper-1)] p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">
                            Kunyomi
                          </span>
                          <span className="font-medium text-[var(--color-ink-1)]">
                            {selectedKanji.kunyomi
                              ? formatReading(selectedKanji.kunyomi).join(", ")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Examples Section */}
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-ink-1)] uppercase tracking-widest mb-6 border-b border-[var(--color-ink-2)] pb-2">
                      Từ vựng ví dụ
                    </h3>

                    {selectedKanji.examples &&
                    selectedKanji.examples.length > 0 ? (
                      <div className="flex flex-col border border-[var(--color-ink-2)] bg-[var(--color-paper-1)] divide-y divide-[var(--color-ink-2)]">
                        {selectedKanji.examples.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[var(--color-paper-2)] transition-colors gap-4"
                          >
                            <div className="flex flex-col">
                              <span className="text-2xl font-serif font-bold text-[var(--color-ink-1)] mb-1">
                                {ex.kanji}
                              </span>
                              <span className="text-sm text-[var(--color-ink-2)]">
                                {formatReading(ex.kunyomi || ex.onyomi).join(
                                  ", "
                                )}{" "}
                                • {ex.hanViet}
                              </span>
                            </div>
                            <div className="sm:text-right flex flex-col sm:items-end">
                              <span className="font-bold text-[var(--color-ink-1)] text-lg mb-1">
                                {ex.meaning}
                              </span>
                              <span className="text-[10px] font-bold tracking-wider text-[var(--color-ink-2)] border border-[var(--color-ink-2)] px-2 py-0.5 mt-1 self-start sm:self-end bg-[var(--color-paper-1)]">
                                {ex.jlptLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border border-[var(--color-ink-2)]">
                        Chưa có từ vựng ví dụ nào trong hệ thống.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
