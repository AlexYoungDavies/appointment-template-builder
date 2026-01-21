import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import TemplateForm from './components/TemplateForm'
import ClinicalStageConfig from './components/ClinicalStageConfig'

function App() {
  const [selectedStage, setSelectedStage] = useState('Initial Evaluation')
  const [clinicalStages, setClinicalStages] = useState([
    { id: 'initial-evaluation', name: 'Initial Evaluation', enabled: true, selected: true, color: '#7044bb' },
    { id: 'daily-note', name: 'Daily Note', enabled: true, selected: false, color: '#7044bb' },
    { id: 'progress-note', name: 'Progress Note', enabled: true, selected: false, color: '#7044bb' },
    { id: 'discharge-note', name: 'Discharge Note', enabled: false, selected: false, color: '#7044bb' },
    { id: 'recertification', name: 'Re-certification', enabled: true, selected: false, color: '#7044bb' },
  ])
  const [stageSectionCounts, setStageSectionCounts] = useState({})
  const [stageSectionsData, setStageSectionsData] = useState({})

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

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <Header />
          <div className="content-wrapper">
            <div className="content-card">
              <TemplateForm
                clinicalStages={clinicalStages}
                onStageToggle={handleStageToggle}
                onStageSelect={handleStageSelect}
                onStageColorChange={handleStageColorChange}
                stageSectionCounts={stageSectionCounts}
              />
              <div className="clinical-stage-config-wrapper">
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
