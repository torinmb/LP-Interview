<template>
	<div>
		<h1 v-if="currentQuestion">{{currentQuestion.question}}</h1>
		
		<span>Question Index: {{questionIndex}} </span>
		<br/>
		<button v-if="questionIndex != -1" @click="nextQuestion">Next</button>
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
	},
	methods: {
		restart() {
			this.$store.commit('restart');
		},
		nextQuestion() {
			this.$store.commit('nextQuestion');
		}
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>