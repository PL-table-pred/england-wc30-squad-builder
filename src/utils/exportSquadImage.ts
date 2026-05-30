import { toPng } from 'html-to-image'

export async function downloadSquadImage(
  element: HTMLElement,
  filename = 'england-wc30-squad.png',
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
