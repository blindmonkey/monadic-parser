import { StringLike } from '../stringlike';
import { Result } from '../result';
import { Parser, PartialMatch, FullMatch } from './parser';

class LiteralFullMatch implements FullMatch {
  parser: Parser
  search: StringLike
  match: StringLike
  submatch = null
  constructor(parser: Parser, search: StringLike, match: StringLike) {
    this.parser = parser
    this.search = search
    this.match = match
  }
}
class LiteralParser implements Parser {
  expected: string;
  constructor(expected: string) {
    this.expected = expected;
  }
  match(string: StringLike): Result<FullMatch> {
    const match = string.slice(0, this.expected.length)
    if (match.getString() === this.expected) {
      return Result.Success(new LiteralFullMatch(this, string, match));
    }
    return Result.Failure();
  }
  partials(string: StringLike): Result<PartialMatch> {
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
