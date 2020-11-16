<template>
	<section class="page-registry_status">
		<Header></Header>
		<main>
			<div class="email-main">
				<div class="image iconfont icon-fasongyoujian"></div>
				<div class="text">
					<p>
						{{ $t('app.signIn.account') }}<i>{{ email }}</i
						>{{
							type === 'reset'
								? $t('app.signIn.resetConnectionFailed')
								: $t('app.signIn.connectionFailed')
						}}
					</p>
					<div style="font-size: 12px;">
						{{ $t('app.signIn.clickText')
						}}<span @click="send"
							>{{ $t('app.signIn.resend') }} <i v-if="time > 0">({{ time }})，</i></span
						>
						{{ $t('app.signIn.confirmEmail')
						}}<span @click="backRegisty">{{
							type === 'reset' ? $t('app.signIn.modifyPassword') : $t('app.signIn.registered')
						}}</span>
					</div>
					<!-- <div>
						{{ $t('app.signIn.receiveEmail') }}
						<span @click="send"
							>{{ $t('app.signIn.resend') }} <i v-if="time > 0">({{ time }})</i>,</span
						>
						{{ $t('app.signIn.orClick') }}
						<span @click="backLogin">{{ $t('app.signIn.signIn') }}</span>
					</div> -->
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
			type: 'reset',
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

		// 返回注册或返回修改密码
		backRegisty() {
			if (this.type === 'reset') {
				this.$router.push({
					path: '/passwordReset'
				});
			} else {
				this.$router.push({
					path: '/registry'
				});
			}
		}
	}
};
</script>

<style lang="less" scoped>
.page-registry_status {
	background: #fafafa;
	height: 100%;
	overflow: auto;
	box-sizing: border-box;

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
				text-align: center;
				p {
					text-align: left;
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
				.btn {
					margin-top: 60px;
				}
			}
		}
	}
}
</style>
