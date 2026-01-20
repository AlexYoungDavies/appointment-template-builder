import './Sidebar.css'

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">A</div>
          <span className="logo-text">Air</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-item active">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>Calendar</span>
        </div>
        <div className="nav-item">
          <span className="material-symbols-outlined">people</span>
          <span>Patients</span>
        </div>
        <div className="nav-item">
          <span className="material-symbols-outlined">inbox</span>
          <span>Inbox</span>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-item">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </div>
        <div className="nav-item">
          <span className="material-symbols-outlined">logout</span>
          <span>Log Out</span>
        </div>
        <div className="user-profile">
          <div className="user-avatar">UL</div>
          <span>Username Lastname</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
