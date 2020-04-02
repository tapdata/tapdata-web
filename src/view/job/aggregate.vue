<template>
    <div class="aggregate">
      <el-form ref="form" :model="form">
        <el-form-item label="window type">
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Window">
          <el-select v-model="form.time" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Zone">
          <el-select v-model="form.Zone" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Number of Time Windows to Remember">
          <el-input v-model="form.number"></el-input>
        </el-form-item>
        <el-form-item label="Aggregations">
          <div class="loopFrom" v-for="(item, index) in form.dynamicItem" :key="index">
            <div class="fromLoopBox">
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
              <el-form-item label="Filter Predicate" :prop="'dynamicItem.' + index +'.filterPredicate'">
                <el-input v-model="item.filterPredicate" v-if="item.filter"></el-input>
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
              <el-form-item label="Group By Expression" :prop="'dynamicItem.' + index +'.groupByExpression'">
                <el-input v-model="item.groupByExpression" v-if="item.groupBy"></el-input>
              </el-form-item>
            </div>
            <div class="right">
              <span class="el-icon-circle-plus"></span>
              <span class="el-icon-remove"></span>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
    export default {
        name: "aggregate"
    }
</script>

<style scoped>

</style>
