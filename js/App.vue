<template>
	<main id="app" class="section">
		<div class="container">
			<home></home>
		</div>
	</main>
</template>

<script>
import Home from './components/Home.vue';

export default {
	components: {
		home: Home
	},
	created() {
		//pull new questions from firebase when the app loads
		this.$store.dispatch('refreshQuestions');
		this.$store.dispatch('refreshTokens');
	}
};
</script>

