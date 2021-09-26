import classNames from 'classnames'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import './accordion.scss'
import { Icon, IconName } from './icons/icon'

export const Accordion: React.FC<{ title: string; defaultExtended?: boolean }> = observer(
  ({ title, defaultExtended = false, children }) => {
    const state = useLocalObservable(() => ({
      extended: false
    }))

    useEffect(() => {
      state.extended = defaultExtended
    }, [defaultExtended])

    return (
      <div className={classNames('accordion', state.extended && 'extended')}>
        <div
          className="accordion-header"
          onClick={() => {
            state.extended = !state.extended
          }}
        >
          <span className="accordion-title">{title}</span>
          {state.extended ? <Icon name={IconName.CHEVRON_UP} /> : <Icon name={IconName.CHEVRON_DOWN} />}
        </div>
        {state.extended && <div className={'accordion-content'}>{children}</div>}
      </div>
    )
  }
)
