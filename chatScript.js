document.addEventListener("DOMContentLoaded", function() {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");

    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        sendMessage();
    });

    let history = [];
    let summary = "";

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        // Display user message with timestamp
        const userMessage = getCurrentTime() + " You: " + message;
        displayMessage(userMessage, true); // Pass true for user message

        // Add user message to history
        history.push({ type: "user", message: message, timestamp: new Date() });

        // Update the summary
        updateSummary();

        // If history length exceeds 3, remove the oldest message

        /*
        if (history.length > 3) {
            history.shift();
        }
         */
        // Display loading message
        displayMessage("Smokey: Please wait...", false); // Pass false for bot message

        // Send HTTP POST request
        const url = "https://smokeyai.samerchat.se/generate";
        const data = {
            prompt: summary // Send the summary to the AI
        };
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                // Check if the response contains the 'generated_response' field
                if ('generated_response' in data) {
                    // Display bot response with timestamp
                    const botMessage = getCurrentTime() + " Smokey: " + data.generated_response;
                    displayMessage(botMessage, false); // Pass false for bot message
                    // Add bot message to history
                    history.push({ type: "bot", message: data.generated_response, timestamp: new Date() });
                    // Update the summary after receiving the bot's response
                    updateSummary();
                    // If history length exceeds 3, remove the oldest message
                    /*
                    if (history.length > 3) {
                        history.shift();
                    }
                     */
                } else {
                    console.error("Error: Response does not contain 'generated_response'");
                    displayMessage("Bot: Sorry, an error occurred while processing your request.", false); // Pass false for bot message
                }
            })
            .catch(error => {
                console.error("Error:", error);
                displayMessage("Bot: Sorry, an error occurred while processing your request.", false); // Pass false for bot message
            });

        // Clear user input
        userInput.value = "";
    }

    function updateSummary() {
        summary = history.map(entry => entry.message).join("\n"); // Join the messages with newline character
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }




    function displayMessage(message, isUser) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add(isUser ? "user-message" : "bot-message");

        const codeBlockRegex = /```([\s\S]+?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(message)) !== null) {
            const textBeforeCode = message.substring(lastIndex, match.index);
            if (textBeforeCode) {
                messageContainer.appendChild(document.createTextNode(textBeforeCode));
            }

            const codeBlock = document.createElement("code");
            codeBlock.textContent = match[1].trim();
            codeBlock.style.whiteSpace = "pre-wrap"; // Preserve line breaks
            codeBlock.style.overflowX = "auto"; // Enable horizontal scrolling for long lines

            const preElement = document.createElement("pre");
            preElement.appendChild(codeBlock);

            messageContainer.appendChild(preElement);

            lastIndex = codeBlockRegex.lastIndex;
        }

        const textAfterLastCode = message.substring(lastIndex);
        if (textAfterLastCode) {
            messageContainer.appendChild(document.createTextNode(textAfterLastCode));
        }

        const chatContainer = document.querySelector(".message-wrapper");
        if (chatContainer) {
            chatContainer.appendChild(messageContainer);
            messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            console.error("Chat container not found.");
        }
    }
});

// https://smokeyai.samerchat.se/send-request