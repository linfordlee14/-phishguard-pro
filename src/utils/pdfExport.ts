import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) throw new Error(`Element #${elementId} not found`)

  const canvas = await html2canvas(element, {
    backgroundColor: '#0A1628',
    scale: 2,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`${filename}.pdf`)
}
