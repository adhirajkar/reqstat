'use client'
import React, { memo } from 'react'
import JsonView from '@uiw/react-json-view';

const JsonViewer = memo(({ value }: { value: any }) => {
  return (
    <div className='bg-gradient-to-br from-slate-50 to-slate-100 h-[500px] overflow-y-scroll'>
      <JsonView value={value} />
    </div>
  )
})

JsonViewer.displayName = 'JsonViewer'

export default JsonViewer