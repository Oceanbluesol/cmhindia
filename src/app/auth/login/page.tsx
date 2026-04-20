import Link from "next/link";
import { login } from "../action";
import { Calendar, Shield, Users } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900 p-12 text-white">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="CMH India" className="h-8 w-auto brightness-0 invert" />
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back to CMH India
          </h1>
          <p className="text-indigo-100 text-lg mb-10">
            Sign in to manage your events, track RSVPs, and connect with the community.
          </p>

          <div className="space-y-4">
            {[
              { icon: Calendar, text: "Manage all your events in one place" },
              { icon: Users, text: "Connect with your community" },
              { icon: Shield, text: "Secure event approval workflow" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-indigo-100">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-indigo-200">© {new Date().getFullYear()} CMH India</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="CMH India" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-1 text-sm text-gray-500">Log in to manage your events</p>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                formAction={login}
                className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
