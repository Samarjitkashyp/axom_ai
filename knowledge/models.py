from django.db import models

class KnowledgeDocument(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=50) # 'pdf', 'excel', 'image', 'text'
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.IntegerField(default=0) # size in bytes
    status = models.CharField(max_length=50, default='Processed')
    extracted_text = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.file_type})"

class KnowledgeChunk(models.Model):
    document = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    chunk_index = models.IntegerField(default=0)
    keywords = models.TextField(blank=True)

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.title}"

class QAPair(models.Model):
    """
    Exact question -> answer pairs (from JSONL / Q&A files). Used by the
    'Instant Answer' layer to return a stored answer immediately, without
    invoking the language model.
    """
    document = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name='qa_pairs')
    question = models.TextField()
    answer = models.TextField()
    # Optional verified Assamese-script answer. When present it is used directly for
    # Assamese replies; otherwise the answer is translated on the fly.
    answer_assamese = models.TextField(blank=True)
    # Semantic vector (JSON list of floats) from the Gemini embedding API — lets us
    # match a question by MEANING, not just shared keywords.
    embedding = models.TextField(blank=True)

    def __str__(self):
        return f"Q&A: {self.question[:50]}"


class ChatSession(models.Model):
    """A saved chat conversation, keyed by the browser's Django session (works for
    anonymous users) plus the frontend-generated client id."""
    session_key = models.CharField(max_length=64, db_index=True)
    client_id = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=200, default='New Chat')
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('session_key', 'client_id')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.client_id})"


class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=16)  # 'user' | 'assistant'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class UnansweredQuery(models.Model):
    """A question the knowledge base could not answer — a gap to fill so the
    bot (especially in Assamese) keeps improving."""
    question = models.TextField()
    language = models.CharField(max_length=16, default='hinglish')
    count = models.IntegerField(default=1)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"[{self.count}x] {self.question[:60]}"


class Feedback(models.Model):
    """👍 / 👎 on an answer — surfaces bad/weak answers to fix in the KB."""
    question = models.TextField()
    answer = models.TextField(blank=True)
    rating = models.CharField(max_length=8)  # 'up' | 'down'
    language = models.CharField(max_length=16, default='hinglish')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}: {self.question[:50]}"
