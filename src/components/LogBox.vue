<template>
	<div class="log-box">
		<ul class="log-box-container" v-show="logsList && logsList.length" ref="logContainer"></ul>

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
	props: {
		logs: {
			type: Array,
			default: null
		},
		keyword: {
			type: String,
			default: ""
		},
		loadBtn: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		logsList() {
			return this.getLogs(this.logs, this.keyword);
		}
	},
	mounted() {
		let logContainer = this.$refs.logContainer;
		$(logContainer).scroll(e => {
			this.$emit("scroll", logContainer);
		});
	},
	methods: {
		clickLoad() {
			this.$emit("click", arguments);
		},
		formatLog(item, keyword) {
			let markKeyword = function(text) {
				if (keyword && text.indexOf(keyword) >= 0) {
					return text.split(keyword).join(`<span class="keyword">${keyword}</span>`);
				}
				return text;
			};

			let date = item.date ? this.$moment(item.date).format("YYYY-MM-DD HH:mm:ss") : "";
			let lastModified = item.last_updated ? this.$moment(item.last_updated).format("YYYY-MM-DD HH:mm:ss") : "";

			return $(
				`<li>` +
					`[<span class="level ${item.level === "ERROR" ? "redActive" : ""}">${item.level}</span>] &nbsp;` +
					`<span>${item.date}</span>&nbsp;` +
					`<span>[${markKeyword(item.threadName)}]</span>&nbsp;` +
					`<span>${markKeyword(item.loggerName)}</span>&nbsp;-&nbsp;` +
					`<span>${markKeyword(item.message)}</span>` +
					`</li>`
			);
		},
		appendLogs(logs) {
			let logContainer = $(this.$refs.logContainer);
			logContainer.append(logs);
		},
		add(prepend) {
			let logContainer = $(this.$refs.logContainer);
			logContainer[prepend ? "prepend" : "append"](logs);
		},
		getLogs(logs, keyword, prepend) {
			let list = [];
			if (logs && logs.length) {
				let markKeyword = function(text) {
					if (keyword && text.indexOf(keyword) >= 0) {
						return text.split(keyword).join(`<span class="keyword">${keyword}</span>`);
					}
					return text;
				};
				for (let i = logCount - 1; i >= 0; i--) {
					let item = logs[i];
					item.date = item.date ? this.$moment(item.date).format("YYYY-MM-DD HH:mm:ss") : "";
					item.last_updated = item.last_updated
						? this.$moment(item.last_updated).format("YYYY-MM-DD HH:mm:ss")
						: "";

					logContainer[prepend ? "prepend" : "append"](
						$(`<li>
                    [<span class="level ${item.level === "ERROR" ? "redActive" : ""}">${item.level}</span>] &nbsp;
                    <span>${item.date}</span>&nbsp;
                    <span>[${markKeyword(item.threadName)}]</span>&nbsp;
                    <span>${markKeyword(item.loggerName)}</span>&nbsp;-&nbsp;
                    <span>${markKeyword(item.message)}</span>
									</li>`)
					);
				}
			}
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
