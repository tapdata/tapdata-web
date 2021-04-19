<template>
	<div class="relation-container">
		<div class="relation-header">
			<div class="tool-bar">
				<i class="iconfont icon-plus-circle" @click="zoomIn"></i>
				<i class="iconfont icon-minus-circle" @click="zoomOut"></i>
				<i class="iconfont icon-shuaxin1" @click="getData"></i>
				<i class="iconfont icon-kujitongbucopy" @click="refreshData"></i>
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
			<span class="consume-time">{{ $t('relations.lastTimeConsume') }} ：{{ consumeTime }} </span>
			<span class="consume-time">{{ $t('relations.allProgress') }} ：{{ allProgress }} </span>
		</div>
		<div id="navigator-container" class="navigator-container"></div>
		<div class="center-bar">
			<el-radio-group v-model="level" @change="changeViews">
				<el-radio label="table">{{ $t('dataMap.tableLevel') }}</el-radio>
				<span class="space-line"></span>
				<el-radio label="field">{{ $t('dataMap.fieldLevel') }}</el-radio>
			</el-radio-group>
		</div>
		<div class="relation-main">
			<div id="paper" class="relation"></div>
		</div>
		<el-dialog :title="$t('message.preview')" :visible.sync="errorVisible" width="650px">
			<span class="value align-center"> {{ refreshResult.message }}</span>
			<pre class="align-center pre"> {{ refreshResult.stack }}</pre>
		</el-dialog>
		<Info
			ref="info"
			:model="model"
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
			rClass: true,
			form: {},
			level: 'table',
			model: {
				level: 'table',
				connectionId: '',
				tableId: '',
				previewVisible: false,
				dataFlows: [],
				sourceName: '',
				targetName: ''
			},
			qualifiedName: '',
			fields: '',
			consumeTime: '',
			refreshResult: {},
			dialogFormVisible: false,
			errorVisible: false,
			flowList: [],
			refreshing: false,
			allProgress: ''
		};
	},
	mounted() {
		this.graph = graph();
		this.getData();
		this.getMetaData(); //默认展示当前表的字段映射
		LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
			if (res.data) {
				this.refreshResult = res.data[0];
				this.consumeTime = this.getConsumeTime(this.refreshResult.start_date, this.refreshResult.finish_date);
				this.allProgress = this.refreshResult.allProgress;
				if (this.refreshResult.status === 'error') this.rClass = false;
				else this.rClass = true;
			}
		});
	},
	methods: {
		getData() {
			this.level = 'table';
			this.model.level = 'table';
			let params = {
				level: this.level,
				qualifiedName: this.tableId
			};
			LineageGraphsAPI.graphData(params).then(res => {
				if (res.data) {
					this.graph.draw(res.data.items, res.data.links, this);
				}
			});
		},
		resFieldData() {
			this.level = 'field';
			this.model.level = 'field';
			this.level = 'field';
			let params = {
				level: this.level,
				qualifiedName: this.qualifiedName || this.tableId,
				fields: this.fields
			};
			this.$api('LineageGraphs')
				.graphData(params)
				.then(res => {
					this.graph.draw(res.data.items, res.data.links, this);
				});
		},
		changeViews(val) {
			this.level = val;
			if (val === 'table') {
				this.getData();
			} else {
				this.resFieldData();
			}
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
						let fields = data[0].fields || [];
						this.fields = fields.map(field => field.field_name);
					}
				});
		},
		//分析耗时
		getConsumeTime(start, end) {
			let diff = new Date(end).getTime() - new Date(start).getTime();

			//计算出相差天数
			var days = Math.floor(diff / (24 * 3600 * 1000));

			//计算出小时数
			var leave1 = diff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
			var hours = Math.floor(leave1 / (3600 * 1000));
			//计算相差分钟数
			var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
			var minutes = Math.floor(leave2 / (60 * 1000));

			//计算相差秒数
			var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
			var seconds = Math.round(leave3 / 1000);

			var returnStr = seconds + this.$t('relations.second');

			if (minutes > 0) {
				returnStr = minutes + this.$t('relations.minute'); //+ returnStr;
			}
			if (hours > 0) {
				returnStr = hours + this.$t('relations.hours'); // + returnStr;
			}
			if (days > 0) {
				returnStr = days + this.$t('relations.day'); //+ returnStr;
			}
			return returnStr;
		},
		refreshData() {
			this.$confirm(this.$t('relations.refreshMsg'), this.$t('relations.refreshTitle'), {
				confirmButtonText: this.$t('relations.yes'),
				cancelButtonText: this.$t('relations.no'),
				type: 'warning',
				closeOnClickModal: false
			}).then(() => {
				LineageGraphsAPI.refreshGraphData()
					.then(res => {
						if (res.data) {
							this.refreshResult.allProgress = 10;
							this.refreshResult.currProgress = 0;
							this.refreshing = true;
							let self = this;
							this.inter = setInterval(() => {
								LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(
									res => {
										if (res.data) {
											self.refreshResult = res.data[0];
											if (self.refreshResult.sync_data) {
												this.$message.error(this.$t('relations.refreshStatusMsg'));
											}
											if (self.refreshResult.status == 'finish') {
												this.getData();
												//this.graph = graph();
												clearInterval(self.inter);
												//计算耗时
												self.consumeTime = self.getConsumeTime(
													self.refreshResult.start_date,
													self.refreshResult.finish_date
												);
												self.allProgress = self.refreshResult.allProgress;
												setTimeout(() => {
													self.refreshing = false;
												}, 3000);
											} else if (self.refreshResult.status == 'error') {
												this.rClass = false;
												this.errorVisible = true;
												//计算耗时
												self.consumeTime = self.getConsumeTime(
													self.refreshResult.start_date,
													self.refreshResult.finish_date
												);
												self.allProgress = self.refreshResult.allProgress;
												clearInterval(self.inter);
											}
										}
									}
								);
							}, 2000);
						} else
							LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then(res => {
								if (res.data) {
									this.refreshResult = res.data[0];
									if (this.refreshResult.status === 'error') {
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
			});
		},
		handlePreviewVisible() {
			this.model.previewVisible = false;
		},
		checkError() {
			if (this.refreshResult.status === 'error') this.errorVisible = true;
		},
		zoomIn() {
			window.paperScroller.zoom(0.2, { max: 4 });
		},
		zoomOut() {
			window.paperScroller.zoom(-0.2, { min: 0.2 });
		},
		changeLevel(qualifiedName, fields) {
			this.qualifiedName = qualifiedName;
			this.fields = fields;
			this.level = 'field';
			let params = {
				level: this.level,
				qualifiedName: qualifiedName,
				fields: fields
			};
			this.$api('LineageGraphs')
				.graphData(params)
				.then(res => {
					this.graph.draw(res.data.items, res.data.links, this);
				});
		}
	}
};
</script>
<style lang="less">
@import '../../editor/lib/rappid/rappid.css';
@import '../../editor/lib/rappid/themes/style.default.css';
.relation-container {
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
.consume-time {
	margin-left: 10px;
	margin-top: 3px;
	color: #999;
	line-height: 24px;
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
.relation-container {
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
	.relation-header {
		padding-bottom: 10px;
		background: #ffffff;
		overflow: hidden;
		border-bottom: 1px solid #dedee4;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		display: flex;
		flex-direction: row;
	}
	.relation-title {
		font-size: 16px;
		color: #333;
		font-weight: 600;
	}
	.relation-main {
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
	.relation-info {
		width: 244px;
		border: 1px solid #dedede;
	}
	.relation {
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
	.center-bar {
		background: #fff;
		margin-left: 30px;
		border-radius: 5px;
		-webkit-box-shadow: 0 0 3px 1px rgb(220 220 2.44444444%);
		box-shadow: 0 0 3px 1px rgb(220 220 2.44444444%);
		padding: 12px;
		position: absolute;
		bottom: 40px;
		left: 200px;
		z-index: 9999;
		.el-radio {
			margin-right: 10px;
			margin-left: 10px;
		}
		.space-line {
			margin-bottom: 3px;
			display: inline-block;
			width: 30px;
			border: 1px solid #dddddd;
		}
	}
}
</style>
