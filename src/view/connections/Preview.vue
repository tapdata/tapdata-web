<template>
	<el-drawer
		class="drawer"
		ref="drawer"
		:visible.sync="visible"
		:title="$t('dataForm.title')"
		:append-to-body="true"
		size="40%"
		:withHeader="false"
		:before-close="handleClose"
	>
		<head data-v-4c16474d="" class="head">
			<button data-v-4c16474d="" type="button" class="el-button back-btn-icon-box el-button--default">
				<span>
					<i data-v-4c16474d="" class="iconfont icon-you2 back-btn-icon"></i>
				</span>
			</button>
			<span class="back-btn-text">{{ $t('connection.info') }}</span>
		</head>
		<header class="header">
			<div class="img-box">
				<img :src="getImgByType(type)" />
			</div>
			<div class="content">
				<div>{{ name }}</div>
				<div class="status">
					<span class="error" v-if="['invalid'].includes(status)">
						<i class="el-icon-error"></i>
						<span>
							{{ $t('connection.status.invalid') }}
						</span>
					</span>
					<span class="success" v-if="['ready'].includes(status)">
						<i class="el-icon-success"></i>
						<span>
							{{ $t('connection.status.ready') }}
						</span>
					</span>
					<span class="warning" v-if="['testing'].includes(status)">
						<i class="icon-gantanhao2"></i>
						<span>
							{{ $t('connection.status.testing') }}
						</span>
					</span>
				</div>
			</div>
			<div class="panelBtn">
				<ul>
					<li class="item">
						<el-button class="btn" size="mini" @click="edit()">
							<i class="iconfont icon-edit"> Edit</i>
						</el-button>
					</li>
					<li class="item">
						<el-button class="btn" size="mini" @click="reload()">
							<i class="iconfont icon-kujitongbucopy"> Reload schema</i>
						</el-button>
					</li>
					<li class="item">
						<el-button class="btn" size="mini" @click="test()">
							<i class="iconfont icon-lianjie1"> Test </i>
						</el-button>
					</li>
				</ul>
			</div>
		</header>
		<ul>
			<li v-for="item in form" :key="item.label">
				<span class="label">{{ item.label }}</span>
				<span class="value">{{ item.value }}</span>
			</li>
		</ul>
		<Test
			@dialogTestVisible="handleTestVisible"
			:dialogTestVisible="dialogTestVisible"
			:testLogs="testLogs"
			:testResult="testResult"
		></Test>
	</el-drawer>
</template>

<script>
import { getImgByType } from './util';
import formConfig from './config';
import Test from './Test';

export default {
	name: 'Preview',
	components: { Test },
	props: {
		id: {
			required: true,
			value: String
		},
		visible: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			form: {},
			data: {},
			name: '',
			type: '',
			status: '',
			dialogTestVisible: false,
			testLogs: null,
			testResult: ''
		};
	},
	watch: {
		visible: {
			handler() {
				if (this.visible) {
					this.getData(this.id);
				}
			}
		}
	},
	methods: {
		getImgByType,
		getData(id) {
			this.$api('connections')
				.get([id])
				.then(result => {
					if (result && result.data) {
						let data = result.data;
						this.data = result.data;
						this.name = data.name;
						this.type = data.database_type;
						this.status = data.status;
						let func = formConfig[this.type];
						if (func) {
							let config = func(this);
							let items = config.items.map(it => {
								let node = {
									label: it.label,
									value: data[it.field]
								};
								return node;
							});
							this.form = items;
						}
					}
				});
		},
		handleClose() {
			this.$emit('previewVisible', false);
		},
		async test() {
			let result = null;
			this.dialogTestVisible = true;
			if (this.data.database_type === 'mongodb') {
				result = await this.$api('connections').customQuery([this.data.id]);
			} else {
				result = await this.$api('connections').get([this.data.id]);
			}
			if (result.data) {
				const data = result.data;
				let validate_details = data.response_body && data.response_body.validate_details;
				this.testLogs = validate_details;
				this.testResult = data.status;
			}
		},
		edit() {
			this.$router.push('connections/create?id=' + this.data.id + '&databaseType=' + this.data.type);
		},
		reload() {
			this.$api('connections')
				.updateById(this.data.id, {
					status: 'testing',
					name: this.data.name
				})
				.then(res => {
					if (res.data) {
						this.$message.success(this.$t('connection.reloadOK'));
						this.search(this.page.current);
					}
				})
				.catch(() => {
					this.$message.error(this.$t('connection.reloadFail'));
				});
		},
		//test
		handleTestVisible() {
			this.dialogTestVisible = false;
		}
	}
};
</script>

<style scoped lang="less">
.drawer {
	.header {
		display: flex;
		justify-content: flex-start;
		margin: 20px 0;
		padding-bottom: 10px;
		border-bottom: 1px solid #eee;
		.img-box {
			display: flex;
			width: 54px;
			height: 54px;
			justify-content: center;
			align-items: center;
			background: #fff;
			border: 1px solid #dedee4;
			border-radius: 3px;
			margin-left: 30px;
			img {
				width: 60%;
			}
		}
		.content {
			margin-left: 10px;
			font-weight: 500;
			margin-top: 4px;
		}
		.status {
			font-size: 12px;
			margin-top: 2px;
			.error {
				color: #d54e21;
			}
			.success {
				color: #0ab300;
			}
			.warning {
				color: #e6a23c;
			}
		}
		.panelBtn {
			display: flex;
			align-items: center;
			width: 532px;
			justify-content: flex-end;
			.item {
				margin-right: 10px;
				float: right;
			}
			.iconfont {
				display: inline-block;
				font-size: 12px;
				transform: rotate(00deg);
			}
		}
		.panelBtn:hover {
			color: #48b6e2;
		}
		.btn + .btn {
			margin-left: 5px;
		}
		.btn {
			padding: 7px;
			background: #f5f5f5;
			i.iconfont {
				font-size: 12px;
			}
		}
	}
	.label {
		color: #999;
		font-size: 12px;
		display: inline-block;
		width: 200px;
		margin-right: 10px;
		text-align: right;
	}
	.value {
		width: 62%;
		color: #666;
		font-size: 12px;
		display: inline-block;
		vertical-align: top;
		word-break: break-all;
	}
	ul {
		overflow-y: auto;
		max-height: 640px;
		li {
			margin-bottom: 20px;
		}
	}
	.head {
		display: block !important;
		width: 100%;
		height: 30px;
		background: #f5f5f5;
		border-bottom: 1px solid #dedee4;
	}
	.back-btn-icon-box {
		width: 30px;
		height: 30px;
		margin: 0;
		padding: 0;
		line-height: 1;
		font-weight: normal;
		font-size: 14px;
		color: red;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		outline: 0;
		border: 0;
		border-radius: 0;
		box-sizing: border-box;
		background: #48b6e2;
		transition: 0.1s;
		-webkit-appearance: none;
		-webkit-box-sizing: border-box;
		-webkit-transition: 0.1s;
	}
	.back-btn-icon-box:hover {
		background: #6dc5e8;
	}
	.back-btn-icon {
		color: #fff;
	}
	.back-btn-text {
		font-size: 12px;
	}
}
</style>
