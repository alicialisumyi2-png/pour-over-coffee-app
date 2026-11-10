import test from 'node:test'
import assert from 'node:assert/strict'
import { getBrewProfiles, getRecipe, getRecommendations, pourStages } from './recipes.js'

test('V60 scales water and bloom to dose', () => {
  const recipe = getRecipe('v60', '中焙', 20)
  assert.equal(recipe.water, 300)
  assert.match(recipe.ratio, /1:15/)
  assert.match(recipe.steps[1].detail, /40g/)
})

test('roast profile changes ratio and temperature', () => {
  assert.equal(getRecipe('v60', '淺焙', 15).water, 236)
  assert.equal(getRecipe('v60', '淺焙', 15).temp, '92–94°C')
  assert.equal(getRecipe('v60', '深焙', 15).water, 214)
})

test('Clever uses scaled immersion water and drain step', () => {
  const recipe = getRecipe('clever', '中焙', 18)
  assert.equal(recipe.water, 270)
  assert.match(recipe.steps[2].detail, /270g/)
  assert.match(recipe.steps[4].title, /釋放/)
})

test('brew profiles scale with dose and standard is the default recipe', () => {
  for (const method of ['v60', 'kalita', 'clever']) {
    const profiles = getBrewProfiles(method, '中焙', 20)
    const ids = profiles.map(({ id }) => id)
    if (method === 'clever') {
      assert.deepEqual(ids, ['mild', 'standard', 'strong', 'switch-immersion'])
    } else {
      assert.deepEqual(ids, ['mild', 'standard', 'strong'])
    }
    assert.equal(profiles[1].water, 300)
    assert.equal(getRecipe(method, '中焙', 20).water, 300)
    assert.ok(profiles[0].water > profiles[1].water)
    assert.ok(profiles[2].water < profiles[1].water)
  }
})

test('selected profiles drive pour amounts and Clever soak time', () => {
  const strongV60 = getRecipe('v60', '中焙', 15, 'strong')
  assert.equal(strongV60.water, 210)
  assert.match(strongV60.steps[2].detail, /126g/)
  const mildClever = getRecipe('clever', '中焙', 15, 'mild')
  const strongClever = getRecipe('clever', '中焙', 15, 'strong')
  assert.equal(mildClever.steps[3].seconds, 120)
  assert.equal(strongClever.steps[3].seconds, 150)
  assert.equal(mildClever.pourStages, 1)
})

test('Kalita scales water and includes a flat-bottom two-pour profile', () => {
  const recipe = getRecipe('kalita', '中焙', 18)
  assert.equal(recipe.water, 270)
  assert.match(recipe.steps[2].detail, /162g/)
  assert.match(recipe.steps[3].detail, /270g/)
})

test('recipe steps expose typed prep, pour, and wait data with incremental targets', () => {
  for (const method of ['v60', 'kalita', 'clever']) {
    const recipe = getRecipe(method, '中焙', 20)
    for (const step of recipe.steps) {
      assert.ok(['prep', 'pour', 'wait'].includes(step.kind))
      if (step.kind === 'pour') {
        assert.ok(Number.isFinite(step.targetWater))
        assert.ok(Number.isFinite(step.pourAmount))
      } else {
        assert.equal(step.targetWater, null)
        assert.equal(step.pourAmount, null)
      }
    }
    const pours = recipe.steps.filter(({ kind }) => kind === 'pour')
    assert.equal(pours.at(-1).targetWater, recipe.water)
    assert.equal(pours.reduce((total, step) => total + step.pourAmount, 0), recipe.water)
  }
})

test('recommendations return three roast-ranked methods with correct pour stage counts', () => {
  for (const roast of ['淺焙', '中焙', '深焙']) {
    const recommendations = getRecommendations(roast)
    assert.ok(recommendations.length >= 2 && recommendations.length <= 3)
    assert.equal(recommendations[0].id, roast === '淺焙' ? 'v60' : roast === '深焙' ? 'clever' : 'kalita')
  }
  assert.deepEqual(pourStages, { v60: 3, clever: 1, kalita: 3 })
})

test('Hario Switch immersion is a clever-only two-pour recipe scaled from 14g / 190g', () => {
  const profiles = getBrewProfiles('clever', '深焙', 14)
  const switchProfile = profiles.find(({ id }) => id === 'switch-immersion')
  assert.equal(switchProfile.ratio, 13.6)
  assert.equal(switchProfile.water, 190)
  assert.equal(switchProfile.temp, '90–92°C')
  assert.equal(switchProfile.pourStages, 2)
  assert.match(switchProfile.reason, /fugwai_coffee/)
  assert.equal(getBrewProfiles('v60', '中焙', 14).length, 3)
  assert.equal(getBrewProfiles('kalita', '中焙', 14).length, 3)

  const recipe = getRecipe('clever', '淺焙', 14, 'switch-immersion')
  assert.equal(recipe.water, 190)
  assert.equal(recipe.ratio, '1:13.6')
  assert.equal(recipe.temp, '90–92°C')
  assert.equal(recipe.pourStages, 2)
  assert.match(recipe.grind, /Comandante C40 約 26 格/)
  assert.match(recipe.steps[0].title, /關閉閥門/)
  assert.match(recipe.steps[2].detail, /50g/)
  assert.equal(recipe.steps[2].targetWater, 50)
  assert.equal(recipe.steps[2].pourAmount, 50)
  assert.equal(recipe.steps[3].seconds, 40)
  assert.match(recipe.steps[3].detail, /40 秒/)
  assert.equal(recipe.steps[4].targetWater, 190)
  assert.equal(recipe.steps[4].pourAmount, 140)
  assert.match(recipe.steps[4].detail, /閥門保持關閉/)
  // 悶蒸 40s + 第二段注水 15s + 浸泡 95s = 150s（約 2:30）後開閥，從悶蒸開始計算。
  assert.equal(recipe.steps[4].seconds, 15)
  assert.equal(recipe.steps[5].seconds, 95)
  assert.equal(recipe.steps[3].seconds + recipe.steps[4].seconds + recipe.steps[5].seconds, 150)
  assert.match(recipe.steps[5].detail, /2 分 30 秒/)
  assert.match(recipe.steps[6].title, /開啟閥門/)
  assert.equal(recipe.steps[6].seconds, 60)
  const pours = recipe.steps.filter(({ kind }) => kind === 'pour')
  assert.equal(pours.length, 2)
  assert.equal(pours.reduce((total, step) => total + step.pourAmount, 0), recipe.water)
})
