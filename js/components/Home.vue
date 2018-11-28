<template>
	<div>
		<h1 v-if="currentQuestion">{{currentQuestion.question}}</h1>
		
		<span>Question Index: {{questionIndex}} </span>
		<br/>
		<span>Tokens: {{tokens}} </span>
		<br/>
		<button v-if="questionIndex != -1" @click="nextQuestion(false)">No</button>
		<button v-if="questionIndex != -1" @click="nextQuestion(true)">Yes</button>
		<br/>
		<button v-if="questionIndex == -1" @click="restart">Restart</button>
	</div>
</template>

<script>

export default {
	data: function() {
		return {
			daters: null
		}
	},
	mounted() {
		console.log('mounted');
	},
	computed: {
		currentQuestion() {
			return this.$store.getters.getCurrentQuestion;
		},
		questionIndex() {
			return this.$store.state.currentQuestionIndex;
		},
		tokens() {
			return this.$store.getters.getTokens;
		}
	},
	methods: {
		restart() {
			this.$store.commit('restart');
		},
		nextQuestion(response) {
			this.$store.commit('nextQuestion', response);
		}
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>