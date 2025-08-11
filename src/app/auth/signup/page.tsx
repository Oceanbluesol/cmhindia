import Link from "next/link";
import { signup } from "../action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-center text-2xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Host events and manage RSVPs
        </p>

        <form className="space-y-4">
          <div>
            <Label
 htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <Label
 htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <Button
            formAction={signup}
            className="mt-2 w-full  px-4 py-2 text-sm font-medium"
          >
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
