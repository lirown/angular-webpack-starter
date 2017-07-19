import template from './button.html';

@Component({
    selector: 'button',
    template
})
export default class ButtonComponent {
  constructor () {
     this.name = 'button';
  }
}

