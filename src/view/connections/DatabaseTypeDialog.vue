<template>
	<el-dialog title="提示" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
		<div class="database">
			<span class="title">Database</span>
			<ul class="item clearfix">
				<li v-for="item in database" :key="item" @click="databaseType(item)">
					<div class="img-box">
						<img :src="getImgByType(item)" />
					</div>
					<div>{{ item }}</div>
				</li>
			</ul>
		</div>
	</el-dialog>
</template>

<script>
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
			database: ['oracle', 'mongodb', 'sqlserver', 'es', 'mysql', 'pg', 'redis']
			//other: ['oracle','mongodb','sqlserver','es','gbase','DB2','mysql','pg','redis','custom_connection']
		};
	},
	methods: {
		getImgByType(type) {
			return require(`../../../static/image/databaseType/${type.toLowerCase()}.png`);
		},
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
			box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
			border-radius: 3px;
			img {
				width: 35%;
			}
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
