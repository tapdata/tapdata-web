<template>
	<div class="log-box">
		<ul class="log-box-container" v-show="count" ref="logContainer"></ul>

		<div v-show="!count" class="noData">
			<div class="imageBox">
				<el-image style="width: 200px; height: 200px" src="static/image/noData.svg"></el-image>
			</div>

			<div v-if="load">
				{{ $t("dataFlow.noLogTip") }}?_(:з」∠)......
				<span class="clickLoad" @click="load">{{ $t("dataFlow.clickLoadTxt") }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import $ from "jquery";

export default {
	name: "LogBox",
	props: {
		keyword: {
			type: String,
			default: ""
		},
		load: {
			type: Function,
			default: () => {}
		}
	},
	data() {
		return {
			count: 0
		};
	},
	mounted() {
		let logContainer = this.$refs.logContainer;
		$(logContainer).scroll(e => {
			this.$emit("scroll", logContainer);
		});
	},
	methods: {
		formatLog(item, keyword) {
			let markKeyword = function(text) {
				if (keyword && text.indexOf(keyword) >= 0) {
					return text.split(keyword).join(`<span class="keyword">${keyword}</span>`);
				}
				return text;
			};

			let date = item.date ? this.$moment(item.date).format("YYYY-MM-DD HH:mm:ss") : "";
			// let lastModified = item.last_updated ? this.$moment(item.last_updated).format("YYYY-MM-DD HH:mm:ss") : "";
			return (
				`<li>` +
				`[<span class="level ${item.level === "ERROR" ? "redActive" : ""}">${item.level}</span>] &nbsp;` +
				`<span>${date}</span>&nbsp;` +
				`<span>[${markKeyword(item.threadName)}]</span>&nbsp;` +
				`<span>${markKeyword(item.loggerName)}</span>&nbsp;-&nbsp;` +
				`<span>${markKeyword(item.message)}</span>` +
				`</li>`
			);
		},
		add({ logs, prepend, reset }) {
			let logContainer = $(this.$refs.logContainer);
			let doms = "";
			this.count += logs.length;
			if (reset) {
				this.count = logs.length;
				logContainer.find("li").remove();
			}
			if (logs && logs.length) {
				doms = logs
					.map(item => {
						return this.formatLog(item);
					})
					.join("");
			}
			logContainer[prepend ? "prepend" : "append"](doms);
		}
	}
};
</script>

<style lang="less" scoped>
.log-box {
	overflow: hidden;
	height: 100%;
	box-sizing: border-box;
	padding-bottom: 5px;
	.noData {
		height: 100%;
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
<style lang="less">
.log-box-container {
	padding-top: 10px;
	width: 100%;
	height: 100%;
	overflow: auto;
	font-size: 11px;
	color: #222222;
	box-sizing: border-box;
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
</style>
