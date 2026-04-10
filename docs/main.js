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

async function combine() {
  const a = document.getElementById('elementA').value
  const b = document.getElementById('elementB').value

  const { data, error } = await supabase
    .from('combinations')
    .select('result_id, result:elements(element_name)')
    .eq('element_a_id', a)
    .eq('element_b_id', b)
    .single()

  const resultDiv = document.getElementById('result')

  if (data) {
    resultDiv.textContent = `Result: ${data.result.element_name}`
  } else {
    resultDiv.textContent = 'No valid combination'
  }
}

document.getElementById('combineBtn').addEventListener('click', combine)

loadElements()
