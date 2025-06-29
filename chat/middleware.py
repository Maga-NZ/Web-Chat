import json
from urllib.parse import parse_qs

# Removed import of AccessToken and other Django modules at the top level

# New middleware to add token from query string to scope
class TokenAuthMiddleware:
    """
    Middleware that adds a token from the query string to the scope.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Look for token in query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        # Add the token to the scope
        if token:
            scope['query_string'] = f'token={token}&'.encode() + scope.get('query_string', b'')
            scope['headers'].append((b'authorization', f'Bearer {token}'.encode())) # Add token to headers as well

        return await self.inner(scope, receive, send)

# We will use this middleware before AuthMiddlewareStack in asgi.py
# The authentication itself will be handled by Django's authentication system
# and rest_framework_simplejwt, which will now receive the token via headers. 