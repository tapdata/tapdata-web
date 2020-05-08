<template>
	<div class="apiNode nodeStye">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{$t("editor.nodeSettings")}}</span>
		</head>
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" :model="model" ref="form">
				<!-- <span class="addTxt">+新建文件</span> -->
				<el-form-item :label="$t('editor.choose') + 'API'" prop="connectionId" :rules="rules" required>
					<el-select
							filterable v-model="model.connectionId"
							:placeholder="$t('editor.cell.data_node.api.chooseApiName')">
						<el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"></el-option>
					</el-select>
				</el-form-item>

        <el-form-item :label="$t('editor.cell.data_node.collection.form.collection.label')" prop="tableName" required>
          <el-select
              v-model="model.tableName"
              filterable
              allow-create
              default-first-option
              clearable
              :placeholder="$t('editor.cell.data_node.collection.form.collection.placeholder')" size="mini">
            <el-option
                v-for="(item, idx) in schemas"
                :label="`${item.table_name}`"
                :value="item.table_name"
                v-bind:key="idx"></el-option>
          </el-select>
        </el-form-item>
			</el-form>
		</div>
	</div>
</template>
<script>
	import _ from "lodash";
	import factory from '../../../api/factory';
  import { convertSchemaToTreeData } from "../../util/Schema";
	let connections = factory('connections');

	export default {
		name: "ApiNode",

		data() {
			return {
				databases: [],
				rules: {
					connectionId: [
						{required: true, trigger: 'blur', message: this.$t('editor.cell.data_node.api.chooseApiName')},
					]
				},
				model: {
          connectionId: "",
          type: "rest api"
        },
        mergedSchema: null,
			};
		},

		async mounted() {
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						database_type: 'rest api',

					},
					fields: {
						name: 1, id: 1, database_type: 1, connection_type: 1, status: 1, schema: 1
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
      },

      'model.connectionId': {
				immediate: true,
				handler(){
					this.loadDataModels(this.model.connectionId);
				}
			},
		},

		methods: {
      convertSchemaToTreeData,

      loadDataModels(connectionId){
				if( !connectionId ){
					return;
				}
				let self = this;
				connections.get([connectionId]).then(result => {
					if( result.data ){
						let schemas = result.data.schema && result.data.schema.tables || [];
						schemas = schemas.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);
						self.schemas = schemas;
					}
        });
      },

			setData(data, cell, isSourceDataNode, vueAdapter) {
				if (data) {
					Object.keys(data).forEach(key => this.model[key] = data[key]);
        }
        this.mergedSchema = cell.getOutputSchema();
        cell.on('change:outputSchema', () => {
					this.mergedSchema = cell.getOutputSchema();
				});

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

