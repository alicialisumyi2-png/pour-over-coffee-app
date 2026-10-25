import test from 'node:test'
import assert from 'node:assert/strict'
import { getRecipe, getRecommendations, pourStages } from './recipes.js'

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

test('Kalita scales water and includes a flat-bottom two-pour profile', () => {
  const recipe = getRecipe('kalita', '中焙', 18)
  assert.equal(recipe.water, 270)
  assert.match(recipe.steps[2].detail, /162g/)
  assert.match(recipe.steps[3].detail, /270g/)
})

test('recommendations return three roast-ranked methods with correct pour stage counts', () => {
  for (const roast of ['淺焙', '中焙', '深焙']) {
    const recommendations = getRecommendations(roast)
    assert.ok(recommendations.length >= 2 && recommendations.length <= 3)
    assert.equal(recommendations[0].id, roast === '淺焙' ? 'v60' : roast === '深焙' ? 'clever' : 'kalita')
  }
  assert.deepEqual(pourStages, { v60: 3, clever: 1, kalita: 3 })
})
