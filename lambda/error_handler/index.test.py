import unittest
import index
import json

class TestHandler(unittest.TestCase):
    def load_test_event(self):
        with open('event.json') as f:
            event = json.load(f)
        return event

    def test_normal(self):
        event = self.load_test_event()
        res = index.handler(event, {})
        self.assertEqual(res['type'], "retryable")
        self.assertEqual(res['retryCount'], 0)
        self.assertEqual(res['waitTimeSeconds'], 1)


if __name__ == '__main__':
    unittest.main()
