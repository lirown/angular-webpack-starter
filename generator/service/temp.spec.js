import <%= upCaseName %>Service from './<%= name %>.service';
import angularMocks from 'angular-mocks/angular-mocks';

describe('@Injectable(<%= upCaseName %>)', () => {
  let $rootScope, makeController;

  beforeEach(window.module('app'));

  describe('Service', () => {
    // component/directive specs
    const service = new <%= upCaseName %>Service();

    it('has property: name', () => {
      expect(service).to.have.property('name');
    });

    it('the name property has the correct value', () => {
      expect(service.name).to.equal('<%= name %>');
    });
  });
});
