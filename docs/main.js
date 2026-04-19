import { supabase } from './src/utils/supabaseClient.js'

// Load all elements into dropdowns
async function loadElements() {
  const { data, error } = await supabase
    .from('elements')
    .select('*')
    .order('element_name')

  if (error) {
    console.error(error)
    return
  }

  const selectA = document.getElementById('elementA')
  const selectB = document.getElementById('elementB')

  data.forEach(el => {
    const optionA = document.createElement('option')
    optionA.value = el.element_id
    optionA.textContent = el.element_name

    const optionB = optionA.cloneNode(true)

    selectA.appendChild(optionA)
    selectB.appendChild(optionB)
  })
}

// Combine two elements
async function combine() {
  const a = document.getElementById('elementA').value
  const b = document.getElementById('elementB').value

  if (!a || !b) return

  // Look for either order: (a + b) OR (b + a)
  const { data, error } = await supabase
    .from('combinations')
    .select('result_id, notes')
    .or(
      `and(element_a_id.eq.${a},element_b_id.eq.${b}),and(element_a_id.eq.${b},element_b_id.eq.${a})`
    )
    .limit(1)

  const resultDiv = document.getElementById('result')

  if (error) {
    console.error(error)
    resultDiv.textContent = 'Error checking combination'
    return
  }

  if (!data || data.length === 0) {
    resultDiv.textContent = 'No valid combination'
    return
  }

  const resultId = data[0].result_id

  // Fetch the resulting element's name
  const { data: resultElement, error: resultError } = await supabase
    .from('elements')
    .select('element_name')
    .eq('element_id', resultId)
    .single()

  if (resultError) {
    console.error(resultError)
    resultDiv.textContent = 'Error loading result element'
    return
  }

  resultDiv.textContent = `Result: ${resultElement.element_name}`
}

document.getElementById('combineBtn').addEventListener('click', combine)

loadElements()
