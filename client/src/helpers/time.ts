import { Duration } from 'interface'

export function secondsToDuration(seconds?: number): Duration {
  if (seconds == null || Number.isNaN(seconds)) return '00:00'

  const date = new Date(seconds * 1000).toISOString()
  return (seconds < 3600 ? date.substr(14, 5) : date.substr(12, 7)) as Duration
}

export function durationToSeconds(duration?: Duration): number {
  if (duration == null) return 0

  const [seconds, minutes, hours] = duration
    .split(':')
    .map(time => Number.parseInt(time))
    .reverse()

  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0)
}
