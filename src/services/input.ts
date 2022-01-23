import { useState, useCallback } from 'react'

type InputProps<T> = { onChange: (event: any) => void; value: T }

type UseInput<T> = [T, InputProps<T>, (val: T) => void]

export const useInput = <T>(initialValue: T): UseInput<T> => {
  const [value, setValue] = useState<T>(initialValue)

  const onChange = useCallback(
    (e) => {
      if (e.target) setValue(e.target.value || '')
    },
    [setValue]
  )

  const inputProps = {
    onChange,
    value,
  }

  return [value, inputProps, setValue]
}
