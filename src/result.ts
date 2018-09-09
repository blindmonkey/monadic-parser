
interface IResult<T> {
  isFailure(): this is Failure<T>
  isSuccess(): this is Success<T>
}
interface Failure<T> extends IResult<T> {
  type: 'failure';
}
interface Success<T> extends IResult<T> {
  type: 'success';
  data: T;
}
export type Result<T> = Failure<T> | Success<T>;
export namespace Result {
  class FailureImpl<T> implements Failure<T> {
    type: 'failure' = 'failure';
    isFailure(): this is Failure<T> { return true }
    isSuccess(): this is Success<T> { return false }
  }
  export const failure = new FailureImpl();

  class SuccessImpl<T> implements Success<T> {
    type: 'success' = 'success';
    data: T;
    constructor(data: T) {
      this.data = data;
    }
    isFailure(): this is Failure<T> { return false }
    isSuccess(): this is Success<T> { return true }
  }
  export function Failure<T>(): Failure<T> {
    return failure as Failure<T>;
  }
  export function Success<T>(data: T): Success<T> {
    return new SuccessImpl(data);
  }
}
