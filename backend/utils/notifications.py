import requests

def send_push_notification(push_token, title, body):
    requests.post(
        "https://exp.host/--/api/v2/push/send",
        json={
            "to": push_token,
            "title": title,
            "body": body
        }
    )
