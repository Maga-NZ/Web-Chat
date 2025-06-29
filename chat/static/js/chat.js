// Get the room name from the HTML page (will be set by the Django template)
const roomName = JSON.parse(document.getElementById('room-name').textContent);

// Get the current user ID from the HTML page (will be set by the Django template)
const currentUserId = JSON.parse(document.getElementById('current-user-id').textContent);

// Determine the WebSocket protocol (ws or wss)
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

// Construct the WebSocket URL
const chatSocket = new WebSocket(
    wsProtocol
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
);

// Get DOM elements
const chatLog = document.getElementById('chat-log');
const messageInput = document.getElementById('chat-message-input');
const messageSubmit = document.getElementById('chat-message-submit');
const usersListElement = document.getElementById('users-in-room-list'); // Get users list element
const usersListTitle = usersListElement ? usersListElement.querySelector('.list-title') : null; // Get the title element if it exists

// Store current users data (optional, but can be useful for updates)
const usersInRoom = {}; // Object to store users by ID

// Flag to indicate if initial history is loading
let isLoadingHistory = true;

// Function to render a single user item in the list
function renderUser(user) {
    let userItem = document.getElementById(`user-${user.id}`);
    if (!userItem) {
        // Create new element if user is not in the list
        userItem = document.createElement('div');
        userItem.id = `user-${user.id}`;
        userItem.classList.add('user-item');
        // Add to the list (after the title if it exists)
        if (usersListTitle) {
             usersListElement.insertBefore(userItem, usersListTitle.nextSibling);
        } else if (usersListElement) {
             usersListElement.appendChild(userItem);
        }
    }
    // Update content and status class
    userItem.textContent = `${user.username} (${user.status})`; // Display username and status
    userItem.className = 'user-item'; // Reset classes
    userItem.classList.add(`status-${user.status}`); // Add status class for styling
}

// --- WebSocket Event Handlers ---

chatSocket.onopen = function(e) {
    console.log('WebSocket connection opened.');
    // When connection is open, history starts loading
    isLoadingHistory = true;
    // The backend sends history automatically upon connection.
    // The backend now also sends the initial user list.
    // No need to send separate requests here for this project structure.
};

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('Message received:', data);

    // Handle different message types
    if (data.type === 'chat_message') {
        // --- Display Chat Message ---
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message'); // Add a class for styling
        // Add data attribute for message ID for future features
        if (data.id) {
             messageContainer.dataset.messageId = data.id;
        }

        const senderInfo = document.createElement('div');
        senderInfo.classList.add('message-sender-info');

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('message-timestamp');
        // Format timestamp - assuming data.timestamp is an ISO string or similar
        try {
            const date = new Date(data.timestamp);
            timestampSpan.textContent = `[${date.toLocaleTimeString()}]`; // Example: [10:30:00 AM]
        } catch (error) {
            console.error('Error parsing timestamp:', data.timestamp, error);
            timestampSpan.textContent = ''; // Display empty if parsing fails
        }

        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('message-username');
        usernameSpan.textContent = data.username ? `${data.username}: ` : 'System: '; // Handle System messages

        senderInfo.appendChild(timestampSpan);
        senderInfo.appendChild(usernameSpan);
        messageContainer.appendChild(senderInfo);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        // Display content based on message type
        if (data.message_type === 'text') {
            messageContent.textContent = data.content || ''; // Display text content
        } else if (data.message_type === 'image') {
            const img = document.createElement('img');
            img.src = data.file_url;
            img.alt = 'Image';
            img.style.maxWidth = '200px'; // Basic styling for images
            messageContent.appendChild(img);
        } else if (data.message_type === 'file') {
            const a = document.createElement('a');
            a.href = data.file_url;
            a.textContent = data.content || 'Download File'; // Use content as file name or default text
            a.target = '_blank'; // Open link in new tab
            messageContent.appendChild(a);
        } else if (data.type === 'system') { // Handle system messages sent with type='system'
             messageContent.textContent = data.message;
             messageContent.style.fontStyle = 'italic';
        }

        messageContainer.appendChild(messageContent);

        // Add edited indicator if applicable
        if (data.is_edited) {
            const editedSpan = document.createElement('span');
            editedSpan.classList.add('message-edited-indicator');
            // Format edited time if available
            try {
                 const editDate = new Date(data.edited_at);
                 editedSpan.textContent = ` (edited ${editDate.toLocaleTimeString()})`;
            } catch (error) {
                 editedSpan.textContent = ' (edited)';
            }

            senderInfo.appendChild(editedSpan); // Add indicator next to sender info
        }

        // --- Add Edit and Delete Buttons (only for the author) ---
        // Check if the current user is the sender of the message
        if (data.sender_id && data.sender_id === currentUserId) {
             const actionsContainer = document.createElement('div');
             actionsContainer.classList.add('message-actions');

             const editButton = document.createElement('button');
             editButton.textContent = 'Edit';
             editButton.classList.add('message-action-button', 'edit-button');
             editButton.dataset.messageId = data.id; // Store message ID on the button
             // Add click listener
             editButton.addEventListener('click', function() {
                 const messageId = this.dataset.messageId;
                 const currentContent = messageContent.textContent; // Get current text content
                 const newContent = prompt('Edit your message:', currentContent);
                 if (newContent !== null && newContent.trim() !== '') {
                     chatSocket.send(JSON.stringify({
                         'type': 'edit_message',
                         'message_id': parseInt(messageId),
                         'new_content': newContent.trim()
                     }));
                 }
             });
             actionsContainer.appendChild(editButton);

             const deleteButton = document.createElement('button');
             deleteButton.textContent = 'Delete';
             deleteButton.classList.add('message-action-button', 'delete-button');
             deleteButton.dataset.messageId = data.id; // Store message ID on the button
              // Add click listener
             deleteButton.addEventListener('click', function() {
                 const messageId = this.dataset.messageId;
                 if (confirm('Are you sure you want to delete this message?')) {
                      chatSocket.send(JSON.stringify({
                         'type': 'delete_message',
                         'message_id': parseInt(messageId)
                      }));
                 }
             });
             actionsContainer.appendChild(deleteButton);

             messageContainer.appendChild(actionsContainer);
        }
        // --- End Add Edit and Delete Buttons ---

        // Append the new message to the chat log
        chatLog.appendChild(messageContainer);
        // --- End Display Chat Message ---

        // --- History Loading and Scrolling ---
        // If currently loading history, just append without immediate scroll
        if (isLoadingHistory) {
             // We need a way to know when the history is fully loaded.
             // Since the backend sends messages one by one, and doesn't send a 'history_end' signal,
             // a simple approach is to assume history is loaded after a short delay or after a certain number of messages.
             // A more robust approach would involve modifying the backend to send a signal.
             // For now, we'll rely on the fact that new messages will typically arrive *after* the batch of history.
             // A simple flag reset after the first new message might work, or a timeout.
             // Let's add a timeout as a simple mechanism to indicate history loading is likely finished.
             if (!this._historyLoadingTimeout) {
                  this._historyLoadingTimeout = setTimeout(() => {
                      isLoadingHistory = false;
                      console.log('History loading likely finished. Scrolling to bottom.');
                      chatLog.scrollTop = chatLog.scrollHeight;
                       this._historyLoadingTimeout = null; // Reset timeout ID
                  }, 1000); // Assume history loaded if no new message for 1 second
             }
        } else {
            // If not loading history (i.e., it's a new message), scroll to bottom
            chatLog.scrollTop = chatLog.scrollHeight;
        }
        // --- End History Loading and Scrolling ---

    } else if (data.type === 'user_list') {
        // --- Handle initial user list ---
        console.log('Initial user list received:', data.users);
        // Clear existing user list (except title)
        const userItems = usersListElement.querySelectorAll('.user-item');
        userItems.forEach(item => item.remove());

        // Populate the list with received users
        data.users.forEach(user => {
            usersInRoom[user.id] = user; // Store user data
            renderUser(user);
        });
        // --- End Handle initial user list ---

    } else if (data.type === 'user_status') {
        // --- Handle user status update ---
        console.log('User status update received:', data);
        // Update user status in stored data and re-render
        if (usersInRoom[data.user_id]) {
            usersInRoom[data.user_id].status = data.status;
            renderUser(usersInRoom[data.user_id]);
        } else {
             // If user not in list, this might be a new user joining.
             // We might need a mechanism to add new users if they weren't in the initial list.
             // For now, just log a warning.
             console.warn('Status update for unknown user ID:', data.user_id);
             // A better approach would be to request a full user list refresh or add the user.
             // For simplicity, if a user joins and wasn't in the initial list, we'll rely on the next user_list message (if implemented) or refresh.
             // Alternatively, modify backend to send full user object on joining/leaving.
             // Let's add the user if not found as a basic approach.
             usersInRoom[data.user_id] = { id: data.user_id, username: data.username, status: data.status };
             renderUser(usersInRoom[data.user_id]);
        }
        // --- End Handle user status update ---

    } else if (data.type === 'message_edited') {
        // --- Handle message edited update ---
        console.log('Message edited received:', data);
        const messageElement = document.querySelector(`[data-message-id="${data.id}"]`);
        if (messageElement) {
             const messageContentElement = messageElement.querySelector('.message-content');
             if (messageContentElement) {
                  messageContentElement.textContent = data.content; // Update content
             }
             // Add or update edited indicator
             let editedSpan = messageElement.querySelector('.message-edited-indicator');
             if (!editedSpan) {
                  editedSpan = document.createElement('span');
                  editedSpan.classList.add('message-edited-indicator');
                  const senderInfoElement = messageElement.querySelector('.message-sender-info');
                  if (senderInfoElement) {
                       senderInfoElement.appendChild(editedSpan);
                  }
             }
              // Format edited time if available
             try {
                  const editDate = new Date(data.edited_at);
                  editedSpan.textContent = ` (edited ${editDate.toLocaleTimeString()})`;
             } catch (error) {
                  editedSpan.textContent = ' (edited)';
             }
        }
        // --- End Handle message edited update ---

    } else if (data.type === 'message_deleted') {
        // --- Handle message deleted update ---
        console.log('Message deleted received:', data);
        const messageElement = document.querySelector(`[data-message-id="${data.id}"]`);
        if (messageElement) {
            messageElement.remove(); // Remove message element from DOM
        }
        // --- End Handle message deleted update ---
    }
    // Add handlers for other message types here (e.g., 'typing')
};

chatSocket.onclose = function(e) {
    console.error('WebSocket connection closed unexpectedly');
    // You might want to display a message to the user or try to reconnect
     const reconnectMessage = document.createElement('div');
     reconnectMessage.textContent = '[System]: Connection lost. Attempting to reconnect...';
     reconnectMessage.style.color = 'red';
     chatLog.appendChild(reconnectMessage);
     chatLog.scrollTop = chatLog.scrollHeight;

    // Simple reconnection attempt after a delay
    setTimeout(function(){
        console.log('Attempting to reconnect...');
        // This basic example doesn't handle complex reconnection logic
        // In a real app, you'd use backoff, check network status etc.
        // window.location.reload(); // Simple but disruptive reconnect
        // Or better: implement proper reconnect logic
    }, 5000); // Try to reconnect after 5 seconds

};

chatSocket.onerror = function(e) {
    console.error('WebSocket error:', e);
     const errorMessage = document.createElement('div');
     errorMessage.textContent = '[System]: WebSocket error occurred.';
     errorMessage.style.color = 'red';
     chatLog.appendChild(errorMessage);
     chatLog.scrollTop = chatLog.scrollHeight;
};

// --- Sending Messages ---

// Send message on form submit
document.getElementById('chat-form').onsubmit = function(e) {
    e.preventDefault(); // Prevent page reload
    const messageInputDom = document.getElementById('chat-message-input');
    const message = messageInputDom.value;
    if (message.trim() === '') return; // Don't send empty messages

    // Send the message as a JSON string
    chatSocket.send(JSON.stringify({
        'content': message,
        'type': 'chat_message' // Send as chat_message type
        // You might add other fields like 'room' or 'sender_id' if needed by your consumer receive logic
    }));

    // Clear the input field
    messageInputDom.value = '';
};

// Send message on Enter key press in the input field
messageInput.onkeyup = function(e) {
    if (e.key === 'Enter') {  // check if the key pressed is 'Enter'
        document.getElementById('chat-form').requestSubmit(); // Trigger form submission
    }
};

// Focus the input field on page load
window.onload = function() {
    messageInput.focus();
}; 