import './Header.css'

function Header() {
  return (
    <div className="header">
      <button className="btn-cancel">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Cancel</span>
      </button>
      <div className="header-actions">
        <button className="btn-secondary">Save & Create Another</button>
        <button className="btn-primary">Save Template</button>
      </div>
    </div>
  )
}

export default Header
