import os
import time
import requests

API_BASE = os.getenv("API_BASE_URL")

TIMEOUT = 10  # seconds

def check_service(service):
    url = service["url"]
    start = time.time()

    try:
        res = requests.get(url, timeout=TIMEOUT)
        latency = int((time.time() - start) * 1000)

        return {
            "service_id": service["id"],
            "status_code": res.status_code,
            "response_time_ms": latency,
            "is_up": res.ok
        }

    except requests.RequestException:
        return {
            "service_id": service["id"],
            "status_code": None,
            "response_time_ms": None,
            "is_up": False
        }


def main():
    try:
        services = requests.get(
            f"{API_BASE}/services",
            timeout=10
        ).json()
    except Exception as e:
        print("Failed to fetch services:", e)
        return

    for service in services:
        try:
            result = check_service(service)
            requests.post(
                f"{API_BASE}/logs",
                json=result,
                timeout=10
            )
        except Exception as e:
            print(f"Failed logging service {service['id']}", e)

if __name__ == "__main__":
    main()
