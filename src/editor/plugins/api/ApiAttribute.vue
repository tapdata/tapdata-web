<template>
	<div class="releaseApi">
		<el-form ref="form" :model="form" label-position="top" label-width="200px">
      <el-form-item :label="$t('editor.cell.data_node.api.dataApiName')">
        <el-input v-model="form.name" maxlength="20" show-word-limit></el-input>
      </el-form-item>
      <el-form-item :label="$t('editor.cell.data_node.api.description')">
        <el-input type="textarea" v-model="form.comment" :placeholder="$t('dataFlow.enterFilterTable')"></el-input>
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
            <el-input v-model="form.url" :placeholder="$t('dataFlow.enterFilterTable')"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="$t('editor.cell.data_node.api.fieldSettings')">
         <el-table
          border
          :data="form.tableData"
          style="width: 100%">
          <el-table-column
            prop="date"
            :label="$t('editor.cell.data_node.api.table_field')">
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('editor.cell.data_node.api.table_type')"
            width="100">
          </el-table-column>
          <el-table-column
            prop="address"
            :label="$t('editor.cell.data_node.api.table_setting')"
            width="150">
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
	import log from '../../../log';
	import {mergeJoinTablesToTargetSchema} from "../../util/Schema";

	let counter = 0;
	export default {
		name: "ReleaseApi",
		data() {
			return {
				selectList:[
          {label:'GET',value:'GET'},
          {label:'POST',value:'POST'}
        ],
				groupList: [],
				expressionList: [],
				form: {
          name: '',
          comment: '',
          method: '',
          url: '',
					tableData: [],
				},
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

    },

		watch: {
			form: {
				deep: true,
				handler(val) {
					this.$emit('dataChanged', this.getData());
				}
      },
		},

		methods: {
      changeAggFunction(data, index) {

      },


			setData(data, cell, isSourceDataNode, vueAdapter) {
				if (data) {
					Object.keys(data).forEach(key => this.form[key] = data[key]);
				}

				let inputSchemas = cell.getInputSchema();
				let schema = mergeJoinTablesToTargetSchema(null, inputSchemas);
				let object = {};
				this.groupList = schema.fields || [];
				if (!!this.groupList && this.groupList.length > 0) {
					this.groupList = this.groupList.reduce((cur, next) => {
						if(!object[next.field_name]) {
							object[next.field_name] = true;
							cur.push(next);
						}
						return cur;
					}, []);
				}
				this.expressionList = this.groupList;
				log('Aggregate.setData.inputSchemas', inputSchemas, schema.fields);

				if (!this.form.name) {
					if (counter === 0)
						this.form.name = this.$t("dataFlow.aggregation");
					if (counter !== 0)
						this.form.name = this.$t("dataFlow.aggregation") + (counter);
					counter++;
				}
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
	}
</style>
