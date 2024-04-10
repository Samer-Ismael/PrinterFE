const updateInterval = 1000;

let xPosition = 0;
let yPosition = 0;
let zPosition = 0;

function fetchSystemInfo() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
        }
    };
    options.mode = 'cors';

    return fetch(FLUIDD_SERVER_URL + '/machine/system_info', options)
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


function fetchSystemStats() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
        }
    };
    options.mode = 'cors';

    return fetch(FLUIDD_SERVER_URL + '/machine/proc_stats', options)
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

            const memoryAvailbleMB = (systemMemoryAvailable / 1024).toFixed(2);
            const memoryUsedMB = (systemMemoryUsed / 1024).toFixed(2);

            // Update the content of the additional lines of information
            document.getElementById('cpuUUsage').innerText = `${cpuUsage.toFixed(2)}%`;
            document.getElementById('cpuTemp').innerText = `${cpuTemp.toFixed(2)}°C`;
            document.getElementById('systemMemoryAvailable').innerText = `${memoryAvailbleMB} MB`;
            document.getElementById('systemMemoryUsed').innerText = `${memoryUsedMB} MB`;
        })
        .catch(error => {
            //console.error('Error fetching system stats:', error);
        });
}

setInterval(updateDOM, updateInterval);


// Function to fetch printer information
function fetchPrinterInfo() {
    const url = FLUIDD_SERVER_URL + '/printer/info';
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

function fetchPrinterObjectStatus() {
    // Endpoint URL
    const endpoint = FLUIDD_SERVER_URL + '/printer/objects/query?gcode_move&toolhead&extruder=target,temperature';

    // Request options
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN // Add the USER_TOKEN to the Authorization header
        }
    };

    options.mode = 'cors';

    // Fetch data from the endpoint
    fetch(endpoint, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process the response data
            const result = data.result;
            const status = result.status;

            // Extract position values from toolhead status
            const toolheadPosition = status.toolhead.position;

            // Extract X, Y, and Z values from the position array
            xPosition = toolheadPosition[0];
            yPosition = toolheadPosition[1];
            zPosition = toolheadPosition[2];

            // Update the UI with the extracted position values
            document.getElementById('X').textContent = xPosition;
            document.getElementById('Y').textContent = yPosition;
            document.getElementById('Z').textContent = zPosition;
        })
        .catch(error => {
            console.error('Error fetching printer object status:', error);
        });
}


// Function to fetch printer object status every 1 second
function fetchPrinterObjectStatusPeriodically() {
    // Initial fetch
    fetchPrinterObjectStatus();

    // Fetch every 1 second
    setInterval(fetchPrinterObjectStatus, 1000);
}

// Call the function to start fetching printer object status periodically
fetchPrinterObjectStatusPeriodically();


// Fetching the camera information and displaying the stream
document.addEventListener("DOMContentLoaded", function() {
    // Get the USER_TOKEN from localStorage or any other source
    const USER_TOKEN = localStorage.getItem("USER_TOKEN");

    // The Token is required to access the camera stream ONLY when using the pubplic IP.
    // If you are using the local IP, you can skip the todken or the camera is not going to work.
    // Request options
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN
        }
    };

    options.mode = 'cors';

    // Fetch camera URL from the endpoint
    fetch(FLUIDD_SERVER_URL + "/server/webcams/list", options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extract the stream URL from the response
            const streamUrl = data.result.webcams[0].stream_url;

            // Set the stream URL in the iframe source
            const iframe = document.getElementById("camera-stream");
            iframe.src = FLUIDD_SERVER_URL + streamUrl;

            // Store the stream URL in local storage
            localStorage.setItem("cameraUrl", streamUrl);
        })
        .catch(error => {
            console.error("Error fetching camera URL:", error);
        });
});