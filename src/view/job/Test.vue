<template>
	<div>
		<Entity ref="sourceEntity" :schema="schema" :editable="true"></Entity>
	</div>
</template>

<script>
	import Entity from './components/Entity1';

	export default {
		name: "Test",
		components: {Entity},

		data() {
			let data = {
				schema:{"name":"字段名 字段类型 操作 ","type":"collection","fields":[{"id":"Logs__id","label":"_id","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_contextMap","label":"contextMap","type":"Map","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,"children":[{"id":"Logs_contextMap_app","label":"app","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_contextMap_jobId","label":"jobId","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_contextMap_jobName","label":"jobName","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_contextMap_userId","label":"userId","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,}]},{"id":"Logs_contextStack","label":"contextStack","type":"Array","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_date","label":"date","type":"Date","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_ip","label":"ip","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_last_updated","label":"last_updated","type":"Date","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_level","label":"level","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_loggerName","label":"loggerName","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_message","label":"message","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_millis","label":"millis","type":"Double","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_threadId","label":"threadId","type":"Integer","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_threadName","label":"threadName","type":"String","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_threadPriority","label":"threadPriority","type":"Integer","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,},{"id":"Logs_thrown","label":"thrown","type":"Null","namecolor":"#606266","datattypecolor":"#606266","isDisabled":false,}]}
				// schema: {"name":"字段名 字段类型 操作 ","type":"collection","fields":[{"id":"Logs__id","label":"_id","type":"String","color":"#dddddd"},{"id":"Logs_contextMap","label":"contextMap","type":"Map","color":"#dddddd","children":[{"id":"Logs_contextMap_app","label":"app","type":"String","color":"#dddddd"},{"id":"Logs_contextMap_jobId","label":"jobId","type":"String","color":"#dddddd"},{"id":"Logs_contextMap_jobName","label":"jobName","type":"String","color":"#dddddd"},{"id":"Logs_contextMap_userId","label":"userId","type":"String","color":"#dddddd"}]},{"id":"Logs_contextStack","label":"contextStack","type":"Array","color":"#dddddd"},{"id":"Logs_date","label":"date","type":"Date","color":"#dddddd"},{"id":"Logs_ip","label":"ip","type":"String","color":"#dddddd"},{"id":"Logs_last_updated","label":"last_updated","type":"Date","color":"#dddddd"},{"id":"Logs_level","label":"level","type":"String","color":"#dddddd"},{"id":"Logs_loggerName","label":"loggerName","type":"String","color":"#dddddd"},{"id":"Logs_message","label":"message","type":"String","color":"#dddddd"},{"id":"Logs_millis","label":"millis","type":"Double","color":"#dddddd"},{"id":"Logs_threadId","label":"threadId","type":"Integer","color":"#dddddd"},{"id":"Logs_threadName","label":"threadName","type":"String","color":"#dddddd"},{"id":"Logs_threadPriority","label":"threadPriority","type":"Integer","color":"#dddddd"},{"id":"Logs_thrown","label":"thrown","type":"Null","color":"#dddddd"}]}
			};
			return data;
		},

	};
</script>

<style lang="less" scoped>
	
</style>
