import './home/home.component';
import './hero/hero.component';

if (ENVIRONMENT === 'test') {
  const TESTS = ['./hero/hero.spec', './home/home.spec'];
  TESTS.map(test => require(test));
}
