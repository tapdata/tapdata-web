<template>
	<el-dialog
		class="changeInstance-dialog"
		title="版本切换"
		:visible.sync="dialogVisible"
		width="30%"
		:before-close="handleClose"
	>
		<el-select v-model="currentVersion" size="mini" @change="handleChangeList">
			<el-option
				class="label"
				placeholder="请选择实例版本"
				:value="item.version"
				:label="item.version"
				v-for="item in list"
				:key="item"
				:disabled="item.enable"
			></el-option>
		</el-select>
		<div class="changelist" v-html="changeList"></div>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleClose">取 消</el-button>
			<el-button type="primary" @click="changeInstance">确 定</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'changeInstanceDialog',
	props: ['dialogVisible', 'region', 'zone'],
	data() {
		return {
			currentVersion: '',
			changeList: '',
			list: []
		}
	},
	created() {
		this.getVersionList()
	},
	methods: {
		getVersionList() {
			let filter = {
				where: {
					region: this.region,
					zone: this.zone
				}
			}
			this.$axios
				.get('api/tcm/productRelease?filter=' + encodeURIComponent(JSON.stringify(filter)))
				.then(data => {
					this.list = data.items
				})
				.finally(() => {
					this.loading = false
				})
		},
		changeInstance() {
			let id = this.$route.query.id
			this.$axios
				.patch('api/tcm/agent/version', {
					id,
					version: this.currentVersion
				})
				.then(data => {
					this.$message.success('修改成功')
					this.$emit('update:dialogVisible', false)
				})
		},
		handleChangeList(val) {
			let list = this.list.filter(item => item.version === val)
			this.changeList = list[0].changeList
		},
		handleClose() {
			this.$emit('update:dialogVisible', false)
		}
	}
}
</script>

<style lang="scss" scoped>
.changeInstance-dialog {
	.label {
		width: 100%;
		margin-bottom: 10px;
	}
	.changelist {
		font-size: 12px;
		color: map-get($fontColor, normal);
	}
}
</style>
<style lang="scss">
.changeInstance-dialog {
	.el-radio.is-bordered + .el-radio.is-bordered {
		margin-left: 0;
	}
}
</style>
