/**
 * NovaAI Admin Panel JavaScript
 * Handles drag-and-drop file ingestion and document management APIs.
 */

document.addEventListener('DOMContentLoaded', () => {

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const docsTableBody = document.getElementById('docsTableBody');
    const statDocCount = document.getElementById('statDocCount');
    const statChunkCount = document.getElementById('statChunkCount');

    if (!dropzone || !fileInput) return;

    // Trigger File Picker on Dropzone Click
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag Over & Leave Styling
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Handle Drop Event
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleFileUploads(files);
        }
    });

    // Handle File Input Selection
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files && fileInput.files.length > 0) {
            handleFileUploads(fileInput.files);
        }
    });

    // Upload Files via AJAX to /api/upload/
    async function handleFileUploads(files) {
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Show uploading UI feedback
                const origSubtitle = dropzone.querySelector('.upload-subtitle').innerText;
                dropzone.querySelector('.upload-subtitle').innerText = `Uploading and extracting text from "${file.name}"...`;

                const res = await fetch('/api/upload/', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();

                dropzone.querySelector('.upload-subtitle').innerText = origSubtitle;

                if (res.ok && data.success) {
                    addDocumentRowToTable(data.document);
                    updateStatsCounters();
                } else {
                    alert(`Upload failed for ${file.name}: ` + (data.error || 'Unknown error'));
                }
            } catch (err) {
                alert(`Network error uploading ${file.name}: ` + err.message);
            }
        }
        fileInput.value = '';
    }

    function addDocumentRowToTable(doc) {
        const emptyRow = document.getElementById('emptyRow');
        if (emptyRow) emptyRow.remove();

        const tr = document.createElement('tr');
        tr.id = `docRow_${doc.id}`;

        const typeClass = `type-${doc.file_type}`;
        const typeShort = doc.file_type ? doc.file_type.substring(0, 3).toUpperCase() : 'DOC';

        tr.innerHTML = `
            <td>
                <div class="file-name-cell">
                    <div class="file-type-icon ${typeClass}">${typeShort}</div>
                    <span>${escapeHTML(doc.title)}</span>
                </div>
            </td>
            <td><span class="type-tag">${escapeHTML(doc.file_type.toUpperCase())}</span></td>
            <td style="color: var(--text-secondary);">${doc.uploaded_at}</td>
            <td style="color: var(--text-secondary);">${doc.file_size}</td>
            <td>
                <span class="status-badge">
                    <span>●</span> ${doc.status}
                </span>
            </td>
            <td>
                <button class="btn-delete-doc" onclick="deleteDocument(${doc.id})">Delete</button>
            </td>
        `;

        docsTableBody.insertBefore(tr, docsTableBody.firstChild);
    }

    function updateStatsCounters() {
        if (statDocCount) {
            const current = parseInt(statDocCount.innerText) || 0;
            statDocCount.innerText = current + 1;
        }
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

});

// Global Delete Document Function
async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document and remove its knowledge from AI memory?')) {
        return;
    }

    try {
        const res = await fetch(`/api/delete-document/${docId}/`, {
            method: 'POST'
        });

        const data = await res.json();
        if (res.ok && data.success) {
            const row = document.getElementById(`docRow_${docId}`);
            if (row) row.remove();

            const statDocCount = document.getElementById('statDocCount');
            if (statDocCount) {
                const current = parseInt(statDocCount.innerText) || 0;
                statDocCount.innerText = Math.max(0, current - 1);
            }
        } else {
            alert('Failed to delete document: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        alert('Network error deleting document: ' + err.message);
    }
}
