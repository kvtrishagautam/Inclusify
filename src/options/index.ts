import { mount } from "svelte";
import ChromophobiaSidePanel from "../components/ChromophobiaSidePanel.svelte";

// Options
// https://developer.chrome.com/docs/extensions/mv3/options/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaSidePanel, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
