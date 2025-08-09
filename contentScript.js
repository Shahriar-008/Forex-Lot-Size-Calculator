
function getPositionData() {
  // Try long position fields first
  let prefix = 'Risk/Rewardlong';
  let type = 'long';
  if (!document.querySelector(`input[data-property-id="${prefix}AccountSize"]`)) {
    // If not found, try short position fields
    prefix = 'Risk/Rewardshort';
    type = 'short';
  }
  return {
    type,
    accountSize: document.querySelector(`input[data-property-id="${prefix}AccountSize"]`)?.value,
    lotSize: document.querySelector(`input[data-property-id="${prefix}LotSize"]`)?.value,
    riskPercent: document.querySelector(`input[data-property-id="${prefix}Risk"]`)?.value,
    entryPrice: document.querySelector(`input[data-property-id="${prefix}EntryPrice"]`)?.value,
    profitTicks: document.querySelector(`input[data-property-id="${prefix}ProfitLevelTicks"]`)?.value,
    profitPrice: document.querySelector(`input[data-property-id="${prefix}ProfitLevelPrice"]`)?.value,
    stopTicks: document.querySelector(`input[data-property-id="${prefix}StopLevelTicks"]`)?.value,
    stopPrice: document.querySelector(`input[data-property-id="${prefix}StopLevelPrice"]`)?.value,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TV_POSITION_DATA') {
    sendResponse(getPositionData());
  }
});

(function () {
  // Helper to inject or update lot size display in the dialog
  function injectLotSizeDisplay(dialog, standardLot, miniLot) {
    // Remove any previous injected row
    let oldRow = dialog.querySelector('.tv-lotsize-extension-row');
    if (oldRow) oldRow.remove();

    // Find the last input row (TradingView uses table-like rows for each input)
    let lastRow = null;
    const rows = dialog.querySelectorAll('div[class*="inputRow"], div[class*="row"], div[class*="input-row"]');
    if (rows.length > 0) {
      lastRow = rows[rows.length - 1];
    }

    // Create a new row styled like TradingView, with Calculate button and text fields (always 4 decimals)
    const lotRow = document.createElement('div');
    lotRow.className = 'tv-lotsize-extension-row';
    lotRow.style.display = 'flex';
    lotRow.style.alignItems = 'center';
    lotRow.style.margin = '8px 0 0 0';
    lotRow.innerHTML = `
      <button id="tv-lotsize-calc-btn" style="margin-right:12px;padding:5px 18px;font-size:14px;background:#2962ff;color:#fff;border:none;border-radius:4px;box-shadow:0 1px 2px #0002;cursor:pointer;transition:background 0.2s;">Calculate</button>
      <div style="display:flex;align-items:center;gap:16px;width:100%;">
        <div style="display:flex;flex-direction:column;align-items:flex-start;flex:1;">
          <span style="font-size:12px;color:#bdbdbd;font-weight:500;margin-bottom:2px;">Standard Lots</span>
          <input id="tv-lotsize-standard" type="text" value="${standardLot}" readonly
            style="width:100px;height:32px;padding:0 10px;font-size:15px;color:#ffb300;font-weight:600;background:#181a20;border:1px solid #393c43;border-radius:6px;text-align:right;outline:none;box-shadow:none;transition:border 0.2s;letter-spacing:0.5px;" />
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;flex:1;">
          <span style="font-size:12px;color:#bdbdbd;font-weight:500;margin-bottom:2px;">Mini Lots</span>
          <input id="tv-lotsize-mini" type="text" value="${miniLot}" readonly
            style="width:100px;height:32px;padding:0 10px;font-size:15px;color:#2196f3;font-weight:600;background:#181a20;border:1px solid #393c43;border-radius:6px;text-align:right;outline:none;box-shadow:none;transition:border 0.2s;letter-spacing:0.5px;" />
        </div>
      </div>
    `;

    if (lastRow && lastRow.parentNode) {
      lastRow.parentNode.insertBefore(lotRow, lastRow.nextSibling);
      console.log('[LotSizeExt] Injected as new row after last input row', lastRow);
    } else {
      dialog.appendChild(lotRow);
      console.log('[LotSizeExt] Injected at dialog end', dialog);
    }
    console.log('[LotSizeExt] Updated lot size display:', standardLot, miniLot);
  }

  // Main calculation logic
  function calculateAndDisplay(dialog, prefix) {
    const accountSizeInput = dialog.querySelector(`input[data-property-id="${prefix}AccountSize"]`);
    const riskInput = dialog.querySelector(`input[data-property-id="${prefix}Risk"]`);
    const stopTicksInput = dialog.querySelector(`input[data-property-id="${prefix}StopLevelTicks"]`);
    const riskTypeSelect = dialog.querySelector(`select[data-property-id="${prefix}RiskType"]`);
    if (!accountSizeInput || !riskInput || !stopTicksInput) return;

    // Only update on Calculate button click
    injectLotSizeDisplay(dialog, '0.00', '0.00');
    const btn = dialog.querySelector('#tv-lotsize-calc-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      const accountBalance = accountSizeInput.value;
      let riskType = 'percent';
      if (riskTypeSelect) {
        riskType = riskTypeSelect.value === 'percent' || riskTypeSelect.value === '%' ? 'percent' : 'fixed';
      } else if (riskInput.nextElementSibling && riskInput.nextElementSibling.tagName === 'SELECT') {
        riskType = riskInput.nextElementSibling.value === '%' ? 'percent' : 'fixed';
      }
      const riskValue = riskInput.value;
      // Convert ticks to pips (1 pip = 10 ticks for Forex)
      let stopLossTicks = parseFloat(stopTicksInput.value) || 0;
      let stopLossPips = stopLossTicks / 10;

      chrome.runtime.sendMessage({
        type: 'CALCULATE_LOT_SIZE',
        payload: {
          accountBalance,
          riskType,
          riskValue,
          stopLoss: stopLossPips
        }
      }, function(response) {
        if (response && response.standardLot && response.miniLot) {
          dialog.querySelector('#tv-lotsize-standard').value = Number(response.standardLot).toFixed(4);
          dialog.querySelector('#tv-lotsize-mini').value = Number(response.miniLot).toFixed(4);
          console.log('[LotSizeExt] Calculated lots (from background):', response.standardLot, response.miniLot);
        } else {
          dialog.querySelector('#tv-lotsize-standard').value = '0.0000';
          dialog.querySelector('#tv-lotsize-mini').value = '0.0000';
        }
      });
    });
  }

  // Observe for both Long and Short Position dialogs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          ['Long Position', 'Short Position'].forEach((posType) => {
            let dialog = null;
            if (node.matches(`[data-dialog-name="${posType}"]`)) {
              dialog = node;
            } else {
              dialog = node.querySelector(`[data-dialog-name="${posType}"]`);
            }
            if (dialog && !dialog.getAttribute('data-lotsize-integrated')) {
              dialog.setAttribute('data-lotsize-integrated', 'true');
              const prefix = posType === 'Long Position' ? 'Risk/Rewardlong' : 'Risk/Rewardshort';
              // Initial injection and setup
              console.log(`[LotSizeExt] Detected ${posType} dialog`, dialog);
              calculateAndDisplay(dialog, prefix);
            }
          });
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
  