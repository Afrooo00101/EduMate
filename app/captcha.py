import httpx

from app.config import get_settings

settings = get_settings()


async def verify_captcha(token: str, client_ip: str | None = None) -> bool:
    if settings.allow_test_captcha and not settings.recaptcha_secret_key:
        return True
    if not token:
        return False
    if settings.allow_test_captcha and token == 'test-pass':
        return True
    if not settings.recaptcha_secret_key:
        return False
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={'secret': settings.recaptcha_secret_key, 'response': token, 'remoteip': client_ip},
        )
        payload = response.json()
        return bool(payload.get('success'))

