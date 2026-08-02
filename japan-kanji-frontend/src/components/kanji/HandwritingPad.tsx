import React, { useRef, useState, useEffect, useCallback } from "react";
import { Undo2, Trash2, Edit3, X } from "lucide-react";
import {
  handwritingService,
  type Stroke,
} from "../../services/handwriting.service";

interface HandwritingPadProps {
  onSelect: (kanji: string) => void;
  onClose?: () => void;
}

export const HandwritingPad: React.FC<HandwritingPadProps> = ({
  onSelect,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 256 });
  const debounceRef = useRef<number | null>(null);

  // Khởi tạo kích thước canvas bằng với DOM element
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        setCanvasSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Vẽ lại toàn bộ strokes lên canvas
  const redraw = useCallback((allStrokes: Stroke[], activeStroke?: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nền ô vuông 4 phần (ở giữa) như vở viết Kanji
    ctx.strokeStyle = "#e2e8f0"; // slate-200
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    // Kẻ dọc giữa
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    // Kẻ ngang giữa
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = "#1e293b"; // slate-800
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawPath = (stroke: Stroke) => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    };

    allStrokes.forEach(drawPath);
    if (activeStroke && activeStroke.length > 0) {
      drawPath(activeStroke);
    }
  }, []);

  // Update canvas khi strokes hoặc resize thay đổi
  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw, canvasSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    setCurrentStroke([{ x: offsetX, y: offsetY, t: Date.now() }]);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const newPoint = { x: offsetX, y: offsetY, t: Date.now() };
    setCurrentStroke((prev) => {
      const updated = [...prev, newPoint];
      redraw(strokes, updated);
      return updated;
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      redraw(newStrokes);
      triggerRecognition(newStrokes);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale the coordinates to match the internal canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY,
    };
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    if (newStrokes.length > 0) {
      triggerRecognition(newStrokes);
    } else {
      setPredictions([]);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setPredictions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const triggerRecognition = (currentStrokes: Stroke[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      recognizeKanji(currentStrokes);
    }, 800);
  };

  const recognizeKanji = async (currentStrokes: Stroke[]) => {
    if (currentStrokes.length === 0) return;
    setIsFetching(true);

    try {
      const results = await handwritingService.recognizeKanji(
        currentStrokes,
        canvasSize.width,
        canvasSize.height
      );
      setPredictions(results);
    } catch (error) {
      console.error("Handwriting recognition failed:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-5 flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Edit3 size={18} className="text-indigo-600" />
          Bảng Vẽ Cảm Ứng
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50 cursor-crosshair touch-none w-full h-64 sm:h-72"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full"
        />
        {isFetching && (
          <div className="absolute top-3 right-3 w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Undo2 size={16} /> Hoàn tác
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} /> Xóa hết
          </button>
        </div>
        <div className="text-sm text-slate-400 italic hidden sm:block">
          Gợi ý: Viết chữ Hán vào giữa khung kẻ
        </div>
      </div>

      <div className="h-14 flex items-center justify-start gap-2 overflow-x-auto px-1 hide-scrollbar bg-slate-50 rounded-lg border border-slate-100 py-1">
        {predictions.length > 0 ? (
          predictions.map((kanji, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(kanji);
                if (onClose) onClose();
              }}
              className="min-w-[48px] h-12 flex-shrink-0 flex items-center justify-center text-2xl font-serif text-slate-800 hover:text-indigo-600 hover:bg-indigo-100 border border-slate-200 rounded-md transition-colors bg-white shadow-sm"
            >
              {kanji}
            </button>
          ))
        ) : (
          <div className="text-sm text-slate-400 w-full text-center italic">
            {strokes.length > 0
              ? "Đang nhận diện..."
              : "Các kết quả dự đoán sẽ hiển thị ở đây"}
          </div>
        )}
      </div>
    </div>
  );
};
