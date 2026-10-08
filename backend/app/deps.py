"""Shared request dependencies.

Auth is intentionally mocked (allowed by the brief): the frontend sends the acting user's id in the
`X-User-Id` header. Swapping in real auth means replacing only these functions with token validation;
no router changes are needed.
"""
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import User


def get_optional_user(
    x_user_id: Optional[int] = Header(default=None), db: Session = Depends(get_db)
) -> Optional[User]:
    return db.get(User, x_user_id) if x_user_id is not None else None


def get_current_user(user: Optional[User] = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(401, "Log in to continue")
    return user


def require_host(user: User = Depends(get_current_user)) -> User:
    if not user.is_host:
        raise HTTPException(403, "Switch to hosting to manage listings")
    return user
