<template>
  <div class="paid-upgrade-wrap">
    <TheHeader></TheHeader>
    <ElBreadcrumb class="breadcrumb paid-upgrade-mb16" separator-class="el-icon-arrow-right">
      <ElBreadcrumbItem :to="{ path: '/' }">{{ $t('dfs_agent_download_paidupgrade_fanhuicaidan') }}</ElBreadcrumbItem>
      <ElBreadcrumbItem>{{ $t('dfs_agent_download_paidupgrade_fuwushengji') }}</ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="card" v-show="!successStatus">
      <header class="header">
        {{ $t('dfs_agent_download_paidupgrade_biaozhunban') }}
      </header>
      <div class="main">
        <el-form :model="form" ref="paidForm" :rules="rules">
          <el-form-item :label="$t('dfs_agent_download_paidupgrade_xingming')" required prop="contactName">
            <el-input v-model:value="form.contactName"></el-input>
          </el-form-item>
          <el-form-item :label="$t('dfs_agent_download_paidupgrade_dianhua')" required prop="contactTelephone">
            <el-input :max="11" v-model:value="form.contactTelephone"></el-input>
          </el-form-item>
        </el-form>
        <div class="currentList paid-upgrade-mb16">
          {{ $t('dfs_agent_download_paidupgrade_goumaifangan') }}
        </div>
        <div class="desc paid-upgrade-mb16">
          {{ $t('dfs_agent_download_paidupgrade_shoufeixiangqingmei') }}
        </div>
        <div class="content mb-2 flex justify-content-between">
          <span>{{ $t('dfs_agent_download_paidupgrade_jichuyuefeihan') }}</span>
          <span class="version">¥12000</span>
        </div>
        <div class="content flex justify-content-between paid-upgrade-mb8">
          <span
            ><el-checkbox class="mr-2" v-model:value="checked" @change="handleChecked"></el-checkbox
            >{{ $t('dfs_agent_download_paidupgrade_meigeewaide') }}</span
          >
          <span class="version">¥3600</span>
        </div>
        <div class="content flex justify-content-between paid-upgrade-mb16">
          <el-input-number
            size="mini"
            controls-position="right"
            v-model:value="form.extraPipelines"
            :min="0"
          ></el-input-number
          ><span class="desc">× {{ form.extraPipelines || 0 }}</span>
        </div>
        <div class="link paid-upgrade-mb16"></div>
        <div class="content flex justify-content-between paid-upgrade-mb16">
          <span class="currentList">{{ $t('dfs_agent_download_paidupgrade_zongji') }}</span>
          <span class="version" v-if="!checked">¥12000</span>
          <span class="version" v-else>¥{{ total }}</span>
        </div>
        <div class="tip paid-upgrade-mb16">
          {{ $t('dfs_agent_download_paidupgrade_dianjiquerengou') }}
        </div>
        <el-button class="float-end" type="primary" @click="save">{{
          $t('dfs_agent_download_paidupgrade_queren')
        }}</el-button>
      </div>
    </div>
    <div class="success" v-show="successStatus">
      <div class="paid-upgrade-mb16 imgBox">
        <img class="mt-2 block" :src="getImg('complete')" alt="" />
      </div>
      <div class="version paid-upgrade-mb8">
        {{ $t('dfs_agent_download_paidupgrade_ganxienindinggou') }}{{ (successData.extraPipelines || 0) + 5 }}
      </div>
      <div class="desc paid-upgrade-mb16">
        {{ $t('dfs_agent_download_paidupgrade_womendetongshi') }}
      </div>
      <el-button type="primary" @click="goBack">{{ $t('dfs_agent_download_paidupgrade_fanhuikongzhitai') }}</el-button>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'

import TheHeader from '@/components/the-header'
export default {
  name: 'PaidUpgrade',
  components: { TheHeader },
  data() {
    let user = window.__USER_INFO__ || {}
    return {
      form: {
        contactName: user.nickname,
        contactTelephone: user.telephone,
        paidPlanCode: 'standard',
        count: 1,
        extraPipelines: 0
      },
      rules: {
        contactName: [
          {
            required: true,
            message: i18n.t('dfs_agent_download_paidupgrade_qingshurulianxi'),
            trigger: 'blur'
          }
        ],
        contactTelephone: [
          {
            required: true,
            message: i18n.t('dfs_agent_download_paidupgrade_qingxuanzelianxi'),
            trigger: 'blur'
          }
        ]
      },
      successStatus: false,
      successData: ''
    }
  },
  computed: {
    total() {
      return 12000 + this.form.extraPipelines * 3600
    }
  },
  methods: {
    handleChecked(val) {
      this.form.extraPipelines = val ? 1 : 0
    },
    save() {
      this.$refs.paidForm.validate(valid => {
        if (valid) {
          this.$axios.post('api/tcm/orders/subscribe/paid/plan', this.form).then(data => {
            this.successData = data
            this.successStatus = true
          })
        }
      })
    },
    getImg(name) {
      return require(`../../../public/images/task/${name}.png`)
    },
    goBack() {
      this.$router.push({
        name: 'Workbench'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.paid-upgrade-wrap {
  padding-top: 68px;
  height: calc(100% - 0px);
  background: #fff;
  .card {
    width: 587px;
    height: 570px;
    margin: 0 auto;
    background: #ffffff;
    box-shadow: 0px 4px 4px rgba(198, 198, 198, 0.25);
    border-radius: 8px;
  }
  .success {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .header {
    height: 53px;
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
    padding: 16px 24px;
    border-bottom: 1px solid #f2f2f2;
    border-radius: 8px 8px 0px 0px;
    background: #2c65ff;
  }
  .imgBox {
    width: 48px;
    height: 48px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .main {
    padding: 20px;
  }
  .paid-upgrade-mb16 {
    margin-bottom: 14px;
  }
  .paid-upgrade-mb8 {
    margin-bottom: 6px;
  }
  .text {
    font-size: 12px;
  }
  .version {
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
    color: map-get($fontColor, dark);
  }
  .currentList {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, dark);
  }
  .desc {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: map-get($color, light);
  }
  .tip {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #535f72;
  }
  .link {
    border-bottom: 1px solid map-get($borderColor, light);
  }
  .breadcrumb {
    height: 50px;
    line-height: 50px;
    padding-left: 24px;
    border-bottom: 1px solid #e1e3e9;
  }
  ::v-deep {
    .el-form-item--small .el-form-item__content,
    .el-form-item--small .el-form-item__label {
      line-height: 28px;
    }
  }
}
</style>
