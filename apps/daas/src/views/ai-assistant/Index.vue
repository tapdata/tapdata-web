<script setup lang="ts">
import {
  buildAiAgentChatPayload,
  streamAiAgentChat,
  type AiAgentToolCallResultEvent,
  type AiAgentToolCallStartEvent,
} from '@tap/api/src/core/ai-agent'
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import { getTables } from '@tap/api/src/core/metadata-instances'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { useI18n } from '@tap/i18n'
import ConnectionPreview from '@tap/ldp/src/ConnectionPreview.vue'
import TablePreview from '@tap/ldp/src/TablePreview.vue'
import { ElMessage } from 'element-plus'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
import {
  appendAssistantToolCallStart,
  applyAssistantToolCallResult,
  buildAssistantContentBlocks,
  createAssistantMessage,
  createDemoAssistantMessage,
  DEFAULT_ASSISTANT_CONFIG,
  formatAssistantToolCallJson,
  loadAssistantConfig,
  saveAssistantConfig,
  type AssistantConfig,
  type AssistantMessage,
  type AssistantResult,
  type AssistantTableAlignment,
  type AssistantToolCall,
} from './logic'

const { t } = useI18n()
const router = useRouter()

const messages = ref<AssistantMessage[]>([])
const composer = ref('')
const sending = ref(false)
const configVisible = ref(false)
const conversationRef = ref<HTMLElement>()
const composerRef = ref<HTMLTextAreaElement>()
const connectionPreviewRef = ref<any>()
const tablePreviewRef = ref<any>()
const sampleTablePreviewVisible = ref(false)
const sampleTablePreviewResult = ref<AssistantResult | null>(null)

const activeConfig = ref<AssistantConfig>({ ...DEFAULT_ASSISTANT_CONFIG })
const configForm = reactive<AssistantConfig>({ ...DEFAULT_ASSISTANT_CONFIG })

let abortController: AbortController | null = null
let demoRunId = 0

const hasMessages = computed(() => messages.value.length > 0)
const canSend = computed(
  () => composer.value.trim().length > 0 && !sending.value,
)
const isRemoteConfigured = computed(() => !!activeConfig.value.authToken)

const samplePrompts = computed(() => [
  t('ai_assistant_prompt_create_connection'),
  t('ai_assistant_prompt_create_task'),
  t('ai_assistant_prompt_preview_table'),
])

function resetConversation(seedDemo = false) {
  demoRunId += 1
  abortController?.abort()
  abortController = null
  sending.value = false
  messages.value = seedDemo
    ? [
        createAssistantMessage('user', t('ai_assistant_sample_user')),
        createDemoAssistantMessage(t('ai_assistant_sample_user')),
      ]
    : []
}

function scrollToBottom() {
  nextTick(() => {
    if (!conversationRef.value) return
    conversationRef.value.scrollTop = conversationRef.value.scrollHeight
  })
}

function adjustComposerHeight() {
  nextTick(() => {
    const textarea = composerRef.value
    if (!textarea) return

    textarea.style.height = 'auto'
    const maxHeight = Number.parseFloat(
      window.getComputedStyle(textarea).maxHeight,
    )
    const nextHeight = Number.isFinite(maxHeight)
      ? Math.min(textarea.scrollHeight, maxHeight)
      : textarea.scrollHeight

    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY =
      Number.isFinite(maxHeight) && textarea.scrollHeight > maxHeight
        ? 'auto'
        : 'hidden'
  })
}

function openConfig() {
  Object.assign(configForm, activeConfig.value)
  configVisible.value = true
}

function handleSaveConfig() {
  activeConfig.value = saveAssistantConfig(configForm, window.localStorage)
  Object.assign(configForm, activeConfig.value)
  configVisible.value = false
  ElMessage.success(t('public_message_save_ok'))
}

function fillPrompt(prompt: string) {
  composer.value = prompt
}

function resultValue(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

function resultMetadata(result: AssistantResult, keys: string[]) {
  for (const key of keys) {
    const value = result.metadata?.[key] ?? result.source?.[key]
    const text = resultValue(value)
    if (text) return text
  }
  return ''
}

function openResultInNewTab(result: AssistantResult) {
  if (!result.route) return
  const route = router.resolve(result.route)
  window.open(route.href, '_blank', 'noopener,noreferrer')
}

function canOpenResultToken(result: AssistantResult) {
  if (result.type === 'task') return !!result.route
  if (result.type === 'connection') {
    return !!resultMetadata(result, ['id', 'connectionId']) || !!result.route
  }
  if (result.type === 'model' || result.type === 'table') {
    return (
      !!result.tablePreview ||
      !!resultMetadata(result, ['id', 'metadataId']) ||
      !!result.route
    )
  }
  return !!result.route
}

async function loadConnection(connectionId: string) {
  try {
    return await getConnectionNoSchema(connectionId)
  } catch (error: any) {
    ElMessage.error(error?.message || t('ai_assistant_error_send'))
    return null
  }
}

async function openConnectionPreview(result: AssistantResult) {
  const id = resultMetadata(result, ['id', 'connectionId'])
  if (!id) {
    openResultInNewTab(result)
    return
  }

  const connection =
    result.source && result.source.config
      ? result.source
      : await loadConnection(id)

  if (connection) {
    connectionPreviewRef.value?.open(connection)
    return
  }

  openResultInNewTab(result)
}

async function resolveTablePreviewRow(result: AssistantResult) {
  const connectionId = resultMetadata(result, ['connectionId'])
  const metadataId = resultMetadata(result, ['metadataId', 'id'])
  const tableName =
    resultMetadata(result, ['collectionName', 'tableName', 'name']) ||
    result.label

  if (connectionId && metadataId) {
    return {
      ...(result.source || {}),
      id: metadataId,
      name: tableName,
      connectionId,
      LDP_TYPE: 'table',
      sourceType: resultMetadata(result, ['modelType', 'sourceType']),
    }
  }

  if (connectionId && tableName) {
    try {
      const tables = await getTables(connectionId)
      const tableItems = Array.isArray(tables)
        ? tables
        : Array.isArray((tables as any)?.items)
          ? (tables as any).items
          : []
      const table = tableItems.find((item: any) => item?.name === tableName)
      if (table) {
        return {
          ...table,
          connectionId,
          LDP_TYPE: 'table',
        }
      }
    } catch {
      // Fall back to the local sample preview below.
    }
  }

  return null
}

async function openTableResult(result: AssistantResult) {
  const row = await resolveTablePreviewRow(result)
  if (row?.id && row?.connectionId) {
    const connection = await loadConnection(row.connectionId)
    tablePreviewRef.value?.open(row, connection || null)
    return
  }

  if (result.tablePreview) {
    sampleTablePreviewResult.value = result
    sampleTablePreviewVisible.value = true
    return
  }

  openResultInNewTab(result)
}

function handleResultTokenClick(result: AssistantResult) {
  if (result.type === 'task') {
    openResultInNewTab(result)
    return
  }

  if (result.type === 'connection') {
    openConnectionPreview(result)
    return
  }

  if (result.type === 'model' || result.type === 'table') {
    openTableResult(result)
    return
  }

  openResultInNewTab(result)
}

function toggleToolCall(toolCall: AssistantToolCall) {
  toolCall.expanded = !toolCall.expanded
}

function getToolCallStatusLabel(status: AssistantToolCall['status']) {
  return t(`ai_assistant_tool_status_${status}`)
}

function getToolCallSummary(toolCall: AssistantToolCall) {
  if (toolCall.status === 'running') {
    return getToolCallStatusLabel(toolCall.status)
  }

  if (toolCall.results.length) {
    return t('ai_assistant_tool_result_count', [toolCall.results.length])
  }

  return getToolCallStatusLabel(toolCall.status)
}

function getToolArgumentsPreview(toolCall: AssistantToolCall) {
  return formatAssistantToolCallJson(toolCall)
}

function getContentBlocks(message: AssistantMessage) {
  return buildAssistantContentBlocks(message.content, message.results)
}

function getTableAlignClass(alignment: AssistantTableAlignment) {
  return alignment ? `is-${alignment}` : ''
}

function pushAssistantMessage(message: AssistantMessage) {
  messages.value.push(message)
  return messages.value.at(-1)
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function streamDemoResponse(input: string) {
  const currentRun = ++demoRunId
  const demo = createDemoAssistantMessage(input)
  const assistant = createAssistantMessage('assistant', '', {
    workedSeconds: demo.workedSeconds,
  })
  const assistantMessage = pushAssistantMessage(assistant)
  scrollToBottom()

  const chars = Array.from(demo.content)
  for (const char of chars) {
    if (currentRun !== demoRunId) return
    assistantMessage.content += char
    scrollToBottom()
    await delay(18)
  }

  assistantMessage.results = demo.results
  scrollToBottom()
}

async function streamRemoteResponse() {
  const assistant = pushAssistantMessage(
    createAssistantMessage('assistant', '', {
      workedSeconds: 1,
    }),
  )
  const startedAt = Date.now()
  scrollToBottom()

  const updateWorkedTime = () => {
    assistant.workedSeconds = Math.max(
      1,
      Math.floor((Date.now() - startedAt) / 1000),
    )
  }

  const workedTimeTimer = window.setInterval(updateWorkedTime, 1000)

  const clearWorkedTimeTimer = () => {
    window.clearInterval(workedTimeTimer)
  }

  const appendMessageDelta = (content: string) => {
    if (!content) return
    assistant.content += content
    assistant.content = assistant.content.replaceAll(/tapdata/gi, 'Tapstate')
    scrollToBottom()
  }

  const appendToolStart = (event: AiAgentToolCallStartEvent) => {
    appendAssistantToolCallStart(assistant, event)
    scrollToBottom()
  }

  const appendToolResult = (event: AiAgentToolCallResultEvent) => {
    applyAssistantToolCallResult(assistant, event)
    scrollToBottom()
  }

  try {
    await new Promise<void>((resolve, reject) => {
      abortController = streamAiAgentChat(
        buildAiAgentChatPayload(activeConfig.value, messages.value),
        {
          onMessageDelta(content) {
            appendMessageDelta(content)
          },
          onToolCallStart: appendToolStart,
          onToolCallResult: appendToolResult,
          onDone() {
            clearWorkedTimeTimer()
            updateWorkedTime()
            if (!assistant.content.trim() && !assistant.toolCalls.length) {
              assistant.content = t('ai_assistant_empty_response')
            }
            resolve()
          },
          onAbort() {
            clearWorkedTimeTimer()
            resolve()
          },
          onError(message) {
            clearWorkedTimeTimer()
            reject(new Error(message))
          },
        },
      )
    })
  } finally {
    clearWorkedTimeTimer()
  }
}

async function sendMessage() {
  const input = composer.value.trim()
  if (!input || sending.value) return

  messages.value.push(createAssistantMessage('user', input))
  composer.value = ''
  sending.value = true
  scrollToBottom()

  try {
    if (isRemoteConfigured.value) {
      await streamRemoteResponse()
    } else {
      await streamDemoResponse(input)
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') return

    const message = createAssistantMessage(
      'assistant',
      t('ai_assistant_error_response', [error?.message || 'Unknown error']),
    )
    messages.value.push(message)
    ElMessage.error(error?.message || t('ai_assistant_error_send'))
  } finally {
    sending.value = false
    abortController = null
    scrollToBottom()
  }
}

function handleComposerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  sendMessage()
}

onMounted(() => {
  activeConfig.value = loadAssistantConfig(window.localStorage)
  Object.assign(configForm, activeConfig.value)
  resetConversation()
  adjustComposerHeight()
})

onBeforeUnmount(() => {
  demoRunId += 1
  abortController?.abort()
})

watch(composer, adjustComposerHeight)
</script>

<template>
  <PageContainer>
    <template #left-actions>
      <ElButton class="ml-2 rounded-lg" circle @click="resetConversation()">
        <template #icon>
          <i-lucide-plus />
        </template>
      </ElButton>
    </template>

    <template #actions>
      <!-- <span class="assistant-status" :class="{ active: isRemoteConfigured }">
        {{
          isRemoteConfigured ? t('ai_assistant_remote') : t('ai_assistant_demo')
        }}
      </span> -->
      <ElButton @click="openConfig">
        <el-icon><i-lucide-settings /></el-icon>
        <span>{{ t('ai_assistant_llm_config') }}</span>
      </ElButton>
    </template>
    <section class="assistant-surface h-100">
      <main ref="conversationRef" class="assistant-conversation">
        <div v-if="!hasMessages" class="assistant-empty">
          <h2>{{ t('ai_assistant_empty_title') }}</h2>
          <div class="assistant-suggestions">
            <button
              v-for="prompt in samplePrompts"
              :key="prompt"
              type="button"
              @click="fillPrompt(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </div>

        <template v-for="message in messages" :key="message.id">
          <article
            v-if="message.role === 'user'"
            class="assistant-message assistant-message--user"
          >
            <div class="assistant-user-bubble">{{ message.content }}</div>
          </article>

          <article
            v-else
            class="assistant-message assistant-message--assistant"
          >
            <div v-if="message.workedSeconds" class="assistant-worked-time">
              {{ t('ai_assistant_worked_seconds', [message.workedSeconds]) }}
            </div>

            <div v-if="message.toolCalls.length" class="assistant-tool-calls">
              <section
                v-for="toolCall in message.toolCalls"
                :key="toolCall.id"
                class="assistant-tool-call"
                :class="`is-${toolCall.status}`"
              >
                <button
                  class="assistant-tool-call__header"
                  type="button"
                  @click="toggleToolCall(toolCall)"
                >
                  <span class="assistant-tool-call__title">
                    <el-icon class="assistant-tool-call__tool-icon">
                      <i-lucide-wrench />
                    </el-icon>
                    <span>{{ toolCall.name }}</span>
                  </span>
                  <span class="assistant-tool-call__summary">
                    <span>{{ getToolCallSummary(toolCall) }}</span>
                    <el-icon
                      v-if="toolCall.status === 'running'"
                      class="assistant-tool-call__status-icon"
                    >
                      <i-lucide-loader-circle />
                    </el-icon>
                    <el-icon>
                      <i-lucide-chevron-down v-if="toolCall.expanded" />
                      <i-lucide-chevron-right v-else />
                    </el-icon>
                  </span>
                </button>

                <div
                  v-show="toolCall.expanded"
                  class="assistant-tool-call__body"
                >
                  <pre
                    v-if="getToolArgumentsPreview(toolCall)"
                    class="assistant-tool-call__args"
                    data-lang="json"
                    >{{ getToolArgumentsPreview(toolCall) }}</pre
                  >
                </div>
              </section>
            </div>

            <div
              v-if="message.content || (sending && !message.toolCalls.length)"
              class="assistant-copy"
            >
              <template
                v-for="block in getContentBlocks(message)"
                :key="`${message.id}-${block.id}`"
              >
                <p v-if="block.type === 'paragraph'">
                  <template
                    v-for="(part, partIndex) in block.parts"
                    :key="`${message.id}-${block.id}-${partIndex}`"
                  >
                    <span v-if="part.type === 'text'">{{ part.text }}</span>
                    <span
                      v-else
                      class="assistant-inline-result-token"
                      :class="{
                        'is-actionable': canOpenResultToken(part.result),
                      }"
                    >
                      <button
                        class="assistant-inline-result-token__main"
                        type="button"
                        :disabled="!canOpenResultToken(part.result)"
                        @click="handleResultTokenClick(part.result)"
                      >
                        <span class="assistant-inline-result-token__icon">
                          <i-lucide-database
                            v-if="part.result.type === 'connection'"
                          />
                          <i-lucide-git-branch
                            v-else-if="part.result.type === 'task'"
                          />
                          <i-lucide-table-2 v-else />
                        </span>
                        <span>{{ part.result.label }}</span>
                      </button>
                      <button
                        v-if="part.result.route"
                        class="assistant-inline-result-token__open"
                        type="button"
                        aria-label="Open in new tab"
                        @click.stop="openResultInNewTab(part.result)"
                      >
                        <i-lucide-external-link />
                      </button>
                    </span>
                  </template>
                </p>
                <figure
                  v-else-if="block.type === 'code'"
                  class="assistant-code-block"
                  :class="{ 'is-streaming': !block.closed }"
                >
                  <figcaption v-if="block.language || !block.closed">
                    <span>{{ block.language || 'text' }}</span>
                  </figcaption>
                  <pre><code>{{ block.content }}</code></pre>
                </figure>
                <div
                  v-else-if="block.type === 'table'"
                  class="assistant-table-wrap"
                >
                  <table class="assistant-markdown-table">
                    <thead>
                      <tr>
                        <th
                          v-for="(header, headerIndex) in block.headers"
                          :key="`${message.id}-${block.id}-header-${headerIndex}`"
                          :class="
                            getTableAlignClass(block.alignments[headerIndex])
                          "
                        >
                          <template
                            v-for="(part, partIndex) in header.parts"
                            :key="`${message.id}-${block.id}-header-${headerIndex}-${partIndex}`"
                          >
                            <span v-if="part.type === 'text'">{{
                              part.text
                            }}</span>
                            <span
                              v-else
                              class="assistant-inline-result-token"
                              :class="{
                                'is-actionable': canOpenResultToken(
                                  part.result,
                                ),
                              }"
                            >
                              <button
                                class="assistant-inline-result-token__main"
                                type="button"
                                :disabled="!canOpenResultToken(part.result)"
                                @click="handleResultTokenClick(part.result)"
                              >
                                <span
                                  class="assistant-inline-result-token__icon"
                                >
                                  <i-lucide-database
                                    v-if="part.result.type === 'connection'"
                                  />
                                  <i-lucide-git-branch
                                    v-else-if="part.result.type === 'task'"
                                  />
                                  <i-lucide-table-2 v-else />
                                </span>
                                <span>{{ part.result.label }}</span>
                              </button>
                              <button
                                v-if="part.result.route"
                                class="assistant-inline-result-token__open"
                                type="button"
                                aria-label="Open in new tab"
                                @click.stop="openResultInNewTab(part.result)"
                              >
                                <i-lucide-external-link />
                              </button>
                            </span>
                          </template>
                        </th>
                      </tr>
                    </thead>
                    <tbody v-if="block.rows.length">
                      <tr
                        v-for="(row, rowIndex) in block.rows"
                        :key="`${message.id}-${block.id}-row-${rowIndex}`"
                      >
                        <td
                          v-for="(cell, cellIndex) in row"
                          :key="`${message.id}-${block.id}-row-${rowIndex}-${cellIndex}`"
                          :class="
                            getTableAlignClass(block.alignments[cellIndex])
                          "
                        >
                          <template
                            v-for="(part, partIndex) in cell.parts"
                            :key="`${message.id}-${block.id}-row-${rowIndex}-${cellIndex}-${partIndex}`"
                          >
                            <span v-if="part.type === 'text'">{{
                              part.text
                            }}</span>
                            <span
                              v-else
                              class="assistant-inline-result-token"
                              :class="{
                                'is-actionable': canOpenResultToken(
                                  part.result,
                                ),
                              }"
                            >
                              <button
                                class="assistant-inline-result-token__main"
                                type="button"
                                :disabled="!canOpenResultToken(part.result)"
                                @click="handleResultTokenClick(part.result)"
                              >
                                <span
                                  class="assistant-inline-result-token__icon"
                                >
                                  <i-lucide-database
                                    v-if="part.result.type === 'connection'"
                                  />
                                  <i-lucide-git-branch
                                    v-else-if="part.result.type === 'task'"
                                  />
                                  <i-lucide-table-2 v-else />
                                </span>
                                <span>{{ part.result.label }}</span>
                              </button>
                              <button
                                v-if="part.result.route"
                                class="assistant-inline-result-token__open"
                                type="button"
                                aria-label="Open in new tab"
                                @click.stop="openResultInNewTab(part.result)"
                              >
                                <i-lucide-external-link />
                              </button>
                            </span>
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul
                  v-else-if="block.type === 'list-item'"
                  class="assistant-rich-list"
                >
                  <li>
                    <template
                      v-for="(part, partIndex) in block.parts"
                      :key="`${message.id}-${block.id}-${partIndex}`"
                    >
                      <span v-if="part.type === 'text'">{{ part.text }}</span>
                      <span
                        v-else
                        class="assistant-inline-result-token"
                        :class="{
                          'is-actionable': canOpenResultToken(part.result),
                        }"
                      >
                        <button
                          class="assistant-inline-result-token__main"
                          type="button"
                          :disabled="!canOpenResultToken(part.result)"
                          @click="handleResultTokenClick(part.result)"
                        >
                          <span class="assistant-inline-result-token__icon">
                            <i-lucide-database
                              v-if="part.result.type === 'connection'"
                            />
                            <i-lucide-git-branch
                              v-else-if="part.result.type === 'task'"
                            />
                            <i-lucide-table-2 v-else />
                          </span>
                          <span>{{ part.result.label }}</span>
                        </button>
                        <button
                          v-if="part.result.route"
                          class="assistant-inline-result-token__open"
                          type="button"
                          aria-label="Open in new tab"
                          @click.stop="openResultInNewTab(part.result)"
                        >
                          <i-lucide-external-link />
                        </button>
                      </span>
                    </template>
                  </li>
                </ul>
              </template>
              <span v-if="sending && !message.content" class="typing-caret" />
            </div>
          </article>
        </template>
      </main>

      <footer class="assistant-composer-wrap">
        <div class="assistant-composer">
          <textarea
            ref="composerRef"
            v-model="composer"
            :placeholder="t('ai_assistant_reply_placeholder')"
            rows="2"
            @input="adjustComposerHeight"
            @keydown="handleComposerKeydown"
          />
          <div class="assistant-composer__footer">
            <div />
            <div class="assistant-composer__actions">
              <button
                class="assistant-send-button"
                type="button"
                :disabled="!canSend"
                @click="sendMessage"
              >
                <el-icon v-if="sending"><i-lucide-loader-circle /></el-icon>
                <el-icon v-else><i-lucide-arrow-up /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </section>

    <ElDialog
      v-model="configVisible"
      width="520px"
      :close-on-click-modal="false"
      append-to-body
    >
      <template #header>
        <div class="assistant-config-dialog__header">
          <strong>{{ t('ai_assistant_llm_config') }}</strong>
        </div>
      </template>

      <ElForm label-position="top" class="assistant-config-form">
        <ElFormItem :label="t('ai_assistant_base_url')">
          <ElInput
            v-model="configForm.baseUrl"
            placeholder="https://api.openai.com/v1"
          />
        </ElFormItem>
        <ElFormItem :label="t('ai_assistant_auth_token')">
          <ElInput
            v-model="configForm.authToken"
            type="password"
            show-password
            placeholder="sk-..."
          />
        </ElFormItem>
        <ElFormItem :label="t('ai_assistant_model')">
          <ElInput v-model="configForm.model" placeholder="gpt-4.1" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="configVisible = false">
          {{ t('public_button_cancel') }}
        </ElButton>
        <ElButton type="primary" @click="handleSaveConfig">
          {{ t('public_button_save') }}
        </ElButton>
      </template>
    </ElDialog>
    <ConnectionPreview ref="connectionPreviewRef" />
    <TablePreview ref="tablePreviewRef" />
    <ElDrawer
      v-model="sampleTablePreviewVisible"
      :title="sampleTablePreviewResult?.label"
      size="720px"
      append-to-body
    >
      <ElTable
        v-if="sampleTablePreviewResult?.tablePreview"
        class="assistant-sample-table-preview"
        :data="sampleTablePreviewResult.tablePreview.rows"
        border
      >
        <ElTableColumn
          v-for="column in sampleTablePreviewResult.tablePreview.columns"
          :key="column"
          :prop="column"
          :label="column"
          min-width="140"
          show-overflow-tooltip
        />
      </ElTable>
    </ElDrawer>
  </PageContainer>
</template>

<style scoped lang="scss">
:deep(.ai-assistant-page) {
  min-height: 0;
  padding: 0 16px 16px 0;
}

:deep(.ai-assistant-content) {
  display: flex;
  min-height: 0;
}

.assistant-surface {
  --assistant-bg: #f5f5f6;
  --assistant-border: #dedfe3;
  --assistant-border-soft: #ececef;
  --assistant-composer-min-height: 42px;
  --assistant-composer-max-height: 180px;
  --assistant-text: #25262b;
  --assistant-muted: #7c8089;
  --assistant-muted-light: #a0a3aa;
  --assistant-link: #5b62d6;

  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  width: 100%;
  min-height: 0;
  color: var(--assistant-text);
  overflow: hidden;
}

.assistant-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 18px;
  border-bottom: 1px solid var(--assistant-border-soft);
}

.assistant-toolbar__left,
.assistant-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.assistant-toolbar h1 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.assistant-toolbar p {
  margin: 0;
  color: var(--assistant-muted);
  font-size: 12px;
  line-height: 18px;
}

.assistant-icon-button {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #dddfe5;
  border-radius: 8px;
  color: #555961;
}

.assistant-config-button {
  height: 30px;
  padding: 0 10px;
  border-color: #dddfe5;
  border-radius: 8px;
  background: #fff;
  color: #5e6169;
  font-size: 13px;
}

.assistant-status {
  color: var(--assistant-muted-light);
  font-size: 12px;
}

.assistant-status.active {
  color: #4f7561;
}

.assistant-conversation {
  position: relative;
  min-height: 0;
  padding: 38px 0 150px;
  overflow: auto;
  background: #fff;
}

.assistant-message {
  max-width: 680px;
  margin: 0 auto 26px;
}

.assistant-message--user {
  display: flex;
  justify-content: flex-end;
  max-width: 850px;
}

.assistant-user-bubble {
  max-width: 520px;
  padding: 10px 13px;
  border: 1px solid var(--assistant-border-soft);
  border-radius: 10px;
  background: #f4f4f5;
  color: #2e3035;
  font-size: 14px;
  line-height: 1.55;
}

.assistant-worked-time {
  margin-bottom: 12px;
  color: var(--assistant-muted);
  font-size: 13px;
}

.assistant-worked-time span {
  margin-left: 4px;
  color: var(--assistant-muted-light);
  font-size: 11px;
}

.assistant-copy {
  color: var(--assistant-text);
  font-size: 15px;
  line-height: 1.72;
}

.assistant-copy p {
  margin: 0 0 10px;
}

.assistant-rich-list {
  margin: 0 0 10px;
  padding-left: 24px;
}

.assistant-rich-list li {
  margin: 0 0 8px;
  padding-left: 2px;
}

.assistant-table-wrap {
  max-width: 100%;
  margin: 14px 0;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow-x: auto;
  background: #fff;
}

.assistant-markdown-table {
  width: 100%;
  min-width: 520px;
  border-collapse: separate;
  border-spacing: 0;
  color: #2f333b;
  font-size: 13px;
  line-height: 1.5;
}

.assistant-markdown-table th,
.assistant-markdown-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
}

.assistant-markdown-table th:not(:last-child),
.assistant-markdown-table td:not(:last-child) {
  border-right: 1px solid #f0f2f5;
}

.assistant-markdown-table th {
  background: #f7f8fa;
  color: #60646f;
  font-weight: 600;
}

.assistant-markdown-table td {
  background: #fff;
}

.assistant-markdown-table tbody tr:hover td {
  background: #fafbfc;
}

.assistant-markdown-table tr:last-child td {
  border-bottom: 0;
}

.assistant-markdown-table .is-center {
  text-align: center;
}

.assistant-markdown-table .is-right {
  text-align: right;
}

.assistant-code-block {
  margin: 14px 0;
  border-radius: 12px;
  background: #f3f3f3;
  color: #0d0d0d;
  overflow: hidden;
}

.assistant-code-block figcaption {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  color: #6f737b;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    monospace;
  font-size: 12px;
  line-height: 1;
}

.assistant-code-block pre {
  margin: 0;
  padding: 14px;
  overflow: auto;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    monospace;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre;
}

.assistant-code-block code {
  font: inherit;
}

.assistant-code-block.is-streaming pre::after {
  display: inline-block;
  width: 7px;
  height: 14px;
  margin-left: 2px;
  border-radius: 999px;
  background: #373a42;
  content: '';
  vertical-align: -2px;
  animation: assistant-caret 1s infinite;
}

.assistant-inline-result-token {
  display: inline-flex;
  align-items: stretch;
  max-width: 100%;
  min-height: 24px;
  margin: 0 2px;
  border: 1px solid #dcdee5;
  border-radius: 7px;
  background: #eef0f3;
  color: #30323a;
  line-height: 1;
  vertical-align: baseline;
  overflow: hidden;
}

.assistant-inline-result-token.is-actionable:hover {
  border-color: #cbd0da;
  background: #e9ebef;
  color: var(--assistant-link);
}

.assistant-inline-result-token__main,
.assistant-inline-result-token__open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.assistant-inline-result-token__main {
  gap: 5px;
  min-height: 24px;
  padding: 0 7px;
}

.assistant-inline-result-token__main:not(:disabled),
.assistant-inline-result-token__open {
  cursor: pointer;
}

.assistant-inline-result-token__main:disabled {
  cursor: default;
}

.assistant-inline-result-token__open {
  width: 24px;
  border-left: 1px solid #dcdee5;
  color: #656a74;
  font-size: 13px;
}

.assistant-inline-result-token__open:hover {
  background: #dde1e8;
  color: var(--assistant-link);
}

.assistant-inline-result-token__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6670d8;
  font-size: 15px;
}

.assistant-sample-table-preview {
  width: 100%;
}

.typing-caret {
  display: inline-block;
  width: 7px;
  height: 15px;
  border-radius: 999px;
  background: #25262b;
  animation: assistant-caret 1s infinite;
}

.assistant-tool-calls {
  display: grid;
  gap: 10px;
  margin: 12px 0 16px;
}

.assistant-tool-call {
  color: #8f9299;
}

.assistant-tool-call__header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8f9299;
  cursor: pointer;
}

.assistant-tool-call__title,
.assistant-tool-call__summary {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.assistant-tool-call__title {
  gap: 7px;
  font-size: 14px;
  font-weight: 500;
}

.assistant-tool-call__title span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assistant-tool-call__summary {
  flex-shrink: 0;
  gap: 5px;
  color: var(--assistant-muted);
  font-size: 12px;
}

.assistant-tool-call__tool-icon {
  color: #8d9097;
  font-size: 15px;
}

.assistant-tool-call__status-icon {
  color: #8d9097;
}

.assistant-tool-call.is-running .assistant-tool-call__status-icon {
  animation: assistant-spin 1s linear infinite;
}

.assistant-tool-call__body {
  padding-top: 8px;
}

.assistant-tool-call__args {
  position: relative;
  max-height: 360px;
  padding: 36px 16px 14px;
  margin: 0;
  border: 0;
  border-radius: 8px;
  background: #ededee;
  color: #4f535b;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
}

.assistant-tool-call__args::before {
  position: absolute;
  top: 10px;
  left: 16px;
  color: #6f737b;
  content: attr(data-lang);
  font-family: inherit;
  font-size: 13px;
}

.assistant-empty {
  display: grid;
  place-items: center;
  min-height: 100%;
  align-content: center;
  gap: 18px;
  color: var(--assistant-muted);
}

.assistant-empty h2 {
  margin: 0;
  color: #2d2f36;
  font-size: 18px;
  font-weight: 600;
}

.assistant-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.assistant-suggestions button {
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid #e0e1e6;
  border-radius: 999px;
  background: #fff;
  color: #5f636c;
  font-size: 13px;
  cursor: pointer;
}

.assistant-suggestions button:hover {
  background: #f7f7f8;
}

.assistant-composer-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 28px 18px;
  background: #fff;
}

.assistant-composer {
  width: min(680px, 100%);
  padding: 12px 13px;
  border: 1px solid var(--assistant-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(23, 24, 29, 0.04);
}

.assistant-composer textarea {
  display: block;
  width: 100%;
  min-height: var(--assistant-composer-min-height);
  max-height: var(--assistant-composer-max-height);
  padding: 0;
  border: 0;
  outline: none;
  resize: none;
  color: var(--assistant-text);
  font-size: 15px;
  line-height: 1.6;
  overflow-y: hidden;
}

.assistant-composer textarea::placeholder {
  color: var(--assistant-muted-light);
}

.assistant-composer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.assistant-skill-button,
.assistant-composer__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border: 0;
  background: #fff;
  color: #6f737c;
  font-size: 13px;
  cursor: pointer;
}

.assistant-skill-button {
  gap: 6px;
  padding: 0;
}

.assistant-skill-button span {
  color: #777b84;
  font-size: 15px;
}

.assistant-skill-button i {
  color: #9da1a9;
  font-size: 10px;
  font-style: normal;
}

.assistant-composer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.assistant-composer__actions button {
  width: 28px;
}

.assistant-send-button {
  border: 1px solid #e0e1e6 !important;
  border-radius: 999px;
}

.assistant-send-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.assistant-send-button .el-icon {
  animation: none;
}

.assistant-send-button .i-lucide-loader-circle {
  animation: assistant-spin 1s linear infinite;
}

:global(.assistant-config-dialog .el-dialog__header) {
  padding: 18px 18px 10px;
  margin-right: 0;
}

:global(.assistant-config-dialog .el-dialog__body) {
  padding: 0 18px;
}

:global(.assistant-config-dialog .el-dialog__footer) {
  padding: 16px 18px 18px;
}

.assistant-config-dialog__header {
  display: grid;
  gap: 4px;
}

.assistant-config-dialog__header strong {
  color: #25262b;
  font-size: 15px;
}

.assistant-config-dialog__header span {
  color: var(--assistant-muted);
  font-size: 13px;
}

.assistant-config-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    color: #454851;
    font-size: 13px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dedfe5 inset;
  }
}

@keyframes assistant-caret {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

@keyframes assistant-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
