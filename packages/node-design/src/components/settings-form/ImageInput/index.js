import { useContext } from '@tap/shared'
import { ElInput as Input, ElUpload as Upload } from 'element-plus'
import { IconWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { SettingsFormContext } from '../../../context'
import './styles.scss'
import { defineComponent } from 'vue'

export const ImageInput = defineComponent({
  setup: props => {
    const prefix = usePrefix('image-input')
    const context = useContext(SettingsFormContext)
    return () => (
      <div class={prefix}>
        <Input
          {...props}
          onChange={e => {
            props.onChange?.(e?.target?.['value'])
          }}
          prefix={
            <Upload
              action={context.uploadAction}
              itemRender={() => null}
              maxCount={1}
              onChange={params => {
                const response = params.file?.response
                const url = response?.url || response?.downloadURL || response?.imageURL || response?.thumbUrl
                if (!url) return
                props.onChange?.(url)
              }}
            >
              <IconWidget infer="CloudUpload" style={{ cursor: 'pointer' }} />
            </Upload>
          }
        />
      </div>
    )
  }
})

export const BackgroundImageInput = defineComponent({
  setup: props => {
    const addBgValue = (value: any) => {
      if (/url\([^)]+\)/.test(value)) {
        return value
      }
      return `url(${value})`
    }
    const removeBgValue = (value: any) => {
      const matched = String(value).match(/url\(\s*([^)]+)\s*\)/)
      if (matched?.[1]) {
        return matched?.[1]
      }
      return value
    }
    return () => (
      <ImageInput
        value={removeBgValue(props.value)}
        onChange={url => {
          props.onChange?.(addBgValue(url))
        }}
      />
    )
  }
})
