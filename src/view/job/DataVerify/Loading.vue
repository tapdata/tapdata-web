<template>
	<div >
		<div v-loading="loading" style="margin-top: 100px;padding-bottom:100px"></div>
		<div class="btn-box">
			<el-button @click="handleShowResult" size="mini">{{ $t('dataVerify.refresh')}}</el-button>
			<el-button @click="handleVerifyCancel" size="mini">{{ $t('dataVerify.cancel')}}</el-button>
		</div>
	</div>
</template>

<script>
	import factory from '../../../api/factory';

	const dataFlows = factory('DataFlows');

	export default {
		name: "Loading.vue",
		data(){
			return{
				loading:true,
				id:'',
			};
		},
		created() {
			this.id = this.getUrlSearch('id');
		},
		methods:{
			handleShowResult(){
				this.editor.showResult();
			},
			handleVerifyCancel(){
				let self = this;
				// 状态修改为 draft
				let data ={
					validateStatus:'draft'
				};
				dataFlows.patchId(this.id,data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						self.editor.showDataVerify();
					}
				});
			},
			getUrlSearch(name) {
				// 未传参，返回空
				if (!name) return null;
				// 查询参数：先通过search取值，如果取不到就通过hash来取
				var after = window.location.search;
				after = after.substr(1) || window.location.hash.split('?')[1];
				// 地址栏URL没有查询参数，返回空
				if (!after) return null;
				// 如果查询参数中没有"name"，返回空
				if (after.indexOf(name) === -1) return null;
				var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
				// 当地址栏参数存在中文时，需要解码，不然会乱码
				var r = decodeURI(after).match(reg);
				// 如果url中"name"没有值，返回空
				if (!r) return null;
				return r[2];
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
