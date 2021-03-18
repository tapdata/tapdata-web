.<template>
	<div class="data-map-container">
		<div class="data-map-header">
			<div class="tool-bar">
				<i class="iconfont icon-plus-circle" @click="zoomIn"></i>
				<i class="iconfont icon-minus-circle" @click="zoomOut"></i>
				<i class="iconfont icon-shuaxin1" @click="refreshData"></i>
			</div>
			<span class="refreshS" :class="{ errorClass: !rClass, actProgress: !refreshing }" @click="checkError"
				>{{ $t('relations.refreshStatus') }}:
				{{ $moment(refreshResult.finish_date).format('YYYY-MM-DD HH:mm:ss') }}--{{ refreshResult.status }}
				<el-progress
					class="tool-bar-progress"
					v-if="refreshing"
					:percentage="Math.trunc((refreshResult.currProgress / refreshResult.allProgress) * 100)"
				></el-progress>
			</span>
		</div>
		<div id="navigator-container" class="navigator-container"></div>
		<div class="data-map-main">
			<div id="paper" class="data-map"></div>
		</div>
		<el-dialog :title="$t('notification.dataFlow')" :visible.sync="dialogFormVisible" width="450px">
			<el-collapse>
				<el-collapse-item
					v-for="item in flowList"
					:title="item.name"
					:key="item.id"
					@click="toDataFlow(item.id)"
				>
					<ul class="info-list">
						<span class="label">ID</span>
						<span class="value align-center"> {{ item.id }}</span>
					</ul>
				</el-collapse-item>
			</el-collapse>
		</el-dialog>
		<el-dialog :title="$t('message.preview')" :visible.sync="errorVisible" width="650px">
			<span class="value align-center"> {{ refreshResult.message }}</span>
			<pre class="align-center pre"> {{ refreshResult.stack }}</pre>
		</el-dialog>
		<Info
			:connectionId="connectionId"
			:tableId="currentTableId"
			:visible="previewVisible"
			:databaseType="databaseType"
			v-on:previewVisible="handlePreviewVisible"
			v-on:handleFields="changeLevel"
		></Info>
	</div>
</template>

<script>
import graph from './graph';
import factory from '../../api/factory';
import Info from './Info';
const LineageGraphsAPI = factory('LineageGraphs');

export default {
	name: 'DataRelations',
	components: { Info },
	props: {
		tableId: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			currentLevel: 1,
			connectionId: '',
			currentTableId: '',
			databaseType: '',
			tableName: '',
			rClass: true,
			form: {},
			refreshResult: {},
			dialogFormVisible: false,
			previewVisible: false,
			errorVisible: false,
			flowList: [],
			refreshing: false
		};
	},
	mounted() {
		this.graph = graph();
		LineageGraphsAPI.graphData(this.tableId).then(res => {
			if (res.data) {
				this.graph.draw(res.data.items, res.data.links, this);
			}
		});
		LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
			if (res.data) {
				this.refreshResult = res.data[0];
				if (this.refreshResult.status == 'error') this.rClass = false;
				else this.rClass = true;
			}
		});
	},
	methods: {
		refreshData() {
			LineageGraphsAPI.refreshGraphData()
				.then(res => {
					if (res.data == true) {
						this.refreshResult.allProgress = 10;
						this.refreshResult.currProgress = 0;
						this.refreshing = true;
						let self = this;
						this.inter = setInterval(() => {
							LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
								if (res.data) {
									self.refreshResult = res.data[0];
									if (self.refreshResult.sync_data) {
										this.$message.error('正在同步图形数据，图形可能缺失，请稍后刷新重试');
									}
									if (self.refreshResult.status == 'finish') {
										LineageGraphsAPI.graphData(this.tableId).then(res => {
											if (res.data) {
												this.graph.draw(res.data.items, res.data.links, this);
											}
										});
										//this.graph = graph();
										clearInterval(self.inter);
										setTimeout(() => {
											self.refreshing = false;
										}, 3000);
									} else if (self.refreshResult.status == 'error') {
										this.rClass = false;
										this.errorVisible = true;
										clearInterval(self.inter);
									}
								}
							});
						}, 2000);
					} else
						LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
							if (res.data) {
								this.refreshResult = res.data[0];
								if (this.refreshResult.status == 'error') {
									this.rClass = false;
									this.errorVisible = true;
									this.refreshing = false;
								}
							}
						});
				})
				.finally(() => {
					this.apiLoading = false;
				});
		},
		handlePreviewVisible() {
			this.previewVisible = false;
		},
		toDataFlow(id) {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { id: id, isMoniting: true } //, mapping: mappingTemplate
			});
			window.open(routeUrl.href, 'monitor_' + id);
		},
		checkError() {
			if (this.refreshResult.status == 'error') this.errorVisible = true;
		},
		zoomIn() {
			window.paperScroller.zoom(0.2, { max: 4 });
		},
		zoomOut() {
			window.paperScroller.zoom(-0.2, { min: 0.2 });
		},
		changeLevel(qualifiedName, fields) {
			this.$api('LineageGraphs')
				.graphData(qualifiedName, 'field', fields)
				.then(() => {
					let items = [
						{
							id: 'adm_greenbuild_project_date_used_water_count_1',
							label: 'adm_greenbuild_project_date_used_water_count_1',
							items: [
								{
									id: 'adm_greenbuild_project_date_used_water_count_1',
									label: 'adm_greenbuild_project_date_used_water_count_1',
									items: [
										{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
										{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
										{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
										{ id: 'branch_name', label: 'branch_name', type: 'String' },
										{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
										{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
										{ id: 'used_water_count', label: 'used_water_count', type: 'Double' }
									]
								}
							],
							connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
						},
						{
							id: 'mdm_project_info',
							label: 'mdm_project_info',
							items: [
								{
									id: 'fields',
									label: 'fields',
									items: [
										{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
										{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
										{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' }
									]
								}
							],
							connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
						},
						{
							id: 'adm_ls_engineer_use_water_temp',
							label: '用水汇总临时表',
							items: [
								{
									id: 'fields',
									label: 'fields',
									items: [
										{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
										{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
										{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
										{ id: 'branch_name', label: 'branch_name', type: 'String' },
										{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
										{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
										{ id: 'used_water_count', label: 'used_water_count', type: 'Double' },
										{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' }
									]
								}
							],
							connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
						},
						{
							id: 'adm_greenbuild_branch_date_used_water_count',
							label: '用水汇总表',
							items: [
								{
									id: 'fields',
									label: 'fields',
									items: [
										{ id: '_id', label: '_id', type: 'String', primary_key_position: 1 },
										{ id: 'branch_abb', label: 'branch_abb', type: 'String' },
										{ id: 'branch_id', label: 'branch_id', type: 'Integer' },
										{ id: 'branch_name', label: 'branch_name', type: 'String' },
										{ id: 'engineer_id', label: 'engineer_id', type: 'Integer' },
										{ id: 'water_record_date', label: 'water_record_date', type: 'String' },
										{ id: 'used_water_count', label: 'used_water_count', type: 'Double' },
										{ id: 'pro_bulid_area', label: 'pro_bulid_area', type: 'Double' },
										{ id: 'avg_water_count', label: 'avg_water_count', type: 'Double' }
									]
								}
							],
							connection: { id: '', name: '全项目的中间及统计集合库YTMB' }
						}
					];

					let links = [
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'fields' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'fields' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_abb' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_id' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'branch_name' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_name' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'engineer_id' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'engineer_id' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'water_record_date' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'water_record_date' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_greenbuild_project_date_used_water_count_1', port: 'used_water_count' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'used_water_count' },
							dataFlows: [
								{
									id: '60127fe2ace10a61d0570ae9',
									name: '05_ADM_用水用电情况合并_二公司',
									aggregate: { type: 'SUM', field: 'pro_bulid_area', group: 'branch_id' }
								}
							]
						},
						{
							source: { id: 'mdm_project_info', port: 'branch_id' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'mdm_project_info', port: 'pro_bulid_area' },
							target: { id: 'adm_ls_engineer_use_water_temp', port: 'pro_bulid_area' },
							dataFlows: [
								{
									id: '60127fe2ace10a61d0570ae9',
									name: '05_ADM_用水用电情况合并_二公司',
									aggregate: { type: 'SUM', field: 'pro_bulid_area', group: 'branch_id' }
								}
							]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'fields' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'fields' },
							dataFlows: [
								{
									id: '60127fe2ace10a61d0570ae9',
									name: '05_ADM_用水用电情况合并_二公司',
									javascript:
										'function process(record){\n' +
										'\n' +
										'\tif(record.pro_bulid_area && record.pro_bulid_area>0){\n' +
										'\t\trecord.avg_water_count = record.used_water_count/record.pro_bulid_area\n' +
										'\t}else{\n' +
										'\t\trecord.avg_water_count = 0\n' +
										'\t}\n' +
										'\treturn record;\n' +
										'}'
								}
							]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_abb' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_id' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_id' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_name' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_name' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'engineer_id' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'engineer_id' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'water_record_date' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'water_record_date' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'used_water_count' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'used_water_count' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'pro_bulid_area' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'pro_bulid_area' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						},
						{
							source: { id: 'adm_ls_engineer_use_water_temp', port: 'branch_abb' },
							target: { id: 'adm_greenbuild_branch_date_used_water_count', port: 'branch_abb' },
							dataFlows: [{ id: '60127fe2ace10a61d0570ae9', name: '05_ADM_用水用电情况合并_二公司' }]
						}
					];
					this.graph.draw(items, links, this);
				});
		}
	}
};
</script>
<style lang="less">
@import '../../editor/lib/rappid/rappid.css';
@import '../../editor/lib/rappid/themes/style.default.css';
.data-map-container {
	.navigator-container {
		position: absolute;
		left: 20px;
		bottom: 20px;
		width: 150px;
		height: 150px;
		z-index: 100;
		background: #fff;
	}
	.joint-paper.joint-theme-default {
		background: none;
	}
}
</style>
<style scoped lang="less">
.refreshS {
	margin-left: 10px;
	margin-top: 3px;
	color: #67c23a;
	font-size: 12px;
}
.actProgress {
	line-height: 24px;
}
.errorClass {
	font-size: 12px;
	margin-left: 10px;
	margin-top: 3px;
	color: red;
}
.data-map-container {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	-ms-flex-direction: column;
	flex-direction: column;
	height: 100%;
	width: 100%;
	position: relative;
	background: #fafafa;
	min-width: 720px;
	.tool-bar {
		i {
			display: inline-block;
			border: 1px solid #dedee4;
			padding: 5px;
			cursor: pointer;
		}
		.tool-bar-progress {
			width: 250px;
		}
	}
	.data-map-header {
		padding-bottom: 10px;
		background: #ffffff;
		overflow: hidden;
		border-bottom: 1px solid #dedee4;
		-webkit-box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
		box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		display: flex;
		flex-direction: row;
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
		width: 100%;
		position: relative;
		overflow: auto;
		#paper {
			position: relative;
			width: 100%;
			height: 100%;
			/*border: 1px solid red;*/
		}
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
	}
	.info-list {
		overflow-y: auto;
		max-height: 690px;
		margin: 0 auto;
		margin-left: 56px;
		width: 100%;
		li {
			margin-bottom: 20px;
		}
	}
	.label {
		color: #999;
		font-size: 12px;
		display: inline-block;
		width: 110px;
		margin-right: 15px;
		text-align: right;
	}
	.value {
		width: 62%;
		color: #666;
		font-size: 12px;
		display: inline-block;
		word-break: break-all;
	}
	.pre {
		color: #666;
		white-space: pre-wrap; /* css3.0 */
		white-space: -moz-pre-wrap; /* Firefox */
		white-space: -pre-wrap; /* Opera 4-6 */
		white-space: -o-pre-wrap; /* Opera 7 */
		word-wrap: break-word; /* Internet Explorer 5.5+ */
	}
}
</style>
