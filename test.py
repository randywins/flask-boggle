from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    # TODO -- write tests for every view function / feature!

    def setUp(self):
        """Initiation before every test"""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):
        """This will make sure information is in the session and displayed"""

        with self.client:
            response = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'Time Left:', response.data)

    def test_valid_word(self): 
        """This will test if word is valid and will modify the board in session"""

        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [["B", "O", "A", "R", "D"],
                                 ["B", "O", "A", "R", "D"],
                                 ["B", "O", "A", "R", "D"],
                                 ["B", "O", "A", "R", "D"],
                                 ["B", "O", "A", "R", "D"]]
        response = self.client.get('/check-word?word=cat')
        self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        """This will test if word is in the dictionary"""

        self.client.get('/')
        response = self.client.get('/check-word?word=impossible')
        self.assertEqual(response.json['result'], 'not-on-board')

    def non_english_word(self):
        """This will test if word is on the board"""

        self.client.get('/')
        response = self.client.get('/check-word?word=asdefasdeafasdef')
        self.assertEqual(response.json['result'], 'not-word')

