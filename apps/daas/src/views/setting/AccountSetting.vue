<template>
  <div class="account" v-loading="loading">
    <div class="setting-right">
      <div class="title">{{ $t('account.accountSettings') }}</div>
      <ul class="content">
        <li v-for="item in infoList" :key="item.key">
          <span class="label">{{ item.label }}</span>
          <span class="text"> {{ item.value }} </span>
          <ElButton type="text" v-if="item.key !== 'email'" @click="handleChange(item.key)">{{ item.icon }}</ElButton>
          <!-- <i
            :class="['iconfont', item.icon, rotateFlag && item.key == 'accessCode' ? 'rotateActive' : 'backActive']"
            v-if="item.key !== 'email'"
            @click="handleChange(item.key)"
          ></i> -->
        </li>
      </ul>
    </div>
    <!-- 修改密码 -->
    <el-dialog
      :title="$t('account.changePassword')"
      :visible.sync="passwordDialogFalg"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form :model="pwd" ref="form" :rules="rules" class="form">
        <el-form-item prop="oldPassword">
          <el-input
            :type="oldPasswordType"
            v-model="pwd.oldPassword"
            :placeholder="$t('account.currentPassword')"
            autocomplete="off"
          >
            <i
              slot="suffix"
              :class="['iconfont', oldFlag ? 'icon-openeye' : 'icon-closeeye']"
              autocomplete="auto"
              class="eye"
              @click="changeEye('old')"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="pwd.newPassword"
            :type="newPasswordType"
            :placeholder="$t('account.newPassword')"
            autocomplete="off"
          >
            <i
              slot="suffix"
              :class="['iconfont', newFlag ? 'icon-openeye' : 'icon-closeeye']"
              autocomplete="auto"
              class="eye"
              @click="changeEye('new')"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="comfirmPassword">
          <el-input
            v-model="pwd.comfirmPassword"
            :type="comfirmPasswordType"
            :placeholder="$t('account.confirmPassword')"
            autocomplete="off"
          >
            <i
              slot="suffix"
              :class="['iconfont', comfirFlag ? 'icon-openeye' : 'icon-closeeye']"
              autocomplete="auto"
              class="eye"
              @click="changeEye()"
            />
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="save">{{ $t('app.save') }}</el-button>
      </div>
    </el-dialog>
    <!-- 修改邮箱 -->
    <el-dialog
      :title="$t('account.changeEmail')"
      :visible.sync="emailDialogFalg"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form :model="form" class="form">
        <el-form-item>
          <el-input v-model="form.newEmail" :placeholder="$t('account.enterMailbox')" autocomplete="off" min></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" :placeholder="$t('account.enterNewMailbox')" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="send">{{ $t('account.sendEmail') }}</el-button>
      </div>
    </el-dialog>
    <!-- 用户名称 -->
    <el-dialog
      :title="$t('account.changeUsername')"
      :visible.sync="usernameDialogFalg"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form class="form">
        <el-form-item>
          <el-input
            v-model="userName"
            :placeholder="$t('account.newUsername')"
            maxlength="100"
            show-word-limit
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="confirm">{{ $t('dialog.downAgent.ok') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookie from '@tap/shared/src/cookie'
import { usersApi } from '@tap/api'

export default {
  name: 'list',
  data() {
    //此处即表单发送之前验证  验证新密码与原密码

    let validateNewPassword = (rule, value, callback) => {
      if (value === this.pwd.oldPassword) {
        callback(new Error(this.$t('account.samePawTip')))
      } else {
        callback()
      }
    }
    // 是否是中文
    let validateisCN = (rule, value, callback) => {
      const passwordReg = /[\s\u4E00-\u9FA5]/
      if (passwordReg.test(value)) {
        callback(new Error(this.$t('account.passwordNotCN')))
      } else {
        callback()
      }
    }
    //此处即表单发送之前验证  验证新密码与再次确认
    let validateNewPassword2 = (rule, value, callback) => {
      if (value !== this.pwd.newPassword) {
        callback(new Error(this.$t('account.newPawInconsistent')))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        newEmail: '',
        password: ''
      },
      pwd: {
        oldPassword: '',
        newPassword: '',
        comfirmPassword: ''
      },
      userName: '',
      infoList: [
        {
          label: this.$t('account.email'),
          value: '',
          key: 'email',
          icon: this.$t('button_revise')
        },
        {
          label: this.$t('account.userName'),
          value: '',
          key: 'username',
          icon: this.$t('button_revise')
        },
        {
          label: this.$t('account.password'),
          value: '******',
          key: 'password',
          icon: this.$t('button_revise')
        },
        {
          label: this.$t('account.accessCode'),
          value: '',
          key: 'accessCode',
          icon: this.$t('button_refresh')
        }
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
            message: this.$t('account.currentPassword'),
            trigger: 'blur'
          },
          {
            min: 5,
            message: this.$t('app.signIn.password_invalid'),
            trigger: 'blur'
          },
          {
            validator: validateisCN,
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('account.newPassword')
          },
          {
            validator: validateNewPassword,
            trigger: 'blur'
          },
          {
            min: 5,
            message: this.$t('app.signIn.password_invalid'),
            trigger: 'blur'
          },
          {
            validator: validateisCN,
            trigger: 'blur'
          }
        ],
        comfirmPassword: [
          {
            required: true,
            message: this.$t('account.confirmPassword'),
            trigger: 'blur'
          },
          {
            validator: validateNewPassword2,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.handleGetData()
  },
  methods: {
    // 获取当前信息
    async handleGetData() {
      this.loading = true
      let result = await usersApi.get([Cookie.get('user_id')])
      let items = result.data
      if (items) {
        this.infoList.forEach(item => {
          Object.keys(items).forEach(key => {
            if (item.key === key) {
              item.value = items[key]
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
        default:
          this.rotateFlag = !this.rotateFlag
          this.handleGetData()
          break
      }
    },

    // 修改用户名
    confirm() {
      let parmas = {
        id: Cookie.get('user_id'),
        username: this.userName
      }
      if (this.userName) {
        usersApi.patch(parmas).then(() => {
          this.$message.success(this.$t('account.nameModifySuccess'))
          this.usernameDialogFalg = false
          this.handleGetData()
        })
        // .catch(e => {
        //   if (e.response && e.response.msg) {
        //     if (e.response.msg.indexOf('User already exists')) {
        //       this.$message.error(this.$t('account.has_username'))
        //     } else {
        //       this.$message.error(this.$t('account.editFail'))
        //     }
        //   }
        // })
      } else {
        this.$message.error(this.$t('account.user_null'))
      }
    },

    // 保存密码
    save() {
      let parmas = {
        oldPassword: this.pwd.oldPassword,
        newPassword: this.pwd.newPassword
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          usersApi.changePassword(parmas).then(res => {
            if (res.msg === 'Invalid current password') {
              this.$message.error(this.$t('account.currerPawErrorTip'))
            }
            this.$message.success(this.$t('account.pawSaveSuccess'))
            this.passwordDialogFalg = false
            Cookie.remove('token')
            Cookie.remove('user_id')
            setTimeout(() => {
              location.reload()
            }, 500)
          })
          // .catch(e => {
          //   if (e.response && e.response.msg === 'Invalid current password') {
          //     this.$message.error(this.$t('account.currerPawErrorTip'))
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
    }
  }
}
</script>

<style scoped lang="scss">
$unreadColor: #ee5353;
// .settingCenter {
// 	height: 100%;
// 	font-size: 12px;
// 	.setting-main {
// 		display: flex;
// 		justify-content: space-between;
// 		height: 100%;
.account {
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 30px 0 0 20px;
  .title {
    padding-bottom: 20px;
    font-size: 14px;
    color: map-get($fontColor, dark);
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
      ::v-deep {
        .el-button.el-button--text {
          padding: 0;
        }
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
