/**
 * NovaAI Frontend Master JavaScript
 * Handles real-time chat interactions, Gemini API calls, sidebar toggles, and dynamic session management.
 */

document.addEventListener('DOMContentLoaded', () => {

    // DOM Element References
    const sidebarLeft = document.getElementById('sidebarLeft');
    const sidebarRight = document.getElementById('sidebarRight');
    const toggleLeftBtn = document.getElementById('toggleLeftSidebar');
    const toggleRightBtn = document.getElementById('toggleRightSidebar');
    
    const heroContainer = document.getElementById('heroContainer');
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const recentChatsList = document.getElementById('recentChatsList');
    const chatInput = document.getElementById('chatInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnNewChat = document.getElementById('btnNewChat');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    let currentModel = 'gemini-flash-latest';
    let isChatActive = false;
    let currentChatId = null;
    let sessions = {}; // Map of sessionId -> { id, title, time, messages: [] }

    // Load saved sessions from localStorage
    loadSessionsFromStorage();

    // ==========================================
    // 1. SIDEBAR TOGGLE HANDLERS
    // ==========================================
    if (toggleLeftBtn && sidebarLeft) {
        toggleLeftBtn.addEventListener('click', () => {
            sidebarLeft.classList.toggle('collapsed');
        });
    }

    if (toggleRightBtn && sidebarRight) {
        toggleRightBtn.addEventListener('click', () => {
            sidebarRight.classList.toggle('collapsed');
        });
    }

    function checkWindowSize() {
        if (window.innerWidth < 1100 && sidebarRight) {
            sidebarRight.classList.add('collapsed');
        } else if (sidebarRight) {
            sidebarRight.classList.remove('collapsed');
        }
        if (window.innerWidth < 850 && sidebarLeft) {
            sidebarLeft.classList.add('collapsed');
        }
    }
    window.addEventListener('resize', checkWindowSize);

    // ==========================================
    // 2. DYNAMIC SESSION & RECENT CHATS MANAGEMENT
    // ==========================================
    function createNewSession(firstPromptText) {
        const sessionId = 'chat_' + Date.now();
        const shortTitle = truncateText(firstPromptText, 28);
        
        sessions[sessionId] = {
            id: sessionId,
            title: shortTitle,
            time: 'Just now',
            messages: []
        };
        
        currentChatId = sessionId;

        // Create DOM element for Left Sidebar
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-history-item active';
        chatItem.dataset.chatId = sessionId;
        chatItem.innerHTML = `
            <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span class="chat-title">${escapeHTML(shortTitle)}</span>
            <span class="chat-time">Just now</span>
        `;

        // De-activate existing items and prepend new one
        document.querySelectorAll('.chat-history-item').forEach(item => item.classList.remove('active'));
        recentChatsList.insertBefore(chatItem, recentChatsList.firstChild);

        // Bind click listener to new item
        chatItem.addEventListener('click', () => switchSession(sessionId));

        saveSessionsToStorage();
        return sessionId;
    }

    function switchSession(sessionId) {
        currentChatId = sessionId;
        const session = sessions[sessionId];

        // Update active class in sidebar
        document.querySelectorAll('.chat-history-item').forEach(item => {
            if (item.dataset.chatId === sessionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Clear and render messages for this session
        isChatActive = true;
        heroContainer.style.display = 'none';
        chatMessagesContainer.classList.remove('hidden');
        chatMessagesContainer.innerHTML = '';

        if (session && session.messages) {
            session.messages.forEach(msg => {
                if (msg.role === 'user') {
                    renderUserBubble(msg.text);
                } else {
                    renderAssistantBubble(msg.text, msg.model || 'NovaAI Gemini');
                }
            });
        }
        scrollToBottom();
    }

    function loadSessionsFromStorage() {
        try {
            const stored = localStorage.getItem('nova_ai_sessions');
            if (stored) {
                sessions = JSON.parse(stored);
                // Re-render recent chats list from storage
                recentChatsList.innerHTML = '';
                Object.values(sessions).reverse().forEach(sess => {
                    const chatItem = document.createElement('div');
                    chatItem.className = 'chat-history-item';
                    chatItem.dataset.chatId = sess.id;
                    chatItem.innerHTML = `
                        <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span class="chat-title">${escapeHTML(sess.title)}</span>
                        <span class="chat-time">${escapeHTML(sess.time || '1h ago')}</span>
                    `;
                    chatItem.addEventListener('click', () => switchSession(sess.id));
                    recentChatsList.appendChild(chatItem);
                });
            }
        } catch (e) {
            console.error("Could not load sessions from localStorage:", e);
        }
    }

    function saveSessionsToStorage() {
        try {
            localStorage.setItem('nova_ai_sessions', JSON.stringify(sessions));
        } catch (e) {
            console.error("Could not save sessions to localStorage:", e);
        }
    }

    // ==========================================
    // 3. CHAT ENGINE & MESSAGE RENDERING
    // ==========================================
    function triggerChatMode() {
        if (!isChatActive) {
            isChatActive = true;
            heroContainer.style.display = 'none';
            chatMessagesContainer.classList.remove('hidden');
        }
    }

    function renderUserBubble(text) {
        const msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble user';
        msgBubble.innerHTML = `
            <div class="msg-body">${escapeHTML(text)}</div>
            <div class="msg-avatar">SK</div>
        `;
        chatMessagesContainer.appendChild(msgBubble);
        scrollToBottom();
    }

    function renderAssistantBubble(text, modelDisplay = 'NovaAI Gemini') {
        const msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble assistant';
        msgBubble.innerHTML = `
            <div class="msg-avatar">✦</div>
            <div class="msg-body">
                <div style="font-size: 0.76rem; font-weight: 700; color: var(--accent-pink); margin-bottom: 4px;">${escapeHTML(modelDisplay)}</div>
                <div class="msg-text-content">${formatMarkdown(text)}</div>
            </div>
        `;
        chatMessagesContainer.appendChild(msgBubble);
        scrollToBottom();
        return msgBubble.querySelector('.msg-text-content');
    }

    function appendUserMessage(text) {
        triggerChatMode();

        // Create new session if none is active
        if (!currentChatId) {
            createNewSession(text);
        }

        // Store user message
        if (sessions[currentChatId]) {
            sessions[currentChatId].messages.push({ role: 'user', text: text });
            saveSessionsToStorage();
        }

        renderUserBubble(text);
    }

    async function generateAIResponse(userQuery) {
        const targetElement = renderAssistantBubble('', 'NovaAI Gemini');
        targetElement.innerHTML = '<span class="typing-dots">Thinking...</span>';

        try {
            const res = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: userQuery,
                    model: currentModel
                })
            });

            const data = await res.json();

            if (res.ok && data.response) {
                // Store assistant response in session
                if (currentChatId && sessions[currentChatId]) {
                    sessions[currentChatId].messages.push({ role: 'assistant', text: data.response });
                    saveSessionsToStorage();
                }
                typeWriterEffect(targetElement, data.response);
            } else {
                const errMsg = data.error || 'Failed to get response from Gemini AI.';
                targetElement.innerHTML = `<span style="color: #f87171;">⚠️ ${escapeHTML(errMsg)}</span>`;
            }
        } catch (err) {
            targetElement.innerHTML = `<span style="color: #f87171;">⚠️ Connection error: ${escapeHTML(err.message)}</span>`;
        }
    }

    function typeWriterEffect(element, text) {
        element.innerHTML = '';
        let i = 0;
        const formattedText = formatMarkdown(text);
        
        const timer = setInterval(() => {
            if (i < formattedText.length) {
                element.innerHTML = formattedText.substring(0, i + 1);
                i++;
                scrollToBottom();
            } else {
                clearInterval(timer);
                element.innerHTML = formattedText;
            }
        }, 12);
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';

        appendUserMessage(text);
        generateAIResponse(text);
    }

    // Event Listeners for Input & Sending
    btnSendMessage.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-expand textarea height
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // Reset to New Chat
    btnNewChat.addEventListener('click', () => {
        currentChatId = null;
        isChatActive = false;
        document.querySelectorAll('.chat-history-item').forEach(i => i.classList.remove('active'));
        chatMessagesContainer.innerHTML = '';
        chatMessagesContainer.classList.add('hidden');
        heroContainer.style.display = 'flex';
        chatInput.value = '';
        chatInput.focus();
    });


    // ==========================================
    // 4. HELPER UTILITIES & FORMATTING
    // ==========================================
    function scrollToBottom() {
        const mainBody = document.getElementById('mainBody');
        if (mainBody) {
            mainBody.scrollTop = mainBody.scrollHeight;
        }
    }

    function truncateText(str, maxLength) {
        if (!str) return 'New Chat';
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }

    function formatMarkdown(text) {
        if (!text) return '';
        let formatted = escapeHTML(text);
        formatted = formatted.replace(/\n\n/g, '<br><br>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;">$1</code>');
        return formatted;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Keyboard Shortcut (⌘K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            chatInput.focus();
        }
    });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

});
