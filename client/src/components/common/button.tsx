import classNames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import { Link } from 'react-router-dom'
import './button.scss'

export enum ButtonVariation {
  Primary = 'is-primary',
  Secondary = 'is-secondary',
  Tertiary = 'is-tertiary',
  Quaternary = 'is-quaternary',
  Quinary = 'is-quinary',
  Senary = 'is-senary',
  Septenary = 'is-septenary',
  Octonary = 'is-octonary',
  Nonary = 'is-nonary',
  Denary = 'is-denary'
}

export enum ButtonAppearance {
  BUTTON,
  LINK
}

export const Button: React.FC<
  {
    variation?: ButtonVariation
    appearance?: ButtonAppearance
    to?: string
    inverted?: boolean
  } & JSX.IntrinsicElements['div'] &
    JSX.IntrinsicElements['a']
> = observer(
  ({ to, variation = ButtonVariation.Primary, appearance = ButtonAppearance.BUTTON, inverted = false, ...props }) => {
    return (
      <>
        {to ? (
          <Link to={to} className={classNames('button', variation, inverted && 'inverted')}>
            {appearance === ButtonAppearance.BUTTON && <div className={props.className}>{props.children}</div>}
            {appearance === ButtonAppearance.LINK && <span className={props.className}>{props.children}</span>}
          </Link>
        ) : (
          <div
            {...props}
            className={classNames('button', variation, inverted && 'inverted')}
            onClick={to ? undefined : props.onClick}
          >
            {appearance === ButtonAppearance.BUTTON && <div className={props.className}>{props.children}</div>}
            {appearance === ButtonAppearance.LINK && <span className={props.className}>{props.children}</span>}
          </div>
        )}
      </>
    )
  }
)
