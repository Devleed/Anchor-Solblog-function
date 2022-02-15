// * Returns view
import React, { FC } from 'react'
import { CounterProps } from '@components/Counter'

interface ViewProps extends CounterProps {
  title: string
  onIncrementPress: () => void
  onDecrementPress: () => void
  counterValue: number
}

const CounterView: FC<ViewProps> = ({
  title,
  onIncrementPress,
  onDecrementPress,
  counterValue,
}) => (
  <div className="container">
    <h1>{title}</h1>
    <button onClick={onIncrementPress}>Increment</button>
    <button onClick={onDecrementPress}>Decrement</button>
    <p>counterValue = {counterValue}</p>
  </div>
)

export default CounterView
