import { useRouteError } from "react-router";

export default function RouterError() {
  const error: {statusText?: string, message?: string} = useRouteError();
  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <h1><i data-testid="error-icon" className="bi bi-emoji-frown-fill"></i></h1>
      <p>{ error.statusText || error.message }</p>
    </div>
  );
}
