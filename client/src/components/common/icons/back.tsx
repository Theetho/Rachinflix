import classNames from 'classnames'
import { observer } from 'mobx-react'
import { useLocalObservable } from 'mobx-react-lite'
import React from 'react'
import { IconHover, IconSize } from './icon'
import './rotator.scss'

export const BackRotatorIcon: React.FC<{ size?: IconSize; hover?: IconHover }> = observer(
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
        <div className={classNames('icon-back', state.animating && 'animating')}>
          <svg
            className={classNames('icon-back-rotator', state.animating && 'animating')}
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              fill="#ddd"
              d="M19.4211 8.19399C18.8596 8.58264 18.8596 9.41736 19.4211 9.80601L22.1423 11.6898L24.5061 13.3262C25.1506 13.7724 26.0278 13.3078 26.0278 12.5202V10.1359C33.353 11.1258 39 17.4035 39 25C39 33.2843 32.2843 40 24 40C15.7157 40 9 33.2843 9 25C9 20.9362 10.6161 17.2498 13.2406 14.5484C13.8491 13.9221 13.9054 12.9122 13.2919 12.2907C12.7434 11.735 11.8538 11.6928 11.3005 12.2437C8.02646 15.5032 6 20.015 6 25C6 34.9411 14.0589 43 24 43C33.9411 43 42 34.9411 42 25C42 15.7444 35.0143 8.12046 26.0278 7.11295V5.4798C26.0278 4.69224 25.1506 4.22761 24.5061 4.67379L22.1423 6.31019L19.4211 8.19399Z"
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
