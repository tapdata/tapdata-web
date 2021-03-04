<template>
	<section class="metadata-search-wrap" :class="{ 'metadata-change-background': !showNoSearch }">
		<div class="no-search-box-wrap" v-show="showNoSearch">
			<div class="no-search-box">
				<header class="metadata-search-title">元数据检索</header>
				<el-input placeholder="请输入内容" v-model="search" class="input-with">
					<el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
						<el-option label="搜索表" value="1"></el-option>
						<el-option label="搜索字段" value="2"></el-option>
					</el-select>
					<el-button type="primary" slot="append" @click="handleSearch">搜索</el-button>
				</el-input>
				<div class="desc">
					元数据检索提供对表、字段的名称、别名、描述等内容的搜索功能，请先选择搜索表/字段，再输入内容，点击搜索按钮进行搜索
				</div>
			</div>
		</div>
		<div class="search-box-wrap" v-show="!showNoSearch">
			<div class="search-box">
				<div class="search-header">
					<span class="search-title">元数据搜索</span>
					<el-input class="input-with" placeholder="请输入内容" v-model="search" ref="searchInput" v-focus>
						<el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
							<el-option label="搜索表" value="1"></el-option>
							<el-option label="搜索字段" value="2"></el-option>
						</el-select>
						<el-button type="primary" slot="append" @click="handleSearch">搜索</el-button>
					</el-input>
				</div>
				<div class="search-result">
					<ul>
						<li v-for="item in searchData" :key="item">
							{{ item.name }}
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'Search',
	data() {
		return {
			meta_type: '1',
			search: '',
			showNoSearch: true,
			searchData: [
				{
					name: '111'
				},
				{
					name: '222'
				}
			]
		};
	},
	watch: {
		search: {
			handler() {
				if (this.search !== '') {
					this.showNoSearch = false;
					this.$nextTick(() => {
						this.$refs.searchInput.focus();
					});
				}
			}
		}
	},
	methods: {
		handleSearch() {
			if (this.search === '') {
				this.showNoSearch = true;
				return;
			}
		}
	}
};
</script>

<style scoped lang="less">
.metadata-change-background {
	background: #fafafa;
}
.metadata-search-wrap {
	height: 100%;
	.input-with-select {
		width: 120px;
	}
	.input-with {
		width: 605px;
	}
	.no-search-box-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70%;
		.no-search-box {
			display: flex;
			flex-direction: column;
			.metadata-search-title {
				width: 147px;
				height: 42px;
				color: rgba(72, 182, 226, 100);
				font-size: 24px;
				text-align: left;
			}
			.desc {
				margin-top: 10px;
				font-size: 12px;
				color: #ccc;
			}
		}
	}
	.search-box-wrap {
		.search-header {
			padding: 15px 10px;
			background: #ffffff;
			overflow: hidden;
			border-bottom: 1px solid #dedee4;
			-webkit-box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
			box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
			.search-title {
				font-size: 16px;
				color: rgba(72, 182, 226, 100);
				font-weight: 600;
				margin-right: 10px;
			}
		}
	}
}
</style>
