from django.core.management.base import BaseCommand
from business.models import FEMChurch

class Command(BaseCommand):
    help = 'Seed FEM Churches and Branches'

    def handle(self, *args, **kwargs):
        self.stdout.write("🏛️ Seeding FEM Churches and Branches...")
        
        # Clear existing churches
        FEMChurch.objects.all().delete()
        
        # Initial FEM Churches/Branches data
        churches_data = [
            {
                'name': 'FEM Central Nairobi',
                'location': 'Nairobi CBD',
                'country': 'Kenya',
                'city': 'Nairobi',
                'pastor_name': 'Pastor James Maina',
                'contact_phone': '+254700123456',
                'contact_email': 'central@fem.or.ke',
                'sort_order': 1
            },
            {
                'name': 'FEM Westlands',
                'location': 'Westlands Shopping Centre',
                'country': 'Kenya',
                'city': 'Nairobi',
                'pastor_name': 'Pastor Grace Wanjiku',
                'contact_phone': '+254700123457',
                'contact_email': 'westlands@fem.or.ke',
                'sort_order': 2
            },
            {
                'name': 'FEM Eastlands',
                'location': 'Embakasi Area',
                'country': 'Kenya',
                'city': 'Nairobi',
                'pastor_name': 'Pastor Peter Kiprotich',
                'contact_phone': '+254700123458',
                'contact_email': 'eastlands@fem.or.ke',
                'sort_order': 3
            },
            {
                'name': 'FEM Mombasa',
                'location': 'Mombasa Island',
                'country': 'Kenya',
                'city': 'Mombasa',
                'pastor_name': 'Pastor Sarah Mwalimu',
                'contact_phone': '+254700123459',
                'contact_email': 'mombasa@fem.or.ke',
                'sort_order': 4
            },
            {
                'name': 'FEM Kisumu',
                'location': 'Kisumu Town',
                'country': 'Kenya',
                'city': 'Kisumu',
                'pastor_name': 'Pastor David Ochieng',
                'contact_phone': '+254700123460',
                'contact_email': 'kisumu@fem.or.ke',
                'sort_order': 5
            },
            {
                'name': 'FEM Nakuru',
                'location': 'Nakuru Town',
                'country': 'Kenya',
                'city': 'Nakuru',
                'pastor_name': 'Pastor Mary Njeri',
                'contact_phone': '+254700123461',
                'contact_email': 'nakuru@fem.or.ke',
                'sort_order': 6
            },
            {
                'name': 'FEM Eldoret',
                'location': 'Eldoret Town',
                'country': 'Kenya',
                'city': 'Eldoret',
                'pastor_name': 'Pastor John Keter',
                'contact_phone': '+254700123462',
                'contact_email': 'eldoret@fem.or.ke',
                'sort_order': 7
            },
            {
                'name': 'FEM Thika',
                'location': 'Thika Town',
                'country': 'Kenya',
                'city': 'Thika',
                'pastor_name': 'Pastor Ruth Wambui',
                'contact_phone': '+254700123463',
                'contact_email': 'thika@fem.or.ke',
                'sort_order': 8
            },
            {
                'name': 'FEM Machakos',
                'location': 'Machakos Town',
                'country': 'Kenya',
                'city': 'Machakos',
                'pastor_name': 'Pastor Joseph Mutiso',
                'contact_phone': '+254700123464',
                'contact_email': 'machakos@fem.or.ke',
                'sort_order': 9
            },
            {
                'name': 'FEM Meru',
                'location': 'Meru Town',
                'country': 'Kenya',
                'city': 'Meru',
                'pastor_name': 'Pastor Elizabeth Kobia',
                'contact_phone': '+254700123465',
                'contact_email': 'meru@fem.or.ke',
                'sort_order': 10
            }
        ]

        created_count = 0
        for church_data in churches_data:
            church = FEMChurch.objects.create(**church_data)
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created church: {church.name}")
            )
        
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Successfully created {created_count} FEM Churches!")
        )