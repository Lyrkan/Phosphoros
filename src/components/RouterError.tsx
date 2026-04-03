import { useRouteError } from "react-router";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.statusText === 'string') return obj.statusText;
    if (typeof obj.message === 'string') return obj.message;
  }
  return String(error);
}

export default function RouterError() {
  const error = useRouteError();

  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <h1><i data-testid="error-icon" className="bi bi-emoji-frown-fill"></i></h1>
      <p>{getErrorMessage(error)}</p>
    </div>
  );
}
