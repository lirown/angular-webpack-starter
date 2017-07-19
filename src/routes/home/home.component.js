import template from './home.html';

@RouteConfig('main', {
    url: '/home'
})
@Component({
   selector: 'home',
   template
})
@Inject('UserService')
export default class Home {
  constructor (user) {
    this.name = 'home';
    this.user = user;
    console.log(this.name);
    console.log(__dirname);
  }
}
