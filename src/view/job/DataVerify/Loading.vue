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
	import factory from '../../../api/factory';
	import log from "../../../log";

	const dataFlows = factory('DataFlows');

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
				let self = this;
				// 状态修改为 draft
				let data ={
					validateStatus:'draft'
				};
				dataFlows.patchId(this.id,data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						self.editor.showLoading();
					}
				});
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
