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
    # Semantic vector (JSON list of floats) from the Gemini embedding API — lets us
    # match a question by MEANING, not just shared keywords.
    embedding = models.TextField(blank=True)

    def __str__(self):
        return f"Q&A: {self.question[:50]}"
