import firebase from 'firebase/app';
// import { database } from '@firebase/database';

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
// const db = firebase.database();

export const store = new Vuex.Store({

	state: {
		questions: [],
		tokens: {},
		loading : false
	},
	getters: {
		getQuestions: state => {
			return state.questions;
		},
		getTokens: state => {
			return state.getTokens;
		}
	},
	mutations: {
		setLoading(state, val) {
			state.loading = val;
		},
		setQuestions(state, val) {
			state.questions = val;
		}
	},
	actions: {
		fetchQuestions({commit, getters}) {
			return new Promise(function (resolve, reject) {
				commit('setLoading', true);
				firebase.database().ref('questions').once('value').then(data => {
					const questionDict = data.val();
					if (questionDict) {
						let questions = Object.keys(questionDict).map(key => questionDict[key]);
						commit('setQuestions', questions);
						commit('setLoading', false);
						resolve();
					}
				})
				.catch(error => {
					console.error(error);
					commit('setLoading', false);
					reject();
				});
			});
		}
	}
});