<script>
import { EditPen, Refresh } from '@element-plus/icons-vue'
import { usersApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { IconButton } from '@tap/component/src/icon-button'
import Cookie from '@tap/shared/src/cookie'
import { copyToClipboard } from '@tap/shared/src/util'
export default {
  name: 'List',
  components: {
    IconButton,
    PageContainer,
  },
  data() {
    //此处即表单发送之前验证  验证新密码与原密码

    const validateNewPassword = (rule, value, callback) => {
      if (value === this.pwd.oldPassword) {
        callback(new Error(this.$t('account_samePawTip')))
      } else {
        callback()
      }
    }
    // 是否是中文
    const validateisCN = (rule, value, callback) => {
      const passwordReg = /[\s\u4E00-\u9FA5]/
      if (passwordReg.test(value)) {
        callback(new Error(this.$t('account_passwordNotCN')))
      } else {
        callback()
      }
    }
    //此处即表单发送之前验证  验证新密码与再次确认
    const validateNewPassword2 = (rule, value, callback) => {
      if (value !== this.pwd.newPassword) {
        callback(new Error(this.$t('account_newPawInconsistent')))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        newEmail: '',
        password: '',
      },
      pwd: {
        oldPassword: '',
        newPassword: '',
        comfirmPassword: '',
      },
      userName: '',
      infoList: [
        {
          label: this.$t('account_email'),
          value: '',
          key: 'email',
          icon: EditPen,
        },
        {
          label: this.$t('account_userName'),
          value: '',
          key: 'username',
          icon: EditPen,
        },
        {
          label: this.$t('public_connection_form_password'),
          value: '******',
          key: 'password',
          icon: EditPen,
        },
        {
          label: this.$t('account_accessCode'),
          value: '',
          key: 'accessCode',
          icon: Refresh,
        },
      ],
      emailDialogFalg: false,
      passwordDialogFalg: false,
      usernameDialogFalg: false,
      oldFlag: false,
      newFlag: false,
      comfirFlag: false,
      rotateFlag: false,
      oldPasswordType: 'password',
      newPasswordType: 'password',
      comfirmPasswordType: 'password',
      rules: {
        //验证规则
        oldPassword: [
          {
            required: true,
            message: this.$t('account_currentPassword'),
            trigger: 'blur',
          },
          {
            min: 5,
            message: this.$t('app_signIn_password_invalid'),
            trigger: 'blur',
          },
          {
            validator: validateisCN,
            trigger: 'blur',
          },
        ],
        newPassword: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('account_newPassword'),
          },
          {
            validator: validateNewPassword,
            trigger: 'blur',
          },
          {
            min: 5,
            message: this.$t('app_signIn_password_invalid'),
            trigger: 'blur',
          },
          {
            validator: validateisCN,
            trigger: 'blur',
          },
        ],
        comfirmPassword: [
          {
            required: true,
            message: this.$t('account_confirmPassword'),
            trigger: 'blur',
          },
          {
            validator: validateNewPassword2,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    this.handleGetData()
  },
  methods: {
    handleCopy(value) {
      copyToClipboard(value)
      this.$message.success(this.$t('public_message_copy_success'))
    },
    // 获取当前信息
    async handleGetData() {
      this.loading = true
      const data = await usersApi.get([Cookie.get('user_id')])
      if (data) {
        this.infoList.forEach((item) => {
          Object.keys(data).forEach((key) => {
            if (item.key === key) {
              item.value = data[key]
            }
          })
        })
      }
      this.loading = false
    },

    // 编辑修改
    handleChange(val) {
      switch (val) {
        case 'email':
          this.emailDialogFalg = true
          break
        case 'username':
          this.usernameDialogFalg = true
          break
        case 'password':
          this.passwordDialogFalg = true
          break
        case 'accessCode':
          this.$confirm(
            this.$t('account_accessCode_confirm'),
            this.$t('account_accessCode_tip'),
            {
              dangerouslyUseHTMLString: true,
            },
          ).then((res) => {
            if (res) {
              usersApi.refreshAccessCode().then((data) => {
                this.infoList.find((item) => item.key === 'accessCode').value =
                  data
                this.$message({
                  type: 'success',
                  message: this.$t('account_accessCode_success'),
                })
              })
            }
          })
          break
      }
    },

    // 修改用户名
    confirm() {
      const parmas = {
        id: Cookie.get('user_id'),
        username: this.userName,
      }
      if (this.userName) {
        usersApi.patch(parmas).then(() => {
          this.$message.success(this.$t('account_nameModifySuccess'))
          this.usernameDialogFalg = false
          this.handleGetData()
        })
        // .catch(e => {
        //   if (e.response && e.response.msg) {
        //     if (e.response.msg.indexOf('User already exists')) {
        //       this.$message.error(this.$t('account_has_username'))
        //     } else {
        //       this.$message.error(this.$t('account_editFail'))
        //     }
        //   }
        // })
      } else {
        this.$message.error(this.$t('account_user_null'))
      }
    },

    // 保存密码
    save() {
      const parmas = {
        oldPassword: this.pwd.oldPassword,
        newPassword: this.pwd.newPassword,
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          usersApi.changePassword(parmas).then(() => {
            this.$message.success(this.$t('account_pawSaveSuccess'))
            this.passwordDialogFalg = false
            Cookie.remove('access_token')
            Cookie.remove('user_id')
            setTimeout(() => {
              location.reload()
            }, 500)
          })
          // .catch(e => {
          //   if (e.response && e.response.msg === 'Invalid current password') {
          //     this.$message.error(this.$t('account_currerPawErrorTip'))
          //   }
          // })
        }
      })
    },

    // 修改邮箱
    send() {},

    // 眼睛改变
    changeEye(val) {
      switch (val) {
        case 'old':
          this.oldFlag = !this.oldFlag
          this.oldPasswordType = this.oldFlag ? 'text' : 'password'
          break
        case 'new':
          this.newFlag = !this.newFlag
          this.newPasswordType = this.newFlag ? 'text' : 'password'
          break
        default:
          this.comfirFlag = !this.comfirFlag
          this.comfirmPasswordType = this.comfirFlag ? 'text' : 'password'
          break
      }
    },
  },
}
</script>

<template>
  <PageContainer mode="auto">
    <div v-loading="loading" class="account">
      <div class="setting-right">
        <ul class="content">
          <li
            v-for="item in infoList"
            :key="item.key"
            class="flex align-center"
          >
            <span class="label">{{ item.label }}</span>
            <span class="text">
              <span class="align-middle">{{ item.value }}</span>
              <IconButton
                v-if="item.key === 'accessCode'"
                primary
                class="align-middle ml-2"
                sm
                @click="handleCopy(item.value)"
                >copy</IconButton
              >
            </span>
            <ElButton
              v-if="item.key !== 'email'"
              text
              type="primary"
              :icon="item.icon"
              @click="handleChange(item.key)"
            />
          </li>
        </ul>
      </div>
      <!-- 修改密码 -->
      <el-dialog
        v-model="passwordDialogFalg"
        :title="$t('account_changePassword')"
        :close-on-click-modal="false"
        width="600px"
      >
        <el-form ref="form" :model="pwd" :rules="rules" class="form">
          <el-form-item prop="oldPassword">
            <el-input
              v-model="pwd.oldPassword"
              :type="oldPasswordType"
              :placeholder="$t('account_currentPassword')"
              autocomplete="off"
            >
              <template #suffix>
                <i
                  :class="[
                    'iconfont',
                    oldFlag ? 'icon-openeye' : 'icon-closeeye',
                  ]"
                  autocomplete="auto"
                  class="eye"
                  @click="changeEye('old')"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input
              v-model="pwd.newPassword"
              :type="newPasswordType"
              :placeholder="$t('account_newPassword')"
              autocomplete="off"
            >
              <template #suffix>
                <i
                  :class="[
                    'iconfont',
                    newFlag ? 'icon-openeye' : 'icon-closeeye',
                  ]"
                  autocomplete="auto"
                  class="eye"
                  @click="changeEye('new')"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="comfirmPassword">
            <el-input
              v-model="pwd.comfirmPassword"
              :type="comfirmPasswordType"
              :placeholder="$t('account_confirmPassword')"
              autocomplete="off"
            >
              <template #suffix>
                <i
                  :class="[
                    'iconfont',
                    comfirFlag ? 'icon-openeye' : 'icon-closeeye',
                  ]"
                  autocomplete="auto"
                  class="eye"
                  @click="changeEye()"
                />
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="save">{{
              $t('public_button_save')
            }}</el-button>
          </div>
        </template>
      </el-dialog>
      <!-- 修改邮箱 -->
      <el-dialog
        v-model="emailDialogFalg"
        :title="$t('account_changeEmail')"
        :close-on-click-modal="false"
        width="600px"
      >
        <el-form :model="form" class="form">
          <el-form-item>
            <el-input
              v-model="form.newEmail"
              :placeholder="$t('account_enterMailbox')"
              autocomplete="off"
              min
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              :placeholder="$t('account_enterNewMailbox')"
              autocomplete="off"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="send">{{
              $t('account_sendEmail')
            }}</el-button>
          </div>
        </template>
      </el-dialog>
      <!-- 用户名称 -->
      <el-dialog
        v-model="usernameDialogFalg"
        :title="$t('account_changeUsername')"
        :close-on-click-modal="false"
        width="600px"
      >
        <el-form class="form">
          <el-form-item>
            <el-input
              v-model="userName"
              :placeholder="$t('account_newUsername')"
              maxlength="100"
              show-word-limit
              autocomplete="off"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="confirm">{{
              $t('public_button_save')
            }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
$unreadColor: #ee5353;
// .settingCenter{/*// 	height: 100%;*//*// 	font-size: 12px;*//*// 	.setting-main {*/
// 		display: flex;/*// 		justify-content: space-between;*//*// 		height: 100%;*/
.account {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  .title {
    padding-bottom: 20px;
    font-size: 14px;
    color: var(--text-dark);
    font-weight: bold;
  }
  .content {
    width: 600px;
    li {
      display: flex;
      padding: 20px 0;
      .label {
        width: 80px;
      }
      .text {
        width: 400px;
      }

      :deep(.el-button.el-button--text) {
        padding: 0;
      }

      i {
        cursor: pointer;
      }
      .rotateActive {
        transform: rotate(-360deg);
        transition: all 1s;
      }
      .backActive {
        transition: all 1s;
      }
    }
  }
}
</style>

<style lang="scss">
.account {
  .form {
    .eye {
      cursor: pointer;
      font-size: 18px;
    }
    // .el-input__inner {
    //   border: 0;
    //   border-radius: 0;
    //   border-bottom: 1px solid #d9d9d9;
    // }
  }
}
</style>
