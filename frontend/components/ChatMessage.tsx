import React from 'react'
import AnalysisCard from './AnalysisCard'

export default function ChatMessage({ content, result }: { content: string, result: any }) {
  return (
    <div className="flex items-start space-x-4 my-3 motion-safe:animate-slide-up">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">Y</div>
      </div>
      <div className="flex-1">
        <div className="inline-block bg-gray-100 p-2 rounded-lg text-sm text-gray-800">You: {content}</div>
        <div className="mt-2">
          <AnalysisCard result={result} />
        </div>
      </div>
    </div>
  )
}
