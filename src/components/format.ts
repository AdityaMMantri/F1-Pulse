import type { CSSProperties } from 'react'
export const teamStyle = (color: string) => ({ '--team': color } as CSSProperties)
export const value = (n: number | string | null | undefined) => n ?? 'Unavailable'
