<template>
	<div class="e-memery-cache nodeStyle">
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" label-width="130px" :model="model" ref="form">
				<el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.cacheName.label')">
					<el-input
						v-model.trim="model.cacheName"
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
									$t("editor.cell.data_node.memCache.form.maxRows.unit")
								}}</template>
							</el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<div class="code-template">
					<label>{{ $t("editor.cell.data_node.memCache.applicationCode") }}:</label>
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

	data() {
		return {
			databases: [],

			sizeLimitedOptions: [
				{ label: "50M", value: 50 },
				{ label: "100M", value: 100 },
				{ label: "200M", value: 200 },
				{ label: "512M", value: 512 },
				{ label: "1G", value: 1024 },
				{ label: "10G", value: 1024 * 10 },
				{ label: "50G", value: 1024 * 50 },
				{ label: "100G", value: 1024 * 100 },
				{ label: "200G", value: 1024 * 200 },
				{ label: this.$t("editor.cell.data_node.memCache.form.maxSize.options.unlimited"), value: 0 },
				{ label: this.$t("editor.cell.data_node.memCache.form.maxSize.options.custom"), value: -1 }
			],

			model: {
				name: "",
				cacheName: "",
				cacheKeys: "",
				maxSize: 50,
				maxRows: 10000
			},

			cacheKeysValues: [],
			sourceSchemaFields: [],
			maxSizeLimited: 0,
			maxRowsLimited: 0
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

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit("dataChanged", this.getData());
			}
		}
	},

	methods: {
		setData(data, cell) {
			log("MemCache SetData");
			if (data) {
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
				this.setLimited(data.maxSize);
				this.maxRowsLimited = data.maxRows > 0;
			}
			let schema = cell.getInputSchema()[0];
			let cacheKeys = this.model.cacheKeys;
			if (schema && schema.sourceSchema) {
				if (!this.model.name) {
					this.model.name = this.model.cacheName = schema.tableName;
				}
				this.sourceSchemaFields = schema.sourceSchema.fields;
				if (!cacheKeys) {
					let field = this.sourceSchemaFields.find(field => field.primary_key_position === 1);
					cacheKeys = field ? field.field_name : this.sourceSchemaFields[0].field_name;
				}
			}
			this.cacheKeysValues = cacheKeys.length ? cacheKeys.split(",") : [];
			this.model.cacheKeys = cacheKeys;
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
		cacheKeysHandler() {
			let cacheKeys = this.cacheKeysValues.filter(v => !!v.trim());
			this.cacheKeysValues = cacheKeys;
			this.model.cacheKeys = cacheKeys.join(",");
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
