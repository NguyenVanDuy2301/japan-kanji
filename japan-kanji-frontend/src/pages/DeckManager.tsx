import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deckService, type DeckResponse } from "../services/deck.service";
import { studyService } from "../services/study.service";
import type { VocabularyResponse } from "../types/vocabulary.types";
import { vocabularyService } from "../services/vocabulary.service";
import { ArrowLeft, Search, Plus, Trash2, BookOpen } from "lucide-react";
import Sidebar from "../components/ui/Sidebar";

export default function DeckManager() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [deckVocabs, setDeckVocabs] = useState<VocabularyResponse[]>([]);
  const [searchResults, setSearchResults] = useState<VocabularyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeckData();
  }, [deckId]);

  const fetchDeckData = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

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
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddVocabulary = async (vocab: VocabularyResponse) => {
    if (!deckId) return;
    try {
      await deckService.addVocabulary(Number(deckId), vocab.id);
      setDeckVocabs([...deckVocabs, vocab]);
    } catch (error) {
      console.error("Failed to add vocabulary:", error);
    }
  };

  const handleRemoveVocabulary = async (vocabId: number) => {
    if (!deckId) return;
    try {
      await deckService.removeVocabulary(Number(deckId), vocabId);
      setDeckVocabs(deckVocabs.filter((v) => v.id !== vocabId));
    } catch (error) {
      console.error("Failed to remove vocabulary:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-ink-3)] border-t-[var(--color-ink-1)] rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
          <header className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] w-fit transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Quay lại Tổng quan
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] flex items-center justify-center text-[var(--color-ink-1)] shadow-sm">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink-1)]">
                  {deck?.title}
                </h1>
                <p className="text-[var(--color-ink-2)]">
                  Quản lý kho từ vựng của bộ bài này
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
            {/* Left Column: Deck Vocabularies */}
            <div className="flex-1 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] shadow-sm flex flex-col min-h-0">
              <div className="p-6 hairline-b flex items-center justify-between bg-[var(--color-paper-1)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink-1)]">
                  Từ vựng hiện có
                </h2>
                <span className="bg-[var(--color-paper-2)] text-[var(--color-ink-1)] px-3 py-1 text-xs font-bold border border-[var(--color-ink-2)]">
                  {deckVocabs.length} TỪ
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-paper-2)]">
                {deckVocabs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-ink-2)] border-2 border-dashed border-[var(--color-ink-2)] p-10 bg-[var(--color-paper-1)]">
                    <BookOpen size={40} className="mb-4 opacity-50" />
                    <p className="font-medium text-center">
                      Chưa có chữ Kanji nào.
                      <br />
                      Hãy tìm kiếm và thêm ở cột bên cạnh.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deckVocabs.map((vocab) => (
                      <div
                        key={vocab.id}
                        className="flex items-center justify-between p-4 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] hover:border-[var(--color-ink-1)] transition-colors group"
                      >
                        <div className="flex gap-5 items-center">
                          <div className="text-3xl font-serif font-bold text-[var(--color-ink-1)] w-12 text-center group-hover:text-[var(--color-accent-1)] transition-colors">
                            {vocab.kanji}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                              {vocab.hanViet}
                            </div>
                            <div className="font-bold text-[var(--color-ink-1)] text-lg mb-1">
                              {vocab.meaning}
                            </div>
                            <div className="text-xs font-medium text-[var(--color-ink-2)]">
                              {vocab.kunyomi || vocab.onyomi || "—"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveVocabulary(vocab.id)}
                          className="p-3 text-[var(--color-ink-2)] hover:text-white hover:bg-[var(--color-accent-1)] border border-transparent hover:border-[var(--color-accent-1)] transition-all"
                          title="Xóa khỏi bộ bài"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Global Search */}
            <div className="flex-1 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] shadow-sm flex flex-col min-h-0">
              <div className="p-6 hairline-b bg-[var(--color-paper-1)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink-1)] mb-4">
                  Tìm kiếm & Thêm mới
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
                    className="w-full pl-12 pr-28 py-3 bg-[var(--color-paper-2)] border border-[var(--color-ink-2)] text-[var(--color-ink-1)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors shadow-inner font-medium placeholder:font-normal"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-ink-1)] transition-colors"
                    size={20}
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white px-4 text-sm font-bold transition-colors disabled:opacity-50"
                    disabled={isSearching}
                  >
                    {isSearching ? "ĐANG TÌM" : "TÌM KIẾM"}
                  </button>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-paper-2)]">
                <div className="space-y-3">
                  {searchResults.map((vocab) => {
                    const isAlreadyAdded = deckVocabs.some(
                      (v) => v.id === vocab.id
                    );
                    return (
                      <div
                        key={vocab.id}
                        className={`flex items-center justify-between p-4 border transition-colors ${isAlreadyAdded ? "bg-[var(--color-paper-2)] border-[var(--color-ink-2)] opacity-70" : "bg-[var(--color-paper-1)] border-[var(--color-ink-2)] hover:border-[var(--color-ink-1)]"}`}
                      >
                        <div className="flex gap-5 items-center">
                          <div className="text-2xl font-serif font-bold text-[var(--color-ink-1)] w-10 text-center">
                            {vocab.kanji}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1">
                              {vocab.hanViet}
                            </div>
                            <div className="font-bold text-[var(--color-ink-1)]">
                              {vocab.meaning}
                            </div>
                            <div className="text-xs font-medium text-[var(--color-ink-2)] mt-1">
                              {vocab.kunyomi || vocab.onyomi || "—"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            !isAlreadyAdded && handleAddVocabulary(vocab)
                          }
                          disabled={isAlreadyAdded}
                          className={`p-2 transition-all font-bold text-xs uppercase flex items-center gap-2 border ${
                            isAlreadyAdded
                              ? "text-[var(--color-ink-2)] bg-[var(--color-paper-1)] border-[var(--color-ink-2)] cursor-not-allowed"
                              : "text-[var(--color-ink-1)] bg-[var(--color-paper-1)] hover:bg-[var(--color-ink-1)] hover:text-white border-[var(--color-ink-1)]"
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <span className="px-1 py-1">Đã có</span>
                          ) : (
                            <>
                              <Plus size={16} />
                              <span className="pr-2 py-1">Thêm</span>
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
                      <div className="text-center py-12 text-[var(--color-ink-2)] font-medium border border-[var(--color-ink-2)] bg-[var(--color-paper-1)]">
                        Không tìm thấy từ vựng nào phù hợp với "{searchQuery}"
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
