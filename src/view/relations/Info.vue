<template>
	<el-drawer
		class="lineage-info-drawer"
		ref="drawer"
		:visible.sync="visible"
		:title="$t('dataForm.title')"
		size="40%"
		:before-close="handleClose"
		:withHeader="false"
	>
		<div class="lineage-info-wrap">
			<el-tabs v-model="activeName" type="card">
				<el-tab-pane label="数据源信息" name="first">
					<ul>
						<li v-for="(value, key) in dataFlows" :key="key">
							<span class="label">{{ dataFlowsFields[key] }}</span>
							<span>{{ value }}</span>
						</li>
					</ul>
				</el-tab-pane>
				<el-tab-pane label="元数据信息" name="second">
					<ul>
						<li v-for="(value, key) in metaData" :key="key">
							<span class="label">{{ metaDataFields[key] }}</span>
							<span>{{ value }}</span>
						</li>
					</ul>
				</el-tab-pane>
				<el-tab-pane label="包含字段" name="third">
					<div class="table-wrap">
						<el-table :data="fields">
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
			</el-tabs>
		</div>
	</el-drawer>
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
							name: `${data[0].name}(${data[0].original_name})`,
							qualified_name: data[0].qualified_name,
							meta_type: data[0].meta_type,
							create_source: data[0].source.name,
							createTime: data[0].createTime,
							last_updated: data[0].last_updated,
							last_user_name: data[0].last_user_name
						};
					}
					this.fields = data[0].fields;
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
		}
	}
};
</script>

<style scoped lang="less">
.lineage-info-wrap {
	ul {
		font-size: 12px;
		color: #666;
		padding-left: 20px;
		li {
			margin-bottom: 10px;
		}
		.label {
			display: inline-block;
			text-align: left;
			width: 100px;
		}
	}
	.table-wrap {
		padding-left: 20px;
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
}
</style>
