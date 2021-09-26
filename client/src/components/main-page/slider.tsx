import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { observer } from 'mobx-react'
import * as React from 'react'

export const SliderComponent: React.FC<{ side: 'right' | 'left'; onClick: () => void }> = observer(
  ({ side, onClick }) => (
    <div className={`slider ${side}-slider`} onClick={onClick}>
      <Icon
        name={side === 'right' ? IconName.CHEVRON_RIGHT : IconName.CHEVRON_LEFT}
        size={IconSize.MEDIUM}
      />
    </div>
  )
)
