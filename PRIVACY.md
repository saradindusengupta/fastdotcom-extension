# Privacy Policy

Last updated: 2025-11-05
Version: 0.3.0

This privacy notice explains what data the "Cloudflare Speed test" browser extension ("the extension") collects or accesses, why it needs that data, how it is stored, and how you can control or delete it.

Summary
- The extension does not collect or transmit your personal data to third parties on its own.
- It performs speed tests by communicating directly with Cloudflare's speed test endpoints (https://speed.cloudflare.com). Those requests necessarily reach Cloudflare and are subject to Cloudflare's privacy practices.
- The extension persists a small, local history of recent test results in your browser's local storage (`chrome.storage.local`). This data remains on your device and is not uploaded by the extension.

What data the extension accesses or stores
- Speed test results: download (Mbps), upload (Mbps, if available), latency (ms), jitter (ms), units and a timestamp. These are stored locally in `chrome.storage.local` and used to render history and UI features.
  - Retention: the extension keeps up to the two most recent successful results. Older items are removed automatically.
- Client IP (display-only): the popup fetches `https://speed.cloudflare.com/cdn-cgi/trace` to read your public IP address so it can be displayed in the UI. The extension does not store this IP persistently; it is fetched on popup open and shown to you.

Network requests and third parties
- To measure your network performance, the extension uses Cloudflare's official speed test engine and therefore communicates with `https://speed.cloudflare.com/*` (this is declared in `host_permissions`). Those requests are necessary for the service to work; Cloudflare will receive normal network metadata (including your IP) and handle the test measurements. The extension itself does not forward the collected test metrics to any other third party.

Permissions requested and why
- `storage`: used to persist a small recent history of results locally so the popup can show your last measurements and a simple comparison.
- `host_permissions` for `https://speed.cloudflare.com/*`: required to perform the speed test and to fetch the `cdn-cgi/trace` endpoint for IP display. These network calls are part of the extension's core functionality.

How the data is stored and protected
- The extension stores history only in the browser's local extension storage (`chrome.storage.local`). This storage is on your machine and only accessible to the extension. The extension does not transmit stored history to any external analytics or telemetry service.
- We recommend keeping your browser and OS up-to-date. If other extensions or software are installed with elevated permissions, they may be able to access local data — that is outside the control of this extension.

User controls and opt-out
- Clear history: you can clear stored results using the "Clear history" button available in the popup UI — this removes stored results from `chrome.storage.local`.
- Uninstall: removing the extension from your browser will prevent it from running and will remove extension-specific storage in most browsers. (Browser behavior may vary; you may manually clear extension data in browser settings if required.)
- Do not use: if you do not want to send network requests to Cloudflare (for example, to obtain measurements or the IP trace), do not use the extension or uninstall it.

Changes to this policy
- This file will be updated if the extension's data practices change (for example, if telemetry is added). Check this file or the repository for the latest information.

Contact
- For questions or to report privacy concerns, please open an issue on the project's repository: https://github.com/saradindusengupta/fastdotcom-extension (or update the contact information in this file to your preferred contact).

Legal and notes
- This privacy notice describes the extension as of the date above. It is not a legal contract. If you require a formal Data Processing Agreement, please contact the repository owner.

Acknowledgements
- Speed test functionality provided by Cloudflare's speedtest engine. Cloudflare's own privacy policy applies to requests that reach their servers.
