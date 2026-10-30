import { RequireAuth } from "@/components/require-auth"
import { AddBookForm } from "./add-book-form"

export default function AddBookPage() {
  return (
    <RequireAuth>
      <AddBookForm />
    </RequireAuth>
  )
}
