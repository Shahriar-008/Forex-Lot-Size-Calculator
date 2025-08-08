
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
    // Create a MutationObserver to look for the Short Position dialog.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the new node is (or contains) the Short Position dialog.
            let dialog = null;
            if (node.matches('[data-dialog-name="Short Position"]')) {
              dialog = node;
            } else {
              dialog = node.querySelector('[data-dialog-name="Short Position"]');
            }
            if (dialog) {
              // We found the dialog—integrate our calculator.
              integrateCalculator(dialog);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  
    /**
     * integrateCalculator
     *
     * Attaches our Calculate button listener and uses the values from TradingView’s
     * Short Position dialog to compute lot sizes. When the user clicks the Calculate
     * button, the script reads the following:
     *
     * - Account Size: input[data-property-id="Risk/RewardshortAccountSize"]
     * - Risk: input[data-property-id="Risk/RewardshortRisk"]
     * - Entry Price: input[data-property-id="Risk/RewardshortEntryPrice"]
     * - Stop Level Price: input[data-property-id="Risk/RewardshortStopLevelPrice"]
     *
     * The output is placed into:
     * - Standard Lots: input#t_tvlotsize-standard
     * - Mini Lots: input#t_tvlotsize-mini
     *
     * You can adjust the calculation formulas as needed.
     */
    function integrateCalculator(dialog) {
      // Prevent multiple integrations on the same dialog.
      if (dialog.getAttribute('data-calculator-integrated')) return;
      dialog.setAttribute('data-calculator-integrated', 'true');
  
      // Query the input fields from the dialog.
      const accountSizeInput = dialog.querySelector('input[data-property-id="Risk/RewardshortAccountSize"]');
      const riskInput = dialog.querySelector('input[data-property-id="Risk/RewardshortRisk"]');
      const entryPriceInput = dialog.querySelector('input[data-property-id="Risk/RewardshortEntryPrice"]');
      const stopPriceInput = dialog.querySelector('input[data-property-id="Risk/RewardshortStopLevelPrice"]');
  
      // Query the output fields.
      const standardLotOutput = dialog.querySelector('input#t_tvlotsize-standard');
      const miniLotOutput = dialog.querySelector('input#t_tvlotsize-mini');
  
      // Query the Calculate button.
      const calculateButton = dialog.querySelector('button#calculate');
  
      // Ensure all required fields exist.
      if (
        !accountSizeInput ||
        !riskInput ||
        !entryPriceInput ||
        !stopPriceInput ||
        !calculateButton ||
        !standardLotOutput ||
        !miniLotOutput
      ) {
        console.log('One or more required elements were not found in the dialog.');
        return;
      }
  
      // Attach a click listener to the Calculate button.
      calculateButton.addEventListener('click', function () {
        // Parse the Account Size.
        const accountSize = parseFloat(accountSizeInput.value) || 0;
  
        // Get the risk value. If the value includes a '%' sign, convert it to an absolute amount.
        let riskRaw = riskInput.value.trim();
        let risk;
        if (riskRaw.includes('%')) {
          risk = (parseFloat(riskRaw.replace('%', '')) / 100) * accountSize;
        } else {
          risk = parseFloat(riskRaw) || 0;
        }
  
        // Parse the Entry Price and Stop Level Price.
        const entryPrice = parseFloat(entryPriceInput.value) || 0;
        const stopPrice = parseFloat(stopPriceInput.value) || 0;
  
        // Compute the price difference.
        const priceDiff = Math.abs(stopPrice - entryPrice);
        if (priceDiff === 0) {
          alert('Price difference between Stop Level and Entry Price is zero. Cannot calculate lot size.');
          return;
        }
  
        // --- Placeholder Calculation ---
        // Adjust the following math to your actual trading logic.
        // For example, here we assume:
        //   standardLot = risk / (priceDiff * factor)
        //   miniLot = standardLot / 10
        const factor = 10; // This factor is adjustable.
        const standardLot = risk / (priceDiff * factor);
        const miniLot = standardLot / 10;
  
        // Update the output fields (they are disabled but we can still set their value).
        standardLotOutput.value = standardLot.toFixed(2);
        miniLotOutput.value = miniLot.toFixed(2);
      });
    }
  })();
  