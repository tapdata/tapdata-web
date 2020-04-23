<template>
	<div class="database nodeStye">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{$t("editor.nodeSettings")}}</span>
		</head>
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" label-width="160px" :model="model" ref="form">
				<el-form-item
						class="e-form" :label="$t('editor.cell.data_node.database.form.label')"
						prop="connectionId" :rules="rules" required>
					<el-select
							filterable v-model="model.connectionId" @change="getSelectType"
							:placeholder="$t('editor.cell.data_node.database.form.placeholder')" size="mini">
						<el-option
								v-for="(item, idx) in databases"
								:label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
								:value="item.id"
								v-bind:key="idx"></el-option>
					</el-select>
				</el-form-item>
				<div class="databaseInfo">
					<span v-show="database_type">{{database_type}}</span>
				</div>
			</el-form>
		</div>
		<div class="processingBody">
			<div class="allCheck" v-if="activeName ==='first'">
				<el-checkbox v-model="selectAllTables"></el-checkbox>
				<span @click="bulkRemoval()">{{$t('editor.cell.data_node.database.bulkRemoval')}}</span>
			</div>

			<div class="allCheck" v-if="activeName ==='second'">
				<el-checkbox v-model="selectAllRemoveTables"></el-checkbox>
				<span @click="bulkRevocation()">{{$t('editor.cell.data_node.database.bulkRevocation')}}</span>
			</div>

			<el-tabs class="e-tabs" v-model="activeName" @tab-click="handleClick">

				<el-tab-pane :label="$t('editor.cell.data_node.database.queueCopied') + '('+tables.length+')'" name="first">
          <div class="search">
            <el-input
              :placeholder="$t('editor.cell.data_node.database.enterName')"
              prefix-icon="el-icon-search"
              v-model="search">
            </el-input>
          </div>
					<el-row class="list" :class="{active:item.checked}"
							v-for="(item,index) in computedTables"
							:key="item.id"
							:gutter="20">
              <el-col :span="2">
                <el-checkbox v-model="item.checked" @change='checkedOne(item,index)'></el-checkbox>
              </el-col>
              <el-col :span="17">
                <i class="iconfont icon-table2"></i>
                <span class="tableName">{{item.table_name}}</span>
              </el-col>
              <el-col :span="5" class="text-center">
                <el-button type="text" @click="removeTable(item,index)">{{$t('editor.cell.data_node.database.remove')}}</el-button>
              </el-col>
					</el-row>
				</el-tab-pane>

				<el-tab-pane :label="$t('editor.cell.data_node.database.tableRemoved') + '('+model.excludeTables.length+')'" name="second">
          <div class="search">
            <el-input
              :placeholder="$t('editor.cell.data_node.database.enterName')"
              prefix-icon="el-icon-search"
              v-model="removeSearch">
            </el-input>
          </div>

					<el-row class="list"
            :class="{active:item.checked}"
            v-for="(item,index) in computedRemoveTables"
            :key="item.id"
            :gutter="20">
						<el-col :span="2">
							<el-checkbox v-model="item.checked" @change='checkedOne(item,index)'></el-checkbox>
						</el-col>
						<el-col :span="17">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{item.table_name}}</span>
						</el-col>
						<el-col :span="5" class="text-center">
							<el-button type="text" @click="undotble(item,index)">{{$t('editor.cell.data_node.database.Undo')}}</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</div>

	</div>
</template>

<script>
	import factory from '../../../api/factory';
  import _ from 'lodash';

	let connections = factory('connections');

	export default {
		name: "Database",

		props: {
			connection_type: {
				type: String,
				default: 'source'
			}
		},

		data() {
			return {
        removeSearch: '',
        search: '',

        tables: [],
        removeTables: [],

        selectAllTables: false,
        selectAllRemoveTables: false,

				databases: [],
				activeName: 'first',
				rules: {
					connectionId: [
						{
							required: true,
							trigger: 'blur',
							message: this.$t('editor.cell.data_node.database.form.placeholder')
						},
					]
				},
				model: {
					connectionId: "",
					excludeTables: [],
				},
        database_type: '',
			};
    },

    computed: {
      computedTables(){
        if( this.search ){
          return this.tables.filter( t => t.table_name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0 );
        } else {
          return this.tables;
        }
      },
      computedRemoveTables(){
        if( this.removeSearch ){
          return this.removeTables.filter( t => t.table_name.toLowerCase().indexOf(this.removeSearch.toLowerCase()) >= 0 );
        } else {
          return this.removeTables;
        }
      }
    },

		async mounted() {
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						database_type: {nin: ['file', 'dummy', 'gridfs', 'rest api']}
					},
					fields: {
						name: 1, id: 1, database_type: 1, connection_type: 1, status: 1
					},
					order: 'name ASC'
				})
			});

			if (result.data) {
        this.databases = result.data;
        this.lookupDatabaseType();
			}
		},

		watch: {
			model: {
				deep: true,
				handler() {
					this.$emit('dataChanged', this.getData());
				}
			},
			'model.connectionId': {
				immediate: true,
				handler() {
          this.lookupDatabaseType();
					this.loadDataModels(this.model.connectionId);
				}
      },
      selectAllTables: {
        handler(){
          this.tables.forEach( t => t.checked = this.selectAllTables);
        }
      },
      selectAllRemoveTables: {
        handler(){
          this.removeTables.forEach( t => t.checked = this.selectAllRemoveTables);
        }
      }
    },

		methods: {

      lookupDatabaseType(){
          if(!this.model.connectionId)
            return;
          let selectedDbs = this.databases.filter( db => db.id === this.model.connectionId);
          if( selectedDbs && selectedDbs.length > 0){
            this.database_type = selectedDbs[0].database_type;
          }
      },

			// 获取表名称
			loadDataModels(connectionId) {
				if (!connectionId) {
					return;
				}
        let self = this;
				connections.get([connectionId]).then(result => {
					if (result.data) {
            let tables = result.data.schema && result.data.schema.tables || [];
            tables = tables.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);
						tables.forEach(item => {
              let tableName = item.table_name;
              if( self.model.excludeTables.indexOf(tableName) >= 0 ){
                self.removeTables.push({
                  table_name: item.table_name, checked: false
                });
              } else {
                self.tables.push({
                  table_name: item.table_name, checked:false
                });
              }
						});
					}
				});
      },
      // 移除
      removeTable(item, idx){
        item.checked = false;
        this.tables.splice(idx,1);
        this.removeTables.push(item);
        this.removeTables.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);

        if(this.model.excludeTables.indexOf(item.table_name) === -1){
          this.model.excludeTables.push(item.table_name);
        }
      },
      // 撤销
      undotble(item, idx) {
        item.checked = false;
        this.removeTables.splice(idx, 1);
        this.tables.push(item);
        this.tables.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);

        let index = this.model.excludeTables.indexOf(item.table_name);
        if(index >= 0){
          this.model.excludeTables.splice(index, 1);
        }
      },
      // 全部移除
      bulkRemoval(){
        for(let i = 0; i < this.tables.length; i++){
          let item = this.tables[i];
          if(item.checked === true){
            this.removeTable(item, i);
            i--;
          }
        }
        this.selectAllTables = false;
      },
      // 全部撤销
      bulkRevocation(){
        for(let i = 0; i < this.removeTables.length; i++){
          let item = this.removeTables[i];
          if(item.checked === true){
            this.undotble(item, i);
            i--;
          }
        }
        this.selectAllRemoveTables = false;
      },

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
			}
		}
	};
</script>
<style lang="less">
	.database {
    .el-form-item { margin-bottom: 10px;}
		.processingBody {
			position: relative;
			height: calc(100% - 165px);

			.allCheck {
				position: absolute;
				right: 25px;
				line-height: 36px;
				z-index: 2;
				font-size: 12px;

				span {
					padding-left: 3px;
					cursor: pointer;
				}

				span:hover {
					color: #48b6e2;
				}
			}

			.el-tabs {
				height: 100%;

				.el-tabs__nav {
					margin: 0 25px;

					.el-tabs__item {
						font-size: 12px;
					}

					.el-tabs__active-bar {
						height: 4px;
					}
				}

				.el-tabs__content {
					height: calc(100% - 55px);
				}

				.el-tab-pane {
					height: 100%;
					overflow: auto;
				}

				.list {
					width: 100%;
					height: 36px;
          line-height: 36px;
          margin: 0!important;
					padding: 0 15px;
					font-size: 12px;
					overflow: hidden;
          .iconfont {
						color: #4AAF47;
					}
					.el-button--text {
						font-size: 12px;
						opacity: 0;
						visibility: hidden;
					}
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
					.el-checkbox {
						opacity: 0;
						visibility: hidden;
					}
				}

				.list:hover, .active {
					.tableName {
						color: #48b6e2;
					}

					background-color: #E7F5FA;

					.el-checkbox {
						opacity: 1;
						visibility: visible;
					}

					.el-button--text {
						opacity: 1;
						visibility: visible;
					}
				}
			}
		}
    .search{
      width: 100%;
      padding: 0 25px 10px;
      box-sizing: border-box;
      // overflow: hidden;
      .el-input,.el-input__inner,.el-input__icon {
        height: 30px;
        line-height: 30px;
        font-size: 12px;
      }
    }
		.databaseInfo {
			span {
				margin-right: 20px;
				padding: 5px 10px;
				font-size: 12px;
				color: #666;
				background: #eee;
				border-radius: 10px;
			}
		}
	}
</style>
