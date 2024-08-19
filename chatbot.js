(function () {
    // Check if chatbotSettings exists and has an apiKey
    if (!window.chatbotSettings || !window.chatbotSettings.apiKey) {
        console.error("Chatbot API key is missing. Please provide it in the chatbotSettings.");
        return; // Exit the script if API key is missing
    }

    const API_KEY = window.chatbotSettings.apiKey;

    let openAIConfig = {
        baseURL: "https://api.pulze.ai/v1",
        apiKey: API_KEY,
    };

    const conversationHistory = [];

    const styles = `
        #chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: Arial, sans-serif;
            resize: both;
            min-width: 200px;
            min-height: 300px;
            max-width: 800px;
            max-height: 600px;
        }
        #chatbot-resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 15px;
            height: 15px;
            cursor: se-resize;
            background: linear-gradient(135deg, transparent 50%, #4a90e2 50%);
        }
        #chatbot-header {
            background-color: #4a90e2;
            color: white;
            padding: 10px;
            font-weight: bold;
            cursor: pointer;
        }
        #chatbot-messages {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px;
        }
        #chatbot-input-area {
            display: flex;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
        }
        #chatbot-input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        #chatbot-send {
            background-color: #4a90e2;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
        #chatbot-footer {
            padding: 5px;
            text-align: center;
            font-size: 10px;
            color: #888;
            border-top: 1px solid #e0e0e0;
        }
        #chatbot-footer a {
            color: #4a90e2;
            text-decoration: none;
        }
        #chatbot-footer a:hover {
            text-decoration: underline;
        }
        #chatbot-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #4a90e2;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .message {
            display: flex;
            margin-bottom: 10px;
        }
        .message-content {
            padding: 8px 12px;
            border-radius: 18px;
            max-width: 80%;
            word-wrap: break-word;
            line-height: 1.5;
            position: relative;
        }
        .user-message .message-content {
            background-color: #e1f5fe;
            margin-left: auto;
        }
        .bot-message .message-content {
            background-color: #f5f5f5;
        }
        .bot-logo {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: black;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 8px;
        }
        .message-content pre {
            background-color: #f4f4f4;
            border-radius: 4px;
            padding: 10px;
            overflow-x: auto;
            white-space: pre-wrap;
            position: relative;
            margin-bottom: 20px;
        }
        .message-content code {
            font-family: monospace;
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 4px;
        }
        .message-content h1, .message-content h2, .message-content h3,
        .message-content h4, .message-content h5, .message-content h6 {
            margin-top: 10px;
            margin-bottom: 5px;
        }
        .message-content blockquote {
            border-left: 3px solid #ccc;
            margin: 0;
            padding-left: 10px;
            color: #666;
        }
        .message-content a {
            color: #0066cc;
            text-decoration: none;
        }
        .message-content a:hover {
            text-decoration: underline;
        }
        .copy-button {
            position: absolute;
            top: -25px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.7);
            border: none;
            border-radius: 4px;
            padding: 2px 5px;
            font-size: 12px;
            cursor: pointer;
        }
        .copy-button:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    const chatContainer = document.createElement("div");
    chatContainer.id = "chatbot-container";

    const resizeHandle = document.createElement("div");
    resizeHandle.id = "chatbot-resize-handle";
    chatContainer.appendChild(resizeHandle);

    const chatHeader = document.createElement("div");
    chatHeader.id = "chatbot-header";
    chatHeader.textContent = "Chat with Pulze AI";

    const chatMessages = document.createElement("div");
    chatMessages.id = "chatbot-messages";

    const inputArea = document.createElement("div");
    inputArea.id = "chatbot-input-area";

    const input = document.createElement("input");
    input.id = "chatbot-input";
    input.type = "text";
    input.placeholder = "Type your message...";

    const sendButton = document.createElement("button");
    sendButton.id = "chatbot-send";
    sendButton.textContent = "Send";

    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);

    const chatFooter = document.createElement("div");
    chatFooter.id = "chatbot-footer";
    chatFooter.innerHTML = 'Powered by <a href="https://spaces.pulze.ai" target="_blank">Spaces</a> from <a href="https://pulze.ai" target="_blank">Pulze.ai</a>';

    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(inputArea);
    chatContainer.appendChild(chatFooter);

    const toggleButton = document.createElement("div");
    toggleButton.id = "chatbot-toggle";
    toggleButton.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

    document.body.appendChild(chatContainer);
    document.body.appendChild(toggleButton);

    toggleButton.onclick = function () {
        if (chatContainer.style.display === "none") {
            chatContainer.style.display = "flex";
            toggleButton.style.display = "none";
        } else {
            chatContainer.style.display = "none";
            toggleButton.style.display = "flex";
        }
    };

    chatHeader.onclick = function () {
        chatContainer.style.display = "none";
        toggleButton.style.display = "flex";
    };

    function sendMessage() {
        const message = input.value.trim();
        if (message) {
            addMessage("user", message);
            conversationHistory.push({ role: "user", content: message });
            input.value = "";
            streamResponse(message);
        }
    }

    sendButton.onclick = sendMessage;
    input.onkeypress = function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    function MarkdownRenderer(text) {
        if (typeof text !== "string") {
            return text ?? "";
        }

        // Code blocks with copy button
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, language, code) {
            const uniqueId = "code-" + Math.random().toString(36).substr(2, 9);
            return `
                <div style="position: relative;">
                    <pre><code class="language-${language || ""}" id="${uniqueId}">${code.trim()}</code></pre>
                    <button class="copy-button" onclick="copyCode('${uniqueId}')">Copy</button>
                </div>
            `;
        });

        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Headers
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        text = text.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
        text = text.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

        // Blockquotes
        text = text.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${sender}-message`;

        if (sender === "bot") {
            const logoElement = document.createElement("div");
            logoElement.className = "bot-logo";
            logoElement.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            messageElement.appendChild(logoElement);
        }

        const contentElement = document.createElement("div");
        contentElement.className = "message-content";
        contentElement.innerHTML = MarkdownRenderer(text); // Use MarkdownRenderer here
        messageElement.appendChild(contentElement);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return contentElement;
    }

    function streamResponse(prompt) {
        const messageElement = addMessage("bot", "");
        let fullResponse = "";

        const custom_labels = { "ai-chat-bot-widget": "true" };


        fetch(`${openAIConfig.baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openAIConfig.apiKey}`,
                "Pulze-Labels": JSON.stringify(custom_labels),
            },
            body: JSON.stringify({
                model: "pulze",
                messages: conversationHistory,
                stream: true,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                function readStream() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            return;
                        }
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split("\n");
                        lines.forEach((line) => {
                            if (line.startsWith("data: ")) {
                                const data = line.slice(6);
                                if (data === "[DONE]") {
                                    return;
                                }
                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices[0].delta.content;
                                    if (content) {
                                        fullResponse += content;
                                        messageElement.innerHTML = MarkdownRenderer(fullResponse);
                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                    }
                                } catch (error) {
                                    console.error("Error parsing streaming response:", error);
                                }
                            }
                        });
                        readStream();
                    }).catch((error) => {
                        console.error("Error reading stream:", error);
                        messageElement.innerHTML += "\nError: Unable to fetch the response.";
                    });
                }

                readStream();
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                messageElement.innerHTML = "Error: Unable to connect to the server.";
            })
            .finally(() => {
                conversationHistory.push({ role: "assistant", content: fullResponse });
            });
    }

    // Function to copy code to clipboard
    window.copyCode = function (elementId) {
        const codeElement = document.getElementById(elementId);
        const textArea = document.createElement("textarea");
        textArea.value = codeElement.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Code copied to clipboard!");
    };

    // Add resize functionality
    let isResizing = false;
    let lastDownX, lastDownY;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        lastDownX = e.clientX;
        lastDownY = e.clientY;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const newWidth = chatContainer.offsetWidth + (e.clientX - lastDownX);
        const newHeight = chatContainer.offsetHeight + (e.clientY - lastDownY);

        chatContainer.style.width = `${newWidth}px`;
        chatContainer.style.height = `${newHeight}px`;

        lastDownX = e.clientX;
        lastDownY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

})();
