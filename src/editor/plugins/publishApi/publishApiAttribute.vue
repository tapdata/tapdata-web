<template>
	<div class="releaseApi">
		<el-form ref="form" :model="form" label-position="top" label-width="200px">
      <el-form-item :label="$t('editor.cell.data_node.api.dataApiName')">
        <el-input v-model="form.name" maxlength="20" @change="changePath" :placeholder="$t('editor.cell.data_node.api.enterPublishApiName')" show-word-limit required></el-input>
      </el-form-item>
      <el-form-item :label="$t('editor.cell.data_node.api.description')" class="pdTop5">
        <el-input type="textarea" v-model="form.description" :placeholder="$t('editor.cell.data_node.api.enterNewlyReleasedApi')" maxlength="100" show-word-limit></el-input>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-form-item :label="$t('editor.cell.data_node.api.method')">
            <el-select v-model="form.method">
              <el-option
                  v-for="item in selectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item label="URL/API/V1/">
            <el-input v-model="form.path" :placeholder="$t('dataFlow.enterFilterTable')"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="$t('editor.cell.data_node.api.fieldSettings')" class="pdTop5">
         <el-table
          border
          :data="form.paths.fields"
          row-key="id"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          style="width: 100%">
          <el-table-column
            prop="field_name"
            :label="$t('editor.cell.data_node.api.table_field')">
          </el-table-column>
          <el-table-column
            prop="javaType"
            :label="$t('editor.cell.data_node.api.table_type')"
            width="100">
          </el-table-column>
          <el-table-column
            align="center"
            prop="checkList"
            :label="$t('editor.cell.data_node.api.table_setting')"
            width="180">
            <template slot-scope="scope">
              <!-- <el-checkbox-group v-model="scope.row.checkList"> -->
                <el-checkbox v-model="scope.row.required">{{$t('editor.cell.data_node.api.required')}}</el-checkbox>
                <el-checkbox v-model="scope.row.query">{{$t('editor.cell.data_node.api.availableQueries')}}</el-checkbox>
              <!-- </el-checkbox-group> -->
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
		</el-form>
	</div>
</template>

<script>
  import _ from "lodash";
  import {uuid} from "../../util/Schema";
  // import { convertSchemaToTreeData } from "../../util/Schema";
	// import log from '../../../log';
	// import {mergeJoinTablesToTargetSchema} from "../../util/Schema";

	export default {
		name: "ReleaseApi",
		data() {
			return {
				selectList:[
          {label:'GET',value:'GET'},
          {label:'STREAM',value:'STREAM'}
        ],
				groupList: [],
				expressionList: [],
				form: {
          id: '',
          apiVersion: 'V1',
          connection: '',
          name: '',
          description: '',
          paths: {
            method:'GET',
            fields:[],
            availableQueryField:[],
            requiredQueryField: []
          },
          path: '',
          fields: []
					// tableData: [
          //   {'table_field':1,'table_type': 'String',checkList:['required']}
          // ],
        },
        mergedSchema: null,
        inputSchemas: [],
			};
		},

		watch: {
			form: {
				deep: true,
				handler(data) {
					this.$emit('dataChanged', this.getData());
				}
      }
		},

		methods: {
      /**改变路径**/
      changePath(name) {
        this.form.path = name + '/API/V1/' + this.mergedSchema.table_name + '/cust';
      },
      // convertSchemaToTreeData,
			setData(data, cell, isSourceDataNode, vueAdapter) {
				if (data) {
					Object.keys(data).forEach(key => this.form[key] = data[key]);
        }

        // let fields = [];
        this.inputSchemas = cell.getInputSchema();
        this.mergedSchema = cell.getOutputSchema();
        // let schema = mergeJoinTablesToTargetSchema(null, inputSchemas);
        if(this.mergedSchema &&  this.mergedSchema.fields) {
          this.mergedSchema.fields.forEach(field =>{
            this.$set(field,'required',false);
            this.$set(field,'query',false);
            this.$set(field,'visible',true);
          });
          this.form.paths.fields = this.mergedSchema.fields;
        }

        if(data) {
          for(let i = 0; i<this.form.paths.fields.length; i++) {
            let item = this.form.paths.fields[i];
            data.paths.availableQueryField.forEach(field => {
              if (item.field_name === field) {
                item.query = true;
              }
            });

            data.paths.requiredQueryField.forEach(field => {
              if (item.field_name === field) {
                item.required = true;
              }
            });
          }
        }

			},

			getData() {
        let data = _.cloneDeep(this.form);
        if (data.paths.fields) {
          data.paths.requiredQueryField = [];
          data.paths.availableQueryField = [];
          data.fields = [];
          data.paths.fields.forEach(item => {
            if (item.required) {
              data.paths.requiredQueryField.push(item.field_name);
            } else {
              data.paths.requiredQueryField.forEach((field,index) => {
                if (item.field_name === field) {
                  data.paths.requiredQueryField.splice(index,1);
                }
              });
            }

            if (item.query) {
              data.paths.availableQueryField.push(item.field_name);
            } else {
              data.paths.availableQueryField.forEach((field,index) => {
                if (item.field_name === field) {
                  data.paths.availableQueryField.splice(index,1);
                }
              });
            }

            if (item.visible) {
              data.fields.push(item);
            }
            delete item.required;
            delete item.query;
          });

          data.connection = this.inputSchemas[0].stageId;
          data.id = uuid();
        }
        return data;
			},
		}
	};
</script>

<style scoped lang="less">
	.releaseApi {
		width: 100%;
		height: 100%;
		padding: 20px;
		overflow: auto;
		box-sizing: border-box;
		background-color: #fafafa;

		.loopFrom {
			margin: 0 !important;

			.fromLoopBox {
				padding: 10px;
				margin-bottom: 12px;
				box-sizing: border-box;
				background-color: #fff;
				border: 1px solid #dedee4;
			}

			.remove {
				font-weight: bold;
				cursor: pointer;
				border: 1px solid #DEDEE4;
			}
		}
	}
</style>
<style lang="less">
	.releaseApi {
    .pdTop5 .el-form-item__content{
      padding-top: 5px;
    }
    .aggtip {
      position: absolute;
      top: -34px;
      left: 120px;
      .iconfont {
        display: inline-block;
        color: #999;
        cursor: pointer;
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
      .el-form-item__label,.el-input__inner {
        font-size: 12px;
      }
      .el-input__inner { height: 30px; line-height: 30px;}
		}

		.aggregateName .el-form-item__content {
      z-index: 2;
    }

    .el-form-item__content {
      .el-button { padding: 8px 15px; font-size: 12px;}
      .el-input__inner[style="height: 40px;"] { height: 30px!important;}
    }
    .btnClass .el-form-item__content { line-height: 30px!important;}
    .el-table {
      line-height: 30px;
      td,th {
        padding: 0;
      }
      th {
        background-color:#F5F5F5;
      }
      .el-checkbox-group,.el-checkbox .el-checkbox__label{ font-size: 11px;}
    }
	}
</style>
