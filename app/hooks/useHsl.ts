import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useIsHsl() {
    const searchParams = useSearchParams()
    return useMemo(() => searchParams.has('hsl'), [searchParams])
}

export function useRegion() {
    const searchParams = useSearchParams()
    return useMemo(() => searchParams.has('hsl') ? "hsl" : "finland", [searchParams])
}