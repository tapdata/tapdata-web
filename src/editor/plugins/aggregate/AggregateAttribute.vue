<template>
	<div class="aggregate">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
			<p>{{ $t('dataFlow.aggregatePrompt') }}</p>
		</div>
		<el-form
			style="overflow: hidden;"
			ref="form"
			:model="form"
			label-position="top"
			label-width="200px"
			:disabled="disabled"
		>
			<el-col :span="21" class="aggregateName">
				<el-form-item :label="$t('dataFlow.nodeName')" required>
					<el-input v-model="form.name" maxlength="20" show-word-limit></el-input>
				</el-form-item>
				<el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" required>
					<MultiSelection
						v-model="form.primaryKeys"
						:options="primaryKeyOptions"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
					></MultiSelection>
				</el-form-item>
				<el-form-item required>
					<span slot="label">
						<span>{{ $t('editor.cell.processor.aggregate.aggregateSizeLabel') }}</span>
						<el-tooltip effect="dark" placement="top">
							<div style="max-width: 300px" slot="content">
								{{ $t('editor.cell.processor.aggregate.aggregateSizeTips') }}
							</div>
							<span class="icon iconfont icon-tishi1" style="vertical-align: bottom;"></span>
						</el-tooltip>
					</span>
					<div style="display:flex;align-items: center;">
						<el-select
							style="width: 200px"
							:value="form.aggCacheMaxSize !== -1 ? 'custom' : 'all'"
							@input="
								v => {
									form.aggCacheMaxSize = v === 'all' ? -1 : 100000;
								}
							"
						>
							<el-option
								:label="$t('editor.cell.processor.aggregate.allAggregateSize')"
								value="all"
							></el-option>
							<el-option
								:label="$t('editor.cell.processor.aggregate.customAggregateSize')"
								value="custom"
							></el-option>
						</el-select>
						<el-input
							style="flex: 1;margin-left: 10px;margin-bottom: -1px;"
							:type="form.aggCacheMaxSize === -1 ? 'text' : 'number'"
							:disabled="form.aggCacheMaxSize === -1"
							:value="form.aggCacheMaxSize === -1 ? '-' : form.aggCacheMaxSize"
							@input="
								v => {
									form.aggCacheMaxSize = !v || v == 0 ? 1 : v;
								}
							"
						>
							<template slot="append">
								{{ $t('editor.cell.data_node.memCache.form.maxRows.unit') }}
							</template>
						</el-input>
					</div>
				</el-form-item>
				<el-form-item :label="$t('dataFlow.keepAggreHistoryData')" required>
					<el-switch
						v-model="form.keepAggRet"
						:active-text="form.keepAggRet ? $t('dataFlow.yes') : $t('dataFlow.no')"
					>
					</el-switch>
				</el-form-item>
			</el-col>
			<el-col style="padding: 0 10px;">
				<el-row
					type="flex"
					:gutter="20"
					class="loopFrom"
					v-for="(item, index) in form.aggregations"
					:key="index"
				>
					<el-col :span="21" class="fromLoopBox">
						<el-row :gutter="10">
							<el-col :span="6">
								<el-form-item
									:label="$t('dataFlow.aggFunction')"
									:prop="'aggregations.' + index + '.aggFunction'"
									required
								>
									<el-select v-model="item.aggFunction" @change="changeAggFunction(item, index)">
										<el-option
											v-for="item in selectList"
											:key="item.value"
											:label="item.label"
											:value="item.value"
										>
										</el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="18">
								<el-form-item
									:label="$t('dataFlow.aggExpression')"
									:prop="'aggregations.' + index + '.aggExpression'"
									:required="item.aggFunction !== 'COUNT'"
								>
									<el-select
										v-model="item.aggExpression"
										filterable
										allow-create
										default-first-option
										:placeholder="$t('dataFlow.selectTargetField')"
										:disabled="item.aggFunction === 'COUNT'"
									>
										<el-option
											v-for="item in expressionList"
											:key="item.field_name"
											:label="item.field_name"
											:value="item.field_name"
										>
										</el-option>
									</el-select>
								</el-form-item>
							</el-col>
						</el-row>
						<el-form-item required :prop="'aggregations.' + index + '.name'">
							<div class="e-label" slot="label">
								<label class="el-form-item__label">{{ $t('dataFlow.aggName') }}</label>
								<el-tooltip effect="dark" placement="top">
									<div style="max-width: 300px" slot="content">{{ $t('dataFlow.nameTip') }}</div>
									<span class="icon iconfont icon-tishi1"></span>
								</el-tooltip>
							</div>
							<!-- <el-popover
							class="aggtip"
							placement="top-start"
							width="200"
							trigger="hover"
							:content="$t('dataFlow.nameTip')"
						>
							<span class="icon iconfont icon-tishi1" slot="reference"></span>
						</el-popover> -->
							<el-input v-model="item.name"></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('dataFlow.filterPredicate')"
							:prop="'aggregations.' + index + '.filterPredicate'"
						>
							<el-input
								style="margin: 5px 0;"
								type="textarea"
								v-model="item.filterPredicate"
								:placeholder="$t('dataFlow.enterFilterTable')"
							></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('dataFlow.groupByExpression')"
							:prop="'aggregations.' + index + '.groupByExpression'"
						>
							<el-select
								v-model="item.groupByExpression"
								:placeholder="$t('dataFlow.selectGrpupFiled')"
								multiple
								filterable
								allow-create
								default-first-option
							>
								<el-option
									v-for="item in groupList"
									:key="item.field_name"
									:label="item.field_name"
									:value="item.field_name"
								>
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="2" class="right">
						<el-button plain style="padding: 0;" @click="removeRow(item, index)">
							<i class="iconfont icon-quxiao remove"></i>
						</el-button>
					</el-col>
				</el-row>
			</el-col>
			<el-col>
				<el-form-item class="btnClass">
					<el-button @click="addRow">+ {{ $t('editor.cell.processor.aggregate.new_aggregate') }}</el-button>
				</el-form-item>
			</el-col>
		</el-form>
		<div class="example">
			<h3>{{ $t('editor.cell.processor.aggregate.returnExample') }}</h3>
			<ul class="example-box">
				{
				<li>
					<span class="text">_id: "students_sum",</span>
					<span class="comment">{{ $t('editor.cell.processor.aggregate.idComment') }}</span>
				</li>
				<li>
					<span class="text">COUNT: 132,</span>
					<span class="comment">{{ $t('editor.cell.processor.aggregate.countComment') }}</span>
				</li>
				<li>
					<span class="text">{{ $t('editor.cell.processor.aggregate.school_name') }}</span>
					<span class="comment">{{ $t('editor.cell.processor.aggregate.school_nameComment') }}</span>
				</li>
				}
			</ul>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import log from '../../../log';
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema';
import MultiSelection from '../../../components/MultiSelection';

let counter = 0;
let editorMonitor = null;
export default {
	name: 'Aggregate',
	components: { MultiSelection },
	data() {
		return {
			disabled: false,
			selectList: [
				{ label: 'AVG', value: 'AVG' },
				{ label: 'SUM', value: 'SUM' },
				{ label: 'MAX', value: 'MAX' },
				{ label: 'MIN', value: 'MIN' },
				{ label: 'COUNT', value: 'COUNT' }
			],
			groupList: [],
			expressionList: [],
			form: {
				name: '',
				type: 'aggregation_processor',
				aggregations: [
					{
						name: 'COUNT',
						filterPredicate: '',
						aggFunction: 'COUNT',
						aggExpression: '',
						groupByExpression: ''
					}
				],
				primaryKeys: '',
				aggCacheMaxSize: 100000,
				keepAggRet: false
			},
			primaryKeyOptions: [],
			aggaggExpression: '1',
			countObj: {
				AVG: 0,
				SUM: 0,
				MAX: 0,
				MIN: 0,
				COUNT: 0
			}
		};
	},
	mounted() {
		this.form.aggregations.forEach(item => {
			if (item.aggFunction === 'COUNT') {
				item.aggExpression = '';
			}
		});
	},

	watch: {
		form: {
			deep: true,
			handler(val) {
				// let aggaggExpression = '1'
				if (val.aggregations && val.aggregations.length > 0) {
					val.aggregations.forEach(item => {
						if (item.aggFunction === 'COUNT') {
							item.aggExpression = '';
						}
					});
				}
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		changeAggFunction(data) {
			if (data.aggFunction !== 'COUNT') {
				data.aggExpression = '1';
			}
			let aggFunctionArr = [];
			for (let i = 0; i < this.form.aggregations.length; i++) {
				let item = this.form.aggregations[i];
				aggFunctionArr.push(item.name);
				if (new Set(aggFunctionArr).size !== aggFunctionArr.length) {
					this.countObj[data.aggFunction]++;
				}
				if (this.countObj[data.aggFunction] === 0) {
					data.name = data.aggFunction;
				} else {
					data.name = data.aggFunction + '_' + this.countObj[data.aggFunction];
				}
			}
		},
		addRow() {
			let list = {
				name: '',
				filterPredicate: '',
				aggFunction: 'COUNT',
				aggExpression: '1',
				groupByExpression: ''
			};
			this.form.aggregations.push(list);
			this.changeAggFunction(list);
			log('length', this.form.aggregations.length);
		},

		removeRow(item, index) {
			this.index = this.form.aggregations.indexOf(item);
			if (index !== -1) {
				this.form.aggregations.splice(index, 1);
			}
		},

		setData(data, cell, dataNodeInfo, vueAdapter) {
			if (data) {
				_.merge(this.form, data);
				this.form.aggregations.map((item, index) => {
					this.$set(this.form.aggregations, index, item);
				});
			}

			let inputSchemas = cell.getInputSchema();
			let schema = mergeJoinTablesToTargetSchema(null, inputSchemas);
			//获取所有字段键选项，若主键为空，默认选中schema中的主键
			if (schema && schema.fields) {
				//过滤被删除的字段
				schema.fields = removeDeleted(schema.fields);
				this.primaryKeyOptions = schema.fields.map(f => f.field_name);
				if (!this.form.primaryKeys) {
					let primaryKeys = schema.fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
					if (primaryKeys.length > 0) this.form.primaryKeys = Array.from(new Set(primaryKeys)).join(',');
				}
			}

			let object = {};
			this.groupList = schema.fields ? schema.fields.sort((v1, v2) => (v1 > v2 ? 1 : v1 === v2 ? 0 : -1)) : [];
			if (!!this.groupList && this.groupList.length > 0) {
				this.groupList = this.groupList.reduce((cur, next) => {
					if (!object[next.field_name]) {
						object[next.field_name] = true;
						cur.push(next);
					}
					return cur;
				}, []);
			}
			this.expressionList = this.groupList;
			log('Aggregate.setData.inputSchemas', inputSchemas, schema.fields);

			if (!this.form.name) {
				if (counter === 0) this.form.name = this.$t('dataFlow.aggregation');
				if (counter !== 0) this.form.name = this.$t('dataFlow.aggregation') + counter;
				counter++;
			}

			editorMonitor = vueAdapter.editor;
		},

		getData() {
			return _.cloneDeep(this.form);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>

<style scoped lang="less">
.aggregate {
	width: 100%;
	height: 100%;
	padding: 20px;
	overflow: auto;
	box-sizing: border-box;
	background-color: #fafafa;

	.loopFrom {
		width: 100%;

		.fromLoopBox {
			padding: 10px;
			margin-bottom: 12px;
			box-sizing: border-box;
			background-color: #fff;
			border: 1px solid #dedee4;
		}

		.remove {
			font-weight: bold;
		}
	}

	.example {
		h3 {
			font-size: 12px;
			color: #000;
			font-weight: bold;
		}
		.example-box {
			padding-top: 10px;
			font-size: 12px;
			color: #000;
			li {
				padding: 5px 0;
				.text {
					display: inline-block;
					width: 160px;
					padding-left: 10px;
				}
				.comment {
					display: inline-block;
					color: #aaa;
				}
			}
		}
	}
}
</style>
<style lang="less">
.aggregate {
	.head-btns {
		p {
			padding: 20px 0;
			color: rgb(241, 145, 73);
			font-size: 12px;
			text-align: left;
		}
	}
	.e-label {
		display: inline-block;
		.iconfont {
			color: #999;
			cursor: pointer;
			vertical-align: middle;
			transform: rotate(-180deg);
		}
	}

	.el-form--label-top .el-form-item__label {
		padding: 0;
		line-height: 26px;
	}

	.el-select {
		width: 100%;
	}

	.el-form-item {
		margin-bottom: 8px;
		.el-form-item__label,
		.el-input__inner {
			font-size: 12px;
		}
		.el-input__inner {
			height: 30px;
			line-height: 30px;
		}
		.el-switch__label {
			span {
				font-size: 12px !important;
			}
		}
	}

	.aggregateName .el-form-item__content {
		z-index: 2;
	}

	.el-form-item__content {
		.el-button {
			padding: 8px 15px;
			font-size: 12px;
		}
		.el-input__inner[style='height: 40px;'] {
			height: 30px !important;
		}
	}
	.btnClass .el-form-item__content {
		line-height: 30px !important;
	}
}
</style>
