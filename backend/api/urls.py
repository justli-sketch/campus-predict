from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('markets/', views.get_markets, name='get_markets'),
    path('markets/<int:market_id>/bet/', views.place_bet, name='place_bet'),
    path('me/', views.me, name='me'),
    path('markets/<int:market_id>/', views.get_market_detail, name='get_market_detail'),
    path('markets/<int:market_id>/comments/', views.market_comments, name='market_comments'),
    path('markets/<int:market_id>/history/', views.market_history, name='market_history'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('markets/<int:market_id>/resolve/', views.resolve_market),

]