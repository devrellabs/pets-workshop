import os
from functools import wraps
from typing import Callable, Any

import jwt
from flask import request, jsonify


def require_auth(f: Callable) -> Callable:
    """Decorator to require OAuth2 Bearer token authentication on an endpoint.

    Reads configuration from environment variables:
      - JWT_SECRET_KEY  : secret used to verify the token signature (required)
      - JWT_ALGORITHM   : signing algorithm, defaults to 'HS256'
      - JWT_ISSUER      : expected token issuer; omit to skip issuer validation
    """
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401

        token = auth_header.split(' ', 1)[1]

        secret_key = os.environ.get('JWT_SECRET_KEY')
        if not secret_key:
            return jsonify({'error': 'Server authentication is not configured'}), 500

        algorithm = os.environ.get('JWT_ALGORITHM', 'HS256')
        issuer = os.environ.get('JWT_ISSUER')

        decode_kwargs: dict[str, Any] = {
            'algorithms': [algorithm],
        }
        if issuer:
            decode_kwargs['issuer'] = issuer

        try:
            jwt.decode(token, secret_key, **decode_kwargs)
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Unauthorized'}), 401

        return f(*args, **kwargs)

    return decorated
