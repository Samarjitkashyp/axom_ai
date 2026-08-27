from django.contrib import admin
from .models import (
    KnowledgeDocument, KnowledgeChunk, QAPair,
    UnansweredQuery, Feedback,
)


@admin.register(UnansweredQuery)
class UnansweredQueryAdmin(admin.ModelAdmin):
    list_display = ('question', 'language', 'count', 'resolved', 'updated_at')
    list_filter = ('resolved', 'language')
    search_fields = ('question',)
    list_editable = ('resolved',)
    ordering = ('-count', '-updated_at')


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('rating', 'question', 'language', 'created_at')
    list_filter = ('rating', 'language')
    search_fields = ('question', 'answer')


@admin.register(QAPair)
class QAPairAdmin(admin.ModelAdmin):
    list_display = ('question', 'has_assamese', 'has_embedding')
    search_fields = ('question', 'answer', 'answer_assamese')

    def has_assamese(self, obj):
        return bool(obj.answer_assamese.strip())
    has_assamese.boolean = True

    def has_embedding(self, obj):
        return bool(obj.embedding)
    has_embedding.boolean = True


admin.site.register(KnowledgeDocument)
