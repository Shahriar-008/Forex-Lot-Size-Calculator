document.addEventListener('DOMContentLoaded', function() {
  // Load last calculated lot sizes and input values from storage
  chrome.storage.local.get(["standardLot", "miniLot", "accountBalance", "riskType", "riskValue", "stopLoss"], function(result) {
    if (result.standardLot) {
      document.getElementById("standardLot").textContent = result.standardLot;
    }
    if (result.miniLot) {
      document.getElementById("miniLot").textContent = result.miniLot;
    }
    if (result.accountBalance) {
      document.getElementById("accountBalance").value = result.accountBalance;
    }
    if (result.riskType) {
      document.getElementById("riskType").value = result.riskType;
    }
    if (result.riskValue) {
      document.getElementById("riskValue").value = result.riskValue;
    }
    if (result.stopLoss) {
      document.getElementById("stopLoss").value = result.stopLoss;
    }
  });

  // Persist input fields on change
  document.getElementById("accountBalance").addEventListener("input", function(e) {
    chrome.storage.local.set({ accountBalance: e.target.value });
  });
  document.getElementById("riskType").addEventListener("change", function(e) {
    chrome.storage.local.set({ riskType: e.target.value });
  });
  document.getElementById("riskValue").addEventListener("input", function(e) {
    chrome.storage.local.set({ riskValue: e.target.value });
  });
  document.getElementById("stopLoss").addEventListener("input", function(e) {
    chrome.storage.local.set({ stopLoss: e.target.value });
  });

  // Fetch data from TradingView Position Size tool via content script
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {type: 'GET_TV_POSITION_DATA'},
      function(response) {
        console.log('TV Data:', response);
        if (response) {
          const ab = document.getElementById("accountBalance");
          const rv = document.getElementById("riskValue");
          const sl = document.getElementById("stopLoss");
          let updateObj = {};
          if (response.accountSize && response.accountSize !== ab.value) {
            ab.value = response.accountSize;
            updateObj.accountBalance = response.accountSize;
          }
          if (response.riskPercent && response.riskPercent !== rv.value) {
            rv.value = response.riskPercent;
            updateObj.riskValue = response.riskPercent;
          }
          if (response.stopTicks && response.stopTicks !== sl.value) {
            sl.value = response.stopTicks;
            updateObj.stopLoss = response.stopTicks;
          }
          if (Object.keys(updateObj).length > 0) {
            chrome.storage.local.set(updateObj);
          }
        } else {
          console.warn('No data received from content script.');
        }
      }
    );
  });

  // Event listener for the Calculate button (unchanged)
  document.getElementById("calculateBtn").addEventListener("click", function() {
    const accountBalance = parseFloat(document.getElementById("accountBalance").value);
    const riskType = document.getElementById("riskType").value;
    const riskValue = parseFloat(document.getElementById("riskValue").value);
    const stopLoss = parseFloat(document.getElementById("stopLoss").value);

    if (isNaN(accountBalance) || isNaN(riskValue) || isNaN(stopLoss) || accountBalance <= 0 || stopLoss <= 0) {
      alert("Please enter valid numbers for all fields.");
      return;
    }

    // Calculate the risk amount in your account currency.
    let riskAmount = 0;
    if (riskType === "percent") {
      riskAmount = accountBalance * (riskValue / 100);
    } else {
      riskAmount = riskValue;
    }

    // Standard lot pip value: ~$10 per pip.
    // Mini lot pip value: ~$1 per pip.
    const standardLotSize = riskAmount / (stopLoss * 10);
    const miniLotSize = riskAmount / (stopLoss * 1);

    const standardLotText = standardLotSize.toFixed(4) + " lots";
    const miniLotText = miniLotSize.toFixed(4) + " lots";
    document.getElementById("standardLot").textContent = standardLotText;
    document.getElementById("miniLot").textContent = miniLotText;

    // Save the last calculated lot sizes and input values
    chrome.storage.local.set({
      standardLot: standardLotText,
      miniLot: miniLotText,
      accountBalance: accountBalance,
      riskType: riskType,
      riskValue: riskValue,
      stopLoss: stopLoss
    });
  });

  // Copy button logic (unchanged)
  function handleCopy(copyButtonId, elementId) {
    const button = document.getElementById(copyButtonId);
    const textContent = document.getElementById(elementId).textContent;
    const valueToCopy = textContent.replace(" lots", "").trim();
    navigator.clipboard.writeText(valueToCopy)
      .then(function() {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(function(){
          button.textContent = originalText;
        }, 1500);
      })
      .catch(function(err) {
        console.error("Could not copy text: ", err);
      });
  }
  document.getElementById("copyStandard").addEventListener("click", function() {
    handleCopy("copyStandard", "standardLot");
  });
  document.getElementById("copyMini").addEventListener("click", function() {
    handleCopy("copyMini", "miniLot");
  });
});
