document.addEventListener("DOMContentLoaded", function() {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");

    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        // Display user message
        displayMessage("You:   " + message, true); // Pass true for user message

        // Display loading message
        displayMessage("Smokey: Please wait...", false); // Pass false for bot message

        // Send HTTP POST request
        const url = "https://smokeyai.samerchat.se/generate";
        const data = { prompt: message }; // Sending the user message as 'prompt'
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
        // Regular expression to match Markdown code blocks
        const codeBlockRegex = /```[\s\S]+?```/g;
        let lastIndex = 0;
        let match;

        // Function to add text node to message container
        const addTextNode = (text) => {
            if (text) {
                messageContainer.appendChild(document.createTextNode(text));
            }
        };

        // Iterate over each Markdown code block in the message
        while ((match = codeBlockRegex.exec(message)) !== null) {
            // Add text before the code block as a text node
            addTextNode(message.substring(lastIndex, match.index));
            lastIndex = codeBlockRegex.lastIndex;

            // Create a <code> element for the code block
            const codeBlock = document.createElement("code");
            codeBlock.innerText = match[0].replace(/^```|```$/g, ""); // Remove leading and trailing ```
            messageContainer.appendChild(codeBlock);
        }

        // Add remaining text after the last code block, if any
        addTextNode(message.substring(lastIndex));

        // Append the message container to the chat container
        const chatContainer = document.querySelector(".message-wrapper");
        if (chatContainer) {
            chatContainer.appendChild(messageContainer);
            // Scroll the new message into view
            messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            console.error("Chat container not found.");
        }
    }





});




// https://smokeyai.samerchat.se/send-request