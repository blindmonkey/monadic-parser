interface IBaseStringLike {
  indexOf(contained: string, start?: number): number
  findIndices(contained: string, start?: number): number[]
}

export interface StringLike extends IBaseStringLike {
  length: number;
  rangeOnUnderlying(): {start: number, end: number}
  getString(): string
  char(index: number): string|null
  charSlice(index: number): StringLike|null
  slice(start: number, end: number): StringLike
}
export namespace StringLike {
  export function wrap(str: string): StringLike {
    return new WrappedString(str);
  }
  export function slice(str: string, start: number, end: number): StringLike {
    return new StringSlice(str, start, end);
  }
}

abstract class BaseStringLike implements StringLike {
  abstract length: number;
  abstract getString(): string
  abstract char(index: number, start?: number): string|null
  abstract indexOf(contained: string, start?: number): number
  abstract rangeOnUnderlying(): {start: number, end: number}
  protected abstract getUnderlying(): string
  charSlice(index: number): StringLike|null {
    const slice = this.slice(index, index + 1);
    if (slice.length === 0) {
      return null;
    }
    return slice;
  }
  slice(start: number, end: number): StringLike {
    const range = this.rangeOnUnderlying();
    start = Math.max(start + range.start, range.start);
    end = Math.min(end + range.start, range.end);
    return StringLike.slice(this.getUnderlying(), start, end);
  }
  findIndices(contained: string, start: number = 0) {
    const indices: number[] = [];
    while (true) {
      const index = this.indexOf(contained, start);
      if (index >= 0) {
        indices.push(index);
        start = index + 1;
      } else {
        break;
      }
    }
    return indices;
  }
}

class WrappedString extends BaseStringLike implements StringLike {
  constructor(private underlying: string) { super() }
  get length(): number {
    return this.underlying.length;
  }
  indexOf(contained: string, start?: number): number {
    return this.underlying.indexOf(contained, start);
  }
  protected getUnderlying(): string {
    return this.underlying;
  }
  rangeOnUnderlying(): {start: number, end: number} {
    return {
      start: 0,
      end: this.underlying.length
    };
  }
  getString(): string { return this.underlying }
  char(index: number): string|null {
    const result = this.underlying[index];
    if (result != null) {
      return result;
    }
    return null;
  }
}
class StringSlice extends BaseStringLike implements StringLike {
  private cached: string|null = null;
  constructor(private underlying: string,
              private start: number,
              private end: number) {
    super();
    this.start = Math.max(Math.min(start, underlying.length - 1), 0);
    this.end   = Math.max(Math.min(end,   underlying.length),     0);
  }
  get length(): number {
    return this.end - this.start;
  }
  protected getUnderlying(): string {
    return this.underlying;
  }
  rangeOnUnderlying(): {start: number, end: number} {
    return {
      start: this.start,
      end: this.end
    };
  }
  indexOf(contained: string, start?: number): number {
    const result = this.underlying.indexOf(contained, start);
    if (result < this.start || result >= this.end) {
      return -1;
    }
    return result;
  }
  getString(): string {
    if (this.cached != null) {
      return this.cached;
    }
    return this.cached = this.underlying.slice(this.start, this.end);
  }
  char(index: number): string|null {
    if (index < this.start || index >= this.end) {
      return null;
    }
    return this.underlying[this.start + index];
  }
}
