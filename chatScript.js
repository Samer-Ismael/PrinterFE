document.addEventListener("DOMContentLoaded", function() {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");

    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        sendMessage();
    });

    // Define an array to store the conversation history
    let history = [];

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        // Display user message
        displayMessage("You:   " + message, true); // Pass true for user message

        // Display loading message
        displayMessage("Smokey: Please wait...", false); // Pass false for bot message

        // Add user message to history
        history.push(message);

        // If history length exceeds 3, remove the oldest message
        if (history.length > 3) {
            history.shift();
        }

        // Send HTTP POST request
        const url = "https://smokeyai.samerchat.se/generate";
        const data = {
            prompt: history.join("\n") // Join the last 3 messages with newline character
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
                    // Display bot response
                    displayMessage("Smokey:   " + data.generated_response, false); // Pass false for bot message
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



    function displayMessage(message, isUser) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add(isUser ? "user-message" : "bot-message");
        const codeBlockRegex = /```[\s\S]+?```/g;
        let lastIndex = 0;
        let match;

        const addTextNode = (text) => {
            if (text) {
                messageContainer.appendChild(document.createTextNode(text));
            }
        };

        while ((match = codeBlockRegex.exec(message)) !== null) {
            addTextNode(message.substring(lastIndex, match.index));
            lastIndex = codeBlockRegex.lastIndex;
            const codeBlock = document.createElement("code");
            codeBlock.innerText = match[0].replace(/^```|```$/g, ""); // Remove leading and trailing ```
            messageContainer.appendChild(codeBlock);
        }

        addTextNode(message.substring(lastIndex));

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