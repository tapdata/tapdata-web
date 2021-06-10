<template>
	<div class="notice fs-8">
		<div class="notice-header p-6">
			<div class="notice-header__title fw-bolder fs-7">
				<span>新手必看 ！如何玩转 Tapdata Cloud 数据同步功能</span>
			</div>
			<div class="notice-header__time mt-5 ml-1 flex align-center">
				<img src="../../assets/image/logoIconColour.png" alt="" />
				<span class="ml-5 mr-4">Cloud@Tapdata</span>
				<span>2021-05-28</span>
			</div>
		</div>
		<div class="notice-body mt-6 p-6">
			<div class="notice-body__content">
				<div class="notice-body__step mb-4">
					<div>
						Tapdata Cloud 是 Tapdata 的云版产品，提供安全、简单、永久免费的数据同步服务。
					</div>
					<div>
						近期，Tapdata Cloud 推出1.0 版本，接下来小助手带大家一起来看下如何玩转 Tapdata Cloud 数据同步功能吧！
					</div>
					<div class="fw-bolder fs-7">三步快速完成数据同步</div>
					<div>
						无论您是想实现数据库架构现代化，还是想实现零停机数据迁移，亦或是实现数据异地灾备及异地多活等，使用 Tapdata
						Cloud 来搭配您的数据架构设计，只需3步帮您快速完成数据同步！
					</div>
					<div class="fw-bolder fs-7">第一步：部署Agent</div>
					<div>
						实例Agent是 Tapdata Cloud
						最重要的组成部分，用户所有的同步任务都依赖于实例来进行。通过实例管理对Agent进行安装、启动、暂停和状态管理等操作。
					</div>
					<div class="fw-bolder fs-7">第二步：创建连接</div>
					<div>
						建立Agent与用户源数据库和目标数据库的连接。通过连接管理对用户添加的所有数据连接进行管理，主要包括创建连接、连接测试、编辑连接、复制连接、查询连接和删除连接等功能。
					</div>
					<div class="fw-bolder fs-7">第三步：创建任务</div>
					<div>
						创建同步任务并对同步任务进行管理，主要包括创建任务、启动任务、任务监控、任务编辑、复制、重置、删除等操作。
					</div>
					<!--				<div>本版本支持的数据源类型及版本：</div>-->
				</div>
				<div class="notice-body__intro">
					<div class="fw-bolder fs-7">Tapdata 工作台介绍</div>
					<div>
						工作台主要帮助用户快速了解和熟悉产品，并可以通过快速创建入口部署Agent、连接和任务。
					</div>
					<div class="notice-body__intro-img py-1">
						<img src="../../../public/images/workbench/workbench.png" alt="" />
					</div>
					<div class="fw-bolder fs-7">用户引导</div>
					<div>
						点击 Tapdata Cloud 工作台中的【开启引导】可以进入用户引导页面，按照步骤说明学会使用 Tapdata Cloud。
					</div>
					<div class="fw-bolder fs-7">快捷入口</div>
					<div>部署Agent：一键进入Agent创建页面，开始部署Agent</div>
					<div>创建连接：一键进入连接创建页面，开始创建连接</div>
					<div>
						创建任务：一键进入任务创建页面，开始创建同步任务创建任务：一键进入任务创建页面，开始创建同步任务
					</div>
					<div class="fw-bolder fs-7">公告通知</div>
					<div>
						展示最新的公告信息，包括升级变更提醒、版本新特性介绍等内容，点击公告标题可以查看公告详细内容。
					</div>
					<div class="fw-bolder fs-7">文档快速入口</div>
					<div>点击入口可以快速查看产品介绍文档和产品使用手册。</div>
					<div class="fw-bolder fs-7">文档中心</div>
					<div>
						在文档中心，您可以找到 Tapdata Cloud 相关的文档和资源，帮助您更好地理解和使用我们的产品。
					</div>
					<div class="fw-bolder fs-7">社区</div>
					<div>
						Tapdata Ask 提供 Tapdata Cloud
						问答交流，您在使用产品的过程中遇到什么问题，可以点击“社区”提出您的问题，Tapdata
						的技术人员将会不定期上问答社区看是否能为您提供帮助。同时欢迎您为其它朋友答疑解惑！
					</div>
					<div>
						Tapdata Ask 入口：
						<ElLink class="logo" type="primary" href="https://ask.tapdata.net/" target="_blank"
							>https://ask.tapdata.net/</ElLink
						>
					</div>
					<div>
						您还可以在 Tapdata Ask 反馈我们产品的一些问题，提供优质的反馈将有机会获取 Tapdata 周边礼品，例如
						签字笔，U盘等。
					</div>
					<div>
						如果您有比较紧急的问题，或者比较深入的交流反馈，也可以添加我们用户支持同学的企业微信，联系我们。
					</div>
					<div class="QR-code">
						<img src="../../assets/image/LarkQR.jpeg" alt="" />
					</div>
					<div class="fw-bolder">
						感谢您对 Tapdata Cloud 的支持，我们一起努力让数据同步变得更加简单高效！
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Notice'
}
</script>

<style lang="scss" scoped>
.notice {
}
.notice-header {
	background: url('../../../public/images/workbench/notice_title.png') no-repeat 100% / cover;
	.notice-header__title {
	}
	.notice-header__time {
		color: rgba(0, 0, 0, 0.49);
		> img {
			width: 22px;
			height: 22px;
		}
	}
}
.notice-body {
	background: #fff;
	.notice-body__step {
		border-bottom: 1px solid #f2f2f2;
		> div {
			margin-bottom: 16px;
			line-height: 17px;
		}
	}
	.notice-body__intro {
		> div {
			margin-bottom: 16px;
			line-height: 17px;
		}
	}
	.notice-body__intro-img {
		> img {
			width: 60%;
			max-width: 1100px;
			min-width: 667px;
		}
	}
	.QR-code {
		> img {
			width: 164px;
		}
	}
}
</style>
