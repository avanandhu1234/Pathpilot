"use client"

import { usePathname } from "next/navigation"
import { KyroChat } from "@/components/kyro-chat"

const excludedPaths = ["/career-guidance"]

export function KyroFloatingWidget() {
  const pathname = usePathname()
  if (excludedPaths.includes(pathname)) return null
  return <KyroChat variant="floating" />
}
