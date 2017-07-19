import './button/button.component';

if (ENVIRONMENT === 'test') {
  const TESTS = ['./button/button.spec.js'];
  TESTS.map(test => require(test));
}
