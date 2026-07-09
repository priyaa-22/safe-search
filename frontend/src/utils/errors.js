export class SecureMatchError extends Error {
  constructor(message, code, type, details = null) {
    super(message);
    this.name = "SecureMatchError";
    this.code = code;
    this.type = type;
    this.details = details;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      type: this.type,
      details: this.details,
    };
  }
}

export const createApiError = (message, code = "API_ERROR", details = null) => {
  return new SecureMatchError(message, code, "API", details);
};

export const createPermissionError = (message = "Access denied: Insufficient privileges", code = "PERMISSION_DENIED") => {
  return new SecureMatchError(message, code, "PERMISSION");
};

export const createValidationError = (message, details = null, code = "VALIDATION_ERROR") => {
  return new SecureMatchError(message, code, "VALIDATION", details);
};
