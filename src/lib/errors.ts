export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function publicErrorMessage(error: unknown): { message: string; status: number; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status, code: error.code };
  }
  return {
    message: "Nous n'avons pas pu traiter votre demande. Réessayez dans quelques instants.",
    status: 500,
    code: "internal_error",
  };
}
