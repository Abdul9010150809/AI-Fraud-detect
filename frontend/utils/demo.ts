import { addAnalysis } from './storage'

function rand(min:number, max:number){ return Math.floor(Math.random()*(max-min+1))+min }

export function generateDemoAnalyses(count = 8) {
  const modes = ['text','url','image','audio','transaction']
  for (let i=0;i<count;i++){
    const risk = rand(10, 99)
    const mode = modes[rand(0, modes.length-1)]
    const rec = {
      risk_score: risk,
      confidence: +(Math.random().toFixed(2)),
      source: 'demo',
      details: { message: risk >= 85 ? 'Demo FRAUD detected' : 'Demo OK' }
    }
    addAnalysis(rec, mode)
  }
}
