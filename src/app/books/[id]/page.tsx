import { Suspense } from "react"
import { PagePlaceholder } from "@/components/page-placeholder"

export default function BookDetailsPage(props: PageProps<"/books/[id]">) {
  return (
    <Suspense
      fallback={
        <PagePlaceholder
          title="Book Details"
          description="Full information about this book, plus the borrow button."
          note="Loading book…"
        />
      }
    >
      <BookDetails params={props.params} />
    </Suspense>
  )
}

async function BookDetails({
  params,
}: {
  params: PageProps<"/books/[id]">["params"]
}) {
  const { id } = await params

  return (
    <PagePlaceholder
      title="Book Details"
      description="Full information about this book, plus the borrow button."
      note={`Details for book "${id}" will appear here.`}
    />
  )
}
