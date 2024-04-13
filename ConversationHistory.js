class ConversationHistory {
    constructor(maxLength) {
        this.maxLength = maxLength;
        this.history = [];
    }

    addMessage(message) {
        this.history.push(message);
        if (this.history.length > this.maxLength) {
            this.history.shift();
        }
    }

    getSummary() {
        // Concatenate the last 3 messages into a summary
        return this.history.slice(-3).join("\n");
    }
}