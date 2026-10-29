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
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { deckService, type DeckResponse } from "../services/deck.service";
import { studyService } from "../services/study.service";
import {
  statisticsService,
  type StudyStatisticsResponse,
} from "../services/statistics.service";
import { useNavigate } from "react-router-dom";
import DeckCard from "../components/ui/DeckCard";
import { Skeleton } from "../components/ui/Skeleton";
import { StatCardSkeleton } from "../components/ui/StatCardSkeleton";
import { DeckCardSkeleton } from "../components/ui/DeckCardSkeleton";
import { BadgeShowcase } from "../components/ui/BadgeShowcase";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { useToast } from "../components/ui/Toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        toast("Không thể tải dữ liệu trang tổng quan.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

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
        toast("Đã cập nhật thông tin bộ bài.");
      } else {
        const newDeck = await deckService.createCustomDeck(
          newDeckTitle,
          newDeckDescription
        );
        setCustomDecks([...customDecks, newDeck]);
        toast("Đã tạo bộ bài mới thành công!");
        navigate(`/decks/${newDeck.id}/manage`);
      }
      setIsCreateModalOpen(false);
      setEditingDeck(null);
      setNewDeckTitle("");
      setNewDeckDescription("");
    } catch (error) {
      console.error("Failed to save deck:", error);
      toast("Có lỗi xảy ra khi lưu bộ bài.", "error");
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
      toast("Đã xoá bộ bài thành công.");
    } catch (error) {
      console.error("Failed to delete deck:", error);
      toast("Có lỗi xảy ra khi xoá bộ bài!", "error");
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
      toast("Đã sao chép đường dẫn chia sẻ vào Clipboard!");
    });
  };

  const handleUnsaveDeck = async (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deckService.unsaveDeck(deckId);
      setSavedDecks(savedDecks.filter((d) => d.id !== deckId));
      toast("Đã bỏ lưu bộ bài khỏi tủ sách.", "info");
    } catch (error) {
      console.error("Failed to unsave deck:", error);
      toast("Không thể bỏ lưu bộ bài lúc này.", "error");
    }
  };

  const renderDeckActions = (
    deck: DeckResponse,
    type: "official" | "custom" | "saved"
  ) => {
    if (type === "official") return null;

    return (
      <>
        {type === "custom" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/decks/${deck.id}/manage`);
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)] flex items-center gap-2.5 cursor-pointer"
              title="Thêm/Xoá từ vựng"
            >
              <Settings size={15} /> Quản lý từ vựng
            </button>
            <button
              onClick={(e) => openEditModal(deck, e)}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)] flex items-center gap-2.5 cursor-pointer"
              title="Đổi tên bộ bài"
            >
              <Edit size={15} /> Chỉnh sửa thông tin
            </button>
            <button
              onClick={(e) => copyShareLink(deck.id, e)}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)] flex items-center gap-2.5 cursor-pointer"
              title="Copy link chia sẻ"
            >
              <Share2 size={15} /> Sao chép link chia sẻ
            </button>
            <div className="hairline-b my-1" />
            <button
              onClick={(e) => handleDeleteDeck(deck.id, e)}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-accent-1)] hover:bg-[var(--color-accent-soft)] flex items-center gap-2.5 cursor-pointer"
              title="Xoá bộ bài"
            >
              <Trash2 size={15} /> Xoá bộ bài
            </button>
          </>
        )}

        {type === "saved" && (
          <button
            onClick={(e) => handleUnsaveDeck(deck.id, e)}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-accent-1)] hover:bg-[var(--color-accent-soft)] flex items-center gap-2.5 cursor-pointer"
            title="Bỏ lưu bộ bài"
          >
            <X size={15} /> Bỏ lưu khỏi tủ sách
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
    <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12">
      {isLoading ? (
        <div className="max-w-6xl mx-auto space-y-10">
          <header>
            <Skeleton className="h-9 w-80 mb-2" />
            <Skeleton className="h-5 w-60" />
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <DeckCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto space-y-10"
        >
          {/* Editorial Welcome Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 hairline-b pb-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-1)]">
                Chào mừng trở lại, {user?.username}
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-ink-2)] mt-1.5">
                Duy trì nhịp độ ôn tập mỗi ngày để khắc sâu trí nhớ chữ Hán dài
                hạn.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-paper-1)] hover:bg-[var(--color-paper-3)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-ink-1)] shadow-2xs transition-colors cursor-pointer active:scale-95"
            >
              <Plus size={15} className="text-[var(--color-accent-1)]" />
              <span>Tạo bộ bài riêng</span>
            </button>
          </header>

          {/* Badges Showcase */}
          <BadgeShowcase />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: SRS Review Banner & Progress Bento */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Due Reviews Card */}
              {dueReviewsCount > 0 ? (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden rounded-2xl bg-[var(--color-accent-1)] p-6 text-[var(--color-ink-inverse-1)] shadow-[var(--shadow-elevated)] flex flex-col gap-5"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-4 -bottom-6 font-serif text-[120px] font-bold text-white/10 leading-none select-none pointer-events-none"
                  >
                    復
                  </span>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3">
                      <Flame size={14} />
                      <span>Đến hạn ôn tập hôm nay</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <AnimatedNumber
                        value={dueReviewsCount}
                        className="text-4xl font-extrabold"
                      />
                      <span className="text-sm font-medium opacity-90">
                        từ vựng cần ôn lại
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mt-1.5 leading-relaxed">
                      Thuật toán SM-2 đã lọc sẵn các chữ Hán đúng thời điểm vàng
                      để củng cố trí nhớ.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/study/review")}
                    className="relative z-10 bg-[var(--color-paper-1)] text-[var(--color-accent-1)] font-bold text-sm py-3 px-4 rounded-xl w-full hover:bg-[var(--color-paper-2)] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <span>Bắt đầu ôn tập ngay</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <div className="bg-[var(--color-paper-1)] rounded-2xl p-6 border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[var(--color-emerald-1)] border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-ink-1)]">
                      Hoàn tất lịch ôn tập!
                    </h3>
                    <p className="text-xs text-[var(--color-ink-2)] mt-1 leading-relaxed">
                      Bạn không còn chữ Hán nào đến hạn lúc này. Hãy chọn một bộ
                      bài bên cạnh để học từ mới nhé.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Statistics Card */}
              {statistics && (
                <section className="bg-[var(--color-paper-1)] rounded-2xl p-6 border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-base text-[var(--color-ink-1)] flex items-center gap-2">
                      <BarChart3
                        size={18}
                        className="text-[var(--color-accent-1)]"
                      />
                      <span>Thống kê tiến độ</span>
                    </h2>
                    <span className="text-xs font-semibold text-[var(--color-ink-2)] tabular-nums">
                      Tổng{" "}
                      {(
                        statistics.masteredCount +
                        statistics.learningCount +
                        statistics.unseenCount
                      ).toLocaleString("vi-VN")}{" "}
                      từ
                    </span>
                  </div>

                  <div className="space-y-5">
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
                        <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-[var(--color-paper-3)] gap-0.5">
                          <div
                            className="bg-[var(--color-emerald-1)] transition-all duration-700 ease-out"
                            style={{ width: `${masteredPct}%` }}
                            title={`Thuộc lòng: ${statistics.masteredCount}`}
                          />
                          <div
                            className="bg-[var(--color-accent-1)] transition-all duration-700 ease-out"
                            style={{ width: `${learningPct}%` }}
                            title={`Đang học: ${statistics.learningCount}`}
                          />
                          <div
                            className="bg-[var(--color-paper-3)] transition-all duration-700 ease-out"
                            style={{ width: `${unseenPct}%` }}
                            title={`Chưa học: ${statistics.unseenCount}`}
                          />
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-emerald-1)]" />
                          <span className="text-[11px] font-semibold text-[var(--color-ink-2)]">
                            Thuộc lòng
                          </span>
                        </div>
                        <AnimatedNumber
                          value={statistics.masteredCount}
                          className="text-xl font-extrabold text-[var(--color-ink-1)]"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-1)]" />
                          <span className="text-[11px] font-semibold text-[var(--color-ink-2)]">
                            Đang học
                          </span>
                        </div>
                        <AnimatedNumber
                          value={statistics.learningCount}
                          className="text-xl font-extrabold text-[var(--color-ink-1)]"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-ink-3)]" />
                          <span className="text-[11px] font-semibold text-[var(--color-ink-2)]">
                            Chưa học
                          </span>
                        </div>
                        <AnimatedNumber
                          value={statistics.unseenCount}
                          className="text-xl font-extrabold text-[var(--color-ink-2)]"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Decks */}
            <div className="lg:col-span-2 space-y-10">
              {/* Official Decks */}
              <section>
                <div className="flex items-center justify-between mb-4 hairline-b pb-2.5">
                  <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight flex items-center gap-2">
                    <Sparkles
                      size={17}
                      className="text-[var(--color-accent-1)]"
                    />
                    <span>Khóa Học Chính Thức</span>
                  </h2>
                  <span className="text-xs font-semibold text-[var(--color-ink-2)] tabular-nums">
                    {officialDecks.length} bộ bài
                  </span>
                </div>
                {officialDecks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {officialDecks.map((deck) =>
                      renderDeckCard(deck, "official")
                    )}
                  </div>
                ) : (
                  <div className="bg-[var(--color-paper-1)] rounded-xl border border-dashed border-[var(--color-border-strong)] p-8 text-center text-[var(--color-ink-2)] text-sm">
                    Hiện chưa có khóa học chính thức nào.
                  </div>
                )}
              </section>

              {/* Custom Decks */}
              <section>
                <div className="flex items-center justify-between mb-4 hairline-b pb-2.5">
                  <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight">
                    Bộ Bài Cá Nhân Của Bạn
                  </h2>
                  <button
                    onClick={openCreateModal}
                    className="text-xs font-bold text-[var(--color-accent-1)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Tạo bộ bài mới
                  </button>
                </div>

                {customDecks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customDecks.map((deck) => renderDeckCard(deck, "custom"))}
                  </div>
                ) : (
                  <div className="bg-[var(--color-paper-1)] rounded-2xl border border-dashed border-[var(--color-border-strong)] p-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-ink-2)] mb-3">
                      <Folder size={22} />
                    </div>
                    <p className="text-[var(--color-ink-1)] font-semibold text-sm mb-1">
                      Bạn chưa tạo bộ bài cá nhân nào
                    </p>
                    <p className="text-[var(--color-ink-2)] text-xs mb-4 max-w-sm">
                      Tự tổng hợp danh sách chữ Hán theo chủ đề riêng và chia sẻ
                      link cho bạn bè cùng học.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="text-xs font-bold bg-[var(--color-ink-1)] hover:bg-[var(--color-accent-1)] text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Tạo Bộ Bài Đầu Tiên
                    </button>
                  </div>
                )}
              </section>

              {/* Saved Decks */}
              {savedDecks.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4 hairline-b pb-2.5">
                    <h2 className="text-lg font-bold text-[var(--color-ink-1)] tracking-tight">
                      Tủ Sách Đã Lưu
                    </h2>
                    <span className="text-xs font-semibold text-[var(--color-ink-2)] tabular-nums">
                      {savedDecks.length} bộ bài
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedDecks.map((deck) => renderDeckCard(deck, "saved"))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create / Edit Custom Deck Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-paper-1)] w-full max-w-md rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden border border-[var(--color-border-subtle)]"
            >
              <div className="px-6 py-4 hairline-b flex items-center justify-between bg-[var(--color-paper-2)]/60">
                <h3 className="text-base font-bold text-[var(--color-ink-1)]">
                  {editingDeck ? "Chỉnh sửa bộ bài" : "Tạo bộ bài cá nhân mới"}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleCreateOrUpdateDeck}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                    Tên bộ bài
                  </label>
                  <input
                    type="text"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    placeholder="Vd: Kanji N4 Giao tiếp..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
                    Mô tả ngắn
                  </label>
                  <textarea
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    placeholder="Ghi chú nội dung hoặc mục tiêu của bộ bài..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors text-sm resize-none"
                  />
                </div>
                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-paper-2)] text-[var(--color-ink-1)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newDeckTitle.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-ink-1)] text-white hover:bg-[var(--color-accent-1)] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating
                      ? "Đang lưu..."
                      : editingDeck
                        ? "Lưu thay đổi"
                        : "Tạo bộ bài"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Deck Modal */}
      <AnimatePresence>
        {deckToDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setDeckToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-paper-1)] w-full max-w-sm rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden border border-[var(--color-border-subtle)] p-6"
            >
              <h2 className="text-lg font-bold text-[var(--color-accent-1)] mb-2">
                Xác nhận xoá bộ bài
              </h2>
              <p className="text-sm text-[var(--color-ink-2)] mb-6 leading-relaxed">
                Bạn có chắc chắn muốn xoá vĩnh viễn bộ bài này? Tiến độ học từng
                chữ Kanji của bạn vẫn được bảo toàn trên hệ thống.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeckToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-paper-2)] text-[var(--color-ink-1)] hover:bg-[var(--color-paper-3)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmDeleteDeck}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent-1)] text-white hover:bg-[var(--color-accent-2)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
