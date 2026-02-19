from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Market

class Command(BaseCommand):
    help = "Close markets whose closes_at has passed"

    def handle(self, *args, **options):
        now = timezone.now()
        qs = Market.objects.filter(status='open', closes_at__lte=now)
        count = qs.update(status='closed')
        self.stdout.write(self.style.SUCCESS(f"Closed {count} markets"))
