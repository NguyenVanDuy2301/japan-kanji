import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Plus, Search, Edit2, Trash2, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Papa from "papaparse";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";

interface Kanji {
  id?: number;
  kanji: string;
  onyomi: string;
  kunyomi: string;
  hanViet: string;
  meaning: string;
  jlptLevel: string;
  strokes: number;
}

interface TagInputProps {
  initialTags: string[];
  placeholder: string;
  onChange: (tags: string[]) => void;
}

const TagInput = ({ initialTags, placeholder, onChange }: TagInputProps) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim().replace(",", "");
      if (val && !tags.includes(val)) {
        const newTags = [...tags, val];
        setTags(newTags);
        onChange(newTags);
        setInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    onChange(newTags);
  };

  return (
    <div className="w-full p-2 rounded-xl border border-[var(--color-border-subtle)] focus-within:border-[var(--color-ink-1)] flex items-center gap-1.5 flex-wrap bg-[var(--color-paper-2)] focus-within:bg-[var(--color-paper-1)] transition-colors">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--color-ink-1)] flex items-center gap-1 shadow-2xs"
        >
          {tag}
          <X
            size={13}
            className="cursor-pointer text-[var(--color-ink-3)] hover:text-[var(--color-accent-1)] transition-colors"
            onClick={() => removeTag(index)}
          />
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : "Gõ & Enter..."}
        className="outline-none flex-1 min-w-[90px] text-sm bg-transparent px-1.5 py-1 placeholder:text-[var(--color-ink-3)] text-[var(--color-ink-1)] font-medium"
      />
    </div>
  );
};

interface KanjiFormProps {
  onCancel: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  initialData?: Kanji | null;
}

const KanjiForm = ({
  onCancel,
  onSuccess,
  onError,
  initialData,
}: KanjiFormProps) => {
  const [kanji, setKanji] = useState(initialData?.kanji || "");
  const [hanViet, setHanViet] = useState(initialData?.hanViet || "");
  const [meaning, setMeaning] = useState(initialData?.meaning || "");
  const [jlptLevel, setJlptLevel] = useState(initialData?.jlptLevel || "N5");
  const [strokes, setStrokes] = useState<number | "">(
    initialData?.strokes ?? ""
  );
  const [onyomi, setOnyomi] = useState<string[]>(
    initialData?.onyomi && initialData.onyomi !== "-"
      ? initialData.onyomi
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  );
  const [kunyomi, setKunyomi] = useState<string[]>(
    initialData?.kunyomi && initialData.kunyomi !== "-"
      ? initialData.kunyomi
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanji || !meaning || !jlptLevel) return;

    setIsSaving(true);
    try {
      const payload = {
        kanji,
        onyomi: onyomi.length > 0 ? onyomi.join(", ") : "-",
        kunyomi: kunyomi.length > 0 ? kunyomi.join(", ") : "-",
        hanViet,
        meaning,
        jlptLevel,
        strokeCount: strokes === "" ? null : strokes,
        wordType: "noun",
      };

      if (initialData?.id) {
        await api.put(`/api/vocabularies/${initialData.id}`, payload);
        onSuccess(`Đã cập nhật Hán tự "${kanji}" thành công.`);
      } else {
        await api.post("/api/vocabularies", payload);
        onSuccess(`Đã thêm Hán tự "${kanji}" vào kho từ điển.`);
      }
    } catch (error) {
      console.error("Failed to save kanji", error);
      onError("Có lỗi xảy ra khi lưu Hán tự.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
            Ký tự Kanji
          </label>
          <input
            required
            type="text"
            value={kanji}
            onChange={(e) => setKanji(e.target.value)}
            placeholder="学"
            className="w-full h-24 rounded-xl border border-[var(--color-border-subtle)] text-4xl font-serif font-bold text-center focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-[var(--color-ink-1)] placeholder:text-[var(--color-ink-3)]"
          />
        </div>
        <div className="sm:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
              Âm Hán Việt
            </label>
            <input
              type="text"
              value={hanViet}
              onChange={(e) => setHanViet(e.target.value)}
              placeholder="Ví dụ: HỌC"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-sm text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
              Nghĩa tiếng Việt
            </label>
            <input
              required
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Ví dụ: Học tập"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-sm text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
            Âm Onyomi
          </label>
          <TagInput
            initialTags={onyomi}
            onChange={setOnyomi}
            placeholder="Ví dụ: ガク"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
            Âm Kunyomi
          </label>
          <TagInput
            initialTags={kunyomi}
            onChange={setKunyomi}
            placeholder="Ví dụ: まな.ぶ"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
            Cấp độ JLPT
          </label>
          <select
            value={jlptLevel}
            onChange={(e) => setJlptLevel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-sm text-[var(--color-ink-1)] font-bold"
          >
            <option>N5</option>
            <option>N4</option>
            <option>N3</option>
            <option>N2</option>
            <option>N1</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1.5">
            Số nét viết
          </label>
          <input
            type="number"
            value={strokes}
            onChange={(e) =>
              setStrokes(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            placeholder="Ví dụ: 8"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] text-sm text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 hairline-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-paper-2)] text-[var(--color-ink-1)] text-sm font-semibold hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-ink-1)] text-white text-sm font-semibold hover:bg-[var(--color-accent-1)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSaving ? "Đang lưu..." : "Lưu Hán tự"}
        </button>
      </div>
    </form>
  );
};

export default function AdminKanjiManager() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState<Kanji | null>(null);
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kanjiToDelete, setKanjiToDelete] = useState<Kanji | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchKanjis = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/vocabularies?size=2000");
      const mapped = response.data.content.map((v: any) => ({
        id: v.id,
        kanji: v.kanji,
        onyomi: v.onyomi || "-",
        kunyomi: v.kunyomi || "-",
        hanViet: v.hanViet || "-",
        meaning: v.meaning,
        jlptLevel: v.jlptLevel,
        strokes: v.strokeCount || 0,
      }));
      setKanjis(mapped);
    } catch (error) {
      console.error(error);
      toast("Không thể tải danh sách Hán tự.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchKanjis();
  }, [fetchKanjis]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const requests = results.data.map((row: any) => ({
            kanji: row.kanji,
            onyomi: row.onyomi || "",
            kunyomi: row.kunyomi || "",
            hanViet: row.hanViet || "",
            meaning: row.meaning,
            jlptLevel: row.jlptLevel || "N5",
            strokeCount: row.strokes ? parseInt(row.strokes) : null,
            wordType: "noun",
          }));

          await api.post("/api/vocabularies/bulk", requests);
          toast(`Đã nhập thành công ${requests.length} mục từ file CSV!`);
          fetchKanjis();
        } catch (err) {
          console.error(err);
          toast("Có lỗi khi tải lên file CSV.", "error");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast("Lỗi đọc file CSV: " + error.message, "error");
      },
    });
  };

  const confirmDelete = async () => {
    if (!kanjiToDelete?.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/vocabularies/${kanjiToDelete.id}`);
      toast(`Đã xoá "${kanjiToDelete.kanji}" khỏi kho dữ liệu.`);
      setKanjiToDelete(null);
      fetchKanjis();
    } catch (e: any) {
      toast(
        e.response?.data?.message ||
          "Không thể xoá (từ này đang có học viên theo học).",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateModal = () => {
    setEditingKanji(null);
    setIsModalOpen(true);
  };

  const openEditModal = (kanji: Kanji) => {
    setEditingKanji(kanji);
    setIsModalOpen(true);
  };

  const filteredKanjis = kanjis.filter(
    (k) =>
      k.kanji.includes(searchQuery) ||
      k.hanViet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kunyomi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 relative flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 hairline-b pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-accent-1)] shadow-xs">
                <Settings size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-1)]">
                  Quản Trị Hán Tự Toàn Cầu
                </h1>
                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] mt-0.5">
                  Quản lý kho từ điển gốc và đồng bộ dữ liệu chữ Hán toàn hệ
                  thống
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleCsvUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] text-[var(--color-ink-1)] text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <Upload size={15} />
                <span>Nhập file CSV</span>
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-ink-1)] text-white hover:bg-[var(--color-accent-1)] text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                <span>Thêm Hán tự mới</span>
              </button>
            </div>
          </header>

          <div className="flex-1 bg-[var(--color-paper-1)] rounded-2xl border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 sm:p-5 hairline-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80 group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-accent-1)] transition-colors"
                  size={17}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm Kanji, Hán Việt, Nghĩa..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-ink-1)] text-sm font-medium transition-colors bg-[var(--color-paper-2)] focus:bg-[var(--color-paper-1)] placeholder:text-[var(--color-ink-3)]"
                />
              </div>
              <div className="text-xs font-bold text-[var(--color-ink-2)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-full bg-[var(--color-paper-2)] self-start sm:self-auto">
                Hiển thị{" "}
                <AnimatedNumber
                  value={filteredKanjis.length}
                  className="text-[var(--color-ink-1)]"
                />{" "}
                mục
              </div>
            </div>

            <div className="flex-1 overflow-auto relative">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[var(--color-paper-2)] hairline-b">
                  <tr className="text-xs font-bold text-[var(--color-ink-2)]">
                    <th className="p-4 w-20 text-center">Hán tự</th>
                    <th className="p-4">Âm Hán Việt</th>
                    <th className="p-4">Nghĩa tiếng Việt</th>
                    <th className="p-4">Cách đọc (On / Kun)</th>
                    <th className="p-4 w-20 text-center">JLPT</th>
                    <th className="p-4 w-16 text-center">Số nét</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td className="p-4 w-20">
                          <Skeleton className="h-10 w-10 mx-auto rounded-lg" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-5 w-48" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="p-4 w-20">
                          <Skeleton className="h-5 w-10 mx-auto" />
                        </td>
                        <td className="p-4 w-16">
                          <Skeleton className="h-5 w-6 mx-auto" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredKanjis.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-sm text-[var(--color-ink-2)] font-medium"
                      >
                        Không tìm thấy Hán tự nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredKanjis.map((k) => (
                      <tr
                        key={k.id}
                        className="hover:bg-[var(--color-paper-2)]/70 transition-colors group"
                      >
                        <td className="p-3.5">
                          <div className="text-3xl font-serif font-bold text-[var(--color-ink-1)] text-center group-hover:text-[var(--color-accent-1)] transition-colors">
                            {k.kanji}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-sm text-[var(--color-accent-1)]">
                          {k.hanViet}
                        </td>
                        <td className="p-3.5 text-sm text-[var(--color-ink-1)] font-semibold">
                          {k.meaning}
                        </td>
                        <td className="p-3.5 text-xs max-w-[220px]">
                          <div className="text-[var(--color-ink-1)] truncate font-medium">
                            <span className="text-[10px] font-bold text-[var(--color-ink-3)] mr-1.5">
                              On:
                            </span>
                            {k.onyomi}
                          </div>
                          <div className="text-[var(--color-ink-1)] truncate font-medium mt-0.5">
                            <span className="text-[10px] font-bold text-[var(--color-ink-3)] mr-1.5">
                              Kun:
                            </span>
                            {k.kunyomi}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-paper-2)] text-xs font-bold text-[var(--color-ink-1)]">
                            {k.jlptLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-sm text-[var(--color-ink-2)] font-bold text-center tabular-nums">
                          {k.strokes}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(k)}
                            className="p-2 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-paper-3)] transition-colors mr-1 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setKanjiToDelete(k)}
                            className="p-2 rounded-lg text-[var(--color-ink-2)] hover:text-white hover:bg-[var(--color-accent-1)] transition-colors cursor-pointer"
                            title="Xoá"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Thêm/Sửa Kanji */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] rounded-2xl w-full max-w-xl shadow-[var(--shadow-elevated)] relative flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="px-6 py-4 hairline-b flex items-center justify-between bg-[var(--color-paper-2)]/60">
                <h2 className="text-base font-bold text-[var(--color-ink-1)]">
                  {editingKanji ? "Chỉnh sửa Hán tự" : "Thêm Hán tự mới"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <KanjiForm
                  initialData={editingKanji}
                  onCancel={() => setIsModalOpen(false)}
                  onError={(msg) => toast(msg, "error")}
                  onSuccess={(msg) => {
                    toast(msg);
                    setIsModalOpen(false);
                    fetchKanjis();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Xác nhận Xoá Kanji */}
      <AnimatePresence>
        {kanjiToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setKanjiToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-paper-1)] w-full max-w-sm rounded-2xl shadow-[var(--shadow-elevated)] border border-[var(--color-border-subtle)] p-6"
            >
              <h3 className="text-lg font-bold text-[var(--color-accent-1)] mb-2">
                Xoá Hán tự "{kanjiToDelete.kanji}"?
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] mb-6 leading-relaxed">
                Bạn có chắc chắn muốn xoá Hán tự này khỏi từ điển toàn cục? Hệ
                thống sẽ chặn xoá nếu từ này đang được học viên ôn tập.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setKanjiToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-paper-2)] text-[var(--color-ink-1)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent-1)] text-white hover:bg-[var(--color-accent-2)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Đang xoá..." : "Xoá"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
