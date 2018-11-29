<template>
	<div>
	<div class="ui-container">
		<h1 class="center" v-if="currentQuestion">{{currentQuestion.question}}</h1>
		<span>Question Index: {{questionIndex}} </span>
		<br/>
		<span>Tokens: {{tokens}} </span>
		<br/>
		<camera v-if="questionIndex != -1"></camera>
		<button v-if="questionIndex != -1" @click="nextQuestion(false)">No</button>
		<button v-if="questionIndex != -1" @click="nextQuestion(true)">Yes</button>
		<br/>
		<button v-if="questionIndex == -1" @click="restart">Restart</button>
	</div>
	<scene></scene>
	</div>
</template>

<script>
import Camera from './Camera.vue';
import Scene from './Scene.vue';

export default {
	components: {
		camera: Camera,
		scene: Scene,
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

<style>
.center {
	text-align: center;
}

.ui-container {
	z-index: 1;
	position: absolute;
    width: 100vw;
}

</style>
