# Inclusify - Chrome Extension for Accessibility Testing

A Chrome extension that scans web pages for accessibility issues and provides visual overlays with detailed feedback, similar to WebAIM Wave's browser extension.

## Features

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

1. Clone this repository
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
   - Select the `dist` folder

## Testing the Fixes

### 1. Test Axe-Core Functionality
1. Load the extension
2. Navigate to `test-page.html` in your browser
3. Click the "Test Axe-Core" button in the test controls
4. Check the debug log for successful axe-core initialization and audit completion

### 2. Test Multiple Audits
1. Click "Test Multiple Audits" button
2. Verify that audits are queued and processed sequentially
3. Check console for no "axe is already running" errors

### 3. Test DOM Changes
1. Click "Test DOM Changes" button
2. Verify that new elements trigger audits after a delay
3. Check that audits are debounced and not excessive

### 4. Test Visual Overlays
1. Enable the extension on the test page
2. Look for:
   - Red borders around critical issues (missing alt text, buttons without names)
   - Orange borders around serious issues (empty links, headings)
   - Yellow borders around moderate issues (heading order, duplicate IDs)
   - Green borders around minor issues (redundant alt text)
   - Blue borders around interactive elements

### 5. Test Extension Panel
1. Click the extension icon in Chrome toolbar
2. Verify the panel opens with accessibility information
3. Test the minimize button functionality
4. Check that issue counts are displayed correctly

## Debugging

### Console Logs
The extension provides detailed console logging:
- `Axe-core initialized successfully` - Confirms proper initialization
- `Starting accessibility audit...` - Shows when audits begin
- `Accessibility audit completed` - Confirms successful completion
- `Audit skipped - disabled or already running` - Shows proper locking

### Debug Panel
The test page includes a debug panel that shows:
- Real-time logging of extension activities
- Axe-core test results
- DOM change detection
- Error messages

## Common Issues and Solutions

### "Axe is already running" Error
**Cause**: Multiple simultaneous axe-core audits
**Solution**: ✅ Fixed with audit queuing and locking

### Extension Not Working
**Check**:
1. Extension is loaded in Chrome
2. Extension is enabled on the current page
3. Console shows no JavaScript errors
4. Debug panel shows successful initialization

### Visual Overlays Not Appearing
**Check**:
1. Extension is enabled
2. Page has accessibility issues
3. No CSS conflicts hiding overlays
4. Console shows audit completion

## Technical Details

### Architecture
- **Content Script**: Handles DOM scanning and overlay creation
- **Service Layer**: AccessibilityService manages axe-core and audit logic
- **Controller Layer**: AccessibilityController manages state and UI updates
- **UI Components**: Svelte components for the extension panel

### Key Files
- `src/services/AccessibilityService.ts` - Core accessibility logic
- `src/controllers/AccessibilityController.ts` - State management
- `src/content/index.ts` - Content script entry point
- `test-page.html` - Comprehensive test page

### Axe-Core Configuration
The extension uses a subset of axe-core rules for performance:
- Color contrast
- Image alt text
- Button names
- Link names
- Form field labels
- Heading order
- List structure
- Landmarks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the test page
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
