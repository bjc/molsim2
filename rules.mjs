import { randomItem, ordinalSuffix } from './utils.mjs'
import AminoAcid from './amino-acid.mjs'
import AminoAcidSelector from './amino-acid-selector.mjs'
import Die from './die.mjs'
import Error from './error.mjs'
import Genome from './genome.mjs'
import GenomeList from './genome-list.mjs'
import Nucleotide from './nucleotide.mjs'
import NucleotideSelector from './nucleotide-selector.mjs'

class RollForNucleotide {
    constructor(rules) {
        this.rules = rules

        this.id = 'roll-for-nucleotide'
    }

    enter() {
        this.rules.die.value = '--'
        this.rules.die.onChanged = this.handleDieRoll.bind(this)
        this.rules.die.enable()
    }

    exit() {
        this.rules.die.disable()
        // TODO: debugging
        this.rules.die.value = 20
        this.rules.die.onChanged = undefined
    }

    handleDieRoll() {
        this.rules.next(new NucleotideSelect(this.rules))
    }
}

class NucleotideSelect {
    constructor(rules) {
        this.rules = rules

        this.id = 'nucleotide-select'
        this._boundCloneHandler = this.handleClone.bind(this)
        this.cloneButtons = document.querySelectorAll(`#${this.id} .clone`)
    }

    enter() {
        this.cloneButtons.forEach(button => {
            button.addEventListener('click', this._boundCloneHandler)
            button.disabled = false
        })

        this.want = this.rules.die.value
        this.rules.currentGenome.onNucleotideSelectionChanged =
            this.handleSelectionChanged.bind(this)

        this.rules.currentGenome.unlock()
    }

    exit() {
        this.rules.currentGenome.lock()

        this.cloneButtons.forEach(button => {
            button.removeEventListener('click', this._boundCloneHandler)
            button.disabled = true
        })

        this.rules.currentGenome.onNucleotideSelectionChanged = undefined;
    }

    handleClone(evt) {
        if (this.rules.die.value <= this.rules.currentGenome.length) {
            this.rules.next(new ShowError(this.rules, this,
                                          `Select the ${this.ordinalFor(this.rules.die.value)} nucleotide.`))
            return
        }

        this.rules.iterations--
        if (this.rules.iterations === 0) {
            this.rules.next(new PrintResults(this.rules, this.rules.currentGenome.clone()))
        } else {
            this.rules.genomeList.push(this.rules.currentGenome.clone())
            this.rules.next(new RollForNucleotide(this.rules))
        }
    }

    handleSelectionChanged(nucleotide, i) {
        i++;
        if (this.rules.die.value > this.rules.currentGenome.length) {
            this.rules.currentGenome.selectedNucleotide = undefined
            this.rules.next(new ShowError(this.rules, this,
                                          `You need to <em>clone</em> this nucleotide.`))
            return
        } else if (i != this.rules.die.value) {
            this.rules.currentGenome.selectedNucleotide = undefined
            this.rules.next(new ShowError(this.rules, this,
                                          `You selected the ${this.ordinalFor(i)} nucleotide. Please select the ${this.ordinalFor(this.want)} one.`))
            return
        }
        this.rules.next(new RollForMutation(this.rules))
    }

    ordinalFor(i) {
        return `${i}<sup>${ordinalSuffix(i)}</sup>`
    }
}

class RollForMutation {
    constructor(rules) {
        this.rules = rules

        this.id = 'roll-for-mutation'
    }

    enter() {
        this.rules.die.value = '--'
        this.rules.die.onChanged = this.handleDieRoll.bind(this)
        this.rules.die.enable()
    }

    exit() {
        this.rules.die.disable()
        this.rules.die.onChanged = undefined
    }

    handleDieRoll() {
        this.rules.next(new PerformMutation(this.rules))
    }
}

class PerformMutation {
    constructor(rules) {
        this.rules = rules

        this.id = 'perform-mutation'
        this.originalGenome = this.rules.currentGenome.clone()
    }

    enter() {
        const selector = this.rules.nucleotideSelector
        selector.onItemSelected = this.handleItemSelected.bind(this)
        selector.attach(this.selectedNucleotide)
    }

    exit() {
        this.rules.nucleotideSelector.detach()
    }

    validMutation(from, to) {
        return to == this.expectedMutation[from]
    }

    get expectedMutation() {
        if (this.rules.die.value <= 14) {
            return Nucleotide.transition
        } else if (this.rules.die.value <= 17) {
            return Nucleotide.complementingTransversion
        } else {
            return Nucleotide.defaultTransversion
        }
    }

    get selectedNucleotide() {
        return this.rules.currentGenome.selectedNucleotide
    }

    get errorTransitionHTML() {
        return `Select the base that corresponds to a <em>transition</em> of ${this.selectedNucleotide.value}.`
    }
    get errorComplementingTransversionHTML() {
        return `Select the base that corresponds to a <em>complementing transversion</em> of ${this.selectedNucleotide.value}.`
    }
    get errorDefaultTransversionHTML() {
        return `Select the base that corresponds to the <em>other transversion</em> of ${this.selectedNucleotide.value}.`
    }

    get errorHTML() {
        if (this.expectedMutation == Nucleotide.transition) {
            return this.errorTransitionHTML
        } else if (this.expectedMutation == Nucleotide.complementingTransversion) {
            return this.errorComplementingTransversionHTML
        } else {
            return this.errorDefaultTransversionHTML
        }
    }

    handleItemSelected(base) {
        if (!this.validMutation(this.selectedNucleotide.value, base)) {
            this.rules.next(new ShowError(this.rules, this, this.errorHTML))
            return
        }

        this.selectedNucleotide.value = base
        this.rules.next(new SelectAminoAcid(this.rules, this.originalGenome))
    }
}

class SelectAminoAcid {
    constructor(rules, originalGenome) {
        this.rules = rules
        this.originalGenome = originalGenome

        this.id ='amino-acid-select'
    }

    enter() {
        const selector = this.rules.aminoAcidSelector
        this.codon = this.rules.currentGenome.selectedCodon
        this.expected = AminoAcid.codonMap[this.codon.value]
        console.debug('expected: ', this.expected)
        let x = selector.elt.querySelector('#amino-acid-selector .codon').innerHTML =
            this.codon.value

        selector.onItemSelected = this.handleItemSelected.bind(this)
        selector.attach(this.selectedNucleotide)

        this.rules.aminoAcidSelector.attach()
    }

    exit() {
        this.rules.aminoAcidSelector.detach()
    }

    validSelection(aminoAcid) {
        return aminoAcid == this.expected
    }

    handleItemSelected(aminoAcid) {
        if (!this.validSelection(aminoAcid)) {
            this.rules.next(new ShowError(this.rules, this,
                                          `The codon <strong>${this.codon.value}</strong> does not code for <strong>${aminoAcid}</strong>`))
            return
        }

        const newAminoAcid = new AminoAcid(...this.codon.value.split(''))
        const isLethal = this.codon.aminoAcid.value !== newAminoAcid.value
        this.codon.aminoAcid = newAminoAcid
        this.rules.next(new MarkAsLethal(this.rules, this.originalGenome, isLethal))
    }
}

class MarkAsLethal {
    constructor(rules, originalGenome, isLethal) {
        this.rules = rules
        this.originalGenome = originalGenome
        this.isLethal = isLethal

        this.id = 'mark-as-lethal'
        this._boundCloneHandler = this.handleClone.bind(this)
        this._boundKillHandler = this.handleKill.bind(this)
        this.cloneButtons = document.querySelectorAll(`#${this.id} .clone`)
        this.killButtons = document.querySelectorAll(`#${this.id} .kill`)
    }

    enter() {
        this.cloneButtons.forEach(button => {
            button.addEventListener('click', this._boundCloneHandler)
            button.disabled = false
        })
        this.killButtons.forEach(button => {
            button.addEventListener('click', this._boundKillHandler)
            button.disabled = false
        })
    }

    exit() {
        this.cloneButtons.forEach(button => {
            button.removeEventListener('click', this._boundCloneHandler)
            button.disabled = true
        })
        this.killButtons.forEach(button => {
            button.removeEventListener('click', this._boundKillHandler)
            button.disabled = true
        })
    }

    get lethalHTML() {
        return 'A change in amino acid is a <em>lethal</em> change.'
    }
    
    get nonLethalHTML() {
        return 'If the amino acid doesn\'t change it is <em>non-lethal<em>.'
    }

    handleClone(evt) {
        if (this.isLethal) {
            this.rules.next(new ShowError(this.rules, this, this.lethalHTML))
            return
        }
        this.nextGoodState(this.rules.currentGenome)
    }

    handleKill(evt) {
        if (!this.isLethal) {
            this.rules.next(new ShowError(this.rules, this, this.nonLethalHTML))
            return
        }
        this.nextGoodState(this.originalGenome)
    }

    nextGoodState(genome) {
        this.rules.iterations--
        if (this.rules.iterations === 0) {
            this.rules.next(new PrintResults(this.rules, genome.clone()))
        } else {
            this.rules.genomeList.push(genome.clone())
            this.rules.next(new RollForNucleotide(this.rules))
        }
    }
}

class PrintResults {
    constructor(rules, finalGenome) {
        this.rules = rules
        this.finalGenome = finalGenome

        this.id = 'print-results'
        this._boundClickHandler = this.clickHandler.bind(this)
    }

    enter() {
        this.rules.genomeList.finalGenome = this.finalGenome
        this.rules.printButton.addEventListener('click', this._boundClickHandler)
        this.rules.printButton.disabled = false
    }

    exit() {
        this.rules.printButton.disabled = true
        this.rules.printButton.removeEventListener('click', this._boundClickHandler)
    }

    clickHandler() {
        window.print()
    }
}

class ShowError {
    constructor(rules, nextState, message) {
        this.rules = rules
        this.nextState = nextState
        this.rules.error.innerHTML = message

        this._boundClickHandler = this.clickHandler.bind(this)
    }

    enter() {
        this.rules.error.onClick = this._boundClickHandler
        this.rules.error.show()
    }

    exit() {
        this.rules.error.hide()
        this.rules.error.onClick = undefined
    }

    clickHandler() {
        this.rules.next(this.nextState)
    }
}

class Rules {
    constructor(die, instructions, genomeList, aminoAcidSelector, nucleotideSelector, remainingIterations, printButton, errors) {
        this.die = new Die(die)
        this.instructions = instructions
        this.genomeList = new GenomeList(genomeList)
        this.aminoAcidSelector = new AminoAcidSelector(aminoAcidSelector)
        this.nucleotideSelector = new NucleotideSelector(nucleotideSelector)
        this.remainingIterations = remainingIterations
        this.printButton = printButton
        this.error = new Error(errors)

        this.iterations = Rules.maxIterations

        const initialGenome = new Genome(Rules.initialGenomeBases)
        this.genomeList.initialGenome = initialGenome
        this.genomeList.push(initialGenome.clone())

        // TODO: debugging
        if (false) {
            this._debugStartAtRollForMutation()
        } else if (true) {
            this._debugStartAtPerformMutation(9)
        } else if (false) {
            this._debugStartAtSelectAminoAcid()
        } else if (false) {
            this._debugStartAtSelectLethality()
        } else if (false) {
            this._debugStartWithError()
        } else {
            this.currentState = new RollForNucleotide(this)
        }
        this.enterState()
    }

    get iterations() {
        return Number(this.remainingIterations.innerText)
    }

    set iterations(val) {
        this.remainingIterations.innerText = val
    }

    get isLastIteration() {
        return this.iterations == 0
    }

    _debugStartAtRollForMutation() {
        this.currentState = new RollForMutation(this)
        const nucleotide = this.currentGenome.nucleotides[2]
        this.currentGenome.selectedNucleotide = nucleotide
    }

    _debugStartAtPerformMutation(n) {
        [...Array(n)].forEach(i => {
            const n = randomItem(this.currentGenome.nucleotides)
            n.value = randomItem(Nucleotide.bases)
            this.currentGenome.selectedNucleotide = n
            const g = this.currentGenome.clone()
            this.genomeList.push(g)
        })
        this.iterations -= n

        this.currentState = new PerformMutation(this)
        this.die.value = 14
        const nucleotide = this.currentGenome.nucleotides[17]
        this.currentGenome.selectedNucleotide = nucleotide
    }

    _debugStartAtSelectAminoAcid() {
        this.currentState = new SelectAminoAcid(this)
        this.die.value = 15
        const nucleotide = this.currentGenome.nucleotides[15]
        nucleotide.value = 'A'
        this.currentGenome.selectedNucleotide = nucleotide
    }

    _debugStartAtSelectLethality() {
        this.currentState = new MarkAsLethal(this, this.currentGenome.clone(), true)
        this.die.value = 15
        const nucleotide = this.currentGenome.nucleotides[15]
        nucleotide.value = 'A'
        this.currentGenome.selectedNucleotide = nucleotide
        this.currentGenome.codons[5].aminoAcid = new AminoAcid('A', 'C', 'T')
    }

    _debugStartWithError() {
        this.currentState = new ShowError(this, new RollForNucleotide(this),
                                          'test an error')
    }

    get currentGenome() {
        return this.genomeList.last
    }

    showCurrent() {
        if (this.currentState.id === undefined) {
            return
        }
        const elt =
              this.instructions.querySelector(`#${this.currentState.id}`)
        elt.classList.add('current')
        elt.scrollIntoView(true)
    }

    hideCurrent() {
        if (this.currentState.id === undefined) {
            return
        }
        const elt =
              this.instructions.querySelector(`#${this.currentState.id}`)
        elt.classList.remove('current')
    }

    enterState() {
        this.currentState.enter()
        this.showCurrent()
    }

    exitState() {
        this.hideCurrent()
        this.currentState.exit()
    }

    next(nextState) {
        this.exitState()
        this.currentState = nextState
        this.enterState()
    }
}
Rules.maxIterations = 10
Rules.initialGenomeBases = [
    'G', 'C', 'A',
    'C', 'T', 'C',
    'G', 'G', 'A',
    'T', 'C', 'G',
    'A', 'A', 'T',
    'T', 'C', 'T'
]

export default Rules
