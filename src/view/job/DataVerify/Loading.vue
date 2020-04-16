<template>
	<div >
		<div v-loading="loading" style="margin-top: 100px;padding-bottom:100px"></div>
		<div class="btn-box">
			<el-button @click="handleShowResult" size="mini">刷新</el-button>
			<el-button @click="handleShowAddList" size="mini">返回</el-button>
			<el-button @click="handleVerifyCancle" size="mini">取消</el-button>
		</div>
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
			},
			handleShowAddList(){
				let self = this;
				self.editor.showDataVerify();
			},
			handleVerifyCancle(){
				// let self = this;
				// self.editor.showResult();
			}
		}
	};
</script>

<style scoped>
	.btn-box{
		display: flex;
		justify-content: center;
		margin-top: 30px;
	}
</style>
