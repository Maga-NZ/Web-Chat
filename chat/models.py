from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    room = models.CharField(max_length=255, default="general")
    username = models.CharField(max_length=100, default="Anonymous")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp:%H:%M}] {self.username}: {self.content}"