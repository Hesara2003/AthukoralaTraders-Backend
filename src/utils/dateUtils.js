/**
 * Check if a date is a business day (not a weekend)
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is a business day
 */
export function isBusinessDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Get the next business day after a given date
 * @param {Date} date - Starting date
 * @param {number} daysToAdd - Number of business days to add
 * @returns {Date} Next business day
 */
export function getNextBusinessDay(date = new Date(), daysToAdd = 1) {
  const result = new Date(date);
  let businessDaysAdded = 0;

  while (businessDaysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      businessDaysAdded++;
    }
  }

  return result;
}

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };

  return new Date(date).toLocaleString('en-US', defaultOptions);
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function getRelativeTimeString(date) {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((targetDate - now) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  // Helper function to pluralize units
  const plural = (num, unit) => num === 1 ? unit : `${unit}s`;

  // Convert to appropriate unit
  if (absSeconds < 60) {
    return diffInSeconds >= 0 ? 'in a few seconds' : 'just now';
  } else if (absSeconds < 3600) {
    const minutes = Math.floor(absSeconds / 60);
    return diffInSeconds >= 0
      ? `in ${minutes} ${plural(minutes, 'minute')}`
      : `${minutes} ${plural(minutes, 'minute')} ago`;
  } else if (absSeconds < 86400) {
    const hours = Math.floor(absSeconds / 3600);
    return diffInSeconds >= 0
      ? `in ${hours} ${plural(hours, 'hour')}`
      : `${hours} ${plural(hours, 'hour')} ago`;
  } else {
    const days = Math.floor(absSeconds / 86400);
    return diffInSeconds >= 0
      ? `in ${days} ${plural(days, 'day')}`
      : `${days} ${plural(days, 'day')} ago`;
  }
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  if (!date) return false;
  const today = new Date();
  const targetDate = new Date(date);
  return today.toDateString() === targetDate.toDateString();
}

/**
 * Format a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  // If same day, just show one date with time range
  if (start.toDateString() === end.toDateString()) {
    return `${formatDate(start, { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })} between ${formatDate(start, { 
      hour: 'numeric',
      minute: 'numeric'
    })} and ${formatDate(end, {
      hour: 'numeric',
      minute: 'numeric'
    })}`;
  }

  // Otherwise show full range
  return `${formatDate(start)} to ${formatDate(end)}`;
}