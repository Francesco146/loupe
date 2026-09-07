"use strict";

const MAX_LEN = 100;
let MIN_LEN = 2;
let REQ_MODIFIER = "none";
let BLACKLIST = [];

let highlight_active = false;
let debounce_timer = null;

let active_keys = { altKey: false, ctrlKey: false, shiftKey: false };

function update_keys(e) {
    active_keys.altKey = e.altKey;
    active_keys.ctrlKey = e.ctrlKey || e.metaKey; // metaKey handles mac cmd
    active_keys.shiftKey = e.shiftKey;
}

async function load_settings() {
    let data = await browser.storage.sync.get([
        "min_length",
        "modifier_key",
        "blacklist",
    ]);
    if (data.min_length !== undefined) MIN_LEN = data.min_length;
    if (data.modifier_key !== undefined) REQ_MODIFIER = data.modifier_key;
    if (data.blacklist !== undefined) {
        BLACKLIST = data.blacklist
            .split("\n")
            .map((d) => d.trim().toLowerCase())
            .filter((d) => d.length > 0);
    }
}

async function evaluate_selection() {
    const currentHost = window.location.hostname.toLowerCase();
    const isBlacklisted = BLACKLIST.some((domain) =>
        currentHost.includes(domain),
    );
    if (isBlacklisted) return;

    const selection = window.getSelection().toString();

    let modifier_met = true;
    if (REQ_MODIFIER === "alt") modifier_met = active_keys.altKey;
    if (REQ_MODIFIER === "ctrl") modifier_met = active_keys.ctrlKey;
    if (REQ_MODIFIER === "shift") modifier_met = active_keys.shiftKey;

    const valid =
        selection.length >= MIN_LEN &&
        selection.length <= MAX_LEN &&
        modifier_met;

    if (valid) {
        await browser.runtime.sendMessage({
            type: "highlight",
            selection: selection,
        });
        highlight_active = true;
    } else if (highlight_active) {
        await browser.runtime.sendMessage({ type: "clear" });
        highlight_active = false;
    }
}

function main() {
    load_settings();

    // keep settings in sync if changed in another tab
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            if (changes.min_length) MIN_LEN = changes.min_length.newValue;
            if (changes.modifier_key)
                REQ_MODIFIER = changes.modifier_key.newValue;
        }
    });

    document.addEventListener("mousedown", update_keys);
    document.addEventListener("keydown", update_keys);
    document.addEventListener("keyup", update_keys);

    document.addEventListener("selectionchange", () => {
        clearTimeout(debounce_timer);
        debounce_timer = setTimeout(evaluate_selection, 250);
    });
}

main();
