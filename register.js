
let USER_TOKEN = localStorage.getItem("USER_TOKEN") || "";

let FLUIDD_SERVER_URL = localStorage.getItem("FLUIDD_SERVER_URL") || "";

// Get the modal
var modal = document.getElementById('loginModal');

// Open the login modal
function openLoginModal() {
    loginModal.style.display = 'block';
}

// Close the login modal
function closeLoginModal() {
    loginModal.style.display = 'none';
}

// Event listener for closing the login modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

// Handle registration
function register() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var requestBody = {
        username: username,
        password: password
    };

    fetch(FLUIDD_SERVER_URL + '/access/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            USER_TOKEN = data.result.token;
            localStorage.setItem("USER_TOKEN", USER_TOKEN);

            displayResponse("Status: " , data.result.action);
            displayResponse("Token: " , USER_TOKEN);
        })
        .catch(error => {
            // Handle error
            displayResponse('There was a problem with your fetch operation:', error);
        });
}

function login() {
    var nameLogin = document.getElementById("username").value;
    var passwordLogin = document.getElementById("password").value;
    var source = "moonraker";

    var requestBody = {
        username: nameLogin,
        password: passwordLogin,
        source: source
    };

    fetch(FLUIDD_SERVER_URL + '/access/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            USER_TOKEN = data.result.token;
            localStorage.setItem("USER_TOKEN", USER_TOKEN);

            displayResponse("Status: " , data.result.action);
            displayResponse("Token: " , USER_TOKEN);
        })
        .catch(error => {
            // Handle error
            displayResponse('There was a problem with your fetch operation:', error);
        });
}




// -------------------------------------------------------------------------------------------------------------------
// Modal for setting the server URL (IP address or hostname)
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
    displayResponse("Server URL saved successfully", FLUIDD_SERVER_URL);
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
