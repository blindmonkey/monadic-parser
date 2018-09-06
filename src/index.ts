interface IParseResult<T> {
  isFailure(): this is ParseFailure<T>
  isSuccess(): this is ParseSuccess<T>
}
interface ParseFailure<T> extends IParseResult<T> {
  type: 'failure';
}
interface ParseSuccess<T> extends IParseResult<T> {
  type: 'success';
  data: T;
}
type ParseResult<T> = ParseFailure<T> | ParseSuccess<T>;
namespace ParseResult {
  class ParseFailureImpl<T> implements ParseFailure<T> {
    type: 'failure' = 'failure';
    isFailure(): this is ParseFailure<T> { return true }
    isSuccess(): this is ParseSuccess<T> { return false }
  }
  export const failure = new ParseFailureImpl();

  class ParseSuccessImpl<T> implements ParseSuccess<T> {
    type: 'success' = 'success';
    data: T;
    constructor(data: T) {
      this.data = data;
    }
    isFailure(): this is ParseFailure<T> { return false }
    isSuccess(): this is ParseSuccess<T> { return true }
  }
  export function success<T>(data: T): ParseSuccess<T> {
    return new ParseSuccessImpl(data);
  }
}





class LiteralParserResult {
  
}
class LiteralParser {
  constructor(private expected: string) {}
  
}





/**





function findIndices(container: string, contained: string, start: number = 0): number[] {
  const indices: number[] = [];
  while (true) {
    const index = container.indexOf(contained, start);
    if (index >= 0) {
      indices.push(index);
      start = index + 1;
    } else {
      break;
    }
  }
  return indices;
}

interface ParseFailure {
  type: 'failure';
}
interface ParseSuccess {
  type: 'success';
  parsed: string;
}
type ParseResult = ParseSuccess | ParseFailure;

interface PartialParseSuccess extends ParseSuccess {
  combine(other: PartialParseSuccess): PartialParseResult;
}
type PartialParseResult = PartialParseSuccess[] | ParseFailure;

interface Parser {
  parse(string: string, start: number): ParseResult;
  partialParse(string: string, start: number): PartialParseResult;
}

class LiteralParserPartialSuccess implements PartialParseSuccess {
  constructor(private parser: LiteralParser, private literal: string, start: number, end: number) {}
  combine(other: PartialParseSuccess): PartialParseResult {
    if (other instanceof LiteralParserPartialSuccess && this.parser === other.parser) {

    }
  }
}
class LiteralParser implements Parser {
  constructor(private literal: string) {}
  parse(string: string, start: number): ParseResult {
    return {type: 'failure'};
  }
  partialParse(string: string, start: number): PartialParseResult {
    const startchar = string[start];
    const literalIndices = findIndices(this.literal, startchar);
    if (literalIndices.length === 0) {
      return { type: 'failure' };
    }
    const candidates: LiteralParserPartialSuccess[] = [];
    for (let i = 0; i < literalIndices.length; i++) {
      const index = literalIndices[i];
      let match = true;
      for (let j = 1; j < this.literal.length - index; j++) {
        if (this.literal[index + j] !== string[start = j]) {
          match = false;
          break;
        }
      }
      if (match) {
        const matchLength = this.literal.length - index;
        candidates.push(this, new LiteralParserPartialSuccess(this.literal, index, ))
      }
    }
  }
}

class SequenceParser implements Parser {
  constructor(private subparsers: Parser[]) {}
}

const stringParser = new SequenceParser([
  new LiteralParser('"'),

  new LiteralParser('"'),
])
*/