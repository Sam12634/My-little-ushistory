// Import your Supabase client (this connects your website to your database)
import { supabase } from './src/utils/supabaseClient.js'



/* ---------------------------------------------------------
   LOAD ALL ELEMENTS INTO BOTH DROPDOWNS
   ---------------------------------------------------------
   This function runs when the page loads.
   It fetches every element from the "elements" table
   and fills the two <select> dropdowns.
--------------------------------------------------------- */
async function loadElements() {
  const { data, error } = await supabase
    .from('elements')
    .select('*')
    .order('element_name')   // Sort alphabetically

  if (error) {
    console.error(error)
    return
  }

  const selectA = document.getElementById('elementA')
  const selectB = document.getElementById('elementB')

  // Add each element as an <option> in both dropdowns
  data.forEach(el => {
    const optionA = document.createElement('option')
    optionA.value = el.element_id       // UUID
    optionA.textContent = el.element_name

    // Clone the option so both dropdowns get the same choices
    const optionB = optionA.cloneNode(true)

    selectA.appendChild(optionA)
    selectB.appendChild(optionB)
  })
}



/* ---------------------------------------------------------
   COMBINE TWO ELEMENTS
   ---------------------------------------------------------
   This function runs when the user clicks "Combine".
   It checks the "combinations" table to see if the
   selected pair exists — in EITHER order.
--------------------------------------------------------- */
async function combine() {
  const a = document.getElementById('elementA').value
  const b = document.getElementById('elementB').value

  if (!a || !b) return   // Safety check

  /* -----------------------------------------------------
     Query Supabase for a matching combination.
     Because order doesn't matter, we check:
       (a + b) OR (b + a)
  ----------------------------------------------------- */
  const { data, error } = await supabase
    .from('combinations')
    .select('result_id, notes')
    .or(
      `and(element_a_id.eq.${a},element_b_id.eq.${b}),and(element_a_id.eq.${b},element_b_id.eq.${a})`
    )
    .limit(1)   // Only need one match

  const resultDiv = document.getElementById('result')

  if (error) {
    console.error(error)
    resultDiv.textContent = 'Error checking combination'
    return
  }

  // No match found
  if (!data || data.length === 0) {
    resultDiv.textContent = 'No valid combination'
    return
  }

  const resultId = data[0].result_id



  /* -----------------------------------------------------
     Fetch the resulting element's name from "elements"
     using the result_id we just got.
  ----------------------------------------------------- */
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

  // Display the final result to the player
  resultDiv.textContent = `Result: ${resultElement.element_name}`
}



// When the button is clicked, run combine()
document.getElementById('combineBtn').addEventListener('click', combine)

// Load dropdowns when the page loads
loadElements()
