import { RequireAuth } from "@/components/require-auth"
import { PagePlaceholder } from "@/components/page-placeholder"

export default function MyBorrowsPage() {
  return (
    <RequireAuth>
      <PagePlaceholder
        title="My Borrows"
        description="Books you are currently borrowing, plus your borrow history."
        note="Your borrow list will appear here."
      />
    </RequireAuth>
  )
}
