<template>
	<section class="page-registry_email">
		<Header></Header>
		<main>
			<div class="email-main">
				<div class="image iconfont icon-fasongyoujian"></div>
				<div class="text">
					<p>
						{{ $t('app.signIn.confirmationEmail') }}
						<i>{{ email }}</i>
					</p>
					<p>{{ $t('app.signIn.mailbox') }}</p>
					<div>
						{{ $t('app.signIn.receiveEmail') }}
						<span @click="send"
							>{{ $t('app.signIn.resend') }} <i v-if="time > 0">({{ time }})</i>,</span
						>
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

export default {
	name: 'SignIn',
	components: { Header },
	data() {
		return {
			platform: window._TAPDATA_OPTIONS_.platform,
			loading: false,
			flag: false,
			email: this.$route.params.email ? this.$route.params.email : '',
			password: this.$route.params.password ? this.$route.params.password : '',
			timer: null,
			time: 0
		};
	},

	methods: {
		langChange(lang) {
			localStorage.setItem('tapdata_localize_lang', lang);
			location.reload();
		},

		// 重新发送
		async send() {
			const TIME_COUNT = 60;
			if (!this.timer) {
				this.time = TIME_COUNT;
				let usersModel = this.$api('users');
				await usersModel.post({ email: this.email, password: this.password });
				this.timer = setInterval(() => {
					if (this.time > 0 && this.time <= TIME_COUNT) {
						this.time--;
					} else {
						this.time = 0;
						clearInterval(this.timer);
						this.timer = null;
					}
				}, 1000);
			}
		},

		// 邮件跳转登录
		backLogin() {
			this.$router.push({
				path: '/login'
			});
		}
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
			width: 600px;
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
					user-select: none;
					padding-bottom: 6px;
					i {
						color: #48b6e2;
					}
				}
				div {
					span {
						color: #48b6e2;
						cursor: pointer;
						i {
							color: #666;
						}
					}
				}
			}
		}
	}
}
</style>
