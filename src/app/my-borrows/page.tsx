import type { Metadata } from "next"
import { RequireAuth } from "@/components/require-auth"
import { MyBorrowsView } from "./my-borrows-view"

export const metadata: Metadata = {
  title: "BookNook | My Borrows",
  description: "The books you have borrowed, with their return dates.",
}

export default function MyBorrowsPage() {
  return (
    <RequireAuth>
      <MyBorrowsView />
    </RequireAuth>
  )
}
