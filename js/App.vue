<template>
	<main id="app" class="section">
		<div class="container">
			<!-- <router-view></router-view> -->
			<home></home>
		</div>
	</main>
</template>

<script>
import Home from './components/Home.vue';

export default {
	data: function() {
		return {
			daters: null
		}
	},
	components: {
		home: Home
	},
	methods: {
		somefunction() {
			console.log('yee');
		}
	},
	created() {
	// when the app is created run the set user method
	// this uses Vuex to check if a user is signed in
	// check out mutations in the store.js file
	}
};
</script>

