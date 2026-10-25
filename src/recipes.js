const roastSettings = {
  淺焙: { ratio: 15.75, temp: '92–94°C', grind: '中細研磨；可稍細' },
  中焙: { ratio: 15, temp: '90–92°C', grind: '中細研磨' },
  深焙: { ratio: 14.25, temp: '86–90°C', grind: '中細研磨；可稍粗' },
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
    : [
        { title: '準備濾杯', detail: '預折濾紙、潤杯，倒掉水，再放入咖啡粉。', seconds: 15 },
        { title: '悶蒸', detail: `注入約 ${Math.round(dose * 2)}g 水，讓咖啡粉均勻濕潤。`, seconds: 45 },
        { title: '第一段注水', detail: `緩慢注水至約 ${Math.round(water * 0.6)}g，繞圈保持水位。`, seconds: 30 },
        { title: '第二段注水', detail: `繼續注水至總量 ${water}g，穩定繞圈。`, seconds: 40 },
        { title: '等待滴濾', detail: '等待咖啡滴完；總時間約 2:30–3:00。', seconds: 75 },
      ]
  return { ...common, steps }
}
