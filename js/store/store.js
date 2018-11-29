import firebase from 'firebase/app';
import { storage } from '@firebase/storage';
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
			return state.tokens;
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
		setTokens(state, tokens) {
			let stateTokens = Object.keys(state.tokens);
			tokens.forEach(token => {
				if (!(token in stateTokens)) {
					state.tokens[token] = 0;
				}
			});
		},
		restart(state) {
			state.currentQuestionIndex = 0;
			if(state.tokens) {
				Object.keys(state.tokens).forEach(title => {
					state.tokens[title] = 0;
				});
			}
		},
		nextQuestion(state, userResponse) {
			const currentTokens = state.questions[state.currentQuestionIndex].tokens;
			Object.keys(currentTokens).forEach(token => {
				//set increment value to positive or negative depending on the user's question response
				const incrementValue = currentTokens[token] * (userResponse ? 1 : -1);
				//set token key if it doesn't exist in state
				if(!(token in Object.keys(state.tokens))) {
					state.tokens[token] = incrementValue;
				} else {
					state.tokens[token] += incrementValue;
				}
			});
			
			if (state.questions.length > state.currentQuestionIndex + 1) {
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
		refreshQuestions({commit, dispatch, getters}) {
			return dispatch('fetchOnce', 'questions').then((questions) => {
				if (questions) {
					commit('setQuestions', questions);
					return questions;
				}
			});
		},
		refreshTokens({commit, dispatch}) {
			return dispatch('fetchOnce', 'tokens').then((tokens) => {
				if (tokens) {
					commit('setTokens', tokens);
					return tokens;
				}
			});
		},
		fetchOnce({commit}, path) {
			return new Promise(function (resolve, reject) {
				commit('setLoading', true);
				firebase.database().ref(path).once('value').then(fbRef => {
					const data = fbRef.val();
					let output = Object.keys(data).map(key => data[key]);
					commit('setLoading', false);
					resolve(output);
				})
				.catch(error => {
					console.error(error);
					commit('setLoading', false);
					reject();
				});
			});
		},
		saveImage({commit}, image) {
			commit('setLoading', true);
			
			//Remove img info to display properly in firebase 
			let newBase64 = image.replace(/^data:image\/(png|jpeg);base64,/, '');
			var metadata = {
				contentType: 'image/jpeg',
			};
			firebase.storage().ref().child(`${Date.now()}.jpg`).putString(newBase64, 'base64', metadata).then(() => {
				commit('setLoading', false);
			}).catch(error => {
				console.error(error);
				commit('setLoading', false);
			});
		},
	}
});

store.subscribe((mutation, state) => {
	// Store the state object as a JSON string
	localStorage.setItem('store', JSON.stringify(state));
});
