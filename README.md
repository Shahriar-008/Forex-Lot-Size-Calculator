# Forex-Lot-Size-Calculator

A simple Chrome extension that helps forex traders calculate their lot sizes quickly and accurately while using TradingView. This tool implements effective risk management by allowing you to compute the correct position size based on your account balance, risk settings, and stop loss in pips.

## Features

- **Instant Calculation:** Determine your lot size (both standard and mini lot sizes) with just a few inputs.
- **Risk Management:** Choose between a percentage risk or a fixed amount to suit your trading plan.
- **Dual Lot Size Display:** View calculations for:
  - **Standard Lot (100,000 units)**
  - **Mini Lot (10,000 units)**
- **Clipboard Copy:** Easily copy the calculated lot sizes to your clipboard with a single click.
- **Persistent Inputs:** Your account balance, risk type, risk value, and stop loss are saved automatically for quick recalculations.

## Installation

1. **Clone or Download** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing the extension files.
5. The extension will now appear in your list of Chrome extensions.

## Usage

1. **Open the Extension:** Click the extension icon in Chrome to open the popup.
2. **Enter Your Data:**
   - **Account Balance:** Your current account balance.
   - **Risk Type:** Choose either *Percentage (%)* or *Fixed Amount*.
   - **Risk Value:** Enter your risk percentage or the exact dollar amount you are willing to risk.
   - **Stop Loss (in pips):** Specify your stop loss in pips.
3. **Calculate:** Click the **Calculate** button.  
   The extension computes and displays:
   - **Standard Lot Size (100,000 units)**
   - **Mini Lot Size (10,000 units)**
4. **Copy Results:** Use the **Copy** buttons next to each result to copy the numerical values (displayed with 4 decimal places) directly to your clipboard.
5. Your inputs are saved automatically so you don’t have to re-enter them each time you use the extension.

## How It Works

The extension uses a fixed pip value assumption of $10 per pip for standard lot calculations. The formulas used are:

- **Standard Lot Size Calculation:**  
  \[
  \text{Standard Lot Size} = \frac{\text{Risk Amount}}{\text{Stop Loss} \times \text{Pip Value} \times 100000}
  \]
- **Mini Lot Size Calculation:**  
  \[
  \text{Mini Lot Size} = \frac{\text{Risk Amount}}{\text{Stop Loss} \times \text{Pip Value} \times 10000}
  \]

*Note:* Adjust the pip value if you’re trading pairs with different conditions or if your broker uses a different value.

## Customization

- **Decimal Precision:**  
  The lot sizes are displayed with 4 decimal digits. If you need a different precision, update the `.toFixed(4)` calls in `popup.js`.
- **Pip Value Adjustments:**  
  Currently set to a fixed value of $10 per pip, modify this in `popup.js` if required for your trading pair or account currency.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! If you have suggestions, bug fixes, or enhancements, feel free to open an issue or submit a pull request.

---

Happy Trading!
