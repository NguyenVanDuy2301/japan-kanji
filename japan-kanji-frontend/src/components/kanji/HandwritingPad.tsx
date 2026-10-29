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

  const redraw = useCallback((allStrokes: Stroke[], activeStroke?: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const styles = getComputedStyle(canvas);
    const guideColor =
      styles.getPropertyValue("--color-border-subtle").trim() ||
      "oklch(0.89 0.008 85)";
    const inkColor =
      styles.getPropertyValue("--color-ink-1").trim() ||
      "oklch(0.14 0.012 250)";

    ctx.strokeStyle = guideColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = inkColor;
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

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

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
    }, 650);
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
    <div className="glass-panel bg-[var(--color-paper-1)]/98 border border-[var(--color-border-strong)] shadow-[var(--shadow-elevated)] rounded-2xl p-5 flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-[var(--color-ink-1)] flex items-center gap-2">
          <Edit3 size={17} className="text-[var(--color-accent-1)]" />
          <span>Bảng Vẽ Nhận Diện Chữ Hán</span>
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors p-1 rounded-lg hover:bg-[var(--color-paper-2)] cursor-pointer"
            aria-label="Đóng bảng vẽ"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative border border-[var(--color-border-strong)] rounded-xl overflow-hidden bg-[var(--color-paper-1)] cursor-crosshair touch-none w-full h-64"
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
          <div className="absolute top-3 right-3 w-5 h-5 border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-1)] rounded-full animate-spin" />
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--color-ink-1)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-border-subtle)] rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Undo2 size={14} /> Hoàn tác
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] hover:opacity-90 rounded-lg disabled:opacity-40 transition-opacity cursor-pointer"
          >
            <Trash2 size={14} /> Xóa hết
          </button>
        </div>
        <div className="text-xs text-[var(--color-ink-3)] hidden sm:block">
          Viết chữ Hán theo đúng thứ tự nét vào giữa khung
        </div>
      </div>

      <div className="h-14 flex items-center justify-start gap-2 overflow-x-auto px-2 bg-[var(--color-paper-2)] rounded-xl border border-[var(--color-border-subtle)] py-1.5">
        {predictions.length > 0 ? (
          predictions.map((kanji, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(kanji);
                if (onClose) onClose();
              }}
              className="min-w-[44px] h-10 flex-shrink-0 flex items-center justify-center text-2xl font-serif font-bold text-[var(--color-ink-1)] hover:text-[var(--color-paper-1)] hover:bg-[var(--color-accent-1)] border border-[var(--color-border-subtle)] rounded-lg transition-colors bg-[var(--color-paper-1)] shadow-2xs cursor-pointer"
            >
              {kanji}
            </button>
          ))
        ) : (
          <div className="text-xs text-[var(--color-ink-3)] w-full text-center">
            {strokes.length > 0
              ? "Đang nhận diện nét chữ..."
              : "Kết quả gợi ý chữ Hán sẽ xuất hiện tại đây"}
          </div>
        )}
      </div>
    </div>
  );
};
