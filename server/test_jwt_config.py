"""Shared JWT configuration for all server test suites.

Import from here so that test_app.py and test_security.py use
identical credentials and helper utilities.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Dict

import jwt

# JWT settings used across all tests
TEST_SECRET: str = 'test-secret-key'
TEST_ALGORITHM: str = 'HS256'
TEST_ISSUER: str = 'pets-workshop-test'

# Convenience dict for use with unittest.mock.patch.dict(os.environ, ...)
TEST_JWT_ENV: Dict[str, str] = {
    'JWT_SECRET_KEY': TEST_SECRET,
    'JWT_ALGORITHM': TEST_ALGORITHM,
    'JWT_ISSUER': TEST_ISSUER,
}


def make_valid_token() -> str:
    """Return a signed JWT that will be accepted by @require_auth during tests."""
    payload = {
        'sub': 'test-user',
        'iss': TEST_ISSUER,
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, TEST_SECRET, algorithm=TEST_ALGORITHM)


def make_expired_token() -> str:
    """Return a JWT whose expiry has already passed."""
    payload = {
        'sub': 'test-user',
        'iss': TEST_ISSUER,
        'exp': datetime.now(timezone.utc) - timedelta(seconds=1),
        'iat': datetime.now(timezone.utc) - timedelta(hours=1),
    }
    return jwt.encode(payload, TEST_SECRET, algorithm=TEST_ALGORITHM)
