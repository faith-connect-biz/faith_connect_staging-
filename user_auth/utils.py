# authapp/utils.py

def success_response(message, data=None, status=200):
    return {
        "status": "success",
        "message": message,
        "data": data,
        "status_code": status
    }


def error_response(message, errors=None, status=400):
    return {
        "status": "error",
        "message": message,
        "errors": errors,
        "status_code": status
    }
