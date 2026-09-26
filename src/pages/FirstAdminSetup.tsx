import { useState } from "react";
import { useAuth } from "@saintrelion/auth-lib";

/**
 * TEMPORARY FIRST-ADMIN BOOTSTRAP PAGE
 *
 * Use this only to create the first administrator in a fresh Firestore database.
 * Remove this page/route after the administrator has been created successfully.
 *
 * This uses the same auth.register() path as OJTLOG, allowing the configured
 * SaintRelion auth provider to create the expected password hash/salt and user
 * document shape.
 */
export default function FirstAdminSetup() {
  const auth = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!firstName || !lastName || !username || !email || !password) {
      setMessage("Fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setIsCreating(true);

    try {
      const userId = await auth.register(
        {
          firstName,
          lastName,
          username,
          email,
          isEnabled: true,
          roles: ["admin"],
          role: "admin",
        },
        password,
      );

      if (!userId) {
        setMessage(
          "Admin creation failed. Check the auth notification and browser console.",
        );
        return;
      }

      setMessage(
        `Administrator created successfully. User ID: ${userId}. Remove this bootstrap page/route, then log in normally.`,
      );
      event.currentTarget.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Administrator creation failed.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-widest text-amber-600 uppercase">
            Temporary setup utility
          </p>
          <h1 className="text-2xl font-black text-slate-900">
            Create First Administrator
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Use this page only on a fresh OJTLOG installation. It creates the
            first administrator through the configured SaintRelion auth
            provider. Remove this page and its route after setup.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstName" />
            <Field label="Last name" name="lastName" />
          </div>
          <Field label="Username" name="username" />
          <Field label="Email" name="email" type="email" />
          <Field
            label="Department (optional)"
            name="department"
            required={false}
          />
          <Field label="Password" name="password" type="password" />

          {message && (
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || auth.isLocked}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating || auth.isLocked
              ? "Creating administrator..."
              : "Create First Administrator"}
          </button>

          <a
            href="/admin/login"
            className="block w-full text-center text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            Back to Admin Login
          </a>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
        type={type}
        name={name}
        required={required}
        autoComplete="off"
      />
    </label>
  );
}
