import urllib.request
import json
import sys

BASE_URL = "http://localhost:8001"

def send_post_request(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            response_body = response.read().decode('utf-8')
            return status_code, json.loads(response_body)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Connection Error: {e}")
        return None, None

def test_register():
    print(f"Testing Registration at {BASE_URL}/register...")
    payload = {
        "email": "testpatient_qa@example.com",
        "full_name": "QA Test Patient",
        "role": "patient",
        "password": "securepassword123"
    }
    
    status_code, response_json = send_post_request("/register", payload)
    
    if status_code:
        print(f"Status Code: {status_code}")
        print(f"Response: {response_json}")
    
    if status_code == 200 and "access_token" in response_json:
        print("✅ Registration Successful")
        return True
    elif status_code == 400 and "Email already registered" in response_json.get("detail", ""):
        print("⚠️ User already exists. Proceeding to login...")
        return True
    else:
        print("❌ Registration Failed")
        return False

def test_login():
    print(f"\nTesting Login at {BASE_URL}/login...")
    payload = {
        "email": "testpatient_qa@example.com",
        "password": "securepassword123"
    }
    
    status_code, response_json = send_post_request("/login", payload)
    
    if status_code:
        print(f"Status Code: {status_code}")
        print(f"Response: {response_json}")

    if status_code == 200 and "access_token" in response_json:
        print("✅ Login Successful")
        return True
    else:
        print("❌ Login Failed")
        return False

if __name__ == "__main__":
    if test_register():
        if test_login():
            print("\n✅ All QA Checks Passed!")
            sys.exit(0)
        else:
            print("\n❌ Login Check Failed")
            sys.exit(1)
    else:
        print("\n❌ Registration Check Failed")
        sys.exit(1)

