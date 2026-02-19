from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Profile, Market, Bet
from django.utils import timezone


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    Profile.objects.create(user=user)

    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_markets(request):
    markets = Market.objects.filter(status='open').order_by('-created_at')
    data = []
    for m in markets:
        total = m.yes_pool + m.no_pool
        yes_prob = round((m.yes_pool / total) * 100) if total > 0 else 50
        data.append({
            'id': m.id,
            'title': m.title,
            'description': m.description,
            'yes_prob': yes_prob,
            'yes_pool': m.yes_pool,
            'no_pool': m.no_pool,
            'closes_at': m.closes_at,
            'creator': m.creator.username,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bet(request, market_id):
    try:
        market = Market.objects.get(id=market_id, status='open')
    except Market.DoesNotExist:
        return Response({'error': 'Market not found'}, status=status.HTTP_404_NOT_FOUND)

    if market.closes_at <= timezone.now():
        market.status = 'closed'
        market.save()
        return Response({'error': 'Market is closed'}, status=status.HTTP_400_BAD_REQUEST)

    profile = Profile.objects.get(user=request.user)

    points_raw = request.data.get('points', 0)
    choice = request.data.get('choice')

    if choice not in ['yes', 'no']:
        return Response({'error': 'choice must be "yes" or "no"'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        points = int(points_raw)
    except (TypeError, ValueError):
        return Response({'error': 'Invalid points'}, status=status.HTTP_400_BAD_REQUEST)

    if points <= 0:
        return Response({'error': 'Invalid points'}, status=status.HTTP_400_BAD_REQUEST)

    if profile.points_balance < points:
        return Response({'error': 'Not enough points'}, status=status.HTTP_400_BAD_REQUEST)

    profile.points_balance -= points
    profile.save()

    if choice == 'yes':
        market.yes_pool += points
    else:
        market.no_pool += points
    market.save()

    yes_prob = _calc_yes_prob(market.yes_pool, market.no_pool)
    MarketSnapshot.objects.create(
        market=market,
        yes_pool=market.yes_pool,
        no_pool=market.no_pool,
        yes_prob=yes_prob,
)


    Bet.objects.create(user=request.user, market=market, choice=(choice == 'yes'), points=points)

    return Response({'message': 'Bet placed!', 'new_balance': profile.points_balance})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    profile = Profile.objects.get(user=request.user)
    return Response({
        'username': request.user.username,
        'points_balance': profile.points_balance,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_market_detail(request, market_id):
    try:
        m = Market.objects.get(id=market_id)
    except Market.DoesNotExist:
        return Response({'error': 'Market not found'}, status=status.HTTP_404_NOT_FOUND)

    total = m.yes_pool + m.no_pool
    yes_prob = round((m.yes_pool / total) * 100) if total > 0 else 50

    return Response({
        'id': m.id,
        'title': m.title,
        'description': m.description,
        'yes_prob': yes_prob,
        'yes_pool': m.yes_pool,
        'no_pool': m.no_pool,
        'closes_at': m.closes_at,
        'creator': m.creator.username,
        'status': m.status,
    })
from django.db.models import Sum
from django.utils import timezone
from .models import Comment, MarketSnapshot

def _calc_yes_prob(yes_pool, no_pool):
    total = yes_pool + no_pool
    return round((yes_pool / total) * 100) if total > 0 else 50


@api_view(['GET'])
@permission_classes([AllowAny])
def market_history(request, market_id):
    try:
        market = Market.objects.get(id=market_id)
    except Market.DoesNotExist:
        return Response({'error': 'Market not found'}, status=status.HTTP_404_NOT_FOUND)

    snaps = market.snapshots.order_by('created_at')[:500]
    data = [{
        't': s.created_at,
        'yes_prob': s.yes_prob,
        'yes_pool': s.yes_pool,
        'no_pool': s.no_pool,
    } for s in snaps]
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def market_comments(request, market_id):
    try:
        market = Market.objects.get(id=market_id)
    except Market.DoesNotExist:
        return Response({'error': 'Market not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = Comment.objects.filter(market=market).order_by('-created_at')[:200]
        return Response([{
            'id': c.id,
            'user': c.user.username,
            'text': c.text,
            'created_at': c.created_at,
        } for c in comments])

    # POST: require auth
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    text = (request.data.get('text') or '').strip()
    if not text:
        return Response({'error': 'Comment cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    c = Comment.objects.create(user=request.user, market=market, text=text)
    return Response({
        'id': c.id,
        'user': c.user.username,
        'text': c.text,
        'created_at': c.created_at,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    # total points bet by user (simple metric for now)
    rows = (Bet.objects
            .values('user__username')
            .annotate(total_bet=Sum('points'))
            .order_by('-total_bet')[:50])

    return Response([{
        'username': r['user__username'],
        'total_bet': r['total_bet'] or 0
    } for r in rows])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_market(request, market_id):
    try:
        market = Market.objects.get(id=market_id)
    except Market.DoesNotExist:
        return Response({'error': 'Market not found'}, status=status.HTTP_404_NOT_FOUND)

    # only admin or creator can resolve
    if not (request.user.is_staff or request.user == market.creator):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    outcome = request.data.get('outcome')
    if outcome not in ['yes', 'no']:
        return Response({'error': 'outcome must be "yes" or "no"'}, status=status.HTTP_400_BAD_REQUEST)

    if market.status == 'resolved':
        return Response({'error': 'Market already resolved'}, status=status.HTTP_400_BAD_REQUEST)

    market.status = 'resolved'
    market.outcome = (outcome == 'yes')
    market.save()

    # payout: winners split total pool proportional to their stake
    total_pool = market.yes_pool + market.no_pool
    winner_is_yes = (outcome == 'yes')
    winner_pool = market.yes_pool if winner_is_yes else market.no_pool

    if winner_pool <= 0:
        return Response({'message': 'Resolved (no winners to pay).'}, status=status.HTTP_200_OK)

    winning_bets = Bet.objects.filter(market=market, choice=winner_is_yes)
    for b in winning_bets:
        share = b.points / winner_pool
        payout = int(share * total_pool)
        prof = Profile.objects.get(user=b.user)
        prof.points_balance += payout
        prof.save()

    return Response({'message': 'Market resolved and payouts distributed!'})
