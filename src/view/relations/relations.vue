.<template>
	<div class="data-map-container">
		<div class="data-map-header">
			<div class="data-map-title">数据血缘</div>
		</div>
		<div class="data-map-main">
			<div class="data-map-info">
				<el-form class="e-form" label-position="top" label-width="160px" ref="form">
					<el-form-item>
						<el-button type="primary">
							刷新所有血缘数据
						</el-button>
					</el-form-item>
					<el-form-item :label="$t('editor.cell.data_node.table.form.database.label')" prop="connectionId">
						<div style="display:flex;">
							<FbSelect v-model="connectionId" :config="databaseSelectConfig"></FbSelect>
						</div>
					</el-form-item>

					<el-form-item :label="$t('editor.cell.data_node.table.form.table.label')" prop="tableName">
						<div class="flex-block">
							<FbSelect class="e-select" v-model="tableName" :config="schemaSelectConfig"></FbSelect>
						</div>
					</el-form-item>
				</el-form>
			</div>
			<div id="paper" class="data-map"></div>
		</div>
	</div>
</template>

<script>
import graph from './graph';
export default {
	name: 'DataRelations',

	data() {
		return {
			currentLevel: 1,
			connectionId: '',
			tableName: '',
			databaseSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.handlerConnectionChange();
					}
				},
				options: []
			},
			schemaSelectConfig: {
				size: 'mini',
				placeholder: this.$t('editor.cell.data_node.table.form.table.placeholder'),
				loading: false,
				filterable: true,
				on: {
					change() {
						self.handlerSchemaChange();
					}
				},
				options: [],
				allowCreate: false,
				defaultFirstOption: false,
				clearable: true
			}
		};
	},

	mounted() {
		graph();
	},
	methods: {}
};
</script>

<style scoped lang="less">
.data-map-container {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	-ms-flex-direction: column;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
	min-width: 720px;
}
.data-map-header {
	padding: 15px 10px;
	background: #ffffff;
	overflow: hidden;
	border-bottom: 1px solid #dedee4;
	-webkit-box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
	box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
}
.data-map-title {
	font-size: 16px;
	color: #333;
	font-weight: 600;
}
.data-map-main {
	-webkit-box-flex: 1;
	-ms-flex: 1;
	flex: 1;
	padding: 10px;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	overflow: hidden;
}
.data-map-info {
	width: 244px;
	border: 1px solid #dedede;
}
.data-map {
	-webkit-box-flex: 1;
	-ms-flex: 1;
	flex: 1;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	-ms-flex-direction: column;
	flex-direction: column;
	overflow: hidden;
}
</style>
