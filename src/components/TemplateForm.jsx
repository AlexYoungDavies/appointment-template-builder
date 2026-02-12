import { useState, useRef } from 'react'
import './TemplateForm.css'
import ColorPicker, { lightenColor, darkenColor } from './ColorPicker'

function TemplateForm({ clinicalStages, onStageToggle, onStageSelect, onStageColorChange, stageSectionCounts, style }) {
  const [templateName, setTemplateName] = useState('')
  const [showColorPickerForStage, setShowColorPickerForStage] = useState(null)
  const colorPreviewRefs = useRef({})

  return (
    <div className="template-form" style={style}>
      <h1 className="page-title">Create Appointment Template</h1>
      
      <div className="form-section">
        <label className="form-label">Template Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      <div className="form-section">
        <h2 className="section-title">Applicable Clinical Stages</h2>
        <p className="section-description">
          Select which clinical stages views you want to include in this template, and what content each view contains.
        </p>
        
        <div className="clinical-stages-list">
          {clinicalStages.map((stage) => {
            const pastelColor = lightenColor(stage.color || '#7044bb')
            const darkenedColor = darkenColor(stage.color || '#7044bb')
            const isColorPickerOpen = showColorPickerForStage === stage.id
            const sectionCount = stageSectionCounts[stage.name] || 0
            
            return (
              <div
                key={stage.id}
                className={`clinical-stage-item ${stage.selected ? 'selected' : ''} ${!stage.enabled ? 'disabled' : ''}`}
                onClick={(e) => {
                  // Don't select stage if color picker is open
                  if (!isColorPickerOpen) {
                    onStageSelect(stage.id)
                  }
                }}
              >
                <div className="stage-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={stage.enabled}
                    onChange={() => onStageToggle(stage.id)}
                  />
                </div>
                <span className="stage-name">{stage.name}</span>
                <span className="stage-section-count">{sectionCount} {sectionCount === 1 ? 'Section' : 'Sections'}</span>
                <div className="stage-color-preview-wrapper">
                  <div 
                    ref={el => colorPreviewRefs.current[stage.id] = el}
                    className={`stage-color-preview ${!stage.enabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                      if (!stage.enabled) {
                        e.stopPropagation()
                        return
                      }
                      e.stopPropagation()
                      setShowColorPickerForStage(isColorPickerOpen ? null : stage.id)
                    }}
                    style={{
                      border: `1px solid ${!stage.enabled ? '#d0d0d0' : (stage.color || '#7044bb')}`,
                      backgroundColor: !stage.enabled ? '#e8e8e8' : pastelColor,
                      color: !stage.enabled ? '#999' : darkenedColor,
                      cursor: !stage.enabled ? 'not-allowed' : 'pointer'
                    }}
                  />
                  {stage.enabled && (
                    <ColorPicker
                      selectedColor={stage.color || '#7044bb'}
                      onColorChange={(color) => onStageColorChange(stage.id, color)}
                      isOpen={isColorPickerOpen}
                      onClose={() => setShowColorPickerForStage(null)}
                      triggerRef={colorPreviewRefs.current[stage.id]}
                      position="beside"
                    />
                  )}
                </div>
                <span className="material-symbols-outlined arrow-icon">chevron_right</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TemplateForm
