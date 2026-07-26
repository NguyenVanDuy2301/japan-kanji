import { useEffect, useState } from "react";
import {
  Folder,
  Plus,
  Settings,
  Share2,
  X,
  Edit,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deckService, type DeckResponse } from "../services/deck.service";
import { studyService } from "../services/study.service";
import {
  statisticsService,
  type StudyStatisticsResponse,
} from "../services/statistics.service";
import { useNavigate } from "react-router-dom";
import DeckCard from "../components/ui/DeckCard";
import Sidebar from "../components/ui/Sidebar";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [officialDecks, setOfficialDecks] = useState<DeckResponse[]>([]);
  const [customDecks, setCustomDecks] = useState<DeckResponse[]>([]);
  const [savedDecks, setSavedDecks] = useState<DeckResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StudyStatisticsResponse | null>(
    null
  );
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
          user ? statisticsService.getStatistics() : Promise.resolve(null),
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
        const updatedDeck = await deckService.updateCustomDeck(
          editingDeck.id,
          newDeckTitle,
          newDeckDescription
        );
        setCustomDecks(
          customDecks.map((d) => (d.id === editingDeck.id ? updatedDeck : d))
        );
      } else {
        const newDeck = await deckService.createCustomDeck(
          newDeckTitle,
          newDeckDescription
        );
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
      setCustomDecks(customDecks.filter((d) => d.id !== deckToDelete));
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
      setSavedDecks(savedDecks.filter((d) => d.id !== deckId));
    } catch (error) {
      console.error("Failed to unsave deck:", error);
    }
  };

  const renderDeckActions = (
    deck: DeckResponse,
    type: "official" | "custom" | "saved"
  ) => {
    return (
      <>
        {type === "custom" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/decks/${deck.id}/manage`);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 flex items-center gap-2"
              title="Thêm/Xoá từ vựng"
            >
              <Settings size={18} /> Thêm/Xoá từ vựng
            </button>
            <button
              onClick={(e) => openEditModal(deck, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 flex items-center gap-2"
              title="Đổi tên bộ bài"
            >
              <Edit size={18} /> Đổi tên bộ bài
            </button>
            <button
              onClick={(e) => copyShareLink(deck.id, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 flex items-center gap-2"
              title="Copy link chia sẻ"
            >
              <Share2 size={18} /> Chia sẻ
            </button>
            <div className="hairline-b my-1" />
            <button
              onClick={(e) => handleDeleteDeck(deck.id, e)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--color-accent-1)] hover:bg-red-50 flex items-center gap-2"
              title="Xoá bộ bài"
            >
              <Trash2 size={18} /> Xoá
            </button>
          </>
        )}

        {type === "saved" && (
          <button
            onClick={(e) => handleUnsaveDeck(deck.id, e)}
            className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--color-accent-1)] hover:bg-red-50 flex items-center gap-2"
            title="Bỏ lưu bộ bài"
          >
            <X size={18} /> Bỏ lưu
          </button>
        )}
      </>
    );
  };

  const renderDeckCard = (
    deck: DeckResponse,
    type: "official" | "custom" | "saved"
  ) => {
    const onStudy = () => navigate(`/study/lesson/${deck.id}`);
    const actions = renderDeckActions(deck, type);

    return (
      <DeckCard
        key={deck.id}
        deck={deck}
        type={type}
        actions={actions}
        onStudy={onStudy}
      />
    );
  };

  return (
    <div className="flex h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[var(--color-ink-3)] border-t-[var(--color-ink-1)] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink-1)]">
                  Chào mừng trở lại, {user?.username}
                </h1>
                <p className="text-[var(--color-ink-2)] mt-1">
                  Hôm nay bạn muốn học chữ Hán nào?
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Stats & Due Reviews (Workbench Focus) */}
              <div className="lg:col-span-1 flex flex-col gap-8">
                {/* Due Reviews Card */}
                {dueReviewsCount > 0 ? (
                  <div className="bg-[var(--color-accent-1)] p-6 text-[var(--color-ink-inverse-1)] flex flex-col gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Đến giờ ôn tập</h3>
                      <p className="text-sm opacity-90">
                        {dueReviewsCount} từ vựng đang chờ được mài giũa.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/study/review")}
                      className="bg-white text-[var(--color-accent-1)] font-bold text-sm py-2.5 px-4 w-full hover:bg-neutral-50 transition-colors"
                    >
                      Bắt đầu ngay →
                    </button>
                  </div>
                ) : (
                  <div className="bg-[var(--color-paper-1)] p-6 hairline-b hairline-r border border-[oklch(0.90_0.01_250)]">
                    <h3 className="font-bold text-lg mb-1">Tất cả đã xong</h3>
                    <p className="text-sm text-[var(--color-ink-2)]">
                      Bạn không có từ vựng nào cần ôn tập lúc này.
                    </p>
                  </div>
                )}

                {/* Progress Statistics */}
                {statistics && (
                  <section className="bg-[var(--color-paper-1)] p-6 border border-[oklch(0.90_0.01_250)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-[var(--color-ink-1)] flex items-center gap-2">
                        <BarChart3 size={18} /> Thống kê tiến độ
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const total =
                          statistics.masteredCount +
                          statistics.learningCount +
                          statistics.unseenCount;
                        const masteredPct =
                          total > 0
                            ? (statistics.masteredCount / total) * 100
                            : 0;
                        const learningPct =
                          total > 0
                            ? (statistics.learningCount / total) * 100
                            : 0;
                        const unseenPct =
                          total > 0
                            ? (statistics.unseenCount / total) * 100
                            : 100;

                        return (
                          <div className="h-1.5 w-full flex bg-neutral-100">
                            <div
                              className="bg-neutral-800 transition-all duration-1000 ease-out"
                              style={{ width: `${masteredPct}%` }}
                            ></div>
                            <div
                              className="bg-neutral-400 transition-all duration-1000 ease-out"
                              style={{ width: `${learningPct}%` }}
                            ></div>
                            <div
                              className="bg-neutral-200 transition-all duration-1000 ease-out"
                              style={{ width: `${unseenPct}%` }}
                            ></div>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                          <p className="text-[var(--color-ink-2)] text-xs uppercase tracking-wider mb-0.5">
                            Thuộc lòng
                          </p>
                          <p className="font-bold">
                            {statistics.masteredCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--color-ink-2)] text-xs uppercase tracking-wider mb-0.5">
                            Đang học
                          </p>
                          <p className="font-bold text-neutral-500">
                            {statistics.learningCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--color-ink-2)] text-xs uppercase tracking-wider mb-0.5">
                            Chưa học
                          </p>
                          <p className="font-bold text-neutral-300">
                            {statistics.unseenCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Decks */}
              <div className="lg:col-span-2 space-y-12">
                {/* Official Decks */}
                <section>
                  <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight mb-4 hairline-b pb-2">
                    Khóa Học Chính Thức
                  </h2>
                  {officialDecks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {officialDecks.map((deck) =>
                        renderDeckCard(deck, "official")
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--color-paper-1)] border border-dashed border-[oklch(0.90_0.01_250)] p-8 text-center text-[var(--color-ink-2)] text-sm">
                      Hiện chưa có khóa học chính thức nào.
                    </div>
                  )}
                </section>

                {/* Custom Decks */}
                <section>
                  <div className="flex items-center justify-between mb-4 hairline-b pb-2">
                    <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight">
                      Bộ Bài Của Bạn
                    </h2>
                    <button
                      onClick={openCreateModal}
                      className="text-xs font-bold text-[var(--color-accent-1)] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> TẠO MỚI
                    </button>
                  </div>

                  {customDecks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {customDecks.map((deck) =>
                        renderDeckCard(deck, "custom")
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--color-paper-1)] border border-dashed border-[oklch(0.90_0.01_250)] p-8 text-center flex flex-col items-center">
                      <Folder size={24} className="text-neutral-300 mb-2" />
                      <p className="text-[var(--color-ink-2)] text-sm mb-4">
                        Bạn chưa tạo bộ bài nào.
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="text-xs font-bold bg-neutral-900 text-white px-4 py-2 hover:bg-black transition-colors"
                      >
                        Tạo Bộ Bài Đầu Tiên
                      </button>
                    </div>
                  )}
                </section>

                {/* Saved Decks */}
                {savedDecks.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight mb-4 hairline-b pb-2">
                      Tủ Sách Đã Lưu
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedDecks.map((deck) => renderDeckCard(deck, "saved"))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals remain structurally similar but stylized to match the new crisp look */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-paper-1)] w-full max-w-md shadow-2xl overflow-hidden border border-[oklch(0.90_0.01_250)]">
            <div className="px-6 py-4 hairline-b flex items-center justify-between bg-neutral-50">
              <h3 className="text-lg font-bold text-[var(--color-ink-1)]">
                {editingDeck ? "Chỉnh sửa bộ bài" : "Tạo bộ bài mới"}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateDeck} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-1.5">
                  Tên bộ bài
                </label>
                <input
                  type="text"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  placeholder="Vd: Kanji N5..."
                  className="w-full px-4 py-2.5 bg-[var(--color-paper-2)] border border-[oklch(0.90_0.01_250)] focus:outline-none focus:border-neutral-900 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wider mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--color-paper-2)] border border-[oklch(0.90_0.01_250)] focus:outline-none focus:border-neutral-900 transition-colors text-sm resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newDeckTitle.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-neutral-900 text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isCreating
                    ? "Đang lưu..."
                    : editingDeck
                      ? "Lưu thay đổi"
                      : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deckToDelete !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-paper-1)] w-full max-w-sm shadow-2xl overflow-hidden border border-[oklch(0.90_0.01_250)]">
            <div className="p-6">
              <h2 className="text-lg font-bold text-red-600 mb-2">
                Xác nhận xoá
              </h2>
              <p className="text-sm text-[var(--color-ink-2)] mb-6">
                Bạn có chắc chắn muốn xoá vĩnh viễn bộ bài này cùng toàn bộ tiến
                độ học tập?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeckToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmDeleteDeck}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
