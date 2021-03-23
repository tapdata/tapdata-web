<template>
	<section class="metadata-search-wrap" :class="{ 'metadata-change-background': !showNoSearch }">
		<div class="no-search-box-wrap" v-show="showNoSearch">
			<div class="no-search-box">
				<header class="metadata-search-title">{{ $t('metadata.metadataSearch.title') }}</header>
				<el-input :placeholder="$t('metadata.metadataSearch.placeholder')" v-model="keyword" class="input-with">
					<el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
						<el-option :label="$t('metadata.metadataSearch.table')" value="table"></el-option>
						<el-option :label="$t('metadata.metadataSearch.column')" value="column"></el-option>
					</el-select>
					<el-button type="primary" slot="append" @click="handleSearch">{{
						$t('metadata.metadataSearch.search')
					}}</el-button>
				</el-input>
				<div class="desc">
					{{ $t('metadata.metadataSearch.desc') }}
				</div>
			</div>
		</div>
		<div class="search-box-wrap" v-show="!showNoSearch">
			<div class="search-box">
				<div class="search-header">
					<span class="search-title">{{ $t('metadata.metadataSearch.title') }}</span>
					<el-input
						class="input-with"
						:placeholder="$t('metadata.metadataSearch.placeholder')"
						v-model="keyword"
						ref="searchInput"
						@keyup.native.13="handleSearch"
					>
						<el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
							<el-option :label="$t('metadata.metadataSearch.table')" value="table"></el-option>
							<el-option :label="$t('metadata.metadataSearch.column')" value="column"></el-option>
						</el-select>
						<el-button type="primary" slot="append" @click="handleSearch('')">{{
							$t('metadata.metadataSearch.search')
						}}</el-button>
					</el-input>
				</div>
				<div class="no-result" v-if="searchData.length === 0 && firstSearch === 0">
					{{ $t('metadata.metadataSearch.noSearch') }}
				</div>
				<div class="no-result" v-else-if="searchData.length === 0 && firstSearch !== 0">
					{{ $t('metadata.metadataSearch.noResult') }}
				</div>
				<div ref="searchResult" class="search-result" v-else @scroll="handleLoad">
					<ul class="table">
						<li class="table-li" v-for="item in searchData" :key="item.id">
							<div class="table-box-wrap" v-if="item.table" @click="goMetaInfo">
								<div class="image-box">
									<el-image src="static/image/metaSearchTable.png"></el-image>
								</div>
								<div class="info-box">
									<span class="title" v-html="item.table.name"></span>
									<span class="title" v-if="item.table.original_name">( 原表名:</span>
									<span class="title" v-html="item.table.original_name"></span>
									<span class="title" v-if="item.table.original_name"> )</span>
									<div class="desc" v-html="item.table.comment"></div>
								</div>
							</div>
							<ul class="column" v-if="item.columns && item.columns.length > 0">
								<li v-for="filed in item.columns" :key="filed.field_name">
									<div class="image-box">
										<el-image :src="getImgByType(filed.type) || getImgByType('Default')"></el-image>
									</div>
									<div class="info-box">
										<span class="title" v-html="filed.field_name"></span>
										<span class="title" v-if="filed.original_name">( 原表名:</span>
										<span class="title" v-html="filed.original_name"></span>
										<span class="title" v-if="filed.original_name"> )</span>
										<div class="desc" v-html="filed.comment"></div>
									</div>
								</li>
							</ul>
						</li>
						<li class="desc" v-if="noMore">{{ $t('metadata.metadataSearch.noMore') }} ?_(:з」∠)......</li>
						<li v-else class="more" @click="handleSearch(lastId)">
							{{ $t('metadata.metadataSearch.more') }}
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import { getImgByType } from '../../util/util';
export default {
	name: 'Search',
	data() {
		return {
			meta_type: 'table',
			keyword: '',
			showNoSearch: true,
			noMore: false,
			searchData: [],
			originalData: [],
			firstSearch: 0,
			lastId: ''
		};
	},
	watch: {
		keyword: {
			handler() {
				if (this.keyword !== '') {
					this.showNoSearch = false;
					this.$nextTick(() => {
						this.$refs.searchInput.focus();
					});
				}
			}
		}
	},
	methods: {
		getImgByType,
		handleSearch(id) {
			if (this.keyword === '') {
				this.showNoSearch = true;
				return;
			}
			if (this.keyword.length > 100) {
				this.$message.error('检索关键字不能超过100个字符');
			}
			if (id === '') {
				this.firstSearch = 0;
				this.searchData = []; //没有id 视为重新搜索
			}
			let params = this.handleParams(id);
			this.firstSearch = this.firstSearch === 0 ? 1 : this.firstSearch;
			this.$api('MetadataInstances')
				.search(params)
				.then(result => {
					if (!result.data || (result.data && !result.data.records)) {
						this.noMore = true;
						return;
					}
					let resultData = result.data.records.data || [];
					//关键字标记
					this.handleKeywords(resultData || []);
					this.searchData = this.searchData.concat(resultData);
					if (this.searchData.length === 0) {
						this.noMore = true;
						return;
					}
					this.lastId = this.searchData[this.searchData.length - 1].id;
				})
				.catch(err => {
					if (err && err.response) {
						this.$message.error(err.response.msg);
					}
				});
		},
		handleParams(id) {
			let params = {
				type: this.meta_type,
				keyword: this.keyword,
				pageSize: 15,
				lastId: id || ''
			};
			return params;
		},
		handleKeywords(data) {
			let targetData = data || [];
			if (targetData.length === 0) return;
			targetData.forEach(item => {
				if (item.table) {
					item.table.name = this.markKeyword(this.keyword, item.table.name);
					item.table.original_name = this.markKeyword(this.keyword, item.table.original_name);
					if (item.table.comment) item.table.comment = this.markKeyword(this.keyword, item.table.comment);
				}
				if (item.columns && item.columns.length > 0) {
					item.columns.forEach(field => {
						field.field_name = this.markKeyword(this.keyword, field.field_name);
						field.original_field_name = this.markKeyword(this.keyword, field.original_field_name);
						if (field.comment) field.comment = this.markKeyword(this.keyword, field.comment);
					});
				}
			});
		},
		markKeyword(keyword, text) {
			if (keyword && text.indexOf(keyword) !== -1) {
				return text.split(keyword).join(`<span style="color: red">${keyword}</span>`);
			}
			return text;
		},
		handleLoad() {
			if (
				this.$refs.searchResult.scrollHeight -
					this.$refs.searchResult.clientHeight -
					this.$refs.searchResult.scrollTop <
				100
			) {
				this.handleSearch(this.lastId);
			}
		},
		goMetaInfo() {
			this.$router.push('/metadataDetails?id=601dfb9d02c7e300575dbc99');
		},
		getMockData(findObj) {
			let mockData = [];
			let id = findObj.lastId || '';
			if (findObj.pageSize) {
				for (let x = 0; x < findObj.pageSize; x++) {
					let obj = {};
					obj.id = id + x;
					obj.table = {
						name: 'tableName' + obj.id,
						original_name: 'origin table name' + obj.id,
						comment: 'comment ' + obj.id
					};
					if (findObj.type === 'column') {
						obj.columns = [
							{
								field_name: 'column name' + obj.id,
								original_field_name: 'ori column name' + obj.id,
								comment: 'field comment ' + obj.id,
								type: 'string'
							}
						];
					}
					mockData.push(obj);
				}
			}
			return mockData;
		}
	}
};
</script>

<style lang="less">
.metadata-search-wrap {
	.el-input-group__append {
		background: #48b6e2;
		color: #fff;
	}
	.no-search-box {
		.el-input-group__prepend {
			background: #fff;
			color: #48b6e2;
		}
	}
	.search-box {
		.el-input-group__prepend {
			background: #fff;
			color: #666;
		}
	}
}
</style>
<style scoped lang="less">
.metadata-change-background {
	background: #fafafa;
	display: flex;
	height: 100%;
	overflow: hidden;
	width: 100%;
}
.metadata-search-wrap {
	height: 100%;
	overflow: hidden;
	.input-with-select {
		width: 140px;
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
				width: 250px;
				height: 40px;
				color: rgba(72, 182, 226, 100);
				font-size: 24px;
				text-align: left;
				margin-bottom: 10px;
				font-weight: bold;
			}
			.desc {
				margin-top: 10px;
				font-size: 12px;
				color: #ccc;
			}
		}
	}
	.search-box-wrap {
		width: 100%;
		.search-box {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			height: 100%;
			width: 100%;
		}
		.search-result {
			isplay: flex;
			flex: 1;
		}
		.keyword {
			color: #d54e21;
		}
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
				font-size: 14px;
				color: #333;
				font-weight: bold;
				margin-right: 10px;
			}
		}
		.no-result {
			padding-left: 105px;
			margin-top: 20px;
			font-size: 13px;
			color: #666;
		}
		.search-result {
			margin: 10px;
			padding: 10px;
			max-height: 800px;
			overflow-y: auto;
			border-radius: 3px;
			background-color: rgba(255, 255, 255, 100);
			color: rgba(16, 16, 16, 100);
			font-size: 14px;
			box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
			border: 1px solid rgba(255, 255, 255, 100);
		}
		.desc {
			color: #aaa;
			margin-top: 5px;
			margin-bottom: 10px;
		}
		.table {
			li {
				margin-bottom: 10px;
				.table-box-wrap {
					display: flex;
				}
			}
			.table-li {
				border-bottom: 1px solid rgba(238, 238, 238, 100);
				padding-bottom: 10px;
				cursor: pointer;
			}
		}
		.column {
			margin-left: 30px;
			li {
				display: flex;
			}
		}
		.image-box {
			width: 20px;
			height: 20px;
			img {
				width: 100%;
				height: 100%;
			}
		}
		.info-box {
			margin-left: 10px;
			.title {
				color: #48b6e2;
			}
		}
		.more {
			color: #999;
			font-size: 12px;
			cursor: pointer;
		}
	}
}
</style>
