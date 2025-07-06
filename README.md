# Inclusify - Chromophobia & Cognitive Accessibility Extension

A Chrome extension designed to help people with chromophobia (fear of colors) and cognitive disabilities browse the web comfortably by providing color-free viewing options and cognitive accessibility aids.

## Features

### 🎨 Chromophobia-Friendly Modes

- **Grayscale**: Converts all colors to pure black and white
- **Monochrome**: Applies a sepia tone effect for a warmer, vintage look
- **Desaturated**: Reduces color intensity while maintaining some color information
- **Saturation, Brightness, Contrast Controls**: Fine-tune the page appearance

### 🧠 Cognitive Accessibility (NEW)

- **Big Cursor**: Enlarges the mouse cursor for easier tracking
- **Reading Mask**: Adds a transparent horizontal window with a dimmed overlay to help focus on lines of text
- **Reading Guide**: Shows a colored line that follows the mouse to guide reading
- **Text Size Control**: Slider to increase or decrease text size for better readability

> **Note:** Only these 4 cognitive features are currently supported. All other cognitive features (Bionic Reading, Readability Mode, Focus Mode, Language Simplifier, Hide Distractions, etc.) have been removed for stability and usability.

## Popup Interface

- The extension popup now contains **two panels**:
  - **Chromophobia Controls**: For color filtering and adjustments
  - **Cognitive Accessibility Controls**: For big cursor, reading mask, reading guide, and text size
- Each panel can be enabled/disabled independently

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

### Chromophobia Controls

1. **Enable the Extension**: Click the extension icon in your browser toolbar
2. **Toggle Color-Free Mode**: Use the main toggle switch to enable/disable color filtering
3. **Choose a Mode**: Select from Grayscale, Monochrome, or Desaturated modes
4. **Adjust Settings**: Use the sliders to fine-tune saturation, brightness, and contrast

### Cognitive Accessibility Controls

1. **Enable Cognitive Mode**: In the popup, toggle the Cognitive Accessibility panel
2. **Big Cursor**: Enable to make the cursor larger and more visible
3. **Reading Mask**: Enable to add a horizontal reading window with dimmed overlay
4. **Reading Guide**: Enable to show a colored line following the mouse
5. **Text Size**: Use the slider to increase or decrease text size (default is 105%)

## Technical Details

### Architecture

- Built with **Svelte 5** and **TypeScript**
- Uses **Chrome Extension Manifest V3**
- Persistent settings stored in Chrome's sync storage
- Real-time webpage filtering using CSS filters and overlays

### Components

- **Content Script**: Applies filters and cognitive aids to webpages
- **Popup**: Quick access interface for both chromophobia and cognitive controls
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
├── assets/                # Icons and static assets
├── background/            # Background scripts
├── content/               # Content scripts
├── controllers/           # Logic for chromophobia and cognitive features
├── models/                # State management for features
├── options/               # Options page
├── popup/                 # Extension popup
├── sidepanel/             # Side panel interface
├── views/                 # Svelte views for popup, controls, sidepanel
├── storage.ts             # Persistent storage utilities
└── manifest.config.ts     # Extension manifest
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
- **Local Processing**: All filtering and accessibility features happen locally in the browser
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

- Built for the chromophobia and neurodivergent community
- Inspired by accessibility needs in web browsing
- Uses modern web technologies for optimal performance

---

**Note**: This extension is designed to help people with chromophobia and cognitive disabilities, but it's not a substitute for professional medical advice. If you're experiencing severe anxiety or accessibility challenges, please consult with a healthcare professional.
