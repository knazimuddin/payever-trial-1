export class AtomDateConverter {

  public static fromAtomFormatToDate(incoming: string): Date {
    const parsed: RegExpMatchArray = incoming.match(
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*/,
    );

    return new Date(parsed[1]);
  }

  public static fromDateToAtomFormat(incoming: Date): any {
    const parsed: RegExpMatchArray = incoming.toISOString().match(
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*/,
    );

    return `${parsed[1]}+00:00`;
  }
}
