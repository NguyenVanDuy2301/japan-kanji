import React, { useEffect, useState, useRef } from "react";
import { RefreshCw, Gauge } from "lucide-react";

interface KanjiStrokeDrawProps {
  kanji: string;
}

type SpeedMode = "slow" | "normal" | "fast";

// Tốc độ tính bằng đơn vị tọa độ SVG (trên khung 109x109) mỗi giây
// kết hợp thời gian đặt bút / nhấc bút để mô phỏng tay người viết thật
const SPEED_CONFIG: Record<
  SpeedMode,
  {
    label: string;
    unitsPerSecond: number;
    minStrokeMs: number;
    pauseBetweenStrokesMs: number;
  }
> = {
  slow: {
    label: "Chậm rãi",
    unitsPerSecond: 26,
    minStrokeMs: 1400,
    pauseBetweenStrokesMs: 550,
  },
  normal: {
    label: "Vừa phải",
    unitsPerSecond: 44,
    minStrokeMs: 950,
    pauseBetweenStrokesMs: 360,
  },
  fast: {
    label: "Nhanh",
    unitsPerSecond: 75,
    minStrokeMs: 550,
    pauseBetweenStrokesMs: 200,
  },
};

// Hàm làm mượt chuyển động tay người: đặt bút chậm -> kéo nét đều -> dừng/móc nhẹ ở cuối nét
function humanBrushEase(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const KanjiStrokeDraw: React.FC<KanjiStrokeDrawProps> = ({ kanji }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [replayTrigger, setReplayTrigger] = useState(0);
  const [speed, setSpeed] = useState<SpeedMode>("slow");
  const [strokeProgressText, setStrokeProgressText] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kanji) return;

    setSvgContent(null);
    setError(false);
    setStrokeProgressText("");

    const code = kanji.charCodeAt(0).toString(16).padStart(5, "0");
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then((rawSvg) => {
        const svgMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
        setSvgContent(svgMatch ? svgMatch[0] : rawSvg);
      })
      .catch((err) => {
        console.error("Failed to load kanji SVG:", err);
        setError(true);
      });
  }, [kanji]);

  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const container = containerRef.current;
    // Chèn SVG một lần duy nhất vào DOM trong chu kỳ chạy để React không ghi đè inline style
    container.innerHTML = svgContent;

    const svgEl = container.querySelector("svg");
    const paths = Array.from(container.querySelectorAll("path"));
    if (!svgEl || paths.length === 0) return;

    const totalStrokes = paths.length;
    const { unitsPerSecond, minStrokeMs, pauseBetweenStrokesMs } =
      SPEED_CONFIG[speed];

    // Đo độ dài từng nét và ẩn toàn bộ nét trước khi bắt đầu viết
    const strokeMetrics = paths.map((path) => {
      const length = Math.max(1, path.getTotalLength());
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      const durationMs = Math.max(
        minStrokeMs,
        (length / unitsPerSecond) * 1000
      );
      return { path, length, durationMs };
    });

    // Tạo chấm đỏ mô phỏng đầu ngòi bút đang di chuyển trên giấy
    const ns = "http://www.w3.org/2000/svg";
    const brushTip = document.createElementNS(ns, "circle");
    brushTip.setAttribute("r", "3.2");
    brushTip.setAttribute("fill", "oklch(0.55 0.21 27)");
    brushTip.style.opacity = "0";
    brushTip.style.transition = "opacity 120ms ease";
    svgEl.appendChild(brushTip);

    let rafId: number | null = null;
    let isCancelled = false;
    let lastText = "";

    const updateProgressText = (nextText: string) => {
      if (nextText !== lastText) {
        lastText = nextText;
        setStrokeProgressText(nextText);
      }
    };

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion && replayTrigger === 0) {
      strokeMetrics.forEach(({ path }) => {
        path.style.strokeDashoffset = "0";
      });
      updateProgressText(`Hoàn tất ${totalStrokes} nét`);
      return;
    }

    const startDelayMs = 300;
    const startTime = performance.now() + startDelayMs;

    const animateFrame = (now: number) => {
      if (isCancelled) return;

      if (now < startTime) {
        updateProgressText(`Nét 0 / ${totalStrokes}`);
        rafId = requestAnimationFrame(animateFrame);
        return;
      }

      let elapsed = now - startTime;
      let activeStrokeFound = false;

      for (let i = 0; i < strokeMetrics.length; i++) {
        const { path, length, durationMs } = strokeMetrics[i];

        if (elapsed <= durationMs) {
          // Đang viết nét thứ i
          activeStrokeFound = true;
          const rawProgress = Math.max(0, Math.min(1, elapsed / durationMs));
          const easedProgress = humanBrushEase(rawProgress);
          const drawnLength = length * easedProgress;

          path.style.strokeDashoffset = `${length - drawnLength}`;
          updateProgressText(`Nét ${i + 1} / ${totalStrokes}`);

          // Di chuyển đầu bút đỏ theo đúng tọa độ nét đang viết
          try {
            const pt = path.getPointAtLength(drawnLength);
            brushTip.setAttribute("cx", `${pt.x}`);
            brushTip.setAttribute("cy", `${pt.y}`);
            brushTip.style.opacity = "1";
          } catch {
            brushTip.style.opacity = "0";
          }
          break;
        }

        // Nét thứ i đã viết xong hoàn toàn
        path.style.strokeDashoffset = "0";
        elapsed -= durationMs;

        if (elapsed <= pauseBetweenStrokesMs) {
          // Đang nhấc bút nghỉ giữa nét i và nét i + 1
          activeStrokeFound = true;
          brushTip.style.opacity = "0";
          updateProgressText(`Nét ${i + 1} / ${totalStrokes}`);
          break;
        }

        elapsed -= pauseBetweenStrokesMs;
      }

      if (activeStrokeFound) {
        rafId = requestAnimationFrame(animateFrame);
      } else {
        // Đã hoàn thành toàn bộ các nét
        brushTip.style.opacity = "0";
        updateProgressText(`Hoàn tất ${totalStrokes} nét`);
      }
    };

    rafId = requestAnimationFrame(animateFrame);

    return () => {
      isCancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [svgContent, replayTrigger, speed]);

  const cycleSpeed = () => {
    setSpeed((prev) =>
      prev === "slow" ? "normal" : prev === "normal" ? "fast" : "slow"
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Khung luyện viết chữ Hán với bóng mờ dẫn hướng và đầu bút mô phỏng tay người */}
      <div className="relative w-52 h-52 kanji-practice-grid border border-[var(--color-border-strong)] rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
        {strokeProgressText && (
          <span className="absolute top-2 left-2.5 z-20 text-[10px] font-bold text-[var(--color-ink-2)] bg-[var(--color-paper-1)]/90 px-2 py-0.5 rounded-md border border-[var(--color-border-subtle)] tabular-nums">
            {strokeProgressText}
          </span>
        )}

        {error ? (
          <div className="text-[var(--color-ink-3)] text-sm font-medium">
            Chưa có dữ liệu nét vẽ
          </div>
        ) : svgContent ? (
          <>
            {/* Lớp bóng mờ nền (Guide Silhouette) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 w-full h-full p-4 kanji-svg-guide pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            {/* Lớp nét mực được điều khiển trực tiếp từng khung hình bằng requestAnimationFrame */}
            <div
              ref={containerRef}
              className="relative z-10 w-full h-full p-4 kanji-svg-container"
            />
          </>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-7 h-7 border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-1)] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bộ nút điều khiển: Vẽ lại & Chỉnh tốc độ */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setReplayTrigger((k) => k + 1)}
          disabled={!svgContent}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--color-ink-1)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-border-subtle)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
        >
          <RefreshCw
            size={13}
            className={!svgContent ? "" : "animate-[spin_0.5s_ease-out]"}
            key={replayTrigger}
          />
          <span>Viết lại</span>
        </button>

        <button
          onClick={cycleSpeed}
          disabled={!svgContent}
          title="Đổi tốc độ viết"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-accent-1)] bg-[var(--color-accent-soft)] hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <Gauge size={13} />
          <span>{SPEED_CONFIG[speed].label}</span>
        </button>
      </div>
    </div>
  );
};
