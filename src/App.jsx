import { useState, useRef, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import TemplateForm from './components/TemplateForm'
import ClinicalStageConfig from './components/ClinicalStageConfig'

function App() {
  const [selectedStage, setSelectedStage] = useState('Pre-op')
  const [clinicalStages, setClinicalStages] = useState([
    { id: 'pre-op', name: 'Pre-op', enabled: true, selected: true, color: '#7044bb' },
    { id: 'operation', name: 'Operation', enabled: true, selected: false, color: '#7044bb' },
    { id: 'post-op', name: 'Post-op', enabled: true, selected: false, color: '#7044bb' },
    { id: '2-week-follow-up', name: '2 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
    { id: '4-week-follow-up', name: '4 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
    { id: '6-week-follow-up', name: '6 Week Follow-up', enabled: true, selected: false, color: '#7044bb' },
  ])
  const [stageSectionCounts, setStageSectionCounts] = useState({})
  const [stageSectionsData, setStageSectionsData] = useState({})
  const [leftColumnWidth, setLeftColumnWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const contentCardRef = useRef(null)

  const handleStageToggle = (stageId) => {
    setClinicalStages(stages =>
      stages.map(stage =>
        stage.id === stageId ? { ...stage, enabled: !stage.enabled } : stage
      )
    )
  }

  const handleStageSelect = (stageId) => {
    const stage = clinicalStages.find(s => s.id === stageId)
    if (stage && stage.enabled) {
      setSelectedStage(stage.name)
      setClinicalStages(stages =>
        stages.map(s => ({ ...s, selected: s.id === stageId }))
      )
    }
  }

  const handleStageColorChange = (stageId, color) => {
    setClinicalStages(stages =>
      stages.map(stage =>
        stage.id === stageId ? { ...stage, color } : stage
      )
    )
  }

  const handleSectionCountChange = (stageName, count) => {
    setStageSectionCounts(prev => ({
      ...prev,
      [stageName]: count
    }))
  }

  const handleSectionsDataChange = (stageName, sectionsData) => {
    setStageSectionsData(prev => ({
      ...prev,
      [stageName]: sectionsData
    }))
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

    const handleMouseUp = () => {
      setIsResizing(false)
    }

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
          <Header />
          <div className="content-wrapper">
            <div className="content-card" ref={contentCardRef}>
              <TemplateForm
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
