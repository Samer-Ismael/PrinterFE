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
        home1: document.querySelectorAll(".additional-buttons .home-button1")
    };

    // Function for regular buttons
    function attachRegularButtonListeners(buttons) {
        buttons.upX.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = yPosition + 5;
                const toSend = "G1 Y" + place + " F7800";
                sendGCodeCommand(toSend);

            });
        });

        buttons.downX.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = yPosition - 5;
                const toSend = "G1 Y" + place + " F7800";
                sendGCodeCommand(toSend);

            });
        });

        buttons.left.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = xPosition - 5;
                const toSend = "G1 X" + place + " F7800";
                sendGCodeCommand(toSend);


            });
        });

        buttons.right.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = xPosition + 5;
                const toSend = "G1 X" + place + " F7800";
                sendGCodeCommand(toSend);


            });
        });

        buttons.home.forEach(function (button) {
            button.addEventListener("click", function () {
                homePrinter();
            });
        });
    }

    // Function for additional buttons
    function attachAdditionalButtonListeners(buttons) {
        buttons.upZ.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = zPosition + 5;
                const toSend = "G1 Z" + place + " F600";
                sendGCodeCommand(toSend);

            });
        });

        buttons.downZ.forEach(function (button) {
            button.addEventListener("click", function () {

                const place = zPosition - 5;
                const toSend = "G1 Z" + place + " F600";
                sendGCodeCommand(toSend);


            });
        });

        buttons.home1.forEach(function (button) {
            button.addEventListener("click", function () {
                homePrinter();
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
        const calibrateHomeButtons = document.querySelectorAll(".additional-buttons-cal .home-button-cal");

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


