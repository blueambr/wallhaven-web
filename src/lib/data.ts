import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpDown,
  CalendarClock,
  Eye,
  Gem,
  Leaf,
  MonitorSmartphone,
  Shapes,
  Shuffle,
  Smartphone,
  TvMinimal,
  type Icon,
} from "@lucide/svelte";
import { nanoid } from "nanoid";

interface Category {
  id: string | number;
  name: string;
  description: string;
  slug: string;
  cover: string;
  queryParams: Record<string, string>;
}

interface Filter {
  id: string | number;
  open?: boolean;
  icon: typeof Icon;
  name: string;
  singleton?: boolean;
  options: {
    id: string | number;
    icon?: typeof Icon;
    name: string;
    value: {
      [key: string]: string | string[];
    };
  }[];
}

export const staticRoutes = ["", "/search", "/terms"];

export const categories: Category[] = [
  {
    id: "all",
    name: "All",
    description: "All wallpapers across every category",
    slug: "all",
    cover: "/categories/all.png",
    queryParams: { q: "" },
  },
  {
    id: 82,
    name: "Animals",
    description: "Wildlife and pets from around the world",
    slug: "animals",
    cover: "/categories/animals.jpg",
    queryParams: { q: "id:82" },
  },
  {
    id: 1,
    name: "Anime",
    description: "Characters and scenes from anime series, or in anime style",
    slug: "anime",
    cover: "/categories/anime.jpg",
    queryParams: { q: "id:1" },
  },
  {
    id: 74,
    name: "Abstract",
    description: "Patterns, shapes, and artistic designs",
    slug: "abstract",
    cover: "/categories/abstract.jpg",
    queryParams: { q: "id:74" },
  },
  {
    id: 989,
    name: "Architecture",
    description: "Buildings and architectural structures",
    slug: "architecture",
    cover: "/categories/architecture.jpg",
    queryParams: { q: "id:989" },
  },
  {
    id: 853,
    name: "Fantasy",
    description: "Dragons, magic, and mythical worlds",
    slug: "fantasy",
    cover: "/categories/fantasy.jpg",
    queryParams: { q: "id:853" },
  },
  {
    id: 1018,
    name: "Flowers",
    description: "Blooms, gardens, and floral arrangements",
    slug: "flowers",
    cover: "/categories/flowers.jpg",
    queryParams: { q: "id:1018" },
  },
  {
    id: 2278,
    name: "Minimalism",
    description: "Simple, clean designs with minimal elements",
    slug: "minimalism",
    cover: "/categories/minimalism.jpg",
    queryParams: { q: "id:2278" },
  },
  {
    id: 208,
    name: "Movies",
    description: "Film scenes, posters, and cinema-related imagery",
    slug: "movies",
    cover: "/categories/movies.jpg",
    queryParams: { q: "id:208" },
  },
  {
    id: 37,
    name: "Nature",
    description: "Landscapes, forests, and natural scenery",
    slug: "nature",
    cover: "/categories/nature.jpg",
    queryParams: { q: "id:37" },
  },
  {
    id: 690,
    name: "Paintings",
    description: "Classic and modern artwork",
    slug: "paintings",
    cover: "/categories/paintings.jpg",
    queryParams: { q: "id:690" },
  },
  {
    id: 109,
    name: "Photography",
    description: "Real-world photos and portraits",
    slug: "photography",
    cover: "/categories/photography.jpg",
    queryParams: { q: "id:109" },
  },
  {
    id: 14,
    name: "Sci-Fi",
    description: "Spaceships, robots, and futuristic themes",
    slug: "sci-fi",
    cover: "/categories/sci-fi.png",
    queryParams: { q: "id:14" },
  },
  {
    id: 307,
    name: "Sea",
    description: "Oceans, beaches, and underwater scenes",
    slug: "sea",
    cover: "/categories/sea.jpg",
    queryParams: { q: "id:307" },
  },
  {
    id: 32,
    name: "Space",
    description: "Planets, galaxies, and the cosmos",
    slug: "space",
    cover: "/categories/space.jpg",
    queryParams: { q: "id:32" },
  },
  {
    id: 20383,
    name: "Sports",
    description: "Athletes, sporting events, and sports-related content",
    slug: "sports",
    cover: "/categories/sports.jpg",
    queryParams: { q: "id:20383" },
  },
  {
    id: 11401,
    name: "Vehicles",
    description: "Cars, motorcycles, and other vehicles",
    slug: "vehicles",
    cover: "/categories/vehicles.png",
    queryParams: { q: "id:11401" },
  },
  {
    id: 55,
    name: "Video games",
    description: "Game characters, virtual worlds, and gaming-related content",
    slug: "video-games",
    cover: "/categories/video-games.png",
    queryParams: { q: "id:55" },
  },
];

export const filters: Filter[] = [
  {
    id: nanoid(),
    icon: Shapes,
    name: "Categories",
    options: [
      {
        id: nanoid(),
        name: "General",
        value: {
          categories: ["1", "0", "0"],
        },
      },
      {
        id: nanoid(),
        name: "Anime",
        value: {
          categories: ["0", "1", "0"],
        },
      },
      {
        id: nanoid(),
        name: "People",
        value: {
          categories: ["0", "0", "1"],
        },
      },
    ],
  },
  {
    id: nanoid(),
    icon: Leaf,
    name: "Purity",
    options: [
      {
        id: nanoid(),
        name: "SFW",
        value: {
          purity: ["1", "0", "0"],
        },
      },
      {
        id: nanoid(),
        name: "Sketchy",
        value: {
          purity: ["0", "1", "0"],
        },
      },
      {
        id: "filterPurityNSFW",
        name: "NSFW",
        value: {
          purity: ["0", "0", "1"],
        },
      },
    ],
  },
  {
    id: nanoid(),
    open: true,
    icon: MonitorSmartphone,
    name: "Orientation",
    options: [
      {
        id: nanoid(),
        icon: Smartphone,
        name: "Portrait",
        value: {
          ratios: "portrait",
        },
      },
      {
        id: nanoid(),
        icon: TvMinimal,
        name: "Landscape",
        value: {
          ratios: "landscape",
        },
      },
    ],
  },
  {
    id: nanoid(),
    open: true,
    icon: ArrowDownWideNarrow,
    name: "Sorting",
    singleton: true,
    options: [
      {
        id: nanoid(),
        icon: CalendarClock,
        name: "Date",
        value: {
          sorting: "date_added",
        },
      },
      {
        id: nanoid(),
        icon: Eye,
        name: "Views",
        value: {
          sorting: "views",
        },
      },
      {
        id: nanoid(),
        icon: Gem,
        name: "Toplist",
        value: {
          sorting: "toplist",
        },
      },
      {
        id: nanoid(),
        icon: Shuffle,
        name: "Random",
        value: {
          sorting: "random",
        },
      },
    ],
  },
  {
    id: nanoid(),
    icon: ArrowUpDown,
    name: "Order",
    singleton: true,
    options: [
      {
        id: nanoid(),
        icon: ArrowUpAZ,
        name: "Ascending",
        value: {
          order: "asc",
        },
      },
      {
        id: nanoid(),
        icon: ArrowDownAZ,
        name: "Descending",
        value: {
          order: "desc",
        },
      },
    ],
  },
];
