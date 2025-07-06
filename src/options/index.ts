import { mount } from "svelte";
import ChromophobiaSidePanelView from "../views/ChromophobiaSidePanelView.svelte";

// Options
// https://developer.chrome.com/docs/extensions/mv3/options/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaSidePanelView, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
