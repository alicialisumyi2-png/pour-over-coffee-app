const roastSettings = {
  淺焙: { ratio: 15.75, temp: '92–94°C', grind: '中細研磨；可稍細' },
  中焙: { ratio: 15, temp: '90–92°C', grind: '中細研磨' },
  深焙: { ratio: 14.25, temp: '86–90°C', grind: '中細研磨；可稍粗' },
}

export const methodCatalog = {
  v60: { id: 'v60', label: 'V60', blurb: '手沖濾杯・清爽明亮', icon: '/illustrations/method-v60.png' },
  clever: { id: 'clever', label: '聰明杯', blurb: '浸泡式・穩定好上手', icon: '/illustrations/method-clever.png' },
  kalita: { id: 'kalita', label: 'Kalita Wave', blurb: '平底濾杯・萃取穩定', icon: null },
}

const stageTitles = {
  v60: ['悶蒸', '第一段注水', '第二段注水'],
  clever: ['注水浸泡'],
  kalita: ['悶蒸', '第一段注水', '第二段注水'],
}

export const pourStages = Object.fromEntries(Object.entries(stageTitles).map(([id, titles]) => [id, titles.length]))
export const methodLabel = (id) => methodCatalog[id]?.label ?? methodCatalog.v60.label

export function getRecommendations(roast = '中焙') {
  const rankings = {
    淺焙: [['v60', '淺焙偏 V60 明亮'], ['kalita', '平底穩定呈現花果香'], ['clever', '浸泡更容易掌握']],
    中焙: [['kalita', '平底萃取均勻穩定'], ['v60', '保留清爽層次'], ['clever', '穩定好上手']],
    深焙: [['clever', '浸泡穩定新手友善'], ['kalita', '平底沖煮更穩定'], ['v60', '分段注水調整風味']],
  }
  return (rankings[roast] ?? rankings['中焙']).map(([id, reason], index) => ({ ...methodCatalog[id], reason, rank: index + 1, pourStages: pourStages[id] }))
}

export function getRecipe(method, roast = '中焙', dose = 15) {
  const profile = roastSettings[roast] ?? roastSettings['中焙']
  const water = Math.round(dose * profile.ratio)
  const ratioLabel = `1:${Number.isInteger(profile.ratio) ? profile.ratio : profile.ratio.toFixed(2).replace(/0$/, '')}`
  const common = { ratio: ratioLabel, water, temp: profile.temp, grind: profile.grind }
  const steps = method === 'clever'
    ? [
        { title: '準備濾紙', detail: '放入濾紙並用熱水潤濕，倒掉潤紙水。', seconds: 15 },
        { title: '加入咖啡粉', detail: `倒入 ${dose}g 咖啡粉，輕拍讓粉床平整。`, seconds: 15 },
        { title: '注水浸泡', detail: `注入 ${water}g 熱水，輕輕攪拌或搖勻。`, seconds: 15 },
        { title: '等待浸泡', detail: '讓咖啡浸泡，依喜好可在 2:00–2:30 之間調整。', seconds: 135 },
        { title: '釋放咖啡', detail: '將聰明杯放到杯上，等待咖啡流完，約 1 分鐘。', seconds: 60 },
      ]
    : method === 'kalita' ? [
        { title: '準備濾杯', detail: '放入 Wave 濾紙並以熱水潤濕濾杯，倒掉潤紙水。', seconds: 15 },
        { title: '悶蒸', detail: `注入約 ${Math.round(dose * 2)}g 水，讓咖啡粉均勻濕潤。`, seconds: 45 },
        { title: '第一段注水', detail: `以穩定小水流注水至約 ${Math.round(water * 0.6)}g，沿平底粉床均勻繞圈。`, seconds: 35 },
        { title: '第二段注水', detail: `繼續注水至總量 ${water}g，保持水位平穩。`, seconds: 40 },
        { title: '等待滴濾', detail: '等待咖啡滴完；總時間約 2:30–3:00。', seconds: 75 },
      ] : [
        { title: '準備濾杯', detail: '預折濾紙、潤杯，倒掉水，再放入咖啡粉。', seconds: 15 },
        { title: '悶蒸', detail: `注入約 ${Math.round(dose * 2)}g 水，讓咖啡粉均勻濕潤。`, seconds: 45 },
        { title: '第一段注水', detail: `緩慢注水至約 ${Math.round(water * 0.6)}g，繞圈保持水位。`, seconds: 30 },
        { title: '第二段注水', detail: `繼續注水至總量 ${water}g，穩定繞圈。`, seconds: 40 },
        { title: '等待滴濾', detail: '等待咖啡滴完；總時間約 2:30–3:00。', seconds: 75 },
      ]
  return { ...common, steps }
}
