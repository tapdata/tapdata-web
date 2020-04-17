<template>
	<div class="data-verify">
		<div class="table-box">
			<div class="dv-header">{{ $t('dataVerify.dataVerify') }} </div>
			<el-table
					:data="tableData"
					border
					style="width: 100%">
				<el-table-column
						prop="type"
						:label="$t('dataVerify.dataWay')"
						width="150">
					<template slot-scope="scope">
						<span :style="`color: ${ colorMap[scope.row.type] };`"> {{ $t('dataVerify.' + scope.row.type) }} </span>
					</template>
				</el-table-column>
				<el-table-column
						prop="condition.value"
						:label="$t('dataVerify.range')"
						width="80">
				</el-table-column>
				<el-table-column
						prop="source.tableName"
						:label="$t('dataVerify.source')"
						>
					<template slot-scope="scope">
						<span v-if="scope.row.source.filter" class="dv-tag">SQL</span>
						<span> {{ scope.row.source.tableName}} </span>
					</template>
				</el-table-column>
				<el-table-column
						prop="target.tableName"
						:label="$t('dataVerify.target')"
						>
					<template slot-scope="scope">
						<span v-if="scope.row.validateCode" class="dv-tagJS">JS</span>
						<span> {{ scope.row.target.tableName}} </span>
					</template>
				</el-table-column>
				<el-table-column
						width="60"
						:label="$t('dataVerify.operate')"
						>
					<template slot-scope="scope">
						<span class="el-icon-edit" @click="handleEdit(scope.$index)"></span>
						<span class="el-icon-close" @click="handleDelete(scope.$index)"></span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-button class="dv-btn" size="mini" icon="el-icon-plus" @click="handleShowDrawer"></el-button>
		<div class="dv-btn-footer-wrapper">
			<div class="dv-btn-footer-box">
				<el-button size="mini" class="dv-btn-footer" type="primary" @click="handleLoading">{{ $t('dataVerify.start')}}</el-button>
				<el-button size="mini" class="dv-btn-footer" @click="handleBack">{{ $t('dataVerify.back')}}</el-button>
			</div>
		</div>
		<el-drawer
				:visible.sync="disabledDrawer"
				:direction="direction"
				:append-to-body="true"
				class="dv-drawer"
				:with-header="false"
				:before-close="handleClose">
			<div class="dv-add-header">{{ $t('dataVerify.dataVerifySetting')}}</div>
			<el-form class="dv-add-form">
				<div class="dv-add-form-text" >{{ $t('dataVerify.dataWay')}}</div>
				<el-form-item>
					<el-radio-group v-model="type" size="mini" class="dv-radio">
						<el-radio border  label="row" width="150px">{{ $t('dataVerify.row')}}</el-radio>
						<el-radio border  label="hash" width="150px">{{ $t('dataVerify.hash')}}</el-radio>
						<el-radio border  label="advance" width="150px">{{ $t('dataVerify.advance')}}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-show="type !=='row'">
					<div class="dv-add-form-text">{{ $t('dataVerify.condition')}}</div>
					<el-row :gutter="10">
						<el-col :span="12">
							<el-select size="mini" v-model="condition.type">
								<el-option value="rows" :label="$t('dataVerify.rows')"></el-option>
								<el-option value="sampleRate" :label="$t('dataVerify.sampleRate')"></el-option>
							</el-select>
						</el-col>
						<el-col :span="12" >
							<el-input size="mini" v-model="condition.value"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item >
					<div class="dv-add-form-text">{{ $t('dataVerify.source')}}</div>
					<el-row>
						<el-col :span="24">
							<el-select size="mini" style="width: 100%" v-model="source.stageId">
								<el-option
										v-for="item in sourceList"
										:key="item.stageId"
										:label="item.tableName"
										:value="item.stageId">
								</el-option	>
							</el-select>
						</el-col>
					</el-row>
					<el-row v-show="type !=='advance'">
						<el-checkbox v-model="checkedSource"></el-checkbox>
						<span style="font-size: 12px">SQL/MQL</span>
					</el-row>
					<el-row v-show="checkedSource && type !=='advance'">
						<el-col :span="24">
							<el-input type="textarea" v-model="source.filter"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item>
					<div class="dv-add-form-text">{{ $t('dataVerify.target')}}</div>
					<el-row>
						<el-col :span="24" >
							<el-select size="mini" style="width: 100%" v-model="target.stageId">
								<el-option
										v-for="item in targetList"
										:key="item.stageId"
										:label="item.tableName"
										:value="item.stageId">
								</el-option>
							</el-select>
						</el-col>
					</el-row>
					<el-row v-show="type!=='advance'">
						<el-checkbox v-model="checkedTarget"></el-checkbox>
						<span style="font-size: 12px">SQL/MQL</span>
					</el-row>
					<el-row v-show="checkedTarget && type!=='advance'" >
						<el-col :span="24">
							<el-input type="textarea" v-model="target.filter"></el-input>
						</el-col>
					</el-row>
					<div v-show="type==='advance'" class="dv-add-form-text">JS</div>
					<el-row v-show="type==='advance'">
						<el-col :span="24">
							<el-input type="textarea" v-model="validateCode"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<div class="dv-btn-footer-wrapper">
				<div class="dv-btn-footer-box">
					<el-button size="mini" class="dv-btn-footer" type="primary" @click="handleAdd">{{ $t('dataVerify.confirm')}}</el-button>
					<el-button size="mini" class="dv-btn-footer" @click="disabledDrawer=false">{{ $t('dataVerify.cancel')}}</el-button>
				</div>
			</div>
		</el-drawer>
	</div>
</template>

<script>
	import factory from '../../../api/factory';
	import log from "../../../log";

	const dataFlows = factory('DataFlows');

	export default {
		data() {
			return {
				id:'',
				editIndex:-1,
				disabledDrawer: false,
				direction: 'rtl',
				checkedSource:false,
				checkedTarget:false,
				sourceList:[],
				targetList:[],
				type: "advance",// row: 行数 hash：哈希  advance：高级校验
				condition: {
					type:'rows',      //# rows：按行数参与校验，sampleRate：按采样率参与校验
					//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
					value: "1000",
				},
				source: {
					stageId: "",
					tableName: "",
					filter: ""
				},
				target: {
					stageId: "",
					tableName: "",
					filter: ""
				},
				validateCode:'',
				colorMap: {
					row: '#48B6E2',
					hash: '#62A569',
					advance: '#9889D8',
				},
				tableData:[],
			};
		},
		created() {
			this.id =this.getUrlSearch('id');
			this.getData(this.id);
			this.getSourceList();
		},
		methods: {
			handleClose(){
				this.disabledDrawer = false;
			},
			handleShowDrawer(){
				this.disabledDrawer = false;
				this.type = "advance",// row: 行数 hash：哈希  advance：高级校验
					this.condition = {
					type:'rows',      //# rows：按行数参与校验，sampleRate：按采样率参与校验
						//# type为rows时表示行数；type为sampleRate时，表示采样率，如：
						value: "1000",
				};
				this.source =  {
					stageId: "",
						tableName: "",
						filter: ""
				};
				this.target = {
					stageId: "",
						tableName: "",
						filter: ""
				};
				this.validateCode = '';
				this.disabledDrawer = true;
			},
			getData(params){
				let _params = Object.assign({
					filter: JSON.stringify({
						fields: {
							"validationSettings": true,
							"validateStatus": true,
							"dataFlowId": true,
						}
					})
				}, params);
				dataFlows.getId(this.id,_params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							this.tableData = res.data.validationSettings?res.data.validationSettings:[];
							log('dataVerify.tableData',this.tableData);
						}
					}
				});
			},
			handleAdd(){
				log('edit_edit',this.editIndex);

				if(this.editIndex !== -1){
					this.tableData.splice(this.editIndex,1); //是否是编辑 先删除后新增
				}

				if(this.source.stageId){
					let op = this.sourceList.filter(item => item.stageId === this.source.stageId);
					log('op.source',op);
					this.source.tableName = op[0].tableName;
					this.source.stageId = op[0].stageId;
					this.source.primaryKeys = op[0].primaryKeys;
					this.source.connectionId = op[0].connectionId;
				}
				if(this.target.stageId){
					let op = this.targetList.filter(item => item.stageId === this.target.stageId);
					log('op.target',op);
					this.target.tableName = op[0].tableName;
					this.target.stageId = op[0].stageId;
					this.target.primaryKeys =op[0].primaryKeys;
					this.target.connectionId = op[0].connectionId;
				}

				let add = {
					type: this.type,// row: 行数 hash：哈希  advance：高级校验
					condition: this.condition,
					source: this.source,
					target:this.target ,
					validateCode:this.validateCode,
				};
				log('add',add); //添加的数据

				if(!this.tableData){
					this.tableData = [];
					this.tableData.push(add); //判断tabledata 是否存在
				}else {
					this.tableData.push(add);
					log('tableData',this.tableData);
				}

				let data ={
					validationSettings:this.tableData
				};

				dataFlows.patchId(this.id,data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						this.disabledDrawer =false;
						this.editIndex = -1;
						this.getData();
					}
				});
			},
			handleLoading(){
				if(this.tableData.length === 0){
					this.$message.info('please add data verify');
					return;
				}
				let self = this;
				// 状态修改为 waiting
				let data ={
					validateStatus:'waiting'
				};
				dataFlows.patchId(this.id,data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						self.editor.showLoading();
					}
				});
			},
			handleDelete(index){
				this.tableData.splice(index,1);
				let data ={
					validationSettings:this.tableData
				};
				dataFlows.patchId(this.id,data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						this.disabledDrawer =false;
						this.getData();
					}
				});
			},
			handleEdit(index){
				this.disabledDrawer = false;
				this.disabledDrawer =true;
				this.editIndex = index;
				this.condition = this.tableData[index].condition;
				this.source = this.tableData[index].source;
				this.target = this.tableData[index].target;
				this.type = this.tableData[index].type;
				this.validateCode = this.tableData[index].validateCode;
			},
			getSourceList(){
				dataFlows.getSourceList(this.id).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						this.sourceList = res.data.source;
						this.targetList = res.data.target;
						log('source.list',res.data);
					}
				});
			},
			handleBack(){
				this.editor.showResult();
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
	.dv-tag{
		width:36px;
		height:19px;
		font-size: 12px;
		line-height: 19px;
		text-align: center;
		color: #fff;
		display: inline-block;
		background:rgba(98,165,105,1);
		border-radius:3px;
	}
	.dv-tagJS{
		width:36px;
		height:19px;
		font-size: 12px;
		line-height: 19px;
		text-align: center;
		color: #fff;
		display: inline-block;
		background:#48B6E2;
		border-radius:3px;
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
	.dv-radio .el-radio {
		color: #606266;
		cursor: pointer;
		margin-right: 0;
	}
</style>
