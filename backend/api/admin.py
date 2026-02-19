from django.contrib import admin
from .models import Profile, Market, Bet, Comment, MarketSnapshot

admin.site.register(Profile)
admin.site.register(Market)
admin.site.register(Bet)
admin.site.register(Comment)
admin.site.register(MarketSnapshot)
