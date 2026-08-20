import { browser } from "$app/environment";

const defaultFilters: App.Filters = {
  filters: [
    {
      purity: "100",
    },
    {
      sorting: "date_added",
    },
    {
      order: "desc",
    },
  ],
};

const storedFilters = browser ? localStorage.getItem("filters") : null;

let state = $state(storedFilters ? JSON.parse(storedFilters) : defaultFilters);

const createQueryParams = (): App.FiltersQuery => {
  const queryParams: App.FiltersQuery = {};

  state.filters.forEach((filter: App.Filters["filters"][]) => {
    Object.entries(filter).forEach(([key, value]) => {
      const joinedValue = Array.isArray(value) ? value.join("") : value;

      if (queryParams[key]) {
        queryParams[key] = `${queryParams[key]},${joinedValue}`;
      } else {
        queryParams[key] = joinedValue;
      }
    });
  });

  return queryParams;
};

const save = () => localStorage.setItem("filters", JSON.stringify(state));

export const filters = {
  get state() {
    return state.filters;
  },

  get queryParams() {
    return createQueryParams();
  },

  setFilters(newFilters: App.Filters["filters"]) {
    state = { filters: newFilters };
    save();
  },

  reset() {
    state = defaultFilters;
    save();
  },
};
