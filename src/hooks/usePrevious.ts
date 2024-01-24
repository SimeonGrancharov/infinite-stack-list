import { useEffect, useRef } from 'react'

export function usePrevious<T>(value: T): T {
  const prevValue = useRef(value)

  useEffect(() => {
    prevValue.current = value
  })

  return prevValue.current
}
