import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Star, Trophy, Award, Shield, Sparkles } from "lucide-react";
import type { BadgeResponse } from "../../types/badge.types";
import { badgeService } from "../../services/badge.service";
import { AnimatedNumber } from "./AnimatedNumber";

const BadgeIcon = ({
  level,
  percentage,
}: {
  level: string;
  percentage: number;
}) => {
  let Icon = Medal;
  let badgeStyle =
    "bg-[var(--color-paper-3)] text-[var(--color-ink-2)] border-[var(--color-border-subtle)]";

  if (percentage === 10) {
    Icon = Star;
    badgeStyle =
      "bg-amber-50 text-amber-700 border-amber-300 shadow-[0_4px_14px_-4px_rgba(217,119,6,0.25)]";
  } else if (percentage === 50) {
    Icon = Award;
    badgeStyle =
      "bg-slate-100 text-slate-700 border-slate-300 shadow-[0_4px_14px_-4px_rgba(71,85,105,0.25)]";
  } else if (percentage === 100) {
    Icon = Trophy;
    badgeStyle =
      "bg-amber-100/80 text-amber-600 border-amber-400 shadow-[0_4px_18px_-4px_rgba(245,158,11,0.35)]";
  }

  if (level === "N1" && percentage === 100) {
    Icon = Shield;
    badgeStyle =
      "bg-[var(--color-accent-soft)] text-[var(--color-accent-1)] border-[var(--color-accent-1)]/40 shadow-[0_4px_18px_-4px_rgba(220,38,38,0.3)]";
  }

  return (
    <div
      className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg] ${badgeStyle}`}
    >
      <Icon size={28} />
    </div>
  );
};

export const BadgeShowcase = () => {
  const [badges, setBadges] = useState<BadgeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await badgeService.getMyBadges();
        setBadges(data);
      } catch (error) {
        console.error("Failed to fetch badges", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) return null;

  if (badges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-7 rounded-2xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-gold-1)] shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-ink-1)]">
              Huy hiệu & Thành tựu JLPT
            </h3>
            <p className="text-sm text-[var(--color-ink-2)] mt-0.5">
              Hoàn thành các mốc 10%, 50% và 100% từ vựng mỗi cấp độ JLPT để mở
              khóa ấn chương danh dự.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[var(--color-ink-3)] bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-full shrink-0">
          0 huy hiệu đã mở
        </span>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 rounded-2xl bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex flex-col gap-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent-1)] flex items-center justify-center">
            <Award size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-ink-1)] leading-tight">
              Bộ Sưu Tập Huy Hiệu
            </h3>
            <p className="text-xs text-[var(--color-ink-2)] mt-0.5">
              Ấn chương ghi nhận cột mốc chinh phục Hán tự của bạn
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-paper-2)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-ink-1)]">
          <Sparkles size={14} className="text-[var(--color-gold-1)]" />
          <span>Đã mở khóa</span>
          <AnimatedNumber
            value={badges.length}
            className="text-[var(--color-accent-1)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.badgeType}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: idx * 0.06,
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col items-center text-center p-4 rounded-xl bg-[var(--color-paper-2)]/70 hover:bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] overflow-hidden cursor-default shadow-xs hover:shadow-[var(--shadow-card)] transition-colors duration-200"
          >
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-paper-1)] border border-[var(--color-border-subtle)] text-[var(--color-ink-2)]">
              {badge.jlptLevel}
            </span>

            <BadgeIcon
              level={badge.jlptLevel}
              percentage={badge.requiredPercentage}
            />

            <div className="mt-3.5 z-10">
              <h4 className="font-bold text-sm text-[var(--color-ink-1)] group-hover:text-[var(--color-accent-1)] transition-colors">
                {badge.title}
              </h4>
              <p className="text-xs text-[var(--color-ink-2)] mt-1 leading-snug">
                {badge.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
