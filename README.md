# CloudflareSpeedtest Extension

A Chrome extension that provides a compact toolbar popup for running Cloudflare-powered internet speed tests with one click.

Please note that this isn't an official extension from Cloudflare.

## Features

- **One-Click Testing**: Simple toolbar popup for instant speed measurements
- **Cloudflare-Powered**: Uses [Cloudflare&#39;s official speedtest module](https://github.com/cloudflare/speedtest)
- **Comprehensive Metrics**: Download, upload, latency, and jitter measurements
- **Privacy-Focused**: All data stays local in your browser
- **History Tracking**: Stores your last two test results locally

## Metrics Captured

- **Download speed** (Mbps)
- **Upload speed** (Mbps)
- **Latency** (ms)
- **Jitter** (ms)

## Installation

### From Source

1. Clone this repository (use your repository URL):

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```
2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```
3. Load the extension in Chrome:

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `fastdotcom-extension` directory

## Development

### Project structure

See `docs/STRUCTURE.md` for a detailed description of the project's layout and the responsibilities of top-level folders and files.

### Build commands

- `npm run build` — Build the speedtest bundle for production
- `npm run watch` — Build in watch mode for development
- `npm run clean` — Remove built files

Local loading / development

If you want to load the extension into your browser for local development, see `docs/LOADING.md` for step-by-step instructions on loading the unpacked extension and running in development mode.

### Data storage

The extension stores only the last two completed test results in `chrome.storage.local`. No data is sent to external servers beyond what's required for the speed test itself (to Cloudflare's speed test servers).

### Architecture

This project uses:

- **Chrome Extension Manifest V3**
- **Service Worker** for background test orchestration
- **Cloudflare Speedtest Module** for accurate measurements
- **Rollup** for bundling the speedtest module

## Privacy

- All test results are stored locally in your browser
- No analytics or tracking
- Only communicates with Cloudflare's speed test servers (`https://speed.cloudflare.com/*`)

## License

This project is licensed under the terms of the `LICENSE` file in the repository root.

## Credits

Speed testing powered by [Cloudflare&#39;s speedtest module](https://github.com/cloudflare/speedtest).
