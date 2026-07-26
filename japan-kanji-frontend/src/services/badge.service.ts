import api from "./api";
import type { BadgeResponse } from "../types/badge.types";

export const badgeService = {
  getMyBadges: async (): Promise<BadgeResponse[]> => {
    const response = await api.get("/api/badges/me");
    return response.data;
  },
};
