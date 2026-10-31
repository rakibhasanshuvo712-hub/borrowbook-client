import type { Metadata } from "next"
import { RequireAuth } from "@/components/require-auth"
import { MyBooksView } from "./my-books-view"

export const metadata: Metadata = {
  title: "BookNook | My Books",
  description: "Edit or remove the books you have added to BookNook.",
}

export default function MyBooksPage() {
  return (
    <RequireAuth>
      <MyBooksView />
    </RequireAuth>
  )
}
