import React, { useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface KanjiStrokeDrawProps {
  kanji: string;
}

export const KanjiStrokeDraw: React.FC<KanjiStrokeDrawProps> = ({ kanji }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [key, setKey] = useState(0); // Dùng để ép component re-render khi nhấn Phát lại
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kanji) return;

    // Reset state khi đổi chữ kanji mới
    setSvgContent(null);
    setError(false);

    // Chuyển ký tự kanji thành mã unicode hex 5 chữ số.
    // VD: "日" -> 65e5 -> 065e5
    const code = kanji.charCodeAt(0).toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then((svg) => {
        // Làm sạch đôi chút nếu cần
        setSvgContent(svg);
      })
      .catch((err) => {
        console.error("Failed to load kanji SVG:", err);
        setError(true);
      });
  }, [kanji]);

  useEffect(() => {
    // Inject animation delays sau khi SVG được đưa vào DOM
    if (svgContent && containerRef.current) {
      // KanjiVG thường đặt các nét ở thẻ <path> bên trong các thẻ <g>
      const paths = containerRef.current.querySelectorAll("path");
      paths.forEach((path, index) => {
        // Truyền biến CSS --stroke-index vào style nội tuyến
        path.style.setProperty("--stroke-index", index.toString());
      });
    }
  }, [svgContent, key]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Khung vẽ Kanji với lưới chữ thập */}
      <div
        className="relative w-48 h-48 bg-white border-2 border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-inner"
        style={{
          backgroundImage: `
             linear-gradient(to right, transparent 49%, #cbd5e1 49%, #cbd5e1 51%, transparent 51%),
             linear-gradient(to bottom, transparent 49%, #cbd5e1 49%, #cbd5e1 51%, transparent 51%)
           `,
        }}
      >
        {error ? (
          <div className="text-slate-400 text-sm">Chưa có dữ liệu</div>
        ) : svgContent ? (
          <div
            key={key}
            ref={containerRef}
            className="w-full h-full p-2 kanji-svg-container"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center text-slate-300">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Nút phát lại */}
      <button
        onClick={() => setKey((k) => k + 1)}
        disabled={!svgContent}
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw
          size={16}
          className={!svgContent ? "" : "animate-[spin_0.5s_ease-out]"}
          key={key}
        />
        Phát lại
      </button>
    </div>
  );
};
