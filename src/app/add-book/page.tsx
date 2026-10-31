import type { Metadata } from "next"
import { RequireAuth } from "@/components/require-auth"
import { AddBookForm } from "./add-book-form"

export const metadata: Metadata = {
  title: "BookNook | Add Book",
  description: "Share a book with the BookNook community.",
}

export default function AddBookPage() {
  return (
    <RequireAuth>
      <AddBookForm />
    </RequireAuth>
  )
}
