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

export function getBrewProfiles(method, roast = '中焙', dose = 15) {
  const base = roastSettings[roast] ?? roastSettings['中焙']
  const clever = method === 'clever'
  const adjustTemp = (amount) => base.temp.replace(/\d+/g, (value) => String(Number(value) + amount))
  const profiles = [
    { id: 'mild', label: '溫和／清爽', reason: clever ? '水量多一些，低溫短浸更輕柔。' : '水量多一些，低溫沖煮更清爽。', ratio: base.ratio + 1, temp: adjustTemp(-2), grind: base.grind, soak: 120 },
    { id: 'standard', label: '標準教學', reason: '均衡好上手，適合先建立手感。', ratio: base.ratio, temp: base.temp, grind: base.grind, soak: 135 },
    { id: 'strong', label: '濃郁／重萃', reason: clever ? '水溫提高、降低水量並延長浸泡。' : '水量少一些，水溫提高讓風味更集中。', ratio: base.ratio - 1, temp: adjustTemp(2), grind: base.grind, soak: 150 },
  ]
  return profiles.map((profile) => ({ ...profile, water: Math.round(dose * profile.ratio), pourStages: pourStages[method] ?? pourStages.v60 }))
}

export function getRecipe(method, roast = '中焙', dose = 15, profileId = 'standard') {
  const selected = getBrewProfiles(method, roast, dose).find((item) => item.id === profileId) ?? getBrewProfiles(method, roast, dose)[1]
  const { ratio: ratioValue, water, temp, grind } = selected
  const ratioLabel = `1:${Number.isInteger(ratioValue) ? ratioValue : ratioValue.toFixed(2).replace(/0$/, '')}`
  const common = { ratio: ratioLabel, water, temp, grind, pourStages: selected.pourStages, profileId: selected.id }
  const bloomWater = Math.round(dose * 2)
  const firstPourTarget = Math.round(water * 0.6)
  const pour = (title, detail, seconds, targetWater, previousTarget = 0) => ({ title, detail, seconds, kind: 'pour', targetWater, pourAmount: targetWater - previousTarget })
  const prep = (title, detail, seconds) => ({ title, detail, seconds, kind: 'prep', targetWater: null, pourAmount: null })
  const wait = (title, detail, seconds) => ({ title, detail, seconds, kind: 'wait', targetWater: null, pourAmount: null })
  const steps = method === 'clever'
    ? [
        prep('準備濾紙', '放入濾紙並用熱水潤濕，倒掉潤紙水。', 15),
        prep('加入咖啡粉', `倒入 ${dose}g 咖啡粉，輕拍讓粉床平整。`, 15),
        pour('注水浸泡', `注入 ${water}g 熱水，輕輕攪拌或搖勻。`, 15, water),
        wait('等待浸泡', `浸泡約 ${Math.round(selected.soak / 60)} 分 ${selected.soak % 60 ? `${selected.soak % 60} 秒` : ''}，再釋放咖啡。`, selected.soak),
        wait('釋放咖啡', '將聰明杯放到杯上，等待咖啡流完，約 1 分鐘。', 60),
      ]
    : method === 'kalita' ? [
        prep('準備濾杯', '放入 Wave 濾紙並以熱水潤濕濾杯，倒掉潤紙水。', 15),
        pour('悶蒸', `注入約 ${bloomWater}g 水，讓咖啡粉均勻濕潤。`, 45, bloomWater),
        pour('第一段注水', `以穩定小水流注水至約 ${firstPourTarget}g，沿平底粉床均勻繞圈。`, 35, firstPourTarget, bloomWater),
        pour('第二段注水', `繼續注水至總量 ${water}g，保持水位平穩。`, 40, water, firstPourTarget),
        wait('等待滴濾', '等待咖啡滴完；總時間約 2:30–3:00。', 75),
      ] : [
        prep('準備濾杯', '預折濾紙、潤杯，倒掉水，再放入咖啡粉。', 15),
        pour('悶蒸', `注入約 ${bloomWater}g 水，讓咖啡粉均勻濕潤。`, 45, bloomWater),
        pour('第一段注水', `緩慢注水至約 ${firstPourTarget}g，繞圈保持水位。`, 30, firstPourTarget, bloomWater),
        pour('第二段注水', `繼續注水至總量 ${water}g，穩定繞圈。`, 40, water, firstPourTarget),
        wait('等待滴濾', '等待咖啡滴完；總時間約 2:30–3:00。', 75),
      ]
  return { ...common, steps }
}
