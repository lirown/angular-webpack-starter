import './auth/auth.service';

if (ENVIRONMENT === 'test') {
  const TESTS = ['./users/users.spec'];
  TESTS.map(test => require(test));
}
