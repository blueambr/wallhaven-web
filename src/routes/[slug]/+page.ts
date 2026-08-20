import { categories } from "$lib/data";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const { slug } = params;
  const category = categories.find(({ slug: categorySlug }) => categorySlug === slug);

  if (category) {
    return {
      ...category,
    };
  }

  error(404, "Not found");
};
