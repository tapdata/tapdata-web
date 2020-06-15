<template>
	<div class="customName nodeStyle">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{ $t("editor.nodeSettings") }}</span>
		</head>
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t("dataFlow.button.viewMonitoring") }}
				</el-button>
			</div>
			<el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item :label="$t('editor.choose') + 'Custom'" prop="connectionId" :rules="rules" required>
					<el-select
						filterable
						v-model="model.connectionId"
						:placeholder="$t('editor.cell.data_node.custom.chooseCustomName')"
					>
						<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
							:value="item.id"
							v-bind:key="idx"
						></el-option>
					</el-select>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>
<script>
import _ from "lodash";
import factory from "../../../api/factory";
let connections = factory("connections");
let editorMonitor = null;
export default {
	name: "CustomNode",
	props: {
		connection_type: {
			type: String,
			default: "source"
		}
	},

	data() {
		return {
			disabled: false,
			databases: [],
			rules: {
				connectionId: [
					{
						required: true,
						trigger: "blur",
						message: this.$t("editor.cell.data_node.custom.chooseCustomName")
					}
				]
			},
			model: {
				connectionId: "",
				type: "custom_connection"
			}
		};
	},

	async mounted() {
		let result = await connections.get({
			filter: JSON.stringify({
				where: {
					database_type: "custom_connection"
				},
				fields: {
					name: 1,
					id: 1,
					database_type: 1,
					connection_type: 1,
					status: 1
				},
				order: "name ASC"
			})
		});

		if (result.data) {
			this.databases = result.data;
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
		setData(data, cell, isSourceDataNode, vueAdapter) {
			this.model = {
				connectionId: "",
				type: "custom_connection"
			};
			if (data) {
				_.merge(this.model, data);
			}

			editorMonitor = vueAdapter.editor;
		},

		getData() {
			let result = _.cloneDeep(this.model);
			if (result.connectionId) {
				let database = this.databases.filter(db => db.id === result.connectionId);
				if (database && database.length > 0) {
					result.name = database[0].name;
				}
			}
			return result;
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
