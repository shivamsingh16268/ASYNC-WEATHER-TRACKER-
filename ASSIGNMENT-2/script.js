const logOutput = document.getElementById('logOutput');
const weatherDisplay = document.getElementById('weatherDisplay');


function addLog(message) {
    const p = document.createElement('p');
    p.textContent = `> ${message}`;
    logOutput.appendChild(p);
    console.log(message);
}

async function getWeather(cityName) {
    const city = cityName || document.getElementById('cityInput').value;
    logOutput.innerHTML = ""; 

    
    addLog("Sync Start"); 

    try {
        addLog("[ASYNC] start fetching");
        
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("City not found");

        const { latitude, longitude, name, country_code } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await weatherRes.json();
        
        addLog("Promise.then (Microtask)");
        setTimeout(() => addLog("setTimeout (Macrotask)"), 0);
        
        addLog("[ASYNC] Data received");
        
        weatherDisplay.innerHTML = `
            <p><strong>City:</strong> ${name}, ${country_code}</p>
            <p><strong>Temp:</strong> ${data.current_weather.temperature}°C</p>
            <p><strong>Wind:</strong> ${data.current_weather.windspeed} km/h</p>
        `;

        saveHistory(name);

    } catch (error) {
        addLog(`Error: ${error.message}`);
        weatherDisplay.innerHTML = `<p style="color:red">City not found</p>`;
    }

    addLog("Sync End");
} 

function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherCities')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('weatherCities', JSON.stringify(history));
    }
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('weatherCities')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = history.map(c => `<span onclick="getWeather('${c}')">${c}</span>`).join('');
}

window.onload = renderHistory;