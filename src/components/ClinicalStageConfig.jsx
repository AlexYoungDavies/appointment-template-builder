import React, { useState, useEffect, useRef } from 'react'
import './ClinicalStageConfig.css'
import ColorPicker, { lightenColor, darkenColor } from './ColorPicker'
import SectionSelector, { getCategoryForSection } from './SectionSelector'
import TreatmentCodes from './TreatmentCodes'

export const stageContent = {
  'Pre-op': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Chief Complaint', type: 'Custom', scribe: true, carryForward: 'Select' },
      { id: 'subj-2', category: 'Subjective', name: 'Social History', type: 'Default', scribe: true, carryForward: 'Select' },
      { id: 'subj-3', category: 'Subjective', name: 'Subjective Notes', type: 'Default', scribe: true, carryForward: 'Select' },
      { id: 'obj-1', category: 'Objective', name: 'Functional Assessment Tool Scores', type: 'Custom', scribe: true, carryForward: 'Select' },
      { id: 'obj-2', category: 'Objective', name: 'Measurements', type: 'Default', scribe: true, carryForward: 'Select' },
      { id: 'obj-3', category: 'Objective', name: 'Objective Comments', type: 'Default', scribe: true, carryForward: 'Select' },
      { id: 'assess-1', category: 'Assessment', name: 'Diagnosis', type: 'Custom', scribe: true, carryForward: 'Select' },
      { id: 'assess-2', category: 'Assessment', name: 'Assessments Template', type: 'Default', scribe: true, carryForward: 'Select' },
      { id: 'plan-1', category: 'Plan', name: 'Goals', type: 'Custom', scribe: true, carryForward: 'Select' },
      { id: 'plan-2', category: 'Plan', name: 'Plan of Care', type: 'Default', scribe: true, carryForward: 'Select' },
    ]
  },
  'Operation': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Pre-operative Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-1', category: 'Objective', name: 'Vital Signs', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-2', category: 'Objective', name: 'Operative Findings', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'assess-1', category: 'Assessment', name: 'Operative Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'plan-1', category: 'Plan', name: 'Post-operative Plan', type: 'Default', scribe: true, carryForward: 'None' },
    ]
  },
  'Post-op': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Post-operative Subjective', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-1', category: 'Objective', name: 'Vital Signs', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-2', category: 'Objective', name: 'Post-operative Measurements', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'assess-1', category: 'Assessment', name: 'Post-operative Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'plan-1', category: 'Plan', name: 'Post-operative Plan', type: 'Default', scribe: true, carryForward: 'None' },
    ]
  },
  '2 Week Follow-up': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Follow-up Subjective', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-1', category: 'Objective', name: 'Measurements', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-2', category: 'Objective', name: 'Functional Assessment Tool Scores', type: 'Custom', scribe: true, carryForward: 'None' },
      { id: 'assess-1', category: 'Assessment', name: 'Follow-up Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'plan-1', category: 'Plan', name: 'Follow-up Plan', type: 'Default', scribe: true, carryForward: 'None' },
    ]
  },
  '4 Week Follow-up': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Follow-up Subjective', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-1', category: 'Objective', name: 'Measurements', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-2', category: 'Objective', name: 'Functional Assessment Tool Scores', type: 'Custom', scribe: true, carryForward: 'None' },
      { id: 'assess-1', category: 'Assessment', name: 'Follow-up Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'plan-1', category: 'Plan', name: 'Follow-up Plan', type: 'Default', scribe: true, carryForward: 'None' },
    ]
  },
  '6 Week Follow-up': {
    sections: [
      { id: 'subj-1', category: 'Subjective', name: 'Follow-up Subjective', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-1', category: 'Objective', name: 'Measurements', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'obj-2', category: 'Objective', name: 'Functional Assessment Tool Scores', type: 'Custom', scribe: true, carryForward: 'None' },
      { id: 'assess-1', category: 'Assessment', name: 'Follow-up Assessment', type: 'Default', scribe: true, carryForward: 'None' },
      { id: 'plan-1', category: 'Plan', name: 'Follow-up Plan', type: 'Default', scribe: true, carryForward: 'None' },
    ]
  },
}

// Define the order in which categories should always be displayed
const CATEGORY_ORDER = ['Subjective', 'Objective', 'Assessment', 'Plan', 'Other']

// Helper to create a section object from a name
const createSectionFromName = (name, existingSections = []) => {
  const category = getCategoryForSection(name)
  const baseId = name.toLowerCase().replace(/\s+/g, '-')
  
  // Generate unique ID
  let id = baseId
  let counter = 1
  while (existingSections.some(s => s.id === id)) {
    id = `${baseId}-${counter}`
    counter++
  }
  
  // Determine type - check if it's a common custom section
  const customSections = ['Chief Complaint', 'Diagnosis', 'Goals', 'Functional Assessment Tool Scores']
  const type = customSections.includes(name) ? 'Custom' : 'Default'
  
  return {
    id,
    category,
    name,
    type,
    scribe: true,
    carryForward: 'None'
  }
}

function ClinicalStageConfig({ selectedStage, clinicalStages, onStageColorChange, onSectionCountChange, onSectionsDataChange, stageSectionsData }) {
  const content = stageContent[selectedStage] || { sections: [] }
  
  // Track selected section names from the selector
  const [selectedSectionNames, setSelectedSectionNames] = useState(new Set())
  
  // Track visibility of sections (eye icon state)
  const [sectionVisibility, setSectionVisibility] = useState(new Map())
  
  // Initialize ordered sections by category - start with default content
  const [orderedSections, setOrderedSections] = useState({})
  const [dropIndicator, setDropIndicator] = useState(null)
  const [draggedCategory, setDraggedCategory] = useState(null)
  const [draggedSectionId, setDraggedSectionId] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSectionSelector, setShowSectionSelector] = useState(false)
  const [sectionSelectorTrigger, setSectionSelectorTrigger] = useState(null)
  const [showCopyFromMenu, setShowCopyFromMenu] = useState(false)
  const colorIconRef = useRef(null)
  const addSectionTopBtnRef = useRef(null)
  const addSectionBottomBtnRef = useRef(null)
  const copyFromBtnRef = useRef(null)

  // Get the selected stage's color
  const selectedStageData = clinicalStages?.find(s => s.name === selectedStage)
  const selectedColor = selectedStageData?.color || '#7044bb'
  
  // Track if we're restoring data to prevent overwriting
  const isRestoringRef = useRef(false)
  const previousStageRef = useRef(selectedStage)

  // Initialize or restore sections when stage changes
  useEffect(() => {
    // Only restore when the stage actually changes
    if (previousStageRef.current !== selectedStage) {
      previousStageRef.current = selectedStage
      
      // Check if we have saved data for this stage
      const savedData = stageSectionsData?.[selectedStage]
      
      if (savedData && Object.keys(savedData.orderedSections).length > 0) {
        // Restore saved sections for this stage
        isRestoringRef.current = true
        setOrderedSections(JSON.parse(JSON.stringify(savedData.orderedSections)))
        setSelectedSectionNames(new Set(savedData.selectedSectionNames))
        setSectionVisibility(new Map(Object.entries(savedData.sectionVisibility)))
        // Reset the flag after state updates
        setTimeout(() => {
          isRestoringRef.current = false
        }, 0)
      } else {
        // Only initialize empty if no saved data exists (first time loading this stage)
        isRestoringRef.current = true
        setOrderedSections({})
        setSelectedSectionNames(new Set())
        setSectionVisibility(new Map())
        setTimeout(() => {
          isRestoringRef.current = false
        }, 0)
      }
    }
  }, [selectedStage, stageSectionsData])

  // Calculate and report section count whenever sections change
  useEffect(() => {
    if (onSectionCountChange) {
      const totalCount = Object.values(orderedSections).flat().length
      onSectionCountChange(selectedStage, totalCount)
    }
  }, [orderedSections, selectedStage, onSectionCountChange])

  // Report sections data whenever it changes (but not when restoring)
  useEffect(() => {
    if (onSectionsDataChange && !isRestoringRef.current) {
      // Create a deep copy of the sections data
      const sectionsData = {
        orderedSections: JSON.parse(JSON.stringify(orderedSections)),
        selectedSectionNames: Array.from(selectedSectionNames),
        sectionVisibility: Object.fromEntries(sectionVisibility)
      }
      onSectionsDataChange(selectedStage, sectionsData)
    }
  }, [orderedSections, selectedSectionNames, sectionVisibility, selectedStage, onSectionsDataChange])

  // Handle click outside to close copy from menu
  useEffect(() => {
    if (!showCopyFromMenu) return

    const handleClickOutside = (event) => {
      if (
        copyFromBtnRef.current &&
        !copyFromBtnRef.current.contains(event.target)
      ) {
        setShowCopyFromMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCopyFromMenu])

  const handleCopyFromStage = (sourceStageName) => {
    const sourceData = stageSectionsData[sourceStageName]
    if (sourceData) {
      // Deep copy the sections, preserving all properties including carryForward
      const copiedSections = JSON.parse(JSON.stringify(sourceData.orderedSections))
      
      // Ensure carryForward is preserved for all sections (in case it's missing)
      Object.keys(copiedSections).forEach(category => {
        copiedSections[category] = copiedSections[category].map(section => ({
          ...section,
          carryForward: section.carryForward || 'None'
        }))
      })
      
      const copiedNames = new Set(sourceData.selectedSectionNames)
      const copiedVisibility = new Map(Object.entries(sourceData.sectionVisibility))
      
      setOrderedSections(copiedSections)
      setSelectedSectionNames(copiedNames)
      setSectionVisibility(copiedVisibility)
      setShowCopyFromMenu(false)
    }
  }

  // Update sections when selection changes
  const handleSelectionChange = (selectedNames) => {
    setSelectedSectionNames(new Set(selectedNames))
    
    // Get all current sections (flattened)
    const allCurrentSections = Object.values(orderedSections).flat()
    
    // Create a map of existing sections by name
    const sectionsByName = new Map(allCurrentSections.map(s => [s.name, s]))
    
    // Add new sections that are selected but don't exist
    const newSections = []
    selectedNames.forEach(name => {
      if (!sectionsByName.has(name)) {
        newSections.push(createSectionFromName(name, allCurrentSections))
      }
    })
    
    // Remove sections that are no longer selected
    const sectionsToKeep = allCurrentSections.filter(s => selectedNames.includes(s.name))
    
    // Add new sections
    const allSections = [...sectionsToKeep, ...newSections]
    
    // Initialize visibility for new sections
    const newVisibility = new Map(sectionVisibility)
    newSections.forEach(section => {
      newVisibility.set(section.id, true)
    })
    setSectionVisibility(newVisibility)
    
    // Group by category
    const grouped = allSections.reduce((acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = []
      }
      acc[section.category].push(section)
      return acc
    }, {})
    
    setOrderedSections(grouped)
  }

  // Handle visibility toggle
  const handleToggleVisibility = (sectionId) => {
    const newVisibility = new Map(sectionVisibility)
    const currentVisibility = newVisibility.get(sectionId) ?? true
    newVisibility.set(sectionId, !currentVisibility)
    setSectionVisibility(newVisibility)
  }

  // Handle carry forward change
  const handleCarryForwardChange = (sectionId, category, newValue) => {
    const newOrdered = { ...orderedSections }
    const categorySections = newOrdered[category].map(s => 
      s.id === sectionId ? { ...s, carryForward: newValue } : s
    )
    newOrdered[category] = categorySections
    setOrderedSections(newOrdered)
  }

  // Handle section deletion
  const handleDeleteSection = (sectionId, category) => {
    // Find the section to delete first
    const sectionToDelete = orderedSections[category]?.find(s => s.id === sectionId)
    
    const newOrdered = { ...orderedSections }
    const categorySections = newOrdered[category].filter(s => s.id !== sectionId)
    
    if (categorySections.length === 0) {
      delete newOrdered[category]
    } else {
      newOrdered[category] = categorySections
    }
    
    setOrderedSections(newOrdered)
    
    // Remove from selected names and visibility map
    if (sectionToDelete) {
      const newSelected = new Set(selectedSectionNames)
      newSelected.delete(sectionToDelete.name)
      setSelectedSectionNames(newSelected)
      
      const newVisibility = new Map(sectionVisibility)
      newVisibility.delete(sectionToDelete.id)
      setSectionVisibility(newVisibility)
    }
  }

  // Handle clear all
  const handleClearAll = () => {
    setOrderedSections({})
    setSelectedSectionNames(new Set())
    setSectionVisibility(new Map())
  }


  const handleDragStart = (e, category, sectionId) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, sectionId }))
    e.currentTarget.classList.add('dragging')
    setDraggedCategory(category)
    setDraggedSectionId(sectionId)
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
    setDropIndicator(null)
    setDraggedCategory(null)
    setDraggedSectionId(null)
  }

  const handleDragOver = (e, targetCategory, targetSectionId) => {
    e.preventDefault()
    
    // Only allow drop if categories match and not dropping on itself
    if (draggedCategory !== targetCategory || draggedSectionId === targetSectionId) {
      e.dataTransfer.dropEffect = 'none'
      setDropIndicator(null)
      return
    }
    
    e.dataTransfer.dropEffect = 'move'
    
    // Determine if we should show indicator above or below the target row
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseY = e.clientY
    const rowMiddle = rect.top + rect.height / 2
    const position = mouseY < rowMiddle ? 'above' : 'below'
    
    setDropIndicator({
      sectionId: targetSectionId,
      position,
      category: targetCategory
    })
  }

  const handleDragLeave = (e) => {
    // Only clear indicator if we're leaving the table area
    const relatedTarget = e.relatedTarget
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDropIndicator(null)
    }
  }

  const handleDrop = (e, targetCategory, targetSectionId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const { category: sourceCategory, sectionId: sourceSectionId } = data

    if (sourceCategory !== targetCategory || sourceSectionId === targetSectionId) return

    const newOrdered = { ...orderedSections }
    const categorySections = [...newOrdered[sourceCategory]]
    const sourceIndex = categorySections.findIndex(s => s.id === sourceSectionId)
    const targetIndex = categorySections.findIndex(s => s.id === targetSectionId)
    
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return

    // Remove the item from its current position
    const [removed] = categorySections.splice(sourceIndex, 1)
    
    // Recalculate target index after removal
    // If we removed an item before the target, target index shifts down by 1
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    
    // Insert at the target's position (this will place the dragged item where the target was)
    categorySections.splice(adjustedTargetIndex + 1, 0, removed)
    
    newOrdered[sourceCategory] = categorySections
    setOrderedSections(newOrdered)
  }

  const handleColorIconClick = () => {
    setShowColorPicker(!showColorPicker)
  }

  const handleColorChange = (color) => {
    if (selectedStageData && onStageColorChange) {
      onStageColorChange(selectedStageData.id, color)
    }
  }

  const pastelColor = lightenColor(selectedColor)
  const darkenedColor = darkenColor(selectedColor)

  return (
    <div className="clinical-stage-config">
      <div className="config-section">
        <div className="color-section">
          <div style={{ flex: 1 }}>
            <label className="config-label">Calendar Block Color</label>
            <p className="config-description">
              Select a color to represent {selectedStage}s of this template.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div 
              ref={colorIconRef}
              className="color-icon" 
              onClick={handleColorIconClick}
              style={{
                borderTop: `1px solid ${selectedColor}`,
                borderRight: `1px solid ${selectedColor}`,
                borderBottom: `1px solid ${selectedColor}`,
                borderLeft: `6px solid ${selectedColor}`,
                backgroundColor: pastelColor,
                color: darkenedColor,
                cursor: 'pointer'
              }}
            >
              Aa
            </div>
            
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
              isOpen={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              triggerRef={colorIconRef}
              position="below"
            />
          </div>
        </div>
      </div>

      <div className="note-content-container">
        <div className="config-section">
          <div className="note-content-section">
            <div style={{ flex: 1 }}>
              <label className="config-label">{selectedStage} Note Content</label>
              <p className="config-description">
                Configure what content you want to see on this template view.
              </p>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="clear-btn"
                onClick={handleClearAll}
                disabled={Object.keys(orderedSections).length === 0}
              >
                Clear
              </button>
              <button
                ref={addSectionTopBtnRef}
                className="add-section-btn-top"
                onClick={() => {
                  if (showSectionSelector && sectionSelectorTrigger === 'top') {
                    setShowSectionSelector(false)
                    setSectionSelectorTrigger(null)
                  } else {
                    setShowSectionSelector(true)
                    setSectionSelectorTrigger('top')
                  }
                }}
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add Section</span>
              </button>
              {showSectionSelector && sectionSelectorTrigger === 'top' && (
                <SectionSelector
                  isOpen={showSectionSelector}
                  onClose={() => {
                    setShowSectionSelector(false)
                    setSectionSelectorTrigger(null)
                  }}
                  triggerRef={addSectionTopBtnRef}
                  position="below"
                  selectedSections={Array.from(selectedSectionNames)}
                  onSelectionChange={handleSelectionChange}
                />
              )}
            </div>
          </div>
        </div>

        <div className="config-table-wrapper" draggable="false">
        <table className="config-table" draggable="false">
          <thead>
            <tr>
              <th>
                <span>Section</span>
              </th>
              <th>Type</th>
              <th>Scribe?</th>
              {selectedStage !== 'Pre-op' && <th>Carry Forward Behavior</th>}
              <th></th>
            </tr>
          </thead>
          <tbody onDragLeave={handleDragLeave}>
            {Object.entries(orderedSections)
              .sort(([categoryA], [categoryB]) => {
                const indexA = CATEGORY_ORDER.indexOf(categoryA)
                const indexB = CATEGORY_ORDER.indexOf(categoryB)
                // If category is not in the order list, put it at the end
                const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA
                const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB
                return orderA - orderB
              })
              .map(([category, sections]) => (
              <React.Fragment key={category}>
                <tr className="category-row">
                  <td colSpan={selectedStage !== 'Pre-op' ? 5 : 4} className="category-header">{category}</td>
                </tr>
                {sections.map((section, index) => {
                  const showIndicatorAbove = dropIndicator?.sectionId === section.id && 
                                            dropIndicator?.position === 'above' && 
                                            dropIndicator?.category === category
                  const showIndicatorBelow = dropIndicator?.sectionId === section.id && 
                                            dropIndicator?.position === 'below' && 
                                            dropIndicator?.category === category
                  
                  return (
                    <React.Fragment key={section.id}>
                      {showIndicatorAbove && (
                        <tr className="drop-indicator-row">
                          <td colSpan={selectedStage !== 'Pre-op' ? 5 : 4} className="drop-indicator"></td>
                        </tr>
                      )}
                      <tr
                        className={`section-row ${sectionVisibility.get(section.id) === false ? 'disabled' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, category, section.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, category, section.id)}
                        onDrop={(e) => handleDrop(e, category, section.id)}
                      >
                        <td>
                          <div className="section-cell">
                            <div className="drag-handle">⋮⋮</div>
                            <span>{section.name}</span>
                          </div>
                        </td>
                        <td>{section.type}</td>
                        <td>
                          <button className={`toggle-switch small ${section.scribe ? 'on' : 'off'}`}>
                            <span className="toggle-slider"></span>
                          </button>
                        </td>
                        {selectedStage !== 'Pre-op' && (
                          <td>
                            <select 
                              className="carry-forward-select" 
                              value={section.carryForward || 'None'}
                              onChange={(e) => handleCarryForwardChange(section.id, category, e.target.value)}
                            >
                              <option value="None">None</option>
                              <option value="From last note">From last note</option>
                              <option value="From Initial Eval">From Initial Eval</option>
                              <option value="From most recent progress note">From most recent progress note</option>
                              <option value="From most recent progress note or Initial Eval">From most recent progress note or Initial Eval</option>
                            </select>
                          </td>
                        )}
                        <td>
                          <button
                            className="delete-section-btn"
                            onClick={() => handleDeleteSection(section.id, category)}
                            title="Delete section"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </td>
                      </tr>
                      {showIndicatorBelow && (
                        <tr className="drop-indicator-row">
                          <td colSpan={selectedStage !== 'Pre-op' ? 5 : 4} className="drop-indicator"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {Object.keys(orderedSections).length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">There is nothing here. Add sections to visit note.</p>
          </div>
        ) : null}
        <div className="add-section-bottom-wrapper">
          <button
            ref={addSectionBottomBtnRef}
            className="add-section-btn"
            onClick={() => {
              if (showSectionSelector && sectionSelectorTrigger === 'bottom') {
                setShowSectionSelector(false)
                setSectionSelectorTrigger(null)
              } else {
                setShowSectionSelector(true)
                setSectionSelectorTrigger('bottom')
              }
            }}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Section</span>
          </button>
          {Object.keys(orderedSections).length === 0 && (
            <div className="copy-from-button-wrapper" ref={copyFromBtnRef}>
              <button
                className="copy-from-btn"
                onClick={() => setShowCopyFromMenu(!showCopyFromMenu)}
              >
                Copy from...
                <span className="material-symbols-outlined" style={{ marginLeft: '8px', fontSize: '16px' }}>expand_more</span>
              </button>
              {showCopyFromMenu && (
                <div className="copy-from-menu">
                  {clinicalStages
                    .filter(stage => 
                      stage.name !== selectedStage && 
                      stageSectionsData[stage.name]?.orderedSections && 
                      Object.keys(stageSectionsData[stage.name].orderedSections).length > 0
                    )
                    .map(stage => (
                      <button
                        key={stage.id}
                        className="copy-from-menu-item"
                        onClick={() => handleCopyFromStage(stage.name)}
                      >
                        {stage.name}
                      </button>
                    ))}
                  {clinicalStages.filter(stage => 
                    stage.name !== selectedStage && 
                    stageSectionsData[stage.name]?.orderedSections && 
                    Object.keys(stageSectionsData[stage.name].orderedSections).length > 0
                  ).length === 0 && (
                    <div className="copy-from-menu-empty">No other stages have sections</div>
                  )}
                </div>
              )}
            </div>
          )}
          {showSectionSelector && sectionSelectorTrigger === 'bottom' && (
            <SectionSelector
              isOpen={showSectionSelector}
              onClose={() => {
                setShowSectionSelector(false)
                setSectionSelectorTrigger(null)
              }}
              triggerRef={addSectionBottomBtnRef}
              position="above"
              selectedSections={Array.from(selectedSectionNames)}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>
      </div>
      </div>

      <TreatmentCodes />
    </div>
  )
}

export default ClinicalStageConfig
