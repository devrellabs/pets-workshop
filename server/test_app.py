import unittest
from unittest.mock import patch, MagicMock
import json
from app import app  # Changed from relative import to absolute import

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

    @patch('app.db.session.query')
    def test_get_dogs_success(self, mock_query):
        """Test successful retrieval of multiple dogs"""
        # Arrange
        dog1 = self._create_mock_dog(1, "Buddy", "Labrador")
        dog2 = self._create_mock_dog(2, "Max", "German Shepherd")
        mock_dogs = [dog1, dog2]
        
        self._setup_query_mock(mock_query, mock_dogs)
        
        # Act
        response = self.app.get('/api/dogs')
        
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
    def test_get_dogs_empty(self, mock_query):
        """Test retrieval when no dogs are available"""
        # Arrange
        self._setup_query_mock(mock_query, [])
        
        # Act
        response = self.app.get('/api/dogs')
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, [])
        
    @patch('app.db.session.query')
    def test_get_dogs_structure(self, mock_query):
        """Test the response structure for a single dog"""
        # Arrange
        dog = self._create_mock_dog(1, "Buddy", "Labrador")
        self._setup_query_mock(mock_query, [dog])
        
        # Act
        response = self.app.get('/api/dogs')
        
        # Assert
        data = json.loads(response.data)
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)
        self.assertEqual(set(data[0].keys()), {'id', 'name', 'breed'})
    
    @patch('app.db.session.query')
    def test_get_sitemap_data(self, mock_query):
        """Test sitemap data endpoint"""
        # Arrange
        dog1 = MagicMock()
        dog1.id = 1
        dog2 = MagicMock()
        dog2.id = 2
        mock_dogs = [dog1, dog2]
        
        mock_query_instance = MagicMock()
        mock_query.return_value = mock_query_instance
        mock_query_instance.all.return_value = mock_dogs
        
        # Act
        response = self.app.get('/api/sitemap')
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('dog_ids', data)
        self.assertIn('last_updated', data)
        self.assertEqual(data['dog_ids'], [1, 2])

    @patch('app.db.session.query')
    def test_get_breeds_success(self, mock_query):
        """Test successful retrieval of breeds"""
        # Arrange
        mock_breed1 = MagicMock()
        mock_breed1.name = "Labrador Retriever"
        mock_breed2 = MagicMock()
        mock_breed2.name = "German Shepherd"
        mock_breed3 = MagicMock()
        mock_breed3.name = "Beagle"
        
        mock_query_instance = MagicMock()
        mock_query.return_value = mock_query_instance
        mock_query_instance.order_by.return_value = mock_query_instance
        mock_query_instance.all.return_value = [mock_breed1, mock_breed2, mock_breed3]
        
        # Act
        response = self.app.get('/api/breeds')
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 5)  # 3 breeds + 2 edge cases
        self.assertIn("Labrador Retriever", data)
        self.assertIn("German Shepherd", data)
        self.assertIn("Beagle", data)
        self.assertIn("Mixed Breed", data)
        self.assertIn("Unknown", data)

    @patch('app.db.session.query')
    def test_get_breeds_alphabetical(self, mock_query):
        """Test that breeds are returned in alphabetical order"""
        # Arrange
        mock_breed1 = MagicMock()
        mock_breed1.name = "Beagle"
        mock_breed2 = MagicMock()
        mock_breed2.name = "Labrador Retriever"
        
        mock_query_instance = MagicMock()
        mock_query.return_value = mock_query_instance
        mock_query_instance.order_by.return_value = mock_query_instance
        mock_query_instance.all.return_value = [mock_breed1, mock_breed2]
        
        # Act
        response = self.app.get('/api/breeds')
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        # First two should be from database (in alphabetical order from query)
        self.assertEqual(data[0], "Beagle")
        self.assertEqual(data[1], "Labrador Retriever")
        # Edge cases at the end
        self.assertEqual(data[2], "Mixed Breed")
        self.assertEqual(data[3], "Unknown")

    @patch('app.db.session.query')
    def test_get_breeds_empty(self, mock_query):
        """Test retrieval when no breeds are in database"""
        # Arrange
        mock_query_instance = MagicMock()
        mock_query.return_value = mock_query_instance
        mock_query_instance.order_by.return_value = mock_query_instance
        mock_query_instance.all.return_value = []
        
        # Act
        response = self.app.get('/api/breeds')
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)  # Only edge cases
        self.assertIn("Mixed Breed", data)
        self.assertIn("Unknown", data)


if __name__ == '__main__':
    unittest.main()