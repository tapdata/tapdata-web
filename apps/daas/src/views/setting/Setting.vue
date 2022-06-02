<template>
  <section class="setting-list-wrap">
    <div class="setting-list-box">
      <ul class="setting-nav" :style="lang === 'en_US' ? '280px' : '160px'">
        <li
          v-for="(item, index) in formData.items"
          :key="index"
          :class="activePanel === item.category ? 'active' : ''"
          @click="changeName(item.category)"
        >
          <!-- <ElTooltip :content="$t('setting_' + item.category)"> -->
          <span class="title">{{ $t('setting_' + item.category) }}</span>
          <!-- </ElTooltip> -->

          <VIcon class="ml-3" size="14">arrow-right</VIcon>
        </li>
      </ul>

      <el-form :model="formData" class="e-form" label-position="top">
        <div class="e-form-box">
          <div v-for="(item, index) in formData.items" :key="index" class="item" v-show="activePanel === item.category">
            <template v-if="activePanel === item.category">
              <span class="title">{{ $t('setting_' + item.category) }}</span>
              <div class="box" v-for="(childItem, childIndex) in item.items" :key="childIndex">
                <div v-if="item.category === 'license'">
                  <div class="license" v-for="(licenseItem, licenseIndex) in item.liceseItems" :key="licenseIndex">
                    <div>{{ $t('setting_nameserver') }}: {{ licenseItem.hostname }}</div>
                  </div>
                  <el-button @click="importlicense(licenseItem)">{{ $t('setting_import') }}</el-button>
                  <el-button @click="hrefApply(licenseItem)">{{ $t('setting_apply') }}</el-button>
                </div>

                <el-row v-if="activePanel === childItem.category">
                  <el-col :span="24">
                    <el-form-item>
                      <span slot="label">
                        <span
                          >{{
                            $t('setting_' + (childItem.key_label || '').split(' ').join('_')) || childItem.key_label
                          }}:</span
                        >
                        <el-tooltip effect="dark" placement="top" v-if="childItem.documentation">
                          <div style="max-width: 300px" slot="content">
                            {{
                              $t(
                                'setting_' +
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
                          <!-- <span
                            class="icon iconfont icon-tishi1"
                            style="vertical-align: bottom; padding-left: 10px; font-size: 18px"
                          ></span> -->
                          <VIcon class="color-primary ml-3" size="14">info</VIcon>
                        </el-tooltip>
                      </span>
                      <el-input
                        v-if="!childItem.enums || childItem.enums.length === 0"
                        :type="childItem.key.match(/password/) ? 'password' : 'text'"
                        v-model="childItem.value"
                        :disabled="item.category === 'license'"
                        :mask="childItem.mask"
                        size="mini"
                        :label="
                          $t('setting_' + (childItem.key_label || '').split(' ').join('_')) || childItem.key_label
                        "
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
            </template>
            <template v-if="item.category !== 'license'">
              <span class="btns" v-if="item.category === 'SMTP'">
                <a class="link-primary" @click="checkTemplate()">{{ $t('setting_email_template') }}</a>
                <a class="link-primary" @click="connectAndTest()">{{ $t('setting_connect_and_test') }}</a>
              </span>
            </template>
          </div>
        </div>

        <div class="footer">
          <el-button @click="save" size="mini" type="primary">{{ $t('button_save') }}</el-button>
        </div>
      </el-form>
    </div>

    <el-dialog
      :title="$t('setting_email_template')"
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
              {{ $t('setting_email_template_from') }} :
              {{ SMTP['Email_Send_Address'] }}
            </p>
            <p>
              {{ $t('setting_email_template_to') }} :
              {{ SMTP['Email_Receivers'] }}
            </p>
            <p>
              {{ $t('setting_email_template_subject') }} : {{ SMTP['Send_Email_Title_Prefix'] }} Tapdata Notification:
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
import { uniq, find } from 'lodash'
import VIcon from '@/components/VIcon'
import Cookie from '@tap/shared/src/cookie'
export default {
  name: 'Setting',
  components: { VIcon },
  data() {
    return {
      liceseItems: [],
      emailTemplateDialog: false,
      formData: {
        items: []
      },
      activeTab: 0,
      activePanel: 'Log',
      lang: Cookie.get('lang') || 'en_US',
      emailTabs: [
        {
          label: this.$t('setting_Email_Template_Running'),
          status: 'running'
        },
        {
          label: this.$t('setting_Email_Template_Paused'),
          status: 'paused'
        },
        {
          label: this.$t('setting_Email_Template_Error'),
          status: 'error'
        },
        {
          label: this.$t('setting_Email_Template_Draft'),
          status: 'draft'
        },
        {
          label: this.$t('setting_Email_Template_CDC'),
          status: 'CDC Lag'
        },
        { label: this.$t('setting_Email_Template_DDL') }
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
  watch: {
    deep: true,
    formData: {
      handler(value) {
        this.formData = value
      }
    }
  },
  methods: {
    changeName(name) {
      this.activePanel = name
    },
    // 获取设置数据
    getData() {
      let _this = this
      let auth_data = []
      _this
        .$api('Licenses')
        .get({})
        .then(result => {
          if (result && result.data) {
            auth_data = result.data.items || []
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
          items = uniq(items)
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
            let value = find(itemsCategories, val => {
              return val.category === item.category
            })
            return Object.assign(value, item)
          })
          vals.sort((a, b) => {
            return a.category_sort > b.category_sort ? 1 : a.category_sort < b.category_sort ? -1 : 0
          })

          _this.formData.items = vals
        })
      let lincenseData = {
        liceseItems: auth_data,
        items: auth_data,
        category: 'license'
      }
      _this.formData.items.push(lincenseData)
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
            this.$message.success(this.$t('message_save_ok'))
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
          this.$message.success(this.$t('setting_test_email_countdown')) + '(' + (60 - duration) + 's)',
          2
        )
      }
      try {
        this.$api('Setting')
          .testEmail()
          .then(() => {
            localStorage.setItem('Tapdata_settings_email_countdown', now)
            this.$message.success(this.$t('setting_test_email_success'))
          })
      } catch (error) {
        this.$message.error(this.$t('setting_requestFailed'))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.setting-list-wrap {
  height: 100%;
  // position: relative;
  overflow: hidden;
  box-sizing: border-box;
  .setting-list-box {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    // background-color: #fff;
    border-radius: 4px;
    .setting-nav {
      height: 100%;
      padding: 20px 2px;
      border-right: 1px solid map-get($borderColor, light);
      li {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px 0 20px;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        color: map-get($fontColor, light);
        white-space: nowrap;
        .title {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .active {
        background: rgba(44, 101, 255, 0.05);
      }
    }
  }

  .e-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
    .e-form-box {
      padding: 20px 20px 0;
      flex: 1 1 auto;
      overflow-y: auto;
    }
    .item {
      width: 800px;
      margin-bottom: 20px;
      .title {
        display: inline-block;
        padding: 10px 0 20px;
        color: map-get($fontColor, dark);
        font-size: 14px;
        font-weight: 500;
      }
      .btns {
        float: right;
        padding-top: 10px;
        font-size: 12px;
        a {
          padding: 0 10px;
          cursor: pointer;
        }
      }
      .box {
        .el-form-item {
          margin-bottom: 22px;
          .el-form-item__label {
            padding-bottom: 0;
            line-height: 28px;
          }
          // .el-input__inner {
          //   width: 500px;
          // }
          .el-select {
            width: 100%;
          }
        }
      }
    }
    .footer {
      flex: 0 0 auto;
      width: 100%;
      padding: 0 20px;
      line-height: 48px;
      text-align: right;
      border-top: 1px solid map-get($borderColor, light);
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
        border-right: 3px solid map-get($borderColor, light);
        cursor: pointer;
      }
      .active {
        color: map-get($color, primary);
        border-right: 3px solid map-get($color, primary);
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
