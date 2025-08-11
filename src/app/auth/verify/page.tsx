// app/auth/verify/page.tsx
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
          {/* envelope icon */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-7 w-7 text-indigo-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
            <path d="m4 7 7.27 5.087a1.5 1.5 0 0 0 1.46 0L20 7" />
          </svg>
        </div>

        <h1 className="mt-4 text-center text-2xl font-semibold text-gray-900">
          Verify your email
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a verification link to your inbox. Click the link to activate your account.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Open Gmail
          </a>
          <a
            href="https://outlook.live.com/mail/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open Outlook
          </a>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-center text-xs text-gray-500">
            It can take up to a minute. Check your <span className="font-medium">Spam</span> or{" "}
            <span className="font-medium">Promotions</span> folder.
          </p>
          <div className="mt-3 flex justify-center gap-4 text-sm">
            <a href="/auth/login?verify=1" className="text-indigo-600 hover:underline">
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
