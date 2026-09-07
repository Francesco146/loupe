"use strict";

import { OPTS, load_option, store_option } from "./optionslib.js";

function read_option(option_id) {
    let el = document.querySelector(`#${option_id}`);
    if (el.type === "checkbox") return el.checked;
    if (el.type === "number") return parseInt(el.value);
    return el.value;
}

function write_option(option_id, value) {
    let el = document.querySelector(`#${option_id}`);
    if (el.type === "checkbox") el.checked = value;
    else el.value = value;
}

async function restore_options() {
    await Promise.all(
        Object.keys(OPTS).map(async (opt) => {
            let state = await load_option(opt);
            write_option(opt, state);
        }),
    );
}

async function save_options(e) {
    e.preventDefault();
    let btn = document.querySelector("#save_btn");
    let minLengthInput = document.querySelector("#min_length");
    let originalText = btn.textContent;

    if (
        minLengthInput.value < 1 ||
        minLengthInput.value > 50 ||
        isNaN(minLengthInput.value)
    ) {
        btn.textContent = "Error: Invalid Length!";
        btn.classList.add("error");
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("error");
        }, 2000);
        return;
    }

    await Promise.all(
        Object.keys(OPTS).map(async (opt) => {
            let state = read_option(opt);
            await store_option(opt, state);
        }),
    );

    btn.textContent = "Saved!";
    btn.classList.add("saved");

    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("saved");
    }, 1500);
}

function main() {
    document.addEventListener("DOMContentLoaded", restore_options);
    document.querySelector("form").addEventListener("submit", save_options);
}

main();
