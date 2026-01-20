import React, { useState, useRef, useEffect } from 'react'
import './SectionSelector.css'

const sectionGroups = {
  'All': [
    'Chief Complaint',
    'History of Present Illness',
    'Past Medical History',
    'Medications',
    'Allergies',
    'Family History',
    'Social History',
    'Review of Systems',
    'Physical Examination',
    'Vital Signs',
    'Functional Assessment',
    'Diagnosis',
    'Assessment',
    'Plan of Care',
    'Goals',
    'Treatment Plan',
    'Follow-up Instructions',
    'Patient Education'
  ],
  'Subjective': [
    'Chief Complaint',
    'History of Present Illness',
    'Past Medical History',
    'Medications',
    'Allergies',
    'Family History',
    'Social History',
    'Review of Systems'
  ],
  'Objective': [
    'Physical Examination',
    'Vital Signs',
    'Measurements',
    'Functional Assessment Tool Scores',
    'Objective Comments',
    'Test Results'
  ],
  'Assessment': [
    'Diagnosis',
    'Assessments Template',
    'Clinical Assessment',
    'Problem List'
  ],
  'Plan': [
    'Plan of Care',
    'Goals',
    'Treatment Plan',
    'Medications Plan',
    'Follow-up Instructions',
    'Patient Education'
  ],
  'Other': [
    'Visit Note Section',
    'Custom Section',
    'Additional Notes',
    'Documentation'
  ]
}

// Helper function to determine category from section name
const getCategoryForSection = (sectionName) => {
  const categoryMap = {
    'Subjective': ['Chief Complaint', 'History of Present Illness', 'Past Medical History', 'Medications', 'Allergies', 'Family History', 'Social History', 'Review of Systems'],
    'Objective': ['Physical Examination', 'Vital Signs', 'Measurements', 'Functional Assessment Tool Scores', 'Objective Comments', 'Test Results'],
    'Assessment': ['Diagnosis', 'Assessments Template', 'Clinical Assessment', 'Problem List'],
    'Plan': ['Plan of Care', 'Goals', 'Treatment Plan', 'Medications Plan', 'Follow-up Instructions', 'Patient Education'],
    'Other': ['Visit Note Section', 'Custom Section', 'Additional Notes', 'Documentation']
  }
  
  for (const [category, items] of Object.entries(categoryMap)) {
    if (items.includes(sectionName)) {
      return category
    }
  }
  return 'Other'
}

function SectionSelector({ isOpen, onClose, triggerRef, position = 'below', selectedSections = [], onSelectionChange }) {
  const [selectedGroup, setSelectedGroup] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const flyoutRef = useRef(null)
  
  // Track selected items internally
  const [internalSelected, setInternalSelected] = useState(new Set(selectedSections))
  
  useEffect(() => {
    setInternalSelected(new Set(selectedSections))
  }, [selectedSections])

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (
          flyoutRef.current &&
          !flyoutRef.current.contains(event.target) &&
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
    }
  }, [isOpen, onClose, triggerRef])

  useEffect(() => {
    if (isOpen && triggerRef?.current && flyoutRef.current) {
      const updatePosition = () => {
        if (!triggerRef?.current || !flyoutRef.current) return
        
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const flyoutRect = flyoutRef.current.getBoundingClientRect()
        
        let top = 0
        let left = 0

        if (position === 'below') {
          top = triggerRect.bottom + 8
          left = triggerRect.left
        } else if (position === 'above') {
          top = triggerRect.top - flyoutRect.height - 8
          left = triggerRect.left
        } else if (position === 'beside') {
          top = triggerRect.top
          left = triggerRect.right + 8
        }

        // Adjust if going off screen
        if (left + flyoutRect.width > window.innerWidth) {
          left = window.innerWidth - flyoutRect.width - 16
        }
        if (top + flyoutRect.height > window.innerHeight) {
          top = window.innerHeight - flyoutRect.height - 16
        }
        if (left < 0) left = 16
        if (top < 0) top = 16

        flyoutRef.current.style.position = 'fixed'
        flyoutRef.current.style.top = `${top}px`
        flyoutRef.current.style.left = `${left}px`
      }

      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        updatePosition()
      })
    }
  }, [isOpen, position, triggerRef])

  if (!isOpen) return null

  const handleItemToggle = (itemName) => {
    const newSelected = new Set(internalSelected)
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName)
    } else {
      newSelected.add(itemName)
    }
    setInternalSelected(newSelected)
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected))
    }
  }

  const currentItems = sectionGroups[selectedGroup] || []
  const filteredItems = searchQuery
    ? currentItems.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentItems

  return (
    <div className="section-selector-flyout" ref={flyoutRef}>
      <div className="section-selector-content">
        <div className="section-selector-nav">
          <div className="section-selector-nav-list">
            {Object.keys(sectionGroups).map((group) => (
              <button
                key={group}
                className={`section-selector-nav-item ${
                  selectedGroup === group ? 'active' : ''
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
        <div className="section-selector-main">
          <div className="section-selector-search">
            <input
              type="text"
              className="section-selector-search-input"
              placeholder="Search for note sections"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="section-selector-items">
            {filteredItems.map((item, index) => {
              const uniqueId = `section-${selectedGroup}-${index}-${item}`
              const isChecked = internalSelected.has(item)
              return (
                <div key={uniqueId} className="section-selector-item">
                  <input
                    type="checkbox"
                    className="section-selector-checkbox"
                    id={uniqueId}
                    checked={isChecked}
                    onChange={() => handleItemToggle(item)}
                  />
                  <label
                    htmlFor={uniqueId}
                    className="section-selector-item-label"
                  >
                    {item}
                  </label>
                </div>
              )
            })}
            {filteredItems.length === 0 && (
              <div className="section-selector-empty">
                No items found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { getCategoryForSection }

export default SectionSelector
