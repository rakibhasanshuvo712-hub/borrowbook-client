import { Suspense } from "react"
import type { Metadata } from "next"
import { RequireAuth } from "@/components/require-auth"
import { Spinner } from "@/components/ui/spinner"
import { BookDetailsView } from "./book-details-view"

export const metadata: Metadata = {
  title: "BookNook | Book Details",
  description: "Full information about this book, plus the borrow option.",
}

export default function BookDetailsPage(props: PageProps<"/books/[id]">) {
  return (
    <RequireAuth>
      {/* `params` resolves behind Suspense so the shell (incl. the borrow
          button layout) still prerenders for this dynamic route. */}
      <Suspense fallback={<BookDetailsFallback />}>
        <BookDetails params={props.params} />
      </Suspense>
    </RequireAuth>
  )
}

async function BookDetails({
  params,
}: {
  params: PageProps<"/books/[id]">["params"]
}) {
  const { id } = await params
  return <BookDetailsView id={id} />
}

function BookDetailsFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
