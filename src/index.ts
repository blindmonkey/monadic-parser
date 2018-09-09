/*
Notes for future me:

Partial parsing HAS to be on request.

If this is used to be used seriously, there can't be the overhead of always
parsing everything. Really, only the potential first thing needs to be partially
parsed, but everything else needs to continue with a concrete parse.
*/


import { StringLike } from './stringlike';
import { Result } from './result';


interface Async<T> {

}



interface Parser<R extends ParseMatch> {
  parse(string: StringLike): Result<R>
}



interface IParseMatch {
//  match: StringLike;
  partial: boolean;
  parser: Parser<any>;
  partials: StringLike[];
  combine(other: ParseMatch): Result<ParseMatch>
}
interface PartialParseMatch extends IParseMatch {
  partial: true;
}
interface FullParseMatch extends IParseMatch {
  partial: false;
  match: StringLike;
}
type ParseMatch = PartialParseMatch | FullParseMatch;


abstract class ParserPartialMatchImpl<M extends ParseMatch, P extends Parser<M>> implements PartialParseMatch {
  parser: P;
  partial: true = true;
  partials: StringLike[];
  constructor(parser: P, partials: StringLike[]) {
    this.parser = parser;
    this.partials = partials;
  }
  abstract combine(other: PartialParseMatch): Result<ParseMatch>
}
abstract class ParserFullMatchImpl<M extends ParseMatch, P extends Parser<M>> implements FullParseMatch {
  parser: P;
  partial: false = false;
  match: StringLike;
  partials: StringLike[];
  constructor(parser: P, match: StringLike, partials?: StringLike[]) {
    this.parser = parser;
    this.match = match;
    this.partials = partials || [];
  }
  abstract combine(other: PartialParseMatch): Result<ParseMatch>
}




class LiteralParserPartialMatch extends ParserPartialMatchImpl<LiteralParserMatch, LiteralParser> {
  combine(other: PartialParseMatch): Result<ParseMatch> {
    if (this.parser !== other.parser) return Result.Failure();
    const expected = this.parser.expected;
    const potentials: StringLike[] = [];
    for (let i = 0; i < this.partials.length; i++) {
      const myRange = this.partials[i].rangeOnUnderlying();
      for (let j = 0; j < other.partials.length; j++) {
        const combined = this.partials[i].combineSlices(other.partials[j]);
        if (combined != null && expected.indexOf(combined.getString()) >= 0) {
          potentials.push(combined);
        }
      }
    }
    if (potentials.length > 0) {
      const fullMatch = 
    }
    return Result.Failure();
  }
}
class LiteralParserFullMatch extends ParserFullMatchImpl<LiteralParserMatch, LiteralParser> {
  combine(other: PartialParseMatch): Result<ParseMatch> {
    return Result.Failure()
  }
}
type LiteralParserMatch = LiteralParserPartialMatch | LiteralParserFullMatch;
class LiteralParser implements Parser<LiteralParserMatch> {
  expected: string;
  constructor(expected: string) {
    this.expected = expected;
    if (expected.length === 0) {
      throw 'Literal cannot be empty string.'
    }
  }
  parse(string: StringLike): Result<LiteralParserMatch> {
    console.log('Literal(', this.expected, ').parse(', string.getString(), ')');
    const firstChar = string.char(0);
    if (firstChar === null) {
      // Nothing to parse, and literals can't be empty string.
      return Result.Failure();
    }
    const expectedLength = this.expected.length;
    const literalIndices = StringLike.wrap(this.expected).findIndices(firstChar);
    if (literalIndices.length === 0) {
      // No matches
      return Result.Failure();
    }
    let fullMatch: LiteralParserFullMatch|null = null;
    let partialMatches: StringLike[] = [];
    console.log('Indices', literalIndices);
    for (let i = 0; i < literalIndices.length; i++) {
      const index = literalIndices[i];
      console.info('Exploring match at index', index, 'string slice:', this.expected.slice(index, ));
      // Start at offset 1 because we already know zero matches. At this point we're trying to determine the length
      let matchLength = 1;
      for (; matchLength < this.expected.length - index; matchLength++) {
        // index is the offset in the literal when the first character of string
        // matches. Therefore each of these is already at least a 1 char match.
        // Now we just need to scan ahead to exactly how long the match is,
        // so we break out of the loop at the first non-matching char.
        if (this.expected[index + matchLength] !== string.char(matchLength)) {
          // console.log('Char at index', index + matchLength, 'does not match string char', string.char(matchLength));
          break;
        }
      }
      // If it's the same length as the literal, it is a full match.
      if (matchLength === expectedLength) {
        fullMatch = new LiteralParserFullMatch(this, string.slice(0, matchLength));
      } else if (matchLength === string.length) {
        partialMatches.push(string.slice(index, index + matchLength));
      }
    }
    if (fullMatch != null) {
      fullMatch.partials = partialMatches;
      return Result.Success(fullMatch);
    }
    return Result.Success(new LiteralParserPartialMatch(this, partialMatches));
  }
}


class NotCharsParserPartialMatch extends ParserPartialMatchImpl<NotCharsParserMatch, NotCharsParser> {
  combine(other: PartialParseMatch): Result<ParseMatch> {
    // NotCharsParser parses one char at a time, so two can't be combined
    return Result.Failure()
  }
}
class NotCharsParserFullMatch extends ParserFullMatchImpl<NotCharsParserMatch, NotCharsParser> {
  combine(other: PartialParseMatch): Result<ParseMatch> {
    // NotCharsParser parses one char at a time, so two can't be combined
    return Result.Failure()
  }
}
type NotCharsParserMatch = NotCharsParserPartialMatch | NotCharsParserFullMatch;

class NotCharsParser implements Parser<NotCharsParserMatch> {
  private charSet: {[key: string]: true};
  constructor(private characters: string) {
    this.charSet = {};
    for (let i = 0; i < characters.length; i++) {
      this.charSet[i] = true;
    }
  }
  parse(string: StringLike): Result<NotCharsParserMatch> {
    const ch = string.char(0);
    if (ch == null) {
      // Empty string
      return Result.Failure();
    }
    if (this.charSet[ch]) {
      return Result.Success(
        new NotCharsParserFullMatch(this, string.slice(0, 1))
      );
    }
    return Result.Failure();
  }
}


// class SequenceParserPartialMatch extends ParserPartialMatchImpl<SequenceParserMatch, SequenceParser> {
//   combine(other: PartialParseMatch): Result<ParseMatch> {
//     // SequenceParser parses one char at a time, so two can't be combined
//     return Result.Failure()
//   }
// }
// class SequenceParserFullMatch extends ParserFullMatchImpl<SequenceParserMatch, SequenceParser> {
// }
// class SequenceParser implements Parser<SequenceParserMatch> {
//   constructor(private parsers: Parser<any>) {}
//   parse(string: StringLike): Result<SequenceParserMatch> {
//     return Result.Failure();
//   }
// }


// const notQuote: NotParser = new NotParser('"\n');



import { runTest } from './testing';
runTest('elephant literal test', function(assert) {

  const elephantLiteralTest = new LiteralParser('elephant');
  const elephantResult = elephantLiteralTest.parse(StringLike.wrap('elephant'));
  const eResult = elephantLiteralTest.parse(StringLike.wrap('e'));
  const elResult = elephantLiteralTest.parse(StringLike.wrap('el'));
  const ephResult = elephantLiteralTest.parse(StringLike.wrap('eph'));
  const antResult = elephantLiteralTest.parse(StringLike.wrap('ant'));


  assert.true(elephantResult.isSuccess(), 'matching full string');
  if (elephantResult.isSuccess()) {
    assert.true(!elephantResult.data.partial, 'full string is not partial');
    if (!elephantResult.data.partial) {
      assert.true(elephantResult.data.match.getString() === 'elephant', 'full string is elephant');
      assert.true(elephantResult.data.partials.length === 0, 'no partial matches for elephant');
      assert.true(elephantResult.data.parser === elephantLiteralTest, 'match contains correct parser');
    }
  }

  assert.true(eResult.isSuccess(), 'matching "e"')
  if (eResult.isSuccess()) {
    assert.true(eResult.data.partial);
    if (eResult.data.partial) {
      assert.true(eResult.data.partials.length === 2, 'e match is 2 partials');
    }
  }

  assert.true(elResult.isSuccess(), 'matching "el')
  if (elResult.isSuccess()) {
    assert.true(elResult.data.partial);
    if (elResult.data.partial) {
      assert.true(elResult.data.partials.length === 1, 'el match is 1 partial');
      console.log('el match', elResult.data.partials);
    }
  }

  assert.true(ephResult.isSuccess(), 'matching "eph')
  if (ephResult.isSuccess()) {
    assert.true(ephResult.data.partial);
    if (ephResult.data.partial) {
      assert.true(ephResult.data.partials.length === 1, 'eph match is 1 partial');
      console.log('el match', ephResult.data.partials);
    }
  }

  if (eResult.isSuccess() && elResult.isSuccess() && eResult.data.partial && elResult.data.partial) {
    const combinedEElResult = eResult.data.combine(elResult.data);
    assert.true(combinedEElResult.isFailure(), 'cannot combine e and el');
  } else {
    assert.failure('setup failed: e and el');
  }

  if (elResult.isSuccess() && elResult.data.partial && ephResult.isSuccess() && ephResult.data.partial) {
    const combinedElEphResult = elResult.data.combine(ephResult.data);
    assert.true(combinedElEphResult.isSuccess(), 'can combine el and eph');
  } else {
    assert.failure('setup failed: el and eph');
  }




});

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

interface Failure {
  type: 'failure';
}
interface Success {
  type: 'success';
  parsed: string;
}
type Result = Success | Failure;

interface PartialSuccess extends Success {
  combine(other: PartialSuccess): PartialResult;
}
type PartialResult = PartialSuccess[] | Failure;

interface Parser {
  parse(string: string, start: number): Result;
  partialParse(string: string, start: number): PartialResult;
}

class LiteralParserPartialSuccess implements PartialSuccess {
  constructor(private parser: LiteralParser, private literal: string, start: number, end: number) {}
  combine(other: PartialSuccess): PartialResult {
    if (other instanceof LiteralParserPartialSuccess && this.parser === other.parser) {

    }
  }
}
class LiteralParser implements Parser {
  constructor(private literal: string) {}
  parse(string: string, start: number): Result {
    return {type: 'failure'};
  }
  partialParse(string: string, start: number): PartialResult {
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
