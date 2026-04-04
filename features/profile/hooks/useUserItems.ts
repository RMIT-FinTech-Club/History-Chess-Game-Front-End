import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/apiConfig";

import { HistoricalContext } from "@/features/market/api/marketApi";

export interface UserItem {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
  dynasty: string;
  category: "SKIN" | "ITEM";
  mintedTime: string;
  historicalContext?: HistoricalContext;
}


interface UserItemsResponse {
  success: boolean;
  data: {
    skins: UserItem[];
    items: UserItem[];
  };
}

export const useUserItems = (userId: string | null, accessToken: string | null) => {
  return useQuery({
    queryKey: ["userItems", userId],
    queryFn: async (): Promise<UserItemsResponse> => {
      const response = await axiosInstance.get(`/items/user/${userId}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      return response.data;
    },
    enabled: !!userId,
  });
};
