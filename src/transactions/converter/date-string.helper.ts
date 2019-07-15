export class DateStringHelper {

  public static getDateStart(value: string): string {
    const date: Date = new Date(value);
    date.setUTCHours(0, 0, 0);

    return date.toISOString();
  }

  public static getTomorrowDateStart(value: string): string  {
    const date: Date = new Date(value);
    date.setDate(date.getDate() + 1);
    date.setUTCHours(0, 0, 0);

    return date.toISOString();
  }
}
