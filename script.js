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

document.addEventListener('DOMContentLoaded', function() {
    // Fetch temperatures when the page loads
    getTemperatures();
    // Update temperatures every 0.5 seconds
    setInterval(getTemperatures, 500);

    // Fetch and display files when the page loads
    getFiles();
});

function getFiles() {
    fetch('your_files_endpoint_url')
        .then(response => response.json())
        .then(data => {
            displayFiles(data);
        })
        .catch(error => console.error('Error:', error));
}

function displayFiles(files) {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = ''; // Clear previous list

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;

        // Add click event listener to list item
        listItem.addEventListener('click', function() {
            // Show the print button
            document.getElementById('printFileButton').style.display = 'inline';
            // Store the selected file name as a data attribute
            document.getElementById('printFileButton').setAttribute('data-file-name', file.name);
        });

        fileListElement.appendChild(listItem);
    });
}

function printSelectedFile() {
    // Get the selected file name from the data attribute
    const fileName = document.getElementById('printFileButton').getAttribute('data-file-name');
    if (fileName) {
        // Send request to API to print the selected file
        sendPrintRequest(fileName);
    }
}

function sendPrintRequest(fileName) {
    // Send request to API to print the file
    fetch('your_print_endpoint_url', {
        method: 'POST',
        body: JSON.stringify({ fileName: fileName }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Handle response from the API
            console.log('File printing request sent:', data);
            // Optionally, display a message to the user indicating that the file is being printed
        })
        .catch(error => console.error('Error:', error));
}
