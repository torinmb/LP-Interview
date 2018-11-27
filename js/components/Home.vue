<template>
	<span> Home! </span>
</template>

<script>

export default {
	data: function() {
		return {
			daters: null
		}
	},
	mounted() {
		this.$store.dispatch('fetchQuestions').then((data) => {
			console.log(this.$store.getters.getQuestions);
		})
		console.log('mounted');
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>