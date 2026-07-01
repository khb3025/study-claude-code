import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Slot } from "radix-ui"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn("", className)} {...props} />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
  asChild?: boolean
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  asChild = false,
  ...props
}: PaginationLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "outline", size }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="이전 페이지"
      data-slot="pagination-previous"
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "gap-1 pl-2.5",
        className
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>이전</span>
    </a>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="다음 페이지"
      data-slot="pagination-next"
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "gap-1 pr-2.5",
        className
      )}
      {...props}
    >
      <span>다음</span>
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "cursor-default",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">더 보기</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
