export interface DynastyLore {
    title: string;
    period: string;
    description: string;
    keyEvents: { year: string; event: string; significance: string }[];
    culturalContributions: string[];
    famousFigure?: {
        name: string;
        title: string;
        achievement: string;
        imageUrl?: string;
    };
}

export const dynastyLoreData: Record<number, DynastyLore> = {
    1: { // Dinh
        title: "The First Emperors",
        period: "968–980",
        description: "After 1000 years of northern domination, Đinh Bộ Lĩnh unified the warring factions and established the first Vietnamese dynasty to claim emperor status, asserting equality with the northern emperors.",
        keyEvents: [
            { year: "968", event: "Unification", significance: "Đinh Bộ Lĩnh defeats the 12 Warlords" },
            { year: "970", event: "Thai Binh Era", significance: "Established the first reign era name" }
        ],
        culturalContributions: ["Centralized administration", "Regular army organization"],
        famousFigure: { name: "Đinh Bộ Lĩnh", title: "Emperor", achievement: "Unificator of the realm" }
    },
    2: { // Tien Le
        title: "Defenders of the Realm",
        period: "980–1009",
        description: "Founded by General Lê Hoàn amidst a Song dynasty invasion threat. The dynasty is renowned for its military prowess and successful defense of national sovereignty.",
        keyEvents: [
            { year: "981", event: "Battle of Bach Dang", significance: "Decisive naval victory against Song invaders" },
            { year: "982", event: "Champa Campaign", significance: "Secured the southern border" }
        ],
        culturalContributions: ["Promoted Buddhism", "Infrastructure development"],
        famousFigure: { name: "Lê Đại Hành", title: "Emperor", achievement: "Savior of the nation" }
    },
    3: { // Ly
        title: "The Golden Age",
        period: "1009–1225",
        description: "A period of great stability, cultural flourishing, and the establishment of Thăng Long (Hanoi) as the capital. The Ly dynasty laid the foundations of Vietnamese culture and education.",
        keyEvents: [
            { year: "1010", event: "Capital Relocation", significance: "Moved capital to Thăng Long" },
            { year: "1070", event: "Temple of Literature", significance: "First national university founded" },
            { year: "1075", event: "Confucian Exams", significance: "First imperial examination held" }
        ],
        culturalContributions: ["Ly Dynasty Architecture", "Ceramics", "Imperial Examination System"],
        famousFigure: { name: "Lý Thái Tổ", title: "Emperor", achievement: "Founder of Thăng Long" }
    },
    4: { // Tran
        title: "The Spirit of Steel",
        period: "1225–1400",
        description: "Legendary for defeating the mighty Mongol Empire three times. The Trần dynasty represents the indomitable spirit and martial prowess of Đại Việt.",
        keyEvents: [
            { year: "1258", event: "First Mongol Defeat", significance: "Strategic retreat and counter-attack" },
            { year: "1284", event: "Dien Hong Conference", significance: "First democratic gathering of elders" },
            { year: "1288", event: "Battle of Bach Dang", significance: "Final destruction of Mongol fleet" }
        ],
        culturalContributions: ["Nom Script (Chữ Nôm)", "Dai Viet Su Ky (History)", "Martial Arts"],
        famousFigure: { name: "Trần Hưng Đạo", title: "Grand Commander", achievement: "Defeated the Mongols" }
    },
    5: { // Ho
        title: "The Reformers",
        period: "1400–1407",
        description: "A short-lived but ambitious dynasty that attempted radical social and economic reforms before falling to the Ming invasion.",
        keyEvents: [
            { year: "1396", event: "Paper Currency", significance: "Issued 'Thong Bao Hoi Sao'" },
            { year: "1397", event: "Capital Move", significance: "Moved to Tay Do Citadel" }
        ],
        culturalContributions: ["Paper Money", "Ho Dynasty Citadel (UNESCO site)", "Cannon Technology"],
        famousFigure: { name: "Hồ Quý Ly", title: "Emperor", achievement: "Visionary Reformer" }
    },
    6: { // Hau Tran
        title: "The Resistance",
        period: "1407–1413",
        description: "A period of brave resistance against Ming occupation, keeping the flame of independence alive.",
        keyEvents: [
            { year: "1408", event: "Battle of Bo Co", significance: "Major victory against Ming forces" }
        ],
        culturalContributions: ["Spirit of non-submission"],
    },
    7: { // Le So
        title: "Restoration & Justice",
        period: "1428–1527",
        description: "Founded after the Lam Son Uprising against Ming rule. This era saw the height of Confucian governance and the Hong Duc legal code.",
        keyEvents: [
            { year: "1428", event: "Proclamation of Independence", significance: "Binh Ngo Dai Cao written" },
            { year: "1460", event: "Reign of Le Thanh Tong", significance: "Golden age of governance" }
        ],
        culturalContributions: ["Hong Duc Code", "Literature", "Map making"],
        famousFigure: { name: "Lê Lợi", title: "Emperor", achievement: "Hero of National Independence" }
    },
    8: { // Mac
        title: "Trade & Scholarship",
        period: "1527–1592",
        description: "Despite political controversy, the Mac dynasty oversaw a period of economic prosperity and open trade.",
        keyEvents: [
            { year: "1527", event: "Mac Ascension", significance: "Mạc Đăng Dung takes the throne" }
        ],
        culturalContributions: ["Ceramic Exports", "Buddhism Revival", "Architecture"],
        famousFigure: { name: "Mạc Đăng Dung", title: "Emperor", achievement: "Founder" }
    },
    9: { // Hau Le
        title: "The Divided Realm",
        period: "1533–1789",
        description: "The longest dynasty, marked by the division of power between Trịnh lords in the North and Nguyễn lords in the South.",
        keyEvents: [
            { year: "1627", event: "Trinh-Nguyen War", significance: "Start of century-long conflict" }
        ],
        culturalContributions: ["Diverse regional cultures", "Christianity introduced"],
        famousFigure: { name: "Nguyễn Hoàng", title: "Lord", achievement: "Pioneer of the South" }
    },
    10: { // Tay Son
        title: "The Peasant Heroes",
        period: "1778–1802",
        description: "A lightning-fast movement led by three brothers that unified the country, defeated the Qing army, and ended the Trinh-Nguyen war.",
        keyEvents: [
            { year: "1785", event: "Battle of Rach Gam-Xoai Mut", significance: "Defeated Siamese forces" },
            { year: "1789", event: "Battle of Ngoc Hoi-Dong Da", significance: "Lightning victory over Qing army" }
        ],
        culturalContributions: ["Nom script as official language", "Military innovation"],
        famousFigure: { name: "Quang Trung", title: "Emperor", achievement: "Military Genius" }
    },
    11: { // Nguyen
        title: "The Final Dynasty",
        period: "1802–1945",
        description: "The last imperial dynasty which unified the modern territory of Vietnam and built the Imperial City of Huế.",
        keyEvents: [
            { year: "1802", event: "Unification", significance: "Gia Long ascends throne" },
            { year: "1858", event: "French Invasion", significance: "Start of colonial era" }
        ],
        culturalContributions: ["Hue Court Music", "Imperial Architecture", "National Dress (Ao Dai roots)"],
        famousFigure: { name: "Minh Mạng", title: "Emperor", achievement: "Administrative Reformer" }
    }
};
