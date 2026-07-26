import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Search, Edit2, Trash2, X, Settings } from "lucide-react";
import Sidebar from "../components/ui/Sidebar";
import api from "../services/api";
import Papa from "papaparse";

// --- Types ---
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

// --- Interactive Tag Input Component ---
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
    <div className="w-full p-2.5 border border-[var(--color-ink-2)] focus-within:border-[var(--color-ink-1)] flex items-center gap-2 flex-wrap bg-[var(--color-paper-1)] transition-colors">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-[var(--color-paper-2)] border border-[var(--color-ink-2)] px-2 py-1 text-xs font-bold text-[var(--color-ink-1)] flex items-center gap-1 uppercase tracking-wider"
        >
          {tag}{" "}
          <X
            size={14}
            className="cursor-pointer hover:text-[var(--color-accent-1)] transition-colors ml-1"
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
        className="outline-none flex-1 min-w-[80px] text-sm bg-transparent p-1 placeholder:text-[var(--color-ink-3)] text-[var(--color-ink-1)] font-medium"
      />
    </div>
  );
};

interface KanjiFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Kanji | null;
}

// --- Form Component ---
const KanjiForm = ({ onCancel, onSuccess, initialData }: KanjiFormProps) => {
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
      } else {
        await api.post("/api/vocabularies", payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save kanji", error);
      alert("Lỗi khi lưu Hán tự");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="flex gap-6">
        <div className="flex-1 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
              Ký tự Kanji
            </label>
            <input
              required
              type="text"
              value={kanji}
              onChange={(e) => setKanji(e.target.value)}
              placeholder="Ví dụ: 学"
              className="w-full p-4 border border-[var(--color-ink-2)] text-3xl font-serif font-black text-center focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-1)] text-[var(--color-ink-1)] placeholder:text-[var(--color-ink-3)]"
            />
          </div>
          <div className="flex gap-5">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
                Âm Hán Việt
              </label>
              <input
                type="text"
                value={hanViet}
                onChange={(e) => setHanViet(e.target.value)}
                placeholder="Ví dụ: HỌC"
                className="w-full p-3 border border-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-1)] text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
                Nghĩa tiếng Việt
              </label>
              <input
                required
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Ví dụ: Học tập"
                className="w-full p-3 border border-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-ink-1)] transition-colors bg-[var(--color-paper-1)] text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
            Âm Onyomi
          </label>
          <TagInput
            initialTags={onyomi}
            onChange={setOnyomi}
            placeholder="Ví dụ: セイ"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
            Âm Kunyomi
          </label>
          <TagInput
            initialTags={kunyomi}
            onChange={setKunyomi}
            placeholder="Ví dụ: い.きる"
          />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
            JLPT Level
          </label>
          <select
            value={jlptLevel}
            onChange={(e) => setJlptLevel(e.target.value)}
            className="w-full p-3 border border-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-ink-1)] bg-[var(--color-paper-1)] text-[var(--color-ink-1)] font-bold"
          >
            <option>N5</option>
            <option>N4</option>
            <option>N3</option>
            <option>N2</option>
            <option>N1</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest mb-1.5">
            Số nét
          </label>
          <input
            type="number"
            value={strokes}
            onChange={(e) =>
              setStrokes(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            placeholder="Ví dụ: 8"
            className="w-full p-3 border border-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-ink-1)] bg-[var(--color-paper-1)] text-[var(--color-ink-1)] font-medium placeholder:text-[var(--color-ink-3)]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 hairline-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-[var(--color-ink-2)] text-[var(--color-ink-1)] text-sm font-bold hover:bg-[var(--color-paper-2)] transition-colors uppercase tracking-widest"
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-[var(--color-ink-1)] text-white text-sm font-bold hover:bg-[var(--color-accent-1)] disabled:opacity-50 transition-colors uppercase tracking-widest"
        >
          {isSaving ? "ĐANG LƯU..." : "LƯU HÁN TỰ"}
        </button>
      </div>
    </form>
  );
};

// --- Main Manager ---
export default function AdminKanjiManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState<Kanji | null>(null);
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const fetchKanjis = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanjis();
  }, []);

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
          alert(`Đã thêm thành công!`);
          fetchKanjis();
        } catch (err) {
          console.error(err);
          alert("Có lỗi khi upload file CSV");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        alert("Lỗi parse file: " + error.message);
      },
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn xoá Hán tự này?")) return;
    try {
      await api.delete(`/api/vocabularies/${id}`);
      fetchKanjis();
    } catch (e: any) {
      alert(e.response?.data?.message || "Lỗi khi xoá");
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

  // Filter logic
  const filteredKanjis = kanjis.filter(
    (k) =>
      k.kanji.includes(searchQuery) ||
      k.hanViet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kunyomi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] flex items-center justify-center text-[var(--color-ink-1)] shadow-sm">
                <Settings size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink-1)]">
                  Quản lý Hán tự Toàn cầu
                </h1>
                <p className="text-[var(--color-ink-2)] mt-1">
                  Thêm hoặc xóa Hán tự trong kho dữ liệu tổng
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleCsvUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] hover:border-[var(--color-ink-1)] text-[var(--color-ink-1)] text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
              >
                <Upload size={16} />
                Nhập CSV
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-3 bg-[var(--color-ink-1)] text-white hover:bg-[var(--color-accent-1)] text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
              >
                <Plus size={16} />
                Thêm Hán tự
              </button>
            </div>
          </header>

          <div className="flex-1 bg-[var(--color-paper-1)] border border-[var(--color-ink-2)] shadow-sm flex flex-col min-h-0">
            <div className="p-6 hairline-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-paper-1)]">
              <div className="relative w-full sm:w-80 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] group-focus-within:text-[var(--color-ink-1)] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm Kanji, Hán Việt, Romaji..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-ink-1)] text-sm font-medium transition-colors bg-[var(--color-paper-2)] placeholder:text-[var(--color-ink-3)]"
                />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-2)] border border-[var(--color-ink-2)] px-3 py-1 bg-[var(--color-paper-2)]">
                Hiển thị {filteredKanjis.length} mục
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[var(--color-paper-1)] relative">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[var(--color-paper-2)] hairline-b">
                  <tr className="text-[10px] font-bold text-[var(--color-ink-2)] uppercase tracking-widest">
                    <th className="p-4 w-20 text-center">Kanji</th>
                    <th className="p-4">Hán Việt</th>
                    <th className="p-4">Nghĩa</th>
                    <th className="p-4">Đọc (On/Kun)</th>
                    <th className="p-4 w-20 text-center">JLPT</th>
                    <th className="p-4 w-16 text-center">Nét</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-ink-2)]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-[var(--color-ink-2)] font-medium"
                      >
                        Đang tải dữ liệu hệ thống...
                      </td>
                    </tr>
                  ) : filteredKanjis.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-[var(--color-ink-2)] font-medium border-b border-[var(--color-ink-2)]"
                      >
                        Không có Hán tự nào phù hợp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredKanjis.map((k) => (
                      <tr
                        key={k.id}
                        className="hover:bg-[var(--color-paper-2)] transition-colors group"
                      >
                        <td className="p-4">
                          <div className="text-3xl font-serif font-bold text-[var(--color-ink-1)] text-center group-hover:text-[var(--color-accent-1)] transition-colors">
                            {k.kanji}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[var(--color-ink-1)]">
                          {k.hanViet}
                        </td>
                        <td className="p-4 text-[var(--color-ink-1)] font-medium">
                          {k.meaning}
                        </td>
                        <td className="p-4 text-sm max-w-[200px]">
                          <div className="text-[var(--color-ink-1)] truncate font-medium">
                            <span className="text-[10px] text-[var(--color-ink-2)] uppercase tracking-widest mr-2">
                              ON
                            </span>{" "}
                            {k.onyomi}
                          </div>
                          <div className="text-[var(--color-ink-1)] truncate font-medium mt-1">
                            <span className="text-[10px] text-[var(--color-ink-2)] uppercase tracking-widest mr-2">
                              KUN
                            </span>{" "}
                            {k.kunyomi}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 border border-[var(--color-ink-2)] bg-[var(--color-paper-1)] text-[10px] font-bold text-[var(--color-ink-1)] tracking-widest uppercase">
                            {k.jlptLevel}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--color-ink-2)] font-bold text-center">
                          {k.strokes}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(k)}
                            className="p-2 text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-paper-2)] border border-transparent hover:border-[var(--color-ink-2)] transition-all mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id!)}
                            className="p-2 text-[var(--color-ink-2)] hover:text-white hover:bg-[var(--color-accent-1)] border border-transparent hover:border-[var(--color-accent-1)] transition-all"
                            title="Xoá"
                          >
                            <Trash2 size={16} />
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-[var(--color-paper-1)] border border-[oklch(0.85_0.01_250)] rounded-none w-full max-w-2xl shadow-2xl relative flex flex-col transform transition-transform animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-8 py-5 hairline-b flex items-center justify-between bg-[var(--color-paper-1)]">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink-1)]">
                {editingKanji ? "Chỉnh sửa Hán tự" : "Thêm Hán tự Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] p-2 hover:bg-neutral-100 transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <KanjiForm
                initialData={editingKanji}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchKanjis();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
