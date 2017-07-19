import template from './<%= name %>.html';

@Component({
    selector: '<%= name %>',
    template
})
export default class <%= upCaseName %>Component {
  constructor () {
     this.name = '<%= name %>';
  }
}

