<template>
	<div class="e-memery-cache nodeStyle">
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>
			<el-form
				class="e-form"
				label-position="top"
				label-width="130px"
				:disabled="disabled"
				:model="model"
				ref="form"
			>
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.cacheName.label')">
					<el-input
						v-model.trim="model.cacheName"
						size="mini"
						:placeholder="$t('editor.cell.data_node.memCache.form.cacheName.placeholder')"
						@input="nameHandler"
					></el-input>
				</el-form-item>
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.cacheKeys.label')">
					<PrimaryKeyInput
						v-model="model.cacheKeys"
						:options="primaryKeyOptions"
						:placeholder="$t('editor.cell.data_node.memCache.form.cacheKeys.placeholder')"
					></PrimaryKeyInput>
				</el-form-item>
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.maxSize.label')">
					<el-row :gutter="20">
						<el-col :span="12">
							<el-select
								size="mini"
								v-model="maxSizeLimited"
								:placeholder="$t('editor.cell.data_node.memCache.form.maxSize.placeholder')"
								@change="maxSizeLimitedHandler"
							>
								<el-option
									v-for="opt in sizeLimitedOptions"
									:key="opt.label"
									:label="opt.label"
									:value="opt.value"
								></el-option>
							</el-select>
						</el-col>
						<el-col :span="12">
							<el-input
								v-show="maxSizeLimited < 0"
								type="tel"
								v-model="model.maxSize"
								size="mini"
								maxlength="8"
								:placeholder="$t('editor.cell.data_node.memCache.form.maxSize.placeholder')"
							>
								<template slot="append">M</template>
							</el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.maxRows.label')">
					<el-row :gutter="20">
						<el-col :span="12">
							<el-select
								size="mini"
								v-model="maxRowsLimited"
								:placeholder="$t('editor.cell.data_node.memCache.form.maxRows.placeholder')"
								@change="maxRowLimitedHancler"
							>
								<el-option
									:label="$t('editor.cell.data_node.memCache.form.maxRows.options.custom')"
									:value="true"
								></el-option>
								<el-option
									:label="$t('editor.cell.data_node.memCache.form.maxRows.options.unlimited')"
									:value="false"
								></el-option>
							</el-select>
						</el-col>
						<el-col :span="12">
							<el-input
								v-show="maxRowsLimited"
								type="number"
								v-model="model.maxRows"
								size="mini"
								:placeholder="$t('editor.cell.data_node.memCache.form.maxRows.placeholder')"
							>
								<template slot="append">{{
									$t('editor.cell.data_node.memCache.form.maxRows.unit')
								}}</template>
							</el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<div class="code-template">
					<label>{{ $t('editor.cell.data_node.memCache.applicationCode') }}:</label>
					<div class="code">
						<span class="color-primary">var</span> cachedRow = CacheService.getCache(
						<span class="color-danger">"{{ model.cacheName || 'cachename' }}"</span>
						<template v-if="!model.cacheKeys || !model.cacheKeys.length">
							<span class="bold">record</span>.<span class="color-danger">category_code</span>
						</template>
						<span v-for="key in model.cacheKeys.split(',')" :key="key">
							, <span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
						</span>
						);<br />
						<span class="bold">record</span>.category_name = cachedRow.category_name;<br />
					</div>
					<span>OR</span>
					<div class="code">
						<span class="bold">record</span>.category_name = CacheService.getCacheItem(
						<span class="color-danger">"{{ model.cacheName || 'cachename' }}"</span>,
						<span>'category_name'</span>, defaultValue,
						<span v-for="key in model.cacheKeys.split(',')" :key="key">
							, <span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
						</span>
						);
					</div>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script>
// import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "../../util/Schema";
import PrimaryKeyInput from '../../../components/PrimaryKeyInput';
import log from '../../../log';
import _ from 'lodash';
let editorMonitor = null;
export default {
	name: 'memCache',

	components: { PrimaryKeyInput },

	data() {
		return {
			disabled: false,
			databases: [],

			sizeLimitedOptions: [
				{ label: '50M', value: 50 },
				{ label: '100M', value: 100 },
				{ label: '200M', value: 200 },
				{ label: '512M', value: 512 },
				{ label: '1G', value: 1024 },
				{ label: '10G', value: 1024 * 10 },
				{ label: '50G', value: 1024 * 50 },
				{ label: '100G', value: 1024 * 100 },
				{ label: '200G', value: 1024 * 200 },
				{
					label: this.$t('editor.cell.data_node.memCache.form.maxSize.options.unlimited'),
					value: 0
				},
				{
					label: this.$t('editor.cell.data_node.memCache.form.maxSize.options.custom'),
					value: -1
				}
			],

			model: {
				name: '',
				cacheName: '',
				cacheKeys: '',
				maxSize: 50,
				maxRows: 10000
			},

			primaryKeyOptions: [],
			maxSizeLimited: 0,
			maxRowsLimited: 0
		};
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		setData(data, cell, isSourceDataNode, vueAdapter) {
			log('MemCache SetData');
			if (data) {
				// Object.keys(data).forEach(key => (this.model[key] = data[key]));
				_.merge(this.model, data);
				this.setLimited(data.maxSize);
				this.maxRowsLimited = data.maxRows > 0;
			}
			let schema = cell.getInputSchema()[0];
			let cacheKeys = this.model.cacheKeys;
			if (schema && schema.sourceSchema) {
				if (!this.model.name) {
					this.model.name = this.model.cacheName = schema.tableName;
				}
				let fields = schema.sourceSchema.fields || [];
				this.primaryKeyOptions = fields.map(f => f.field_name);
				if (!cacheKeys) {
					let primaryKeys = fields
						.filter(f => f.primary_key_position > 0)
						.map(f => f.field_name)
						.join(',');
					this.model.cacheKeys = primaryKeys || this.primaryKeyOptions[0] || '';
				}
			}

			editorMonitor = vueAdapter.editor;
		},

		getData() {
			return _.cloneDeep(this.model);
		},

		setLimited(val) {
			let option = this.sizeLimitedOptions.find(opt => opt.value === val);
			this.maxSizeLimited = option ? val : -1;
		},

		nameHandler(val) {
			this.model.name = val;
		},

		maxSizeLimitedHandler(value) {
			if (value < 0) {
				this.model.maxSize = 50;
			} else {
				this.model.maxSize = value;
			}
		},
		maxRowLimitedHancler(limited) {
			if (limited) {
				this.model.maxRows = 10000;
			} else {
				this.model.maxRows = 0;
			}
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

<style lang="less" scoped>
.e-memery-cache {
	.code-template {
		margin-top: 20px;
		line-height: 30px;
		font-size: 12px;
		color: #333;
		.code {
			padding: 5px 15px;
			background: #fff;
			overflow-x: auto;
			white-space: nowrap;
			.color-primary {
				color: #48b6e2;
			}
			.color-danger {
				color: #ee5353;
			}
			.bold {
				font-weight: bold;
			}
		}
	}
}
</style>
