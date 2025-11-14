import { get, groupBy } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Button } from '@kube-design/components'

const GpuVmSelect = props => {
  const tooltipRef = useRef(null)
  const vmGridRef = useRef(null)

  useEffect(() => {
    if (props.rangeValue) {
      handleRangeChange(props.rangeValue.toString())
    }
  }, [props.rangeValue])

  useEffect(() => {
    if (props.isCancel) {
      handleCancel()
    }
  }, [props.isCancel])

  // create sample vmData (same as original, 1..32 + padded 033..128)
  const initialVmData = React.useMemo(() => {
    const base = []

    const extra = Array.from({ length: props.initGpuCount }, (_, i) => {
      const num = i + 1
      const padded = num.toString().padStart(3, '0')
      return { id: `${padded}`, name: `${padded}`, status: 'inactive' }
    })

    base.push(...extra)

    const updatedBase = base.map(item => {
      // vmList에서 뒤 3자리 추출 후 비교
      const isMatch = props.vmList.some(obj => obj === item.id)
      return isMatch ? { ...item, status: 'unavailable' } : item
    })

    return updatedBase
  }, [])

  const [vmData] = useState(initialVmData)

  // selectedVms: Map<string, 'selected'|'error'>
  const [selectedVms, setSelectedVms] = useState(() => new Map())
  const [lastClickedVmId, setLastClickedVmId] = useState(null)
  const [rangeValue, setRangeValue] = useState('')

  const [messageState, setMessageState] = useState({
    basic: false,
    unavailable: false,
    nocapacity: false,
  })

  const [nameRange, setNameRange] = useState({ start: '', end: '' })

  useEffect(() => {
    props.getNameRange(nameRange)
  }, [nameRange])

  useEffect(() => {
    props.getMessageState(messageState)
  }, [messageState])

  function extractVmNumber(vmId) {
    const m = vmId.match(/\d+/)
    return m ? m[0] : vmId
  }

  function toggleVmSelection(vm) {
    const current = new Map(selectedVms)
    if (current.has(vm.id)) {
      current.delete(vm.id)
    } else {
      current.set(vm.id, vm.status === 'unavailable' ? 'error' : 'selected')
    }
    setSelectedVms(current)
    setLastClickedVmId(vm.id)

    setMessageState({
      basic: current.size === 0,
      unavailable: false,
      nocapacity: false,
    })
    if (current.size === 0) setNameRange({ start: '', end: '' })
  }

  function updateRangeSelection(count, startVmId = null) {
    if (!count || count < 1) return

    let startIndex = -1
    if (startVmId) {
      startIndex = vmData.findIndex(v => v.id === startVmId)
    } else if (lastClickedVmId) {
      startIndex = vmData.findIndex(v => v.id === lastClickedVmId)
    }

    if (startIndex === -1) {
      startIndex = vmData.findIndex(vm => vm.status !== 'unavailable')
      if (startIndex === -1) return
      setLastClickedVmId(vmData[startIndex].id)
    }

    const slice = vmData.slice(startIndex, startIndex + count)
    const hasUnavailable = slice.some(v => v.status === 'unavailable')
    const availableCount = slice.filter(v => v.status !== 'unavailable').length

    const newMap = new Map()
    slice.forEach(v => {
      newMap.set(v.id, v.status === 'unavailable' ? 'error' : 'selected')
    })

    setSelectedVms(newMap)
    setNameRange({
      start: slice[0]?.name ?? '',
      end: slice[slice.length - 1]?.name ?? '',
    })

    if (slice.length < count || availableCount < count) {
      setMessageState({
        basic: false,
        unavailable: hasUnavailable,
        nocapacity: !hasUnavailable,
      })
    } else {
      setMessageState({ basic: false, unavailable: false, nocapacity: false })
    }
  }

  function handleVmClick(vm) {
    const count = parseInt(rangeValue, 10)
    const selectedCount = selectedVms.size

    // if (!Number.isNaN(count) && count > 0 && selectedCount === count) {
    if (!Number.isNaN(count) && count > 0) {
      setSelectedVms(new Map())
      setLastClickedVmId(vm.id)

      updateRangeSelection(count, vm.id)
      return
    }

    toggleVmSelection(vm)
  }

  function handleRangeChange(val) {
    setRangeValue(val)

    const count = parseInt(val, 10)
    if (Number.isNaN(count) || count <= 0) return
    updateRangeSelection(count)
  }

  function handleRangeApply() {
    const count = parseInt(rangeValue, 10)
    if (Number.isNaN(count) || count <= 0) return
    updateRangeSelection(count)
  }

  function handleCancel() {
    setSelectedVms(new Map())
    setLastClickedVmId(null)
    setRangeValue('')
    props.setRangeVm(0)
    setMessageState({ basic: true, unavailable: false, nocapacity: false })
    setNameRange({ start: '', end: '' })
  }

  function handleMouseEnter(e, vm) {
    const rect = e.currentTarget.getBoundingClientRect()
    const tooltipEl = tooltipRef.current

    if (!tooltipEl) return
    tooltipEl.textContent = extractVmNumber(vm.id)

    tooltipEl.style.left = `${rect.left + rect.width / 2}px`
    tooltipEl.style.top = `${rect.top - 35}px`
    tooltipEl.style.display = 'block'
  }

  function handleMouseLeave() {
    const tooltipEl = tooltipRef.current
    if (tooltipEl) tooltipEl.style.display = 'none'
  }

  useEffect(() => {
    function onScroll() {
      const t = tooltipRef.current
      if (t) t.style.display = 'none'
    }
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [])

  function boxClass(vmId) {
    const vm = vmData.find(v => v.id === vmId)
    const sel = selectedVms.get(vmId)
    const status = sel || vm.status
    const base = 'vm_grid_item_box'
    switch (status) {
      case 'selected':
        return `${base} ${base}--selected`
      case 'error':
        return `${base} ${base}--error`
      case 'unavailable':
        return `${base} ${base}--unavailable`
      case 'inactive':
      default:
        return `${base} ${base}--inactive`
    }
  }

  function renderIcon(vmId) {
    const vm = vmData.find(v => v.id === vmId)
    const sel = selectedVms.get(vmId)
    const status = sel || vm.status
    if (status === 'unavailable' || status === 'error') {
      // simple X icon as inline SVG
      return (
        <svg
          className="w-3 h-3 absolute pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 6L18 18"
            stroke={status === 'error' ? '#fff' : '#CCD3DB'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 18L18 6"
            stroke={status === 'error' ? '#fff' : '#CCD3DB'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="vm_grid_container border p-3 rounded">
        <div className="vm_grid_wrapper">
          <div className="vm_grid_content">
            <div className="vm_grid_square" ref={vmGridRef}>
              {vmData.map(vm => (
                <div
                  key={vm.id}
                  data-vm-id={vm.id}
                  className="vm_grid_item"
                  onMouseEnter={e => handleMouseEnter(e, vm)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (rangeValue.trim() !== '') {
                      handleVmClick(vm)
                    }
                  }}
                  style={{
                    pointerEvents: rangeValue.trim() === '' ? 'none' : 'auto', // 클릭/hover 완전 차단
                    opacity: rangeValue.trim() === '' ? 0.5 : 1, // 비활성 시 시각적 표시
                  }}
                >
                  <div className={boxClass(vm.id)}>
                    {/* <span className="text-xs select-none">{extractVmNumber(vm.id)}</span> */}
                  </div>
                  <div className="vm_grid_icon">{renderIcon(vm.id)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={tooltipRef} className="vm_grid_tooltip" />

      <div className="vm_grid_info_container_box">
        <div className="vm_grid_left">
          <div className="vm_grid_info_container mt-4">
            <div className="vm_grid_info">
              {messageState.basic && (
                <span className="vm_grid_msg_basic text-sm text-gray-700">
                  생성 가능한 가상머신 수를 선택해주세요.
                </span>
              )}
              {messageState.unavailable && (
                <span className="vm_grid_msg_error_unavailable text-sm text-red-600">
                  이미 사용중인 가상머신이 포함되어 있습니다. 연속된 가상머신
                  범위를 선택해 주세요.
                </span>
              )}
              {messageState.nocapacity && (
                <span className="vm_grid_msg_error_nocapacity text-sm text-red-600">
                  입력한 가상머신 수만큼 생성할 수 없습니다. 시작 위치를 확인해
                  주세요.
                </span>
              )}

              {rangeValue.trim() !== '' && (
                <div className="vm_name mt-2">
                  <span
                    className={`vm_start_name ${
                      messageState.unavailable || messageState.nocapacity
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {props.vmPrefix}
                    {nameRange.start}
                  </span>
                  <span className={`vm_dash mx-2`}>
                    {nameRange.end !== '' ? '-' : ''}
                  </span>
                  <span
                    className={`vm_end_name ${
                      messageState.unavailable || messageState.nocapacity
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {props.vmPrefix}
                    {nameRange.end}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleCancel()}
              disabled={rangeValue.trim() === ''}
            >
              {t('선택 취소')}
            </Button>
          </div>
        </div>
        {/* <div className="vm_grid_right"></div> */}
      </div>
    </div>
  )
}

export default GpuVmSelect
