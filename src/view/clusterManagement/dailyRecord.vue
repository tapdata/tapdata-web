<template>
	<div class="journal" ref="boxHeight">
		<el-row class="fun-area" :gutter="20">
			<el-form ref="form" :model="form" label-width="80px">
				<el-col :span="8">
					<el-form-item :label="$t('message.selectTime')">
						<el-col :span="11">
							<el-date-picker
								v-model="form.startDate"
								type="date"
								:picker-options="pickerStartDate"
								style="width: 100%;"
								:placeholder="$t('message.selectDate')"
							></el-date-picker>
						</el-col>
						<el-col class="line" :span="2">-</el-col>
						<el-col :span="11">
							<el-date-picker
								v-model="form.closeDate"
								type="date"
								:picker-options="pickerCloseDate"
								style="width: 100%;"
								:placeholder="$t('message.selectDate')"
							></el-date-picker>
						</el-col>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item :label="$t('message.server')">
						<el-select v-model="form.ip" :placeholder="$t('message.placeholderSelect')">
							<el-option
								v-for="item in ipList"
								:label="item.value"
								:value="item.value"
								:key="item.value"
							></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item :label="$t('message.serviceType')">
						<el-select v-model="form.serverType" :placeholder="$t('message.placeholderSelect')">
							<el-option
								v-for="item in serverTypeList"
								:label="item.lable"
								:value="item.value"
								:key="item.value"
							></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item :label="$t('message.level')">
						<el-select v-model="form.level" :placeholder="$t('message.placeholderSelect')">
							<el-option
								v-for="item in levelList"
								:label="item.lable"
								:value="item.value"
								:key="item.value"
							></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="4" class="center">
					<el-button type="primary" @click="screenFn">{{ $t('message.filter') }}</el-button>
				</el-col>
			</el-form>
		</el-row>
		<div class="content" ref="contentHeight">
			<el-table
				:data="tableData"
				class="tableName"
				border
				:height="tableHeight"
				:default-sort="{ prop: 'data', order: 'descending' }"
				style="width: 100%"
			>
				<el-table-column
					prop="last_updated"
					:label="$t('message.time')"
					:formatter="dateFormat"
					width="260"
				></el-table-column>
				<el-table-column
					prop="hostname"
					:label="$t('message.hostName')"
					:show-overflow-tooltip="true"
				></el-table-column>
				<el-table-column prop="ip" :label="$t('message.ipAddress')" width="150"></el-table-column>
				<el-table-column
					prop="uuid"
					:label="$t('message.uniqueEncode')"
					:show-overflow-tooltip="true"
				></el-table-column>
				<el-table-column prop="threadName" :label="$t('message.serviceType')" width="100"></el-table-column>
				<el-table-column prop="level" :label="$t('message.level')" width="100">
					<template slot-scope="scope">
						<span :class="scope.row.level === 'ERROR' ? 'red' : ''" disable-transitions>{{
							scope.row.level
						}}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="message"
					:label="$t('message.logs')"
					:show-overflow-tooltip="true"
				></el-table-column>
			</el-table>
			<el-pagination
				background
				class="pagination-bar"
				layout="total, prev, pager, next,sizes"
				:page-sizes="[10, 20, 30, 50, 100]"
				:page-size="pagesize"
				:total="totalNum"
				@current-change="handleCurrentChange"
				@size-change="handleSizeChange"
			>
			</el-pagination>
		</div>
	</div>
</template>
<script>
import factory from '../../api/factory';
const logs = factory('logs');
const cluster = factory('cluster');
export default {
	data() {
		return {
			pagesize: 30,
			currpage: 1,
			totalNum: 0,
			tableHeight: 100,
			form: {
				startDate: null,
				closeDate: null,
				level: '',
				serverType: '',
				ip: ''
			},
			tableData: [],
			levelList: [
				{ lable: 'INFO', value: 'INFO' },
				{ lable: 'WARN', value: 'WARN' },
				{ lable: 'ERROR', value: 'ERROR' }
			],
			serverTypeList: [
				{ lable: 'engine', value: 'engine' },
				{ lable: 'management', value: 'management' },
				{ lable: 'apiServer', value: 'apiServer' },
				{ lable: 'tapdataAgent', value: 'tapdataAgent' }
			],
			ipList: [],
			pickerStartDate: {
				disabledDate: time => {
					if (this.form.closeDate) {
						return time.getTime() > this.form.closeDate;
					}
				}
			},
			pickerCloseDate: {
				disabledDate: time => {
					return time.getTime() < this.form.startDate;
				}
			}
		};
	},

	mounted() {
		this.buildProfile = this.$store.state.buildProfile;
		let params = {
			'filter[limit]': this.pagesize,
			'filter[skip]': (this.currpage - 1) * this.pagesize,
			'filter[order]': 'last_updated DESC',
			'filter[where][loggerName]': 'tapdataAgent'
		};
		if (this.buildProfile && this.buildProfile === 'CLOUD' && !parseInt(this.$cookie.get('isAdmin'))) {
			params['filter[where][username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
		}
		setTimeout(() => this.getDataApi(params), 1000);
		this.getIpFn();
	},
	methods: {
		// 获取ip
		getIpFn() {
			// let api = 'http://52.82.13.216:3031/api/clusterStates'
			cluster.get().then(res => {
				if (res.data) {
					res.data.forEach(item => {
						this.ipList.push({ value: item.systemInfo.ip });
					});
				}
			});
		},
		// 筛选
		screenFn() {
			let params = {
				'filter[where][date][lt]': this.form.closeDate,
				'filter[where][date][gt]': this.form.startDate,
				'filter[where][level]': this.form.level,
				'filter[where][threadName]': this.form.serverType,
				'filter[where][ip]': this.form.ip,
				'filter[where][loggerName]': 'tapdataAgent',
				'filter[limit]': this.pagesize,
				'filter[skip]': this.currpage,
				'filter[order]': 'last_updated DESC'
			};
			if (this.buildProfile && this.buildProfile === 'CLOUD' && !parseInt(this.$cookie.get('isAdmin'))) {
				params['filter[where][username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			}
			let obj = {};
			for (let i in params) {
				if (params[i]) {
					obj[i] = params[i];
				}
			}
			this.getDataApi(obj);

			this.form = {
				closeDate: '',
				startDate: '',
				level: '',
				serverType: '',
				ip: ''
			};
		},
		// 获取数据
		async getDataApi(params) {
			logs.get(params).then(res => {
				if (res.data) {
					this.tableData = res.data;
				}
			});
			let where = {
				'where[loggerName]': 'tapdataAgent'
			};
			let result = await logs.count(where);
			this.totalNum = result.data.count;

			// 获取表格高度
			let contentHeight = this.$refs.contentHeight.offsetHeight; // 100
			this.tableHeight = contentHeight - 60;
		},
		handleCurrentChange(cpage) {
			this.currpage = cpage;
			let params = {
				'filter[order]': 'last_updated DESC',
				'filter[limit]': this.pagesize,
				'filter[skip]': (cpage - 1) * this.pagesize,
				'filter[where][loggerName]': 'tapdataAgent'
			};
			if (this.buildProfile && this.buildProfile === 'CLOUD' && !parseInt(this.$cookie.get('isAdmin'))) {
				params['filter[where][username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			}
			this.getDataApi(params);
		},
		handleSizeChange(psize) {
			this.pagesize = psize;
			let params = {
				'filter[order]': 'last_updated DESC',
				'filter[limit]': psize,
				'filter[skip]': (this.currpage - 1) * psize,
				'filter[where][loggerName]': 'tapdataAgent'
			};
			if (this.buildProfile && this.buildProfile === 'CLOUD' && !parseInt(this.$cookie.get('isAdmin'))) {
				params['filter[where][username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			}
			this.getDataApi(params);
		},

		dateFormat(row, column) {
			const daterc = row[column.property];
			if (daterc != null) {
				const dateMat = new Date(daterc);
				const year = dateMat.getFullYear();
				const month = dateMat.getMonth() + 1;
				const day = dateMat.getDate();
				const hh = dateMat.getHours();
				const mm = dateMat.getMinutes();
				const ss = dateMat.getSeconds();
				const timeFormat =
					year +
					'-' +
					(month < 10 ? '0' + month : month) +
					'-' +
					(day < 10 ? '0' + day : day) +
					' ' +
					(hh < 10 ? '0' + hh : hh) +
					':' +
					(mm < 10 ? '0' + mm : mm) +
					':' +
					(ss < 10 ? '0' + ss : ss);
				return timeFormat;
			}
		}
	}
};
</script>
<style lang="less">
.journal {
	width: 100%;
	height: 100%;
	.line {
		text-align: center;
	}
	.el-form {
		overflow: hidden;
		.el-col {
			height: 100%;
		}
	}
	.el-form-item {
		height: 60px;
		line-height: 60px;
		margin-bottom: 0;
		.el-form-item__label {
			height: 60px;
			line-height: 60px;
			.el-form-item__content {
				line-height: 60px !important;
			}
		}
		.el-input {
			.el-input__prefix {
				// display: none!important;
				// opacity: 0;
				.el-icon-date {
					display: none;
				}
			}
			.el-input__inner {
				padding-left: 5px;
			}
		}
	}
	.tableName {
		tr th {
			font-weight: normal;
		}
		tr th,
		tr td {
			padding: 6px 0;
		}
	}
	.el-pagination {
		// position: absolute;
		// bottom: 0;
		width: 100%;
		padding: 10px 50px;
		box-sizing: border-box;
		text-align: right;
		overflow: hidden;

		.el-pagination__total {
			float: left;
		}
	}
}
.el-tooltip__popper {
	max-width: 80%;
	color: #000 !important;
	box-shadow: 0 0 6px #666;
	background-color: #fff !important;
	.popper__arrow:after {
		border-top-color: rgba(0, 0, 0, 0.2) !important;
	}
}
</style>
<style scoped lang="less">
.journal {
	position: relative;
	width: 100%;
	height: 100%;
	font-size: 12px;
	background-color: #f8f6fa;
	.content {
		height: calc(100% - 65px);
		margin-top: 5px;
		padding: 10px 50px;
		box-sizing: border-box;
		background-color: #fff;
		.red {
			color: #f56c6c;
		}
	}
}
</style>
