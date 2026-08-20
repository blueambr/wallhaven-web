import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
  const { id, wallpaper } = data;

  if (id) {
    return {
      id,
      wallpaper,
    };
  }

  error(404, "Not found");
};
