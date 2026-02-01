"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpgradePromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
}

export function UpgradePrompt({
  open,
  onOpenChange,
  title = "Upgrade required",
  message = "You've reached the limit for your current plan. Upgrade to continue.",
}: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild onClick={() => onOpenChange(false)}>
            <Link href="/pricing">View plans</Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
