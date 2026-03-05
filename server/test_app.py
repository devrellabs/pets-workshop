import unittest
from unittest.mock import patch, MagicMock
import json
import jwt
import time
from app import app  # Changed from relative import to absolute import

# Test secret key for JWT token generation in tests
TEST_SECRET = "test-secret-key-for-unit-tests"
TEST_ALGORITHM = "HS256"


def _generate_test_token(
    sub: str = "test-user",
    exp_offset: int = 3600,
    secret: str = TEST_SECRET,
    algorithm: str = TEST_ALGORITHM,
    include_exp: bool = True,
    include_sub: bool = True,
) -> str:
    """
    Generate a JWT token for testing purposes.

    Parameters:
        sub (str): The subject claim value.
        exp_offset (int): Seconds from now until token expires.
        secret (str): The secret key for signing.
        algorithm (str): The signing algorithm.
        include_exp (bool): Whether to include the exp claim.
        include_sub (bool): Whether to include the sub claim.

    Returns:
        str: The encoded JWT token string.
    """
    payload = {}
    if include_sub:
        payload["sub"] = sub
    if include_exp:
        payload["exp"] = int(time.time()) + exp_offset
    return jwt.encode(payload, secret, algorithm=algorithm)


# filepath: server/test_app.py
class TestApp(unittest.TestCase):
    def setUp(self):
        # Create a test client using Flask's test client
        self.app = app.test_client()
        self.app.testing = True
        # Turn off database initialization for tests
        app.config['TESTING'] = True
        
    def _create_mock_dog(self, dog_id, name, breed):
        """Helper method to create a mock dog with standard attributes"""
        dog = MagicMock(spec=['to_dict', 'id', 'name', 'breed'])
        dog.id = dog_id
        dog.name = name
        dog.breed = breed
        dog.to_dict.return_value = {'id': dog_id, 'name': name, 'breed': breed}
        return dog
        
    def _setup_query_mock(self, mock_query, dogs):
        """Helper method to configure the query mock"""
        mock_query_instance = MagicMock()
        mock_query.return_value = mock_query_instance
        mock_query_instance.join.return_value = mock_query_instance
        mock_query_instance.all.return_value = dogs
        return mock_query_instance

    def _auth_header(self, token: str = None) -> dict:
        """Helper to build an Authorization header with a valid token."""
        if token is None:
            token = _generate_test_token()
        return {"Authorization": f"Bearer {token}"}

    @patch('app.db.session.query')
    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_get_dogs_success(self, mock_query):
        """Test successful retrieval of multiple dogs"""
        # Arrange
        dog1 = self._create_mock_dog(1, "Buddy", "Labrador")
        dog2 = self._create_mock_dog(2, "Max", "German Shepherd")
        mock_dogs = [dog1, dog2]
        
        self._setup_query_mock(mock_query, mock_dogs)
        
        # Act
        response = self.app.get(
            '/api/dogs', headers=self._auth_header()
        )
        
        # Assert
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        
        # Verify first dog
        self.assertEqual(data[0]['id'], 1)
        self.assertEqual(data[0]['name'], "Buddy")
        self.assertEqual(data[0]['breed'], "Labrador")
        
        # Verify second dog
        self.assertEqual(data[1]['id'], 2)
        self.assertEqual(data[1]['name'], "Max")
        self.assertEqual(data[1]['breed'], "German Shepherd")
        
        # Verify query was called
        mock_query.assert_called_once()
        
    @patch('app.db.session.query')
    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_get_dogs_empty(self, mock_query):
        """Test retrieval when no dogs are available"""
        # Arrange
        self._setup_query_mock(mock_query, [])
        
        # Act
        response = self.app.get(
            '/api/dogs', headers=self._auth_header()
        )
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, [])
        
    @patch('app.db.session.query')
    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_get_dogs_structure(self, mock_query):
        """Test the response structure for a single dog"""
        # Arrange
        dog = self._create_mock_dog(1, "Buddy", "Labrador")
        self._setup_query_mock(mock_query, [dog])
        
        # Act
        response = self.app.get(
            '/api/dogs', headers=self._auth_header()
        )
        
        # Assert
        data = json.loads(response.data)
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)
        self.assertEqual(set(data[0].keys()), {'id', 'name', 'breed'})


class TestAuthentication(unittest.TestCase):
    """Tests for OAuth2.0 Bearer token authentication."""

    def setUp(self):
        """Set up test client."""
        self.app = app.test_client()
        self.app.testing = True
        app.config['TESTING'] = True

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_missing_auth_header_returns_401(self):
        """Test that requests without Authorization header get 401."""
        response = self.app.get('/api/dogs')

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("Missing", data["error"])

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_invalid_token_returns_401(self):
        """Test that requests with an invalid token get 401."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("Invalid token", data["error"])

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_expired_token_returns_401(self):
        """Test that requests with an expired token get 401."""
        # Generate a token that expired 1 hour ago
        token = _generate_test_token(exp_offset=-3600)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("expired", data["error"])

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_wrong_secret_returns_401(self):
        """Test that a token signed with wrong key gets 401."""
        token = _generate_test_token(secret="wrong-secret")
        headers = {"Authorization": f"Bearer {token}"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_malformed_auth_header_returns_401(self):
        """Test that a malformed Authorization header gets 401."""
        headers = {"Authorization": "Token some-token"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": "", "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_unconfigured_secret_returns_500(self):
        """Test that missing JWT_SECRET_KEY config returns 500."""
        token = _generate_test_token()
        headers = {"Authorization": f"Bearer {token}"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn("not configured", data["error"])

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_get_dog_by_id_requires_auth(self):
        """Test that /api/dogs/<id> also requires authentication."""
        response = self.app.get('/api/dogs/1')

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_token_missing_sub_returns_401(self):
        """Test that a token without 'sub' claim gets 401."""
        token = _generate_test_token(include_sub=False)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)

    @patch.dict(
        'os.environ',
        {"JWT_SECRET_KEY": TEST_SECRET, "JWT_ALGORITHM": TEST_ALGORITHM},
    )
    def test_token_missing_exp_returns_401(self):
        """Test that a token without 'exp' claim gets 401."""
        token = _generate_test_token(include_exp=False)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.app.get('/api/dogs', headers=headers)

        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("error", data)


if __name__ == '__main__':
    unittest.main()