const BASE_URL = "https://api.exchangerate-api.com/v4/latest";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const swapBtn = document.getElementById("swap");
const amountInput = document.querySelector(".amount input");

// Fallback rates in case API fails
const fallbackRates = {
    USD: { INR: 83.12, EUR: 0.92, GBP: 0.79 },
    EUR: { USD: 1.09, INR: 90.45, GBP: 0.86 },
    GBP: { USD: 1.27, EUR: 1.17, INR: 105.32 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095 }
};

// Populate dropdowns with currency codes
for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

// Update exchange rate
const updateExchangeRate = async () => {
    let amount = amountInput.value;
    if (amount === "" || amount < 1) {
        amount = 1;
        amountInput.value = "1";
    }
    
    try {
        msg.innerText = "Fetching exchange rate...";
        
        // Try the primary API first
        let rate;
        try {
            const URL = `${BASE_URL}/${fromCurr.value}`;
            let response = await fetch(URL);
            
            if (!response.ok) {
                throw new Error("API request failed");
            }
            
            let data = await response.json();
            rate = data.rates[toCurr.value];
        } catch (apiError) {
            console.warn("Primary API failed, using fallback rates");
            // If API fails, use fallback rates
            if (fallbackRates[fromCurr.value] && fallbackRates[fromCurr.value][toCurr.value]) {
                rate = fallbackRates[fromCurr.value][toCurr.value];
            } else {
                rate = 1; // Default fallback
            }
        }

        let finalAmount = (amount * rate).toFixed(2);
        msg.innerHTML = `${amount} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
        
    } catch (error) {
        msg.innerHTML = "Error fetching exchange rate. Please try again later.";
        console.error("Error:", error);
    }
};

// Update flag image when currency changes
const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};

// Swap currencies
const swapCurrencies = () => {
    let temp = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = temp;
    updateFlag(fromCurr);
    updateFlag(toCurr);
    updateExchangeRate();
};

// Event listeners
btn.addEventListener("click", (evt) => {
    evt.preventDefault();
    updateExchangeRate();
});

swapBtn.addEventListener("click", (evt) => {
    evt.preventDefault();
    swapCurrencies();
});

// Initialize on page load
window.addEventListener("load", () => {
    updateExchangeRate();
});