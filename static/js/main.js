/**
 * NovaAI Frontend Master JavaScript
 * Handles chat interactions, model switching, sidebar toggles, and responsive state.
 */

document.addEventListener('DOMContentLoaded', () => {

    // DOM Element References
    const sidebarLeft = document.getElementById('sidebarLeft');
    const sidebarRight = document.getElementById('sidebarRight');
    const toggleLeftBtn = document.getElementById('toggleLeftSidebar');
    const toggleRightBtn = document.getElementById('toggleRightSidebar');
    
    const heroContainer = document.getElementById('heroContainer');
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const chatInput = document.getElementById('chatInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnNewChat = document.getElementById('btnNewChat');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    const modelTabs = document.querySelectorAll('.model-tab[data-model]');
    const modelItems = document.querySelectorAll('.model-item[data-model]');
    const promptPills = document.querySelectorAll('.prompt-pill-btn');
    const actionCards = document.querySelectorAll('.action-card');
    const historyItems = document.querySelectorAll('.chat-history-item');

    let currentModel = 'gpt-4o';
    let isChatActive = false;

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

    // Responsive Auto-Collapse on small screens
    function checkWindowSize() {
        if (window.innerWidth < 1100) {
            sidebarRight.classList.add('collapsed');
        } else {
            sidebarRight.classList.remove('collapsed');
        }
        if (window.innerWidth < 850) {
            sidebarLeft.classList.add('collapsed');
        }
    }
    window.addEventListener('resize', checkWindowSize);

    // ==========================================
    // 2. MODEL SWITCHER SYNC (Bidirectional)
    // ==========================================
    function setActiveModel(modelKey) {
        currentModel = modelKey;

        // Header tabs
        modelTabs.forEach(tab => {
            if (tab.dataset.model === modelKey) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Right panel models list
        modelItems.forEach(item => {
            const check = item.querySelector('.model-check');
            if (item.dataset.model === modelKey) {
                item.classList.add('active');
                if (check) check.classList.remove('hidden');
            } else {
                item.classList.remove('active');
                if (check) check.classList.add('hidden');
            }
        });
    }

    modelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveModel(tab.dataset.model);
        });
    });

    modelItems.forEach(item => {
        item.addEventListener('click', () => {
            setActiveModel(item.dataset.model);
        });
    });

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

    function appendUserMessage(text) {
        triggerChatMode();
        const msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble user';
        msgBubble.innerHTML = `
            <div class="msg-body">${escapeHTML(text)}</div>
            <div class="msg-avatar">SK</div>
        `;
        chatMessagesContainer.appendChild(msgBubble);
        scrollToBottom();
    }

    function appendAssistantMessage(initialText = '') {
        const msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble assistant';
        
        const modelNameDisplay = getModelDisplayName(currentModel);

        msgBubble.innerHTML = `
            <div class="msg-avatar">✦</div>
            <div class="msg-body">
                <div style="font-size: 0.76rem; font-weight: 700; color: var(--accent-pink); margin-bottom: 4px;">${modelNameDisplay}</div>
                <div class="msg-text-content">${initialText}</div>
            </div>
        `;
        chatMessagesContainer.appendChild(msgBubble);
        scrollToBottom();
        return msgBubble.querySelector('.msg-text-content');
    }

    function generateAIResponse(userQuery) {
        const targetElement = appendAssistantMessage('<span class="typing-dots">Thinking...</span>');

        setTimeout(() => {
            const responses = {
                'explain quantum computing in simple terms': `Quantum computing leverages quantum mechanics principles like **superposition** and **entanglement** to perform complex calculations exponentially faster than classical computers.\n\nKey Concepts:\n• **Qubits**: Unlike binary bits (0 or 1), qubits can exist in a state of 0, 1, or both simultaneously.\n• **Superposition**: Enables parallel processing across vast combinations of data.\n• **Entanglement**: Qubits interlink, allowing instantaneous correlation across the system.`,
                'write a python function to sort a list': `Here is a clean Python function implementing QuickSort:\n\n\`\`\`python\ndef quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\n# Example usage:\nnumbers = [3, 6, 8, 10, 1, 2, 1]\nprint(quicksort(numbers)) # [1, 1, 2, 3, 6, 8, 10]\n\`\`\``,
                'default': `Here is a comprehensive breakdown for **"${userQuery}"** using **${getModelDisplayName(currentModel)}**:\n\n1. **Core Strategy**: Define precise requirements and establish an intuitive framework.\n2. **Execution Steps**: Implement optimized logic with dark-mode aesthetic styling and real-time processing.\n3. **Optimization**: Ensure responsive rendering across all viewports and device sizes.`
            };

            const queryKey = userQuery.toLowerCase().trim();
            const responseContent = responses[queryKey] || responses['default'];

            typeWriterEffect(targetElement, responseContent);
        }, 800);
    }

    function typeWriterEffect(element, text) {
        element.innerHTML = '';
        let i = 0;
        const formattedText = text.replace(/\n/g, '<br>');
        
        const timer = setInterval(() => {
            if (i < formattedText.length) {
                // handle HTML tags gracefully
                if (formattedText.substring(i, i + 4) === '<br>') {
                    element.innerHTML += '<br>';
                    i += 4;
                } else {
                    element.innerHTML += formattedText.charAt(i);
                    i++;
                }
                scrollToBottom();
            } else {
                clearInterval(timer);
            }
        }, 15);
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

    // ==========================================
    // 4. PROMPT PILLS & QUICK ACTION CARDS
    // ==========================================
    promptPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const promptText = pill.dataset.prompt || pill.querySelector('span').innerText;
            appendUserMessage(promptText);
            generateAIResponse(promptText);
        });
    });

    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const actionText = card.dataset.action;
            chatInput.value = actionText;
            chatInput.focus();
        });
    });

    // Reset to New Chat
    btnNewChat.addEventListener('click', () => {
        isChatActive = false;
        chatMessagesContainer.innerHTML = '';
        chatMessagesContainer.classList.add('hidden');
        heroContainer.style.display = 'flex';
        chatInput.value = '';
        chatInput.focus();
    });

    // Recent History Item Click
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            historyItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const title = item.querySelector('.chat-title').innerText;
            
            isChatActive = false;
            chatMessagesContainer.innerHTML = '';
            appendUserMessage(title);
            generateAIResponse(title);
        });
    });

    // ==========================================
    // 5. HELPER UTILITIES & KEYBOARD SHORTCUTS
    // ==========================================
    function getModelDisplayName(key) {
        const names = {
            'gpt-4o': 'GPT-4o',
            'claude-3.5': 'Claude 3.5 Sonnet',
            'deepseek-v3': 'DeepSeek V3',
            'gemini-1.5': 'Gemini 1.5 Pro',
            'llama-3': 'Llama 3 70B'
        };
        return names[key] || 'NovaAI Pro';
    }

    function scrollToBottom() {
        const mainBody = document.getElementById('mainBody');
        if (mainBody) {
            mainBody.scrollTop = mainBody.scrollHeight;
        }
    }

    function escapeHTML(str) {
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

    // Theme Toggle Placeholder Notice
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

});
