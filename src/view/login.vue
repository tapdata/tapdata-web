<template>
	<section class="page-sign-in">
		<header>
			<div class="logo">
				<img src="http://photo.16pic.com/00/07/44/16pic_744551_b.jpg" />
				<div class="switch-lang">
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
			<div class="slogan">像自来水一样方便地使用您的数据</div>
		</header>
		<main>
			<div class="body">
				<el-card class="sign-in-panel">
					<div class="title">登录</div>
					<div class="error-tips" v-show="errorMessage">{{ errorMessage }}</div>
					<form>
						<input class="input" type="email" placeholder="请输入邮箱" v-model="form.email" />
						<input
							class="input"
							type="password"
							placeholder="密码"
							autocomplete="new-password"
							v-model="form.password"
						/>
					</form>
					<el-checkbox class="keep-sign-in" v-model="keepSignIn">保持登录状态</el-checkbox>
					<el-button class="btn-sign-in" type="primary" size="medium" @click="submit">登录</el-button>
				</el-card>
			</div>
		</main>
	</section>
</template>

<script>
const Languages = {
	sc: '中文 (简)',
	en: 'English',
	tc: '中文 (繁)'
};
export default {
	name: 'SignIn',
	data() {
		return {
			languages: Languages,
			lang: localStorage.getItem('tapdata_localize_lang') || 'sc',
			form: {
				email: '',
				password: ''
			},
			keepSignIn: false,
			errorMessage: ''
		};
	},
	methods: {
		langChange(lang) {
			localStorage.setItem('tapdata_localize_lang', lang);
			location.reload();
		},
		submit() {}
	}
};
</script>

<style lang="less" scoped>
.page-sign-in {
	background: #fafafa;
	height: 100%;
	header {
		padding: 70px 80px 0 80px;
		user-select: none;
		.logo {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 40px;
			img {
				display: block;
				width: 144px;
				height: 16px;
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
				}
			}
		}
		.slogan {
			margin-top: 3px;
			height: 15px;
			line-height: 15px;
			font-size: 14px;
			color: rgba(153, 153, 153, 1);
		}
	}
	main {
		margin-top: 60px;
		.body {
			margin: 0 auto;
			width: 1100px;
			position: relative;
			height: 600px;
		}
		.sign-in-panel {
			position: absolute;
			top: 60px;
			right: 0;
			padding: 25px 5px;
			width: 400px;
			.title {
				margin-bottom: 30px;
				font-size: 26px;
				font-weight: 500;
				color: rgba(51, 51, 51, 1);
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
		}
	}
}
</style>
