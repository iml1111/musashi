export function formatRelativeTime(dateString: string): string {
  // Handle UTC timestamps from backend that may not have timezone info
  let date: Date
  
  // Check if the timestamp has timezone info
  // Timezone indicators: 'Z', '+HH:MM', '-HH:MM', '+HHMM', '-HHMM'
  const hasTimezone = dateString.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateString)
  
  if (!hasTimezone) {
    // If no timezone info, treat as UTC by adding 'Z'
    date = new Date(dateString + 'Z')
  } else {
    date = new Date(dateString)
  }
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
}

export function formatDateTime(dateString: string): string {
  // Handle UTC timestamps from backend that may not have timezone info
  let date: Date
  
  // Check if the timestamp has timezone info
  // Timezone indicators: 'Z', '+HH:MM', '-HH:MM', '+HHMM', '-HHMM'
  const hasTimezone = dateString.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateString)
  
  if (!hasTimezone) {
    // If no timezone info, treat as UTC by adding 'Z'
    date = new Date(dateString + 'Z')
  } else {
    date = new Date(dateString)
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}