import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deckService, type DeckResponse } from '../services/deck.service';
import { studyService } from '../services/study.service';
import type { VocabularyResponse } from '../types/vocabulary.types';
import { vocabularyService } from '../services/vocabulary.service';
import { ArrowLeft, Search, Plus, Trash2, BookOpen } from 'lucide-react';

export default function DeckManager() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckResponse | null>(null);
  const [deckVocabs, setDeckVocabs] = useState<VocabularyResponse[]>([]);
  const [searchResults, setSearchResults] = useState<VocabularyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        studyService.getPractice(Number(deckId))
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
      const results = await vocabularyService.searchVocabularies(searchQuery, 0, 20);
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
      // Cập nhật lại list kết quả tìm kiếm nếu cần thiết
    } catch (error) {
      console.error("Failed to add vocabulary:", error);
    }
  };

  const handleRemoveVocabulary = async (vocabId: number) => {
    if (!deckId) return;
    try {
      await deckService.removeVocabulary(Number(deckId), vocabId);
      setDeckVocabs(deckVocabs.filter(v => v.id !== vocabId));
    } catch (error) {
      console.error("Failed to remove vocabulary:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-neutral-500 hover:text-red-600 transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <BookOpen className="text-red-600 mr-2" size={24} />
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Quản lý: {deck?.title}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Deck Vocabularies */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center justify-between">
            <span>Từ vựng trong bộ bài</span>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">{deckVocabs.length} từ</span>
          </h2>
          
          {deckVocabs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-200 rounded-xl">
              Chưa có từ vựng nào. Hãy tìm kiếm và thêm ở cột bên cạnh!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {deckVocabs.map(vocab => (
                <div key={vocab.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex gap-4 items-center">
                    <div className="text-3xl font-bold text-neutral-900 w-12 text-center">{vocab.kanji}</div>
                    <div>
                      <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-0.5">
                        {vocab.hanViet}
                      </div>
                      <div className="font-semibold text-neutral-800">{vocab.meaning}</div>
                      <div className="text-sm text-neutral-500 flex gap-2">
                        <span>{vocab.onyomi}</span>
                        <span className="text-neutral-300">|</span>
                        <span>{vocab.kunyomi}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveVocabulary(vocab.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa khỏi bộ bài"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Global Search */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Tìm kiếm từ vựng chung</h2>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasSearched(false); // Reset lại khi người dùng bắt đầu gõ ký tự mới
                }}
                placeholder="Nhập chữ Kanji, Hán Việt hoặc Nghĩa..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={isSearching}
              >
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {searchResults.map(vocab => {
              const isAlreadyAdded = deckVocabs.some(v => v.id === vocab.id);
              return (
                <div key={vocab.id} className={`flex items-center justify-between p-4 rounded-xl border ${isAlreadyAdded ? 'bg-neutral-50 border-neutral-100 opacity-60' : 'bg-white border-neutral-200 hover:border-red-300 transition-colors'}`}>
                  <div className="flex gap-4 items-center">
                    <div className="text-2xl font-bold text-neutral-900 w-10 text-center">{vocab.kanji}</div>
                    <div>
                      <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-0.5">
                        {vocab.hanViet}
                      </div>
                      <div className="font-semibold text-neutral-800">{vocab.meaning}</div>
                      <div className="text-xs text-neutral-500">{vocab.onyomi} / {vocab.kunyomi}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => !isAlreadyAdded && handleAddVocabulary(vocab)}
                    disabled={isAlreadyAdded}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                      isAlreadyAdded 
                        ? 'text-green-600 bg-green-50 font-medium'
                        : 'text-red-600 bg-red-50 hover:bg-red-100 font-semibold'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <span className="text-sm px-2">Đã thêm</span>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span className="text-sm pr-1">Thêm</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            
            {searchResults.length === 0 && !isSearching && hasSearched && searchQuery && (
              <div className="text-center py-8 text-neutral-500">
                Không tìm thấy từ vựng nào phù hợp với "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
