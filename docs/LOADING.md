# Load the Extension (Unpacked)

Follow these steps to try the extension in Chrome (Manifest V3):

1. Open `chrome://extensions/` in Chrome.
2. Enable "Developer mode" (top-right toggle).
3. Click "Load unpacked" and select the repository root directory.
4. You should see the extension listed as "fastdotcom-extension". Pin it from the toolbar if desired.
5. Click the extension icon to open the popup. You'll see a Test Speed button, History section, and Settings.

Notes:

- The extension supports two test modes: Hidden (no tabs) and Runner (embedded tab). See below for details.
- Host permissions include `https://fast.com/*` and multiple test providers for fallback.
- If you change files, Chrome hot-reloads some resources automatically. For background changes, click the refresh icon on the extension card to reload.

## Try the speed test (Hidden mode — no tabs)

**Default mode.** No tabs are opened; the test runs entirely in the background.

1. After loading, click the extension toolbar icon to open the popup.
2. Click "Test Speed". The background performs a hidden download-based measurement.
3. You'll see live Mbps updates in the popup and a final result. The last two results are stored locally.

**Fallback behavior:** The extension tries multiple test providers (Cloudflare, Google, others) in order until one responds. If all fail, the test will report an error.

**Note:** This mode does not use fast.com. It's a network-only speed test.

## Try the speed test (Runner mode — embedded tab)

**Optional mode.** Opens a background tab with fast.com embedded in an iframe.

1. Open the popup and go to Settings at the bottom.
2. Change "Test mode" from "Hidden (no tabs)" to "Runner (embedded tab)".
3. Click "Test Speed". An inactive tab opens to a local runner page embedding fast.com in an iframe.
4. The content script reads the speed from the iframe and streams updates; the tab closes when done.

## Switching modes

Use the **Settings** dropdown in the popup to choose:

- **Hidden (no tabs)** — Default. Runs a network-only test with no visible tabs. Not affiliated with fast.com.
- **Runner (embedded tab)** — Opens a background tab with fast.com embedded. Content script extracts the visible result.

Your preference is saved in `chrome.storage.local` and persists across sessions.

### Why a runner page and not an iframe in the popup?

Chrome restricts extensions from accessing cross-origin iframes directly in the popup UI. Content scripts inject based on the frame's URL, so hosting an embedded `https://fast.com/` iframe inside an extension page (the runner) lets the script run in that frame while the popup remains the control surface.

### Storage and privacy

- By default, only the last two completed results are stored locally in `chrome.storage.local` (most recent first). Nothing is sent off-device.
