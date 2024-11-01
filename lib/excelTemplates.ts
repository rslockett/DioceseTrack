const clergyTemplate = {
  headers: [
    { header: 'First Name *', key: 'firstName', width: 20 },
    { header: 'Last Name *', key: 'lastName', width: 20 },
    { header: 'Type *', key: 'type', width: 15 },
    { header: 'Role *', key: 'role', width: 20 },
    { header: 'Status *', key: 'status', width: 15 },
    { header: 'Assignment Type *', key: 'assignmentType', width: 15 },
    { header: 'Current Assignment *', key: 'currentAssignment', width: 30 },
    { header: 'Email *', key: 'email', width: 30 },
    { header: 'Phone *', key: 'phone', width: 20 }
  ],
  validations: {
    // Dropdown validations
    type: ['Priest', 'Deacon', 'Bishop'],
    role: ['Pastor', 'Assistant Pastor', 'Youth Director'],
    status: ['Active', 'Inactive', 'Retired'],
    assignmentType: ['Parish', 'Other'],
    
    // Custom validations
    firstName: {
      type: 'custom',
      formula: 'LEN(TRIM(A:A))>0',
      errorTitle: 'Invalid First Name',
      error: 'First name cannot be empty'
    },
    lastName: {
      type: 'custom',
      formula: 'LEN(TRIM(B:B))>0',
      errorTitle: 'Invalid Last Name',
      error: 'Last name cannot be empty'
    },
    email: {
      type: 'custom',
      // Basic email validation regex
      formula: 'AND(ISNUMBER(FIND("@",H:H)),ISNUMBER(FIND(".",H:H,FIND("@",H:H))))',
      errorTitle: 'Invalid Email',
      error: 'Please enter a valid email address (example@domain.com)'
    },
    phone: {
      type: 'custom',
      // Phone format validation (XXX-XXX-XXXX or (XXX) XXX-XXXX)
      formula: 'OR(AND(LEN(I:I)=12,ISNUMBER(--SUBSTITUTE(SUBSTITUTE(I:I,"-","")," ",""))),AND(LEN(I:I)=14,ISNUMBER(--SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(I:I,"(",""),")",""),"-","")," ",""))))',
      errorTitle: 'Invalid Phone Number',
      error: 'Please enter phone as XXX-XXX-XXXX or (XXX) XXX-XXXX'
    },
    currentAssignment: {
      type: 'custom',
      formula: 'LEN(TRIM(G:G))>0',
      errorTitle: 'Invalid Assignment',
      error: 'Current assignment cannot be empty'
    }
  }
};

export const generateTemplate = async (type: 'deanery' | 'parish' | 'clergy') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type);
  
  let template;
  switch (type) {
    case 'clergy':
      template = clergyTemplate;
      break;
    // ... keep other cases ...
  }
  
  // Add headers
  worksheet.columns = template.headers;
  
  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add instructions row
  worksheet.insertRow(2, ['Required field', '', 'Select from dropdown', 'Select from dropdown', 
    'Select from dropdown', 'Select from dropdown', 'Required field', 
    'example@domain.com', 'XXX-XXX-XXXX']);
  const instructionRow = worksheet.getRow(2);
  instructionRow.font = { italic: true, color: { argb: 'FF666666' } };
  
  // Add data validation
  if (template.validations) {
    Object.entries(template.validations).forEach(([field, validation]) => {
      const colIndex = template.headers.findIndex(h => h.key === field) + 1;
      if (colIndex > 0) {
        const colLetter = String.fromCharCode(64 + colIndex);
        
        if (Array.isArray(validation)) {
          // Dropdown validation
          worksheet.dataValidations.add(`${colLetter}3:${colLetter}1000`, {
            type: 'list',
            allowBlank: false,
            formulae: [`"${validation.join(',')}"`],
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: `Invalid ${field}`,
            error: `Please select from: ${validation.join(', ')}`
          });
        } else {
          // Custom validation
          worksheet.dataValidations.add(`${colLetter}3:${colLetter}1000`, {
            type: 'custom',
            allowBlank: false,
            formulae: [validation.formula],
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: validation.errorTitle,
            error: validation.error
          });
        }
      }
    });
  }
  
  // Protect the worksheet
  worksheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: true,
    formatColumns: true,
    formatRows: true,
    insertColumns: false,
    insertRows: true,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: true,
    sort: false,
    autoFilter: false,
    pivotTables: false
  });

  // Lock header cells
  headerRow.eachCell((cell) => {
    cell.protection = { locked: true };
  });
  
  return await workbook.xlsx.writeBuffer();
}; 