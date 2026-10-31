import type { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "BookNook | Register",
  description: "Create a BookNook account to borrow and share books.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
