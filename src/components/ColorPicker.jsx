import React, { useState, useEffect, useRef } from 'react'
import './ClinicalStageConfig.css'
import { darkenColor, lightenColor } from './colorUtils'

const colorOptions = [
  { name: 'Magenta', value: '#d11553' },
  { name: 'Pink', value: '#e817e8' },
  { name: 'Violet', value: '#a411ee' },
  { name: 'Purple', value: '#7044bb' },
  { name: 'Navy', value: '#4758b8' },
  { name: 'Litmus', value: '#0f2dd7' },
  { name: 'Blue', value: '#1873cd' },
  { name: 'Aqua', value: '#2eb6d1' },
  { name: 'Teal', value: '#26a699' },
  { name: 'Green', value: '#699933' },
  { name: 'Lime', value: '#2dff0d' },
  { name: 'Mustard', value: '#b4bf40' },
  { name: 'Yellow', value: '#ccb800' },
  { name: 'Orange', value: '#cc7a00' },
  { name: 'Auburn', value: '#cc3600' },
  { name: 'Grey', value: '#565656' },
]

function ColorPicker({ 
  selectedColor, 
  onColorChange, 
  isOpen, 
  onClose, 
  triggerRef,
  position = 'below' // 'below' or 'beside'
}) {
  const [customHexValue, setCustomHexValue] = useState(selectedColor)
  const colorPickerRef = useRef(null)

  useEffect(() => {
    setCustomHexValue(selectedColor.toUpperCase())
  }, [selectedColor])

  // Position the color picker using fixed positioning
  useEffect(() => {
    if (isOpen && triggerRef?.current && colorPickerRef.current) {
      const updatePosition = () => {
        if (!triggerRef?.current || !colorPickerRef.current) return
        
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const pickerRect = colorPickerRef.current.getBoundingClientRect()
        
        let top = 0
        let left = 0

        if (position === 'beside') {
          top = triggerRect.top
          left = triggerRect.right + 8
        } else {
          // position === 'below'
          top = triggerRect.bottom + 8
          left = triggerRect.left
        }

        // Adjust if going off screen
        if (left + pickerRect.width > window.innerWidth) {
          left = window.innerWidth - pickerRect.width - 16
        }
        if (top + pickerRect.height > window.innerHeight) {
          top = window.innerHeight - pickerRect.height - 16
        }
        if (left < 0) left = 16
        if (top < 0) top = 16

        colorPickerRef.current.style.position = 'fixed'
        colorPickerRef.current.style.top = `${top}px`
        colorPickerRef.current.style.left = `${left}px`
        colorPickerRef.current.style.zIndex = '10000'
      }

      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        updatePosition()
      })
    }
  }, [isOpen, position, triggerRef])

  // Handle click outside to close color picker
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  const handleColorSelect = (colorValue) => {
    onColorChange(colorValue)
    setCustomHexValue(colorValue.toUpperCase())
  }

  const handleCustomHexChange = (e) => {
    const value = e.target.value
    setCustomHexValue(value)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      const normalizedValue = value.length === 4 
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value
      onColorChange(normalizedValue)
    }
  }

  const handleCustomHexSubmit = (e) => {
    e.preventDefault()
    const normalizedValue = customHexValue.length === 4 
      ? `#${customHexValue[1]}${customHexValue[1]}${customHexValue[2]}${customHexValue[2]}${customHexValue[3]}${customHexValue[3]}`
      : customHexValue
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customHexValue)) {
      onColorChange(normalizedValue)
      setCustomHexValue(normalizedValue.toUpperCase())
    }
  }

  const pastelColor = lightenColor(selectedColor)
  const darkenedColor = darkenColor(selectedColor)

  if (!isOpen) return null

  return (
    <div 
      ref={colorPickerRef}
      className="color-picker-flyout"
    >
      <button
        className="color-picker-close-btn"
        onClick={onClose}
        aria-label="Close color picker"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="color-picker-content">
        <div className="color-picker-left">
          <h3 className="color-picker-title">Select a color</h3>
          <div className="color-swatches-grid">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`color-swatch ${selectedColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorSelect(color.value)}
                title={color.name}
              />
            ))}
            <div className="custom-color-input-wrapper">
              <div 
                className="custom-color-preview"
                style={{ 
                  background: `conic-gradient(from 90deg, #da0000 0%, #d90b00 0.9375%, #d91500 1.875%, #d82b00 3.75%, #d65600 7.5%, #d48000 11.25%, #d2ab00 15%, #a5bb00 22.5%, #79ca00 30%, #72c90c 30.938%, #6ac919 31.875%, #5bc832 33.75%, #4cc64a 35.625%, #3dc563 37.5%, #1ec395 41.25%, #0fc1ae 43.125%, #00c0c7 45%, #0096c5 48.75%, #006dc3 52.5%, #0043c1 56.25%, #002ec0 58.125%, #0019bf 60%, #0b18c0 60.938%, #1616c1 61.875%, #2b13c3 63.75%, #570dc6 67.5%, #8206c9 71.25%, #ae00cd 75%, #bc0099 82.5%, #cb0066 90%, #cc004c 92.5%, #ce0033 95%, #cf0019 97.5%, #d0000d 98.75%, #d00000 100%)`
                }}
              />
              <form onSubmit={handleCustomHexSubmit} style={{ display: 'flex' }}>
                <input
                  type="text"
                  className="custom-hex-input"
                  value={customHexValue}
                  onChange={handleCustomHexChange}
                  placeholder="#A0A0A0"
                  maxLength={7}
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </form>
            </div>
          </div>
        </div>
        
        <div className="color-picker-preview">
          <div className="preview-label">Preview</div>
          <div 
            className="preview-block"
            style={{
              borderTop: `1px solid ${selectedColor}`,
              borderRight: `1px solid ${selectedColor}`,
              borderBottom: `1px solid ${selectedColor}`,
              borderLeft: `6px solid ${selectedColor}`,
              backgroundColor: pastelColor,
              color: darkenedColor
            }}
          >
            <div className="preview-content">
              <div className="preview-row">
                <span className="preview-name">Firstname Lastname</span>
                <span className="preview-time">9-10AM</span>
              </div>
              <div className="preview-row">
                <span>Case Name • Appointment Template</span>
              </div>
              <div className="preview-row preview-footer">
                <span>Confirmed</span>
                <div className="preview-icons">
                  <span>✓</span>
                  <span>$</span>
                  <span>≡</span>
                  <span>+2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
