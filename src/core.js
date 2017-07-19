'use strict';
/**
 * angular 2 style anotation in angular 1 app
 */
const app = angular.module('app', []);

// Utils functions

function camelCaseToDashCase (input) {
    return input.replace(/([A-Z])/g, ($1) =>  '-' + $1.toLowerCase());
}

function pascalCaseToCamelCase (str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
}

function dashCaseToCamelCase (string) {
    return string.replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());
}

function pascalCaseToDashCase (str) {
  return camelCaseToDashCase(pascalCaseToCamelCase(str));
}

//
function Run () {
    return function decorator (target, key, descriptor) {
        app.run(descriptor.value);
    };
}

function Config () {
    return function decorator (target, key, descriptor) {
        app.config(descriptor.value);
    };
}

function Injectable (options) {
    return function decorator (target) {
        options = options || {};
        app.service(options.name || target.name, target);
    };
}

function Pipe (options) {
    return function decorator (target) {
      options = options || {};
      options.name = options.name || pascalCaseToCamelCase((target.name).replace('Filter', '').replace('Pipe', ''));

      if (target.$inject) {
        const filter_defenition = angular.copy(target.$inject);
        filter_defenition.push((...dependencies) => {
          const target_instance = new target(...dependencies);

          if (!target_instance.transform || !(target_instance.transform instanceof Function)) {
            throw new Error('@Pipe() must contains transform method!');
          }

          return target_instance.transform.bind(target_instance);
        });

        app.filter(options.name, filter_defenition);
      } else {
        if (!target.transform || !(target.transform instanceof Function)) {
          throw new Error('@Pipe() must contains transform method!');
        }

        app.filter(options.name, () => target.transform);
      }
    };
}

function Inject (...dependencies) {
    return function decorator (target, key, descriptor) {
        // if it's true then we injecting dependencies into function and not Class constructor
        if (descriptor) {
            const fn = descriptor.value;
            fn.$inject = dependencies;
        } else {
            target.$inject = dependencies;
        }
    };
}

function Component (options) {
    options = options || {};

    const defaults = {
      template: options.template,
      restrict: 'E',
      scope: {},
      bindToController: true,
      controllerAs: 'vm'
    };

    return function decorator (target) {
        if (!options.selector) {
            throw new Error('@Component() must contains selector property!');
        }

        if (options.selector.indexOf('[') !== -1) {
          defaults.restrict = 'A';
          options.selector = options.selector.replace(/\[|\]/g, '');
        }

        target.$initView = function (directiveName) {
          directiveName = pascalCaseToCamelCase(directiveName);
          directiveName = dashCaseToCamelCase(directiveName);
          options.bindToController = options.bindToController || options.bindings || {};

          if (!options.template && options.path) {
             options.template = require(`./${options.path.replace('.component.js', '.html')}`);
          }

          app.directive(directiveName, function () {
            return Object.assign(defaults, {controller: target}, options);
          });
        };

        target.$getOptions = function () {
            return options;
        };

        target.$initView(options.selector);
    };
}

function Directive (options) {
    return function decorator (target) {
      options.restrict = 'E';

      if (options.selector.indexOf('[') !== -1) {
        options.restrict = 'A';
        options.selector = options.selector.replace(/\[|\]/g, '');
      }

      const directiveName = dashCaseToCamelCase(options.selector);

      if (target.$inject) {
        const directive_definition = angular.copy(target.$inject);
        directive_definition.push((...dependencies) => (new target(...dependencies)));
        app.directive(directiveName, directive_definition);
      }      else {
        app.directive(directiveName, target.directiveFactory);
      }
    };
}

function RouteConfig (stateName, options) {
    return function decorator (target) {
       const tag = pascalCaseToDashCase(target.name).replace('-component', '');

       app.config(['$stateProvider', ($stateProvider) => {
            $stateProvider.state(stateName, Object.assign(
              options.template ? {
                  controller: target,
                  controllerAs: 'vm',
                  template: options.template
              } : {
               template: `<${tag}></${tag}>`
              }, options));
        }]);
    };
}

/**
 * decorator for register methods to events
 */
function On (eventName) {
  return function decorator (target, key, descriptor) {
    target.constructor.prototype._events = target.constructor.prototype._events || [];

    target.constructor.prototype._events.push({eventName, key});

    target.constructor.prototype.initEventEmitter = function ({EventEmitter, $scope}) {
      if (!EventEmitter) {
        throw new Error('EventEmitter dependency is missing for the On decorator');
      }

      if (!$scope) {
        throw new Error('$scope dependency is missing for the On decorator');
      }

      this.$scope = $scope;
      this.EventEmitter = EventEmitter;

      this.emit = (eventName, cb) => this.EventEmitter.emit(eventName, cb);

      for (const _event of this._events) {
        this.EventEmitter.on(_event.eventName, _event.key, this, true);
        console.log(eventName, target, key, descriptor);
      }
    };
  };
}
/*
Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
  })
);

class RootRoute extends Relay.Route {
  static queries = {
      root: () => Relay.QL`query { root }`
  };

  static routeName = 'RootRoute';
}

const rootRoute = new RootRoute();

function RelayContainer(options){

  const mergeObjs = function(obj1, obj2) {
    return _.mergeWith(obj1, obj2, (obj, src) => {
      if(_.isArray(obj)) {
        return src;
      }
    })
  };

  return function(target){
    target.prototype.createContainer = function(options, forceFetch){
      const $scope = this.$scope;
      const Container = new Relay.createGenericContainer(`${options.name}Container`, options);
      const container = new Container(({ error, data, done }) => {
        if(done) {
          if(error){
            container.callbacks.forEach(cbs => cbs.reject(error));
            container.callbacks = [];
          } else {
            container.callbacks.forEach(cbs => cbs.resolve(data));
            container.callbacks = [];

            if (!$scope.$root.$$phase) {
              $scope.$apply(() => {
                mergeObjs(this, data.root);
              });
            } else {
              mergeObjs(this, data.root);
            }
          }
        }
      });

      container.callbacks = [];

      const rootContainer = new Relay.GenericRootContainer(({ data }) => {
        if(data == null) {
          return;
        }

        if(Object.keys(container.variables).length === 0 && options.initialVariables){
          container.variables = options.initialVariables;
        }

        container.update({route: data.route, fragmentInput: data})
        if (forceFetch) {
          container.forceFetch();
        }
      });

      rootContainer.update(Container, rootRoute);

      return container;
    }

    target.prototype.refresh = function(name){
      if(!this._refreshContainers){
        this._refreshContainers = {};
      }

      let container = this._refreshContainers[name];
      if(!container) {
        if(!options.refreshFragments)
          throw new Error('refreshFragments must be defined to use the refresh method');

        const fragments = options.refreshFragments[name];
        if(!fragments)
          throw new Error('no refresh fragments are found with name ' + name);

        container = this._refreshContainers[name] = this.createContainer({
          name: target.name + _.capitalize(name),
          initialVariables: this.variables,
          fragments
        }, true);
      } else {
        container.variables = JSON.parse(JSON.stringify(this.variables));
        container.forceFetch();
      }

      return new Promise((resolve, reject) => container.callbacks.push({ resolve, reject }));
    }

    target.prototype.refreshVariables = function(){
      this.variables = JSON.parse(JSON.stringify(this.variables));
      this.container.setVariables(this.variables);
    };

    target.prototype.forceFetch = function(options){
      this.container.variables = Object.assign(JSON.parse(JSON.stringify(this.variables)), options || {});
      this.container.forceFetch();

      return new Promise((resolve, reject) => this.container.callbacks.push({ resolve, reject }));
    };

    target.prototype.commitUpdate = function(mutationClass, mutationData, callbacks) {
      return new Promise((resolve, reject) => {
        const $rootScope = this.$scope.$root;
        this.loading = 1;
        Relay.Store.commitUpdate(new mutationClass(Object.assign({ data: mutationData }, { rootId: this.__dataID__ })), {
          onSuccess: (data) => {
            this.loading = 0;
            resolve(data);
          },
          onFailure: reject
        })
      })
    };

    target.prototype.initRelay = function($scope, initialVariables){
      this.$scope = $scope;

      if (!$scope || !$scope.constructor.name === 'Scope'){
        throw new Error('need $scope as first argument for initRelay');
      }

      if (initialVariables) {
        options.initialVariables = options.initialVariables || {};
        Object.assign(options.initialVariables, initialVariables);
      }
      console.log('override variables');
      this.variables = JSON.parse(JSON.stringify(options.initialVariables || {}));

      this.container = this.createContainer(Object.assign(options, { name: target.name }));
      return new Promise((resolve, reject) => this.container.callbacks.push({ resolve, reject }));
    }
  }
}

const Autobind = (window.CoreDecorators || {}).autobind;
const Debounce = (window.CoreDecorators || {}).debounce;
*/
// bootstraping app
function bootstrap (mainModule, dependencies = []) {
  dependencies.forEach(dependency => mainModule.requires.push(dependency));

  angular.element(document).ready(function () {
    angular.bootstrap(document, [mainModule.name], {
      strictDi: false
    });
  });
}

function guid () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

export default app;
export {Component, RouteConfig, Inject, Run, Config, Injectable, Pipe, Directive, On, /* RelayContainer, Events, Autobind, Debounce, */ bootstrap, guid};
