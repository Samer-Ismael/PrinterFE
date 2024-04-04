// script.js

document.addEventListener("DOMContentLoaded", function () {
    const regularButtons = {
        upX: document.querySelectorAll(".arrow-button.upX"),
        downX: document.querySelectorAll(".arrow-button.downX"),
        left: document.querySelectorAll(".arrow-button.left"),
        right: document.querySelectorAll(".arrow-button.right"),
        home: document.querySelectorAll(".home-button")
    };

    const additionalButtons = {
        upZ: document.querySelectorAll(".additional-buttons .arrow-button.upZ"),
        downZ: document.querySelectorAll(".additional-buttons .arrow-button.downZ"),
        home: document.querySelectorAll(".additional-buttons .home-button")
    };

    // Function for regular buttons
    function attachRegularButtonListeners(buttons) {
        buttons.upX.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 Y5 F7800");
                sendGCodeCommand("G90");
            });
        });

        buttons.downX.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 Y-5 F7800");
                sendGCodeCommand("G90");
            });
        });

        buttons.left.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 X-5 F7800");
                sendGCodeCommand("G90");
            });
        });

        buttons.right.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 X5 F7800");
                sendGCodeCommand("G90");
            });
        });

        buttons.home.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G28");
            });
        });
    }

    // Function for additional buttons
    function attachAdditionalButtonListeners(buttons) {
        buttons.upZ.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 Z5 F600");
                sendGCodeCommand("G90");
            });
        });

        buttons.downZ.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G91");
                sendGCodeCommand("G1 Z-5 F600");
                sendGCodeCommand("G90");
            });
        });

        buttons['home'].forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("G28");
            });
        });
    }

    // Attach event listeners for regular buttons
    attachRegularButtonListeners(regularButtons);

    // Attach event listeners for additional buttons
    attachAdditionalButtonListeners(additionalButtons);
});


document.addEventListener("DOMContentLoaded", function () {
    try {
        const calibrateHomeButtons = document.querySelectorAll(".additional-buttons-cal .home-button");

        calibrateHomeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                sendGCodeCommand("BED_MESH_CALIBRATE");
            });
        });
    } catch (error) {
        console.error("Error attaching event listeners:", error);
    }
});

function setFanSpeed() {
    // Get the value from the slider
    const fanSpeed = document.getElementById("fan-speed").value;

    // Send the G-code command to set the fan speed
    const gCodeCommand = "M106 S" + fanSpeed;
    sendGcodeCommand(gCodeCommand);
}

// Attach click event listener to the "Set Fan Speed" button
const setFanSpeedButton = document.getElementById("set-fan-speed");
setFanSpeedButton.addEventListener("click", setFanSpeed);


