import { StringLike } from '../stringlike';
import { Result } from '../result';

interface ParseMatch {
  parser: Parser
  search: StringLike
}

interface MatchDetails<SubMatch extends ParseMatch> {
  match: StringLike
  submatch: SubMatch|null
}

export interface PartialMatch extends ParseMatch {
  matches: MatchDetails<ParseMatch>[]
}

export interface FullMatch extends ParseMatch, MatchDetails<FullMatch> {}

export interface Parser {
  match(string: StringLike): Result<FullMatch>
  partials(string: StringLike): Result<PartialMatch>
}
