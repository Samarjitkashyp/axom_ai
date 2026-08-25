/**
 * Axom AI Frontend Master JavaScript
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
    let isWebSearchActive = false;

    // ==========================================
    // WORD LIMIT & USAGE COUNTDOWN LOGIC
    // ==========================================
    const MAX_WORDS = 5000;
    const REGEN_RATE_PER_SEC = MAX_WORDS / 86400; // 5000 words in 24 hours (86400 seconds)

    function countWords(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    function getRemainingWords() {
        if (window.isAuthenticated) {
            return MAX_WORDS;
        }
        let remaining = localStorage.getItem('axom_ai_remaining_words');
        let lastUpdate = localStorage.getItem('axom_ai_last_update');
        const now = Date.now();

        if (remaining === null || lastUpdate === null) {
            remaining = MAX_WORDS;
            lastUpdate = now;
            localStorage.setItem('axom_ai_remaining_words', remaining);
            localStorage.setItem('axom_ai_last_update', lastUpdate);
            return remaining;
        }

        remaining = parseFloat(remaining);
        lastUpdate = parseInt(lastUpdate, 10);

        // Calculate regeneration
        const elapsedSecs = Math.max(0, (now - lastUpdate) / 1000);
        const regenerated = elapsedSecs * REGEN_RATE_PER_SEC;
        remaining = Math.min(MAX_WORDS, remaining + regenerated);

        localStorage.setItem('axom_ai_remaining_words', remaining);
        localStorage.setItem('axom_ai_last_update', now);

        return remaining;
    }

    function deductWords(count) {
        if (window.isAuthenticated) {
            return;
        }
        let remaining = getRemainingWords();
        remaining = Math.max(0, remaining - count);
        localStorage.setItem('axom_ai_remaining_words', remaining);
        localStorage.setItem('axom_ai_last_update', Date.now());
        updateUsageUI(remaining);
    }

    function updateUsageUI(remaining) {
        if (window.isAuthenticated) {
            // Update text label
            const usageLabel = document.getElementById('usageLabel');
            if (usageLabel) {
                usageLabel.textContent = 'Words Remaining';
            }

            // Update count to "Unlimited"
            const usageCount = document.getElementById('usageCount');
            if (usageCount) {
                usageCount.textContent = 'Unlimited';
            }

            // Update circular progress bar (gauge)
            const gaugePercent = document.querySelector('.gauge-percent');
            if (gaugePercent) {
                gaugePercent.textContent = '∞';
            }

            const gaugeFill = document.querySelector('.gauge-fill');
            if (gaugeFill) {
                gaugeFill.setAttribute('stroke-dashoffset', 0);
            }

            // Update horizontal bar
            const usageBarFill = document.querySelector('.usage-bar-fill');
            if (usageBarFill) {
                usageBarFill.style.width = '100%';
            }

            // Update countdown timer
            let timerEl = document.getElementById('usageResetTimer');
            if (!timerEl) {
                const usageInfo = document.querySelector('.usage-info');
                if (usageInfo) {
                    timerEl = document.createElement('div');
                    timerEl.id = 'usageResetTimer';
                    timerEl.style.fontSize = '0.72rem';
                    timerEl.style.color = 'var(--text-muted)';
                    timerEl.style.marginTop = '6px';
                    timerEl.style.fontWeight = '500';
                    usageInfo.appendChild(timerEl);
                }
            }

            if (timerEl) {
                timerEl.innerHTML = `Unlimited Access<br><span style="opacity: 0.75; font-size: 0.66rem; display: block; margin-top: 3px; font-weight: 400;">Logged in as Pro user</span>`;
            }
            return;
        }

        const remainingInt = Math.floor(remaining);
        const pct = (remaining / MAX_WORDS) * 100;

        // Update text label
        const usageLabel = document.getElementById('usageLabel');
        if (usageLabel) {
            usageLabel.textContent = 'Words Remaining';
        }

        // Update count
        const usageCount = document.getElementById('usageCount');
        if (usageCount) {
            usageCount.textContent = `${remainingInt.toLocaleString()} / 5,000`;
        }

        // Update circular progress bar (gauge)
        const gaugePercent = document.querySelector('.gauge-percent');
        if (gaugePercent) {
            gaugePercent.textContent = `${Math.round(pct)}%`;
        }

        const gaugeFill = document.querySelector('.gauge-fill');
        if (gaugeFill) {
            const offset = 238.76 * (1 - pct / 100);
            gaugeFill.setAttribute('stroke-dashoffset', offset);
        }

        // Update horizontal bar
        const usageBarFill = document.querySelector('.usage-bar-fill');
        if (usageBarFill) {
            usageBarFill.style.width = `${pct}%`;
        }

        // Update countdown timer
        let timerEl = document.getElementById('usageResetTimer');
        if (!timerEl) {
            const usageInfo = document.querySelector('.usage-info');
            if (usageInfo) {
                timerEl = document.createElement('div');
                timerEl.id = 'usageResetTimer';
                timerEl.style.fontSize = '0.72rem';
                timerEl.style.color = 'var(--text-muted)';
                timerEl.style.marginTop = '6px';
                timerEl.style.fontWeight = '500';
                usageInfo.appendChild(timerEl);
            }
        }

        if (timerEl) {
            timerEl.style.lineHeight = '1.3';
            if (remaining >= MAX_WORDS) {
                timerEl.innerHTML = `Fully Charged<br><span style="opacity: 0.75; font-size: 0.66rem; display: block; margin-top: 3px; font-weight: 400;">Restore in 24 hours. Once 24 hours are completed, you will get 5000 words again.</span>`;
            } else {
                timerEl.innerHTML = `<span style="font-weight: 600; color: var(--text-secondary);">Restoring...</span><br><span style="opacity: 0.75; font-size: 0.66rem; display: block; margin-top: 3px; font-weight: 400;">Restore in 24 hours. Once 24 hours are completed, you will get 5000 words again.</span>`;
            }
        }
    }

    // Set up periodic updates (ticking regeneration and countdown per second)
    setInterval(() => {
        const remaining = getRemainingWords();
        updateUsageUI(remaining);
    }, 1000);

    // Initial load UI update
    updateUsageUI(getRemainingWords());

    // ==========================================
    // LOGIN POPUP MODAL LOGIC
    // ==========================================
    function showLoginModal(title = "Limit Reached", subtitle = "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access.") {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const modalTitleEl = loginModal.querySelector('.modal-title');
            const modalSubtitleEl = loginModal.querySelector('.modal-subtitle');
            
            if (modalTitleEl) modalTitleEl.textContent = title;
            if (modalSubtitleEl) modalSubtitleEl.textContent = subtitle;

            loginModal.classList.remove('hidden');
            const usernameInput = document.getElementById('modalUsername');
            if (usernameInput) usernameInput.focus();
        }
    }

    function hideLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
    }

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideLoginModal);
    }

    const btnUpgrade = document.getElementById('btnUpgrade');
    if (btnUpgrade) {
        btnUpgrade.addEventListener('click', () => {
            showLoginModal("Upgrade to Pro", "Log in to unlock advanced models, plugins, and unlimited words access.");
        });
    }

    // Form Submission
    const loginForm = document.getElementById('modalLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameVal = document.getElementById('modalUsername').value.trim();
            const passwordVal = document.getElementById('modalPassword').value;
            const errorEl = document.getElementById('modalError');
            const submitBtn = loginForm.querySelector('.btn-modal-submit');

            if (errorEl) errorEl.classList.add('hidden');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Signing in...';
            }

            try {
                const res = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: usernameVal,
                        password: passwordVal
                    })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // Success! Refresh page to apply authenticated state
                    window.location.reload();
                } else {
                    if (errorEl) {
                        errorEl.textContent = data.error || 'Invalid credentials.';
                        errorEl.classList.remove('hidden');
                    }
                }
            } catch (err) {
                if (errorEl) {
                    errorEl.textContent = 'Connection error. Please try again.';
                    errorEl.classList.remove('hidden');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In & Continue';
                }
            }
        });
    }

    // Focus / click interception on input area when limit is hit
    if (chatInput) {
        chatInput.addEventListener('focus', () => {
            if (getRemainingWords() <= 0 && !window.isAuthenticated) {
                chatInput.blur();
                showLoginModal("Limit Reached", "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access.");
            }
        });
        chatInput.addEventListener('click', () => {
            if (getRemainingWords() <= 0 && !window.isAuthenticated) {
                chatInput.blur();
                showLoginModal("Limit Reached", "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access.");
            }
        });
    }

    // Web Search button toggle handler
    const btnWebSearch = document.getElementById('btnWebSearch');
    const webSearchStatus = document.getElementById('webSearchStatus');
    if (btnWebSearch) {
        btnWebSearch.addEventListener('click', () => {
            if (!window.isAuthenticated) {
                showLoginModal("Web Search Locked", "Login is required to activate real-time web search. Please sign in to continue.");
                return;
            }
            isWebSearchActive = !isWebSearchActive;
            if (isWebSearchActive) {
                btnWebSearch.classList.add('active');
                if (webSearchStatus) webSearchStatus.textContent = 'Web Search Activated';
            } else {
                btnWebSearch.classList.remove('active');
                if (webSearchStatus) webSearchStatus.textContent = 'Web Search';
            }
        });
    }

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
                    const bubbleTextEl = renderAssistantBubble(msg.text, msg.model || 'Axom AI');
                    if (msg.web_search && msg.sources && msg.sources.length > 0) {
                        renderSourcesList(bubbleTextEl.parentElement, msg.sources);
                    }
                }
            });
        }
        scrollToBottom();
    }

    function loadSessionsFromStorage() {
        try {
            const stored = localStorage.getItem('axom_ai_sessions');
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
            localStorage.setItem('axom_ai_sessions', JSON.stringify(sessions));
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

    function renderAssistantBubble(text, modelDisplay = 'Axom AI') {
        const msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble assistant';
        msgBubble.dataset.rawText = text; // store initial raw text
        msgBubble.innerHTML = `
            <div class="msg-avatar">✦</div>
            <div class="msg-body" style="position: relative; width: 100%;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="font-size: 0.76rem; font-weight: 700; color: var(--accent-pink);">${escapeHTML(modelDisplay)}</div>
                    <button class="btn-copy-msg" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.7rem; font-family: inherit; transition: color 0.2s;" title="Copy to clipboard">
                        <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy</span>
                    </button>
                </div>
                <div class="msg-text-content">${formatMarkdown(text)}</div>
            </div>
        `;

        // Bind copy listener
        const copyBtn = msgBubble.querySelector('.btn-copy-msg');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const rawText = msgBubble.dataset.rawText || '';
                if (!rawText) return;
                navigator.clipboard.writeText(rawText).then(() => {
                    const label = copyBtn.querySelector('span');
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `
                        <svg style="width: 14px; height: 14px; color: #4ade80;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span style="color: #4ade80;">Copied!</span>
                    `;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        }

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
        const targetElement = renderAssistantBubble('', 'Axom AI');
        targetElement.innerHTML = '<span class="typing-dots">Thinking...</span>';

        try {
            const res = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: userQuery,
                    model: currentModel,
                    web_search: isWebSearchActive
                })
            });

            const data = await res.json();

            if (res.ok && data.response) {
                // Deduct AI response words
                const aiWords = countWords(data.response);
                deductWords(aiWords);

                if (data.from_database) {
                    const parentMsg = targetElement.previousElementSibling;
                    if (parentMsg) {
                        parentMsg.innerHTML += ` <span style="display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-left: 6px;">📁 Database Match</span>`;
                    }
                }
                if (currentChatId && sessions[currentChatId]) {
                    sessions[currentChatId].messages.push({
                        role: 'assistant',
                        text: data.response,
                        web_search: data.web_search,
                        sources: data.sources
                    });
                    saveSessionsToStorage();
                }
                typeWriterEffect(targetElement, data.response, () => {
                    if (data.web_search && data.sources && data.sources.length > 0) {
                        renderSourcesList(targetElement.parentElement, data.sources);
                    }
                });
            } else {
                const errMsg = data.error || 'Failed to get response from Gemini AI.';
                targetElement.innerHTML = `<span style="color: #f87171;">⚠️ ${escapeHTML(errMsg)}</span>`;
            }
        } catch (err) {
            targetElement.innerHTML = `<span style="color: #f87171;">⚠️ Connection error: ${escapeHTML(err.message)}</span>`;
        }
    }

    function typeWriterEffect(element, text, callback) {
        element.innerHTML = '';
        let i = 0;
        const formattedText = formatMarkdown(text);
        
        // Store the final raw text on the parent message bubble for copy functionality
        const parentBubble = element.closest('.message-bubble');
        if (parentBubble) {
            parentBubble.dataset.rawText = text;
        }

        const timer = setInterval(() => {
            if (i < formattedText.length) {
                element.innerHTML = formattedText.substring(0, i + 2);
                i += 2;
                scrollToBottom();
            } else {
                clearInterval(timer);
                element.innerHTML = formattedText;
                if (callback) callback();
            }
        }, 6);
    }

    function renderSourcesList(container, sources) {
        if (!container || !sources || sources.length === 0) return;

        // Check if sources list is already rendered
        if (container.querySelector('.web-sources-container')) return;

        const sourcesContainer = document.createElement('div');
        sourcesContainer.className = 'web-sources-container';
        sourcesContainer.style.marginTop = '14px';
        sourcesContainer.style.paddingTop = '10px';
        sourcesContainer.style.borderTop = '1px solid var(--border-color)';
        sourcesContainer.style.display = 'flex';
        sourcesContainer.style.flexDirection = 'column';
        sourcesContainer.style.gap = '8px';
        sourcesContainer.style.animation = 'fadeIn 0.4s ease';

        let linksHTML = '';
        sources.forEach(src => {
            linksHTML += `
                <a href="${escapeHTML(src.uri)}" target="_blank" style="font-size: 0.72rem; color: var(--text-secondary); text-decoration: none; padding: 4px 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent-cyan)'; this.style.color='var(--text-primary)'" onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)'">
                    <svg style="width: 10px; height: 10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    <span>${escapeHTML(src.title)}</span>
                </a>
            `;
        });

        sourcesContainer.innerHTML = `
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 4px;">
                <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>Sources & References</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${linksHTML}
            </div>
        `;
        container.appendChild(sourcesContainer);
        scrollToBottom();
    }


    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // If they are ALREADY out of words when they try to send, show login modal and block.
        if (getRemainingWords() <= 0 && !window.isAuthenticated) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
            showLoginModal("Limit Reached", "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access.");
            return;
        }

        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Deduct prompt words
        const promptWords = countWords(text);
        deductWords(promptWords);

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
        
        // 1. Escape HTML to prevent injection
        let formatted = escapeHTML(text);

        // 2. Headings (Markdown headers like ### or ##)
        formatted = formatted.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
            const level = hashes.length;
            const size = 1.35 - (level - 1) * 0.08;
            return `<h${level} style="margin-top: 14px; margin-bottom: 6px; font-weight: 800; color: var(--text-primary); font-size: ${size}rem; display: block;">${content}</h${level}>`;
        });

        // 3. Horizontal Rules (Markdown lines like ---)
        formatted = formatted.replace(/^(\-\-\-|\*\*\*|\_\_\_)$/gm, '<hr style="border: none; border-top: 1px solid var(--border-color); margin: 16px 0;">');

        // 4. Bold & Italic
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 5. Code blocks (inline code)
        formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');

        // 6. Bullet lists (lines starting with - or *)
        formatted = formatted.replace(/^\s*[\-\*\+]\s+(.*?)$/gm, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 4px; padding-left: 2px;">$1</li>');

        // 7. Numbered lists (lines starting with 1. 2. etc.)
        formatted = formatted.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li style="margin-left: 20px; list-style-type: decimal; margin-bottom: 4px; padding-left: 2px;">$2</li>');

        // 8. Newlines to breaks
        formatted = formatted.replace(/\n\n/g, '<br><br>');
        formatted = formatted.replace(/\n/g, '<br>');

        // 9. Clean up extra line breaks next to list elements or block elements to prevent double spacings
        formatted = formatted.replace(/(<\/li>)<br>/g, '$1');
        formatted = formatted.replace(/(<\/h\d>)<br>/g, '$1');
        formatted = formatted.replace(/(<hr[^>]*>)<br>/g, '$1');

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

    // Left Sidebar User Profile Dropdown Toggle
    const userProfileCard = document.getElementById('userProfileCard');
    const profileDropdown = document.getElementById('profileDropdown');
    const userChevron = document.getElementById('userChevron');

    if (userProfileCard && profileDropdown) {
        userProfileCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = profileDropdown.classList.contains('hidden');
            if (isHidden) {
                profileDropdown.classList.remove('hidden');
                if (userChevron) userChevron.style.transform = 'rotate(180deg)';
            } else {
                profileDropdown.classList.add('hidden');
                if (userChevron) userChevron.style.transform = 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfileCard.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
                if (userChevron) userChevron.style.transform = 'rotate(0deg)';
            }
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

});
