import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Star, Trophy, Award, Shield } from "lucide-react";
import type { BadgeResponse } from "../../types/badge.types";
import { badgeService } from "../../services/badge.service";

const BadgeIcon = ({
  level,
  percentage,
}: {
  level: string;
  percentage: number;
}) => {
  let Icon = Medal;
  let colorClass = "text-gray-400 border-gray-400/20"; // default

  if (percentage === 10) {
    Icon = Star;
    colorClass = "text-amber-600 border-amber-600/20"; // Bronze
  } else if (percentage === 50) {
    Icon = Award;
    colorClass = "text-slate-300 border-slate-300/20"; // Silver
  } else if (percentage === 100) {
    Icon = Trophy;
    colorClass = "text-yellow-400 border-yellow-400/20"; // Gold
  }

  if (level === "N1" && percentage === 100) {
    Icon = Shield;
    colorClass = "text-fuchsia-500 border-fuchsia-500/20 shadow-fuchsia-500/20";
  }

  return (
    <div
      className={`p-4 rounded-full bg-surface-1 dark:bg-surface-3 border-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] ${colorClass}`}
    >
      <Icon
        size={36}
        className="drop-shadow-[0_0_12px_rgba(currentcolor,0.4)]"
      />
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
      <div className="p-8 rounded-2xl bg-paper-1 dark:bg-surface-1 border border-border flex flex-col items-center justify-center text-center gap-3">
        <div className="p-4 rounded-full bg-surface-2 dark:bg-surface-2 border border-border">
          <Trophy className="text-gray-400 opacity-40" size={40} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-content-1">
            Huy hiệu & Thành tựu
          </h3>
          <p className="text-sm text-content-2 mt-1">
            Chưa có huy hiệu nào. Hãy học thêm Kanji để sưu tầm nhé!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-paper-1 dark:bg-surface-1 border border-border flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-content-1">
              Bộ sưu tập Huy hiệu
            </h3>
            <p className="text-sm text-content-2">
              Bạn đã mở khóa {badges.length} huy hiệu
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.badgeType}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: idx * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative flex flex-col items-center text-center p-5 rounded-2xl bg-paper-2 dark:bg-surface-2 border border-border overflow-hidden cursor-default shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <BadgeIcon
              level={badge.jlptLevel}
              percentage={badge.requiredPercentage}
            />

            <div className="mt-4 z-10">
              <h4 className="font-bold text-sm text-content-1 group-hover:text-primary transition-colors">
                {badge.title}
              </h4>
              <p className="text-[11px] text-content-2 mt-1 leading-tight">
                {badge.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
