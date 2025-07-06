# Inclusify - Dyslexia Helper Extension

A browser extension designed to help people with dyslexia read web content more easily. The extension provides various accessibility features that can be toggled on/off through a sidebar interface.

## ✨ Features

- **Font Customization**: Change to dyslexia-friendly fonts (OpenDyslexic, Comic Sans, etc.)
- **Text Adjustments**: Modify font size, line spacing, word spacing, and letter spacing
- **High Contrast Mode**: Switch to high contrast colors for better readability
- **Link Highlighting**: Make links more visible with background highlighting
- **Focus Mode**: Highlight text under the cursor for better focus
- **Text-to-Speech**: Read selected text aloud with adjustable speed and voice
- **Reading Mode**: Simplify pages by removing distractions
- **Dyslexia Ruler**: Add a ruler that follows your cursor
- **Magnifier**: Zoom in on content
- **Keyboard Shortcuts**: Use Ctrl+Shift+B to toggle the sidebar

## 🚀 Installation

### For Users
1. Download the extension files
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `dist` folder
5. The extension is now installed!

### For Developers
```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Development mode with hot reload
npm run dev
```

## 🎯 How to Use

1. **Look for the floating icon** (📖) in the top-right corner of any webpage
2. **Click the icon** to open the sidebar
3. **Enable "Enable Dyslexia Helper"** to activate the extension (starts disabled by default)
4. **Toggle different features** in the sidebar:
   - Font settings (font family, size, spacing)
   - Visual aids (high contrast, link highlighting, focus mode, line focus)
   - Text-to-speech settings
   - Advanced features (reading mode, ruler, magnifier)

## 🔧 Features Explained

### Font Settings
- **Font Family**: Choose from dyslexia-friendly fonts like OpenDyslexic
- **Font Size**: Increase text size for better readability
- **Line Spacing**: Add more space between lines
- **Word/Letter Spacing**: Increase spacing between words and letters

### Visual Aids
- **High Contrast**: Switch to black background with white text
- **Link Highlighting**: Make links stand out with yellow backgrounds
- **Focus Mode**: Highlight text under your cursor
- **Line Focus**: Add a yellow highlight that follows your mouse cursor to help track lines while reading

### Text-to-Speech
- **Enable TTS**: Turn on text-to-speech functionality
- **Speech Rate**: Adjust how fast the text is read
- **Voice Selection**: Choose from available system voices
- **Read Selected Text**: Select any text and click the button to hear it

### Advanced Features
- **Reading Mode**: Simplify pages by removing ads and distractions
- **Dyslexia Ruler**: Add a ruler that follows your mouse cursor
- **Magnifier**: Zoom in on content for better visibility

## 🎨 How It Works

The extension works by:
1. **Injecting a content script** into web pages
2. **Mounting a sidebar** with all the controls
3. **Applying CSS styles** directly to webpage elements
4. **Protecting the sidebar** from being affected by the styling changes
5. **Observing DOM changes** to style new content automatically

## 🐛 Troubleshooting

### Extension Not Working?
1. **Check the console** (F12) for error messages
2. **Reload the extension** in chrome://extensions/
3. **Use debug functions** in the console:
   - `getDyslexiaSettings()` - Check current settings
   - `refreshDyslexiaStyling()` - Force refresh styling
   - `debugDyslexiaHelper()` - Debug the extension

### Common Issues
- **Sidebar not appearing**: Make sure the extension is enabled
- **Styles not applying**: Try refreshing the page or using debug functions
- **Features not working**: Check that the main toggle is enabled

### CSP Restrictions
Some websites (like LinkedIn, Gmail) have strict security policies. If features don't work:
1. Check the console for CSP warnings
2. Use the manual CSS injection function: `applyDyslexiaStyles(cssText)`

## 📁 Project Structure

```
src/
├── components/          # Svelte components
│   └── DyslexiaSidebar.svelte
├── controllers/         # Business logic
│   ├── DOMController.ts
│   ├── DyslexiaController.ts
│   └── EventController.ts
├── models/             # Data models
│   ├── DyslexiaSettings.ts
│   ├── SpeechModel.ts
│   └── StorageModel.ts
├── content/            # Content scripts
│   ├── index.ts
│   └── styles.css
├── popup/              # Extension popup
├── background/         # Background service worker
└── assets/             # Icons and resources
```

## 🎨 Customization

The extension is highly customizable. You can modify:
- **Fonts**: Add new dyslexia-friendly fonts
- **Colors**: Change default colors for overlays and highlights
- **Features**: Enable/disable specific features
- **UI**: Modify the sidebar appearance

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Look for error messages in the browser console
3. Create an issue in the repository

---

**Made with ❤️ for the dyslexia community**
