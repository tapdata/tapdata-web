<template>
	<div class="releaseApi">
		<el-form ref="form" :model="form" label-position="top" label-width="200px">
      <el-form-item :label="$t('editor.cell.data_node.api.dataApiName')">
        <el-input v-model="form.name" maxlength="20" :placeholder="$t('editor.cell.data_node.api.enterPublishApiName')" show-word-limit required></el-input>
      </el-form-item>
      <el-form-item :label="$t('editor.cell.data_node.api.description')" class="pdTop5">
        <el-input type="textarea" v-model="form.description" :placeholder="$t('editor.cell.data_node.api.enterNewlyReleasedApi')" maxlength="100" show-word-limit></el-input>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-form-item :label="$t('editor.cell.data_node.api.method')">
            <el-select v-model="form.method" @change="changeAggFunction(item, index)">
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
          style="width: 100%">
          <el-table-column
            prop="field_name"
            :label="$t('editor.cell.data_node.api.table_field')">

            <!-- <template slot-scope="scope">
              <el-input v-model="scope.row.field_name" size="mini"></el-input>
            </template> -->
          </el-table-column>
          <el-table-column
            prop="javaType"
            :label="$t('editor.cell.data_node.api.table_type')"
            width="100">
            <!-- <template slot-scope="scope">
              <el-select
                v-model="scope.row.table_type"
                filterable
                allow-create
                default-first-option>
                  <el-option
                    v-for="(item, idx) in typeList"
                    :value="item.type"
                    :label="item.type"
                    v-bind:key="idx">
                  </el-option>
              </el-select>
            </template> -->
          </el-table-column>
          <el-table-column
            align="center"
            prop="checkList"
            :label="$t('editor.cell.data_node.api.table_setting')"
            width="180">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.checkList">
                <el-checkbox label="required">{{$t('editor.cell.data_node.api.required')}}</el-checkbox>
                <el-checkbox label="query">{{$t('editor.cell.data_node.api.availableQueries')}}</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
			<!-- <el-form-item class="btnClass">
				<el-button @click="addRow">+ {{$t('editor.cell.processor.aggregate.new_aggregate')}}</el-button>
			</el-form-item> -->
		</el-form>
	</div>
</template>

<script>
	import _ from "lodash";
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
          apiVersion: 'V1',
          name: '',
          description: '',
          paths: {
            method:'GET',
            fields:[],
            availableQueryField:[],
            requiredQueryField: []
          },
          path: '',
          mergedSchema: null,
					// tableData: [
          //   {'table_field':1,'table_type': 'String',checkList:['required']}
          // ],
				},
			};
		},

		watch: {
			form: {
				deep: true,
				handler(val) {
					this.$emit('dataChanged', this.getData());
				}
      },
      mergedSchema: {
        handler(){

        }
      }
		},

		methods: {
			setData(data, cell, isSourceDataNode, vueAdapter) {
				if (data) {
					Object.keys(data).forEach(key => this.form[key] = data[key]);
        }
        let fields = [];
        this.mergedSchema = cell.getOutputSchema();
        this.mergedSchema.fields.forEach(field =>{
          fields.push({
            field_name: field.field_name,
            table_name: field.table_name,
            javaType: field.javaType,
            checkList: []
          });
        });
        this.form.paths.fields = fields;
			},

			getData() {
        return _.cloneDeep(this.form);
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
