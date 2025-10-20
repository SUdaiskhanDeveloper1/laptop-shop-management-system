
import React from 'react'
import { Checkbox } from 'antd'

export default function AccessoryToggleList({ value = [], onChange }) {
  const options = [
    
    { label: 'Mouse', value: 'Mouse' },
    { label: 'Charger', value: 'Charger' },
    { label: 'Power Adapter', value: 'Power_adapter' },
    { label: 'Bag', value: 'Bag' },
    { label: 'Warranty', value: 'Warranty' },
    
  ]

  return (
    <Checkbox.Group
      options={options}
      value={value}
      onChange={(vals) => onChange && onChange(vals)}
    />
  )
}
