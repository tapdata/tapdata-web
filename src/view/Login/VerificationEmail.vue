<template>
	<section class="page-registry_email" v-loading="loading">
		<Header></Header>
		<main>
			<div class="email-main">
				<div class="image iconfont icon-fasongyoujian"></div>
				<div class="text">
					<p>
						{{ type === 'reset' ? $t('app.signIn.passwordResetText') : $t('app.signIn.confirmationEmail') }}
						<i>{{ email }}</i>
					</p>
					<p>{{ $t('app.signIn.mailbox') }}</p>
					<div>
						{{ $t('app.signIn.receiveEmail') }}
						<span @click="resetSend" :class="{ noClick: time > 0 }" v-if="type === 'reset'"
							>{{ $t('app.signIn.resend') }} <i v-if="time > 0">({{ time }}s)</i></span
						>
						<span @click="send" :class="{ noClick: time > 0 }" v-else
							>{{ $t('app.signIn.resend') }} <i v-if="time > 0">({{ time }}s)</i></span
						>,

						{{ $t('app.signIn.orClick') }}
						<span @click="backLogin">{{ $t('app.signIn.signIn') }}</span>
					</div>
				</div>
			</div>
		</main>
	</section>
</template>

<script>
import Header from './component/header';
import factory from '@/api/factory';
const usersModel = factory('users');

export default {
	name: 'SignIn',
	components: { Header },
	data() {
		return {
			type: 'reset',
			loading: false,
			flag: false,
			email: '',
			password: '',
			timer: null,
			time: 0,
			form: null
		};
	},

	created() {
		if (this.$route.params) {
			this.form = this.$route.params.data;
			this.email = this.form.email;
			this.type = this.$route.params.type ? this.$route.params.type : '';
		}
	},

	methods: {
		langChange(lang) {
			localStorage.setItem('tapdata_localize_lang', lang);
			location.reload();
		},

		// 重新发送
		async send() {
			const TIME_COUNT = 60;
			// this.loading = true;
			if (!this.timer) {
				try {
					this.time = TIME_COUNT;
					this.$cookie.set('location_origin', window.location.origin);

					this.timer = setInterval(() => {
						if (this.time > 0 && this.time <= TIME_COUNT) {
							this.time--;
						} else {
							this.time = 0;
							clearInterval(this.timer);
							this.timer = null;
						}
					}, 1000);
					await usersModel.sendVerifyEmail({
						email: this.email
					});
				} catch (e) {
					if (e.response && e.response.msg) {
						if (e.response.msg.indexOf('Email already exists')) {
							this.$message.error(this.$t('app.signIn.email_existed'));
						} else {
							this.$message.error(`${e.response.msg}`);
						}
					}
					clearInterval(this.timer);
					this.timer = null;
					// this.loading = false;
				}
			}
			// this.loading = false;
		},

		// 重置密码重新发送
		async resetSend() {
			const TIME_COUNT = 60;
			// this.loading = true;
			if (!this.timer) {
				this.time = TIME_COUNT;
				this.$cookie.set('location_origin', window.location.origin);
				this.timer = setInterval(() => {
					if (this.time > 0 && this.time <= TIME_COUNT) {
						this.time--;
					} else {
						this.time = 0;
						clearInterval(this.timer);
						this.timer = null;
					}
				}, 1000);
				await usersModel.reset(this.form);
			}
		},

		// 邮件跳转登录
		backLogin() {
			this.$router.push({
				path: '/login',
				query: { email: this.email }
			});
		}
	},

	destroyed() {
		clearInterval(this.timer);
		this.timer = null;
	}
};
</script>

<style lang="less" scoped>
.page-registry_email {
	background: #fafafa;
	height: 100%;
	overflow: auto;
	box-sizing: border-box;
	header {
		padding: 70px 80px 0 80px;
		margin: 0 auto;
		user-select: none;
		min-width: 1400px;
		box-sizing: border-box;
		.logo {
			display: flex;
			align-items: center;
			justify-content: space-between;
			img {
				display: block;
				width: 144px;
			}
			.switch-lang {
				color: #dedee4;
				font-size: 16px;
				span {
					display: inline-block;
					padding: 0 10px;
					border-left: 1px solid #333333;
					box-sizing: border-box;
					height: 18px;
					line-height: 18px;
					cursor: pointer;
					&:first-child {
						border: none;
					}
					&:hover {
						color: #333;
					}
				}
				.bold {
					color: #333333;
					font-weight: 500;
				}
			}
		}
		.slogan {
			margin-top: 8px;
			height: 15px;
			line-height: 15px;
			font-size: 14px;
			color: rgba(153, 153, 153, 1);
		}
	}

	main {
		position: relative;
		margin-top: 100px;
		.email-main {
			display: flex;
			flex-direction: row;
			width: 500px;
			height: 150px;
			margin: 0 auto;
			text-align: left;
			.image {
				padding: 2px 20px 0 0;
				font-size: 30px;
				color: #48b6e2;
			}
			.text {
				font-size: 14px;
				color: #666;
				p {
					font-size: 18px;
					user-select: none;
					padding-bottom: 6px;
					i {
						color: #48b6e2;
					}
				}
				div {
					padding-top: 20px;
					span {
						color: #48b6e2;
						cursor: pointer;
						i {
							color: #666;
						}
					}
					.noClick {
						cursor: default;
					}
				}
			}
		}
	}
}
</style>
