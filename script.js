
// -------------------------------------------------------------------------------------------------------------------
// Sending G-code commands to the server using the console
function homePrinter() {
    sendGCodeCommand('G28');
}

function firmwareRestart() {
    sendGCodeCommand('FIRMWARE_RESTART');
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

// -------------------------------------------------------------------------------------------------------------------
// Getters and setters for extruder and heater bed temperatures
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
function getTemperatures(includeMonitors) {
    const TEMPERATURE_STORE_ENDPOINT = "/server/temperature_store";

    const url = FLUIDD_SERVER_URL + TEMPERATURE_STORE_ENDPOINT;
    const params = { include_monitors: includeMonitors };

    // Add the authorization header with the USER_TOKEN
    const headers = new Headers({
        'Authorization': 'Bearer ' + USER_TOKEN,
    });

    fetch(url, {
        method: 'GET',
        params: params,
        headers: headers
    })
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



// -------------------------------------------------------------------------------------------------------------------
// Send a command to the server using the "Enter" key and a send button.
function sendCommand(event) {
    event.preventDefault();
    var command = document.getElementById('command').value;

    if (command.toLowerCase() === 'clear') {
        document.getElementById('response').innerText = '';
        document.getElementById('command').value = '';

    } else {
        document.getElementById('response').value = 'command sent: ' + command;
        sendGCodeCommand(command);
    }
}

function sendGCodeCommand(gCodeCommand) {
    const url = FLUIDD_SERVER_URL + `/printer/gcode/script?script=${encodeURIComponent(gCodeCommand)}`;

    if (gCodeCommand.toLowerCase() === 'clear') {
        document.getElementById('response').innerText = '';
        document.getElementById('command').value = '';

    } else {

        displayResponse('Working...', "........");

        // Request options
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
            }
        };
        options.mode = 'cors';

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(responseBody => {
                const responseElement = JSON.parse(responseBody);
                displayResponse(gCodeCommand, responseElement.result);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


document.getElementById('command').addEventListener('keydown', function (event) {
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


// -------------------------------------------------------------------------------------------------------------------
// Display the command and response in the response element
function displayResponse(command, responseData) {
    const responseElement = document.getElementById('response');
    // Construct the string representation of the command and response
    const message = `Command sent: ${command} ----- Response: ${JSON.stringify(responseData)}`;
    // Append the message to the response element
    responseElement.innerText += message + '\n';
    responseElement.scrollTop = responseElement.scrollHeight;

    // Save the message to local storage
    const savedMessages = localStorage.getItem('savedMessages') || '';
    const updatedMessages = savedMessages + message + '\n';
    localStorage.setItem('savedMessages', updatedMessages);
}

// Call displayResponse function when the page loads to display saved messages
window.onload = function() {
    const savedMessages = localStorage.getItem('savedMessages');
    const responseElement = document.getElementById('response');
    if (savedMessages) {
        responseElement.innerText = savedMessages;
        responseElement.scrollTop = responseElement.scrollHeight;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    // Fetch temperatures when the page loads
    getTemperatures();
    // Update temperatures every 0.5 seconds
    setInterval(getTemperatures, 500);
});

// -------------------------------------------------------------------------------------------------------------------

// Function to upload a file to the server and start printing it
function uploadFile(file) {
    const url = FLUIDD_SERVER_URL + '/server/files/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('root', 'gcodes'); // Specify the root location for uploading

    displayResponse('Uploading file', file.name);

    // Request options
    const options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
        },
        body: formData
    };

    fetch(url, options)
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


function printFile(fileName) {
    const url = FLUIDD_SERVER_URL + '/printer/print/start';
    const data = {
        filename: fileName
    };

    // Request options
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN
        }
    };

    fetch(url, options)
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
    const url = FLUIDD_SERVER_URL + '/printer/print/cancel';

    // Request options
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
        },
        body: JSON.stringify({}) // If no data is needed in the body, you can still include an empty object
    };

    fetch(url, options)
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


document.addEventListener('DOMContentLoaded', function () {
    const uploadButton = document.querySelector('.upload-button');
    const printButton = document.querySelector('.print-button');
    const cancelButton = document.querySelector('.cancel-button');
    const clearButton = document.querySelector('.clear-button');
    const fileInput = document.getElementById('fileInput');

    uploadButton.addEventListener('click', function () {
        uploadFile(fileInput.files[0]);
    });

    printButton.addEventListener('click', function () {
        const fileName = fileInput.files[0].name;
        printFile(fileName);
    });

    cancelButton.addEventListener('click', function () {
        cancelPrint();
    });

    clearButton.addEventListener('click', function () {
        fileInput.value = '';
    });
});

//-------------------------------------------------------------------------------------------------------------------
// Get all buttons on the page for the active state
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Add a class to indicate the button is active
        button.classList.add('active');

        // Remove the active class after a short delay
        setTimeout(() => {
            button.classList.remove('active');
        }, 100); // Adjust the delay as needed
    });
});


// Function to send G-code command to the printer
function sendGcodeCommand(command) {
    // Replace this with your logic to send the G-code command to the printer
    sendGCodeCommand(command);
}

// Function to update fan speed value
function updateFanSpeed() {
    const slider = document.getElementById('fan-speed');
    const speedValue = document.getElementById('fan-speed-value');
    speedValue.textContent = slider.value + '%';
}

// Function to send G-code command with fan speed value
function setFanSpeed() {
    const slider = document.getElementById('fan-speed');
    const fanSpeed = slider.value;
    const gcodeCommand = 'M106 S' + fanSpeed;
    sendGcodeCommand(gcodeCommand);
}

// Attach event listeners
document.getElementById('fan-speed').addEventListener('input', updateFanSpeed);
document.getElementById('set-fan-speed').addEventListener('click', setFanSpeed);


