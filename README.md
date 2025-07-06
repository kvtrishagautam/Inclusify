# Inclusify - Chrome Extension for Accessibility Testing

A Chrome extension that scans web pages for accessibility issues and provides visual overlays with detailed feedback, similar to WebAIM Wave's browser extension.

## ✨ Features

- **Real-time DOM scanning** using axe-core for WCAG compliance
- **Visual overlays** with color-coded borders and icons directly on webpage elements
- **Interactive tooltips** showing detailed accessibility information
- **Alt-text suggestions** with confidence scores
- **Interactive element highlighting** for buttons, links, forms, etc.
- **Debounced DOM change detection** to prevent excessive audits
- **Minimizable panel** for non-intrusive use

## Recent Fixes (Latest Update)

### Axe-Core Issues Resolved
- **Fixed "axe is already running" error** by implementing audit queuing and locking mechanisms
- **Prevented multiple simultaneous audits** with proper state management
- **Added debouncing** to DOM change detection to reduce audit frequency
- **Improved error handling** for axe-core initialization and execution
- **Added audit cooldown** (2 seconds minimum between audits)

### Key Improvements
1. **Audit Locking**: Only one audit can run at a time
2. **Request Queuing**: Multiple audit requests are queued and processed sequentially
3. **DOM Change Filtering**: Only meaningful changes trigger audits
4. **Proper Axe Initialization**: Axe-core is configured only once per service instance

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
