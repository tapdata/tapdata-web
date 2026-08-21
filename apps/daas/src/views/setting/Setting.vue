<script>
import { fetchLicenses } from '@tap/api/src/core/licenses'
import {
  fetchSettings,
  saveSettings,
  testEmail,
} from '@tap/api/src/core/settings'
import {
  exportSpMetadata,
  generateSamlKeyPair,
  importIdpMetadata,
} from '@tap/api/src/core/sso'
import { testLdapLogin } from '@tap/api/src/core/users'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import PageContainer from '@tap/business/src/components/PageContainer.vue'

import EmailTemplateDialog from '@tap/business/src/views/setting/EmailTemplateDialog.vue'
import { AdminOutlined } from '@tap/component/src/icon'
import { TextFileReader } from '@tap/form/src/components/text-file-reader'
import { getCurrentLanguage } from '@tap/i18n/src/shared/util'
import Cookie from '@tap/shared/src/cookie'
import { setSettings } from '@tap/shared/src/settings'
import Time from '@tap/shared/src/time'
import { downloadJson } from '@tap/shared/src/util'
import { find, uniq } from 'lodash-es'
import i18n from '@/i18n'

export default {
  name: 'Setting',
  components: {
    TextFileReader,
    PageContainer,
    EmailTemplateDialog,
    AdminOutlined,
  },
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
      appearanceForm: {},
      colorEnum: ['red', 'orange', 'yellow', 'blue', 'green', 'purple'],
      formItems: [],
      samlKeyPairGenerating: false,
      samlMetadataExporting: false,
      samlImportDialog: false,
      samlImportXml: '',
      samlImportFileName: '',
      samlImporting: false,
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
      return result
    },
  },
  watch: {
    formData: {
      deep: true,

      handler(value) {
        this.formData = value
      },
    },
    activePanel(v) {
      if (v === 'Appearance') {
        const result = {}
        const items = this.formData.items
        if (items && items.length) {
          const Appearance = find(items, (item) => {
            return item.category === 'Appearance'
          })
          if (Appearance && Appearance.items) {
            Appearance.items.forEach((it) => {
              const key = it.key_label.split(' ').join('_')
              result[key] = it.value
            })
          }
        }
        this.appearanceForm = result
      }
    },
  },
  created() {
    this.getData()
    this.email = Cookie.get('email')
  },
  methods: {
    updateValue(key, value) {
      const item = this.formItems.find((item) => item.key === key)
      if (item) {
        item.value = value
      }
    },
    changeName(item) {
      this.activePanel = item.category
      this.formItems = item.items || []
    },
    // 获取设置数据
    getData() {
      let auth_data = []
      fetchLicenses().then((data) => {
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

        const Appearance = vals.find((item) => {
          return item.category === 'Appearance'
        })

        if (!Appearance) {
          vals.unshift({
            category: 'Appearance',
            items: [
              {
                category: 'Appearance',
                key: 'enableEnvTag',
                value: 'false',
                enums: ['true', 'false'],
                category_sort: '0',
                sort: '1',
                key_label: 'enableEnvTag',
                user_visible: true,
              },
              {
                category: 'Appearance',
                key: 'envTagContent',
                value: 'Production',
                sort: '2',
                key_label: 'envTagContent',
                user_visible: true,
              },
              {
                category: 'Appearance',
                key: 'envTagColor',
                value: 'red',
                sort: '3',
                key_label: 'envTagColor',
                user_visible: true,
                enums: ['red', 'orange', 'yellow', 'blue', 'green', 'purple'],
              },
            ],
          })
        }

        this.formData.items = vals

        this.changeName(this.formData.items[0])
      })
    },
    // 保存
    save() {
      const settingData = []
      this.formData.items.forEach((item) => {
        item.items.forEach((childItem) => {
          settingData.push(childItem)
        })
      })
      saveSettings(settingData).then(async () => {
        const settings = await fetchSettings()
        setSettings(settings)
        localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(settings))
        this.$message.success(this.$t('public_message_save_ok'))

        if (this.appearanceForm && Object.keys(this.appearanceForm).length) {
          this.$store.commit('setAppearance', this.appearanceForm)
        }
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
      testLdapLogin(this.ldapForm)
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

    // 证书类字段统一用文件上传控件(LDAP SSL 证书 + SAML SP/IdP 证书)
    isCertField(childItem) {
      return (
        childItem.key_label === 'Ldap SSL Cert' ||
        childItem.key === 'saml.sp.certificate' ||
        childItem.key === 'saml.idp.signingCertificate'
      )
    },

    // 按 key 定位 SAML 分类里的某个配置行,用于回填 metadata / 证书
    findSamlItem(key) {
      const category = find(this.formData.items, (item) => {
        return item.category === 'SAML'
      })
      return category ? find(category.items, (it) => it.key === key) : null
    },

    // 生成 SP 密钥对:私钥加密存于后端,仅返回证书,回填到 SP Certificate 行
    generateSamlKeyPair() {
      this.samlKeyPairGenerating = true
      generateSamlKeyPair()
        .then((data) => {
          const certItem = this.findSamlItem('saml.sp.certificate')
          if (certItem) {
            certItem.value = data?.spCertificate || ''
          }
          this.$message.success(this.$t('setting_saml_keypair_generated'))
        })
        .catch((error) => {
          showErrorMessage(error)
        })
        .finally(() => {
          this.samlKeyPairGenerating = false
        })
    },

    // 导出 SP 元数据 XML 供 IdP 导入
    exportSpMetadata() {
      this.samlMetadataExporting = true
      exportSpMetadata()
        .then((xml) => {
          downloadJson(xml, 'tapdata-sp-metadata.xml')
        })
        .catch((error) => {
          showErrorMessage(error)
        })
        .finally(() => {
          this.samlMetadataExporting = false
        })
    },

    openSamlImportDialog() {
      this.samlImportXml = ''
      this.samlImportFileName = ''
      this.samlImportDialog = true
    },

    handleChangeSamlImportXml(value) {
      this.samlImportXml = value || ''
    },

    handleChangeSamlImportName(name) {
      this.samlImportFileName = name || ''
    },

    // 解析 IdP 元数据并回填 IdP 分组的四个字段(保存后才落库)
    confirmImportIdpMetadata() {
      if (!this.samlImportXml) {
        this.$message.warning(this.$t('setting_saml_import_empty'))
        return
      }
      this.samlImporting = true
      importIdpMetadata(this.samlImportXml)
        .then((data) => {
          const mapping = {
            'saml.idp.entityId': data?.idpEntityId,
            'saml.idp.ssoUrl': data?.idpSsoUrl,
            'saml.idp.sloUrl': data?.idpSloUrl,
            'saml.idp.signingCertificate': data?.idpSigningCertificate,
          }
          Object.keys(mapping).forEach((key) => {
            const item = this.findSamlItem(key)
            // A null value from the metadata explicitly clears an optional
            // endpoint such as SLO; only an absent field should be ignored.
            if (item && mapping[key] !== undefined) {
              item.value = mapping[key]
            }
          })
          this.samlImportDialog = false
          this.$message.success(this.$t('setting_saml_import_success'))
        })
        .catch((error) => {
          showErrorMessage(error)
        })
        .finally(() => {
          this.samlImporting = false
        })
    },

    handleChangeCert(target, value) {
      target.value = value
    },

    handleChangeName(target, name) {
      target.fileName = name
    },

    addRule(target) {
      target.value.push({
        remainingDaysThreshold: 0,
        level: 'warning',
      })
    },

    removeRule(target, index) {
      target.value.splice(index, 1)
    },

    showCustomMailTemplate(target) {
      this.$refs.emailTemplateDialog?.[0]?.open([
        {
          key: 'license_alarm_template',
          emailAlarmTitle: target.value.emailAlarmTitle,
          emailAlarmContent: target.value.emailAlarmContent,
        },
      ])
    },

    handleSaveMailTemplate(target, rulesList) {
      target.value.emailAlarmTitle = rulesList[0].emailAlarmTitle
      target.value.emailAlarmContent = rulesList[0].emailAlarmContent
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
            @click="changeName(item)"
          >
            <span class="title">{{ $t(`setting_${item.category}`) }}</span>
          </li>
        </ul>
      </el-scrollbar>
    </div>

    <el-form :model="formData" class="e-form flex-1" label-position="top">
      <div class="e-form-box">
        <div class="item">
          <span class="title">{{ $t(`setting_${activePanel}`) }}</span>
          <div v-if="activePanel === 'Appearance'" class="box">
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <template #label>
                    <span>{{ $t('setting_enableEnvTag') }}</span>
                  </template>
                  <el-switch
                    v-model="appearanceForm.enableEnvTag"
                    active-value="true"
                    inactive-value="false"
                    @change="updateValue('enableEnvTag', $event)"
                  />
                </el-form-item>
              </el-col>
              <template v-if="appearanceForm.enableEnvTag === 'true'">
                <el-col :span="24">
                  <el-form-item>
                    <div
                      class="border border-dashed p-3 rounded-lg bg-color-disable w-100 flex align-center"
                    >
                      <span
                        class="inline-flex align-center justify-center rounded-lg flex-shrink-0 text-xs fw-sub px-2 py-1 gap-1.5"
                        :class="`tag-${appearanceForm.envTagColor}`"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-pill"
                          style="background-color: currentColor"
                        />
                        {{ appearanceForm.envTagContent || '-' }}
                      </span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item>
                    <template #label>
                      <span>{{ $t('setting_envTagContent') }}</span>
                    </template>
                    <el-input
                      v-model="appearanceForm.envTagContent"
                      :placeholder="$t('setting_envTagContent_placeholder')"
                      @change="updateValue('envTagContent', $event.toString())"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item>
                    <template #label>
                      <span>{{ $t('setting_envTagColor') }}</span>
                    </template>
                    <div class="flex align-center gap-3">
                      <div
                        v-for="color in colorEnum"
                        :key="color"
                        class="inline-flex align-center justify-center rounded-lg flex-shrink-0 text-xs fw-sub px-2 py-1 gap-1.5 w-8 h-8 cursor-pointer"
                        :class="`tag-${color}`"
                        @click="
                          ((appearanceForm.envTagColor = color),
                          updateValue('envTagColor', color))
                        "
                      >
                        <el-icon :size="16">
                          <i-lucide-check
                            v-if="appearanceForm.envTagColor === color"
                          />
                        </el-icon>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </div>
          <template v-else>
            <div
              v-for="(childItem, childIndex) in formItems"
              :key="childIndex"
              class="box"
            >
              <el-row v-if="activePanel === childItem.category">
                <el-col :span="24">
                  <el-form-item
                    v-if="
                      childItem.key_label !== 'Ldap SSL Cert' ||
                      ldapForm.Ldap_SSL_Enable
                    "
                  >
                    <template #label>
                      <span>{{
                        $t(
                          `setting_${(childItem.key_label || '')
                            .split(' ')
                            .join('_')}`,
                        ) || childItem.key_label
                      }}</span>
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
                      v-if="isCertField(childItem)"
                      :value="childItem.value"
                      :file-name="childItem.fileName"
                      @change="handleChangeCert(childItem, $event)"
                      @update:file-name="handleChangeName(childItem, $event)"
                    />

                    <template v-else-if="childItem.key === 'license_rule'">
                      <div
                        class="flex flex-column gap-2 w-100 align-items-start"
                      >
                        <div
                          v-for="(ruleItem, i) in childItem.value"
                          :key="i"
                          class="flex align-center gap-4"
                        >
                          <span class="text-secondary">{{
                            $t('setting_license_remainingDaysThreshold')
                          }}</span>
                          <el-input-number
                            v-model="ruleItem.remainingDaysThreshold"
                            :min="0"
                            :controls="false"
                            style="width: 100px"
                          />

                          <span class="text-secondary">{{
                            $t('packages_dag_components_alert_gaojingjibie')
                          }}</span>
                          <el-input
                            v-model="ruleItem.level"
                            style="width: 200px"
                            :placeholder="
                              $t('packages_dag_components_alert_gaojingjibie')
                            "
                          />

                          <el-button
                            text
                            size="small"
                            @click="removeRule(childItem, i)"
                          >
                            <template #icon>
                              <i-mingcute-close-line />
                            </template>
                          </el-button>
                        </div>

                        <el-button @click="addRule(childItem)">
                          <template #icon>
                            <i-mingcute-add-line />
                          </template>
                          {{ $t('public_rule_add') }}
                        </el-button>
                      </div>
                    </template>

                    <template
                      v-else-if="childItem.key === 'license_alarm_template'"
                    >
                      <el-button @click="showCustomMailTemplate(childItem)">
                        <template #icon>
                          <AdminOutlined />
                        </template>
                        {{ $t('setting_license_alarm_template_custom') }}
                      </el-button>

                      <EmailTemplateDialog
                        ref="emailTemplateDialog"
                        hide-menu
                        @save="handleSaveMailTemplate(childItem, $event)"
                      />
                    </template>

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
                      :disabled="activePanel === 'license'"
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

      <div
        class="footer border-top position-sticky py-6 bottom-0 bg-white z-10 dark:bg-transparent dark:backdrop-blur-md"
      >
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

        <template v-else-if="activePanel === 'SAML'">
          <el-button
            :loading="samlKeyPairGenerating"
            @click="generateSamlKeyPair"
            >{{ $t('setting_saml_generate_keypair') }}</el-button
          >
          <el-button
            :loading="samlMetadataExporting"
            @click="exportSpMetadata"
            >{{ $t('setting_saml_export_sp_metadata') }}</el-button
          >
          <el-button @click="openSamlImportDialog">{{
            $t('setting_saml_import_idp_metadata')
          }}</el-button>
        </template>
      </div>
    </el-form>

    <el-dialog
      v-model="samlImportDialog"
      :title="$t('setting_saml_import_idp_metadata')"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form label-position="top">
        <el-form-item :label="$t('setting_saml_import_idp_metadata_label')">
          <TextFileReader
            accept=".xml"
            :value="samlImportXml"
            :file-name="samlImportFileName"
            @change="handleChangeSamlImportXml"
            @update:file-name="handleChangeSamlImportName"
          />
        </el-form-item>
        <el-input
          v-model="samlImportXml"
          type="textarea"
          :rows="8"
          :placeholder="$t('setting_saml_import_idp_metadata_placeholder')"
        />
      </el-form>
      <template #footer>
        <el-button @click="samlImportDialog = false">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button
          type="primary"
          :loading="samlImporting"
          @click="confirmImportIdpMetadata"
          >{{ $t('public_button_confirm') }}</el-button
        >
      </template>
    </el-dialog>

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
  // background-color: var(--card);
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
