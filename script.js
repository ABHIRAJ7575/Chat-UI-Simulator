document.addEventListener('DOMContentLoaded', () => {
    const chatListItems = document.querySelector('.chat-list-items');
    const chatWindow = document.querySelector('.chat-window');
    const chatHeaderName = chatWindow.querySelector('.chat-header-info .chat-name');
    const chatHeaderStatus = chatWindow.querySelector('.chat-header-info .chat-status');
    const typingIndicator = chatWindow.querySelector('.typing-indicator'); // Get typing indicator element
    const messagesArea = chatWindow.querySelector('.messages-area');
    const messageInput = chatWindow.querySelector('#message-input');
    const sendButton = chatWindow.querySelector('#send-button');
    const clearButton = chatWindow.querySelector('#clear-button'); // Get clear button element

    let activeChatId = null;
    let typingTimeout = null;

    // --- Typing Indicator Functions ---
    const showTypingIndicator = () => {
        chatHeaderStatus.style.display = 'none';
        typingIndicator.style.display = 'flex';
    };

    const hideTypingIndicator = (currentChat) => {
        chatHeaderStatus.textContent = currentChat.status; // Restore original status
        chatHeaderStatus.style.display = 'block';
        typingIndicator.style.display = 'none';
    };

    // --- Chat Data Structure ---
    let chats = [
        {
            id: 'chat1',
            name: 'John Doe',
            status: 'online',
            avatar: 'JD',
            messages: [
                { id: 1, text: 'Hi there!', time: '10:28 AM', sender: 'received', status: 'read' },
                { id: 2, text: 'Hello! I\'m good, how about you?', time: '10:30 AM', sender: 'sent', status: 'read' },
                { id: 3, text: 'I\'m doing great, thanks for asking!', time: '10:31 AM', sender: 'received', status: 'read' },
            ]
        },
        {
            id: 'chat2',
            name: 'Jane Smith',
            status: 'last seen today at 9:00 AM',
            avatar: 'JS',
            messages: [
                { id: 4, text: 'Hey, are we still on for tomorrow?', time: 'Yesterday', sender: 'sent', status: 'delivered' },
                { id: 5, text: 'Yes, looking forward to it!', time: 'Yesterday', sender: 'received', status: 'read' },
            ]
        },
        {
            id: 'chat3',
            name: 'Group Chat',
            status: '3 members, 2 online',
            avatar: 'GC',
            messages: [
                { id: 6, text: 'Anyone free for a call?', time: '11:00 AM', sender: 'received', status: 'read' },
                { id: 7, text: 'I am!', time: '11:05 AM', sender: 'sent', status: 'read' },
            ]
        }
    ];

    // --- LocalStorage Integration (initial setup) ---
    const loadChats = () => {
        const storedChats = localStorage.getItem('chats');
        if (storedChats) {
            chats = JSON.parse(storedChats);
        }
    };

    const saveChats = () => {
        localStorage.setItem('chats', JSON.stringify(chats));
    };

    // --- Render Chat List ---
    const renderChatList = () => {
        chatListItems.innerHTML = '';
        chats.forEach(chat => {
            const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages yet';
            const lastMessageTime = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].time : '';

            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            if (chat.id === activeChatId) {
                chatItem.classList.add('active');
            }
            chatItem.dataset.chatId = chat.id;

            chatItem.innerHTML = `
                <div class="chat-avatar">${chat.avatar}</div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="last-message">${lastMessage}</div>
                </div>
                <div class="chat-meta">
                    <div class="message-time">${lastMessageTime}</div>
                    <!-- <div class="unread-count">3</div> -->
                </div>
            `;
            chatListItems.appendChild(chatItem);
        });
    };

    // --- Render Messages Area ---
    const renderMessages = (chat) => {
        messagesArea.innerHTML = '';
        chatHeaderName.textContent = chat.name;
        chatHeaderStatus.textContent = chat.status;

        chat.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', message.sender);
            messageElement.innerHTML = `
                <div class="message-bubble">
                    ${message.text}
                    <div class="message-meta">
                        <span class="message-time">${message.time}</span>
                        <span class="message-status">${message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : ''}</span>
                    </div>
                </div>
            `;
            messagesArea.appendChild(messageElement);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight; // Auto-scroll to bottom
    };

    // --- Handle Chat Selection ---
    chatListItems.addEventListener('click', (event) => {
        const chatItem = event.target.closest('.chat-item');
        if (chatItem) {
            const newChatId = chatItem.dataset.chatId;
            if (activeChatId !== newChatId) {
                activeChatId = newChatId;
                renderChatList(); // Re-render to update active state
                const selectedChat = chats.find(chat => chat.id === activeChatId);
                if (selectedChat) {
                    renderMessages(selectedChat);
                }
                // For mobile: slide in chat window
                if (window.innerWidth <= 768) {
                    chatWindow.classList.add('active');
                }
            }
        }
    });

    // --- Back button for mobile (if implemented) ---
    // You would need a back button in your HTML chat-header for this
    // Example: const backButton = chatWindow.querySelector('.back-button');
    // backButton.addEventListener('click', () => {
    //     chatWindow.classList.remove('active');
    // });

    // --- Initial Load ---
    loadChats();
    if (chats.length > 0) {
        activeChatId = chats[0].id; // Set first chat as active by default
    }
    renderChatList();
    if (activeChatId) {
        renderMessages(chats.find(chat => chat.id === activeChatId));
    }

    // --- Handle Enter to Send, Shift+Enter for New Line ---
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default new line
            sendButton.click(); // Trigger send button click
        }
    });

    // --- Clear Chat History ---
    clearButton.addEventListener('click', () => {
        if (activeChatId) {
            const currentChat = chats.find(chat => chat.id === activeChatId);
            if (currentChat && confirm('Are you sure you want to delete all messages in this chat?')) {
                currentChat.messages = []; // Clear the messages array
                renderMessages(currentChat); // Re-render the empty message area
                renderChatList(); // Re-render the chat list to update the last message
                saveChats(); // Persist the changes
            }
        }
        messageInput.value = ''; // Also clear the input field
    });

    // --- Send Message ---
    sendButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text && activeChatId) {
            const currentChat = chats.find(chat => chat.id === activeChatId);
            if (currentChat) {
                const newMessage = {
                    id: currentChat.messages.length + 1,
                    text: text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: 'sent',
                    status: 'pending' // Will be updated later
                };
                currentChat.messages.push(newMessage);
                messageInput.value = '';
                renderMessages(currentChat);
                saveChats(); // Save after sending a message

                // Simulate message status change (delivered, then read)
                setTimeout(() => {
                    newMessage.status = 'delivered';
                    renderMessages(currentChat);
                    saveChats();
                }, 1000); // Delivered after 1 second

                setTimeout(() => {
                    newMessage.status = 'read';
                    renderMessages(currentChat);
                    saveChats();
                }, 3000); // Read after 3 seconds

                // Simulate a reply with typing indicator
                const simulateReply = () => {
                    showTypingIndicator();
                    if (typingTimeout) clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                        hideTypingIndicator(currentChat);
                        const replyMessage = {
                            id: currentChat.messages.length + 1,
                            text: `I will not reply to "${text}"`,                            
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            sender: 'received',
                            status: 'read'
                        };
                        currentChat.messages.push(replyMessage);
                        renderMessages(currentChat);
                        saveChats();
                    }, 5000); // Simulate typing for 2 seconds, then send reply (total 5 seconds after sending initial message)
                };
                simulateReply();
            }
        }
    });
});
