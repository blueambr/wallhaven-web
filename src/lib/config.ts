export const site = {
  name: "Wallpapers lite",
  short_name: "Wallpapers",
  title_postfix: "• Wallpapers lite",
  description:
    "High-quality wallpapers for desktop and mobile across multiple categories. Mobile-first design. Powered by wallhaven.cc.",
  og_image: "/og_image.png",
  keywords: "wallpapers, wallhaven, art, pictures, images, backgrounds, mobile, desktop, portrait, landscape",
  url: "https://wallpaperslite.eu",
  author: {
    name: "Vlad Gerasimovich",
    email: "sor@sorhavn.eu",
  },
  locale: "en_US",
};

export const externalApiWebsite = "https://wallhaven.cc";

const externalApiBaseUrl = `${externalApiWebsite}/api/v1`;
export const externalApiSearchUrl = `${externalApiBaseUrl}/search`;
export const externalApiWallpaperUrl = `${externalApiBaseUrl}/w`;

const apiBaseUrl = "/api/wallhaven";
export const apiSearchUrl = `${apiBaseUrl}/search`;
export const apiWallpaperUrl = `${apiBaseUrl}/w`;
