import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import marketApi, { MarketplaceItem } from "../api/marketApi";

export const useMarketItems = (filters: { dynasty?: string; category?: string } = {}) => {
  return useQuery({
    queryKey: ["marketItems", filters],
    queryFn: () => marketApi.getItems(filters),
  });
};

export const useAuctions = () => {
  return useQuery({
    queryKey: ["auctions"],
    queryFn: () => marketApi.getAuctions(),
  });
};

export const useBuyItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, accessToken }: { itemId: string; accessToken: string }) =>
      marketApi.buyItem(itemId, 1, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketItems"] });
    },
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, amount, accessToken }: { listingId: string; amount: number; accessToken: string }) =>
      marketApi.placeBid(listingId, amount, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
  });
};

export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: Omit<MarketplaceItem, "id" | "_id" | "soldCount" | "isActive" | "createdAt" | "transactionHash">; accessToken: string }) =>
      marketApi.addItem(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketItems"] });
    },
  });
};
