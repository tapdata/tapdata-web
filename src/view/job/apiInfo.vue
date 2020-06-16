<template>
	<el-container class="api-info">
		<el-header class="e-height">
			<h1>订单物流API</h1>
			<div class="operating">
				<i class="iconfont icon-bibianji"></i>
				<i class="iconfont icon-debug-"></i>
				<i class="iconfont icon-yulan1"></i>
				<el-switch
					v-model="publishApi"
					active-text="发布中">
				</el-switch>
			</div>
		</el-header>
		<el-main class="e-main">
			<div class="api-path">
				<span class="method">get</span>
				<span>/api/v3/MDM_search_model1111/{id}</span>
			</div>

			<div class="api-text">
				这句话是对这个接口的一段话描述，这段话的内容由系统自动生成，如果用户需要自定义编辑的话，用户可以根据其业务需求自定义 编辑；自
			</div>

			<div class="api-content basic-attr">
				<h3>{{$t("apiInfo.basicAttributes")}}</h3>
				<el-row :gutter="20" class="e-row">
					<el-col :span="12">
						{{$t("apiInfo.trquestMethod")}}: <span>Get</span>
					</el-col>
					<el-col :span="12">
						{{$t("apiInfo.status")}}: <span>发布中</span>
					</el-col>
				</el-row>
				<el-row :gutter="20" class="e-row">
					<el-col :span="12">
						{{$t("apiInfo.supportFormat")}}: <span>json</span>
					</el-col>
					<el-col :span="12">
						{{$t("apiInfo.founder")}}: <span>发布中</span>
					</el-col>
				</el-row>
				<el-row :gutter="20" class="e-row">
					<el-col :span="12">
						{{$t("apiInfo.interfaceClassification")}}: <span>API发布 | 物流API</span>
					</el-col>
					<el-col :span="12">
						{{$t("apiInfo.modifyTime")}}: <span>发布中</span>
					</el-col>
				</el-row>
				<el-row :gutter="20" class="e-row">
					<el-col :span="12">
						{{$t("apiInfo.interface")}}: <span>http:///api/v3/MDM_search_model1111/{id}</span>
					</el-col>
					<el-col :span="12">
						{{$t("apiInfo.version")}}: <span>发布中</span>
					</el-col>
				</el-row>
			</div>

			<div class="api-content">
				<h3>{{$t("apiInfo.requestParameters")}}</h3>
				<el-table
					:data="tableData"
					style="width: 100%;margin-bottom: 20px;"
					row-key="id"
					border
					default-expand-all
					:tree-props="{children: 'children', hasChildren: 'hasChildren'}">
					<el-table-column
						prop="parameter"
						:label='$t("apiInfo.parameter")'
						width="180">
					</el-table-column>
					<el-table-column
						prop="type"
						:label='$t("apiInfo.typesof")'
						width="180">
					</el-table-column>
					<el-table-column
						prop="is_required"
						:label='$t("apiInfo.is_required")'>
					</el-table-column>
					<el-table-column
						prop="examples"
						:label='$t("apiInfo.examples")'>
					</el-table-column>
				</el-table>
			</div>

			<div class="api-content">
				<h3>{{$t("apiInfo.responseParameters")}}</h3>
				<el-table
					:data="tableData"
					style="width: 100%;margin-bottom: 20px;"
					row-key="id"
					border
					default-expand-all
					:tree-props="{children: 'children', hasChildren: 'hasChildren'}">
					<el-table-column
						prop="date"
						label="parameter"
						sortable
						width="180">
					</el-table-column>
					<el-table-column
						prop="type"
						label="类型"
						sortable
						width="180">
					</el-table-column>
					<el-table-column
						prop="is_required"
						label="是否必填">
					</el-table-column>
					<el-table-column
						prop="examples"
						label="示例">
					</el-table-column>
				</el-table>
			</div>

			<div class="api-content">
				<h3>{{$t("apiInfo.requestExample")}}（JSON）</h3>
			</div>

			<div class="api-content">
				<h3>{{$t("apiInfo.backExamples")}}（JSON）</h3>
			</div>
		</el-main>
	</el-container>
</template>

<script>
export default {
	name: "Aggregate",
	data() {
		return {
			tableData: [],
			publishApi: ''
		};
	},
	mounted() {

	},

	watch: {

	},

	methods: {


	}
};
</script>

<style scoped lang="less">
.api-info {
	height: 100%;
	overflow: auto;
	.e-height {
		line-height: 60px;
		h1 {
			float: left;
			font-size: 18px;
			color: #333;
		}
		.operating {
			float: right;
			i.iconfont{
				padding: 0 5px;
				cursor: pointer;
			}
		}
	}
	.e-main {
		h3 {
			padding-bottom: 20px;
			font-size: 16px;
			color: #333;
		}
		.api-path {
			width: 100%;
			height: 35px;
			line-height: 35px;

			span {
				float: left;
				display: inline-block;
				width: calc(100% - 88px);
				padding-left: 20px;
				color: #62A569;
				box-sizing: border-box;
				border: 1px solid #62A569;
				background-color: #EDF6EE;
				border-top-right-radius: 3px;
				border-bottom-right-radius: 3px;
			}
			.method {
				width: 84px;
				font-size: 14px;
				color: #fff;
				font-weight: bold;
				text-align: center;
				padding: 0;
				background-color: #62A569;
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				border-top-left-radius: 3px;
				border-bottom-left-radius: 3px;
			}
		}
		.api-text {
			padding: 20px 0 30px;
			text-align: justify;
		}

		.e-row {
			padding-bottom: 10px;
			font-size: 14px;
			font-weight: normal;
			span {
				padding-left: 10px;
			};
		}

		.basic-attr {
			padding-bottom: 20px;
		}
	}

}
</style>
<style lang="less">

</style>
