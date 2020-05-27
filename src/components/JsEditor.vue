<template>
	<div ref="container" class="monaco" :style="{width:width}"></div>
</template>

<script>
	import * as monaco from "monaco-editor";// 包体很大了 但是demo可以跑起来
	import {EditorEventType} from "../editor/lib/events";
	const suggestions = [
		{
			label: '测试1',
			insertText: '测试1', // 不写的时候不展示。。
			detail: '提示的文字'
		},
		{
			label: '测试2',
			insertText: '测试22',
			detail: '提示的文字'
		},
		{
			label: '格式化',
			insertText: 'format()',
			detail: '说明'
		}
	];
	export default{
		props: {
			code: {
				required: true,
				value: String
			},
			width: {
				required: true,
				value: Number
			},
		},
		mounted() {
			monaco.languages.registerCompletionItemProvider('javascript', {
				provideCompletionItems() {
					return {
						suggestions: suggestions
					};
				},
				triggerCharacters: [' ','.']  // 写触发提示的字符，可以有多个
			});
			// monaco.languages.typescript.javascriptDefaults.addExtraLib([
			// 	'declare class Facts {',
			// 	'    /**',
			// 	'     * Returns the next fact',
			// 	'     */',
			// 	'    static next():string',
			// 	'}',
			// ].join('\n'), 'ts:filename/facts.d.ts');
			let self = this;
			setTimeout(function () {
				self.inti();
			},50)
		},
		watch:{
			width:{
				handler() {
					this.inti();
				}
			}
		},
		methods:{
			inti(){
				let self = this;
				self.$refs.container.innerHTML = '';
				var editor = monaco.editor.create(this.$refs.container, {
					value: this.code,
					language: 'javascript',
					minimap:{
						enabled:false
					},
					fontSize:'12px',
					fixedOverflowWidgets: true, // 超出编辑器大小的使用fixed属性显示
				});
				editor.onDidChangeModelContent(function(event){
					self.$emit("update:code", editor.getValue());
				});
			},

		}
	}
</script>
<style scoped>
	.monaco{
		width:95%;
		height:400px;
		border:1px solid #DCDFE6;
		text-align: left;
		margin-right: 20px;
		border-radius: 4px;
	}
</style>
