import firebase from 'firebase/app';

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({

	state: {
		questions: [],
		currentQuestionIndex: 0,
		tokens: {},
		loading : false
	},
	getters: {
		getCurrentQuestion: state => {
			if (state.questions.length > state.currentQuestionIndex && state.currentQuestionIndex != -1) {
				return state.questions[state.currentQuestionIndex];
			}
			return null;
		},
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
		setCurrentQuestionIndex(state, val) {
			state.currentQuestionIndex = val;
		},
		setQuestions(state, val) {
			state.questions = val;
		},
		restart(state) {
			state.currentQuestionIndex = 0;
		},
		nextQuestion(state) {
			if (state.questions.length > state.currentQuestionIndex +1) {
				state.currentQuestionIndex += 1;
			} else {
				state.currentQuestionIndex = -1;
			}
		},
		initializeStore(state) {
			// Check if the ID exists
			if (localStorage.getItem('store')) {
				// Replace the state object with the stored item
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('store')))
				);
			}
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

store.subscribe((mutation, state) => {
	// Store the state object as a JSON string
	localStorage.setItem('store', JSON.stringify(state));
});
