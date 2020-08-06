<template>
	<el-dialog title="新建" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
		<div>
			<ul class="item">
				<li
					@click="
						dialogVisibleSetting = true;
						dialogVisible = false;
					"
				>
					<span class="model">场景模式</span>
					<div class="content">
						<i class="iconfont icon-qianyi1"></i>
						<span>
							<span class="tag">迁移功能</span>
							旨在帮助用户快速地实现各种库级别数据源之间的数据全量和增量传输，适用于数据库迁移、上云、拆分扩容等业务场景。</span
						>
					</div>
				</li>
				<li>
					<div class="content">
						<i class="iconfont icon-kujitongbucopy"></i>
						<span>
							<span class="tag">同步功能</span>
							旨在帮助用户实现多个表、文件等多种数据类型之间的数据处理与传输，满足用户对数据的分析、处理、灾备等方面的需求。</span
						>
					</div>
				</li>
				<div class="divider"></div>
				<li>
					<span class="model">高级模式</span>
					<div class="content">
						<i class="iconfont icon-custom"></i>
						<span>
							<span class="tag">自定义模式下</span>
							用户可以根据需求使用全部的数据节点与全功能处理节点，自由设计任务编排路径。</span
						>
					</div>
				</li>
			</ul>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleClose">取 消</el-button>
			<el-button type="primary" @click="handleClose">确 定</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'newDataFlow',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		}
	},
	methods: {
		handleClose() {
			this.dialogVisible = false;
			this.$emit('dialogVisible', false);
		}
	}
};
</script>

<style scoped lang="less">
@color: #999999;
.item {
	display: flex;
	justify-content: space-between;
	padding: 0 20px;
	li {
		width: 30%;
	}
	li:nth-child(2) {
		margin-top: 30px;
	}
	.divider {
		border-right: 1px solid #dedee4;
	}
	.model {
		display: block;
		color: @color;
		margin-bottom: 10px;
	}
	li {
		.content {
			display: flex;
			justify-content: space-between;
			cursor: pointer;
			padding: 20px;
			.iconfont {
				display: inline-block;
				font-size: 36px;
				margin-right: 10px;
			}
			&:hover {
				background: rgba(250, 250, 250, 1);
				border: 1px solid rgba(222, 222, 228, 1);
				box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.21);
				border-radius: 5px;
			}
			.tag {
				display: block;
				font-size: 16px;
				color: #48b6e2;
				font-weight: 400;
				margin-bottom: 10px;
			}
		}
	}
}
</style>
