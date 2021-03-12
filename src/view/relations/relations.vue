.<template>
	<div class="data-map-container">
		<div class="data-map-header">
			<el-button type="warning" size="mini" @click="refreshData">{{ $t('relations.refresh') }}</el-button>
			<span :class="rClass" @click="checkError"
				>{{ $t('relations.refreshStatus') }}:
				{{ $moment(refreshResult.finish_date).format('YYYY-MM-DD HH:mm:ss') }}--{{ refreshResult.status }}</span
			>
			<el-progress
				:text-inside="true"
				:stroke-width="24"
				v-if="refreshing"
				:percentage="Math.trunc((refreshResult.currProgress / refreshResult.allProgress) * 100)"
				status="success"
				style="flex: 0.7; padding-left: 30px;"
			></el-progress>
		</div>
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
		<Preview
			:id="connectionId"
			:visible="previewVisible"
			:databaseType="databaseType"
			v-on:previewVisible="handlePreviewVisible"
		></Preview>
	</div>
</template>

<script>
import graph from './graph';
import factory from '../../api/factory';
import Preview from '../connections/Preview';
const LineageGraphsAPI = factory('LineageGraphs');

export default {
	name: 'DataRelations',
	components: { Preview },
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
			databaseType: '',
			tableName: '',
			rClass: 'refreshS',
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
		LineageGraphsAPI.graphData(this.tableId).then(() => {
			let data = {
				items: [
					{
						id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592',
						label: 'S(S)',
						connection: {
							database_type: 'mongodb',
							database_uri: 'mongodb://root:Gotapd8!@192.168.1.181:31193/admin',
							database_host: '192.168.1.181:31193',
							database_port: 0,
							database_name: 'admin',
							database_owner: '',
							basePath: null,
							path: null,
							apiVersion: null,
							name: 'S',
							id: '604b65b63b07e70058fff592'
						},
						items: [
							{
								id: 'fields',
								label: 'fields',
								items: [
									{
										id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592_x',
										label: 'x',
										java_type: 'Double',
										primary_key_position: 0,
										foreign_key_position: 0,
										field_name: 'x',
										alias_name: ''
									},
									{
										id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592__id',
										label: '_id',
										java_type: 'String',
										primary_key_position: 1,
										foreign_key_position: 0,
										field_name: '_id',
										alias_name: ''
									}
								]
							}
						]
					},
					{
						id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
						label: 'S1(S1)',
						connection: {
							database_type: 'mongodb',
							database_uri: 'mongodb://root:Gotapd8!@192.168.1.181:31193/admin',
							database_host: '192.168.1.181:31193',
							database_port: 0,
							database_name: 'admin',
							database_owner: '',
							basePath: null,
							path: null,
							apiVersion: null,
							name: 'S',
							id: '604b65b63b07e70058fff592'
						},
						items: [
							{
								id: 'fields',
								label: 'fields',
								items: [
									{
										id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592_x',
										label: 'x',
										java_type: 'Double',
										primary_key_position: 0,
										foreign_key_position: 0,
										field_name: 'x',
										alias_name: ''
									},
									{
										id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592__id',
										label: '_id',
										java_type: 'String',
										primary_key_position: 0,
										foreign_key_position: 0,
										field_name: '_id',
										alias_name: ''
									}
								]
							}
						]
					},
					{
						id: 'MC_mongodb_admin_S2_604b65b63b07e70058fff592',
						label: 'S2(S2)',
						connection: {
							database_type: 'mongodb',
							database_uri: 'mongodb://root:Gotapd8!@192.168.1.181:31193/admin',
							database_host: '192.168.1.181:31193',
							database_port: 0,
							database_name: 'admin',
							database_owner: '',
							basePath: null,
							path: null,
							apiVersion: null,
							name: 'S',
							id: '604b65b63b07e70058fff592'
						},
						items: [
							{
								id: 'fields',
								label: 'fields',
								items: []
							}
						]
					},
					{
						id: 'MC_mongodb_admin_S3_604b65b63b07e70058fff592',
						label: 'S3(S3)',
						connection: {
							database_type: 'mongodb',
							database_uri: 'mongodb://root:Gotapd8!@192.168.1.181:31193/admin',
							database_host: '192.168.1.181:31193',
							database_port: 0,
							database_name: 'admin',
							database_owner: '',
							basePath: null,
							path: null,
							apiVersion: null,
							name: 'S',
							id: '604b65b63b07e70058fff592'
						},
						items: [
							{
								id: 'fields',
								label: 'fields',
								items: []
							}
						]
					}
				],
				links: [
					{
						source: {
							id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592',
							port: 'fields'
						},
						target: {
							id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
							port: 'fields'
						},
						dataFlows: [
							{
								id: '604b67a03b07e70058fff668',
								name: '新任务_72989c5',
								mappingTemplate: 'custom',
								processors: []
							}
						]
					},
					{
						source: {
							id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
							port: 'fields'
						},
						target: {
							id: 'MC_mongodb_admin_S2_604b65b63b07e70058fff592',
							port: 'fields'
						},
						dataFlows: [
							{
								id: '604b67a03b07e70058fff668',
								name: '新任务_72989c5',
								mappingTemplate: 'custom',
								processors: []
							}
						]
					},
					{
						source: {
							id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
							port: 'fields'
						},
						target: {
							id: 'MC_mongodb_admin_S3_604b65b63b07e70058fff592',
							port: 'fields'
						},
						dataFlows: [
							{
								id: '604b67a03b07e70058fff668',
								name: '新任务_72989c5',
								mappingTemplate: 'custom',
								processors: []
							}
						]
					},
					{
						source: {
							id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592',
							port: 'MC_mongodb_admin_S_604b65b63b07e70058fff592_x'
						},
						target: {
							id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
							port: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592_x'
						},
						dataFlows: [
							{
								id: '604b67a03b07e70058fff668',
								name: '新任务_72989c5',
								processors: []
							}
						]
					},
					{
						source: {
							id: 'MC_mongodb_admin_S_604b65b63b07e70058fff592',
							port: 'MC_mongodb_admin_S_604b65b63b07e70058fff592__id'
						},
						target: {
							id: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592',
							port: 'MC_mongodb_admin_S1_604b65b63b07e70058fff592__id'
						},
						dataFlows: [
							{
								id: '604b67a03b07e70058fff668',
								name: '新任务_72989c5',
								processors: []
							}
						]
					}
				]
			};
			this.graph.draw(data.items, data.links, this);
			// if (res.data) {
			// 	this.graph.draw(res.data.items, res.data.links, this);
			// }
		});
		this.graph = graph();
		LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
			if (res.data) {
				this.refreshResult = res.data[0];
				if (this.refreshResult.status == 'error') this.rClass = 'errorClass';
				else this.rClass = 'refreshS';
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
									if (self.refreshResult.status == 'finish') {
										LineageGraphsAPI.graphData(this.tableId).then(res => {
											if (res.data) {
												this.graph.draw(res.data.items, res.data.links, this);
											}
										});
										this.graph = graph();
										clearInterval(self.inter);
										setTimeout(() => {
											self.refreshing = false;
										}, 3000);
									} else if (self.refreshResult.status == 'error') {
										this.rClass = 'errorClass';
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
									this.rClass = 'errorClass';
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
		}
	}
};
</script>

<style scoped lang="less">
.refreshS {
	margin-left: 10px;
	margin-top: 3px;
	color: #67c23a;
}
.errorClass {
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
	display: flex;
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
</style>
