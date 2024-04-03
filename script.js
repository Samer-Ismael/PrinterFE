let FLUIDD_SERVER_URL = localStorage.getItem("FLUIDD_SERVER_URL") || ""; // Get stored URL or initialize as empty string

var modal = document.getElementById("myModal");

function openModal() {
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
}

function saveServerUrl() {
    FLUIDD_SERVER_URL = document.getElementById("serverUrlInput").value;
    localStorage.setItem("FLUIDD_SERVER_URL", FLUIDD_SERVER_URL); // Save URL to localStorage
    closeModal(); // Close the modal after saving the URL
}

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Restore saved URL when the page loads
window.onload = function () {
    FLUIDD_SERVER_URL = localStorage.getItem("FLUIDD_SERVER_URL") || "";
};

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

// -------------------------------------------------------------------------------------------------------------------
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

        displayResponse('Working...', "........")
        fetch(url)
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
function getTemperatures(includeMonitors) {
    const TEMPERATURE_STORE_ENDPOINT = "/server/temperature_store";

    const url = FLUIDD_SERVER_URL + TEMPERATURE_STORE_ENDPOINT;
    const params = {include_monitors: includeMonitors};

    fetch(url, {method: 'GET', params: params})
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
function displayResponse(command, responseData) {
    const responseElement = document.getElementById('response');
    // Construct the string representation of the command and response
    const message = `Command sent: ${command} ----- Response: ${JSON.stringify(responseData)}`;
    // Append the message to the response element
    responseElement.innerText += message + '\n';
    responseElement.scrollTop = responseElement.scrollHeight;

}

document.addEventListener('DOMContentLoaded', function () {
    // Fetch temperatures when the page loads
    getTemperatures();
    // Update temperatures every 0.5 seconds
    setInterval(getTemperatures, 500);
});

// -------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Call the sendUpdatesToDisplayResponse function every 1 second
    setInterval(sendUpdatesToDisplayResponse, 1000);
});

// Function to fetch system information from the /machine/system_info endpoint
function fetchSystemInfo() {
    return fetch(FLUIDD_SERVER_URL + '/machine/system_info')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            return data.result.system_info; // Extract system information
        })
        .catch(error => {
            console.error('Error fetching system info:', error);
            throw error; // Rethrow the error for handling
        });
}

// Function to fetch additional system statistics from the /machine/proc_stats endpoint

const updateInterval = 1000;

function fetchSystemStats() {
    return fetch(FLUIDD_SERVER_URL + '/machine/proc_stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            return data.result; // Extract system statistics
        })
        .catch(error => {
            console.error('Error fetching system stats:', error);
            throw error; // Rethrow the error for handling
        });
}

// Function to update the DOM with system information and statistics
function updateDOM() {
    fetchSystemInfo()
        .then(systemInfo => {
            // Extract specific system information
            const cpuInfo = systemInfo.cpu_info;
            const distribution = systemInfo.distribution;
            const sdInfo = systemInfo.sd_info;
            const totalMemoryKB = cpuInfo.total_memory;

            // Convert total memory to megabytes
            const totalMemoryMB = (totalMemoryKB / 1024).toFixed(2);

            // Update the content of the additional lines of information
            document.getElementById('totalMemory').innerText = `${totalMemoryMB} MB`;
            document.getElementById('cpuModel').innerText = cpuInfo.model;
            document.getElementById('distribution').innerText = `${distribution.name} ${distribution.version}`;
            document.getElementById('sdCardCapacity').innerText = sdInfo.capacity;
        })
        .catch(error => {
            const printerStatusSpan = document.getElementById('printerStatus');
            printerStatusSpan.innerText = 'Failed to fetch system information. Please try again later.';
        });

    fetchSystemStats()
        .then(systemStats => {
            // Extract specific system stats
            const cpuUsage = systemStats.system_cpu_usage.cpu;
            const cpuTemp = systemStats.cpu_temp;
            const systemMemoryAvailable = systemStats.system_memory.available;
            const systemMemoryUsed = systemStats.system_memory.used;

            // Update the content of the additional lines of information
            document.getElementById('cpuUUsage').innerText = `${cpuUsage.toFixed(2)}%`;
            document.getElementById('cpuTemp').innerText = `${cpuTemp.toFixed(2)}°C`;
            document.getElementById('systemMemoryAvailable').innerText = `${systemMemoryAvailable} KB`;
            document.getElementById('systemMemoryUsed').innerText = `${systemMemoryUsed} KB`;
        })
        .catch(error => {
            console.error('Error fetching system stats:', error);
        });
}

updateDOM();

setInterval(updateDOM, updateInterval);

// -------------------------------------------------------------------------------------------------------------------
function uploadFile(file) {
    const url = FLUIDD_SERVER_URL + '/server/files/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('root', 'gcodes'); // Specify the root location for uploading

    displayResponse('Uploading file', file.name)

    fetch(url, {
        method: 'POST', body: formData
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

// -------------------------------------------------------------------------------------------------------------------
function printFile(fileName) {
    const url = FLUIDD_SERVER_URL + '/printer/print/start';
    const data = {
        filename: fileName
    };

    fetch(url, {
        method: 'POST', body: JSON.stringify(data), headers: {
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

//-------------------------------------------------------------------------------------------------------------------
function cancelPrint() {
    const url = FLUIDD_SERVER_URL + '/printer/print/cancel';

    fetch(url, {
        method: 'POST', body: JSON.stringify({}), headers: {
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

//-------------------------------------------------------------------------------------------------------------------
// Function to fetch printer information
function fetchPrinterInfo() {
    const url = FLUIDD_SERVER_URL + '/printer/info';

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

//-------------------------------------------------------------------------------------------------------------------
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