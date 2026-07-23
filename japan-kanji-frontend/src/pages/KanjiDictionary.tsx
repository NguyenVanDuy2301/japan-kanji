import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import Navbar from "../components/ui/Navbar";
import { kanjiService, type KanjiResponse, type KanjiDetailsResponse } from "../services/kanji.service";

export default function KanjiDictionary() {
  const [query, setQuery] = useState("");
  const [kanjis, setKanjis] = useState<KanjiResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<KanjiDetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset trang về 0 khi từ khóa thay đổi
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery]);

  // Fetch data ngay lập tức khi page hoặc debouncedQuery thay đổi
  useEffect(() => {
    fetchKanjis(debouncedQuery, page);
  }, [debouncedQuery, page]);

  const fetchKanjis = async (q: string, p: number) => {
    setIsLoading(true);
    try {
      const results = await kanjiService.searchKanji(q, p, 10);
      setKanjis(results.content);
      setTotalPages(results.totalPages);
      
      // Cuộn lên mượt mà khi đổi trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Từ Điển Kanji</h1>
          <p className="text-lg text-neutral-600 mb-8">
            Tra cứu thông tin chữ Hán, bộ thủ, số nét và các từ vựng liên quan một cách nhanh chóng.
          </p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-red-500 focus:ring-0 text-lg shadow-sm transition-colors"
              placeholder="Nhập chữ Hán, Romaji, hoặc Nghĩa Hán Việt..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading && !kanjis.length ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {kanjis.map((k) => (
              <div 
                key={k.id} 
                onClick={() => handleSelectKanji(k.character)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-neutral-200 cursor-pointer transition-all hover:border-red-300 text-center flex flex-col items-center group"
              >
                <div className="text-5xl font-bold text-neutral-800 mb-4 group-hover:text-red-600 transition-colors">
                  {k.character}
                </div>
                <div className="text-lg font-bold text-neutral-700">{k.hanViet}</div>
                <div className="text-sm text-neutral-500 mt-1 line-clamp-1">{k.meaning}</div>
                <div className="mt-3 px-3 py-1 bg-neutral-100 text-xs font-semibold rounded-full text-neutral-600">
                  {k.jlptLevel}
                </div>
              </div>
            ))}
            
            {kanjis.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center text-neutral-500">
                Không tìm thấy chữ Kanji nào phù hợp.
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-6 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              Trang trước
            </button>
            <span className="text-neutral-500 font-medium">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="px-6 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              Trang sau
            </button>
          </div>
        )}
      </main>

      {/* Kanji Details Modal */}
      {selectedKanji && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
          onClick={() => setSelectedKanji(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transform transition-transform animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-red-600 text-white">
              <h3 className="text-xl font-bold">Chi tiết chữ Hán</h3>
              <button 
                onClick={() => setSelectedKanji(null)}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Top Section */}
                  <div className="flex gap-8 items-start">
                    <div className="flex-shrink-0 w-32 h-32 bg-neutral-50 rounded-2xl border-2 border-neutral-200 flex items-center justify-center text-7xl font-bold text-neutral-800 shadow-inner">
                      {selectedKanji.character}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-3xl font-bold text-neutral-900">{selectedKanji.hanViet}</h2>
                        <p className="text-lg text-neutral-600">{selectedKanji.meaning}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div className="text-neutral-500 mb-1">Số nét</div>
                          <div className="font-bold text-neutral-800">{selectedKanji.strokeCount}</div>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div className="text-neutral-500 mb-1">Bộ thủ</div>
                          <div className="font-bold text-neutral-800">{selectedKanji.radical}</div>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div className="text-neutral-500 mb-1">Onyomi</div>
                          <div className="font-bold text-neutral-800">{selectedKanji.onyomi || "-"}</div>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div className="text-neutral-500 mb-1">Kunyomi</div>
                          <div className="font-bold text-neutral-800">{selectedKanji.kunyomi || "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Examples Section */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2">Từ vựng ví dụ</h3>
                    {selectedKanji.examples && selectedKanji.examples.length > 0 ? (
                      <div className="space-y-3">
                        {selectedKanji.examples.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-red-300 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-neutral-800">{ex.kanji}</span>
                              <span className="text-sm text-neutral-500">
                                {ex.kunyomi || ex.onyomi} • {ex.hanViet}
                              </span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="font-medium text-neutral-700">{ex.meaning}</span>
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md mt-1">{ex.jlptLevel}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-neutral-50 rounded-xl text-neutral-500 border border-neutral-100">
                        Chưa có từ vựng nào chứa chữ Hán này trong hệ thống.
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
