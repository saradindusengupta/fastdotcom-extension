# Project Structure

This repository uses a simple, conventional layout for a Chrome extension (Manifest V3).

```text
fastdotcom-extension/
├── manifest.json            # Extension configuration (MV3)
├── popup/
│   ├── popup.html           # Popup UI (loaded from browser action)
│   ├── popup.css            # Popup styles
│   └── popup.js             # Popup script (no test logic yet)
├── background/
│   └── service_worker.js    # Background service worker (install log, message stub)
├── content/
│   └── content.js           # Content script scaffold (not yet injected)
├── icons/
│   └── README.md            # Guidance for adding icons
├── docs/
│   ├── LOADING.md           # How to load the extension unpacked
│   └── STRUCTURE.md         # This file
├── README.md                # Project overview
└── LICENSE                  # License
```

## Notes

- Icons are not required for local testing, but are strongly recommended and required for Chrome Web Store listing. See `icons/README.md`.
- Host permissions for `fast.com` are intentionally omitted for least privilege during scaffolding; add them when the implementation needs them.
- The content script is not referenced in the manifest yet; wire it in when you decide whether it’s needed.
