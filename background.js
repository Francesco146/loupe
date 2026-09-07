"use strict";

import { load_option } from "./options/optionslib.js";

async function handle_message(msg, sender) {
    if (!sender.tab) return;

    const tabId = sender.tab.id;

    if (msg.type === "clear") {
        browser.find.removeHighlighting(tabId);
        return;
    }

    if (msg.type === "highlight") {
        let trim = await load_option("trim_selection");
        let text = trim ? msg.selection.trim() : msg.selection;

        let opts = {
            tabId: tabId,
            caseSensitive: await load_option("case_sensitive"),
            entireWord: await load_option("entire_word"),
        };

        try {
            await browser.find.removeHighlighting(tabId);
            let result = await browser.find.find(text, opts);

            if (result.count > 0) {
                browser.find.highlightResults({ tabId });
            }
        } catch (error) {
            console.error("Loupe Search Error:", error);
        }
    }
}

function main() {
    browser.runtime.onMessage.addListener(handle_message);
    browser.action.onClicked.addListener(() =>
        browser.runtime.openOptionsPage(),
    );
}

main();
