/**
 * Date utility functions for British calendar format (DD/MM/YYYY)
 * and consistent date formatting across the application
 */

// British date format configuration
const BRITISH_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const BRITISH_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Format date to British format (DD/MM/YYYY)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatToBritishDate = (date: string | Date | number): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-GB', BRITISH_DATE_OPTIONS);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date and time to British format (DD/MM/YYYY, HH:MM)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted datetime string in British format
 */
export const formatToBritishDateTime = (date: string | Date | number): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-GB', BRITISH_DATETIME_OPTIONS);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date for relative display (with British format fallback)
 * @param dateString - Date string from API
 * @returns Relative time string (e.g., "2 hours ago") or British date format
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      // Use British date format for older dates
      return formatToBritishDate(date);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return formatToBritishDate(dateString);
  }
};

/**
 * Get current date in British format
 * @returns Current date in DD/MM/YYYY format
 */
export const getCurrentBritishDate = (): string => {
  return formatToBritishDate(new Date());
};

/**
 * Get current date and time in British format
 * @returns Current datetime in British format
 */
export const getCurrentBritishDateTime = (): string => {
  return formatToBritishDateTime(new Date());
};

/**
 * Parse British date format (DD/MM/YYYY) to Date object
 * @param britishDate - Date string in DD/MM/YYYY format
 * @returns Date object or null if invalid
 */
export const parseBritishDate = (britishDate: string): Date | null => {
  try {
    const parts = britishDate.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    
    // Validate the date
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing British date:', error);
    return null;
  }
};

/**
 * Check if a date string is in valid British format
 * @param dateString - Date string to validate
 * @returns Boolean indicating if the format is valid
 */
export const isValidBritishDate = (dateString: string): boolean => {
  const britishDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!britishDatePattern.test(dateString)) return false;
  
  return parseBritishDate(dateString) !== null;
};