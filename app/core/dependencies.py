from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Request


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get('x-forwarded-for')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.client.host if request.client else 'unknown'


@dataclass
class RateLimitResult:
    allowed: bool
    retry_after_seconds: int = 0


class InMemoryAttemptLimiter:
    def __init__(self, max_attempts: int = 5, window_seconds: int = 60, block_seconds: int = 300):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.block_seconds = block_seconds
        self.attempts = defaultdict(deque)
        self.blocked_until = {}

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def check(self, key: str) -> RateLimitResult:
        now = self._now()
        blocked_until = self.blocked_until.get(key)
        if blocked_until and blocked_until > now:
            return RateLimitResult(False, int((blocked_until - now).total_seconds()))
        queue = self.attempts[key]
        while queue and queue[0] <= now - timedelta(seconds=self.window_seconds):
            queue.popleft()
        if len(queue) >= self.max_attempts:
            self.blocked_until[key] = now + timedelta(seconds=self.block_seconds)
            return RateLimitResult(False, self.block_seconds)
        return RateLimitResult(True, 0)

    def register_failure(self, key: str) -> RateLimitResult:
        now = self._now()
        queue = self.attempts[key]
        while queue and queue[0] <= now - timedelta(seconds=self.window_seconds):
            queue.popleft()
        queue.append(now)
        if len(queue) >= self.max_attempts:
            self.blocked_until[key] = now + timedelta(seconds=self.block_seconds)
            return RateLimitResult(False, self.block_seconds)
        return RateLimitResult(True, 0)

    def reset(self, key: str) -> None:
        self.attempts.pop(key, None)
        self.blocked_until.pop(key, None)
