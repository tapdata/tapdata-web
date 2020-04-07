<template>
	<div class="debugLog">
		<el-input
				class="inputStyle"
				:placeholder="$t('message.search')"
				v-model="search">
			<i slot="prefix" class="el-input__icon el-icon-search"></i>
		</el-input>
		<ul class="log" v-show="logCount > 0" ref="logContainer"></ul>
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
				lastTime: '',
				timer: null, //定时器
			};
		},

		mounted() {
      this.getLogsData();
			// 这是一个定时器
			this.timer = setInterval(() => {
				this.getLogsData();
			}, 10000);
		},

		watch: {
			search(val) {
				this.search = val;
				this.getLogsData();
			}
		},

		methods: {
			async getLogsData() {  //获取日志
				let paramas = {
					'filter[order]': 'millis DESC',
					'filter[where][contextMap.dataFlowId][regexp]': `^${this.dataFlow.id}$`
				};
				if (!this.lastTime) {
					paramas['filter[limit]'] = 100;
				} else if (this.lastTime && !this.search) {
          paramas['filter[where][millis][gt]'] = this.lastTime;
        }
				if (this.search) {
					paramas['filter[where][$text][search]'] = this.search;
				}

				logsModel.get(paramas).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data && res.data.length > 0) {
							this.lastTime = res.data[0].millis;
							let logCount = res.data.length;
              this.logCount += logCount;

							for (let i = logCount - 1; i >= 0; i--) {
								let item = res.data[i];
                item.date = item.date ? this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss') : '';
                item.last_updated = item.last_updated ? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
								$(this.$refs.logContainer).prepend(
									$(`<li style="padding-bottom:10px;">
                      <span>[<i style="font-weight: bold;" class="${item.level == 'ERROR' ? 'redActive' : ''}">${item.level}</i>]</span> &nbsp;
                      <span>${item.date}</span>&nbsp;
                      <span>[${item.threadName}]</span>&nbsp;
                      <span>${item.loggerName}</span>&nbsp;-&nbsp;
                      <span>${item.message}</span>
                    </li>`)
								);
							}
						}
					}
				}).catch(err => {

				});
			},
		},

		destroyed() {
			//清除定时器
			clearInterval(this.timer);
			this.timer = null;
		}
	};
</script>
<style scoped lang="less">
	.debugLog {
		width: 100%;
    height: 100%;
    padding: 20px 0 0 20px;
    box-sizing: border-box;
		overflow: hidden;
	}

	li {
		list-style: none;
	}
	.log {
		width: 100%;
		display: inline-block;
		height: calc(100% - 50px);
		padding-top: 20px;
		overflow: auto;
    li .redActive {
      color: red!important;
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
<style>
  .redActive {
    color: red!important;
  }
</style>
