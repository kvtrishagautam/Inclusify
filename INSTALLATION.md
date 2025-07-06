# 🚀 Quick Installation Guide

## Step 1: Build the Extension

Open your terminal/command prompt in the project folder and run:

```bash
npm install
npm run build
```

## Step 2: Load in Chrome/Edge

### For Chrome:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### For Edge:
1. Open Edge and go to `edge://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Step 3: Use the Extension

1. **Look for the extension icon** in your browser toolbar
2. **Click the icon** to open the popup
3. **Enable "Enable Dyslexia Helper"**
4. **A sidebar will appear** with all the features

## 🎯 Quick Test

1. Go to any website (like a news site)
2. Click the extension icon
3. Enable the main toggle
4. Try changing the font or enabling high contrast
5. You should see the website content change!

## 🐛 If It's Not Working

1. **Check the console** (F12) for errors
2. **Reload the extension** in chrome://extensions/
3. **Try refreshing the webpage**
4. **Use debug commands** in console:
   - `debugDyslexiaHelper()`
   - `refreshDyslexiaStyling()`

## 📞 Need Help?

- Check the main README.md for detailed instructions
- Look for error messages in the browser console
- Make sure you're not on a restricted page (chrome://, edge://, etc.) 