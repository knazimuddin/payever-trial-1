export class Uniqid {
  public static generate(prefix: string = '', entropy: boolean = false): string {
    let result: string = prefix
      + this.seed(parseInt((new Date().getTime() / 1000).toString(), 10), 8)
      + this.seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5)
    ;

    if (entropy) {
      result += (Math.random() * 10).toFixed(8).toString();
    }

    return result;
  }

  private static seed(incoming: number, w: number): string {
    const seed: string = parseInt(incoming.toString(), 10).toString(16);

    return w < seed.length
      ? seed.slice(seed.length - w)
      : (w > seed.length)
        ? new Array(1 + (w - seed.length)).join('0') + seed
        : seed
      ;
  }
}
