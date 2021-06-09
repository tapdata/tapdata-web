<template>
	<section class="result-wrap">
		<Header :action="result.action"></Header>
		<div class="main">
			<img class="result-img" :src="imgUrl" />
			<div class="result-text" v-if="!result.successTitle">
				{{ resultInfo.name }}{{ resultInfo.oper }}{{ isSuccess ? '成功' : '失败' }}
			</div>
			<div class="result-text" v-else>{{ result.successTitle }}</div>
			<div class="result-tips">{{ result.tips }}</div>
			<div class="buttons" v-if="isSuccess">
				<ElButton @click="toOrder">查看订单</ElButton>
				<ElButton type="primary" @click="toDashboard">管理控制台</ElButton>
			</div>
			<div class="buttons" v-else>
				<ElButton @click="toDashboard">管理控制台</ElButton>
				<ElButton type="primary" @click="toPurchase()">重新{{ resultInfo.oper }}</ElButton>
			</div>
		</div>
	</section>
</template>
<script>
import Header from './Header'
import successImg from '../../assets/icons/success.svg'
import failImg from '../../assets/icons/fail.svg'
import waitImg from '../../assets/icons/wait.svg'
export default {
	components: {
		Header
	},
	data() {
		return {
			type: 'Purchase',
			result: {},
			map: {
				Purchase: {
					name: '实例',
					oper: '订购'
				},
				Modify: {
					name: '规格',
					oper: '变更'
				},
				Renew: {
					name: '',
					oper: '续订'
				}
			}
		}
	},
	created() {
		let result = sessionStorage.getItem('result')
		if (result) {
			result = JSON.parse(result)
			if (result.isPrepay) {
				let query = this.$route.query
				if (query.is_success === 'T') {
					result.type = 'success'
				} else {
					result.type = 'fail'
					result.tips = '失败原因：支付失败'
				}
			}
			this.result = result
		}
	},
	computed: {
		imgUrl() {
			return this.isSuccess ? (this.result.successTitle ? waitImg : successImg) : failImg
		},
		isSuccess() {
			return this.result.type === 'success'
		},
		resultInfo() {
			return this.map[this.result.action] || {}
		}
	},
	methods: {
		toDashboard() {
			location.href = process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CONSOLE_PATH
		},
		toOrder() {
			let orderId = this.result.orderId
			if (orderId) {
				window.open(process.env.VUE_APP_BASE_URL + `/usercenter/mop/order/orderdetail/${orderId}`, '_blank')
			} else {
				this.$message.warning('订单创建中，请稍后再试')
			}
		},
		toPurchase() {
			let id = this.result.id
			let map = {
				Purchase: '',
				Modify: 'modify/' + id,
				Renew: 'renew/' + id
			}
			location.href = process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PURCHASE_PATH + '#/' + map[this.result.action]
		}
	}
}
</script>
<style lang="scss" scoped>
.result-wrap {
	height: 100%;
	padding-bottom: 100px;
	.main {
		margin: 20px;
		height: calc(100% - 100px);
		border-radius: 2px;
		background: #fff;
		overflow: hidden;
		text-align: center;
		.result-img {
			display: block;
			margin: 68px auto 0 auto;
			width: 48px;
			height: 48px;
		}
		.result-text {
			margin-top: 15px;
			font-size: 20px;
			color: map-get($fontColor, normal);
		}
		.result-tips {
			margin-top: 20px;
			color: map-get($fontColor, slight);
		}
		.buttons {
			margin-top: 20px;
		}
	}
}
</style>
