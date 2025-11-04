// Popup wiring for Cloudflare speed test
(function () {
  // Browser compatibility checks
  const hasRequiredAPIs = () => {
    const required = {
      chrome: typeof chrome !== 'undefined',
      runtime: typeof chrome?.runtime !== 'undefined',
      storage: typeof chrome?.storage?.local !== 'undefined',
      messaging: typeof chrome?.runtime?.sendMessage === 'function'
    };
    
    const missing = Object.entries(required)
      .filter(([_, exists]) => !exists)
      .map(([api]) => api);
    
    if (missing.length > 0) {
      console.error('Missing required APIs:', missing);
      return false;
    }
    
    return true;
  };
  
  if (!hasRequiredAPIs()) {
    document.body.innerHTML = '<main><p style="color: red; padding: 16px;">Browser compatibility error. Please use a modern Chrome/Edge browser.</p></main>';
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-test');
    const status = document.getElementById('status');
    const result = document.getElementById('result');
    const download = document.getElementById('download');
    const upload = document.getElementById('upload');
    const latency = document.getElementById('latency');
    const jitter = document.getElementById('jitter');
    const historyList = document.getElementById('history-list');
    const btnClear = document.getElementById('btn-clear');
  const progressContainer = document.getElementById('progress-container');
  const progressCircle = document.getElementById('progress-circle');
  const progressText = document.getElementById('progress-text'); // SVG text (hidden by CSS)
  const progressTextBelow = document.getElementById('progress-text-below'); // Visible text under ring
  const ipaddrEl = document.getElementById('ipaddr');
  const btnCopyIp = document.getElementById('btn-copy-ip');

    let running = false;

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function renderUpdate(metrics) {
      if (!result) return;
      result.hidden = false;

      if (download && metrics.download != null) {
        download.textContent = typeof metrics.download === 'number' ? metrics.download.toFixed(1) : String(metrics.download);
      }

      // Visual cue logic for download card color
      const downloadCard = document.querySelector('.metric-item.primary');
      chrome.storage.local.get(['results'], (data) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error when fetching for color cue:', chrome.runtime.lastError);
          return;
        }
        
        // Validate results data
        let results = [];
        try {
          if (Array.isArray(data?.results)) {
            results = data.results.filter(item => 
              item && 
              typeof item === 'object' &&
              typeof item.download === 'number' &&
              Number.isFinite(item.download)
            );
          }
        } catch (e) {
          console.error('Invalid results data:', e);
          return;
        }
        
        let avg = null;
        if (results.length >= 2) {
          avg = (results[0].download + results[1].download) / 2;
        }
        if (downloadCard && metrics.download != null && avg != null) {
          if (metrics.download < avg) {
            downloadCard.style.background = '#e50914';
            downloadCard.style.color = '#fff';
          } else {
            downloadCard.style.background = '#1db954';
            downloadCard.style.color = '#fff';
          }
        } else if (downloadCard) {
          // Default color if not enough history
          downloadCard.style.background = '';
          downloadCard.style.color = '';
        }
      });

      if (upload) {
        upload.textContent = metrics.upload != null && typeof metrics.upload === 'number' 
          ? metrics.upload.toFixed(1) 
          : '—';
      }

      if (latency) {
        latency.textContent = metrics.latency != null && typeof metrics.latency === 'number' 
          ? metrics.latency.toFixed(0) 
          : '—';
      }

      if (jitter) {
        jitter.textContent = metrics.jitter != null && typeof metrics.jitter === 'number' 
          ? metrics.jitter.toFixed(0) 
          : '—';
      }
    }

    function updateProgress(percent, phase, etaMs) {
      if (!progressContainer || !progressCircle || !progressText) return;
      progressContainer.hidden = false;
      const percentValue = Math.min(100, Math.max(0, percent));
      progressCircle.setAttribute('stroke-dasharray', `${percentValue}, 100`);
      // Keep the SVG text minimal (percentage) for fallback or a11y tooling
      progressText.textContent = `${Math.round(percentValue)}%`;
      // Prefer showing time remaining if available, else phase, else %
      if (Number.isFinite(etaMs) && etaMs > 0 && percentValue < 100) {
        const secs = Math.ceil(etaMs / 1000);
        const mins = Math.floor(secs / 60);
        const rem = secs % 60;
        const pretty = mins > 0 ? `${mins}m ${rem}s left` : `${secs}s left`;
        if (progressTextBelow) progressTextBelow.textContent = phase ? `${phase} • ${pretty}` : pretty;
      } else if (phase) {
        if (progressTextBelow) progressTextBelow.textContent = phase;
      } else {
        if (progressTextBelow) progressTextBelow.textContent = `${Math.round(percentValue)}%`;
      }
    }

    function hideProgress() {
      if (progressContainer) progressContainer.hidden = true;
      if (progressTextBelow) progressTextBelow.textContent = '';
    }

    async function loadClientIp() {
      try {
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const resp = await fetch('https://speed.cloudflare.com/cdn-cgi/trace', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        
        const text = await resp.text();
        const line = text.split('\n').find(l => l.startsWith('ip='));
        const ip = line ? line.split('=')[1].trim() : null;
        if (ip && ipaddrEl) {
          ipaddrEl.textContent = ip;
          btnCopyIp?.removeAttribute('disabled');
        } else {
          ipaddrEl && (ipaddrEl.textContent = '—');
          btnCopyIp?.setAttribute('disabled', 'true');
        }
      } catch (e) {
        console.error('Failed to load IP:', e);
        ipaddrEl && (ipaddrEl.textContent = '—');
        btnCopyIp?.setAttribute('disabled', 'true');
        
        // Show specific error for network issues
        if (e.name === 'AbortError') {
          console.warn('IP fetch timed out');
        } else if (!navigator.onLine) {
          console.warn('Offline, cannot fetch IP');
        }
      }
    }

    function copyIpToClipboard() {
      const ip = ipaddrEl?.textContent?.trim();
      if (!ip || ip === '—') return;
      const done = () => {
        // Provide quick feedback via status line
        const prev = status?.textContent;
        setStatus('IP copied');
        setTimeout(() => prev && setStatus(prev), 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ip).then(done).catch(() => {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = ip; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch {}
          document.body.removeChild(ta); done();
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = ip; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta); done();
      }
    }

    let testStartTs = null;

    function startTest() {
      if (running) return;
      running = true;
      setStatus('Starting…');
      result.hidden = true;
      hideProgress();
      testStartTs = null;
      chrome.runtime.sendMessage({ type: 'START_TEST' }, (resp) => {
        if (chrome.runtime.lastError) {
          setStatus('Error starting test');
          running = false;
          return;
        }
        if (!resp?.ok) {
          setStatus(resp?.reason === 'already-running' ? 'Test already running' : 'Failed to start test');
          running = false;
          return;
        }
        setStatus('Measuring…');
      });
    }

    btn?.addEventListener('click', startTest);

    function fmtTs(ts) {
      try {
        return new Date(ts).toLocaleString();
      } catch {
        return '' + ts;
      }
    }

    function renderHistory(items) {
      if (!historyList) return;
      historyList.innerHTML = '';
      if (!Array.isArray(items) || items.length === 0) {
        const li = document.createElement('li');
        li.className = 'muted';
        li.textContent = 'No recent results';
        historyList.appendChild(li);
        return;
      }
      for (const it of items) {
        const li = document.createElement('li');
        const left = document.createElement('span');
        const right = document.createElement('span');
        
        // Build metrics string
        const parts = [];
        if (it.download != null) parts.push(`↓${it.download.toFixed(1)}`);
        if (it.upload != null) parts.push(`↑${it.upload.toFixed(1)}`);
        if (it.latency != null) parts.push(`${it.latency.toFixed(0)}ms`);
        
        left.textContent = parts.length > 0 ? parts.join(' • ') : '—';
        right.className = 'muted';
        right.textContent = fmtTs(it.ts);
        li.appendChild(left);
        li.appendChild(right);
        historyList.appendChild(li);
      }
    }

    function loadHistory() {
      chrome.storage.local.get(['results'], (data) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          // Show error in history list
          if (historyList) {
            historyList.innerHTML = '<li class="muted" style="color: red;">Error loading history</li>';
          }
          return;
        }
        
        // Validate and sanitize stored data
        let results = [];
        try {
          if (Array.isArray(data?.results)) {
            results = data.results.filter(item => 
              item && 
              typeof item === 'object' &&
              typeof item.download === 'number' &&
              Number.isFinite(item.download)
            );
            
            // If we filtered out bad data, update storage
            if (results.length !== data.results.length) {
              console.warn('Cleaned up corrupted history data');
              chrome.storage.local.set({ results }, () => {
                if (chrome.runtime.lastError) {
                  console.error('Failed to update storage:', chrome.runtime.lastError);
                }
              });
            }
          }
        } catch (e) {
          console.error('Invalid history data:', e);
          results = [];
          // Reset corrupted storage
          chrome.storage.local.set({ results: [] });
        }
        
        renderHistory(results);
      });
    }

    btnClear?.addEventListener('click', () => {
      chrome.storage.local.set({ results: [] }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to clear history:', chrome.runtime.lastError);
          setStatus('Error clearing history');
          return;
        }
        loadHistory();
      });
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (!message || !message.type) return;
      switch (message.type) {
        case 'FAST_SPEED_STATUS':
          setStatus(message.status === 'starting' ? 'Starting…' : 'Measuring…');
          break;
        case 'FAST_SPEED_UPDATE':
          renderUpdate({
            download: message.download,
            upload: message.upload,
            latency: message.latency,
            jitter: message.jitter
          });
          if (message.progress != null) {
            // Initialize start timestamp from first progress event
            if (testStartTs == null && typeof message.ts === 'number') {
              testStartTs = message.ts;
            }
            let etaMs;
            if (typeof message.ts === 'number' && testStartTs != null && message.progress > 0) {
              const elapsed = Math.max(0, message.ts - testStartTs);
              etaMs = Math.max(0, Math.round(elapsed * (100 - message.progress) / Math.max(message.progress, 0.0001)));
            }
            updateProgress(message.progress, message.phase, etaMs);
          }
          break;
        case 'FAST_SPEED_DONE':
          running = false;
          hideProgress();
          testStartTs = null;
          if (message.ok === false) {
            // Display user-friendly error message
            const errorMsg = message.userMessage || message.reason || 'Test failed';
            setStatus(errorMsg);
            
            // Log technical details for debugging
            console.error('Test failed:', {
              reason: message.reason,
              userMessage: message.userMessage
            });
          } else {
            setStatus('Done');
            renderUpdate({
              download: message.download,
              upload: message.upload,
              latency: message.latency,
              jitter: message.jitter
            });
          }
          // Refresh history to include the latest result
          loadHistory();
          break;
      }
    });

    // Restore last result from storage (to show after popup re-opens)
    function restoreLastResult() {
      chrome.runtime.sendMessage({ type: 'GET_TEST_STATE' }, (resp) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get test state:', chrome.runtime.lastError);
          // Extension context might be invalidated, suggest reload
          if (chrome.runtime.lastError.message?.includes('context')) {
            setStatus('Extension error. Please reload the page.');
          }
          return;
        }
        
        if (!resp) {
          console.warn('No response from background script');
          return;
        }
        
        if (resp.running) {
          // Test is currently running
          setStatus('Measuring…');
          running = true;
          return;
        }
        
        if (resp.lastResult) {
          // Validate result data
          try {
            if (typeof resp.lastResult.download === 'number' && 
                Number.isFinite(resp.lastResult.download)) {
              renderUpdate({
                download: resp.lastResult.download,
                upload: resp.lastResult.upload,
                latency: resp.lastResult.latency,
                jitter: resp.lastResult.jitter
              });
              setStatus('Done');
            }
          } catch (e) {
            console.error('Invalid last result data:', e);
          }
        }
      });
    }

    // Initial load when popup opens
    loadHistory();
    restoreLastResult();
    loadClientIp();
    btnCopyIp?.addEventListener('click', copyIpToClipboard);
    
    // Network status monitoring
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      setStatus('Connection restored');
      // Optionally reload IP address
      loadClientIp();
    });
    
    window.addEventListener('offline', () => {
      console.warn('Network connection lost');
      setStatus('No internet connection');
      if (running) {
        running = false;
        hideProgress();
      }
    });
    
    // Check initial network status
    if (!navigator.onLine) {
      setStatus('No internet connection');
      btn?.setAttribute('disabled', 'true');
    }
  });
})();
