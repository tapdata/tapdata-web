<template>
	<div class="e-memery-cache nodeStyle">
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" label-width="130px" :rules="rules" :model="model" ref="form">
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.cacheName.label')">
					<el-input
						v-model="model.cacheName"
						size="mini"
						:placeholder="$t('editor.cell.data_node.memCache.form.cacheName.placeholder')"
						@input="nameHandler"
					></el-input>
				</el-form-item>
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.cacheKeys.label')">
					<el-select
						size="mini"
						v-model="cacheKeysValues"
						multiple
						filterable
						allow-create
						default-first-option
						:placeholder="$t('editor.cell.data_node.memCache.form.cacheKeys.placeholder')"
						@change="cacheKeysHandler"
					>
						<el-option
							v-for="field in sourceSchemaFields"
							:key="field.field_name"
							:label="field.field_name"
							:value="field.field_name"
						>
						</el-option>
					</el-select>
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
									:label="$t('editor.cell.data_node.memCache.form.maxSize.options.custom')"
									:value="true"
								></el-option>
								<el-option
									:label="$t('editor.cell.data_node.memCache.form.maxSize.options.unlimited')"
									:value="false"
								></el-option>
							</el-select>
						</el-col>
						<el-col :span="12">
							<el-input
								:disabled="!maxSizeLimited"
								type="number"
								v-model="model.maxSize"
								size="mini"
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
								:disabled="!maxRowsLimited"
								type="number"
								v-model="model.maxRows"
								size="mini"
								:placeholder="$t('editor.cell.data_node.memCache.form.maxRows.placeholder')"
							>
								<template slot="append">{{
									$t("editor.cell.data_node.memCache.form.maxRows.unit")
								}}</template>
							</el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<div class="code-template">
					<label>应用代码：</label>
					<div class="code">
						<span class="color-primary">var</span> cache = CacheService.getCache( "<span
							class="color-danger"
							>{{ model.cacheName || "cachename" }}</span
						>" );<br />
						<span class="color-primary">var</span> cachedRow = cache.get(
						<span class="color-danger">{{ cacheKey || "cachekey" }}</span>
						);
					</div>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script>
// import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "../../util/Schema";
import log from "../../../log";
import _ from "lodash";

export default {
	name: "memCache",

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit("dataChanged", this.getData());
			}
		}
	},

	data() {
		let validateNumber = (rule, value, callback) => {};
		return {
			databases: [],

			rules: {
				maxSize: [{ validator: validateNumber, trigger: "blur" }],
				maxRows: [{ validator: validateNumber, trigger: "blur" }]
			},

			model: {
				name: "",
				cacheName: "",
				cacheKeys: "",
				maxSize: 50,
				maxRows: 10000
			},

			cacheKeysValues: [],
			sourceSchemaFields: [],
			maxSizeLimited: false,
			maxRowsLimited: false
		};
	},

	computed: {
		cacheKey() {
			let keys = this.model.cacheKeys;
			if (keys) {
				return this.model.cacheKeys
					.split(",")
					.map(key => "record." + key)
					.join(' + "_" + ');
			}
			return "record.cachekey";
		}
	},

	methods: {
		setData(data, cell) {
			log("MemCache SetData");
			if (data) {
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
				this.maxSizeLimited = data.maxSize > 0;
				this.maxRowsLimited = data.maxRows > 0;
				this.cacheKeysValues = data.cacheKeys.length ? data.cacheKeys.split(",") : [];
			}
			let schema = cell.getInputSchema()[0];
			if (schema) {
				if (!this.model.name) {
					this.model.name = this.model.cacheName = schema.tableName;
				}
				this.sourceSchemaFields = schema.sourceSchema.fields;
			}
		},
		getData() {
			return _.cloneDeep(this.model);
		},
		nameHandler(val) {
			this.model.name = val;
		},
		cacheKeysHandler() {
			this.model.cacheKeys = this.cacheKeysValues.join(",");
		},
		maxSizeLimitedHandler(limited) {
			if (limited) {
				this.model.maxSize = 50;
			} else {
				this.model.maxSize = 0;
			}
		},
		maxRowLimitedHancler(limited) {
			if (limited) {
				this.model.maxRows = 10000;
			} else {
				this.model.maxRows = 0;
			}
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
			overflow: hidden;
			word-break: break-all;
			.color-primary {
				color: #48b6e2;
			}
			.color-danger {
				color: #ee5353;
			}
		}
	}
}
</style>
