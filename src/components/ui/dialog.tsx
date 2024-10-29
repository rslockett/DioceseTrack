"use client"

import React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      {children}
    </div>
  )
}

export function DialogContent({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export function DialogHeader({
  className = '',
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
      {...props}
    />
  )
}

export function DialogTitle({
  className = '',
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
}

export function DialogDescription({
  className = '',
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    />
  )
}
