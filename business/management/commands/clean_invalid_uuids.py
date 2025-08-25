import sys
from django.core.management.base import BaseCommand
from django.db import connection, transaction


class Command(BaseCommand):
    help = "Detect and delete rows with invalid UUID primary keys in business-related tables."

    def handle(self, *args, **options):
        vendor = connection.vendor
        if vendor == 'postgresql':
            length_expr = "length(id::text)"
        elif vendor == 'sqlite':
            length_expr = "length(id)"
        else:
            self.stderr.write(self.style.WARNING(
                f"Unsupported DB vendor '{vendor}'. Falling back to scanning with a generic query."
            ))
            length_expr = "length(id)"

        # Tables grouped from most dependent to least (children first)
        dependent_tables = [
            # Tables referencing business, service, or product
            'business_reviewlike',
            'business_businesslike',
            'business_productreview',
            'business_servicereview',
            'business_favorite',
            'business_photorequest',
            'business_businesshour',
            # Direct children
            'business_service',
            'business_product',
            'business_review',
            'business_servicereview',
            'business_productreview',
        ]
        root_tables = [
            'business_business',
        ]

        total_deleted = 0

        def run_cleanup(cursor):
            nonlocal total_deleted
            # First, delete dependent rows with invalid primary keys
            for table in dependent_tables:
                try:
                    delete_sql = f"DELETE FROM {table} WHERE {length_expr} <> 36"
                    cursor.execute(delete_sql)
                    deleted = cursor.rowcount
                    if deleted:
                        total_deleted += deleted
                        self.stdout.write(self.style.WARNING(f"{table}: deleted {deleted} invalid row(s)"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Failed cleaning table {table}: {e}"))

            # Also delete rows where foreign key columns have invalid lengths
            fk_rules = [
                ("business_service", "business_id"),
                ("business_product", "business_id"),
                ("business_businesshour", "business_id"),
                ("business_favorite", "business_id"),
                ("business_photorequest", "business_id"),
                ("business_review", "business_id"),
                ("business_businesslike", "business_id"),
                ("business_reviewlike", "review_id"),  # review.id is int; keep for completeness
                ("business_productreview", "product_id"),
                ("business_servicereview", "service_id"),
            ]
            for table, col in fk_rules:
                try:
                    delete_sql = f"DELETE FROM {table} WHERE length({col}) <> 36"
                    cursor.execute(delete_sql)
                    deleted = cursor.rowcount
                    if deleted:
                        total_deleted += deleted
                        self.stdout.write(self.style.WARNING(f"{table}: deleted {deleted} invalid FK row(s) ({col})"))
                except Exception:
                    # Some tables/columns may not exist depending on migrations
                    pass

            # Then, delete root business rows with invalid UUIDs
            for table in root_tables:
                try:
                    delete_sql = f"DELETE FROM {table} WHERE {length_expr} <> 36"
                    cursor.execute(delete_sql)
                    deleted = cursor.rowcount
                    if deleted:
                        total_deleted += deleted
                        self.stdout.write(self.style.WARNING(f"{table}: deleted {deleted} invalid row(s)"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Failed cleaning table {table}: {e}"))

        # For SQLite, PRAGMA foreign_keys must be OFF outside a transaction. Run without atomic block.
        if vendor == 'sqlite':
            with connection.cursor() as cursor:
                try:
                    cursor.execute('PRAGMA foreign_keys=OFF')
                except Exception:
                    pass
                run_cleanup(cursor)
                try:
                    cursor.execute('PRAGMA foreign_keys=ON')
                except Exception:
                    pass
        else:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    run_cleanup(cursor)

        if total_deleted == 0:
            self.stdout.write(self.style.SUCCESS("No invalid UUID rows found."))
        else:
            self.stdout.write(self.style.WARNING(f"Cleanup complete. Total deleted: {total_deleted}"))


