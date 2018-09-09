interface Tester {
  true(f: boolean, message?: string): void
  failure(message?: string, ...optionals: any[]): void
}
export function runTest(name: string, test: (t: Tester) => void) {

  let failures = 0;
  function reportFailure(message?: string, ...optionals: any[]) {
    const args = message != null ? [message].concat(optionals) : optionals;
    failures++;
    console.error.apply(console, args);
  }
  function assertTrue(condition: boolean, message?: string) {
    if (!condition) {
      reportFailure('TEST FAILED:', message);
    }
  }
  console.info('Running test', name);
  test({
    true: assertTrue,
    failure: reportFailure
  });
  console.log('--------');
  if (failures === 0) {
    console.info('TESTS PASSED:', name);
  } else {
    console.log('TESTS FAILED:', failures, 'errors');
  }
}
