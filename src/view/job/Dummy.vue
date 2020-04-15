<template>
	<div class="dummy nodeStye">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{$t("editor.nodeSettings")}}</span>
		</head>
		<div class="nodeBody">
			<el-form label-position="top" :model="model" ref="form">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item :label="$t('editor.choose') + 'Dummy'" prop="connectionId" :rules="rules" required>
					<el-select
							filterable v-model="model.connectionId"
							:placeholder="$t('editor.cell.data_node.dummy.chooseDummyName')">
						<el-option
								v-for="(item, idx) in databases"
								:label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
								:value="item.id"
								v-bind:key="idx"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>
<script>
	import _ from "lodash";
	import factory from '../../api/factory';

	let connections = factory('connections');

	export default {
		name: "Dummy",

		data() {
			return {
				databases: [],
				rules: {
					connectionId: [
						{
							required: true,
							trigger: 'blur',
							message: this.$t('editor.cell.data_node.dummy.chooseDummyName')
						},
					]
				},
				model: {
					connectionId: ""
				}
			};
		},

		async mounted() {
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						database_type: 'dummy'
					},
					fields: {
						name: 1, id: 1, database_type: 1, connection_type: 1, status: 1
					},
					order: 'name ASC'
				})
			});

			if (result.data) {
				this.databases = result.data;
			}
		},

		watch: {
			model: {
				deep: true,
				handler(val) {
					this.$emit('dataChanged', this.getData());
				}
			}
		},

		methods: {
			setData(data) {
				if (data) {
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
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
		}
	};
</script>

