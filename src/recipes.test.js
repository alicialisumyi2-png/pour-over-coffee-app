import test from 'node:test'
import assert from 'node:assert/strict'
import { getRecipe } from './recipes.js'

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
