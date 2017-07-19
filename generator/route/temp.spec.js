import <%= upCaseName %>Component from './<%= name %>';
import <%= upCaseName %>Template from './<%= name %>.html';
import angularMocks from 'angular-mocks/angular-mocks';

describe('@RouteComponent(<%= upCaseName %>)', () => {
  let $rootScope, component;

  beforeEach(window.module('app'));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
  }));

  describe('Template', () => {
    // template specs
    // tip: use regex to ensure correct bindings are used e.g., {{  }}
    it('has name in template [REMOVE]', () => {
      expect(<%= upCaseName %>Template).to.match(/{{\s?vm\.name\s?}}/g);
    });
  });

  describe('Component', () => {
    // component/directive specs
    const component = new <%= upCaseName %>Component();
    const options = <%= upCaseName %>Component.$getOptions();
    // tests:
    it('includes the intended template', () => {
      expect(options.template).to.equal(<%= upCaseName %>Template);
    });

    it('uses `bindToController` syntax', () => {
      expect(options).to.have.property('bindToController');
    });

    it('uses `selector` syntax', () => {
      expect(options).to.have.property('selector');
    });

    it('has a property name', () => {
      expect(component).to.have.property('name');
    });
  });
});
