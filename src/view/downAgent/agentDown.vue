<template>
	<div class="agentDown">
		<head>
			<h1>Agent下载与安装</h1>
			<span>Tapdata DFS云版需要在本地安装agent以确保连接数据库和传输服务正常运行</span>
		</head>
		<section class="agent-main">
			<div class="title">
				<i></i>
				<span>下载安装</span>
			</div>
			<div class="down-type">
				<div>
					<span>Windows (64 bit)</span>
				</div>
				<div>
					<span>Linux (64 bit)</span>
				</div>
			</div>
			<div class="prompt">
				<span>直接在安装agent的机器上使用以下命令下载并启动</span>
				<span>复制命令行</span>
				<span>刷新</span>
			</div>

			<div class="copy-down-link">
				wget "https://demo.tapdata.net/static/tapdata" && chmod +x tapdata && ./tapdata start backend token
				ci5fQUoDL95lZKUKdDwMupJeAAxN 3Vn10yLF8pF6wjQReCrYhNTEvcEV8dLmsmOE 5e6ca61a708029ab07f98390
			</div>

			<div class="title">
				<i></i>
				<span>下载安装说明</span>
			</div>
			<ul>
				<li>直接在安装agent的Linux机器上使用上述命令进行</li>
				<li>执行命令后自动下载并启动安装包（包含agent包 64M 和Java程序包160M）</li>
				<li>Agent安装启动成功后执行任务将不再弹出此页面</li>
			</ul>
		</section>
		<footer>
			<el-button>等待安装...</el-button>
		</footer>
	</div>
</template>
