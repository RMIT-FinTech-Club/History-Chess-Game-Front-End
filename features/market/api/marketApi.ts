
import axiosInstance from "@/config/apiConfig";

// Types
export interface MarketplaceItem {
    id: string;
    _id?: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
    dynasty: string;
    price: number;
    quantity: number;
    soldCount: number;
    category: string;
    transactionHash?: string;
    isActive: boolean;
    createdAt: string;
    historicalContext?: HistoricalContext;
}

export interface HistoricalContext {
    era: string;              // "1225-1400"
    significance: string;     // Main historical description
    keyFacts: string[];       // Array of interesting facts
    famousFigure?: {
        name: string;
        title: string;
        connection: string;
    };
    culturalImpact?: string;
}

export interface AuctionListing {
    id: string;
    _id?: string;
    nftId: string;
    sellerId: string;
    listingType: "FIXED_PRICE" | "AUCTION";
    price: number;
    currentBid?: number;
    highestBidderId?: string;
    status: "OPEN" | "SOLD" | "CANCELLED" | "EXPIRED" | "ENDED";
    startTime: string;
    endTime?: string;
    nftDetails?: {
        name: string;
        description: string;
        imageUrl: string;
        rarity: string;
        dynasty: string;
        category: string;
    };
}

export interface Bid {
    id: string;
    listingId: string;
    bidderId: string;
    amount: number;
    createdAt: string;
}

// API Functions
export const marketApi = {
    /**
     * Get marketplace items with optional filters
     */
    async getItems(params?: { dynasty?: string; category?: string }): Promise<MarketplaceItem[]> {
        const response = await axiosInstance.get("/market/items", { params });
        return response.data.items || [];
    },

    /**
     * Admin: Add a new marketplace item
     */
    async addItem(
        item: Omit<MarketplaceItem, "id" | "_id" | "soldCount" | "isActive" | "createdAt" | "transactionHash">,
        token: string
    ): Promise<MarketplaceItem> {
        const response = await axiosInstance.post("/market/items", item, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.item;
    },

    /**
     * Buy an item from the marketplace
     */
    async buyItem(itemId: string, quantity: number, token: string): Promise<{
        success: boolean;
        nftId: string;
        transactionHash: string;
    }> {
        const response = await axiosInstance.post(
            "/market/buy",
            { itemId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * Get active auctions
     */
    async getAuctions(): Promise<AuctionListing[]> {
        const response = await axiosInstance.get("/market/auctions");
        return response.data.auctions || [];
    },

    /**
     * Create an auction for an owned NFT
     */
    async createAuction(
        nftId: string,
        startingPrice: number,
        durationHours: number,
        token: string
    ): Promise<{ success: boolean; listingId: string; endTime: string }> {
        const response = await axiosInstance.post(
            "/market/auction",
            { nftId, startingPrice, durationHours },
            { headers: { Authorization: `Bearer ${token} ` } }
        );
        return response.data;
    },

    /**
     * Place a bid on an auction
     */
    async placeBid(
        listingId: string,
        amount: number,
        token: string
    ): Promise<{ success: boolean; bidId: string; newHighestBid: number }> {
        const response = await axiosInstance.post(
            "/market/bid",
            { listingId, amount },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * Get bids for an auction
     */
    async getAuctionBids(listingId: string): Promise<Bid[]> {
        const response = await axiosInstance.get(`/market/auction/${listingId}/bids`);
        return response.data.bids || [];
    },

    /**
     * Admin: End an auction
     */
    async endAuction(
        listingId: string,
        token: string
    ): Promise<{ success: boolean; winner: string | null; amount: number }> {
        const response = await axiosInstance.post(
            "/market/auction/end",
            { listingId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
};

export default marketApi;
