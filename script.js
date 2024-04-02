function homePrinter() {
    sendGCodeCommand('G28');
}

function emergencyStop() {
    sendGCodeCommand('M112');
}

function preheatPLA() {
    sendGCodeCommand('M140 S60');
    sendGCodeCommand('M104 S210');
}

function preheatABS() {
    sendGCodeCommand('M140 S90');
    sendGCodeCommand('M104 S240');
}

function coolDown() {
    sendGCodeCommand('M140 S0');
    sendGCodeCommand('M104 S0');
}

function sendCommand(event) {
    event.preventDefault();
    var command = document.getElementById('command').value;

    if (command.toLowerCase() === 'clear') {
        document.getElementById('response').innerText = '';
        document.getElementById('command').value = '';
        return;
    }else {
        document.getElementById('response').value = 'command sent: ' + command;
        sendGCodeCommand(command);
    }
}

function getTemperatures(includeMonitors) {
    const FLUIDD_SERVER_URL = "http://192.168.0.71";
    const TEMPERATURE_STORE_ENDPOINT = "/server/temperature_store";

    const url = FLUIDD_SERVER_URL + TEMPERATURE_STORE_ENDPOINT;
    const params = { include_monitors: includeMonitors };

    fetch(url, { method: 'GET', params: params })
        .then(response => response.json())
        .then(data => {
            const recentTemperatures = {};
            for (const sensorName in data.result) {
                const sensorData = data.result[sensorName];
                const temperatures = sensorData.temperatures;
                if (temperatures && temperatures.length > 0) {
                    const recentTemperature = temperatures[temperatures.length - 1];
                    recentTemperatures[sensorName] = recentTemperature;
                }
            }

            // Update Extruder temperature
            const extruderTemp = recentTemperatures['extruder'] || '0.00';
            document.getElementById('extruderTemp').textContent = extruderTemp + '°C';

            // Update Heater Bed temperature
            const heaterBedTemp = recentTemperatures['heater_bed'] || '0.00';
            document.getElementById('heaterBedTemp').textContent = heaterBedTemp + '°C';
        })
        .catch(error => console.error('Error:', error));
}




function sendGCodeCommand(gCodeCommand) {
    const url = `http://192.168.0.71:7125/printer/gcode/script?script=${encodeURIComponent(gCodeCommand)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(responseBody => {

            displayResponse(gCodeCommand, responseBody);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

document.getElementById('command').addEventListener('keydown', function(event) {
    // Check if the key pressed is Enter (key code 13)
    if (event.keyCode === 13) {
        // Prevent the default behavior of the Enter key (form submission)
        event.preventDefault();
        // Get the value of the input element
        const gCodeCommand = this.value.trim();
        // Check if the command is not empty
        if (gCodeCommand) {
            // Call the sendGCodeCommand function with the entered command
            sendGCodeCommand(gCodeCommand);
            // Clear the input field
            this.value = '';
        }
    }
});


function displayResponse(command, responseData) {
    const responseElement = document.getElementById('response');
    // Construct the string representation of the command and response
    const message = `Command sent: ${command}\nResponse: ${JSON.stringify(responseData)}`;
    // Append the message to the response element
    responseElement.innerText += message + '\n';
    responseElement.scrollTop = responseElement.scrollHeight;

}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch temperatures when the page loads
    getTemperatures();
    // Update temperatures every 0.5 seconds
    setInterval(getTemperatures, 500);
});




function uploadFile(file) {
    const url = 'http://192.168.0.71:7125/server/files/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('root', 'gcodes'); // Specify the root location for uploading

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded:', data);
            //alert('File uploaded successfully.');
            displayResponse('File uploaded', data);
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.querySelector('.upload-button');
    const printButton = document.querySelector('.print-button');
    const cancelButton = document.querySelector('.cancel-button');
    const clearButton = document.querySelector('.clear-button');
    const fileInput = document.getElementById('fileInput');

    uploadButton.addEventListener('click', function() {
        uploadFile(fileInput.files[0]);
    });

    printButton.addEventListener('click', function() {
        const fileName = fileInput.files[0].name;
        printFile(fileName);
    });

    cancelButton.addEventListener('click', function() {
        cancelPrint();
    });

    clearButton.addEventListener('click', function() {
        // Clear the selected file
        fileInput.value = '';
    });
});

function printFile(fileName) {
    const url = 'http://192.168.0.71:7125/printer/print/start';
    const data = {
        filename: fileName
    };

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Print response:', data);
            displayResponse('Print Status', data);
        })
        .catch(error => {
            console.error('Error printing file:', error);
            alert('Error printing file. Please try again.');
        });
}

function cancelPrint() {
    const url = 'http://192.168.0.71:7125/printer/print/cancel';

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Cancel print response:', data);
            displayResponse('Cancel Print Status', data);
        })
        .catch(error => {
            console.error('Error canceling print:', error);
            alert('Error canceling print. Please try again.');
        });
}

// Function to fetch printer information
function fetchPrinterInfo() {
    const url = 'http://192.168.0.71:7125/printer/info';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extract relevant information from the response
            const printerStatus = data.result.state_message;
            const printerName = data.result.hostname;

            // Update printer status and name
            updatePrinterStatus(printerStatus);
            updatePrinterName(printerName);
        })
        .catch(error => {
            console.error('Error fetching printer information:', error);
        });
}

// Call fetchPrinterInfo function to fetch and update printer information
fetchPrinterInfo();

// Update printer status
function updatePrinterStatus(status) {
    const printerStatusElement = document.getElementById('printerStatus');
    printerStatusElement.textContent = status;
}

// Update printer name
function updatePrinterName(name) {
    const printerNameElement = document.getElementById('printerName');
    printerNameElement.textContent = name;
}

// Function to format the GCode help response
function formatGCodeHelpResponse(response) {
    const gcodeHelp = response.result;
    let formattedResponse = 'GCode Help:\n';

    for (const [command, description] of Object.entries(gcodeHelp)) {
        formattedResponse += `Command: ${command}\nDescription: ${description}\n\n`;
    }

    return formattedResponse;
}

function setNewExtruderTemp() {
    const newTempInput = document.getElementById('newExtruderTemp');
    const newTempValue = newTempInput.value;

    sendGCodeCommand('M104 S' + newTempValue)
    displayResponse('New extruder temperature set to:', newTempValue);

    // Optionally, you can update the displayed temperature value
    document.getElementById('extruderTemp').textContent = newTempValue;

    // Clear the input field after setting the temperature
    newTempInput.value = '';
}

function setNewHeaterBedTemp() {
    const newTempInput = document.getElementById('newHeaterBedTemp');
    const newTempValue = newTempInput.value;

    sendGCodeCommand('M140 S' + newTempValue)

    displayResponse('New heater bed temperature set to:', newTempValue);

    // Optionally, you can update the displayed temperature value
    document.getElementById('heaterBedTemp').textContent = newTempValue;

    // Clear the input field after setting the temperature
    newTempInput.value = '';
}
