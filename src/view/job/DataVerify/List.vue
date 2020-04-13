<template>
	<div class="data-verify">
		<div class="table-box">
			<div class="dv-header">数据校验</div>
			<el-table
					:data="tableData"
					border
					style="width: 100%">
				<el-table-column
						prop="date"
						label="校验方式"
						width="180">
				</el-table-column>
				<el-table-column
						prop="name"
						label="检验条件"
						width="180">
				</el-table-column>
				<el-table-column
						prop="address"
						label="源头表">
				</el-table-column>
				<el-table-column
						prop="address"
						label="目标表">
				</el-table-column>
				<el-table-column
						label="操作">
					<template>
						<span class="el-icon-edit"></span>
						<span class="el-icon-close"></span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-button class="dv-btn" size="mini" icon="el-icon-plus" @click="handleShowDrawer"></el-button>
		<div class="dv-btn-footer-worpp">
			<div class="dv-btn-footer-box">
				<el-button size="mini" class="dv-btn-footer" type="primary">开始检验</el-button>
				<el-button size="mini" class="dv-btn-footer">返回</el-button>
			</div>
		</div>
		<el-drawer
				:visible.sync="disabledDataVerify"
				:direction="direction"
				:append-to-body="true"
				class="dv-drawer"
				:before-close="handleClose">
			<el-table
					:data="tableData"
					style="width: 100%">
				<el-table-column
						prop="date"
						label="校验方式"
						width="180">
				</el-table-column>
				<el-table-column
						prop="name"
						label="检验条件"
						width="180">
				</el-table-column>
				<el-table-column
						prop="address"
						label="源头表">
				</el-table-column>
				<el-table-column
						prop="address"
						label="目标表">
				</el-table-column>
				<el-table-column
						label="操作">
					<template>
						<span class="el-icon-edit"></span>
						<span class="el-icon-close"></span>
					</template>
				</el-table-column>
			</el-table>
		</el-drawer>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				disabledDataVerify:false,
				direction: 'rtl',
				tableData: [{
					date: '2016-05-02',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1518 弄'
				}, {
					date: '2016-05-04',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1517 弄'
				}, {
					date: '2016-05-01',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1519 弄'
				}, {
					date: '2016-05-03',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1516 弄'
				}]
			};
		},
		methods: {
			handleClose(){
				this.disabledDataVerify = false;
			},
			handleShowDrawer(){
				this.disabledDataVerify = true;
			}
		}
	};
</script>
<style lang="less" scoped>
	.dv-header{
		width:100%;
		line-height: 32px;
		font-size:12px;
		font-weight:400;
		padding-left: 12px;
		color:rgba(51,51,51,1);
	}
	.table-box{
		margin: 10px;
		box-shadow:0px 0px 4px 0px rgba(0, 0, 0, 0.2);
	}
	.dv-btn{
		margin-left: 10px;
	}
	.dv-btn-footer-box{
		position: fixed;
		bottom: 10px;
		margin: 0 auto;
	}
	.dv-btn-footer{
		width: 100px;
		float: left;
	}
</style>
<style>
	.v-modal {
		position: fixed;
		left: 0;
		top: 40px;
		width: calc(100% - 800px);
		height: 100%;
		opacity: .5;
		background: #000;
	}
	.el-drawer__wrapper{
		z-index: 2001;
		width: 220px;
		height: 100%;
		right: 596px;
		top: 40px;
	}
	.el-drawer{
		width: 420px !important;
		box-shadow:none;
		border: 1px solid #dedee4;
	}
	.el-drawer__open .el-drawer.rtl {
		-webkit-animation: rtl-drawer-in 0ms cubic-bezier(0,0,.2,1) 0s;
		animation: rtl-drawer-in 0ms cubic-bezier(0,0,.2,1) 0s;
	}
	.el-drawer__open .el-drawer.rtl {
		-webkit-animation: rtl-drawer-out 0ms cubic-bezier(0,0,.2,1) 0s;
		animation: rtl-drawer-out 0ms cubic-bezier(0,0,.2,1) 0s;
	}
	:focus {
		outline:0px;
	}

</style>
