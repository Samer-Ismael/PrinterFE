function homePrinter() {
    sendRequest('home');
}

function emergencyStop() {
    sendRequest('emergency_stop');
}

function preheatPLA() {
    sendRequest('preheat_pla');
}

function preheatABS() {
    sendRequest('preheat_abs');
}

function sendCommand(event) {
    event.preventDefault();
    var command = document.getElementById('command').value;
    sendRequest(command);
}

function getTemperatures() {
    fetch('your_endpoint_url')
        .then(response => response.json())
        .then(data => {
            // Update Extruder temperature
            document.getElementById('extruderTemp').textContent = data.extruderTemp ? data.extruderTemp + '°C' : '0°C';
            // Update Heater Bed temperature
            document.getElementById('heaterBedTemp').textContent = data.heaterBedTemp ? data.heaterBedTemp + '°C' : '0°C';
        })
        .catch(error => console.error('Error:', error));
}

function sendRequest(command) {
    fetch('your_endpoint_url', {
        method: 'POST',
        body: JSON.stringify({ command: command }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (command === 'get_temperatures') {
                displayTemperatures(data);
            } else {
                displayResponse(data);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayResponse(data) {
    document.getElementById('response').innerText = data.response;
}

function displayTemperatures(data) {
    var temperatureResponse = '';
    temperatureResponse += 'Bed Temperature: ' + data.bed + '°C<br>';
    temperatureResponse += 'Nozzle Temperature: ' + data.nozzle + '°C';
    document.getElementById('temperatureResponse').innerHTML = temperatureResponse;
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch temperatures when the page loads
    getTemperatures();
    // Update temperatures every 0.5 seconds
    setInterval(getTemperatures, 500);
});
