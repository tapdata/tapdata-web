<template>
  <section class="setting-list-wrap">
    <el-form :model="formData" class="e-form" label-position="top">
      <div v-for="(item, index) in formData.items" :key="index" class="item">
        <template v-if="item.category !== 'license'">
          <span class="title">{{ $t('setting.' + item.category) }}</span>
          <span class="btns" v-if="item.category === 'SMTP'">
            <a @click="checkTemplate()">{{ $t('setting.email_template') }}</a>
            <a @click="connectAndTest()">{{ $t('setting.connect_and_test') }}</a>
          </span>
        </template>

        <div class="box" v-for="(childItem, childIndex) in item.items" :key="childIndex">
          <div v-if="item.category === 'license'">
            <div class="license" v-for="(licenseItem, licenseIndex) in item.liceseItems" :key="licenseIndex">
              {{ $t('setting.nameserver') }}: {{ licenseItem.hostname }}
            </div>
            <div>
              {{ $t('setting.expiredate') }}:
              {{ licenseItem.authorization ? $moment(licenseItem.authorization.validity_period.expires_on || '') : '' }}
            </div>
            <el-button @click="importlicense(licenseItem)">{{ $t('setting.import') }}</el-button>
            <el-button @click="hrefApply(licenseItem)">{{ $t('setting.apply') }}</el-button>
          </div>

          <el-row v-else>
            <el-col :span="24">
              <el-form-item>
                <span slot="label">
                  <span>{{
                    $t('setting.' + (childItem.key_label || '').split(' ').join('_')) || childItem.key_label
                  }}</span>
                  <el-tooltip effect="dark" placement="top" v-if="childItem.documentation">
                    <div style="max-width: 300px" slot="content">
                      {{
                        $t(
                          'setting.' +
                            (childItem.documentation || '')
                              .split('/')
                              .join('_')
                              .split(',')
                              .join('_')
                              .split(':')
                              .join('_')
                              .split('，')
                              .join('_')
                              .split('"')
                              .join('_')
                              .split(' ')
                              .join('_')
                              .split('(')
                              .join('_')
                              .split(')')

                              .join('_')
                              .split('.')
                              .join('_')
                        )
                      }}
                    </div>
                    <span
                      class="icon iconfont icon-tishi1"
                      style="vertical-align: bottom; padding-left: 10px; font-size: 18px"
                    ></span>
                  </el-tooltip>
                </span>
                <el-input
                  v-if="!childItem.enums || childItem.enums.length === 0"
                  :type="childItem.key.match(/password/) ? 'password' : 'text'"
                  v-model="childItem.value"
                  :disabled="item.category === 'license'"
                  :mask="childItem.mask"
                  size="mini"
                  :label="$t('Settings.' + (childItem.key_label || '').split(' ').join('_')) || childItem.key_label"
                >
                </el-input>

                <el-select v-else v-model="childItem.value" size="mini">
                  <el-option
                    v-for="options in childItem.enums"
                    :key="options"
                    :value="options"
                    :label="options"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="footer">
        <el-button @click="save" size="mini" type="primary">保存</el-button>
      </div>
    </el-form>
    <el-dialog
      :title="$t('setting.email_template')"
      :close-on-click-modal="false"
      custom-class="dialog-email-template"
      :visible.sync="emailTemplateDialog"
      width="800px"
    >
      <el-row>
        <el-col :span="6">
          <ul class="email-template-tabs">
            <li
              v-for="(tab, index) in emailTabs"
              :key="index"
              :class="{ active: activeTab === index }"
              @click="activeTab = index"
            >
              {{ tab.label }}
            </li>
          </ul>
        </el-col>
        <el-col :span="18">
          <div class="settings-email-template">
            <p>
              {{ $t('setting.email_template_from') }} :
              {{ SMTP['Email_Send_Address'] }}
            </p>
            <p>
              {{ $t('setting.email_template_to') }} :
              {{ SMTP['Email_Receivers'] }}
            </p>
            <p>
              {{ $t('setting.email_template_subject') }} : {{ SMTP['Send_Email_Title_Prefix'] }} Tapdata Notification:
              <span v-show="activeTab <= 4">Job {{ emailTabs[activeTab].status }}</span>
              <span v-show="activeTab > 4">DDL Warn, please perform DDL operation manually.</span>
            </p>
            <p class="paragraph">Hello there,</p>
            <p class="paragraph" v-show="activeTab <= 3">
              <span>Job_name XXX was modified</span><br />
              <span
                >Status: <span style="color: #f56c6c">{{ emailTabs[activeTab].status }}</span></span
              >
            </p>
            <p class="paragraph" v-show="activeTab == 4">
              <span>Job_name XXX was CDC lag</span><br />
              <span>Node lag time: <span style="color: #f56c6c">XXXX s</span></span>
            </p>
            <p class="paragraph" v-show="activeTab == 5">
              <span>Job: job_name xxx</span><br />
              <span>Source: <span style="color: #f56c6c">xxx</span></span
              ><br />
              <span>Target: <span style="color: #f56c6c">xxx</span></span
              ><br />
              <span>Notification DDLs:</span><br />
              <span>
                No. <span style="color: #f56c6c">xxx</span>&nbsp;&nbsp; Scn:
                <span style="color: #f56c6c">xxx</span>&nbsp;&nbsp; At: <span style="color: #f56c6c">xxx</span><br />
                DDL sql: <span style="color: #f56c6c">xxx</span>
              </span>
            </p>
            <p class="paragraph">This mail was sent by Tapdata.</p>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="emailTemplateDialog = false">{{
          $t('message.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'Setting',
  data() {
    return {
      liceseItems: [],
      emailTemplateDialog: false,
      formData: {
        items: []
      },
      activeTab: 0,
      emailTabs: [
        {
          label: this.$t('setting.Email_Template_Running'),
          status: 'running'
        },
        {
          label: this.$t('setting.Email_Template_Paused'),
          status: 'paused'
        },
        {
          label: this.$t('setting.Email_Template_Error'),
          status: 'error'
        },
        {
          label: this.$t('setting.Email_Template_Draft'),
          status: 'draft'
        },
        {
          label: this.$t('setting.Email_Template_CDC'),
          status: 'CDC Lag'
        },
        { label: this.$t('setting.Email_Template_DDL') }
      ]
    }
  },
  created() {
    this.getData()
  },
  computed: {
    SMTP() {
      let result = {}
      let items = this.formData.items
      if (items && items.length) {
        let SMTP = find(this.items, item => {
          return item.category === 'SMTP'
        })
        if (SMTP && SMTP.items) {
          SMTP.items.forEach(it => {
            result[it.key_label.split(' ').join('_')] = it.value
          })
        }
      }
      return result
    }
  },
  methods: {
    // 获取设置数据
    getData() {
      let _this = this
      let auth_data = []
      _this
        .$api('Licenses')
        .get({})
        .then(result => {
          console.log(result, '&&&&&&')
          if (result && result.data) {
            auth_data = result.data
          }
        })
      _this
        .$api('Setting')
        .get()
        .then(res => {
          let items = [],
            itemsCategories = [],
            cat = []
          if (res && res.data.length) {
            items = res.data.map(item => item.category)
          }
          items = _.uniq(items)
          items.sort((a, b) => {
            return a.sort < b.sort ? -1 : 1
          })
          items.map(item => {
            let values = res.data.filter(childItem => {
              return childItem.category === item && childItem.user_visible
            })
            values.sort((a, b) => {
              return a.sort < b.sort ? -1 : 1
            })
            if (values.length > 0) {
              itemsCategories.push({ category: item, items: values })
              cat.push(item)
            }
          })

          let sortCategories = cat.map(item => {
            let values = res.data.filter(childItem => {
              return childItem.category === item
            })
            return {
              category: item,
              category_sort: values[0].category_sort
            }
          })

          let vals = sortCategories.map(item => {
            let value = _.find(itemsCategories, val => {
              return val.category === item.category
            })
            return Object.assign(value, item)
          })
          vals.sort((a, b) => {
            return a.category_sort > b.category_sort ? 1 : a.category_sort < b.category_sort ? -1 : 0
          })

          this.formData.items = vals
          let lincenseData = {
            liceseItems: auth_data,
            items: auth_data,
            category: 'license'
          }
          this.formData.items.push(lincenseData)
        })
    },
    // 保存
    save() {
      let settingData = []
      this.formData.items.filter(item => {
        item.items.forEach(childItem => {
          settingData.push(childItem)
        })
      })
      this.$api('Setting')
        .save(settingData)
        .then(res => {
          if (res) {
            this.$message.success(this.$t('message.saveOK'))
          }
        })
        .catch(e => {
          this.$message.error(e.response.msg)
        })
    },
    // 邮件模板
    checkTemplate() {
      this.emailTemplateDialog = true
    },
    // 连接测试
    connectAndTest() {
      let lastTime = localStorage.getItem('Tapdata_settings_email_countdown')
      let now = new Date().getTime()
      let duration = Math.floor((now - lastTime) / 1000)
      if (lastTime && duration < 60) {
        return this.snackbarfun(
          this.$message.success(this.$t('setting.test_email_countdown')) + '(' + (60 - duration) + 's)',
          2
        )
      }
      try {
        this.$api('Setting')
          .testEmail()
          .then(() => {
            localStorage.setItem('Tapdata_settings_email_countdown', now)
            this.$message.success(this.$t('setting.test_email_success'))
          })
      } catch (error) {
        this.$message.error(this.$t('setting.requestFailed'))
      }
    }
  }
}
</script>
<style lang="scss">
.setting-list-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 30px 0 48px;
  overflow: hidden;
  box-sizing: border-box;
  .e-form {
    height: 100%;
    padding: 0 10%;
    background-color: #fff;
    overflow-y: auto;
    box-sizing: border-box;
    .item {
      margin-bottom: 20px;
      .title {
        display: inline-block;
        padding: 10px 0 20px;
      }
      .btns {
        float: right;
        padding-top: 10px;
        font-size: 12px;
        a {
          padding: 0 10px;
          color: #1976d2;
          cursor: pointer;
        }
      }
      .box {
        padding-left: 20px;
        .el-form-item {
          margin-bottom: 10px;
          .el-form-item__label {
            padding-bottom: 0;
            line-height: 28px;
          }
          .el-select {
            width: 100%;
          }
        }
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      margin: auto;
      line-height: 48px;
      text-align: center;
      border-top: 1px solid #eee;
    }
  }
  .dialog-email-template {
    .email-template-tabs {
      list-style: none;
      padding: 20px 0;
      li {
        padding: 5px 20px 5px 0;
        display: block;
        text-align: right;
        border-right: 3px solid #f2f2f2;
        cursor: pointer;
      }
      .active {
        color: #409eff;
        border-right: 3px solid #409eff;
      }
    }
    .settings-email-template {
      padding: 20px 0 20px 20px;
      p {
        margin: 0;
        line-height: 20px;
      }
      .paragraph {
        margin-top: 30px;
        padding-left: 40px;
      }
    }
  }
}
</style>
