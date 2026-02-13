import { useState, useRef, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import TemplateForm from './components/TemplateForm'
import ClinicalStageConfig from './components/ClinicalStageConfig'
import AppointmentTemplatesList from './components/AppointmentTemplatesList'

const DEFAULT_STAGE_COLOR = '#7044bb'

// Master list of clinical stages. This collection controls what shows up
// in the "Applicable Clinical Stages" list when configuring templates.
const INITIAL_CLINICAL_STAGE_CATALOG = [
  { id: 'pre-op', name: 'Pre-op', evaluative: false },
  { id: 'operation', name: 'Operation', evaluative: false },
  { id: 'post-op', name: 'Post-op', evaluative: false },
  { id: '2-week-follow-up', name: '2 Week Follow-up', evaluative: false },
  { id: '4-week-follow-up', name: '4 Week Follow-up', evaluative: false },
  { id: '6-week-follow-up', name: '6 Week Follow-up', evaluative: false },
]

function makeStageIdFromName(name, existingIds = new Set()) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  let id = base || 'stage'
  let counter = 2
  while (existingIds.has(id)) {
    id = `${base || 'stage'}-${counter}`
    counter++
  }
  return id
}

function buildNewTemplateStagesFromCatalog(catalog) {
  const stages = catalog.map((s, idx) => ({
    id: s.id,
    name: s.name,
    evaluative: !!s.evaluative,
    enabled: true,
    selected: idx === 0,
    color: DEFAULT_STAGE_COLOR,
  }))
  return stages
}

function mergeTemplateStagesWithCatalog(existingStages, catalog, { newStagesEnabledDefault = false } = {}) {
  const existingById = new Map((existingStages || []).map((s) => [s.id, s]))
  const merged = catalog.map((cat) => {
    const existing = existingById.get(cat.id)
    if (existing) {
      return {
        ...existing,
        id: cat.id,
        name: cat.name,
        evaluative: !!cat.evaluative,
        color: existing.color || DEFAULT_STAGE_COLOR,
      }
    }
    return {
      id: cat.id,
      name: cat.name,
      evaluative: !!cat.evaluative,
      enabled: newStagesEnabledDefault,
      selected: false,
      color: DEFAULT_STAGE_COLOR,
    }
  })

  // Ensure exactly one selected enabled stage (fallback to first enabled).
  const anySelectedEnabled = merged.some((s) => s.enabled && s.selected)
  if (!anySelectedEnabled) {
    const firstEnabledId = merged.find((s) => s.enabled)?.id
    return merged.map((s) => ({ ...s, selected: s.id === firstEnabledId }))
  }

  // If multiple are selected, keep the first selected enabled stage.
  const firstSelectedEnabledId = merged.find((s) => s.enabled && s.selected)?.id
  return merged.map((s) => ({ ...s, selected: s.id === firstSelectedEnabledId }))
}

function generateTemplateId() {
  return 't-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

function App() {
  const [view, setView] = useState('list')
  const [templates, setTemplates] = useState([])
  const [editingTemplateId, setEditingTemplateId] = useState(null)

  const [clinicalStageCatalog, setClinicalStageCatalog] = useState(INITIAL_CLINICAL_STAGE_CATALOG)
  const [templateName, setTemplateName] = useState('')
  const [selectedStage, setSelectedStage] = useState('Pre-op')
  const [clinicalStages, setClinicalStages] = useState(() =>
    buildNewTemplateStagesFromCatalog(INITIAL_CLINICAL_STAGE_CATALOG)
  )
  const [stageSectionCounts, setStageSectionCounts] = useState({})
  const [stageSectionsData, setStageSectionsData] = useState({})
  const [stageDurations, setStageDurations] = useState({})
  const [leftColumnWidth, setLeftColumnWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const contentCardRef = useRef(null)

  // Keep the template-stage list aligned to the master catalog (e.g. newly added stages appear).
  useEffect(() => {
    setClinicalStages((prev) =>
      mergeTemplateStagesWithCatalog(prev, clinicalStageCatalog, { newStagesEnabledDefault: false })
    )
  }, [clinicalStageCatalog])

  const loadTemplateIntoConfig = (template) => {
    if (!template) return
    setTemplateName(template.name || '')
    const mergedStages = mergeTemplateStagesWithCatalog(
      JSON.parse(JSON.stringify(template.clinicalStages || [])),
      clinicalStageCatalog,
      { newStagesEnabledDefault: false }
    )
    setClinicalStages(mergedStages)
    setStageSectionCounts({ ...(template.stageSectionCounts || {}) })
    setStageSectionsData(JSON.parse(JSON.stringify(template.stageSectionsData || {})))
    setStageDurations({ ...(template.stageDurations || {}) })
    const firstEnabled = mergedStages.find((s) => s.enabled)
    setSelectedStage(firstEnabled?.name || mergedStages[0]?.name || 'Pre-op')
  }

  const resetConfigToEmpty = () => {
    setTemplateName('')
    const freshStages = buildNewTemplateStagesFromCatalog(clinicalStageCatalog)
    setClinicalStages(JSON.parse(JSON.stringify(freshStages)))
    setStageSectionCounts({})
    setStageSectionsData({})
    setStageDurations({})
    setSelectedStage(freshStages[0]?.name || 'Pre-op')
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
      clinicalStages: JSON.parse(JSON.stringify(template.clinicalStages || [])),
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

  const handleCreateClinicalStage = ({ name, evaluative }) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return

    const existingIds = new Set(clinicalStageCatalog.map((s) => s.id))
    const newId = makeStageIdFromName(trimmed, existingIds)
    setClinicalStageCatalog((prev) => [...prev, { id: newId, name: trimmed, evaluative: !!evaluative }])
  }

  const handleDeleteClinicalStage = (stageId) => {
    const removedStageName = clinicalStageCatalog.find((s) => s.id === stageId)?.name
    setClinicalStageCatalog((prev) => prev.filter((s) => s.id !== stageId))

    // Remove from templates so global stage removals are reflected everywhere.
    setTemplates((prev) =>
      prev.map((t) => {
        const nextStages = (t.clinicalStages || []).filter((s) => s.id !== stageId)
        if (nextStages.length === (t.clinicalStages || []).length) return t
        const next = { ...t, clinicalStages: nextStages }
        if (removedStageName) {
          const { [removedStageName]: _c, ...restCounts } = next.stageSectionCounts || {}
          const { [removedStageName]: _s, ...restSections } = next.stageSectionsData || {}
          const { [removedStageName]: _d, ...restDurations } = next.stageDurations || {}
          next.stageSectionCounts = restCounts
          next.stageSectionsData = restSections
          next.stageDurations = restDurations
        }
        return next
      })
    )

    // Also remove from the currently edited template config (if present).
    let nextSelectedStageName = null
    setClinicalStages((prev) => {
      const next = (prev || []).filter((s) => s.id !== stageId)
      const anySelectedEnabled = next.some((s) => s.enabled && s.selected)
      if (!anySelectedEnabled) {
        const firstEnabledId = next.find((s) => s.enabled)?.id
        const normalized = next.map((s) => ({ ...s, selected: s.id === firstEnabledId }))
        nextSelectedStageName = normalized.find((s) => s.selected)?.name ?? normalized[0]?.name ?? null
        return normalized
      }
      const firstSelectedEnabledId = next.find((s) => s.enabled && s.selected)?.id
      const normalized = next.map((s) => ({ ...s, selected: s.id === firstSelectedEnabledId }))
      nextSelectedStageName = normalized.find((s) => s.selected)?.name ?? normalized[0]?.name ?? null
      return normalized
    })
    if (removedStageName) {
      setStageSectionCounts((prev) => {
        const { [removedStageName]: _removed, ...rest } = prev || {}
        return rest
      })
      setStageSectionsData((prev) => {
        const { [removedStageName]: _removed, ...rest } = prev || {}
        return rest
      })
      setStageDurations((prev) => {
        const { [removedStageName]: _removed, ...rest } = prev || {}
        return rest
      })
    }

    // Ensure selected stage is valid.
    setSelectedStage((prevSelected) => {
      if (removedStageName && prevSelected === removedStageName) {
        return nextSelectedStageName || 'Pre-op'
      }
      return prevSelected
    })
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          {view === 'list' ? (
            <AppointmentTemplatesList
              templates={templates}
              clinicalStageCatalog={clinicalStageCatalog}
              onNew={handleNewTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              onCreateClinicalStage={handleCreateClinicalStage}
              onDeleteClinicalStage={handleDeleteClinicalStage}
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
