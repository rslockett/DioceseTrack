import ExcelJS from 'exceljs'

// Template definitions
const TEMPLATES = {
  deanery: [
    'Name',
    'Description',
    'Location',
    'Dean Name'
  ],

  parish: [
    'Name',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Phone',
    'Email',
    'Website',
    'Deanery Name'
  ],

  clergy: [
    'Title',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Date of Birth (MM/DD/YYYY)',
    'Date of Ordination (MM/DD/YYYY)',
    'Status',
    'Position',
    'Assigned Parish',
    'Patron Saint',
    'Patron Saint Day (MM/DD)'
  ]
}

export const generateTemplate = async (type: 'deanery' | 'parish' | 'clergy') => {
  const workbook = new ExcelJS.Workbook()
  
  // Add data template worksheet
  const worksheet = workbook.addWorksheet('Data Template')
  
  // Add headers
  worksheet.addRow(TEMPLATES[type])
  
  // Style headers
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }

  // Add example row
  worksheet.addRow(new Array(TEMPLATES[type].length).fill(''))

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15
  })

  // Add instructions worksheet
  const instructionsSheet = workbook.addWorksheet('Instructions')
  instructionsSheet.addRow(['Instructions:'])
  instructionsSheet.addRow(['1. Do not modify or delete the header row'])
  instructionsSheet.addRow(['2. Fill in the data starting from row 2'])
  instructionsSheet.addRow(['3. Save the file and import it into the system'])
  instructionsSheet.addRow([''])
  instructionsSheet.addRow(['Notes:'])
  instructionsSheet.addRow([`Required fields: ${TEMPLATES[type].slice(0, 3).join(', ')}`])
  instructionsSheet.addRow(['Dates should be in MM/DD/YYYY format'])
  if (type === 'clergy') {
    instructionsSheet.addRow(['Status options: active, inactive, retired'])
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
} 