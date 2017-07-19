import UserService from './users.service';
import angularMocks from 'angular-mocks/angular-mocks';

describe('Users', () => {
  let $rootScope, makeController;

  beforeEach(window.module('app'));

  describe('Service', () => {
    // component/directive specs
    const service = new UserService();

    it('has property: name', () => {
      expect(service).to.have.property('name');
    });

    it('the name property has the correct value', () => {
      expect(service.name).to.equal('user');
    });
  });
});
