// Angular & Router ES6 Imports
console.log('starting...');
import angular from 'angular';
import angularAnimate from 'angular-animate';
import angularUIRouter from 'angular-ui-router';
import App from './core.js';
import {bootstrap} from './core.js';

import './components/index';
import './routes/index';
import './services/index';
import './app.config';

// Single Style Entry Point
import './index.scss';

bootstrap(App, ['ui.router']);

if (ENVIRONMENT === 'test') {
    require('services/users/users.spec.js');
}


// Router Configuration
// Components must be declared first since
// Routes reference controllers that will be bound to route templates.
// appConfiguration(app);
