<template>
	<div >
		<div v-loading="loading" style="margin-top: 200px;">

		</div>
		<el-button @click="handleShowResult">下一步</el-button>
	</div>
</template>

<script>
	export default {
		name: "Loading.vue",
		data(){
			return{
				loading:true
			};
		},
		methods:{
			handleShowResult(){
				let self = this;
				self.editor.showResult();
			}
		}
	};
</script>

<style scoped>

</style>
