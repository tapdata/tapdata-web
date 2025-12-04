import { getBezierPath } from '@vue-flow/core'
import { computed } from 'vue'

const curvature = 0.16

export function useCanvasEdge(props) {
  const path = computed(() =>
    getBezierPath({
      ...props,
      sourceX: props.sourceX - 8,
      targetX: props.targetX + 4,
      curvature,
    }),
  )

  // 计算贝塞尔曲线的控制点
  function getControlPoints(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    curvature: number,
  ) {
    const distanceX = Math.abs(tx - sx)
    const controlOffset = distanceX * curvature
    return {
      cx1: sx + controlOffset,
      cy1: sy,
      cx2: tx - controlOffset,
      cy2: ty,
    }
  }

  // 计算贝塞尔曲线上任意位置 t (0-1) 的点和切线角度
  function getPointOnBezier(
    t: number,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    curvature: number,
  ) {
    const { cx1, cy1, cx2, cy2 } = getControlPoints(sx, sy, tx, ty, curvature)

    // 三次贝塞尔曲线公式
    const x =
      (1 - t) ** 3 * sx +
      3 * (1 - t) ** 2 * t * cx1 +
      3 * (1 - t) * t ** 2 * cx2 +
      t ** 3 * tx
    const y =
      (1 - t) ** 3 * sy +
      3 * (1 - t) ** 2 * t * cy1 +
      3 * (1 - t) * t ** 2 * cy2 +
      t ** 3 * ty

    // 计算切线方向（一阶导数）
    const dx =
      3 * (1 - t) ** 2 * (cx1 - sx) +
      6 * (1 - t) * t * (cx2 - cx1) +
      3 * t ** 2 * (tx - cx2)
    const dy =
      3 * (1 - t) ** 2 * (cy1 - sy) +
      6 * (1 - t) * t * (cy2 - cy1) +
      3 * t ** 2 * (ty - cy2)

    // 切线角度（弧度）
    const angle = Math.atan2(dy, dx)

    return { x, y, angle }
  }

  // 图标尺寸
  const iconSize = 16
  // 图标间距
  const iconGap = 16

  // 计算两个图标的位置，它们在曲线中点附近沿切线方向排列
  const iconPositions = computed(() => {
    const midPoint = getPointOnBezier(
      0.5,
      props.sourceX - 8,
      props.sourceY,
      props.targetX + 4,
      props.targetY,
      curvature,
    )

    // 沿切线方向的单位向量
    const cos = Math.cos(midPoint.angle)
    const sin = Math.sin(midPoint.angle)

    // 两个图标沿切线方向分布，间距为 iconSize + iconGap
    const offset = (iconSize + iconGap) / 2

    return {
      add: {
        x: midPoint.x - cos * offset,
        y: midPoint.y - sin * offset,
      },
      close: {
        x: midPoint.x + cos * offset,
        y: midPoint.y + sin * offset,
      },
    }
  })

  return {
    path,
    iconPositions,
  }
}
