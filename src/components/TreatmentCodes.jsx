import React, { useState, useRef, useEffect } from 'react'
import './TreatmentCodes.css'

// Mock CPT codes data - in a real app, this would come from an API
const CPT_CODES = [
  { code: '97110', description: 'Therapeutic exercise' },
  { code: '97112', description: 'Neuromuscular reeducation' },
  { code: '97116', description: 'Gait training' },
  { code: '97140', description: 'Manual therapy' },
  { code: '97161', description: 'Physical therapy evaluation' },
  { code: '97162', description: 'Physical therapy re-evaluation' },
  { code: '97163', description: 'Physical therapy evaluation - high complexity' },
  { code: '97164', description: 'Physical therapy re-evaluation - high complexity' },
  { code: '97530', description: 'Therapeutic activities' },
  { code: '97535', description: 'Self-care/home management training' },
  { code: '97537', description: 'Community/work reintegration training' },
  { code: '97542', description: 'Wheelchair management' },
  { code: '97750', description: 'Physical performance test or measurement' },
  { code: '97755', description: 'Assistive technology assessment' },
  { code: '97760', description: 'Orthotic management and training' },
  { code: '97761', description: 'Prosthetic training' },
  { code: '98940', description: 'Chiropractic manipulative treatment' },
  { code: '98941', description: 'Chiropractic manipulative treatment - 1-2 regions' },
  { code: '98942', description: 'Chiropractic manipulative treatment - 3-4 regions' },
  { code: '98943', description: 'Chiropractic manipulative treatment - 5 regions' },
]

function TreatmentCodes() {
  const [selectedCodes, setSelectedCodes] = useState([])
  const [showFlyout, setShowFlyout] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const addButtonRef = useRef(null)
  const flyoutRef = useRef(null)
  const tooltipRef = useRef(null)

  // Position flyout relative to add button
  useEffect(() => {
    if (showFlyout && addButtonRef.current && flyoutRef.current) {
      const updatePosition = () => {
        if (!addButtonRef.current || !flyoutRef.current) return
        
        const triggerRect = addButtonRef.current.getBoundingClientRect()
        const flyoutRect = flyoutRef.current.getBoundingClientRect()
        
        let top = triggerRect.bottom + 8
        let left = triggerRect.left

        // Adjust if going off screen
        if (left + flyoutRect.width > window.innerWidth) {
          left = window.innerWidth - flyoutRect.width - 16
        }
        if (top + flyoutRect.height > window.innerHeight) {
          top = triggerRect.top - flyoutRect.height - 8
        }
        if (left < 0) left = 16
        if (top < 0) top = 16

        flyoutRef.current.style.position = 'fixed'
        flyoutRef.current.style.top = `${top}px`
        flyoutRef.current.style.left = `${left}px`
      }

      requestAnimationFrame(() => {
        updatePosition()
      })
    }
  }, [showFlyout])

  // Handle click outside to close flyout
  useEffect(() => {
    if (!showFlyout) return

    const handleClickOutside = (event) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(event.target) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target)
      ) {
        setShowFlyout(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFlyout])

  const handleCodeToggle = (code) => {
    setSelectedCodes(prev => {
      const isSelected = prev.some(c => c.code === code.code)
      if (isSelected) {
        return prev.filter(c => c.code !== code.code)
      } else {
        return [...prev, code]
      }
    })
  }

  const handleRemoveCode = (codeToRemove) => {
    setSelectedCodes(prev => prev.filter(c => c.code !== codeToRemove.code))
  }

  const filteredCodes = searchQuery
    ? CPT_CODES.filter(code =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CPT_CODES

  return (
    <div className="treatment-codes-section">
      <div className="config-section">
        <div className="treatment-codes-header-section">
          <div style={{ flex: 1 }}>
            <div className="treatment-codes-title-wrapper">
              <label className="config-label">Pre-loaded Treatment Codes</label>
              <div
                className="treatment-codes-info-icon"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                ref={tooltipRef}
              >
                <span className="material-symbols-outlined">info</span>
                {showTooltip && (
                  <div className="treatment-codes-tooltip">
                    Pre-loading treatment codes will automatically be populated in your visit notes when they opened for the first time
                  </div>
                )}
              </div>
            </div>
            <p className="config-description">
              Select treatment codes to pre-populate on your visit note.
            </p>
          </div>
          <div className="treatment-codes-header-actions">
            <button
              className="clear-btn"
              onClick={() => setSelectedCodes([])}
              disabled={selectedCodes.length === 0}
            >
              Clear
            </button>
            <button
              ref={addButtonRef}
              className="add-section-btn-top"
              onClick={() => setShowFlyout(!showFlyout)}
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Codes</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`treatment-codes-container ${selectedCodes.length > 0 ? 'has-chips' : ''}`}>
        {selectedCodes.length === 0 ? (
          <div className="treatment-codes-empty">
            <p className="treatment-codes-empty-text">None selected</p>
          </div>
        ) : (
          <div className="treatment-codes-chips">
            {selectedCodes.map((code) => (
              <div key={code.code} className="treatment-code-chip">
                <span className="treatment-code-chip-text">
                  {code.code} - {code.description}
                </span>
                <button
                  className="treatment-code-chip-remove"
                  onClick={() => handleRemoveCode(code)}
                  aria-label={`Remove ${code.code}`}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFlyout && (
        <div className="treatment-codes-flyout" ref={flyoutRef}>
          <div className="treatment-codes-flyout-header">
            <h4 className="treatment-codes-flyout-title">Select Treatment Codes</h4>
            <button
              className="treatment-codes-flyout-close"
              onClick={() => {
                setShowFlyout(false)
                setSearchQuery('')
              }}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="treatment-codes-flyout-search">
            <input
              type="text"
              className="treatment-codes-flyout-search-input"
              placeholder="Search CPT codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="treatment-codes-flyout-list">
            {filteredCodes.map((code) => {
              const isSelected = selectedCodes.some(c => c.code === code.code)
              return (
                <div
                  key={code.code}
                  className={`treatment-codes-flyout-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCodeToggle(code)}
                >
                  <input
                    type="checkbox"
                    className="treatment-codes-flyout-checkbox"
                    checked={isSelected}
                    onChange={() => handleCodeToggle(code)}
                  />
                  <div className="treatment-codes-flyout-item-content">
                    <span className="treatment-codes-flyout-code">{code.code}</span>
                    <span className="treatment-codes-flyout-description">{code.description}</span>
                  </div>
                </div>
              )
            })}
            {filteredCodes.length === 0 && (
              <div className="treatment-codes-flyout-empty">
                No codes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TreatmentCodes
