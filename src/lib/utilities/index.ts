export const createColumns = (items: App.WallpaperSearch[], columnsCount: number) => {
  const columns: App.WallpaperSearch[][] = Array.from({ length: columnsCount }, () => []);
  items.forEach((item, index) => columns[index % columnsCount].push(item));
  return columns;
};
