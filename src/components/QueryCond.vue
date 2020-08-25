<template>
	<div style="" :class="color">
		<div v-for="(cond, idx) in value.conditions" :key="idx">
			<queryCond
				v-if="cond.type == 'group'"
				:primaryKeyOptions="primaryKeyOptions"
				v-model="value.conditions[idx]"
			></queryCond>
			<div v-if="cond.type != 'group'">
				<el-col :span="8">
					<el-select v-model="cond.field" filterable size="mini">
						<el-option
							v-for="item in primaryKeyOptions"
							:key="item"
							:label="item"
							:value="item"
						></el-option>
					</el-select>
				</el-col>
				<el-col :span="5">
					<el-select v-model="cond.command" size="mini">
						<el-option v-for="item in calculationList" :label="item" :value="item" :key="item"></el-option>
					</el-select>
				</el-col>

				<el-col :span="6">
					<el-input v-if="!cond.isDatetime" type="text" v-model="cond.value" size="mini"></el-input>
					<el-date-picker
						v-if="cond.isDatetime"
						v-model="cond.value"
						type="datetime"
						placeholder="选择日期时间"
					></el-date-picker>
				</el-col>

				<el-col :span="5">
					<div class="btn" style="width: 90px;">
						<span class="iconfont icon-quxiao remove" @click="removeChild(idx)"></span>
						<el-dropdown size="mini" @command="handleCommand">
							<span class="el-dropdown-link">+<i class=""></i> </span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item command="and">+ and</el-dropdown-item>
								<el-dropdown-item command="or">+ or</el-dropdown-item>
								<el-dropdown-item command="andQ">+ and()</el-dropdown-item>
								<el-dropdown-item command="orQ">+ or()</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</div>
				</el-col>
			</div>
			<!-- <div>{{ cond.condStr }}</div> -->
		</div>
	</div>
</template>

<script>
export default {
	name: 'queryCond',
	props: {
		primaryKeyOptions: {
			type: Array,
			default() {
				return [];
			}
		},
		value: {
			type: Object,
			default() {
				return { conditions: [{ field: '', command: '', value: '', condStr: '' }] };
			}
		},
		level: {
			type: Number,
			default() {
				return 1;
			}
		}
	},
	computed: {
		operator() {
			return this.value.operator;
		},
		conditions() {
			return this.value.conditions;
		},
		isDatetime() {
			let field = this.fields.filter(v => v.value === this.queryField)[0];
			if (field) {
				let type = field.type;

				if (type === 'string' && field.format === 'date-time') {
					return true;
				}
			}
			return false;
		}
	},
	data() {
		return {
			calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like'],
			color: 'level1'
		};
	},
	mounted() {
		this.color = 'level' + ((this.level % 7) + 1);
	},
	watch: {
		value: {
			deep: true,
			handler() {
				this.$emit('input', this.value);
			}
		}
	},
	methods: {
		handleCommand(command) {
			if (command == 'andQ') this.addChild('group', 'and');
			if (command == 'and') this.addChild('condition', 'and');
			if (command == 'orQ') this.addChild('group', 'or');
			if (command == 'or') this.addChild('condition', 'or');
		},
		addChild(type, operator) {
			let child = {};
			if (type === 'group') {
				child = {
					type: 'group',
					operator: operator,
					conditions: [
						{
							type: 'condition',
							field: '',
							command: '=',
							value: ''
						}
					]
				};
			} else if (type === 'condition') {
				child = {
					type: 'condition',
					operator: operator,
					field: '',
					command: '',
					value: ''
				};
			}
			this.value.conditions.push(child);
			this.$emit('input', this.value);
		},
		removeGroup() {
			this.$emit('remove');
		},
		handleFilterChange() {
			this.$nextTick(() => {
				this.createCustSql();
			});
		},
		removeChild(index) {
			if (!this.value.fieldFilterType || this.value.conditions.length > 1) this.value.conditions.splice(index, 1);
			else {
				this.value.conditions[0].field = '';
				this.value.conditions[0].command = '';
				this.value.conditions[0].value = '';
			}
		}
	}
};
</script>

<style lang="less" scoped>
.e-table {
	.e-entity-wrap {
		flex: 1;
		overflow: auto;
	}
	.flex-block {
		display: flex;
		align-items: center;
	}
	.fiflter {
		padding: 10px 12px;
		font-size: 12px;
		box-sizing: border-box;
		border: 1px solid #dcdfe6;
		.title {
			font-size: 12px;
			padding-bottom: 10px;
		}
		.rowSlot {
			display: inline-block;
			margin-bottom: 12px;
			border: 1px solid #dcdfe6;
			border-radius: 4px;
			box-sizing: border-box;
			span {
				float: left;
				display: inline-block;
				height: 28px;
				width: 80px;
				line-height: 28px;
				text-align: center;
				font-size: 12px;
				background-color: #f5f7fa;
			}
			.e-select {
				width: 160px;
			}
		}
		.e-row {
			padding-bottom: 5px;
			.btn {
				width: 84px;
				height: 28px;
				line-height: 27px;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				box-sizing: border-box;
				span {
					float: left;
					display: inline-block;
					text-align: center;
					color: #999;
					font-size: 12px;
					cursor: pointer;
					box-sizing: border-box;
				}
				span:first-child {
					width: 40px;
				}
				span:last-child {
					width: 42px;
					border-left: 1px solid #dcdfe6;
				}
				span:hover {
					background-color: #ecf5ff;
				}
			}
		}
		.selectSql {
			padding-top: 10px;
			font-size: 12px;
			color: #999;
			overflow: hidden;
			div {
				width: 100%;
			}
		}
	}
}
</style>
<style lang="less">
.e-table {
	.fiflter {
		.e-select .el-input--mini .el-input__inner {
			border: 0;
			font-size: 12px !important;
		}
	}
	.el-tabs__item,
	.el-input__inner {
		font-size: 12px !important;
	}
	.el-switch__label * {
		font-size: 12px !important;
		color: #999;
	}
}
.level1 {
	border-left-color: #00c7ff;
}
.level2 {
	border-left-color: #a463f2;
}
.level3 {
	border-left-color: #ffb700;
}
.level4 {
	border-left-color: #818182;
}
.level5 {
	border-left-color: #3ae698;
}
.level6 {
	border-left-color: #000000;
}
.level7 {
	border-left-color: #e7040f;
}
</style>
