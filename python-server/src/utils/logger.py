# utils/logger.py

def log(msg: str, *, caller: str = "<unknown>", verbose: bool = True):
    """
    Simple logging function that prints a message with caller info.

    Args:
        msg (str): Message to log.
        caller (str, optional): Name of the function/class calling log. Defaults to "<unknown>".
        verbose (bool, optional): If False, suppresses output. Defaults to True.
    """
    if not verbose:
        return

    print(f"[{caller}] {msg}") 
