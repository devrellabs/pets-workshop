"""Threat modeling tests for the Pets Workshop API.

Acceptance criteria verified here:
  - All API endpoints must require authentication (OAuth2 Bearer token).
  - Requests without a token must be rejected with HTTP 401.
  - Requests with an invalid or expired token must be rejected with HTTP 401.
  - Requests with a valid OAuth2 Bearer token must be accepted (HTTP 2xx).
"""

import json
import os
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import jwt

from app import app
from test_jwt_config import TEST_JWT_ENV, TEST_SECRET, TEST_ALGORITHM, TEST_ISSUER, make_valid_token, make_expired_token


class TestThreatModeling(unittest.TestCase):
    """Threat modeling tests – verifies that all API endpoints are protected
    with OAuth2 Bearer token authentication."""

    def setUp(self) -> None:
        self.client = app.test_client()
        self.client.testing = True
        app.config['TESTING'] = True

        # Ensure the JWT environment matches the tokens generated in tests
        self.env_patcher = patch.dict(os.environ, TEST_JWT_ENV)
        self.env_patcher.start()

    def tearDown(self) -> None:
        self.env_patcher.stop()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _setup_dogs_query_mock(self, mock_query: MagicMock, dogs: list) -> MagicMock:
        """Configure a db.session.query mock that returns *dogs*."""
        instance = MagicMock()
        mock_query.return_value = instance
        instance.join.return_value = instance
        instance.filter.return_value = instance
        instance.all.return_value = dogs
        instance.first.return_value = dogs[0] if dogs else None
        return instance

    def _bearer(self, token: str) -> dict:
        return {'Authorization': f'Bearer {token}'}

    # ==================================================================
    # GET /api/dogs
    # ==================================================================

    def test_get_dogs_no_token_returns_401(self) -> None:
        """GET /api/dogs – no Authorization header → 401 Unauthorized."""
        response = self.client.get('/api/dogs')
        self.assertEqual(response.status_code, 401)

    def test_get_dogs_malformed_header_returns_401(self) -> None:
        """GET /api/dogs – Authorization header without 'Bearer' scheme → 401."""
        response = self.client.get('/api/dogs', headers={'Authorization': 'Basic dXNlcjpwYXNz'})
        self.assertEqual(response.status_code, 401)

    def test_get_dogs_invalid_token_returns_401(self) -> None:
        """GET /api/dogs – tampered/invalid token → 401 Unauthorized."""
        response = self.client.get('/api/dogs', headers=self._bearer('not.a.valid.token'))
        self.assertEqual(response.status_code, 401)

    def test_get_dogs_expired_token_returns_401(self) -> None:
        """GET /api/dogs – expired JWT → 401 Unauthorized."""
        response = self.client.get('/api/dogs', headers=self._bearer(make_expired_token()))
        self.assertEqual(response.status_code, 401)

    def test_get_dogs_wrong_secret_returns_401(self) -> None:
        """GET /api/dogs – JWT signed with wrong secret → 401 Unauthorized."""
        payload = {
            'sub': 'attacker',
            'iss': TEST_ISSUER,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        }
        token = jwt.encode(payload, 'wrong-secret', algorithm=TEST_ALGORITHM)
        response = self.client.get('/api/dogs', headers=self._bearer(token))
        self.assertEqual(response.status_code, 401)

    @patch('app.db.session.query')
    def test_get_dogs_valid_oauth2_token_returns_200(self, mock_query: MagicMock) -> None:
        """GET /api/dogs – valid OAuth2 Bearer token → 200 OK."""
        self._setup_dogs_query_mock(mock_query, [])
        response = self.client.get('/api/dogs', headers=self._bearer(make_valid_token()))
        self.assertEqual(response.status_code, 200)

    # ==================================================================
    # GET /api/dogs/<id>
    # ==================================================================

    def test_get_dog_by_id_no_token_returns_401(self) -> None:
        """GET /api/dogs/<id> – no Authorization header → 401 Unauthorized."""
        response = self.client.get('/api/dogs/1')
        self.assertEqual(response.status_code, 401)

    def test_get_dog_by_id_malformed_header_returns_401(self) -> None:
        """GET /api/dogs/<id> – Authorization header without 'Bearer' scheme → 401."""
        response = self.client.get('/api/dogs/1', headers={'Authorization': 'Token abc123'})
        self.assertEqual(response.status_code, 401)

    def test_get_dog_by_id_invalid_token_returns_401(self) -> None:
        """GET /api/dogs/<id> – tampered/invalid token → 401 Unauthorized."""
        response = self.client.get('/api/dogs/1', headers=self._bearer('garbage'))
        self.assertEqual(response.status_code, 401)

    def test_get_dog_by_id_expired_token_returns_401(self) -> None:
        """GET /api/dogs/<id> – expired JWT → 401 Unauthorized."""
        response = self.client.get('/api/dogs/1', headers=self._bearer(make_expired_token()))
        self.assertEqual(response.status_code, 401)

    @patch('app.db.session.query')
    def test_get_dog_by_id_valid_oauth2_token_returns_200(self, mock_query: MagicMock) -> None:
        """GET /api/dogs/<id> – valid OAuth2 Bearer token → 200 OK."""
        dog = MagicMock()
        dog.id = 1
        dog.name = 'Buddy'
        dog.breed = 'Labrador'
        dog.age = 3
        dog.description = 'Friendly dog'
        dog.gender = 'Male'
        dog.status = MagicMock()
        dog.status.name = 'available'
        self._setup_dogs_query_mock(mock_query, [dog])

        response = self.client.get('/api/dogs/1', headers=self._bearer(make_valid_token()))
        self.assertEqual(response.status_code, 200)

    # ==================================================================
    # Response body assertions for 401 responses
    # ==================================================================

    def test_401_response_contains_error_field(self) -> None:
        """Unauthenticated response body must include an 'error' field."""
        response = self.client.get('/api/dogs')
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_401_response_no_sensitive_data_leaked(self) -> None:
        """Rejected requests must not expose internal data in the response body."""
        response = self.client.get('/api/dogs')
        data = json.loads(response.data)
        # The only key allowed is 'error'
        self.assertEqual(list(data.keys()), ['error'])


if __name__ == '__main__':
    unittest.main()
