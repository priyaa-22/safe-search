from rest_framework.views import exception_handler
from documents.utils import error_response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        # If already formatted as standard error_response, return it directly
        if isinstance(response.data, dict) and "status" in response.data and response.data["status"] == "error":
            return response

        # Map status codes to specific error codes
        status_code = response.status_code
        if status_code == 401:
            code = "UNAUTHORIZED"
            message = "Authentication credentials were not provided or are invalid."
        elif status_code == 403:
            code = "PERMISSION_DENIED"
            message = "You do not have permission to perform this action."
        elif status_code == 429:
            code = "TOO_MANY_REQUESTS"
            message = "Request limit exceeded."
        else:
            code = "BAD_REQUEST"
            message = "An error occurred while processing the request."

        # Get details from response data
        details = None
        if isinstance(response.data, dict):
            if "detail" in response.data:
                message = response.data["detail"]
            details = response.data
        elif isinstance(response.data, list):
            details = {"errors": response.data}
        else:
            details = {"info": str(response.data)}

        # Format output using standard error_response format
        response.data = error_response(code=code, message=message, details=details)
        
    return response
