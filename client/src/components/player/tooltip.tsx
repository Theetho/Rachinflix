import { ClientEvent, useEventHandler } from 'components/common/events'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

export function constructTooltip(e: React.MouseEvent<HTMLDivElement, MouseEvent>, content: string, ratio: number = 1) {
  if (!e || !content) return undefined
  const { left, width } = e.currentTarget.getBoundingClientRect()

  return {
    text: content,
    position: left - width * ratio,
    width,
    show: true
  }
}

export function deconstructTooltip(content: string) {
  return {
    text: content,
    show: false
  }
}

export type Tooltip =
  | {
      text: string | undefined
      position?: number | undefined
      width?: number | undefined
      show: boolean
    }
  | undefined

export const TooltipComponent: React.FC<{ tooltip: Tooltip }> = observer(({ tooltip }) => {
  const eventHandler = useEventHandler()

  useEffect(() => {
    eventHandler.emit(ClientEvent.Tooltip, tooltip)
  }, [tooltip, tooltip?.text, tooltip?.position, tooltip?.width, tooltip?.show])

  return <></>
})
