<template>
	<div class="log-box">
		<ul class="container" v-show="logsList && logsList.length" ref="logContainer">
			<li v-for="log in logsList" :key="log.id" v-html="log.html"></li>
		</ul>

		<div v-show="logsList && !logsList.length" class="noData">
			<div class="imageBox">
				<el-image style="width: 200px; height: 200px" src="static/image/noData.svg"></el-image>
			</div>

			<div>
				{{ $t("dataFlow.noLogTip") }}?_(:з」∠)......
				<span class="clickLoad" @click="clickLoad">{{ $t("dataFlow.clickLoadTxt") }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import $ from "jquery";

export default {
	name: "LogBox",
	props: ["logs", "keyword"],
	computed: {
		logsList() {
			return this.getLogs(this.logs, this.keyword);
		}
	},
	methods: {
		clickLoad() {
			this.$emit("click", arguments);
		},
		markWord(text, keyword) {
			if (keyword && text.indexOf(keyword) >= 0) {
				return text.split(keyword).join(`<span class="keyword">${keyword}</span>`);
			}
			return text;
		},
		getLogs(logs, keyword) {
			let list = [];
			if (logs && logs.length) {
				list = logs.map(item => {
					let date = item.date ? this.$moment(item.date).format("YYYY-MM-DD HH:mm:ss") : "";
					let lastUpdated = item.last_updated
						? this.$moment(item.last_updated).format("YYYY-MM-DD HH:mm:ss")
						: "";
					let html = `
                    	[<span class="level ${item.level === "ERROR" ? "redActive" : ""}">${item.level}</span>] &nbsp;
                    	<span>${item.date}</span>&nbsp;
                    	<span>[${this.markWord(item.threadName, keyword)}]</span>&nbsp;
                    	<span>${this.markWord(item.loggerName, keyword)}</span>&nbsp;-&nbsp;
                    	<span>${this.markWord(item.message, keyword)}</span>`;
					return { id: item.id, html };
				});
			}
			return list;
		}
	}
};
</script>

<style lang="less" scoped>
.log-box {
	.container {
		width: 100%;
		display: inline-block;
		height: calc(100% - 61px);
		padding-top: 10px;
		overflow: auto;
		font-size: 11px;
		color: #222222;

		li {
			list-style: none;
			padding-bottom: 5px;

			.level {
				font-weight: bold;
			}

			.redActive {
				color: red;
			}

			.keyword {
				background: #ffff00;
			}
		}
	}
	.noData {
		height: calc(100% - 60px);
		padding-top: 9%;
		color: #999;
		font-size: 12px;
		background-color: #fff;
		div {
			text-align: center;
		}
		.clickLoad {
			cursor: pointer;
			color: #48b6e2;
		}
	}
}
</style>
