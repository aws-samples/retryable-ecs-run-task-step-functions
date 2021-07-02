import logging
import os
import sys

INPUT = os.environ.get("INPUT", "")

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger()

logging.info("Hello")
logging.info(f"input: {INPUT}")

# Enable this line if you want to test the error handling behavior.
# sys.exit(2)
# Exit code 2 is regarded as a retryable error by our error handler (lambda/error_handler/index.py).
