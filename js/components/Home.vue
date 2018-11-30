<template>
	<div>
	<div class="ui-container">
		<h1 class="center" v-if="currentQuestion">{{currentQuestion.question}}</h1>

		<div class="footer">
			<ul>
				<li v-if="Object.keys(tokens).length > 0" v-for="(value, key) in tokens" :key="key">
					{{ key }}: {{ value }}
				</li>
			</ul>
		</div>
		<camera v-if="questionIndex != -1"></camera>
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

ul {
	display:inline
}

.footer {
	position: absolute;
	bottom: 40px;
	width: 100vw;
	height: 80px;
}

li {
	color: white;
	opacity: 0.8;
	display: inline-block;
	margin-left: 20px;
	font-size: 20px;
}

h1 {
	margin-top: 40px;
	color: white;
}
.center {
	text-align: center;
}

.ui-container {
	z-index: 1;
	position: absolute;
    width: 100vw;
	height: 100vh;
}

</style>
