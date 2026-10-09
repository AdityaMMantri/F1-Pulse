import type { CSSProperties } from 'react'
export const teamStyle = (color: string) => ({ '--team': color } as CSSProperties)
export const value = (n: number | string | null | undefined) => n ?? 'Unavailable'

export const podiumClass = (position: number) => Number.isInteger(position) && position >= 1 && position <= 3 ? `podium-place-${position}` : ''

// Event constructor identity determines livery accents, including substitute appearances.
export function resultTeamStyle(name: string, fallback = '#91a5bf'): CSSProperties {
 const key=name.toLowerCase().replace(/[^a-z]/g,'')
 const palette: Record<string,[string,string]>={ferrari:['#ff302e','#a80f20'],redbull:['#2962ff','#ff3046'],mercedes:['#23dec6','#087d75'],mclaren:['#ff8700','#c74b10'],racingbulls:['#729aff','#e5edff'],rbf1team:['#729aff','#e5edff'],alpine:['#fb75c0','#3086ed'],haas:['#e5e8ed','#ee3845'],audi:['#f53e43','#b8bdc9'],williams:['#3686ff','#1736bd'],astonmartin:['#28c799','#c7e550'],cadillac:['#c5c8d0','#747b87']}
 const match=Object.keys(palette).find(k=>key.includes(k))
 const [accent,secondary]=match?palette[match]:[fallback,fallback]
 return {'--accent':accent,'--secondary':secondary,'--tint':accent+'22'} as CSSProperties
}
