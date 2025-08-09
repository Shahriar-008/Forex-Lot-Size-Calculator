// background.js
// Handles lot size calculation for both popup and injected code

function calculateLotSizes({ accountBalance, riskType, riskValue, stopLoss }) {
  accountBalance = parseFloat(accountBalance) || 0;
  riskValue = parseFloat(riskValue) || 0;
  stopLoss = parseFloat(stopLoss) || 0;
  if (isNaN(accountBalance) || isNaN(riskValue) || isNaN(stopLoss) || accountBalance <= 0 || stopLoss <= 0) {
    return { standardLot: '0.0000', miniLot: '0.0000' };
  }
  let riskAmount = 0;
  if (riskType === 'percent' || riskType === '%' || riskType === 'Percentage (%)') {
    riskAmount = accountBalance * (riskValue / 100);
  } else {
    riskAmount = riskValue;
  }
  const standardLot = riskAmount / (stopLoss * 10);
  const miniLot = riskAmount / (stopLoss * 1);
  return {
    standardLot: standardLot.toFixed(4),
    miniLot: miniLot.toFixed(4)
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CALCULATE_LOT_SIZE') {
    const result = calculateLotSizes(request.payload);
    sendResponse(result);
  }
});
