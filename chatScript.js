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
        if (isUser) {
            messageContainer.classList.add("user-message");
        } else {
            messageContainer.classList.add("bot-message");
        }

        // Regular expression to match Markdown code blocks
        const codeBlockRegex = /```[\s\S]+?```/g;
        let lastIndex = 0;
        let match;

        // Iterate over each Markdown code block in the message
        while ((match = codeBlockRegex.exec(message)) !== null) {
            // Add text before the code block as a text node
            const textBeforeBlock = message.substring(lastIndex, match.index);
            if (textBeforeBlock) {
                messageContainer.appendChild(document.createTextNode(textBeforeBlock));
            }
            lastIndex = codeBlockRegex.lastIndex;

            // Add separator before code block
            messageContainer.appendChild(document.createTextNode("--------\n"));

            // Create a <code> element for the code block
            const codeBlock = document.createElement("code");
            codeBlock.innerText = match[0].replace(/^```|```$/g, ""); // Remove leading and trailing ```
            messageContainer.appendChild(codeBlock);

            // Add separator after code block
            messageContainer.appendChild(document.createTextNode("\n--------\n"));
        }

        // Add remaining text after the last code block, if any
        const textAfterLastBlock = message.substring(lastIndex);
        if (textAfterLastBlock) {
            messageContainer.appendChild(document.createTextNode(textAfterLastBlock));
        }

        // Append the message container to the chat container
        document.querySelector(".container").appendChild(messageContainer);
    }




});




// https://smokeyai.samerchat.se/send-request