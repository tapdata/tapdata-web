<template>
	<section class="error-page-wrap" :class="[{ 'error-page-purchase': $route.meta.isPurchase }]">
		<TheHeader></TheHeader>
		<div class="header">{{ 'Tapdata Cloud' }}</div>
		<div class="body">
			<div v-if="$route.path === '/500'" class="box">
				<img class="img" src="../assets/icons/500.png" />
				<p class="text">{{ $route.query.message || '服务器内部错误！' }}</p>
				<ElButton class="mt-5" type="primary" @click="toHome()">返回首页</ElButton>
			</div>
			<div v-if="$route.path === '/invalid'" class="box">
				<img class="img" src="../assets/icons/invalid.png" />
				<p class="text">账户暂无权限！您的账户权限不足，无法订购产品，请联系客户经理或客服人员：4001100868</p>
				<ElButton class="mt-5" type="primary" @click="toHome()">返回首页</ElButton>
			</div>
			<div v-if="$route.path === '/freeze'" class="box">
				<img class="img" src="../assets/icons/freeze.png" />
				<p class="label">账户已被冻结</p>
				<p class="text">您的账户已被暂停，无法订购产品，请及时充值或联系客户经理。</p>
				<ElButton class="mt-5" type="primary" @click="toHome()">返回首页</ElButton>
			</div>
			<div v-if="$route.path === '/off'" class="box">
				<img class="img" src="../assets/image/off_shelf.png" />
				<p class="label">产品已下架</p>
				<p class="text">非常抱歉，产品已下架</p>
				<ElButton class="mt-5" type="primary" @click="toHome()">返回首页</ElButton>
			</div>
		</div>
	</section>
</template>

<script>
import TheHeader from '@/components/TheHeader'

export default {
	components: {
		TheHeader
	},
	methods: {
		toHome() {
			location.href = process.env.VUE_APP_BASE_URL + '/'
		}
	}
}
</script>

<style lang="scss" scoped>
.error-page-purchase {
	padding: 0;
}
.error-page-wrap {
	padding-top: 68px;
	height: 100%;
	display: flex;
	flex-direction: column;
	min-height: 600px;
	min-width: 800px;
	overflow: auto;
	.header {
		padding: 0 20px;
		line-height: 60px;
		background: #fff;
		font-size: 14px;
		font-weight: 700;
	}
	.body {
		flex: 1;
		position: relative;
		margin: 20px;
		border-radius: 2px;
		background: #fff;
		overflow: hidden;
		.box {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
		}
		.img {
			margin: 0 auto;
			display: block;
			width: 400px;
			height: 171px;
			object-fit: contain;
		}
		.label {
			margin-top: 12px;
			font-size: 18px;
			color: #333;
		}
		.text {
			margin-top: 10px;
			font-size: 14px;
			color: map-get($fontColor, light);
		}
	}
}
</style>
