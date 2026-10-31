import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "BookNook | Login",
  description: "Sign in to BookNook to borrow books and manage your shelf.",
}

export default function LoginPage() {
  return <LoginForm />
}
