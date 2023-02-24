import { InputNumber } from '@tap/form'
import { createPolyInput } from '../PolyInput'
import './styles.scss'

const takeNumber = (value) => {
  const num = String(value)
    .trim()
    .replace(/[^\d.]+/, '')
  if (num === '') return
  return Number(num)
}

const createUnitType = (type) => {
  return {
    type,
    component: InputNumber,
    checker(value) {
      return String(value).includes(type)
    },
    toInputValue(value) {
      return takeNumber(value)
    },
    toChangeValue(value) {
      return `${value || 0}${type}`
    },
  }
}

const createSpecialSizeOption = (type) => ({
  type: type,
  checker(value) {
    if (value === type) return true
    return false
  },
  toChangeValue() {
    return type
  },
})

const NormalSizeOptions = [
  createSpecialSizeOption('inherit'),
  createSpecialSizeOption('auto'),
  createUnitType('px'),
  createUnitType('%'),
  createUnitType('vh'),
  createUnitType('em'),
]

export const SizeInput = createPolyInput(NormalSizeOptions)

export const BackgroundSizeInput = createPolyInput([
  createSpecialSizeOption('cover'),
  createSpecialSizeOption('contain'),
  createUnitType('px'),
  createUnitType('%'),
  createUnitType('vh'),
  createUnitType('em'),
])
