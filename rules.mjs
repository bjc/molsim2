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
    }

    enter() {
        this.cloneButtons = document.querySelectorAll(`#${this.id} .clone`)
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
        window.r = this.rules
        console.debug('clone', this.rules.die.value, this.rules.currentGenome.length)
        if (this.rules.die.value < this.rules.currentGenome.length) {
            this.rules.error.innerHTML =
                `TODO: this should have been a selection operation`
            this.rules.next(new ShowError(this.rules, this))
            return
        }

        this.rules.genomeList.push(this.rules.currentGenome.clone())
        this.rules.next(new RollForNucleotide(this.rules))
    }

    handleSelectionChanged(nucleotide, i) {
        i++;
        if (this.rules.die.value > this.rules.currentGenome.length) {
            this.rules.error.innerHTML =
                `TODO: this should have been a clone operation`
            this.rules.next(new ShowError(this.rules, this))
            return
        } else if (i != this.rules.die.value) {
            this.rules.error.innerHTML =
                `You selected the ${i}<sup>${ordinalSuffix(i)}</sup> nucleotide. Please select the ${this.want}<sup>${ordinalSuffix(this.want)}</sup> one.`
            this.rules.next(new ShowError(this.rules, this))
            return
        }
        this.rules.next(new RollForMutation(this.rules))
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
            this.rules.error.innerHTML = this.errorHTML
            this.rules.next(new ShowError(this.rules, this))
            return
        }

        this.rules.next(new SelectAminoAcid(this.rules))
    }
}

class SelectAminoAcid {
    constructor(rules) {
        this.rules = rules

        this.id ='amino-acid-select'
    }

    enter() {
        window.t = this
        const selector = this.rules.aminoAcidSelector
        this.codon = this.rules.currentGenome.selectedCodon
        this.expected = AminoAcid.codonMap[this.codon.value]
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
        console.debug('aminoAcid:', aminoAcid, 'expected: ', this.expected)
        return aminoAcid == this.expected
    }

    handleItemSelected(aminoAcid) {
        if (!this.validSelection(aminoAcid)) {
            this.rules.error.innerHTML =
                `The codon ${this.codon.value} does not code for ${aminoAcid}`
            this.rules.next(new ShowError(this.rules, this))
            return
        }

        const newAminoAcid = new AminoAcid(...this.codon.value.split(''))
        const isLethal = this.codon.aminoAcid.value !== newAminoAcid.value
        this.codon.aminoAcid = newAminoAcid
        this.rules.next(new MarkAsLethal(this.rules, isLethal))
    }
}

class MarkAsLethal {
    constructor(rules, isLethal) {
        this.rules = rules
        this.isLethal = isLethal

        this.id = 'mark-as-lethal'
    }

    enter() {
    }

    exit() {
    }

    get lethalHTML() {
        return 'A change in amino acid is a <em>lethal</em> change.'
    }
    
    get nonLethalHTML() {
        return 'A change in amino acid is a <em>lethal</em> change.'
    }
}

class DoNothing {
    constructor(rules) {
        this.rules = rules

        this.id = 'print-results'
        this._boundClickHandler = this.clickHandler.bind(this)
    }

    enter() {
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
    constructor(rules, nextState) {
        this.rules = rules
        this.nextState = nextState

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
        this.genomeList.push(new Genome(Rules.initialGenomeBases))
        this.genomeList.push(this.currentGenome.clone())

        if (false) {
            this._debugStartAtRollForMutation()
        } else if (false) {
            this._debugStartAtPerformMutation(3)
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

        this.currentState = new PerformMutation(this)
        this.die.value = 15
        const nucleotide = this.currentGenome.nucleotides[15]
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
        this.currentState = new MarkAsLethal(this, true)
        this.die.value = 15
        const nucleotide = this.currentGenome.nucleotides[15]
        nucleotide.value = 'A'
        this.currentGenome.selectedNucleotide = nucleotide
        this.currentGenome.codons[5].aminoAcid = new AminoAcid('A', 'C', 'T')
    }

    _debugStartWithError() {
        this.currentState = new ShowError(this, new RollForNucleotide(this))
        this.error.innerHTML = 'test an error'
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
