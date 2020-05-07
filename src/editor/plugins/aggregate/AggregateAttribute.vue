<template>
	<div class="aggregate">
		<el-form ref="form" :model="form" label-position="top" label-width="200px">
			<el-col :span="21" class="aggregateName">
				<el-form-item :label="$t('dataFlow.nodeName')" required>
					<el-input v-model="form.name" maxlength="20" show-word-limit></el-input>
				</el-form-item>
			</el-col>
			<el-row :gutter="20" class="loopFrom" v-for="(item, index) in form.aggregations" :key="index">
				<el-col :span="21" class="fromLoopBox">
					<el-row :gutter="10">
						<el-col :span="6">
							<el-form-item
									:label="$t('dataFlow.aggFunction')"
									:prop="'aggregations.' + index +'.aggFunction'" required>
								<el-select v-model="item.aggFunction " @change="changeAggFunction(item)">
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
							<el-form-item
									:label="$t('dataFlow.aggExpression')"
									:prop="'aggregations.' + index +'.aggExpression'"
									:required="item.aggFunction !== 'COUNT'">
								<el-select v-model="item.aggExpression" filterable allow-create
                  default-first-option
                  :placeholder="$t('dataFlow.selectTargetField')"
                  :disabled="item.aggFunction === 'COUNT'">
									<el-option
											v-for="item in expressionList"
											:key="item.field_name"
											:label="item.field_name"
											:value="item.field_name">
									</el-option>
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
          <el-form-item
            required
            :label="$t('dataFlow.aggName')"
            :prop="'aggregations.' + index +'.name'">
            <el-popover class="aggtip"
              placement="top-start"
              width="200"
              trigger="hover"
              :content="$t('dataFlow.nameTip')">
              <span class="icon iconfont icon-tishi1" slot="reference"></span>
            </el-popover>
						<el-input v-model="item.name"></el-input>
					</el-form-item>
					<el-form-item
							:label="$t('dataFlow.filterPredicate')"
							:prop="'aggregations.' + index +'.filterPredicate'">
						<el-input v-model="item.filterPredicate"></el-input>
					</el-form-item>
					<el-form-item
							:label="$t('dataFlow.groupByExpression')"
							:prop="'aggregations.' + index +'.groupByExpression'">
						<el-select
              v-model="item.groupByExpression"
              :placeholder="$t('dataFlow.selectGrpupFiled')"
              multiple>
							<el-option
									v-for="item in groupList"
									:key="item.field_name"
									:label="item.field_name"
									:value="item.field_name">
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="2" class="right">
					<span @click="removeRow(item,index)" class="iconfont icon-quxiao remove"></span>
				</el-col>
			</el-row>
			<el-form-item>
				<el-button @click="addRow">+ {{$t('editor.cell.processor.aggregate.new_aggregate')}}</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import _ from "lodash";
	import log from '../../../log';
	import {mergeJoinTablesToTargetSchema} from "../../util/Schema";

	let counter = 0;
	export default {
		name: "Aggregate",
		data() {
			return {
				selectList: [
					{label: 'AVG', value: 'AVG'},
					{label: 'SUM', value: 'SUM'},
					{label: 'MAX', value: 'MAX'},
					{label: 'MIN', value: 'MIN'},
					{label: 'COUNT', value: 'COUNT'}
				],
				groupList: [],
				expressionList: [],
				form: {
					name: '',
					type: "aggregation_processor",
					aggregations: [{
            name: 'COUNT',
						filterPredicate: '',
						aggFunction: 'COUNT',
						aggExpression: '',
						groupByExpression: ''
					}]
				},
				aggaggExpression: '1'
			};
		},
		mounted() {
			this.form.aggregations.forEach(item => {
				if (item.aggFunction === "COUNT") {
					item.aggExpression = '';
				}
			});
    },

		watch: {
			form: {
				deep: true,
				handler(val) {
					// let aggaggExpression = '1'
					if (val.aggregations && val.aggregations.length > 0) {
						val.aggregations.forEach(item => {
							if (item.aggFunction === "COUNT") {
								item.aggExpression = '';
							}
						});
					}
					this.$emit('dataChanged', this.getData());
				}
      },
      // 'form.aggregations'(data){

      // }
		},

		methods: {
      changeAggFunction(data) {
        let count = 0;
        let aggFunctionArr = [];
        for(let i=0; i<this.form.aggregations.length; i++) {
          let item = this.form.aggregations[i];
          aggFunctionArr.push(item.aggFunction);
          if(new Set(aggFunctionArr).size !== aggFunctionArr.length){
            count ++;
          }
          if(count === 0) {
            item.name = item.aggFunction;
          } else {
            item.name = item.aggFunction + '_' + count;
          }
        }
      },

			addRow() {
				let list = {
          name: '',
					filterPredicate: '',
					aggFunction: 'COUNT',
					aggExpression: '1',
					groupByExpression: ''
				};
        this.form.aggregations.push(list);
        this.changeAggFunction();
        log("length",this.form.aggregations.length);
			},

			removeRow(item, index) {
				this.index = this.form.aggregations.indexOf(item);
				if (index !== -1) {
					this.form.aggregations.splice(index, 1);
				}
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
	.aggregate {
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
	.aggregate {
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
      margin-bottom: 12px;
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
      .el-input__inner { height: 30px!important; line-height: 30px;}
		}
	}
</style>
