"""
wallet.py — Deprecated. Wallet is now part of the users table.

This module is kept as a thin redirect so any old frontend calls to
/api/wallet still work without breaking changes.
Delegates to users.get_wallet which reads from users.balance.
"""
from .users import get_wallet  # re-export for backwards compat