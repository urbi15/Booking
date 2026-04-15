export const calculateEndTime = (
  startTime: string,
  durationMinutes: number
): string => {
  if (!startTime) return ''

  const parts = startTime.split(':')
  if (parts.length !== 2) return ''

  const h = Number(parts[0])
  const m = Number(parts[1])

  if (Number.isNaN(h) || Number.isNaN(m)) {
    return ''
  }

  const totalMinutes = h * 60 + m + durationMinutes

  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}