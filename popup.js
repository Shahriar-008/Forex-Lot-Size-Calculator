document.addEventListener('DOMContentLoaded', function() {
  // Retrieve saved settings when the popup loads
  chrome.storage.sync.get(["accountBalance", "riskType", "riskValue", "stopLoss"], function(result) {
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
  
  // Event listener for the Calculate button
  document.getElementById("calculateBtn").addEventListener("click", function() {
    // Retrieve values from the input fields
    const accountBalance = parseFloat(document.getElementById("accountBalance").value);
    const riskType = document.getElementById("riskType").value;
    const riskValue = parseFloat(document.getElementById("riskValue").value);
    const stopLoss = parseFloat(document.getElementById("stopLoss").value);

    // Validate inputs
    if (isNaN(accountBalance) || isNaN(riskValue) || isNaN(stopLoss) || accountBalance <= 0 || stopLoss <= 0) {
      alert("Please enter valid numbers for all fields.");
      return;
    }

    // Save inputs in storage so they persist between sessions
    chrome.storage.sync.set({
      accountBalance: document.getElementById("accountBalance").value,
      riskType: riskType,
      riskValue: document.getElementById("riskValue").value,
      stopLoss: document.getElementById("stopLoss").value
    }, function() {
      console.log("Input values saved.");
    });
    
    // Calculate the risk amount in your account currency.
    let riskAmount = 0;
    if (riskType === "percent") {
      riskAmount = accountBalance * (riskValue / 100);
    } else {
      riskAmount = riskValue;
    }
    
    // Calculation assumptions:
    // Standard lot pip value: ~$10 per pip.
    // Mini lot pip value: ~$1 per pip.
    // Lot size calculation: risk amount / (stop loss in pips * pip value)
    const standardLotSize = riskAmount / (stopLoss * 10);
    const miniLotSize = riskAmount / (stopLoss * 1);

    // Display the results rounded to three decimal places.
    document.getElementById("standardLot").textContent = standardLotSize.toFixed(4) + " lots";
    document.getElementById("miniLot").textContent = miniLotSize.toFixed(4) + " lots";
  });

  // Helper function to handle copy feedback without using alert
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

  // Copy button for Standard Lot Size
  document.getElementById("copyStandard").addEventListener("click", function() {
    handleCopy("copyStandard", "standardLot");
  });

  // Copy button for Mini Lot Size
  document.getElementById("copyMini").addEventListener("click", function() {
    handleCopy("copyMini", "miniLot");
  });
});
