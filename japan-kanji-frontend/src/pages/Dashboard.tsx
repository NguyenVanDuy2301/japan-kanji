import { useEffect, useState } from "react";
import { Folder, Plus, ChevronRight, Settings, Share2, X, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deckService, type DeckResponse } from "../services/deck.service";
import { studyService } from "../services/study.service";
import { statisticsService, type StudyStatisticsResponse } from "../services/statistics.service";
import { useNavigate } from "react-router-dom";
import DeckCard from "../components/ui/DeckCard";
import Navbar from "../components/ui/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [officialDecks, setOfficialDecks] = useState<DeckResponse[]>([]);
  const [customDecks, setCustomDecks] = useState<DeckResponse[]>([]);
  const [savedDecks, setSavedDecks] = useState<DeckResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StudyStatisticsResponse | null>(null);
  const [dueReviewsCount, setDueReviewsCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckResponse | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [official, custom, saved, reviews, stats] = await Promise.all([
          deckService.getOfficialDecks(),
          user ? deckService.getCustomDecks() : Promise.resolve([]),
          deckService.getSavedDecks(),
          studyService.getDueReviews(),
          user ? statisticsService.getStatistics() : Promise.resolve(null)
        ]);
        setOfficialDecks(official);
        setCustomDecks(custom);
        setSavedDecks(saved);
        setDueReviewsCount(reviews.length);
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCreateOrUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    
    setIsCreating(true);
    try {
      if (editingDeck) {
        const updatedDeck = await deckService.updateCustomDeck(editingDeck.id, newDeckTitle, newDeckDescription);
        setCustomDecks(customDecks.map(d => d.id === editingDeck.id ? updatedDeck : d));
      } else {
        const newDeck = await deckService.createCustomDeck(newDeckTitle, newDeckDescription);
        setCustomDecks([...customDecks, newDeck]);
        navigate(`/decks/${newDeck.id}/manage`);
      }
      setIsCreateModalOpen(false);
      setEditingDeck(null);
      setNewDeckTitle("");
      setNewDeckDescription("");
    } catch (error) {
      console.error("Failed to save deck:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDeck = (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckToDelete(deckId);
  };

  const confirmDeleteDeck = async () => {
    if (deckToDelete === null) return;
    setIsDeleting(true);
    try {
      await deckService.deleteCustomDeck(deckToDelete);
      setCustomDecks(customDecks.filter(d => d.id !== deckToDelete));
      setDeckToDelete(null);
    } catch (error) {
      console.error("Failed to delete deck:", error);
      alert("Có lỗi xảy ra khi xoá bộ bài!");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (deck: DeckResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDeck(deck);
    setNewDeckTitle(deck.title);
    setNewDeckDescription(deck.description || "");
    setIsCreateModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingDeck(null);
    setNewDeckTitle("");
    setNewDeckDescription("");
    setIsCreateModalOpen(true);
  };

  const copyShareLink = (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/study/lesson/${deckId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Đã copy link chia sẻ vào Clipboard!");
    });
  };

  const handleUnsaveDeck = async (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deckService.unsaveDeck(deckId);
      setSavedDecks(savedDecks.filter(d => d.id !== deckId));
    } catch (error) {
      console.error("Failed to unsave deck:", error);
    }
  };

  const renderDeckActions = (deck: DeckResponse, type: 'official' | 'custom' | 'saved') => {
    return (
      <>
        {type === 'custom' && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/decks/${deck.id}/manage`); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
              title="Quản lý từ vựng"
            >
              <Settings size={18} /> Quản lý
            </button>
            <button 
              onClick={(e) => openEditModal(deck, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2"
              title="Chỉnh sửa bộ bài"
            >
              <Edit size={18} /> Chỉnh sửa
            </button>
            <button 
              onClick={(e) => copyShareLink(deck.id, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              title="Copy link chia sẻ"
            >
              <Share2 size={18} /> Chia sẻ
            </button>
            <div className="border-t border-neutral-100 my-1" />
            <button 
              onClick={(e) => handleDeleteDeck(deck.id, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
              title="Xoá bộ bài"
            >
              <Trash2 size={18} /> Xoá
            </button>
          </>
        )}

        {type === 'saved' && (
          <button 
            onClick={(e) => handleUnsaveDeck(deck.id, e)}
            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
            title="Bỏ lưu bộ bài"
          >
            <X size={18} /> Bỏ lưu
          </button>
        )}
      </>
    );
  };

  const renderDeckCard = (deck: DeckResponse, type: 'official' | 'custom' | 'saved') => {
    const onStudy = () => navigate(`/study/lesson/${deck.id}`);
    const actions = renderDeckActions(deck, type);

    return <DeckCard key={deck.id} deck={deck} type={type} actions={actions} onStudy={onStudy} />;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Progress Statistics */}
            {statistics && (statistics.masteredCount > 0 || statistics.learningCount > 0 || statistics.unseenCount > 0) && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Thống kê tiến độ</h2>
                    <p className="text-neutral-500 mt-1">Theo dõi lượng Kanji bạn đang học và đã ghi nhớ sâu.</p>
                  </div>
                  <div className="flex gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-neutral-700">Thuộc lòng: {statistics.masteredCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-neutral-700">Đang học: {statistics.learningCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                      <span className="text-neutral-700">Chưa học: {statistics.unseenCount}</span>
                    </div>
                  </div>
                </div>
                
                {(() => {
                  const total = statistics.masteredCount + statistics.learningCount + statistics.unseenCount;
                  const masteredPct = total > 0 ? (statistics.masteredCount / total) * 100 : 0;
                  const learningPct = total > 0 ? (statistics.learningCount / total) * 100 : 0;
                  const unseenPct = total > 0 ? (statistics.unseenCount / total) * 100 : 100;
                  
                  return (
                    <div className="h-6 w-full flex rounded-full overflow-hidden bg-neutral-100">
                      <div className="bg-green-500 h-full transition-all duration-1000 ease-out" style={{ width: `${masteredPct}%` }}></div>
                      <div className="bg-orange-400 h-full transition-all duration-1000 ease-out" style={{ width: `${learningPct}%` }}></div>
                      <div className="bg-neutral-200 h-full transition-all duration-1000 ease-out" style={{ width: `${unseenPct}%` }}></div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Due Reviews Banner */}
            {dueReviewsCount > 0 && (
              <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Đến giờ ôn tập rồi!</h2>
                  <p className="text-red-100">Bạn có <span className="font-bold text-xl">{dueReviewsCount}</span> chữ Kanji cần ôn tập hôm nay để không bị quên.</p>
                </div>
                <button 
                  onClick={() => navigate('/study/review')}
                  className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
                >
                  Bắt Đầu Ôn Tập
                </button>
              </div>
            )}
            
            {/* Official Decks Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Khóa Học Chính Thức</h2>
                  <p className="text-neutral-500 mt-1">Tuyển tập từ vựng chuẩn theo cấp độ JLPT.</p>
                </div>
              </div>
              
              {officialDecks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {officialDecks.map(deck => renderDeckCard(deck, 'official'))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 border-dashed p-12 text-center">
                  <p className="text-neutral-500">Hiện chưa có khóa học chính thức nào.</p>
                </div>
              )}
            </section>

            {/* Custom Decks Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Bộ Bài Của Bạn</h2>
                  <p className="text-neutral-500 mt-1">Bộ sưu tập chữ Hán cá nhân mà bạn muốn chinh phục.</p>
                </div>
                <button 
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Plus size={18} />
                  <span>Tạo Bộ Bài</span>
                </button>
              </div>
              
              {customDecks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {customDecks.map(deck => renderDeckCard(deck, 'custom'))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 border-dashed p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                    <Folder size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Chưa có bộ bài nào</h3>
                  <p className="text-neutral-500 max-w-sm mb-6">Tự tạo bộ bài để lưu trữ các chữ Kanji khó nhớ, hoặc từ vựng từ bộ anime yêu thích của bạn.</p>
                  <button 
                    onClick={openCreateModal}
                    className="text-red-600 font-semibold hover:text-red-700"
                  >
                    Tạo bộ bài đầu tiên →
                  </button>
                </div>
              )}
            </section>

            {/* Saved Decks Section */}
            {savedDecks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Tủ Sách (Đã Lưu)</h2>
                    <p className="text-neutral-500 mt-1">Những bộ bài bạn đã lưu lại để học sau.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedDecks.map(deck => renderDeckCard(deck, 'saved'))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      {/* Create Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900">{editingDeck ? "Chỉnh sửa bộ bài" : "Tạo bộ bài mới"}</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateDeck} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tên bộ bài</label>
                <input 
                  type="text" 
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  placeholder="Vd: Kanji anime yêu thích..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mô tả (tùy chọn)</label>
                <textarea 
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="Vd: Các chữ xuất hiện trong tập 1..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || !newDeckTitle.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isCreating ? "Đang lưu..." : (editingDeck ? "Lưu thay đổi" : "Tạo mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deckToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-transform">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Xoá bộ bài này?</h2>
              <p className="text-neutral-500 mb-6">
                Bạn có chắc chắn muốn xoá bộ bài này không? Tất cả từ vựng và tiến độ học tập liên quan sẽ <strong>bị mất vĩnh viễn</strong> và không thể khôi phục.
              </p>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setDeckToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button 
                  onClick={confirmDeleteDeck}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
