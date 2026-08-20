/**
 * See https://svelte.dev/docs/kit/types#app.d.ts
 * for information about these interfaces
 */
declare global {
  namespace App {
    interface Platform {
      caches?: {
        default: Cache;
      };
      ctx?: {
        waitUntil(promise: Promise<unknown>): void;
      };
    }

    interface WallpaperSearch {
      id: string;
      url: string;
      short_url: string;
      views: number;
      favorites: number;
      source: string;
      purity: string;
      category: string;
      dimension_x: number;
      dimension_y: number;
      resolution: string;
      ratio: string;
      file_size: number;
      file_type: string;
      created_at: string;
      colors: string[];
      path: string;
      thumbs: {
        large: string;
        original: string;
        small: string;
      };
    }

    interface WallpaperSearchResponse {
      data: WallpaperSearch[];
      meta: {
        current_page: number;
        last_page: number;
      };
    }

    interface Wallpaper extends WallpaperSearch {
      uploader: {
        username: string;
        group: string;
        avatar: {
          "200px": string;
          "128px": string;
          "32px": string;
          "20px": string;
        };
      };
      tags: {
        id: number;
        name: string;
        alias: string;
        category_id: number;
        category: string;
        purity: string;
        created_at: string;
      }[];
    }

    interface WallpaperResponse {
      data: Wallpaper;
    }

    type FiltersQuery = Record<string, string>;
    interface Filters {
      filters: Array<Record<string, string | string[]>>;
    }
  }
}

export {};
