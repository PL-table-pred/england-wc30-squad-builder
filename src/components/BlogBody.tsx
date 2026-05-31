import type { ReactNode } from 'react'

/** Renders blog post body: paragraphs, ## headings, **bold**, [text](url). */
export function BlogBody({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter((block) => block.trim().length > 0)

  return (
    <div className="prose-blog space-y-4 leading-relaxed text-slate-700">
      {blocks.map((block, index) => {
        const trimmed = block.trim()
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold text-england-navy">
              {inlineFormat(trimmed.slice(3))}
            </h2>
          )
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-england-navy">
              {inlineFormat(trimmed.slice(4))}
            </h3>
          )
        }
        return (
          <p key={index} className="whitespace-pre-wrap">
            {inlineFormat(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

function inlineFormat(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-england-navy">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            className="font-semibold text-england-red hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>,
        )
      } else {
        parts.push(token)
      }
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
