import { RequireAuth } from "@/components/require-auth"
import { PagePlaceholder } from "@/components/page-placeholder"

export default function MyBooksPage() {
  return (
    <RequireAuth>
      <PagePlaceholder
        title="My Books"
        description="The books you have added to BookNook."
        note="Your book list will appear here."
      />
    </RequireAuth>
  )
}
