export const daysOfWeek: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getDayOfWeek(date: string | Date ): string {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  return daysOfWeek[dayOfWeek];
}