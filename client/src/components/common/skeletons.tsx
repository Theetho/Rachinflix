import { Skeleton } from '@material-ui/lab'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'

export const TextOrSkeleton: React.FC<{ condition: boolean }> = observer(({ condition, children, ...props }) => {
  return <>{condition ? <Skeleton variant="text" {...props} /> : children}</>
})

export const CustomSkeleton: React.FC<{
  condition: boolean
  width?: string
  height?: string
  style?: React.CSSProperties
  className?: string
}> = observer(({ condition, children, className, ...props }) => {
  return <>{condition ? <Skeleton className={classNames('custom-skeleton', className)} {...props} /> : children}</>
})
