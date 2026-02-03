import os
import time
import requests

API_BASE = os.getenv("API_BASE_URL")
TIMEOUT = 10
FAILURE_THRESHOLD = 3


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
            "is_up": res.ok,
        }
    except Exception:
        return {
            "service_id": service["id"],
            "status_code": None,
            "response_time_ms": None,
            "is_up": False,
        }


def main():
    try:
        services = requests.get(f"{API_BASE}/services", timeout=10).json()
    except Exception as e:
        print("Failed to fetch services:", e)
        return  # exit cleanly

    for service in services:
        if not service.get("is_active"):
            continue

        try:
            payload = check_service(service)
            r = requests.post(f"{API_BASE}/logs", json=payload, timeout=10)
            print("POST /logs", r.status_code, payload)

            if payload["is_up"]:
                requests.put(
                    f"{API_BASE}/services/{service['id']}/failures",
                    json={"consecutive_failures": 0},
                    timeout=10,
                )
            else:
                new_failures = (service.get("consecutive_failures") or 0) + 1
                requests.put(
                    f"{API_BASE}/services/{service['id']}/failures",
                    json={"consecutive_failures": new_failures},
                    timeout=10,
                )

                if new_failures >= FAILURE_THRESHOLD and service.get(
                    "alert_enabled", True
                ):
                    print(
                        f"ALERT: {service['name']} down ({new_failures} failures)"
                    )
        except Exception as e:
            print("Failed to log service:", service["id"], e)


if __name__ == "__main__":
    main()
