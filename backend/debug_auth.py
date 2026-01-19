from auth import get_password_hash
try:
    print(get_password_hash("password123"))
except Exception as e:
    print(e)
