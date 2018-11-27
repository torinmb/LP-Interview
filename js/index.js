import firebase from 'firebase/app';
import {database} from '@firebase/database';
import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import {dbConfig} from './dbConfig.js';
import {routes} from './router/routes';
import {store} from './store/store';

firebase.initializeApp(dbConfig);

window.db = firebase.database();

Vue.use(VueRouter);
Vue.config.devtools = true;
Vue.config.productionTip = false;

const router = new VueRouter({routes: routes, mode: 'history'});

new Vue({ el: '#app', store: store, router: router, render: h => h(App) });