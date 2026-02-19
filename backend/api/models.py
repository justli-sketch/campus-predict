from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    points_balance = models.IntegerField(default=1000)
    school_email = models.EmailField(blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.points_balance} points"

class Market(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('resolved', 'Resolved'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    outcome = models.BooleanField(null=True, blank=True)
    yes_pool = models.FloatField(default=0)
    no_pool = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    closes_at = models.DateTimeField()

    def __str__(self):
        return self.title

class Bet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    market = models.ForeignKey(Market, on_delete=models.CASCADE)
    choice = models.BooleanField()
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.market.title} - {'YES' if self.choice else 'NO'}"

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    market = models.ForeignKey(Market, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.market.title}"

class MarketSnapshot(models.Model):
    market = models.ForeignKey(Market, on_delete=models.CASCADE, related_name='snapshots')
    yes_pool = models.FloatField()
    no_pool = models.FloatField()
    yes_prob = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Snapshot {self.market.id} @ {self.created_at}"
