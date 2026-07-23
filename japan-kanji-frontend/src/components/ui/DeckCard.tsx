import { BookOpen, Folder, Layers, MoreVertical, ChevronRight } from "lucide-react";
import type { DeckResponse } from "../../services/deck.service";
import { useState, useRef, useEffect } from "react";

interface DeckCardVariantProps {
  deck: DeckResponse;
  type: 'official' | 'custom' | 'saved';
  actions?: React.ReactNode;
  onStudy?: () => void;
}

export default function DeckCard({ deck, type, actions, onStudy }: DeckCardVariantProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="group relative bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 overflow-visible flex flex-col h-full transform hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl"></div>
      
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${type === 'official' ? 'bg-red-50 text-red-600' : type === 'custom' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} transition-transform group-hover:scale-110`}>
          {type === 'official' ? <BookOpen size={28} /> : <Folder size={28} />}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-sm font-bold text-neutral-600 shadow-sm border border-neutral-200/50">
            <Layers size={16} />
            <span>{deck.vocabularyCount}</span>
          </div>

          {actions && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                  <div className="flex flex-col p-1" onClick={() => setIsMenuOpen(false)}>
                    {actions}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">{deck.title}</h3>
      <p className="text-neutral-500 text-sm line-clamp-2 mb-6">{deck.description || "Chưa có mô tả"}</p>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onStudy?.(); }}
        className="mt-auto w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center group/btn shadow-sm hover:shadow-md"
      >
        Bắt Đầu Học 
        <ChevronRight size={20} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
