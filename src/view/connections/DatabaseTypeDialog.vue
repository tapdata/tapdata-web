<template>
	<el-dialog
		:title="$t('connection.createNewDataSource')"
		:visible.sync="dialogVisible"
		width="770px"
		:before-close="handleClose"
	>
		<div class="database">
			<span class="title">Database</span>
			<ul class="item clearfix">
				<li v-for="item in database" :key="item" @click="databaseType(item)">
					<div class="img-box">
						<img :src="getImgByType(item)" />
					</div>
					<div class="content">{{ typeMap[item] }}</div>
				</li>
			</ul>
			<span class="title">Other Type</span>
			<ul class="item clearfix">
				<li v-for="item in otherType" :key="item" @click="databaseType(item)">
					<div class="img-box">
						<img :src="getImgByType(item)" />
					</div>
					<div class="content">{{ typeMap[item] }}</div>
				</li>
			</ul>
		</div>
	</el-dialog>
</template>

<script>
import { getImgByType, TYPEMAP } from './util';
export default {
	name: 'DatasourceDialog',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		}
	},
	data() {
		return {
			database: [
				'mysql',
				'oracle',
				'mongodb',
				'sqlserver',
				'postgres',
				'elasticsearch',
				'redis',
				'gbase-8s',
				'sybase ase',
				'gaussdb200',
				'db2',
				'sequoiadb'
			],
			otherType: ['gridfs', 'dummy db', 'rest api', 'custom_connection', 'file', 'mem_cache'],
			typeMap: TYPEMAP
		};
	},
	methods: {
		getImgByType,
		handleClose() {
			this.$emit('dialogVisible', false);
		},
		databaseType(type) {
			this.$emit('databaseType', type);
		}
	}
};
</script>

<style scoped lang="less">
.database {
	.title {
		color: #999;
		margin-left: 20px;
	}
	.item {
		li {
			float: left;
			margin-left: 20px;
			margin-bottom: 20px;
			text-align: center;
		}
		.img-box {
			display: flex;
			width: 120px;
			height: 70px;
			justify-content: center;
			align-items: center;
			background: #fafafa;
			border: 1px solid #dedee4;
			border-radius: 3px;
			img {
				width: 35%;
			}
			&:hover {
				box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
			}
		}
		.content {
			font-size: 12px;
			margin-top: 5px;
		}
	}
	.clearfix:before,
	.clearfix:after {
		display: table;
		content: '.';
	}

	.clearfix:after {
		clear: both;
	}

	.clearfix {
		*zoom: 1;
	}
}
</style>
