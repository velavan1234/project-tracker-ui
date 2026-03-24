export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isOverdue(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function getDaysOverdue(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDueDateDisplay(date: Date): { text: string; isOverdue: boolean; isToday: boolean } {
  if (isToday(date)) {
    return { text: 'Due Today', isOverdue: false, isToday: true };
  }
  
  const daysOverdue = getDaysOverdue(date);
  if (daysOverdue > 7) {
    return { text: `${daysOverdue} days overdue`, isOverdue: true, isToday: false };
  }
  
  if (isOverdue(date)) {
    return { text: formatDate(date), isOverdue: true, isToday: false };
  }
  
  return { text: formatDate(date), isOverdue: false, isToday: false };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getDaysBetween(start: Date, end: Date): number {
  const startCopy = new Date(start);
  const endCopy = new Date(end);
  startCopy.setHours(0, 0, 0, 0);
  endCopy.setHours(0, 0, 0, 0);
  const diffTime = endCopy.getTime() - startCopy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}
