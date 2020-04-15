<template>
	<div class="data-verify">
		<div class="table-box">
			<div class="dv-header">数据校验</div>
			<el-table
					:data="tableData"
					border
					style="width: 100%">
				<el-table-column
						prop="type"
						label="校验方式"
						width="80">
					<template slot-scope="scope">
						<span :style="`color: ${ colorMap[scope.row.type] };`"> {{ $t('dataVerify.' + scope.row.type.replace(/ /g, '_')) }} </span>
					</template>
				</el-table-column>
				<el-table-column
						prop="condition.value"
						label="检验条件"
						width="80">
				</el-table-column>
				<el-table-column
						prop="source.tableName"
						label="源头表">
				</el-table-column>
				<el-table-column
						prop="target.tableName"
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
		<div class="dv-btn-footer-wrapper">
			<div class="dv-btn-footer-box">
				<el-button size="mini" class="dv-btn-footer" type="primary" @click="handleLoading">开始检验</el-button>
				<el-button size="mini" class="dv-btn-footer">返回</el-button>
			</div>
		</div>
		<el-drawer
				:visible.sync="disabledDrawer"
				:direction="direction"
				:append-to-body="true"
				class="dv-drawer"
				:with-header="false"
				:before-close="handleClose">
			<div class="dv-add-header">校验条件设置</div>
			<el-form class="dv-add-form">
				<div class="dv-add-form-text" >校验方式</div>
				<el-form-item>
					<el-radio-group v-model="type" size="mini">
						<el-radio border  label="row" width="150px"></el-radio>
						<el-radio border  label="hash" width="150px"></el-radio>
						<el-radio border  label="advance" width="150px"></el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item>
					<div class="dv-add-form-text">校验条件</div>
					<el-row gutter="10">
						<el-col :span="12">
							<el-select size="mini" v-model="condition.type">
								<option value="row">按行数</option>
								<option value="sampleRate">按采样率</option>
							</el-select>
						</el-col>
						<el-col :span="12" >
							<el-input size="mini" v-model="condition.value"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item>
					<div class="dv-add-form-text">源头表</div>
					<el-row>
						<el-col :span="24">
							<el-select size="mini" style="width: 100%" v-model="source.tableName">
								<option value="1"></option>
								<option value="1"></option>
								<option value="1"></option>
							</el-select>
						</el-col>
					</el-row>
					<el-row>
						<el-checkbox v-model="checked"></el-checkbox>
						<span style="font-size: 12px">SQL/MQL条件</span>
					</el-row>
					<el-row>
						<el-col :span="24">
							<el-input type="textarea" v-model="source.filter"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item>
					<div class="dv-add-form-text">目标表</div>
					<el-row>
						<el-col :span="24" v-model="target.tableName">
							<el-select size="mini" style="width: 100%">
								<option value="1"></option>
								<option value="1"></option>
								<option value="1"></option>
							</el-select>
						</el-col>
					</el-row>
					<div class="dv-add-form-text">JS校验代码</div>
					<el-row>
						<el-col :span="24">
							<el-input type="textarea" v-model="validateCode"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<div class="dv-btn-footer-wrapper">
				<div class="dv-btn-footer-box">
					<el-button size="mini" class="dv-btn-footer" type="primary" @click="disabledDrawer=false">开始检验</el-button>
					<el-button size="mini" class="dv-btn-footer" @click="disabledDrawer=false">返回</el-button>
				</div>
			</div>
		</el-drawer>
	</div>
</template>

<script>
	import editor from '../../../editor/index';

	export default {
		data() {
			return {
				disabledDrawer: false,
				direction: 'rtl',
				type: "row",// row: 行数 hash：哈希  advance：高级校验
				condition: {
					type: "rows",      //# rows：按行数参与校验，sampleRate：按采样率参与校验
					//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
					value: "",
				},
				source: {
					stageId: "",
					tableName: "",
					filter: ""
				},
				target: {
					stageId: "",
					tableName: ""
				},
				validateCode:'',
				colorMap: {
					row: '#48B6E2',
					hash: '#62A569',
					advance: '#9889D8',
				},
				tableData: [{
					type: "row",// row: 行数 hash：哈希  advance：高级校验
					condition: {
						type: "rows",      //# rows：按行数参与校验，sampleRate：按采样率参与校验
						//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
						value: "90",
					},
					source: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "POLICY",
						filter: "select * from POLICY where POLICY_ID > 1000"
					},
					target: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "CustomerPolicy"
					},
					validateCode: "xxxxxxxxxx" //#Javascript
				},{
					type: "hash",// row: 行数 hash：哈希  advance：高级校验
					condition: {
						type: "rows",      //# rows：按行数参与校验，sampleRate：按采样率参与校验
						//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
						value: "90",
					},
					source: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "POLICY",
						filter: "select * from POLICY where POLICY_ID > 1000"
					},
					target: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "CustomerPolicy"
					},
					validateCode: "xxxxxxxxxx" //#Javascript
				},{
					type: "advance",// row: 行数 hash：哈希  advance：高级校验
					condition: {
						type: "rows",      //# rows：按行数参与校验，sampleRate：按采样率参与校验
						//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
						value: "90",
					},
					source: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "POLICY",
						filter: "select * from POLICY where POLICY_ID > 1000"
					},
					target: {
						stageId: "5e9408531d431f06308e9c4d",
						tableName: "CustomerPolicy"
					},
					validateCode: "xxxxxxxxxx" //#Javascript
				}]
			};
		},
		methods: {
			handleClose(){
				this.disabledDrawer = false;
			},
			handleShowDrawer(){
				this.disabledDrawer = true;
			},
			handleSubmit(){
				// console.log(this.$router);
				// this.$route.push({ path: '/loading' });
			},
			handleLoading(){
				let self = this;
				self.editor.showLoading();
			}
		}
	};
</script>
<style lang="less" scoped>
	.dv-add-header{
		width:100%;
		height:35px;
		font-size: 12px;
		line-height: 35px;
		padding-left: 20px;
		background:rgba(245,245,245,1);
		border:1px solid rgba(222, 222, 228, 1);
	}
	.data-verify{
		position: relative;;
	}
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
	.dv-btn-footer-wrapper{
		width: 600px;
		position: fixed;
		bottom: 10px;
	}
	.dv-btn-footer-box{
		display: flex;
		justify-content: center;
	}
	.dv-btn-footer{
		width: 100px;
		float: left;
	}
	.dv-add-form{
		margin-left: 20px;
		margin-right: 20px
	}
	.dv-add-form-text{
		font-size:12px;
		color:rgba(51,51,51,1);
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
	.dv-add-form .el-form-item{
		margin-bottom:0;
	}
</style>
