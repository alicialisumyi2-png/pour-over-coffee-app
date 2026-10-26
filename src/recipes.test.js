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
    assert.deepEqual(profiles.map(({ id }) => id), ['mild', 'standard', 'strong'])
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
