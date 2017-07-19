import template from './<%= name %>.html';

@RouteConfig('<%= name %>', {
    url: '/<%= name %>'
})
@Component({
    selector: '<%= name %>',
    template
})
export default class <%= upCaseName %>RouteComponent {
  constructor () {
    this.name = '<%= name %>';
  }
}
