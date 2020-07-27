<template>
	<el-card class="customer-service-wrap" v-if="value">
		<header>
			<span>{{ $t('app.qa') }}</span>
			<i class="btn-close el-icon-close" @click="close"></i>
		</header>
		<main>
			<div class="panel">
				<div class="title">{{ $t('app.customerService.technicalSupport') }}</div>
				<div class="content">
					<span>{{ $t('app.customerService.technicalSupportText') }}</span>
					<a class="btn" target="_blank" href="https://tapdata.net/forums/forum/user-support/">
						{{ $t('app.customerService.userSupport') }}
					</a>
					<span>{{ $t('app.customerService.technicalSupportText1') }}</span>
				</div>
			</div>
			<div class="panel">
				<div class="title">{{ $t('app.customerService.otherDmands') }}</div>
				<div class="content">
					<span>{{ $t('app.customerService.otherDmandsText') }}</span>
					<a class="btn" @click="openCrisp">Crisp</a>
					<span>{{ $t('app.customerService.otherDmandsText1') }}</span>
				</div>
			</div>
			<div class="panel">
				<img src="/static/image/tapdateQR.png" class="code" />
			</div>
		</main>
	</el-card>
</template>

<script>
export default {
	name: 'CustomerService',
	props: {
		value: Boolean
	},
	methods: {
		openCrisp() {
			if (!window.$crisp.is('chat:opened')) {
				window.$crisp.do('chat:show');
				window.$crisp.do('chat:toggle');
			} else {
				window.$crisp.do('chat:hide');
			}
		},
		close() {
			this.$emit('input', false);
			window.$crisp.do('chat:hide');
		}
	}
};
</script>
<style>
.crisp-client .crisp-1rjpbb7 .crisp-1rf4xdh .crisp-kquevr .crisp-x94m06 {
	width: 45px !important;
	height: 45px !important;
}
.crisp-client
	.crisp-1rjpbb7[data-last-operator-face='false']
	.crisp-1rf4xdh
	.crisp-kquevr
	.crisp-x94m06
	.crisp-16qgsyi
	.crisp-101bp3x[data-is-ongoing='false'] {
	width: 28px !important;
	height: 23px !important;
	top: 12px !important;
	left: 9px !important;
}
.customer-service-wrap .el-card__body {
	padding: 0;
}
</style>
<style lang="less" scoped>
.customer-service-wrap {
	position: fixed;
	bottom: 0;
	right: 0;
	z-index: 100;
	width: 360px;
	height: 540px;
	color: #333;
	font-size: 14px;
	header {
		position: relative;
		text-align: center;
		background: #f2f2f2;
		height: 50px;
		line-height: 50px;
		font-weight: bold;
		.btn-close {
			position: absolute;
			right: 15px;
			top: 50%;
			transform: translate(0, -50%);
			font-size: 16px;
			cursor: pointer;
		}
	}
	main {
		.panel {
			padding: 15px;
			.title {
				margin-bottom: 15px;
				font-weight: bold;
			}
			.content .btn {
				color: #1976d2;
				cursor: pointer;
			}
			.code {
				display: block;
				width: 200px;
				height: 200px;
				margin: 0 auto;
				object-fit: contain;
			}
		}
	}
}
</style>
