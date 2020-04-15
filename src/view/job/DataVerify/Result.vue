<template>
	<div class="data-contPreView">
		<div class="dv-pre-btn"><el-button size="mini" type="primary" @click="handleAddList">再次校验</el-button></div>
		<div class="clear"></div>
		<div class="dv-pre-box">
			<div class="dv-pre-label">校验总览
				<div class="dv-pre-right">
					<span>校验时间：2020-11-22:22:33 </span>
					<span> 耗时：12min</span>
				</div>
			</div>
			<div class="dv-pre-rowTotal">
				<p>行数校验 10000</p>
				<p>哈希校验 10000</p>
				<p>高级校验 10000</p>
			</div>
			<div class="dv-pre-dataBox">
				<div class="dv-pre-rowCheck">
					<p>总体行数差（条）</p>
					<div class="dv-pre-dataBox-item">-133,24</div>
				</div>
				<div class="dv-pre-rowCheck">
					<p>总体行数差（条）</p>
					<div class="dv-pre-dataBox-item">-133,24</div>
				</div>
				<div class="dv-pre-rowCheck">
					<p>总体行数差（条）</p>
					<div class="dv-pre-dataBox-item">-133,24</div>
				</div>
			</div>
		</div>
		<div class="dv-contrast-table">
			<el-table
					:data="tableData"
					border
					height="250"
					style="width: 100%">
				<el-table-column
						prop="date"
						label="源表"
						width="180">
				</el-table-column>
				<el-table-column
						prop="name"
						label="校验方式"
						width="180">
				</el-table-column>
				<el-table-column
						prop="address"
						label="采样条件">
				</el-table-column>
				<el-table-column
						prop="address"
						label="校验结果">
				</el-table-column>
				<el-table-column
						prop="address"
						label="准确率">
				</el-table-column>
			</el-table>
		</div>
		<div>
			<el-row gutter="10">
				<el-col :span="8">
					<el-select size="mini" style="width: 100%">
						<option value="1"></option>
					</el-select>
				</el-col>
				<el-col :span="8">
					<el-select size="mini" style="width: 100%">
						<option value="1"></option>
					</el-select>
				</el-col>
			</el-row>
			<div class="dv-contrast-box">
				<div class="dv-contrast-header">
					错误对比
					<div class="dv-pre-right">
						<span>高级校验 </span>
						<span> 耗时：12min</span>
					</div>
				</div>
				<div class="dv-contrast-content">
					<div class="dv-contrast-content-item">
						<div class="dv-contrast-content-item-tip">源头表</div>
						<div  class="dv-contrast-content-item-text">
							_id : 5d2b01296d8c71218475f4bd
							CLAIM_ID : "CL_000000001"
							CLAIM_AMOUNT : 7253
							CLAIM_DATE : 2010-07-04T16:00:00.000+00:00
							CLAIM_REASON : "SCRATCH"
							LAST_CHANGE : 2019-07-04T09:13:42.993+00:00
							POLICY_ID : "PC_000000001"
							SETTLED_AMOUNT : 7253
							SETTLED_DATE : 2010-11-09T16:00:00.000+00:00
							tapd8 : Object
							ts : 2019-07-15T10:41:53.386+00:00
						</div>
					</div>
					<div class="dv-contrast-content-item">
						<div  class="dv-contrast-content-item-tip">目标表</div>
						<div  class="dv-contrast-content-item-text">
							_id : 5d2b01296d8c71218475f4bd
							CLAIM_ID : "CL_000000001"
							CLAIM_AMOUNT : 7253
							CLAIM_DATE : 2010-07-04T16:00:00.000+00:00
							CLAIM_REASON : "SCRATCH"
							LAST_CHANGE : 2019-07-04T09:13:42.993+00:00
							POLICY_ID : "PC_000000001"
							SETTLED_AMOUNT : 7253
							SETTLED_DATE : 2010-11-09T16:00:00.000+00:00
							tapd8 : Object
							ts : 2019-07-15T10:41:53.386+00:00
						</div>
					</div>
					<div class="dv-contrast-content-item">
						<div  class="dv-contrast-content-item-tip">MSQ</div>
						<div  class="dv-contrast-content-item-text">
							_id : 5d2b01296d8c71218475f4bd
							CLAIM_ID : "CL_000000001"
							CLAIM_AMOUNT : 7253
							CLAIM_DATE : 2010-07-04T16:00:00.000+00:00
							CLAIM_REASON : "SCRATCH"
							LAST_CHANGE : 2019-07-04T09:13:42.993+00:00
							POLICY_ID : "PC_000000001"
							SETTLED_AMOUNT : 7253
							SETTLED_DATE : 2010-11-09T16:00:00.000+00:00
							tapd8 : Object
							ts : 2019-07-15T10:41:53.386+00:00
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		methods: {
			handleClose(){
				this.disabledDataVerify = false;
			},
			handleShowDrawer(){
				this.disabledDataVerify = true;
			},
			handleAddList(){
				let self = this;
				self.editor.showDataVerify();
			}
		}
	};
</script>
<style lang="less" scoped>
	.dv-pre-box{
		width:100%;
		height:135px;
		margin-bottom: 10px;
		margin-top: 10px;
		font-size: 12px;
		border:1px solid rgba(220, 223, 230, 1);
		box-shadow:2px 2px 7px 0px rgba(0, 0, 0, 0.1);
		background:rgba(255,255,255,1);
	}
	.data-contPreView{
		margin-left:20px;
		margin-right: 20px;
	}
	.dv-pre-rowCheck p{
		font-size:14px;
		font-weight:400;
		color:rgba(153,153,153,1);
		line-height:28px
	}
	.dv-pre-label{
		height: 39px;
		line-height: 39px;
		padding-left: 10px;
		background:rgba(250,250,250,1);
		border-bottom:1px solid rgba(220, 223, 230, 1);
	}
	.dv-pre-right{
		float: right;
		margin-right: 10px;
		color: #999;
	}
	.dv-pre-rowTotal{
		float: left;
		width:20%;
		font-size:12px;
		line-height: 24px;
		height: auto;
		margin-top: 10px;
		margin-left: 10px;
		border-right:1px solid rgba(220, 223, 230, 1);
	}
	.dv-pre-dataBox{
		float: left;
		width: 72%;
		display: flex;
		margin-left: 10px;
		justify-content:space-between;
	}
	.dv-pre-dataBox-item{
		font-size:33px;
		font-weight:400;
		color:rgba(72,182,226,1);
		line-height:48px;
	}
	.dv-contrast-table{
		margin-bottom: 10px;
		box-shadow:2px 2px 7px 0px rgba(0, 0, 0, 0.1);
	}
	.dv-contrast-box{
		width:100%;
		margin-top: 10px;
		background:rgba(255,255,255,1);
		border:1px solid rgba(220, 223, 230, 1);
		box-shadow:2px 2px 7px 0px rgba(0, 0, 0, 0.1);
		border-radius:4px;
	}
	.dv-contrast-header{
		height:51px;
		line-height: 50px;
		font-size: 14px;
		padding-left: 10px;
		background:rgba(250,250,250,1);
		border-bottom:1px solid rgba(220, 223, 230, 1);
	}
	.dv-contrast-content{
		display: flex;
		justify-content: space-around;
	}
	.dv-contrast-content-item-tip{
		height:39px;
		line-height: 39px;
		padding-left: 10px;
		background:rgba(250,250,250,1);
		border-bottom:1px solid rgba(220, 223, 230, 1);
	}
	.dv-contrast-content-item-text{
		padding: 10px;
	}
	.dv-contrast-content :first-child{
		border-left:none;
	}
	.dv-contrast-content-item{
		width: 33%;
		font-size: 12px;
		border-left: 1px solid #dedee4;
	}
	.dv-pre-btn{
		margin-top: 10px;
		float: right;
	}
	.clear{
		clear: both;
	}
</style>
