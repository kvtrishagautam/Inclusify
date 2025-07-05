import { mount } from "svelte";
import ChromophobiaSidePanel from "../components/ChromophobiaSidePanel.svelte";

// Side panel
// https://developer.chrome.com/docs/extensions/reference/sidePanel/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaSidePanel, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
