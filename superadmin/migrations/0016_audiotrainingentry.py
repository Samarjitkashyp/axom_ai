from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0015_contactmessage'),
    ]

    operations = [
        migrations.CreateModel(
            name='AudioTrainingEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.CharField(choices=[('number_word', 'Number word (voice typing: word → digits)'), ('transcript_fix', 'Voice typing correction (heard → correct)'), ('pronunciation', 'Pronunciation (written → how it is read aloud)')], db_index=True, max_length=20)),
                ('source', models.CharField(help_text='The word as it is heard / written', max_length=200)),
                ('target', models.CharField(help_text='What it becomes: digits for a number word, the right text otherwise', max_length=200)),
                ('note', models.CharField(blank=True, default='', max_length=200)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['kind', 'source'],
                'unique_together': {('kind', 'source')},
            },
        ),
    ]
