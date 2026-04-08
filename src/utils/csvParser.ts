import Papa from 'papaparse'

interface ParsedEmployee {
  name: string
  email: string
  department: string
}

export function parseCSV(file: File): Promise<ParsedEmployee[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const employees: ParsedEmployee[] = []
        const errors: string[] = []

        results.data.forEach((row, i) => {
          const name = (row.name || row.Name || '').trim()
          const email = (row.email || row.Email || '').trim()
          const department = (row.department || row.Department || '').trim()

          if (!name || !email) {
            errors.push(`Row ${i + 1}: missing name or email`)
            return
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Row ${i + 1}: invalid email "${email}"`)
            return
          }

          employees.push({ name, email, department: department || 'General' })
        })

        if (employees.length === 0) {
          reject(new Error(errors.length ? errors.join('; ') : 'No valid employees found in CSV'))
          return
        }

        resolve(employees)
      },
      error(err: Error) {
        reject(err)
      },
    })
  })
}
