"""
OAuth2.0 Bearer token authentication module.

Provides a decorator to enforce JWT-based authentication
on Flask API endpoints. Tokens are validated using a
configurable secret key or public key.

Configuration is read from environment variables at
request time to allow dynamic updates:
    JWT_SECRET_KEY: Secret key for HS256 or public key
    JWT_ALGORITHM: Signing algorithm (default: HS256)
    JWT_ISSUER: Expected token issuer (optional)
"""

import os
from functools import wraps
from typing import Any, Callable, Tuple

import jwt
from flask import request, jsonify, Response


def _get_jwt_config() -> Tuple[str, str, str]:
    """
    Read JWT configuration from environment variables.

    Returns:
        Tuple[str, str, str]: A tuple of
        (secret_key, algorithm, issuer).
    """
    secret_key: str = os.environ.get("JWT_SECRET_KEY", "")
    algorithm: str = os.environ.get("JWT_ALGORITHM", "HS256")
    issuer: str = os.environ.get("JWT_ISSUER", "")
    return secret_key, algorithm, issuer


def _extract_token() -> str | None:
    """
    Extract the Bearer token from the Authorization header.

    Returns:
        str | None: The token string, or None if not present
        or malformed.
    """
    auth_header: str | None = request.headers.get("Authorization")
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]


def _build_error_response(
    message: str, status_code: int
) -> Tuple[Response, int]:
    """
    Build a JSON error response for authentication failures.

    Parameters:
        message (str): The error message to include.
        status_code (int): The HTTP status code to return.

    Returns:
        Tuple[Response, int]: A tuple of JSON response and
        status code.
    """
    return jsonify({"error": message}), status_code


def require_auth(f: Callable[..., Any]) -> Callable[..., Any]:
    """
    Decorator to enforce OAuth2.0 Bearer token authentication.

    Validates the JWT token from the Authorization header.
    Returns 401 Unauthorized if the token is missing or
    invalid.

    Parameters:
        f (Callable): The Flask view function to protect.

    Returns:
        Callable: The decorated function with auth enforcement.
    """
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        """Wrapper that validates the JWT before calling
        the route handler."""
        secret_key, algorithm, issuer = _get_jwt_config()

        if not secret_key:
            return _build_error_response(
                "Authentication not configured", 500
            )

        token: str | None = _extract_token()
        if token is None:
            return _build_error_response(
                "Missing or invalid Authorization header", 401
            )

        decode_options: dict[str, Any] = {}
        if issuer:
            decode_options["issuer"] = issuer

        try:
            jwt.decode(
                token,
                secret_key,
                algorithms=[algorithm],
                options={"require": ["exp", "sub"]},
                **decode_options,
            )
        except jwt.ExpiredSignatureError:
            return _build_error_response("Token has expired", 401)
        except jwt.InvalidTokenError:
            return _build_error_response("Invalid token", 401)

        return f(*args, **kwargs)

    return decorated
