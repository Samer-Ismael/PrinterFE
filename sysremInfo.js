const updateInterval = 1000;

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
            console.error('Error fetching system stats:', error);
        });
}

setInterval(updateDOM, updateInterval);


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
