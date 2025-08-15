from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response


class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Custom limit-offset pagination with configurable defaults
    """
    default_limit = 15  # Changed from 20 to 15 to match frontend
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 100
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'limit': self.limit,
            'offset': self.offset,
            'total_pages': (self.count + self.limit - 1) // self.limit if self.limit > 0 else 0,
            'current_page': (self.offset // self.limit) + 1 if self.limit > 0 else 1
        })
