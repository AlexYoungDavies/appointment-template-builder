import './Header.css'

function Header({ onCancel, onSaveTemplate, onSaveAndCreateAnother }) {
  return (
    <div className="header">
      <button type="button" className="btn-cancel" onClick={onCancel}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Cancel</span>
      </button>
      <div className="header-actions">
        <button type="button" className="btn-secondary" onClick={onSaveAndCreateAnother}>
          Save & Create Another
        </button>
        <button type="button" className="btn-primary" onClick={onSaveTemplate}>
          Save Template
        </button>
      </div>
    </div>
  )
}

export default Header
