import { browser } from "$app/environment";

const defaultApiKey = "";

const storedApiKey = browser ? localStorage.getItem("apiKey") : null;

let state = $state(storedApiKey || defaultApiKey);

const save = () => localStorage.setItem("apiKey", state);

export const apiKey = {
  get state() {
    return state;
  },

  setApiKey(newApiKey: string) {
    state = newApiKey;
    save();
  },

  reset() {
    state = defaultApiKey;
    save();
  },
};
