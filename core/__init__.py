import logging

def get_logger(name: str) -> logging.Logger:
    """Return namespaced logger with our project's defaults."""
    return logging.getLogger(name)


