import { mount } from "svelte";
import ChromophobiaPopupView from "../views/ChromophobiaPopupView.svelte";
import CognitivePopupView from "../views/CognitivePopupView.svelte";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

function render() {
    const target = document.getElementById("app");

    if (target) {
        // Mount both chromophobia and cognitive popup views
        mount(ChromophobiaPopupView, { target });
        mount(CognitivePopupView, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
