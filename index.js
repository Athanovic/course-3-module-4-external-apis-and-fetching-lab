// index.js

// Base API URL
const weatherApi = "https://api.weather.gov/alerts/active?area=";

// Get references to DOM elements
const stateInput = document.getElementById("state-input");
const getAlertsBtn = document.getElementById("get-alerts");
const alertsDiv = document.getElementById("alerts");
const errorDiv = document.getElementById("error-message");

// Function to fetch weather alerts for a given state
async function fetchWeatherAlerts(state) {
    try {
        if (!state) {
            throw new Error("Please enter a state abbreviation.");
        }

        // Fetch data from API
        const response = await fetch(`${weatherApi}${state}`);

        // Check if response is successful
        if (!response.ok) {
            throw new Error("Failed to fetch data. Please check your state code.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error; // Pass the error to be handled
    }
}

// Function to display weather alerts on the page
function displayAlerts(state, data) {
    // Clear previous alerts and errors
    alertsDiv.innerHTML = "";
    errorDiv.style.display = "none";
    errorDiv.innerText = "";

    const alertCount = data.features.length;

    // Display summary
    const summary = document.createElement("h3");
    summary.textContent = `Current watches, warnings, and advisories for ${state}: ${alertCount}`;
    alertsDiv.appendChild(summary);

    // Display individual alert headlines
    if (alertCount > 0) {
        const list = document.createElement("ul");
        data.features.forEach(alert => {
            const item = document.createElement("li");
            item.textContent = alert.properties.headline;
            list.appendChild(item);
        });
        alertsDiv.appendChild(list);
    } else {
        const noAlerts = document.createElement("p");
        noAlerts.textContent = "No alerts at this time.";
        alertsDiv.appendChild(noAlerts);
    }

    // Clear input field
    stateInput.value = "";
}

// Function to show errors
function showError(message) {
    errorDiv.style.display = "block";
    errorDiv.innerText = message;
}

// Event listener for the button click
getAlertsBtn.addEventListener("click", async () => {
    const state = stateInput.value.toUpperCase(); // Convert input to uppercase

    try {
        const data = await fetchWeatherAlerts(state);
        displayAlerts(state, data);
    } catch (error) {
        showError(error.message);
    }
});
