import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-red-500" />
      <h1 className="mb-2 text-3xl font-bold">Page Not Found</h1>
      <p className="mb-6 text-gray-600">
        Oops! The page you’re looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block rounded-md bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
