#!/usr/bin/env python3
"""Demo-only email normalisation; intentionally not full RFC 5322 validation."""
import re
import sys

email = sys.stdin.read(512).strip().lower()
if len(email) > 254 or not re.fullmatch(r"[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}", email):
    sys.exit("invalid demo email")
if ".." in email or email.count("@") != 1:
    sys.exit("invalid demo email")
print(email)
