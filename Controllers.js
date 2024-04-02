// script.js

document.addEventListener("DOMContentLoaded", function() {
    const upButtons = document.querySelectorAll(".arrow-button.up");
    const downButtons = document.querySelectorAll(".arrow-button.down");
    const leftButtons = document.querySelectorAll(".arrow-button.left");
    const rightButtons = document.querySelectorAll(".arrow-button.right");
    const homeButtons = document.querySelectorAll(".home-button");

    // Function for up buttons
    upButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 Y-5");
        });
    });

    // Function for down buttons
    downButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 Y5");
        });
    });

    // Function for left buttons
    leftButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 X-5");

        });
    });

    // Function for right buttons
    rightButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 X5");
        });
    });

    // Function for home buttons
    homeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G28");
        });
    });

    // Additional button functions
    const additionalUpButtons = document.querySelectorAll(".additional-buttons .arrow-button.up");
    const additionalDownButtons = document.querySelectorAll(".additional-buttons .arrow-button.down");
    const additionalHomeButtons = document.querySelectorAll(".additional-buttons .home-button");

    // Function for additional up buttons
    additionalUpButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 Z-5");

        });
    });

    // Function for additional down buttons
    additionalDownButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G1 Z5");

        });
    });

    // Function for additional home buttons
    additionalHomeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("G28");

        });
    });

    // Additional button functions for calibrate
    const calibrateHomeButtons = document.querySelectorAll(".additional-buttons-cal .home-button");

    // Function for calibrate home buttons
    calibrateHomeButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            sendGCodeCommand("BED_MESH_CALIBRATE");

        });
    });
});
