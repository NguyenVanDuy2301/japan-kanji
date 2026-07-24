import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PrototypeSwitcherProps {
  variants: { id: string; name: string }[];
  current: string;
}

export default function PrototypeSwitcher({ variants, current }: PrototypeSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Hide in production
  if (process.env.NODE_ENV === "production") return null;

  const currentIndex = variants.findIndex(v => v.id === current);
  const currentVariant = variants[currentIndex] || variants[0];

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % variants.length;
    searchParams.set("variant", variants[nextIndex].id);
    setSearchParams(searchParams, { replace: true });
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + variants.length) % variants.length;
    searchParams.set("variant", variants[prevIndex].id);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, variants]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white dark:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-200 dark:border-neutral-700 px-2 py-2 rounded-full font-mono text-xs text-neutral-600 dark:text-neutral-300 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <button 
        onClick={handlePrev}
        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="px-2 select-none font-medium">
        <span className="text-orange-500 font-bold">{currentVariant.id}</span> — {currentVariant.name}
      </div>
      <button 
        onClick={handleNext}
        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
