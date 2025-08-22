from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser for local development with predefined credentials'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Partnership number for the superuser (default: admin)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the superuser (default: admin123)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@femfamily.com',
            help='Email for the superuser (default: admin@femfamily.com)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Admin',
            help='First name for the superuser (default: Admin)'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the superuser (default: User)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force creation even if user already exists'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 FEM Family Business Directory - Superuser Creation')
        )
        self.stdout.write('=' * 60)
        
        username = options['username']
        password = options['password']
        email = options['email']
        first_name = options['first_name']
        last_name = options['last_name']
        force = options['force']
        
        # Check if user already exists
        try:
            existing_user = User.objects.get(partnership_number=username)
            if not force:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  User with partnership number "{username}" already exists!')
                )
                self.stdout.write('Use --force to overwrite or choose a different username.')
                return
            else:
                self.stdout.write(f'🔄 Updating existing user: {username}')
                existing_user.delete()
        except User.DoesNotExist:
            pass
        
        try:
            # Create superuser
            user = User.objects.create_superuser(
                partnership_number=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
                user_type='community',
                is_active=True,
                is_verified=True,
                email_verified=True,
                phone_verified=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Superuser created successfully!')
            )
            self.stdout.write(f'📋 Partnership Number: {username}')
            self.stdout.write(f'📋 Password: {password}')
            self.stdout.write(f'📋 Email: {email}')
            self.stdout.write(f'📋 Name: {first_name} {last_name}')
            self.stdout.write(f'📋 User Type: {user.user_type}')
            self.stdout.write(f'📋 Is Staff: {user.is_staff}')
            self.stdout.write(f'📋 Is Superuser: {user.is_superuser}')
            
            self.stdout.write('\n🔑 You can now login to Django admin with these credentials!')
            self.stdout.write(f'🌐 Admin URL: http://localhost:8000/admin/')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to create superuser: {str(e)}')
            )
            raise CommandError(f'Superuser creation failed: {str(e)}')
        
        self.stdout.write('\n🎉 Superuser setup complete!')
