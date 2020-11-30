<template>
	<section class="page-sign-in">
		<Header></Header>
		<!-- <header>
			<div class="logo">
				<img :src="logoUrl" />
				<div v-if="showLang === 'false'"></div>
				<div class="switch-lang" v-else>
					<span
						v-for="(value, key) in languages"
						:key="key"
						:class="{ bold: key === lang }"
						@click="langChange(key)"
					>
						{{ value }}
					</span>
				</div>
			</div>
			<div class="slogan">{{ $t('app.signIn.slogan') }}</div>
		</header> -->
		<main>
			<div class="body" :class="{ dk: platform === 'DK' }">
				<div class="dk-login-cover">
					<img src="static/image/loginCover_dk.png" />
				</div>
				<div class="carousel">
					<img src="static/image/loginCover.png" />
				</div>
				<el-card class="sign-in-panel">
					<div class="title">
						{{ $t('app.signIn.signIn') }}
						<span @click="registry" v-if="buildProfile === 'CLOUD'">{{
							$t('app.signIn.Registration')
						}}</span>
					</div>
					<div class="error-tips" v-show="errorMessage">
						<i class="el-icon-warning-outline"></i>
						{{ errorMessage }}
					</div>
					<form>
						<input
							class="input"
							type="email"
							autocomplete="username"
							:placeholder="$t('app.signIn.email_placeholder')"
							v-model="form.email"
						/>
						<input
							class="input"
							type="password"
							autocomplete="current-password"
							:placeholder="$t('app.signIn.password_placeholder')"
							v-model="form.password"
							@keyup.enter="submit"
						/>
					</form>
					<el-checkbox class="keep-sign-in" v-model="keepSignIn">
						{{ $t('app.signIn.keepSignIn') }}
					</el-checkbox>
					<el-button class="btn-sign-in" type="primary" size="medium" :loading="loading" @click="submit">
						{{ $t('app.signIn.signIn') }}
					</el-button>

					<div class="remember">
						<span @click="forgetPassword">{{ $t('app.signIn.forgetPassword') }}</span>
					</div>
				</el-card>
			</div>
		</main>
	</section>
</template>

<script>
import { setPermission } from '@/util/util';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import Header from './component/header';
import _ from 'lodash';

const Languages = {
	sc: '中文 (简)',
	en: 'English',
	tc: '中文 (繁)'
};
export default {
	name: 'SignIn',
	components: { Header },
	data() {
		return {
			logoUrl: window.location.href,
			showLang: window._TAPDATA_OPTIONS_.showLang,
			platform: window._TAPDATA_OPTIONS_.platform,
			loading: false,
			languages: Languages,
			lang: localStorage.getItem('tapdata_localize_lang') || 'en',
			form: {
				email: '',
				password: ''
			},
			keepSignIn: true,
			errorMessage: '',
			buildProfile: ''
		};
	},
	created() {
		this.handleDaas();
	},
	methods: {
		langChange(lang) {
			localStorage.setItem('tapdata_localize_lang', lang);
			location.reload();
		},
		async submit() {
			let form = this.form;
			let oldPassword = _.clone(this.form.password);
			let message = '';
			if (!form.email || !form.email.trim()) {
				message = this.$t('app.signIn.email_require');
				// eslint-disable-next-line
			} else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
				message = this.$t('app.signIn.email_invalid');
			} else if (!form.password || form.password.length < 5) {
				message = this.$t('app.signIn.password_invalid');
			}
			if (message) {
				this.errorMessage = message;
				return;
			}
			this.loading = true;
			try {
				let usersModel = this.$api('users');
				let timeStamp = this.$api('TimeStamp');
				let rolesModel = this.$api('role');
				let roleMappingsModel = this.$api('roleMapping');
				//登陆密码加密
				let timeStampData = await timeStamp.get();
				this.form['stime'] = timeStampData.data;
				this.form.password = CryptoJS.RC4.encrypt(this.form.password, 'Gotapd8').toString();
				let Str = this.form.email + this.form.password + this.form.stime + 'Gotapd8';
				this.form['sign'] = crypto
					.createHash('sha1')
					.update(Str)
					.digest('hex')
					.toUpperCase();
				let { data } = await usersModel.login(this.form);
				if (!data.permissions) {
					this.loading = false;
					this.form.password = oldPassword;
					return;
				}
				if (data.textStatus === 'WAITING_APPROVE') {
					this.errorMessage = this.$t('app.signIn.account_waiting_approve');
					return;
				}
				if (data.textStatus === 'ACCOUNT_DISABLED') {
					this.errorMessage = this.$t('app.signIn.account_disabled');
					return;
				}
				if (!data.permissions || data.permissions.length === 0) {
					this.errorMessage = this.$t('app.signIn.permission_denied');
					return;
				}
				setPermission(data.permissions);
				let user = await usersModel.getUserById(`/${data.userId}?access_token=${data.id}`);
				this.$cookie.set('email', this.form.email);
				this.$cookie.set('username', user.data.username || '');
				this.$cookie.set('login', 1);
				this.$cookie.set('token', data.id);
				this.$cookie.set('isAdmin', parseInt(user.data.role) || 0);
				this.$cookie.set('user_id', data.userId);

				let roleMapping = {
					filter: {
						where: { principalType: 'USER', principalId: data.userId }
					}
				};

				let rolesMappingresulte = await roleMappingsModel.get(roleMapping);

				let roleId = [];
				if (rolesMappingresulte.data && rolesMappingresulte.data.length) {
					rolesMappingresulte.data.forEach(item => {
						roleId.push(item.roleId);
					});
				}

				// 角色权限
				let roleparmas = {
					filter: {
						where: {
							id: {
								inq: roleId
							},
							read_only: true
						}
					}
				};
				// TODO 暂时方案,当有只读角色时,就只能查看,不能做其他人任何操作
				let rolesresulte = await rolesModel.get(roleparmas);
				if (rolesresulte.data && rolesresulte.data.length) {
					localStorage.setItem('BTN_AUTHS', 'BTN_AUTHS');
					this.$cookie.set('isReadonly', 'true');
				} else {
					localStorage.setItem('BTN_AUTHS', '');
				}

				this.$router.replace({
					name: 'dashboard'
				});

				// setTimeout(() => {
				// 	location.reload();
				// }, 500);
			} catch (e) {
				this.errorMessage = this.$t('app.signIn.signInFail');
				this.loading = false;
				this.form.password = oldPassword;
			}
		},
		// 注册账号
		registry() {
			this.$router.push({
				name: 'registry'
			});
			// this.$router.push({ name: 'verificationEmail' }).catch(err => {
			// 	console.log('all good', err);
			// });
		},

		// 忘记密码
		forgetPassword() {
			this.$router.push({ name: 'passwordReset' });
		},

		// 获取是否是企业版
		handleDaas() {
			const Setting = this.$api('Setting');
			let where = {
				filter: {
					where: {
						id: '33'
					}
				}
			};
			Setting.get(where).then(res => {
				if (res.data && res.data.length) {
					this.buildProfile = res.data[0].value;
					localStorage.setItem('buildProfile', res.data[0].value);
				}
			});
		}
	}
};
</script>

<style lang="less" scoped>
.page-sign-in {
	background: #fafafa;
	height: 100%;
	overflow: auto;
	box-sizing: border-box;

	main .body.dk {
		display: flex;
		justify-content: center;
		height: 510px;
		.carousel {
			display: none;
		}
		.dk-login-cover {
			display: block;
			position: relative;
			img {
				display: block;
			}
		}
		.sign-in-panel {
			position: relative;
			right: 0;
			top: 0;
		}
	}
	main {
		position: relative;
		margin-top: 60px;
		.body {
			margin: 0 auto;
			position: relative;
			height: 600px;
			width: 1400px;
			box-sizing: border-box;
			.dk-login-cover {
				display: none;
			}
			.carousel {
				position: absolute;
				top: 0;
				left: 80px;
			}
		}
		.sign-in-panel {
			position: absolute;
			top: 60px;
			right: 80px;
			padding: 25px 5px;
			width: 400px;
			.title {
				margin-bottom: 30px;
				font-size: 26px;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
				span {
					float: right;
					padding-top: 16px;
					font-size: 12px;
					text-align: right;
					color: #48b6e2;
					cursor: pointer;
				}
			}
			.error-tips {
				margin-bottom: 22px;
				padding: 0 15px;
				height: 42px;
				line-height: 42px;
				background: rgba(254, 240, 240, 1);
				border: 1px solid rgba(245, 108, 108, 0.44);
				border-radius: 3px;
				font-size: 14px;
				color: rgba(245, 108, 108, 1);
			}
			form {
				border-radius: 4px;
				overflow: hidden;
				border: 1px solid #dedee4;
				.input {
					display: block;
					padding: 15px;
					width: 100%;
					height: 44px;
					color: #606266;
					line-height: 44px;
					border-radius: 0;
					box-sizing: border-box;
					border: none;
					outline: none;
					font-size: 14px;
					font-family: inherit;
					&:last-child {
						border-top: 1px solid #dedee4;
					}
					&::placeholder {
						font-size: 14px;
						color: rgba(204, 204, 204, 1);
					}
				}
			}
			.keep-sign-in {
				margin-top: 15px;
				font-size: 14px;
				color: rgba(153, 153, 153, 1);
			}
			.btn-sign-in {
				display: block;
				width: 100%;
				margin-top: 50px;
			}
			.remember {
				padding-top: 16px;
				font-size: 12px;
				color: #48b6e2;
				span {
					cursor: pointer;
				}
			}
		}
	}
}
</style>
