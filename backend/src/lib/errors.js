const APP_ERROR_CODES = new Set([
  'BAD_REQUEST',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
]);

function isAppError(error) {
  return APP_ERROR_CODES.has(error?.code) && typeof error?.statusCode === 'number';
}

function findAppError(error) {
  let current = error;
  while (current) {
    if (isAppError(current)) return current;
    current = current.originalError ?? current.cause;
  }
  return null;
}

export function AppError(message, code = 'BAD_REQUEST', statusCode = 400) {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
}

export function AuthenticationError(message = 'Authentication required') {
  return AppError(message, 'UNAUTHENTICATED', 401);
}

export function ForbiddenError(message = 'Forbidden') {
  return AppError(message, 'FORBIDDEN', 403);
}

export function NotFoundError(message = 'Resource not found') {
  return AppError(message, 'NOT_FOUND', 404);
}

export function formatGraphQLError(formattedError, error) {
  const original = findAppError(error) ?? findAppError(formattedError);

  if (original) {
    return {
      ...formattedError,
      message: original.message,
      extensions: {
        ...formattedError.extensions,
        code: original.code,
        statusCode: original.statusCode,
      },
    };
  }

  return formattedError;
}
