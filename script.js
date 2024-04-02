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
            const responseData = JSON.parse(responseBody);
            displayResponse(gCodeCommand, responseData.result);
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

function getFiles(rootFolder) {
    const url = `http://192.168.0.71:7125/server/files/list?root=${rootFolder}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Files:', data); // Log the response data
            displayFiles(data);
        })
        .catch(error => console.error('Error:', error));
}

function displayFiles(files) {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = ''; // Clear previous list

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.path;

        // Add click event listener to list item
        listItem.addEventListener('click', function() {
            // Show the print button
            document.getElementById('printFileButton').style.display = 'inline';
            // Store the selected file name as a data attribute
            document.getElementById('printFileButton').setAttribute('data-file-path', file.path);
        });

        fileListElement.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const rootFolder = {
        name: "gcodes",
        path: "/home/samer/printer_data/gcodes",
        permissions: "rw"
    };
    console.log('Fetching files from:', rootFolder.path); // Log the root folder path
    getFiles(rootFolder);
});

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        uploadFile(file);
    });
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
    const clearButton = document.querySelector('.clear-button');
    const fileInput = document.getElementById('fileInput');

    uploadButton.addEventListener('click', function() {
        // Your upload logic here
        // This event listener handles the upload button click
    });

    clearButton.addEventListener('click', function() {
        // Clear the selected file
        fileInput.value = '';
    });
});
