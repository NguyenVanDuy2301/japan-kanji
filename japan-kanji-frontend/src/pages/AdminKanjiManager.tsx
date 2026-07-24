import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Search, Edit2, Trash2, X } from "lucide-react";
import Navbar from "../components/ui/Navbar";
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
  color: 'blue' | 'green' | 'purple' | 'emerald';
  initialTags: string[];
  placeholder: string;
  onChange: (tags: string[]) => void;
}

// --- Interactive Tag Input Component ---
const TagInput = ({ color, initialTags, placeholder, onChange }: TagInputProps) => {
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

  const bgClass = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    emerald: "bg-emerald-100 text-emerald-700"
  }[color];
  
  const borderClass = (color === "blue" || color === "green") ? "focus-within:border-blue-500" : "focus-within:border-purple-500";

  return (
    <div className={`w-full p-2.5 rounded-xl border border-neutral-200 ${borderClass} flex items-center gap-2 flex-wrap bg-white`}>
      {tags.map((tag, index) => (
        <span key={index} className={`${bgClass} px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1`}>
          {tag} <X size={14} className="cursor-pointer hover:opacity-70" onClick={() => removeTag(index)} />
        </span>
      ))}
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : "Gõ & Enter..."} 
        className="outline-none flex-1 min-w-[80px] text-sm bg-transparent p-1" 
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
  const [strokes, setStrokes] = useState<number | "">(initialData?.strokes ?? "");
  const [onyomi, setOnyomi] = useState<string[]>(initialData?.onyomi && initialData.onyomi !== "-" ? initialData.onyomi.split(",").map(s => s.trim()).filter(Boolean) : []);
  const [kunyomi, setKunyomi] = useState<string[]>(initialData?.kunyomi && initialData.kunyomi !== "-" ? initialData.kunyomi.split(",").map(s => s.trim()).filter(Boolean) : []);
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
        wordType: "noun"
      };

      if (initialData?.id) {
        await api.put(`/api/vocabularies/${initialData.id}`, payload);
      } else {
        await api.post('/api/vocabularies', payload);
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
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Ký tự Kanji</label>
            <input required type="text" value={kanji} onChange={e => setKanji(e.target.value)} placeholder="Ví dụ: 学" className="w-full p-3 rounded-xl border border-neutral-200 text-2xl font-black text-center focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-neutral-700 mb-1">Âm Hán Việt</label>
              <input type="text" value={hanViet} onChange={e => setHanViet(e.target.value)} placeholder="Ví dụ: HỌC" className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-neutral-700 mb-1">Nghĩa tiếng Việt</label>
              <input required type="text" value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Ví dụ: Học tập" className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-neutral-700 mb-1">Âm Onyomi (Cách nhau bằng dấu phẩy)</label>
          <TagInput color="blue" initialTags={onyomi} onChange={setOnyomi} placeholder="Ví dụ: セイ" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-neutral-700 mb-1">Âm Kunyomi (Cách nhau bằng dấu phẩy)</label>
          <TagInput color="green" initialTags={kunyomi} onChange={setKunyomi} placeholder="Ví dụ: い.きる" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-neutral-700 mb-1">JLPT Level</label>
          <select value={jlptLevel} onChange={e => setJlptLevel(e.target.value)} className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-blue-500 bg-white">
            <option>N5</option><option>N4</option><option>N3</option><option>N2</option><option>N1</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-neutral-700 mb-1">Số nét</label>
          <input type="number" value={strokes} onChange={e => setStrokes(e.target.value === "" ? "" : parseInt(e.target.value))} placeholder="Ví dụ: 8" className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-xl text-neutral-600 font-bold hover:bg-neutral-100">Huỷ</button>
        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
          {isSaving ? "Đang lưu..." : "Lưu Hán Tự"}
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

  const fetchKanjis = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/vocabularies?size=2000');
      // The backend returns PageResponse with content array
      const mapped = response.data.content.map((v: any) => ({
        id: v.id,
        kanji: v.kanji,
        onyomi: v.onyomi || "-",
        kunyomi: v.kunyomi || "-",
        hanViet: v.hanViet || "-",
        meaning: v.meaning,
        jlptLevel: v.jlptLevel,
        strokes: v.strokeCount || 0
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
          // Expect CSV columns: kanji,onyomi,kunyomi,hanViet,meaning,jlptLevel,strokes
          const requests = results.data.map((row: any) => ({
            kanji: row.kanji,
            onyomi: row.onyomi || "",
            kunyomi: row.kunyomi || "",
            hanViet: row.hanViet || "",
            meaning: row.meaning,
            jlptLevel: row.jlptLevel || "N5",
            strokeCount: row.strokes ? parseInt(row.strokes) : null,
            wordType: "noun"
          }));
          
          await api.post('/api/vocabularies/bulk', requests);
          alert(`Đã thêm thành công!`);
          fetchKanjis();
        } catch (err) {
          console.error(err);
          alert("Có lỗi khi upload file CSV");
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        alert("Lỗi parse file: " + error.message);
      }
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

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Hán tự Toàn cầu</h1>
            <p className="text-neutral-500">Thêm hoặc xóa Hán tự trong kho dữ liệu tổng.</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleCsvUpload} 
            />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-700 hover:bg-neutral-50 font-medium transition-colors shadow-sm">
              <Upload size={18} />
              Nhập file CSV
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
              <Plus size={18} />
              Thêm một Hán tự
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input type="text" placeholder="Tìm kiếm Hán tự, Romaji..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="text-sm text-neutral-500">
              Hiển thị {kanjis.length} Hán tự
            </div>
          </div>
          
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="border-b border-neutral-200 text-sm text-neutral-500 font-medium">
                  <th className="p-4 font-medium">Hán tự</th>
                  <th className="p-4 font-medium">Âm Hán Việt</th>
                  <th className="p-4 font-medium">Nghĩa</th>
                  <th className="p-4 font-medium">On/Kun</th>
                  <th className="p-4 font-medium">JLPT</th>
                  <th className="p-4 font-medium">Nét</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-neutral-500">Đang tải...</td></tr>
                ) : kanjis.map(k => (
                  <tr key={k.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="text-3xl font-black text-neutral-900">{k.kanji}</div>
                    </td>
                    <td className="p-4 font-bold text-blue-700">{k.hanViet}</td>
                    <td className="p-4 text-neutral-700">{k.meaning}</td>
                    <td className="p-4 text-sm max-w-[200px]">
                      <div className="text-neutral-900 truncate">On: {k.onyomi}</div>
                      <div className="text-neutral-500 truncate">Kun: {k.kunyomi}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">{k.jlptLevel}</span>
                    </td>
                    <td className="p-4 text-neutral-500">{k.strokes}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button onClick={() => openEditModal(k)} className="p-2 text-neutral-400 hover:text-blue-600 transition-colors" title="Chỉnh sửa"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(k.id!)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors" title="Xoá"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thêm/Sửa Kanji */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative">
              <h2 className="text-2xl font-bold mb-6">{editingKanji ? "Chỉnh sửa Hán tự" : "Thêm Hán tự Mới"}</h2>
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
        )}
      </div>
    </div>
  );
}
