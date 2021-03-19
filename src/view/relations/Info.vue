<template>
	<div class="lineage-info-wrap" v-show="visible">
		<div class="bar"><i class="el-icon-arrow-right" @click="handleClose"></i></div>
		<header class="header">
			<span>{{ tableName }}</span>
		</header>
		<el-tabs v-model="activeName" type="card" class="lineage-info-tab">
			<el-tab-pane label="字段" name="first">
				<div class="lineage-info-field-btn">
					<el-button type="text" @click="handleFields">查看血缘</el-button>
				</div>
				<div class="table-wrap">
					<el-table :data="fields" @selection-change="handleSelectionChange">
						<el-table-column type="selection"></el-table-column>
						<el-table-column prop="name" label="字段类型/字段名称">
							<template slot-scope="scope">
								<div class="database-img">
									<img :src="getImgByType(scope.row.java_type)" />
								</div>
								<div class="database-text">
									{{ scope.row.field_name }}
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-tab-pane>
			<el-tab-pane label="属性" name="second">
				<ul>
					<li v-for="(value, key) in metaData" :key="key">
						<span class="label">{{ metaDataFields[key] }}</span>
						<span>{{ value }}</span>
					</li>
					<li v-for="(value, key) in dataFlows" :key="key">
						<span class="label">{{ dataFlowsFields[key] }}</span>
						<span>{{ value }}</span>
					</li>
				</ul>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
export default {
	name: 'Info',
	props: {
		connectionId: {
			required: true,
			value: String
		},
		tableId: {
			required: true,
			value: String
		},
		visible: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			activeName: 'first',
			metaData: {},
			dataFlows: {},
			fields: [],
			multipleSelection: [],
			tableName: '',
			metaDataFields: {
				name: '别名(原名称)',
				qualified_name: '唯一表示',
				meta_type: '类型',
				create_source: '来源',
				createTime: '创建时间',
				last_updated: '修改时间',
				last_user_name: '修改人'
			},
			dataFlowsFields: {
				name: '连接名称',
				database_host: '地址',
				database_port: '端口',
				database_username: '用户名',
				database_name: '数据库名称',
				database_owner: '模式'
			}
		};
	},
	watch: {
		connectionId: {
			handler() {
				if (this.connectionId) {
					this.getDataFlows();
				}
			}
		},
		tableId: {
			handler() {
				if (this.tableId) {
					this.getMetaData();
				}
			}
		}
	},
	methods: {
		getImgByType(type) {
			if (!type) {
				type = 'default';
			}
			return require(`../../../static/image/types/${type.toLowerCase()}.png`);
		},
		handleClose() {
			this.$emit('previewVisible', false);
		},
		getMetaData() {
			let params = {
				filter: {
					where: {
						qualified_name: this.tableId
					}
				}
			};
			this.$api('MetadataInstances')
				.get(params)
				.then(result => {
					let data = result.data || [];
					if (data && data.length !== 0) {
						this.metaData = {
							name: data[0].name ? `${data[0].name}(${data[0].original_name})` : data[0].original_name,
							qualified_name: data[0].qualified_name,
							meta_type: data[0].meta_type,
							create_source: data[0].source.name,
							createTime: data[0].createTime,
							last_updated: data[0].last_updated,
							last_user_name: data[0].last_user_name
						};
						this.tableName = data[0].name || data[0].original_name;
						this.fields = data[0].fields;
					}
				});
		},
		getDataFlows() {
			this.$api('connections')
				.get([this.connectionId])
				.then(result => {
					let data = result.data || {};
					if (data) {
						this.dataFlows = {
							name: data.database_username,
							database_host: data.database_host,
							database_port: data.database_port,
							database_username: data.database_username
						};
					}
				});
		},
		//表格所选中的fields
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		handleFields() {
			if (this.multipleSelection.length === 0) return;
			let fields = [];
			fields = this.multipleSelection.map(field => field.field_name);
			this.$emit('handleFields', this.tableName, fields);
		}
	}
};
</script>

<style scoped lang="less">
.lineage-info-wrap {
	position: absolute;
	right: -21px;
	top: 43px;
	background: #fff;
	height: 800px;
	width: 430px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 100);
	.header {
		padding-top: 20px;
		padding-left: 20px;
		margin-bottom: 10px;
		color: rgba(72, 182, 226, 100);
		font-size: 18px;
		text-align: left;
		font-weight: bold;
	}
	.bar {
		background: #f5f5f5;
		height: 22px;
	}
	.lineage-info-tab {
		padding-left: 20px;
		ul {
			font-size: 12px;
			color: #666;
			padding-left: 20px;
			margin-top: 10px;
			li {
				margin-bottom: 10px;
			}
			.label {
				display: inline-block;
				text-align: left;
				width: 100px;
			}
		}
		.lineage-info-field-btn {
			margin-right: 10px;
			display: flex;
			justify-content: flex-end;
		}
		.table-wrap {
			height: 600px;
			overflow-y: auto;
			.database-img {
				vertical-align: middle;
				width: 28px;
				height: 28px;
				background: #ffffff;
				border-radius: 3px;
				display: flex;
				justify-content: center;
				align-items: center;
				float: left;
				img {
					width: 60%;
				}
			}
			.database-text {
				float: left;
				margin-left: 10px;
			}
		}
	}
}
</style>
<style lang="less">
.lineage-info-drawer {
	.el-drawer {
		box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
	}
	.el-drawer.rtl {
		top: 48px;
	}
}
.lineage-info-wrap {
	.el-tabs--card > .el-tabs__header .el-tabs__item:focus.is-active.is-focus:not(:active) {
		box-shadow: none;
		border-radius: 0;
	}
	.lineage-info-tab {
		.el-tabs__item {
			height: 24px;
			line-height: 24px;
			font-size: 12px;
		}
		.el-tabs__header {
			margin: 0;
		}
	}
}
</style>
