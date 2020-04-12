<template>
	<div class="debugLog">

		<div>
			<el-input
					class="inputStyle"
					:placeholder="$t('message.search')"
					v-model="search"
					size="mini">
			</el-input>
			<el-button icon="el-icon-search" size="mini" @click="loadNew"></el-button>
		</div>

		<ul class="e-log-container" v-show="logCount > 0" ref="logContainer"></ul>

		<div v-show="logCount === 0" class="noText">
			<i class="iconfont icon icon-zanwushuju1" style="font-size: 174px"></i>
		</div>
	</div>
</template>
<script>
	import $ from 'jquery';
	import factory from '../../api/factory';

	const logsModel = factory('logs');
	export default {
		name: "DebugLogs",
		props: {
			dataFlow: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				search: '',
				logCount: 0,
				lastLogsId: '',
				firstLogsId: '',
				timer: null,
				loading: false,
			};
		},

		mounted() {
			let self = this;
			this.loadNew();
			this.timer = setInterval(() => {
				this.loadNew();
			}, 5000);

			let logContainer = self.$refs.logContainer;
			$(logContainer).scroll((e) => {
				if( (logContainer.scrollHeight - logContainer.clientHeight - logContainer.scrollTop) < 100) {
					self.loadOld();
				}
			});
		},

		methods: {

			loadOld(){
				let filter = {
					where: {
						'contextMap.dataFlowId': {
							eq: this.dataFlow.id
						},
						id: {
							lt: this.firstLogsId
						}
					},
					order: 'millis DESC',
					limit: 100
				};
				this.getLogsData(filter, false, false);
			},

			loadNew(){
				let filter = {
					where: {
						'contextMap.dataFlowId': {
							eq: this.dataFlow.id
						}
					},
					order: 'millis DESC',
				};

				let reset = self.lastKeyword !== this.search;
				self.lastKeyword = this.search;

				if( !reset && this.lastLogsId ){
					filter.where.id = {
						gt: this.lastLogsId
					};
				} else {
					filter.limit = 100;
				}
				if( this.search ){
					filter.where.or = [
						{threadName: { regexp: this.search }},
						{loggerName: { regexp: this.search }},
						{message: { regexp: this.search }},
						{level: { regexp: this.search }}
					];
				}

				this.getLogsData(filter, reset, true);
			},

			getLogsData(filter, reset = false, prepend = false) {  //获取日志

				let self = this;

				if( self.loading ) return;

				self.loading = true;
				logsModel.get({filter}).then(res => {
					self.loading = false;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data && res.data.length > 0) {

							if( reset || prepend ) this.lastLogsId = res.data[0].id;
							if( reset || !prepend ) this.firstLogsId = res.data[res.data.length - 1].id;

							let logCount = res.data.length;
							let logContainer = $(this.$refs.logContainer);

							if( reset ){
								this.logCount = logCount;
								logContainer.find('li').remove();
							} else {
								this.logCount += logCount;
							}

							let markKeyword = function(text){
								if( self.search && text.indexOf(self.search) >= 0){
									return text.split(self.search).join(`<span class="keyword">${self.search}</span>`);
								}
								return text;
							};
							for (let i = logCount - 1; i >= 0; i--) {
								let item = res.data[i];
								item.date = item.date ? this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss') : '';
								item.last_updated = item.last_updated ? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';

								logContainer[prepend ? 'prepend' : 'append'](
									$(`<li>
										  [<span class="level ${item.level === 'ERROR' ? 'redActive' : ''}">${item.level}</span>] &nbsp;
										  <span>${item.date}</span>&nbsp;
										  <span>[${markKeyword(item.threadName)}]</span>&nbsp;
										  <span>${markKeyword(item.loggerName)}</span>&nbsp;-&nbsp;
										  <span>${markKeyword(item.message)}</span>
										</li>`)
								);
							}
						}
					}
				}).catch(err => {
					self.loading = false;
				});
			},
		},

		destroyed() {
			clearInterval(this.timer);
			this.timer = null;
		}
	};
</script>
<style lang="less">
	.debugLog {
		width: 100%;
		height: 100%;
		padding: 20px 0 0 20px;
		box-sizing: border-box;
		overflow: hidden;
	}

	.e-log-container {
		width: 100%;
		display: inline-block;
		height: calc(100% - 50px);
		padding-top: 20px;
		overflow: auto;
		font-size: 11px;
		color: #222222;

		li {
			list-style: none;
			padding-bottom:5px;

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

	.noText {
		display: flex;
		height: calc(100% - 60px);
		align-items: center;
		justify-content: center;
		color: #1976D2;
		font-size: 16px;
		background-color: #fff;
	}

	.inputStyle {
		width: 300px;
	}
</style>
