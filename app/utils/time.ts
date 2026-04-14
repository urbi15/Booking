export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime) return ''
  
  const [h, m] = startTime.split(':').map(Number)
  const totalMinutes = (h ?? 0) * 60 + (m ?? 0) + durationMinutes
  
  const endHours = Math.floor(totalMinutes / 60)
  const endMins = totalMinutes % 60
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}