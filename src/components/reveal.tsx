"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={reduceMotion ? undefined : { opacity: 0, y: 22 }}
    >
      {children}
    </motion.div>
  )
}
