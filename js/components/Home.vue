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
		console.log('mounted');
	},
	destroyed() {
		console.log('destroyed')
	}
};
</script>