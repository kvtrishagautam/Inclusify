import { mount } from "svelte";
import ChromophobiaPopup from "../components/ChromophobiaPopup.svelte";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(ChromophobiaPopup, { target });
    }
}

document.addEventListener("DOMContentLoaded", render);
