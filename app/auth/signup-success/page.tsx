import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Contract Manager</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Account Created Successfully!</CardTitle>
            <CardDescription>Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              We've sent you a verification email. Please click the link in the email to activate your account.
            </p>
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 text-sm">
              Return to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
