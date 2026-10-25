import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { getRecipe, getRecommendations, methodLabel as getMethodLabel } from './recipes.js'
import './style.css'

const STORAGE_KEY = 'pour-over-sessions'
const emptyAnswers = { acidity: '', sweetness: '', bitterness: '', balance: '', satisfaction: '' }

function App() {
  const [screen, setScreen] = useState('home')
  const [method, setMethod] = useState('v60')
  const [dose, setDose] = useState(15)
  const [bean, setBean] = useState('')
  const [roast, setRoast] = useState('中焙')
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [answers, setAnswers] = useState(emptyAnswers)
  const recipe = useMemo(() => getRecipe(method, roast, Number(dose) || 15), [method, roast, dose])
  const recommendations = getRecommendations(roast)
  const step = recipe.steps[stepIndex]

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => setSecondsLeft((s) => {
      if (s <= 1) { setRunning(false); return 0 }
      return s - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  function beginBrew() {
    setStepIndex(0)
    setSecondsLeft(recipe.steps[0].seconds)
    setRunning(false)
    setScreen('timer')
  }
  function goBack() {
    setRunning(false)
    const previous = { method: 'home', setup: 'method', timer: 'setup', tasting: 'setup', history: 'home' }
    setScreen(previous[screen] || 'home')
  }
  function toggleTimer() {
    if (secondsLeft === 0) {
      setSecondsLeft(recipe.steps[stepIndex].seconds)
      setRunning(true)
    } else {
      setRunning((value) => !value)
    }
  }
  function nextStep() {
    if (stepIndex < recipe.steps.length - 1) {
      const next = stepIndex + 1
      setStepIndex(next)
      setSecondsLeft(recipe.steps[next].seconds)
      setRunning(false)
    } else {
      setRunning(false)
      setAnswers(emptyAnswers)
      setScreen('tasting')
    }
  }
  function saveSession() {
    const entry = { id: Date.now(), date: new Date().toISOString(), method, dose: Number(dose), bean: bean.trim(), roast, answers }
    const next = [entry, ...sessions]
    setSessions(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setScreen('history')
  }
  function clearHistory() {
    if (!window.confirm('確定清除所有沖煮紀錄？')) return
    setSessions([])
    localStorage.removeItem(STORAGE_KEY)
  }
  const methodLabel = getMethodLabel(method)
  const canSave = Object.values(answers).every(Boolean)
  const questions = [
    ['acidity', '酸度', ['偏低', '剛剛好', '偏高']],
    ['sweetness', '甜感', ['不明顯', '有甜感', '很甜']],
    ['bitterness', '苦味', ['偏低', '剛剛好', '偏高']],
    ['balance', '濃度／萃取感', ['偏淡／缺萃', '平衡', '偏濃／過萃']],
    ['satisfaction', '整體滿意度', ['不太滿意', '普通', '滿意']],
  ]

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('home')} aria-label="回到首頁"><span className="brand-mark">☕</span> 手沖小教室</button>
      {screen !== 'home' && <button className="back-button" onClick={goBack}>← 返回</button>}
    </header>

    {screen === 'home' && <section className="home-page">
      <div className="home-welcome"><div><div className="eyebrow">SLOW DOWN, POUR WELL</div><h1>嗨，今天也來沖一杯好咖啡吧！</h1><p className="lead">從一壺熱水開始，享受專屬於你的手沖時光。</p></div><span className="welcome-heart" aria-hidden="true">♥</span></div>
      <div className="home-art"><img src="/illustrations/home-hero.png" alt="手沖壺將熱水注入 V60 濾杯，咖啡滴入玻璃分享壺" /></div>
      <div className="home-actions"><button className="button primary" onClick={() => setScreen('method')}>☕　開始沖煮 <span>→</span></button><button className="button secondary" onClick={() => setScreen('history')}><span className="record-icon">▤</span><span>沖煮紀錄</span><span>›</span></button></div>
      <p className="small-note">不求完美，先沖一杯看看。</p>
    </section>}

    {screen === 'method' && <section className="content-page">
      <div className="eyebrow">01 / 選擇器具</div><h2>今天想用哪一種？</h2><p className="subcopy">先選烘焙度，看看適合這杯的沖煮方式。</p>
      <fieldset className="method-roast"><legend className="field-label">烘焙度</legend><div className="roast-options">{['淺焙', '中焙', '深焙'].map((item) => <button key={item} className={roast === item ? 'active' : ''} onClick={() => setRoast(item)}>{item}</button>)}</div></fieldset>
      <div className="method-grid">
        {recommendations.map((item) => <button key={item.id} className={`method-card ${method === item.id ? 'selected' : ''}`} onClick={() => setMethod(item.id)}><span className="badge">推薦 {item.rank}</span>{item.icon ? <img className="method-icon" src={item.icon} alt={`${item.label}插畫`} /> : <span className="method-icon kalita-icon" aria-hidden="true">◉</span>}<strong>{item.label}</strong><small>{item.blurb}</small><small className="method-reason">{item.reason}</small><small className="method-stages">{item.id === 'clever' ? `${item.pourStages} 段浸泡注水` : `${item.pourStages} 段注水`}</small></button>)}
      </div>
      <button className="button primary full" onClick={() => setScreen('setup')}>下一步 <span>→</span></button>
    </section>}

    {screen === 'setup' && <section className="content-page">
      <div className="eyebrow">02 / 沖煮設定</div><h2>準備好你的咖啡豆</h2><p className="subcopy">{methodLabel} · 教學建議會隨粉量與烘焙度調整。</p>
      <div className="form-card">
        <label className="field-label" htmlFor="dose">咖啡粉量 <span>DOSE</span></label><div className="dose-control"><button aria-label="減少粉量" onClick={() => setDose((d) => Math.max(5, Number(d) - 1))}>−</button><input id="dose" type="number" min="5" max="40" value={dose} onChange={(e) => setDose(e.target.value)} /><span>g</span><button aria-label="增加粉量" onClick={() => setDose((d) => Math.min(40, Number(d) + 1))}>＋</button></div>
        <label className="field-label" htmlFor="bean">豆種／品名 <span>OPTIONAL</span></label><input id="bean" className="text-input" placeholder="例如：耶加雪菲・水洗" value={bean} onChange={(e) => setBean(e.target.value)} />
        <fieldset><legend className="field-label">烘焙度</legend><div className="roast-options">{['淺焙', '中焙', '深焙'].map((item) => <button key={item} className={roast === item ? 'active' : ''} onClick={() => setRoast(item)}>{item}</button>)}</div></fieldset>
      </div>
      <div className="recommendation"><div className="recommendation-head"><strong>這杯的教學建議</strong><span>✳</span></div><div className="stats"><div><small>水粉比</small><strong>{recipe.ratio}</strong></div><div><small>總水量</small><strong>{recipe.water}<i>g</i></strong></div><div><small>水溫</small><strong>{recipe.temp}</strong></div></div><p>研磨：{recipe.grind}</p><p className="disclaimer">教學預設，非絕對真理</p></div>
      <button className="button primary full" onClick={beginBrew}>開始跟著沖 <span>→</span></button>
    </section>}

    {screen === 'timer' && <section className="content-page timer-page">
      <div className="eyebrow">03 / 跟著節奏沖</div><div className="timer-heading"><h2>{methodLabel} 沖煮中</h2><span>{stepIndex + 1} / {recipe.steps.length}</span></div>
      <div className="progress-track"><span style={{ width: `${((stepIndex + 1) / recipe.steps.length) * 100}%` }} /></div>
      <article className="step-card"><div className="step-number">STEP {String(stepIndex + 1).padStart(2, '0')}</div><h3>{step.title}</h3><p>{step.detail}</p><div className="countdown">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</div><small>步驟計時・可依手感調整</small></article>
      <div className="timer-controls"><button className="button secondary" onClick={toggleTimer}>{running ? '暫停' : secondsLeft === 0 ? '重新計時' : '開始計時'}</button><button className="button primary" onClick={nextStep}>{stepIndex === recipe.steps.length - 1 ? '完成沖煮' : '下一步'} <span>→</span></button></div>
      <button className="text-button" onClick={() => setScreen('setup')}>← 回到設定</button>
    </section>}

    {screen === 'tasting' && <section className="content-page">
      <div className="eyebrow">04 / 喝一口，記下感受</div><h2>這杯喝起來如何？</h2><p className="subcopy">沒有標準答案，描述你的感受就好。</p>
      <div className="tasting-card">{questions.map(([key, label, options]) => <fieldset className="question" key={key}><legend>{label}</legend><div className="choice-row">{options.map((option) => <button key={option} className={answers[key] === option ? 'chosen' : ''} onClick={() => setAnswers((a) => ({ ...a, [key]: option }))}>{option}</button>)}</div></fieldset>)}</div>
      <button className="button primary full" disabled={!canSave} onClick={saveSession}>儲存這杯紀錄 <span>✓</span></button>
    </section>}

    {screen === 'history' && <section className="content-page">
      <div className="eyebrow">你的練習軌跡</div><div className="history-heading"><h2>沖煮紀錄</h2>{sessions.length > 0 && <button className="text-button danger" onClick={clearHistory}>清除全部</button>}</div>
      {sessions.length === 0 ? <div className="empty-state"><span>☕</span><h3>還沒有沖煮紀錄</h3><p>每一杯都是新的練習，開始你的第一杯吧。</p><button className="button primary" onClick={() => setScreen('method')}>開始沖煮 <span>→</span></button></div> : <div className="history-list">{sessions.map((session) => <article className="history-card" key={session.id}><div className="history-card-top"><strong>{getMethodLabel(session.method)} <span>·</span> {session.dose}g</strong><time>{new Date(session.date).toLocaleDateString('zh-HK')}</time></div><p>{session.bean || '未填豆種'}　/　{session.roast}</p><div className="answer-summary">{Object.entries(session.answers).map(([key, value]) => <span key={key}>{({ acidity: '酸', sweetness: '甜', bitterness: '苦', balance: '萃取', satisfaction: '整體' })[key]}：{value}</span>)}</div></article>)}</div>}
      {sessions.length > 0 && <button className="button secondary full history-new" onClick={() => setScreen('method')}>再沖一杯 <span>→</span></button>}
    </section>}
    <footer>慢慢沖，慢慢找到喜歡的味道 <span>✳</span></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
