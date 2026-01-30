# utils/logger.py
def log(msg: str, *, caller: str = "<unknown>", verbose=True):
    if not verbose:
        return

    print(f"[{caller}] {msg}")
