<template>
  <div class="verify-setting-main">
    <subNav></subNav>
    <div class="verify-setting">
      <div class="head-text">
        <h2>{{ $t('dataVerify.setting.title') }}</h2>
        <p>{{ $t('dataVerify.setting.text') }}</p>
      </div>
      <el-form class="e-form" label-position="top" :data="formData">
        <el-form-item :label="$t('dataVerify.setting.keepTimeLabel')">
          <el-select
            v-model="formData.retentionTime"
            size="mini"
            class="dataWrite-list"
          >
            <el-option
              v-for="item in dataWriteList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.errorSaveSumLable')">
          <el-select
            v-model="formData.reservedQuantityPerTable"
            size="mini"
            class="dataWrite-list"
          >
            <el-option label="100" value="100"></el-option>
            <el-option label="1000" value="1000"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.errorDifferenceResult')">
          <el-input
            v-model="formData.differenceTolerant"
            class="input-with-select"
            size="mini"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.lineNumberFrequency')">
          <el-input
            placeholder="请输入内容"
            v-model="formData.rowInspectFrequency"
            class="input-with-select"
            size="mini"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
            onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
          >
            <el-select
              v-model="formData.rowInspectUtil"
              slot="append"
              placeholder="请选择"
            >
              <el-option label="hour" value="min"></el-option>
              <el-option label="second" value="hour"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.lineNumVerfyDuration')">
          <el-input
            placeholder="请输入内容"
            v-model="formData.rowInspectContinuedTime"
            class="input-with-select"
            size="mini"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
            onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
          >
            <el-select
              v-model="formData.rowInspectContinuedUtil"
              slot="append"
              placeholder="请选择"
            >
              <el-option label="hour" value="hour"></el-option>
              <el-option label="second" value="day"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.intervalFrequency')">
          <el-input
            placeholder="请输入内容"
            v-model="formData.contentInspectFrequency"
            class="input-with-select"
            size="mini"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
            onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
          >
            <el-select
              v-model="formData.contentInspectUtil"
              slot="append"
              placeholder="请选择"
            >
              <el-option label="minute" value="minute"></el-option>
              <el-option label="hour" value="hour"></el-option>
              <el-option label="second" value="day"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.verifyDuration')">
          <el-input
            placeholder="请输入内容"
            v-model="formData.contentInspectContinuedTime"
            class="input-with-select"
            size="mini"
            onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
            onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
          >
            <el-select
              v-model="formData.contentInspectContinuedUtil"
              slot="append"
              placeholder="请选择"
            >
              <el-option label="hour" value="hour"></el-option>
              <el-option label="second" value="day"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dataVerify.setting.verifyStartTime')">
          <el-select
            v-model="formData.contentInspectStartTime"
            size="mini"
            class="dataWrite-list"
          >
            <el-option
              v-for="item in dataTimeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button
        size="mini"
        type="primary"
        @click="submit"
        style="width: 80px"
        >{{ $t('dataForm.submit') }}</el-button
      >
    </div>
  </div>
</template>
<script>
import factory from '../../api/factory'
const Setting = factory('Setting')
import subNav from '@/components/subNav'
export default {
  name: 'verifySetting',
  components: { subNav },
  data() {
    return {
      formData: {},
      dataWriteList: [
        {
          label: '1个月',
          value: '1'
        },
        {
          label: '3个月',
          value: '3'
        },
        {
          label: '6个月',
          value: '6'
        }
      ],
      dataTimeList: [
        {
          label: '01:00',
          value: '01:00'
        },
        {
          label: '02:00',
          value: '02:00'
        },
        {
          label: '03:00',
          value: '03:00'
        },
        {
          label: '04:00',
          value: '04:00'
        },
        {
          label: '05:00',
          value: '05:00'
        },
        {
          label: '06:00',
          value: '06:00'
        },
        {
          label: '07:00',
          value: '07:00'
        },
        {
          label: '08:00',
          value: '08:00'
        },
        {
          label: '09:00',
          value: '09:00'
        },
        {
          label: '10:00',
          value: '10:00'
        },
        {
          label: '11:00',
          value: '11:00'
        },
        {
          label: '12:00',
          value: '12:00'
        },
        {
          label: '13:00',
          value: '13:00'
        },
        {
          label: '13:00',
          value: '13:00'
        },
        {
          label: '14:00',
          value: '14:00'
        },
        {
          label: '15:00',
          value: '15:00'
        },
        {
          label: '16:00',
          value: '16:00'
        },
        {
          label: '17:00',
          value: '17:00'
        },
        {
          label: '18:00',
          value: '18:00'
        },
        {
          label: '19:00',
          value: '19:00'
        },
        {
          label: '20:00',
          value: '20:00'
        },
        {
          label: '21:00',
          value: '21:00'
        },
        {
          label: '22:00',
          value: '22:00'
        },
        {
          label: '23:00',
          value: '23:00'
        }
      ]
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      let where = {
        filter: {
          where: {
            id: '82'
          }
        }
      }
      this.loading = true
      Setting.findOne(where)
        .then(res => {
          if (res.data.value) {
            this.formData = JSON.parse(res.data.value)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit() {
      if (!this.formData) {
        return
      }
      let where = {
        id: '82'
      }
      let data = {
        value: JSON.stringify(this.formData)
      }
      Setting.update(where, data)
        .then(() => {
          this.$message.success('submit OK')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style scoped lang="scss">
.verify-setting-main {
  display: flex;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
}
.verify-setting {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 20px;
  margin-top: 20px;
  .head-text {
    padding-bottom: 50px;
    h2 {
      padding-bottom: 10px;
      color: #333;
      font-size: 18px;
      font-weight: bold;
    }
    p {
      color: #666;
      font-size: 12px;
    }
  }
}
</style>
<style lang="scss">
.verify-setting {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  .el-form-item__label {
    padding-bottom: 0 !important;
    line-height: 28px;
  }
  .el-form-item__content {
    width: 400px;
    padding-top: 6px;
    line-height: 28px;
    .el-input {
      width: 400px;
    }
    .el-select > .el-input {
      width: 400px;
    }
    .el-input-group__append {
      .el-select > .el-input {
        width: 100px;
      }
    }
  }
}
</style>
