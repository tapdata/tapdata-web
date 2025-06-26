<script>
import {
  fetchSettings,
  licensesApi,
  saveSettings,
  testEmail,
  usersApi,
} from '@tap/api'
import { showErrorMessage } from '@tap/business/src/components/error-message'

import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { TextFileReader } from '@tap/form/src/components/text-file-reader'
import { getCurrentLanguage } from '@tap/i18n/src/shared/util'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import { find, uniq } from 'lodash-es'
import i18n from '@/i18n'

export default {
  name: 'Setting',
  components: { TextFileReader, PageContainer },
  data() {
    return {
      title: import.meta.env.VUE_APP_PAGE_TITLE,
      liceseItems: [],
      emailTemplateDialog: false,
      formData: {
        items: [],
      },
      activeTab: 0,
      activePanel: 'Log',
      lang: getCurrentLanguage(),
      emailTabs: [
        {
          label: this.$t('setting_Email_Template_Running'),
          status: 'running',
        },
        {
          label: this.$t('setting_Email_Template_Paused'),
          status: 'paused',
        },
        {
          label: this.$t('setting_Email_Template_Error'),
          status: 'error',
        },
        {
          label: this.$t('setting_Email_Template_Draft'),
          status: 'draft',
        },
        {
          label: this.$t('setting_Email_Template_CDC'),
          status: 'CDC Lag',
        },
        { label: this.$t('setting_Email_Template_DDL') },
      ],
      keyMapping: {
        TASK_INCREMENT_DELAY: i18n.t('daas_setting_setting_renwudezengliang'),
        DATANODE_HTTP_CONNECT_CONSUME: i18n.t(
          'daas_setting_setting_shujuyuanwanglu',
        ),
        DATANODE_TCP_CONNECT_CONSUME: i18n.t(
          'daas_setting_setting_shujuyuanxieyi',
        ),
        DATANODE_AVERAGE_HANDLE_CONSUME: i18n.t(
          'daas_setting_setting_shujuyuanjiedian',
        ),
        PROCESSNODE_AVERAGE_HANDLE_CONSUME: i18n.t(
          'daas_setting_setting_chulijiediande',
        ),
      },
      columns: [
        {
          label: i18n.t('daas_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'keySlot',
        },
        {
          label: i18n.t('daas_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'valueSlot',
        },
      ],
      email: '',
      filterCategory: import.meta.env.VUE_APP_HIDE_SETTINGS_CATEGORY,
      adTesting: false,
    }
  },
  computed: {
    SMTP() {
      const result = {}
      const items = this.formData.items
      if (items && items.length) {
        const SMTP = find(items, (item) => {
          return item.category === 'SMTP'
        })
        if (SMTP && SMTP.items) {
          SMTP.items.forEach((it) => {
            result[it.key_label.split(' ').join('_')] = it.value
          })
        }
      }
      return result
    },

    ldapForm() {
      const result = {}
      const items = this.formData.items
      if (items && items.length) {
        const target = find(items, (item) => {
          return item.category === 'LDAP'
        })
        if (target && target.items) {
          target.items.forEach((it) => {
            const key = it.key_label.split(' ').join('_')
            result[key] = 'open' in it ? it.open : it.value
          })
        }
      }
      console.log('result', result)
      return result
    },
  },
  watch: {
    deep: true,
    formData: {
      deep: true,

      handler(value) {
        this.formData = value
      },
    },
  },
  created() {
    this.getData()
    this.email = Cookie.get('email')
  },
  methods: {
    changeName(name) {
      this.activePanel = name
    },
    // 获取设置数据
    getData() {
      let auth_data = []
      licensesApi.get({}).then((data) => {
        auth_data = data?.items || []
      })
      fetchSettings().then((data) => {
        let items = []
        const itemsCategories = []
        const cat = []
        data = data || []
        items = data.map((item) => {
          if (item.documentation) {
            item.documentationKey = item.documentation
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
          }

          return item.category
        })

        if (this.filterCategory) {
          const arr = this.filterCategory.split(',')
          items = items.filter((item) => !arr.includes(item))
        }

        items = uniq(items)
        items.sort((a, b) => {
          return a.sort < b.sort ? -1 : 1
        })
        items.map((item) => {
          const values = data.filter((childItem) => {
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

        const sortCategories = cat.map((item) => {
          const value = data.find((childItem) => {
            return childItem.category === item
          })
          return {
            category: item,
            category_sort: value.category_sort,
          }
        })

        const vals = sortCategories.map((item) => {
          const value = find(itemsCategories, (val) => {
            return val.category === item.category
          })
          return Object.assign(value, item)
        })
        vals.sort((a, b) => {
          return a.category_sort > b.category_sort
            ? 1
            : a.category_sort < b.category_sort
              ? -1
              : 0
        })
        this.formData.items = vals

        this.changeName(this.formData.items[0].category)

        // this.formData.items.push({
        //   liceseItems: auth_data,
        //   items: auth_data,
        //   category: 'license',
        // })
      })
    },
    // 保存
    save() {
      const settingData = []
      this.formData.items.filter((item) => {
        item.items.forEach((childItem) => {
          settingData.push(childItem)
        })
      })
      saveSettings(settingData).then(() => {
        this.$message.success(this.$t('public_message_save_ok'))
      })
    },
    // 邮件模板
    checkTemplate() {
      this.emailTemplateDialog = true
    },
    // 连接测试
    connectAndTest() {
      const lastTime = localStorage.getItem('Tapdata_settings_email_countdown')
      const now = Time.now()
      const duration = Math.floor((now - lastTime) / 1000)
      if (lastTime && duration < 60) {
        this.$message.success(
          `${this.$t('setting_test_email_countdown')}(${60 - duration}s)`,
        )
        return
      }
      const params = {
        ...this.SMTP,
        title: `Tapdata Notification:`,
        text: 'This is a test email',
      }
      testEmail(params).then((data) => {
        localStorage.setItem('Tapdata_settings_email_countdown', now)

        if (data?.result) {
          this.$message.success(this.$t('setting_test_email_success'))
        } else {
          showErrorMessage(data)
        }
      })
    },

    testLdap() {
      this.adTesting = true
      usersApi
        .testLdapLogin(this.ldapForm)
        .then((data) => {
          if (data?.result) {
            this.$message.success(this.$t('setting_test_ldap_success'))
          } else {
            showErrorMessage(data)
          }
        })
        .finally(() => {
          this.adTesting = false
        })
    },

    handleChangeCert(target, value) {
      target.value = value
    },

    handleChangeName(target, name) {
      target.fileName = name
    },
  },
}
</script>

<template>
  <PageContainer
    mode="auto"
    content-class="flex flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <div class="pb-6 h-100 position-sticky flex-shrink-0 top-0">
      <el-scrollbar class="rounded-xl">
        <ul
          class="setting-nav flex flex-column gap-1 bg-light p-3 pl-4 rounded-xl"
        >
          <li
            v-for="(item, index) in formData.items"
            :key="index"
            class="rounded-lg"
            :class="activePanel === item.category ? 'active' : ''"
            @click="changeName(item.category)"
          >
            <span class="title">{{ $t(`setting_${item.category}`) }}</span>
          </li>
        </ul>
      </el-scrollbar>
    </div>

    <el-form :model="formData" class="e-form flex-1" label-position="top">
      <!-- <div class="e-form-box flex-1"> -->
      <div class="e-form-box">
        <div
          v-for="(item, index) in formData.items"
          v-show="activePanel === item.category"
          :key="index"
          class="item"
        >
          <template v-if="activePanel === item.category">
            <span class="title">{{ $t(`setting_${item.category}`) }}</span>
            <div
              v-for="(childItem, childIndex) in item.items"
              :key="childIndex"
              class="box"
            >
              <div v-if="item.category === 'license'">
                <div
                  v-for="(licenseItem, licenseIndex) in item.liceseItems"
                  :key="licenseIndex"
                  class="license"
                >
                  <div>
                    {{ $t('setting_nameserver') }}:
                    {{ licenseItem.hostname }}
                  </div>
                </div>
                <el-button @click="importlicense(licenseItem)">{{
                  $t('setting_import')
                }}</el-button>
                <el-button @click="hrefApply(licenseItem)">{{
                  $t('setting_apply')
                }}</el-button>
              </div>

              <el-row v-if="activePanel === childItem.category">
                <el-col :span="24">
                  <el-form-item
                    v-if="
                      childItem.key_label !== 'Ldap SSL Cert' ||
                      ldapForm.Ldap_SSL_Enable
                    "
                  >
                    <template #label>
                      <span
                        >{{
                          $t(
                            `setting_${(childItem.key_label || '')
                              .split(' ')
                              .join('_')}`,
                          ) || childItem.key_label
                        }}:</span
                      >
                      <el-tooltip
                        v-if="
                          childItem.documentation &&
                          $te(`setting_${childItem.documentationKey}`)
                        "
                        effect="dark"
                        placement="top"
                      >
                        <template #content>
                          <div style="max-width: 300px">
                            {{ $t(`setting_${childItem.documentationKey}`) }}
                          </div>
                        </template>

                        <VIcon class="color-primary ml-3" size="14">info</VIcon>
                      </el-tooltip>
                    </template>

                    <TextFileReader
                      v-if="childItem.key_label === 'Ldap SSL Cert'"
                      :value="childItem.value"
                      :file-name="childItem.fileName"
                      @change="handleChangeCert(childItem, $event)"
                      @update:file-name="handleChangeName(childItem, $event)"
                    />
                    <ElInputNumber
                      v-else-if="'min' in childItem || 'max' in childItem"
                      v-model="childItem.value"
                      controls-position="right"
                      :min="childItem.min"
                      :max="childItem.max"
                    />
                    <el-switch
                      v-else-if="'open' in childItem"
                      v-model="childItem.open"
                    />
                    <el-input
                      v-else-if="
                        !childItem.enums || childItem.enums.length === 0
                      "
                      v-model="childItem.value"
                      :type="
                        /password/.test(childItem.key) ? 'password' : 'text'
                      "
                      :disabled="item.category === 'license'"
                      :mask="childItem.mask"
                      :label="
                        $t(
                          `setting_${(childItem.key_label || '')
                            .split(' ')
                            .join('_')}`,
                        ) || childItem.key_label
                      "
                    />

                    <el-select v-else v-model="childItem.value">
                      <el-option
                        v-for="options in childItem.enums"
                        :key="options"
                        :value="options"
                        :label="options"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </template>
        </div>
      </div>

      <div class="footer position-sticky py-6 bottom-0 bg-white z-10">
        <el-button
          v-if="email === 'admin@admin.com'"
          type="primary"
          @click="save"
          >{{ $t('public_button_save') }}</el-button
        >

        <el-button
          v-if="activePanel === 'LDAP'"
          :loading="adTesting"
          @click="testLdap"
          >{{ $t('public_connection_button_test') }}</el-button
        >

        <template v-else-if="activePanel === 'SMTP'">
          <el-button @click="checkTemplate">{{
            $t('setting_email_template')
          }}</el-button>
          <el-button @click="connectAndTest">{{
            $t('public_connection_button_test')
          }}</el-button>
        </template>
      </div>
    </el-form>

    <el-dialog
      v-model="emailTemplateDialog"
      :title="$t('setting_email_template')"
      :close-on-click-modal="false"
      class="dialog-email-template"
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
              {{ $t('setting_email_template_subject') }} :
              {{ SMTP['Send_Email_Title_Prefix'] }} {{ title }} Notification:
              <span v-show="activeTab <= 4"
                >Job {{ emailTabs[activeTab].status }}</span
              >
              <span v-show="activeTab > 4"
                >DDL Warn, please perform DDL operation manually.</span
              >
            </p>
            <p class="paragraph">Hello there,</p>
            <p v-show="activeTab <= 3" class="paragraph">
              <span>Job_name XXX was modified</span><br />
              <span
                >Status:
                <span style="color: #f56c6c">{{
                  emailTabs[activeTab].status
                }}</span></span
              >
            </p>
            <p v-show="activeTab == 4" class="paragraph">
              <span>Job_name XXX was CDC lag</span><br />
              <span
                >Node lag time: <span style="color: #f56c6c">XXXX s</span></span
              >
            </p>
            <p v-show="activeTab == 5" class="paragraph">
              <span>Job: job_name xxx</span><br />
              <span>Source: <span style="color: #f56c6c">xxx</span></span
              ><br />
              <span>Target: <span style="color: #f56c6c">xxx</span></span
              ><br />
              <span>Notification DDLs:</span><br />
              <span>
                No. <span style="color: #f56c6c">xxx</span>&nbsp;&nbsp; Scn:
                <span style="color: #f56c6c">xxx</span>&nbsp;&nbsp; At:
                <span style="color: #f56c6c">xxx</span><br />
                DDL sql: <span style="color: #f56c6c">xxx</span>
              </span>
            </p>
            <p class="paragraph">This mail was sent by {{ title }}.</p>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="emailTemplateDialog = false">{{
            $t('public_button_confirm')
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.setting-list-box {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  // background-color: #fff;
  border-radius: 4px;
}

.setting-nav {
  li {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    height: 32px;
    cursor: pointer;
    color: var(--text-light);
    white-space: nowrap;
    user-select: none;
    .title {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      background: var(--fill-hover);
    }
  }

  li.active {
    background: var(--primary-hover-light);
    color: var(--el-color-primary);
    &::after {
      background: var(--el-color-primary);
      border-radius: 0.375rem;
      content: '';
      height: 20px;
      left: -0.5rem;
      position: absolute;
      top: calc(50% - 10px);
      width: 0.25rem;
    }
  }
}

.e-form {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-sizing: border-box;

  .item {
    .title {
      display: inline-block;
      padding: 0 0 20px;
      color: var(--text-dark);
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
      width: 800px;
      .el-form-item {
        margin-bottom: 22px;
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
    flex: 0 0 auto;
    width: 100%;
    border-top: 1px solid var(--border-light);
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
      border-right: 3px solid var(--border-light);
      cursor: pointer;
    }
    .active {
      color: var(--color-primary);
      border-right: 3px solid var(--color-primary);
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
</style>
