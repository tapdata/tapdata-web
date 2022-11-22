<template>
  <div class="paid-upgrade-wrap">
    <TheHeader></TheHeader>
    <ElBreadcrumb class="breadcrumb paid-upgrade-mb16" separator-class="el-icon-arrow-right">
      <ElBreadcrumbItem :to="{ path: '/' }">返回菜单</ElBreadcrumbItem>
      <ElBreadcrumbItem>服务升级</ElBreadcrumbItem>
    </ElBreadcrumb>
    <div class="card" v-show="!successStatus">
      <header class="header">标准版</header>
      <div class="main">
        <el-form :model="form" ref="paidForm" :rules="rules">
          <el-form-item label="姓名" required prop="contactName">
            <el-input v-model="form.contactName"></el-input>
          </el-form-item>
          <el-form-item label="电话" required prop="contactTelephone">
            <el-input :max="11" v-model="form.contactTelephone"></el-input>
          </el-form-item>
        </el-form>
        <div class="currentList paid-upgrade-mb16">购买方案</div>
        <div class="desc paid-upgrade-mb16">收费详情（每年）</div>
        <div class="content mb-2 flex justify-content-between">
          <span>基础月费含5个任务</span> <span class="version">¥12000</span>
        </div>
        <div class="content flex justify-content-between paid-upgrade-mb8">
          <span><el-checkbox class="mr-2" v-model="checked"></el-checkbox>每个额外的任务</span>
          <span class="version">¥300</span>
        </div>
        <div class="content flex justify-content-between paid-upgrade-mb16">
          <el-input-number
            size="mini"
            controls-position="right"
            v-model="form.extraPipelines"
            :min="0"
          ></el-input-number
          ><span class="desc">× {{ form.extraPipelines || 0 }}</span>
        </div>
        <div class="link paid-upgrade-mb16"></div>
        <div class="content flex justify-content-between paid-upgrade-mb16">
          <span class="currentList">总计</span>
          <span class="version" v-if="!checked">¥12000</span>
          <span class="version" v-else>¥{{ total }}</span>
        </div>
        <div class="tip paid-upgrade-mb16">
          点击确认购买即表示您同意我们的【服务条款】
          您可以立即开始享受新计划的权益。我们的同事将通过电话或者邮件与您联络，您需要在1周之内完成线下付款。
        </div>
        <el-button class="float-end" type="primary" @click="save">确认</el-button>
      </div>
    </div>
    <div class="success" v-show="successStatus">
      <div class="paid-upgrade-mb16 imgBox"><img class="mt-2 block" :src="getImg('complete')" alt="" /></div>
      <div class="version paid-upgrade-mb8">
        感谢您订购Tapdata Cloud 标准版(链路数量：{{ successData.extraPipelines }}个）
      </div>
      <div class="desc paid-upgrade-mb16">我们的同事会通过您留下的联系方式和您联系进行线下合同签署和付款。</div>
      <el-button type="primary" @click="goBack">确认</el-button>
    </div>
  </div>
</template>

<script>
import TheHeader from '@/components/the-header'
export default {
  name: 'PaidUpgrade',
  components: { TheHeader },
  data() {
    return {
      form: {
        contactName: '',
        contactTelephone: '',
        paidPlanCode: 'standard',
        count: 1,
        extraPipelines: 0
      },
      rules: {
        contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
        contactTelephone: [{ required: true, message: '请选择联系人手机号码', trigger: 'blur' }]
      },
      successStatus: false,
      successData: ''
    }
  },
  computed: {
    total() {
      return 12000 + this.form.extraPipelines * 300
    },
    checked() {
      return this.form.extraPipelines > 0
    }
  },
  methods: {
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
        name: 'migrateList'
      })
    }
  }
}
</script>

<style scoped lang="scss">
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
    margin-bottom: 16px;
  }
  .paid-upgrade-mb8 {
    margin-bottom: 8px;
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
}
</style>
