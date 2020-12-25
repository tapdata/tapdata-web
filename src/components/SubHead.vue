<template>
	<header class="head-wrap">
		<div class="tittle">
			{{ tittle }}
		</div>
		<div class="desc">
			{{ description }}
		</div>
	</header>
</template>

<script>
export default {
	name: 'SubHead',
	props: {
		tittle: {
			required: true,
			value: String
		},
		description: {
			required: true,
			value: String
		}
	}
};
</script>

<style scoped lang="less">
.head-wrap {
	padding-bottom: 30px;
	padding-left: 10px;
	background: #ffffff;
	border-bottom: 1px solid #dedee4;
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.08);
	.tittle {
		height: 17px;
		margin-top: 15px;
		font-size: 16px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #111111;
	}
	.desc {
		width: 85%;
		height: 14px;
		margin-top: 10px;
		font-size: 12px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #999999;
	}
}
</style>
