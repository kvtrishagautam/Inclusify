# Inclusify - Chromophobia-Friendly Browser Extension

A Chrome extension designed to help people with chromophobia (fear of colors) browse the web comfortably by providing various color-free viewing options.

## Features

### 🎨 Color-Free Modes

- **Grayscale**: Converts all colors to pure black and white
- **Monochrome**: Applies a sepia tone effect for a warmer, vintage look
- **Desaturated**: Reduces color intensity while maintaining some color information

### ⚙️ Customizable Settings

- **Saturation Control**: Adjust color intensity from 0% (no color) to 100% (full color)
- **Brightness Control**: Modify page brightness from 0% to 200%
- **Contrast Control**: Adjust contrast levels from 0% to 200%

### 🚀 Quick Access

- **Floating Controls**: Click the floating palette icon on any webpage
- **Keyboard Shortcut**: Press `Ctrl+Shift+C` to toggle controls
- **Extension Popup**: Click the extension icon for quick settings
- **Side Panel**: Access advanced settings in the browser side panel

## Installation

### Development Setup

1. Clone this repository:

```bash
git clone <repository-url>
cd inclusify-chromophobia-extension
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the build output

### Production Installation

1. Download the latest release from the releases page
2. Extract the ZIP file
3. Follow steps 4-6 from the development setup above

## Usage

### Basic Usage

1. **Enable the Extension**: Click the extension icon in your browser toolbar
2. **Toggle Color-Free Mode**: Use the main toggle switch to enable/disable color filtering
3. **Choose a Mode**: Select from Grayscale, Monochrome, or Desaturated modes
4. **Adjust Settings**: Use the sliders to fine-tune saturation, brightness, and contrast

### Advanced Usage

1. **Side Panel**: Click "Advanced Settings" in the popup to open the side panel
2. **Quick Presets**: Use the Gentle, Moderate, or Strong presets for common configurations
3. **Fine Tuning**: Adjust individual settings for a personalized experience
4. **Keyboard Shortcuts**: Use `Ctrl+Shift+C` on any webpage to quickly access controls

### Settings Explained

- **Saturation**: Controls how much color is present (0% = no color, 100% = full color)
- **Brightness**: Controls overall page brightness (100% = normal, <100% = darker, >100% = brighter)
- **Contrast**: Controls the difference between light and dark elements (100% = normal, <100% = less contrast, >100% = more contrast)

## Technical Details

### Architecture

- Built with **Svelte 5** and **TypeScript**
- Uses **Chrome Extension Manifest V3**
- Persistent settings stored in Chrome's sync storage
- Real-time webpage filtering using CSS filters

### Components

- **Content Script**: Applies filters to webpages
- **Popup**: Quick access interface
- **Side Panel**: Advanced settings and controls
- **Background Script**: Handles extension lifecycle
- **Options Page**: Detailed configuration (if needed)

### Browser Compatibility

- Chrome 88+
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Development

### Project Structure

```
src/
├── components/          # Svelte components
│   ├── ChromophobiaControls.svelte
│   ├── ChromophobiaPopup.svelte
│   └── ChromophobiaSidePanel.svelte
├── content/            # Content scripts
├── popup/              # Extension popup
├── sidepanel/          # Side panel interface
├── background/         # Background scripts
├── storage.ts          # Persistent storage utilities
└── manifest.config.ts  # Extension manifest
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run check`: Type checking and linting

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all controls
- **High Contrast**: Interface designed with accessibility in mind
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color-Safe Interface**: Extension interface uses neutral colors

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any user data
- **Local Processing**: All color filtering happens locally in the browser
- **Minimal Permissions**: Only requests necessary permissions for functionality
- **Open Source**: Full transparency with open source code

## Support

If you encounter any issues or have suggestions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include browser version and extension version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the chromophobia community
- Inspired by accessibility needs in web browsing
- Uses modern web technologies for optimal performance

---

**Note**: This extension is designed to help people with chromophobia, but it's not a substitute for professional medical advice. If you're experiencing severe anxiety related to colors, please consult with a healthcare professional.
