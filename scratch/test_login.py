import httpx
import json

url = "http://127.0.0.1:8000/api/v1/auth/login"
payload = {
    "email": "mohamed230145612@sut.edu.eg",
    "password": "EduMate@123",
    "captcha_token": "test-pass"
}

try:
    response = httpx.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
