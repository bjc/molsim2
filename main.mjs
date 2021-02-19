import Rules from './rules.mjs'

function init() {
    const genomeList = document.querySelector('#genome-history')
    const die = document.querySelector('#die')
    const aminoAcidSelector = document.querySelector('#amino-acid-selector')
    const nucleotideSelector = document.querySelector('#nucleotide-selector')
    const lethalitySelector = document.querySelector('#lethality-selector')
    const instructions = document.querySelector('#instructions')
    const cloneButton = document.querySelector('#clone')
    const remainingIterations = document.querySelector('#remaining-iterations')
    const printButton = document.querySelector('#print')
    const errors = document.querySelector('#errors')

    const rules = new Rules(die, instructions, genomeList, aminoAcidSelector, nucleotideSelector, lethalitySelector, cloneButton, remainingIterations, printButton, errors)
}

init()
