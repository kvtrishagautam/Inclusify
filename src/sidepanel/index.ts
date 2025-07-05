import { mount } from "svelte";
import ChromophobiaSidePanelView from "../views/ChromophobiaSidePanelView.svelte";

// Side panel
// https://developer.chrome.com/docs/extensions/reference/sidePanel/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaSidePanelView, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
