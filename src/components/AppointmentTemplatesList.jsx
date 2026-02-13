import React, { useEffect, useMemo, useRef, useState } from 'react'
import './AppointmentTemplatesList.css'

function AppointmentTemplatesList({
  templates,
  clinicalStageCatalog = [],
  clinicalStagesEnabled = true,
  onToggleClinicalStagesEnabled,
  onNew,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateClinicalStage,
  onDeleteClinicalStage,
}) {
  const [activeTab, setActiveTab] = useState('internal')
  const [searchQuery, setSearchQuery] = useState('')

  const [isStageDrawerOpen, setIsStageDrawerOpen] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newStageEvaluative, setNewStageEvaluative] = useState(false)
  const stageNameInputRef = useRef(null)

  const normalizedStageName = newStageName.trim()
  const stageNameExists = useMemo(() => {
    if (!normalizedStageName) return false
    const target = normalizedStageName.toLowerCase()
    return (clinicalStageCatalog || []).some((s) => (s.name || '').trim().toLowerCase() === target)
  }, [clinicalStageCatalog, normalizedStageName])

  const filteredTemplates = searchQuery.trim()
    ? templates.filter((template) => {
        const name = (template.name || 'Untitled').toLowerCase()
        const stagesText = (template.clinicalStages || [])
          .filter((s) => s.enabled)
          .map((s) => s.name)
          .join(' ')
          .toLowerCase()
        const q = searchQuery.trim().toLowerCase()
        return name.includes(q) || stagesText.includes(q)
      })
    : templates

  useEffect(() => {
    if (!isStageDrawerOpen) return
    stageNameInputRef.current?.focus?.()
  }, [isStageDrawerOpen])

  useEffect(() => {
    if (!isStageDrawerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsStageDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isStageDrawerOpen])

  const openCreateStageDrawer = () => {
    setNewStageName('')
    setNewStageEvaluative(false)
    setIsStageDrawerOpen(true)
  }

  const handleCreateStage = () => {
    if (!normalizedStageName || stageNameExists) return
    onCreateClinicalStage?.({ name: normalizedStageName, evaluative: newStageEvaluative })
    setIsStageDrawerOpen(false)
  }

  return (
    <div className="appointment-templates-list">
      <div className="templates-list-header">
        <div className="templates-header-content">
          <h1 className="templates-list-title">Appointment Templates</h1>
          <p className="templates-list-description">
            Appointment templates allow you to tailor what content shows up on your visit note.
          </p>
        </div>
      </div>
      <div className="clinical-stages-block">
        <div className="clinical-stages-settings-row">
          <div className="clinical-stages-settings-content">
            <div className="clinical-stages-settings-title">Enable Clinical Stages</div>
            <div className="clinical-stages-settings-description">
              Clinical stages represent different stages in a patient&apos;s journey through your care. Enabling this allows you to tailor appointment templates for each stage you add.
            </div>
          </div>
          <button
            type="button"
            className={`clinical-stages-toggle ${clinicalStagesEnabled ? 'on' : 'off'}`}
            aria-pressed={clinicalStagesEnabled}
            aria-label="Enable clinical stages"
            onClick={() => onToggleClinicalStagesEnabled?.()}
          >
            <span className="clinical-stages-toggle-slider" />
          </button>
        </div>

        {clinicalStagesEnabled ? (
          <div className="clinical-stages-section">
            <div className="clinical-stages-header-row">
              <div className="clinical-stages-header-content">
                <h2 className="clinical-stages-title">Your Clinical Stages</h2>
              </div>
              <button type="button" className="btn-new-template btn-new-stage" onClick={openCreateStageDrawer}>
                <span className="material-symbols-outlined btn-new-icon">add</span>
                Add Stage
              </button>
            </div>

            <table className="templates-table clinical-stages-table">
              <thead>
                <tr>
                  <th className="col-name">Stage</th>
                  <th className="col-evaluative">Evaluative?</th>
                  <th className="col-actions" />
                </tr>
              </thead>
              <tbody>
                {(clinicalStageCatalog || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-state-cell">
                      No clinical stages yet. Create one using &quot;Add Stage&quot;.
                    </td>
                  </tr>
                ) : (
                  (clinicalStageCatalog || []).map((stage) => (
                    <tr key={stage.id}>
                      <td className="col-name">{stage.name}</td>
                      <td className="col-evaluative">{stage.evaluative ? 'Yes' : 'No'}</td>
                      <td className="col-actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => onDeleteClinicalStage?.(stage.id)}
                            title="Delete"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="clinical-stages-disabled-hint">
            Clinical stages are disabled. Templates will have a single configuration (no stage-specific versions).
          </div>
        )}
      </div>

      <div className="templates-table-wrapper">
        <div className="templates-header-row">
          <div className="tabs-wrapper">
            <button
              type="button"
              className={`tab ${activeTab === 'internal' ? 'active' : ''}`}
              onClick={() => setActiveTab('internal')}
            >
              Internal
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'external' ? 'active' : ''}`}
              onClick={() => setActiveTab('external')}
            >
              External
            </button>
            <span className="tab-help-icon material-symbols-outlined" title="Help">help</span>
          </div>
          <div className="search-and-actions">
            <label className="search-label" htmlFor="templates-search">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                id="templates-search"
                type="search"
                className="templates-search-input"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search appointment templates"
              />
            </label>
            <button type="button" className="btn-new-template" onClick={onNew}>
            <span className="material-symbols-outlined btn-new-icon">add</span>
            New Template
          </button>
          </div>
        </div>
        <table className="templates-table">
          <thead>
            <tr>
              <th className="col-name">Name</th>
              <th className="col-stages">Clinical Stages</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state-cell">
                  No appointment templates yet. Create one using &quot;New Template&quot;.
                </td>
              </tr>
            ) : filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state-cell">
                  No templates match &quot;{searchQuery}&quot;.
                </td>
              </tr>
            ) : (
              filteredTemplates.map((template) => {
                const supportedStages = (template.clinicalStages || [])
                  .filter((s) => s.enabled)
                  .map((s) => s.name)
                const stagesText = supportedStages.length > 0 ? supportedStages.join(', ') : '—'
                return (
                  <tr key={template.id}>
                    <td className="col-name">{template.name || 'Untitled'}</td>
                    <td className="col-stages" title={stagesText}>
                      {stagesText}
                    </td>
                    <td className="col-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onEdit(template.id)}
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onDelete(template.id)}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onDuplicate(template.id)}
                          title="Duplicate"
                        >
                          <span className="material-symbols-outlined">content_copy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {isStageDrawerOpen ? (
        <div className="drawer-overlay" onClick={() => setIsStageDrawerOpen(false)} role="presentation">
          <aside
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Create clinical stage"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <div className="drawer-title">Create Clinical Stage</div>
                <div className="drawer-subtitle">Add a clinical stage to be used in appointment templates.</div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsStageDrawerOpen(false)}
                title="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-field">
                <label className="drawer-label" htmlFor="new-clinical-stage-name">Name</label>
                <input
                  id="new-clinical-stage-name"
                  ref={stageNameInputRef}
                  type="text"
                  className="drawer-input"
                  placeholder="e.g. Initial Eval"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                />
                {stageNameExists ? (
                  <div className="drawer-field-hint error">A clinical stage with this name already exists.</div>
                ) : null}
              </div>

              <label className="drawer-checkbox-row">
                <input
                  type="checkbox"
                  checked={newStageEvaluative}
                  onChange={(e) => setNewStageEvaluative(e.target.checked)}
                />
                <span>Evaluative</span>
              </label>
            </div>

            <div className="drawer-footer">
              <button type="button" className="drawer-secondary-btn" onClick={() => setIsStageDrawerOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="drawer-primary-btn"
                onClick={handleCreateStage}
                disabled={!normalizedStageName || stageNameExists}
              >
                Create Stage
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default AppointmentTemplatesList
