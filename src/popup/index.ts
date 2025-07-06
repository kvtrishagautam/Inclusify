import { mount } from "svelte";
import DyslexiaSidebar from "../components/DyslexiaSidebar.svelte";
import { DyslexiaController } from "../controllers/DyslexiaController";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

function render() {
    const target = document.getElementById("app");

    if (target) {
        // Initialize the controller first
        const controller = DyslexiaController.getInstance();
        controller.initialize().then(() => {
            // Mount the sidebar in popup mode
            mount(DyslexiaSidebar, { target });
        }).catch((error) => {
            console.error('Failed to initialize dyslexia controller:', error);
        });
    }
}

document.addEventListener("DOMContentLoaded", render);
