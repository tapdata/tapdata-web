<script src="../../i18n/langs/cn.js"></script>
<template>
    <div class="aggregate">
      <el-form ref="form" :model="form" label-position="top" label-width="200px">
        <el-col :span="21">
          <el-form-item :label="$t('dataFlow.nodeName')">
            <el-input v-model="form.name" maxlength="20" show-word-limit></el-input>
          </el-form-item>
        </el-col>
        <el-row :gutter="20" class="loopFrom" v-for="(item, index) in form.arrregations" :key="index">
          <el-col :span="21" class="fromLoopBox">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item :label="$t('dataFlow.aggFunction')" :prop="'arrregations.' + index +'.aggFunction'">
                  <el-select v-model="item.aggFunction " placeholder="请选择活动区域">
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
                <el-form-item :label=" '> ' + $t('dataFlow.aggExpression')" :prop="'arrregations.' + index +'.aggExpression'">
                  <el-input v-model="item.aggExpression" :disabled="item.aggFunction === 'COUNT'" ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item  :label="$t('dataFlow.filterPredicate')" :prop="'arrregations.' + index +'.filterPredicate'">
              <el-input v-model="item.filterPredicate" ></el-input>
            </el-form-item>
            <el-form-item  :label="$t('dataFlow.groupByExpression')" :prop="'arrregations.' + index +'.groupByExpression'">
              <el-input v-model="item.groupByExpression" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2" class="right">
            <span @click="removeRow(item,index)" class="iconfont icon-quxiao remove"></span>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button @click="addRow">add</el-button>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
    export default {
      name: "aggregate",
      data(){
        return {
          selectList: [
            {label: 'COUNT',value:'COUNT'},
            {label: 'AUG(double)',value:'AUGDOUBLE'},
            {label: 'AUG(int)',value:'AUGINT'},
            {label: 'StdDev',value:'StdDev'},
            {label: 'MIN(double)',value:'MINDOUBLE'},
            {label: 'MIN(int)',value:'MININT'},
            {label: 'MAX(double)',value:'MAXDOUBLE'},
            {label: 'MAX(int)',value:'MAXINT'},
            {label: 'SUM(double)',value:'SUMDOUBLE'},
            {label: 'SUM(int)',value:'SUMINT'},
          ],
          form:{
            name: '',
            type:"aggregation_processor",
            arrregations:[{
              filterPredicate: '',
              aggFunction: '',
              aggExpression: '',
              groupByExpression: ''
            }]
          },
        };
      },

      watch: {
        formData: {
          deep: true,
          handler(){
            this.$emit('backAggregate', this.form);
          }
        }
      },

      methods: {
        addRow() {
          let list = {
            enabled: '',
            name: '',
            aggregationTitle: '',
            filter: '',
            filterPredicate: '',
            aggregationFun: '',
            groupBy: '',
            groupByExpression: ''
          };
          this.form.arrregations.push(list);
        },

        removeRow(item,index){
          this.index = this.form.arrregations.indexOf(item);
          if (index !== -1) {
            this.form.arrregations.splice(index, 1);
          }
        }
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
      margin: 0!important;
      .fromLoopBox {
        padding: 10px;
        margin-bottom: 12px;
        box-sizing: border-box;
        background-color: #fff;
        border: 1px solid #dedee4;
      }
      .remove{
        font-weight: bold;
        cursor: pointer;
        border: 1px solid #DEDEE4;
      }
    }
  }
</style>
<style lang="less">
  .aggregate{
    .el-form--label-top .el-form-item__label {
      padding: 0;
      line-height: 26px;
    }
    .el-select { width: 100%;}

    .el-form-item { margin-bottom: 12px;}
  }
</style>
