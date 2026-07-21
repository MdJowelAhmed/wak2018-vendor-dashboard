import { animate, useMotionValue } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
}) {
  const mv = useMotionValue(0)
  const [text, setText] = useState(() => (format ? format(value) : new Intl.NumberFormat().format(value)))

  const fmt = useMemo(() => format ?? ((n: number) => new Intl.NumberFormat().format(n)), [format])

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setText(fmt(latest)),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, fmt])

  return <span className="tabular-nums">{text}</span>
}

