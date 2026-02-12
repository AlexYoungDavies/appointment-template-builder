import React, { useState } from 'react'
import './AppointmentTemplatesList.css'

function AppointmentTemplatesList({ templates, onNew, onEdit, onDelete, onDuplicate }) {
  const [activeTab, setActiveTab] = useState('internal')
  const [searchQuery, setSearchQuery] = useState('')

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
    </div>
  )
}

export default AppointmentTemplatesList
