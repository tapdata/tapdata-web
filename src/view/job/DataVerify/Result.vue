<template>
  <div class="data-contPreView">
    <div class="dv-pre-btn">
      <el-button size="mini" type="primary" @click="handleAddList">
        {{ $t("dataVerify.again") }}</el-button
      >
    </div>
    <div class="clear"></div>
    <div class="dv-pre-box">
      <div class="dv-pre-label">
        {{ $t("dataVerify.overView") }}
        <div class="dv-pre-right">
          <span>{{ $t("dataVerify.time") }}: {{ overview.createTime }} </span>
          <span> {{ $t("dataVerify.duration") }}: {{ overview.costTime }}</span>
        </div>
      </div>
      <div class="dv-pre-rowTotal">
        <p>{{ $t("dataVerify.row") }} {{ overview.validateRows }}</p>
        <p>{{ $t("dataVerify.hash") }} {{ overview.validateHashRows }}</p>
        <p>{{ $t("dataVerify.advance") }} {{ overview.validateJsRows }}</p>
      </div>
      <div class="dv-pre-dataBox">
        <div class="dv-pre-rowCheck">
          <p>{{ $t("dataVerify.linageDifference") }}</p>
          <div class="dv-pre-dataBox-item">{{ overview.rowsDiffer }}</div>
        </div>
        <div class="dv-pre-rowCheck">
          <p>{{ $t("dataVerify.errorTotal") }}</p>
          <div class="dv-pre-dataBox-item">{{ overview.rowsMismatch }}</div>
        </div>
        <div class="dv-pre-rowCheck">
          <p>{{ $t("dataVerify.accuracyRate") }}</p>
          <div class="dv-pre-dataBox-item">{{ overview.consistencyRate }}</div>
        </div>
      </div>
    </div>
    <div class="dv-contrast-table">
      <el-table border :data="validateStats" height="250" style="width: 100%">
        <el-table-column
          prop="source"
          :label="$t('dataVerify.source')"
          width="80"
        >
        </el-table-column>
        <el-table-column
          prop="validateType"
          :label="$t('dataVerify.dataWay')"
          width="80"
        >
          <template slot-scope="scope">
            <span :style="`color: ${colorMap[scope.row.validateType]};`">
              {{ $t("dataVerify." + scope.row.validateType) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rows" :label="$t('dataVerify.range')">
        </el-table-column>
        <el-table-column prop="rowsDiffer" :label="$t('dataVerify.result')">
        </el-table-column>
        <el-table-column
          prop="consistencyRate"
          :label="$t('dataVerify.accuracyRate')"
        >
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-select size="mini" v-model="overview.validateType">
            <el-option value="row" :label="$t('dataVerify.row')"></el-option>
            <el-option value="hash" :label="$t('dataVerify.hash')"></el-option>
            <el-option
              value="advance"
              :label="$t('dataVerify.advance')"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select size="mini" v-model="source.tableName">
            <el-option
              v-for="item in validateStats"
              :key="item.source"
              :label="item.source"
              :value="item.source"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <div class="dv-contrast-box">
        <div class="dv-contrast-header">
          {{ $t("dataVerify.errorComparison") }}
          <div class="dv-pre-right">
            <span style="color: #48B6E2">{{ $t("dataVerify.advance") }} </span>
            <span style="color: #F56C6C"> error :{{ count }}</span>
            <el-pagination
              class="dv-result-pagination"
              :page-size="1"
              :pager-count="0"
              layout="prev, next"
              :total="count"
            >
            </el-pagination>
          </div>
        </div>
        <el-table
          border
          :data="failedRow"
          class="dv-result-fail-table"
          style="width: 100%"
        >
          <el-table-column
            prop="sourceTableData"
            :label="$t('dataVerify.source')"
          >
          </el-table-column>
          <el-table-column
            prop="targetTableData"
            :label="$t('dataVerify.target')"
          >
          </el-table-column>
          <el-table-column prop="message" label="MSQ" width="100">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import factory from "../../../api/factory";
import log from "../../../log";

const ValidationResults = factory("validationResults");

export default {
  data() {
    return {
      overview: {
        id: "5e95db94a0507ad6ed3ec048",
        // overview校验结果总览，tableOverview：按表统计，failedRow: 校验失败的记录
        type: "overview",
        validateTime: "1586920931000", // #执行校验时间
        costTime: "30000", // #校验耗时
        validateRows: "45000", // #行数校验条数
        validateHashRows: "12000", // #哈希校验条数
        validateJsRows: "15000", // #高级校验条数
        rowsDiffer: "325", // #总体行数差
        rowsMismatch: "12", // #不匹配条数
        consistencyRate: "80", // #一致率（0-100）
        dataFlowId: "5e9408531d431f06308e9c4d", // #该记录所属的dataFlow ID，
        validateType: "row",
        source: "5e9408531d431f06308e9c4d"
      },
      failedRow: [],
      validateStats: [],
      count: "",
      source: {
        tableName: ""
      },
      colorMap: {
        row: "#48B6E2",
        hash: "#62A569",
        advance: "#9889D8"
      }
    };
  },
  created() {
    this.getData();
  },
  methods: {
    handleAddList() {
      this.editor.showDataVerify(true);
    },
    getData() {
      ValidationResults.get().then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            if (res.data[0]) {
              this.overview = res.data[0];
            }
            if (res.data[2]) {
              this.validateStats = res.data[2].validateStats;
              this.validateStats.sourceTableData = this.validateStats
                .sourceTableData
                ? JSON.parse(this.validateStats.sourceTableData)
                : "";
              this.validateStats.targetTableData = this.validateStats
                .targetTableData
                ? JSON.parse(this.validateStats.targetTableData)
                : "";
            }
            log("dataVerify.result", res.data);
          }
        }
      });

      let where = {
        filter: {
          where: {
            type: "failedRow"
          }
        }
      };

      let whereCount = {
        where: {
          type: "failedRow"
        }
      };

      ValidationResults.get(where).then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            this.failedRow = res.data;
            log("dataVerify.count", res.data);
          }
        }
      });
      ValidationResults.count(whereCount).then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            this.count = res.data.count;
            log("dataVerify.count", res.data.count);
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.dv-pre-box {
  width: 100%;
  height: 180px;
  margin-bottom: 10px;
  margin-top: 10px;
  font-size: 12px;
  border: 1px solid rgba(220, 223, 230, 1);
  box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
}
.data-contPreView {
  margin-left: 20px;
  margin-right: 20px;
}
.dv-pre-rowCheck p {
  font-size: 14px;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  line-height: 58px;
}
.dv-pre-label {
  height: 39px;
  line-height: 39px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-bottom: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-right {
  float: right;
  margin-right: 10px;
  color: #999;
}
.dv-pre-rowTotal {
  float: left;
  width: 24%;
  font-size: 12px;
  line-height: 40px;
  height: auto;
  margin-top: 10px;
  margin-left: 10px;
  border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-dataBox {
  float: left;
  width: 72%;
  display: flex;
  margin-left: 10px;
  justify-content: space-around;
}
.dv-pre-dataBox-item {
  font-size: 50px;
  font-weight: 400;
  color: rgba(72, 182, 226, 1);
  line-height: 56px;
}
.dv-contrast-table {
  margin-bottom: 10px;
  box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
}
.dv-contrast-box {
  width: 100%;
  margin-top: 10px;
  background: rgba(255, 255, 255, 1);
  //border:1px solid rgba(220, 223, 230, 1);
  box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.dv-contrast-header {
  height: 39px;
  line-height: 39px;
  font-size: 14px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-top: 1px solid rgba(220, 223, 230, 1);
  border-left: 1px solid rgba(220, 223, 230, 1);
  border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-contrast-content {
  display: flex;
  justify-content: space-around;
}
.dv-contrast-content-item-tip {
  height: 39px;
  line-height: 39px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-bottom: 1px solid rgba(220, 223, 230, 1);
  color: #666;
}
.dv-contrast-content-item-text {
  padding: 10px;
  color: #666;
}
.dv-contrast-content :first-child {
  border-left: none;
}
.dv-contrast-content-item {
  width: 33%;
  font-size: 12px;
  border-left: 1px solid #dedee4;
}
.dv-pre-btn {
  margin-top: 10px;
  float: right;
}
.clear {
  clear: both;
}
</style>
<style lang="less">
.dv-pre-right .el-pagination {
  white-space: nowrap;
  padding: 0;
  font-weight: 700;
  display: inline-block;
  background: #fafafa;
  height: 16px;
}
.dv-pre-right .el-pagination button:disabled {
  background-color: #fafafa;
}
.dv-pre-right .el-pagination button:disabled {
  background-color: #fafafa;
}
.dv-pre-right .el-pagination .btn-next {
  padding-left: 0;
}
.dv-pre-right .el-pagination .btn-next,
.el-pagination .btn-prev {
  background-color: #fafafa;
}
.el-pagination button,
.el-pagination span:not([class*="suffix"]) {
  height: 39px;
}
.dv-result-fail-table td .cell,
.el-table th .cell {
  white-space: normal;
}
</style>
