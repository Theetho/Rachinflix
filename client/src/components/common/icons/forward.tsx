import classNames from 'classnames'
import { observer } from 'mobx-react'
import { useLocalObservable } from 'mobx-react-lite'
import React from 'react'
import { IconHover, IconSize } from './icon'
import './rotator.scss'

export const ForwardRotatorIcon: React.FC<{ size?: IconSize; hover?: IconHover }> = observer(
  ({ size = IconSize.SMALL, hover = IconHover.STILL }) => {
    const state = useLocalObservable(() => ({
      animating: false,
      animate() {
        this.animating = true
        setTimeout(() => {
          this.animating = false
        }, 800)
      }
    }))

    return (
      <div className={classNames('icon', size, hover)} onClick={state.animate}>
        <div className={classNames('icon-forward', state.animating && 'animating')}>
          <svg
            className={classNames('icon-forward-rotator', state.animating && 'animating')}
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              fill="#ddd"
              d="M28.5789 8.19399C29.1404 8.58264 29.1404 9.41736 28.5789 9.80601L25.8577 11.6898L23.4939 13.3262C22.8494 13.7724 21.9722 13.3078 21.9722 12.5202V10.1359C14.647 11.1258 9 17.4035 9 25C9 33.2843 15.7157 40 24 40C32.2843 40 39 33.2843 39 25C39 20.9362 37.3839 17.2498 34.7594 14.5484C34.1509 13.9221 34.0946 12.9122 34.7081 12.2907C35.2566 11.735 36.1462 11.6928 36.6995 12.2437C39.9735 15.5032 42 20.015 42 25C42 34.9411 33.9411 43 24 43C14.0589 43 6 34.9411 6 25C6 15.7444 12.9857 8.12046 21.9722 7.11295V5.4798C21.9722 4.69224 22.8494 4.22761 23.4939 4.67379L25.8577 6.31019L28.5789 8.19399Z"
            ></path>
          </svg>
          <svg
            className={classNames('icon-label', state.animating && 'animating')}
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              fill="#ddd"
              d="M17.5531 23.4722L19.6271 22.3056V28.1944H17V29.8611H23.7751V28.1944H21.4937V20.1389H20.1802L17.5531 21.6944V23.4722Z"
            ></path>
            <path
              fillRule="evenodd"
              fill="#ddd"
              d="M32 25C32 21.875 30.5897 20 28.3636 20C26.1374 20 24.7271 21.875 24.7271 25C24.7271 28.125 26.1374 30 28.3636 30C30.5897 30 32 28.125 32 25ZM30.1334 25C30.1334 27.0139 29.4835 28.3333 28.3636 28.3333C27.2436 28.3333 26.5937 27.0139 26.5937 25C26.5937 22.9861 27.2436 21.6667 28.3636 21.6667C29.4835 21.6667 30.1334 22.9861 30.1334 25Z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }
)
