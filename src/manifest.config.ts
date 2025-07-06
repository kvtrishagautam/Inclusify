import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
    // can only contain digits, dots, or dash
    .replace(/[^\d.-]+/g, "")
    // split into version parts
    .split(/[.-]/);

export default defineManifest(async () => ({
    manifest_version: 3,
    name: "Inclusify - Accessibility & Chromophobia-Friendly Browser",
    description: "A Chrome extension that enhances website accessibility by scanning for WCAG compliance issues, highlighting interactive elements, providing alt-text suggestions, and helping people with chromophobia, cognitive disabilities, and dyslexia browse the web comfortably with color-free viewing options.",
    version: `${major}.${minor}.${patch}`,
    version_name: version,
    icons: {
        "16": "src/assets/icons/new-icon1.png",
        "32": "src/assets/icons/new-icon1.png",
        "48": "src/assets/icons/new-icon1.png",
        "128": "src/assets/icons/new-icon1.png",
    },
    content_scripts: [
        {
            matches: ["<all_urls>"],
            js: ["src/content/index.ts"],
        },
    ],
    background: {
        service_worker: "src/background/index.ts",
    },

    action: {
        default_icon: {
            "16": "src/assets/icons/new-icon1.png",
            "32": "src/assets/icons/new-icon1.png",
            "48": "src/assets/icons/new-icon1.png",
            "128": "src/assets/icons/new-icon1.png",
        },
    },
    permissions: ["storage", "sidePanel", "activeTab", "scripting"] as chrome.runtime.ManifestPermissions[],
    host_permissions: ["<all_urls>"],
}));
