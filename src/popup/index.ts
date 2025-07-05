import { mount } from "svelte";
import ChromophobiaPopupView from "../views/ChromophobiaPopupView.svelte";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaPopupView, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
