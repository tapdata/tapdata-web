<template>
    <div class="aggregate">
      <el-form ref="form" :model="form" label-width="200px">
        <el-form-item label="window type">
          <el-select v-model="form.windowType" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Window">
          <i class="el-icon-info"></i>
          <el-select v-model="form.windowTime" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Zone">
          <i class="el-icon-info"></i>
          <el-select v-model="form.Zone" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Number of Time Windows to Remember">
          <el-input v-model="form.number"></el-input>
        </el-form-item>
        <el-form-item label="Aggregations">
          <el-row :gutter="20" class="loopFrom" v-for="(item, index) in form.dynamicItem" :key="index">
            <el-col :span="20" class="fromLoopBox">
              <el-form-item label="Enabled" :prop="'dynamicItem.' + index +'.enabled'">
                <el-checkbox v-model="item.enabled"></el-checkbox>
              </el-form-item>
              <el-form-item label="Name" :prop="'dynamicItem.' + index +'.name'">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="Aggregation Title" :prop="'dynamicItem.' + index +'.aggregationTitle'">
                <el-select v-model="item.aggregationTitle " placeholder="请选择活动区域">
                  <el-option label="区域一" value="shanghai"></el-option>
                  <el-option label="区域二" value="beijing"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Filter" :prop="'dynamicItem.' + index +'.filter'">
                <el-checkbox v-model="item.filter"></el-checkbox>
              </el-form-item>
              <el-form-item v-if="item.filter" label="Filter Predicate" :prop="'dynamicItem.' + index +'.filterPredicate'">
                <el-input v-model="item.filterPredicate"></el-input>
              </el-form-item>
              <el-form-item label="Aggregation Function" :prop="'dynamicItem.' + index +'.aggregationFun'">
                <el-select v-model="item.aggregationFun " placeholder="请选择活动区域">
                  <el-option label="区域一" value="shanghai"></el-option>
                  <el-option label="区域二" value="beijing"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Group By" :prop="'dynamicItem.' + index +'.groupBy'">
                <el-checkbox v-model="item.groupBy "></el-checkbox>
              </el-form-item>
              <el-form-item v-if="item.groupBy" label="Group By Expression" :prop="'dynamicItem.' + index +'.groupByExpression'">
                <el-input v-model="item.groupByExpression" ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="2" class="right">
              <span @click="addRow" class="el-icon-circle-plus"></span>
              <span @click="removeRow" class="el-icon-remove"></span>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
    export default {
      name: "aggregate",
      data(){
        return {
          form:{
            windowType: '',
            windowTime: '',
            Zone: '',
            number: '',
            dynamicItem:[{
              enabled: '',
              name: '',
              aggregationTitle: '',
              filter: '',
              filterPredicate: '',
              aggregationFun: '',
              groupBy: '',
              groupByExpression: ''
            }]
          },
        };
      },

      mounted(){
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

          this.form.dynamicItem.push(list);
        },

        removeRow(){
          console.log("shanchu");
        }
      }
    };
</script>

<style scoped lang="less">
  .aggregate {
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    .fromLoopBox {}
  }
</style>
<style lang="less">
  .aggregate{

  }
</style>
