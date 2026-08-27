export const DEFAULT_ALARM_TITLE = '{workflowName}'

export const DEFAULT_ALARM_HTML = `<div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #374151; line-height: 1.6; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);" class="email-content-root">
<div style="text-align: center; margin-bottom: 16px;" class="email-root-header">
<div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #eff6ff; border-radius: 50%; font-size: 24px;" class="email-root-header-icon"><p class="ace-line" style="margin: 0; font-size: inherit;">🔔</p></div>
</div>
<h1 style="font-size: 20px; font-weight: 600; color: #111827; text-align: center; margin: 0 0 8px 0;"><strong>Workflow Notification</strong></h1>
<p class="ace-line" style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 32px 0;">This message was sent by a workflow step</p>
<hr style="height: 1px; background: #f3f4f6; border: none; margin: 24px 0;">
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Workflow Name</strong></p>
<p class="ace-line" style="margin: 8px 0; font-size: 14px;">{workflowName}</p>
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Task Name</strong></p>
<p class="ace-line" style="margin: 8px 0; font-size: 14px;">{taskName}</p>
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Inspect Name</strong></p>
<p class="ace-line" style="margin: 8px 0; font-size: 14px;">{inspectName}</p>
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Task Desc</strong></p>
<p class="ace-line" style="margin: 8px 0; font-size: 14px;">{taskDesc}</p>
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Time</strong></p>
<p class="ace-line" style="margin: 8px 0; font-size: 14px;">{alarmTime}</p>
<p class="ace-line" style="font-size: 14px; margin: 16px 0 4px 0;"><strong style="font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Details</strong></p>
<pre style="background-color: rgba(56, 56, 56, 0.04); color: rgba(30, 32, 36, 0.95); border: 1px solid rgba(37, 39, 45, 0.1); margin-top: 1rem; margin-bottom: 1rem; padding: 1em; font-size: 1rem; border-radius: 12px; white-space: pre-wrap;"><code style="font-family: JetBrains Mono NL, monospace; font-size: 0.875em; line-height: 1.4; padding: 0.1em 0.2em; background-color: rgba(0, 0, 0, 0); border: none; border-radius: 0; color: inherit;">{details}</code></pre>
<hr style="height: 1px; background: #f3f4f6; border: none; margin: 24px 0;">
<p class="ace-line" style="color: #9ca3af; font-size: 12px; line-height: 1.4; text-align: center; margin: 16px 0 0 0;"><em style="font-style: normal;">This email is sent by TapData</em></p>
</div>`

export const ALARM_TEMPLATE_VARIABLES = [
  { name: 'workflowName', labelKey: 'packages_business_workflow_name', icon: 'file' },
  { name: 'taskName', labelKey: 'public_task_name', icon: 'file' },
  { name: 'inspectName', labelKey: 'packages_business_workflow_inspects', icon: 'file' },
  { name: 'taskDesc', labelKey: 'packages_business_workflow_alarm_var_task_desc', icon: 'file' },
  { name: 'stepName', labelKey: 'packages_business_workflow_alarm_var_step_name', icon: 'file' },
  { name: 'triggerType', labelKey: 'packages_business_workflow_alarm_var_trigger_type', icon: 'file' },
  { name: 'runId', labelKey: 'packages_business_workflow_run_id', icon: 'hash' },
  { name: 'alarmTime', labelKey: 'packages_business_workflow_alarm_var_time', icon: 'clock' },
  { name: 'details', labelKey: 'packages_business_workflow_alarm_var_details', icon: 'file' },
  { name: 'delayTime', labelKey: 'public_delay_time', icon: 'clock' },
] as const

export const EMAIL_CARD_JUICE_CSS = `
    .email-content-root {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .email-root-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .email-root-header-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #eff6ff;
      border-radius: 50%;
      font-size: 24px;
    }
    .email-root-header-icon > .ace-line {
      margin: 0;
      font-size: inherit;
    }
    .ace-line {
      margin: 8px 0;
      font-size: 14px;
    }
    .ace-line + .ace-line {
      margin-top: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      text-align: center;
      margin: 0 0 8px 0 !important;
    }
    h1 + .ace-line {
      color: #6b7280;
      font-size: 14px;
      text-align: center;
      margin: 0 0 32px 0;
    }
    hr {
      height: 1px;
      background: #f3f4f6;
      border: none;
      margin: 24px 0;
    }
    .ace-line strong {
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ace-line:has(strong) {
      margin: 16px 0 4px 0;
    }
    pre {
      background-color: rgba(56, 56, 56, 0.04);
      color: rgba(30, 32, 36, 0.95);
      border: 1px solid rgba(37, 39, 45, 0.1);
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding: 1em;
      font-size: 1rem;
      border-radius: 12px;
      white-space: pre-wrap;
    }
    code {
      background-color: rgba(15, 22, 36, 0.05);
      border: 1px solid rgba(37, 39, 45, 0.1);
      font-family: JetBrains Mono NL, monospace;
      font-size: 0.875em;
      line-height: 1.4;
      border-radius: 6px;
      padding: 0.1em 0.2em;
    }
    pre code {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      border-radius: 0;
      -webkit-text-fill-color: inherit;
      color: inherit;
    }
    .ace-line:has(em) {
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.4;
      text-align: center;
      margin: 16px 0 0 0;
    }
    .ace-line em {
      font-style: normal;
    }
  `
