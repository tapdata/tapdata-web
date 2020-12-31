<template>
	<section class="milestone-wrap" v-loading="loading">
		<ul class="milestone-list">
			<li class="milestone-item" v-for="(item, index) in list" :key="index">
				<div class="label">
					<span>{{ item.label }}</span>
					<el-button
						v-if="item.status === 'error'"
						class="btn-error"
						size="mini"
						type="text"
						@click="checkError(item.errorMessage)"
					>
						{{ $t('milestone.btn_check_error') }}
					</el-button>
				</div>
				<div :class="'status ' + item.status">
					<span class="milestone-icon">
						<i class="el-icon-success"></i>
						<i class="el-icon-error"></i>
						<i class="el-icon-loading"></i>
					</span>
					<span>{{ $t('milestone.status_' + item.status) }}</span>
				</div>
				<div class="from-now">{{ item.fromNow }}</div>
			</li>
		</ul>
		<div class="empty" v-if="!loading && !list.length">
			{{ $t('milestone.emptyText') }}
		</div>
	</section>
</template>

<script>
import factory from '../../api/factory';
// import ws from '../../api/ws';
const dataFlowsAPI = factory('DataFlows');

let interval = null;

export default {
	props: {
		dataFlow: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			loading: true,
			list: []
		};
	},
	mounted() {
		this.startRunning();
		this.editor.on('dataFlow:reset', () => {
			this.startRunning();
		});
	},
	destroyed() {
		this.stopRunning();
	},
	methods: {
		startRunning() {
			this.getData(true);
			interval = setInterval(() => {
				this.getData();
			}, 3000);
		},
		stopRunning() {
			if (interval) {
				clearTimeout(interval);
				interval = null;
			}
		},
		checkError(msg) {
			const h = this.$createElement;
			this.$msgbox({
				width: 600,
				customClass: 'error-box-body',
				message: h(
					'pre',
					{
						style: {
							whiteSpace: 'pre-wrap',
							maxHeight: '400px',
							overflow: 'auto'
						}
					},
					[msg]
				)
			});
		},
		getData(showLoading) {
			let id = this.dataFlow.id;
			if (id) {
				showLoading && (this.loading = true);
				dataFlowsAPI
					.findOne({
						filter: JSON.stringify({
							where: {
								id
							}
						})
					})
					.then(res => {
						if (res.data) {
							let dataFlow = res.data;
							if (dataFlow.status !== 'running') {
								this.stopRunning();
							}
							let milestones = dataFlow.milestones || [];
							this.list = milestones.map(m => {
								let time = m.status === 'running' ? m.start : m.end;
								if (time) {
									time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss');
								}
								return {
									label: this.$t(`milestone.${m.code}`),
									status: m.status,
									fromNow: time || '-'
								};
							});
						}
					})
					.finally(() => {
						this.loading = false;
					});
			}
		}
	}
};
</script>
<style lang="less">
.error-box-body {
	width: 600px;
}
</style>
<style lang="less" scoped>
.milestone-wrap {
	position: relative;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
	.empty {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 18px;
		color: #999;
	}
	.milestone-list {
		padding: 7px 0;
		display: flex;
		flex-direction: column;
		.milestone-item {
			margin: 4px 13px;
			display: flex;
			align-items: center;
			height: 40px;
			line-height: 40px;
			background: #f2f2f2;
			border-radius: 3px;
			color: #666;
			font-size: 12px;
			.label {
				flex: 1;
				.btn-error {
					margin-left: 10px;
				}
			}
			.status {
				width: 100px;
				color: #999;
			}
			.from-now {
				width: 150px;
				color: #999;
			}
			.status {
				position: relative;
				.milestone-icon {
					position: absolute;
					left: -21px;
					top: 50%;
					transform: translate(0, -50%);
					i {
						display: none;
					}
				}
				&.running {
					color: #48b6e2;
					.el-icon-loading {
						display: inline-block;
					}
				}
				&.error {
					color: #f56c6c;
					.el-icon-error {
						display: inline-block;
					}
				}
				&.finish {
					color: #67c23a;
					.el-icon-success {
						display: inline-block;
					}
				}
			}
		}
	}
}
</style>
