import template from './hero.html';

@RouteConfig('hero', {
    url: '/hero'
})
@Component({
    selector: 'hero',
    template
})
export default class HeroController {
  constructor () {
    this.name = 'hero';
  }
}
