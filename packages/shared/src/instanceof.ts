import { isFn, isStr } from './types'
export const instOf = (value: unknown, cls: unknown): boolean => {
  if (isFn(cls)) return value instanceof (cls as new (...args: any[]) => any)
  if (isStr(cls)) {
    const ctor = (window as any)[cls as string]
    return ctor ? value instanceof ctor : false
  }
  return false
}

export function bindMethods<T extends object>(instance: T): void {
  const prototype = Object.getPrototypeOf(instance)
  const propertyNames = Object.getOwnPropertyNames(prototype)

  propertyNames.forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
    const propertyValue = instance[propertyName as keyof T]

    if (
      typeof propertyValue === 'function' &&
      propertyName !== 'constructor' &&
      descriptor &&
      !descriptor.get &&
      !descriptor.set
    ) {
      instance[propertyName as keyof T] = propertyValue.bind(instance)
    }
  })
}
