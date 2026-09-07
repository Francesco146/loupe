"use strict";

// default values
export const OPTS = {
    case_sensitive: false,
    entire_word: true,
    trim_selection: true,
    min_length: 2,
    modifier_key: "none",
    blacklist: "docs.google.com\nnotion.so",
};

export async function store_option(id, value) {
    await browser.storage.sync.set({ [id]: value });
}

export async function load_option(id) {
    let data = await browser.storage.sync.get(id);

    if (data.hasOwnProperty(id)) {
        // backwards compatibility for older string-based "true"
        if (data[id] === "true") return true;
        if (data[id] === "false") return false;
        return data[id];
    }
    return OPTS[id];
}
