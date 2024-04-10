function updateKlipper() {
    const requestData = {
        jsonrpc: '2.0',
        method: 'machine.update.klipper',
        id: 5745
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN
        },
        body: JSON.stringify(requestData)
    };
    options.mode = 'cors';

    fetch(FLUIDD_SERVER_URL + '/machine/update/klipper', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.result === 'ok') {
                displayResponse('Klipper updated successfully');
            } else {
                displayResponse('Error updating Klipper: ' + JSON.stringify(data));
            }
        })
        .catch(error => {
            displayResponse('Error updating Klipper: ' + error);
        });
}


function updateSystem() {
    const requestData = {
        jsonrpc: '2.0',
        method: 'machine.update.system',
        id: 4564
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN
        },
        body: JSON.stringify(requestData)
    };
    options.mode = 'cors';

    fetch(FLUIDD_SERVER_URL + '/machine/update/system', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.result === 'ok') {
                displayResponse('System packages updated successfully');
            } else {
                displayResponse('Error updating system packages: ' + JSON.stringify(data));
            }
        })
        .catch(error => {
            displayResponse('Error updating system packages: ' + error);
        });
}


function updateMoonraker() {
    const requestData = {
        jsonrpc: '2.0',
        method: 'machine.update.moonraker',
        id: 4645
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + USER_TOKEN
        },
        body: JSON.stringify(requestData)
    };
    options.mode = 'cors';

    fetch(FLUIDD_SERVER_URL + '/machine/update/moonraker', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.result === 'ok') {
                displayResponse('Moonraker updated successfully');
            } else {
                displayResponse('Error updating Moonraker: ' + JSON.stringify(data));
            }
        })
        .catch(error => {
            displayResponse('Error updating Moonraker: ' + error);
        });
}
