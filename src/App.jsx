import { useState, useRef, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import TemplateForm from './components/TemplateForm'
import ClinicalStageConfig from './components/ClinicalStageConfig'
import AppointmentTemplatesList from './components/AppointmentTemplatesList'

const INITIAL_CLINICAL_STAGES = [
  { id: 'pre-op', name: 'Pre-op', enabled: true, selected: true, color: '#7044bb' },
  { id: 'operation', name: 'Operation', enabled: true, selected: false, color: '#7044bb' },
  { id: 'post-op', name: 'Post-op', enabled: true, selected: false, color: '#7044bb' },
  { id: '2-week-follow-up', name: '2 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
  { id: '4-week-follow-up', name: '4 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
  { id: '6-week-follow-up', name: '6 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
]

function generateTemplateId() {
  return 't-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

function App() {
  const [view, setView] = useState('list')
  const [templates, setTemplates] = useState([])
  const [editingTemplateId, setEditingTemplateId] = useState(null)

  const [templateName, setTemplateName] = useState('')
  const [selectedStage, setSelectedStage] = useState('Pre-op')
  const [clinicalStages, setClinicalStages] = useState(INITIAL_CLINICAL_STAGES)
  const [stageSectionCounts, setStageSectionCounts] = useState({})
  const [stageSectionsData, setStageSectionsData] = useState({})
  const [stageDurations, setStageDurations] = useState({})
  const [leftColumnWidth, setLeftColumnWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const contentCardRef = useRef(null)

  const loadTemplateIntoConfig = (template) => {
    if (!template) return
    setTemplateName(template.name || '')
    setClinicalStages(JSON.parse(JSON.stringify(template.clinicalStages || INITIAL_CLINICAL_STAGES)))
    setStageSectionCounts({ ...(template.stageSectionCounts || {}) })
    setStageSectionsData(JSON.parse(JSON.stringify(template.stageSectionsData || {})))
    setStageDurations({ ...(template.stageDurations || {}) })
    const firstEnabled = (template.clinicalStages || INITIAL_CLINICAL_STAGES).find((s) => s.enabled)
    setSelectedStage(firstEnabled?.name || 'Pre-op')
  }

  const resetConfigToEmpty = () => {
    setTemplateName('')
    setClinicalStages(JSON.parse(JSON.stringify(INITIAL_CLINICAL_STAGES)))
    setStageSectionCounts({})
    setStageSectionsData({})
    setStageDurations({})
    setSelectedStage('Pre-op')
    setEditingTemplateId(null)
  }

  const getCurrentConfigSnapshot = () => ({
    name: templateName,
    clinicalStages: JSON.parse(JSON.stringify(clinicalStages)),
    stageSectionCounts: { ...stageSectionCounts },
    stageSectionsData: JSON.parse(JSON.stringify(stageSectionsData)),
    stageDurations: { ...stageDurations },
  })

  const handleNewTemplate = () => {
    resetConfigToEmpty()
    setView('config')
  }

  const handleEditTemplate = (id) => {
    const template = templates.find((t) => t.id === id)
    if (!template) return
    setEditingTemplateId(id)
    loadTemplateIntoConfig(template)
    setView('config')
  }

  const handleDeleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDuplicateTemplate = (id) => {
    const template = templates.find((t) => t.id === id)
    if (!template) return
    const newTemplate = {
      id: generateTemplateId(),
      name: (template.name || 'Untitled') + ' Copy',
      clinicalStages: JSON.parse(JSON.stringify(template.clinicalStages || INITIAL_CLINICAL_STAGES)),
      stageSectionCounts: { ...(template.stageSectionCounts || {}) },
      stageSectionsData: JSON.parse(JSON.stringify(template.stageSectionsData || {})),
      stageDurations: { ...(template.stageDurations || {}) },
    }
    setTemplates((prev) => [...prev, newTemplate])
    setEditingTemplateId(newTemplate.id)
    loadTemplateIntoConfig(newTemplate)
    setView('config')
  }

  const handleCancel = () => {
    setView('list')
  }

  const handleSaveTemplate = () => {
    const snapshot = getCurrentConfigSnapshot()
    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplateId
            ? { ...t, ...snapshot }
            : t
        )
      )
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: generateTemplateId(), ...snapshot },
      ])
    }
    setView('list')
  }

  const handleSaveAndCreateAnother = () => {
    const snapshot = getCurrentConfigSnapshot()
    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplateId ? { ...t, ...snapshot } : t
        )
      )
    } else {
      setTemplates((prev) => [...prev, { id: generateTemplateId(), ...snapshot }])
    }
    resetConfigToEmpty()
    setView('config')
  }

  const handleStageToggle = (stageId) => {
    setClinicalStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId ? { ...stage, enabled: !stage.enabled } : stage
      )
    )
  }

  const handleStageSelect = (stageId) => {
    const stage = clinicalStages.find((s) => s.id === stageId)
    if (stage && stage.enabled) {
      setSelectedStage(stage.name)
      setClinicalStages((stages) =>
        stages.map((s) => ({ ...s, selected: s.id === stageId }))
      )
    }
  }

  const handleStageColorChange = (stageId, color) => {
    setClinicalStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId ? { ...stage, color } : stage
      )
    )
  }

  const handleSectionCountChange = (stageName, count) => {
    setStageSectionCounts((prev) => ({ ...prev, [stageName]: count }))
  }

  const handleSectionsDataChange = (stageName, sectionsData) => {
    setStageSectionsData((prev) => ({ ...prev, [stageName]: sectionsData }))
  }

  const handleStageDurationChange = (stageName, duration) => {
    setStageDurations((prev) => ({ ...prev, [stageName]: duration }))
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !contentCardRef.current) return
      const contentCardRect = contentCardRef.current.getBoundingClientRect()
      const newLeftWidth = e.clientX - contentCardRect.left
      const minLeftWidth = 380
      const minRightWidth = 700
      const maxLeftWidth = contentCardRect.width - minRightWidth
      if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
        setLeftColumnWidth(newLeftWidth)
      }
    }
    const handleMouseUp = () => setIsResizing(false)
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          {view === 'list' ? (
            <AppointmentTemplatesList
              templates={templates}
              onNew={handleNewTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
            />
          ) : (
            <div className="config-view">
              <Header
                onCancel={handleCancel}
                onSaveTemplate={handleSaveTemplate}
                onSaveAndCreateAnother={handleSaveAndCreateAnother}
              />
              <div className="content-wrapper">
                <div className="content-card" ref={contentCardRef}>
                  <TemplateForm
                    templateName={templateName}
                    onTemplateNameChange={setTemplateName}
                    clinicalStages={clinicalStages}
                    onStageToggle={handleStageToggle}
                    onStageSelect={handleStageSelect}
                    onStageColorChange={handleStageColorChange}
                    stageSectionCounts={stageSectionCounts}
                    style={{ width: `${leftColumnWidth}px`, minWidth: '380px' }}
                  />
                  <div
                    className="resizer"
                    onMouseDown={handleMouseDown}
                    style={{ cursor: 'col-resize' }}
                  />
                  <div
                    className="clinical-stage-config-wrapper"
                    style={{ minWidth: '700px' }}
                  >
                    <ClinicalStageConfig
                      selectedStage={selectedStage}
                      clinicalStages={clinicalStages}
                      onStageColorChange={handleStageColorChange}
                      onSectionCountChange={handleSectionCountChange}
                      onSectionsDataChange={handleSectionsDataChange}
                      stageSectionsData={stageSectionsData}
                      stageDurations={stageDurations}
                      onStageDurationChange={handleStageDurationChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
