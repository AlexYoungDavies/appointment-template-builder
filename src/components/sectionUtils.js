// Helpers shared between section selection/config components.

export const getCategoryForSection = (sectionName) => {
  const categoryMap = {
    Subjective: [
      'Chief Complaint',
      'History of Present Illness',
      'Past Medical History',
      'Medications',
      'Allergies',
      'Family History',
      'Social History',
      'Review of Systems',
    ],
    Objective: [
      'Physical Examination',
      'Vital Signs',
      'Measurements',
      'Functional Assessment Tool Scores',
      'Objective Comments',
      'Test Results',
    ],
    Assessment: ['Diagnosis', 'Assessments Template', 'Clinical Assessment', 'Problem List'],
    Plan: [
      'Plan of Care',
      'Goals',
      'Treatment Plan',
      'Medications Plan',
      'Follow-up Instructions',
      'Patient Education',
    ],
    Other: ['Visit Note Section', 'Custom Section', 'Additional Notes', 'Documentation'],
  }

  for (const [category, items] of Object.entries(categoryMap)) {
    if (items.includes(sectionName)) {
      return category
    }
  }
  return 'Other'
}

