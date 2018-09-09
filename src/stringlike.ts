type WrappedStringType = 'wrapped';
type SliceStringType = 'slice';
type StringLikeKind = WrappedStringType | SliceStringType;

interface IBaseStringLike {
  indexOf(contained: string, start?: number): number
  findIndices(contained: string, start?: number): number[]
}

export interface StringLike extends IBaseStringLike {
  length: number;
  equals(other: StringLike): boolean
  getKind(): StringLikeKind
  rangeOnUnderlying(): {start: number, end: number}
  getString(): string
  char(index: number): string|null
  charSlice(index: number): StringLike|null
  slice(start: number, end: number): StringLike
  combineSlices(other: StringLike): StringLike|null
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
  equals(other: StringLike): boolean {
    return this.getString() === other.getString();
  }
  abstract getString(): string
  abstract char(index: number, start?: number): string|null
  abstract indexOf(contained: string, start?: number): number
  abstract rangeOnUnderlying(): {start: number, end: number}
  protected abstract getUnderlying(): string
  abstract getKind(): StringLikeKind
  abstract combineSlices(other: StringLike): StringLike|null
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
  getKind(): StringLikeKind {
    return 'wrapped';
  }
  get length(): number {
    return this.underlying.length;
  }
  combineSlices(other: StringLike): null {
    // Wrapped strings cannot combine with anything.
    return null;
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
  combineSlices(other: StringSlice): StringLike|null {
    if (this.underlying === other.underlying && this.end === other.start) {
      if (this.start === 0 && other.end === this.underlying.length) {
        return new WrappedString(this.underlying);
      }
      return new StringSlice(this.underlying, this.start, other.end);
    }
    return null;
  }
  getKind(): 'slice' {
    return 'slice';
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
  indexOf(contained: string, start: number = 0): number {
    const result = this.underlying.indexOf(contained, this.start + start);
    if (result >= this.end) {
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
