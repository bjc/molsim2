import { randomItem, ordinalSuffix } from './utils.mjs'
import Genome from './genome.mjs'
import Nucleotide from './nucleotide.mjs'
import Die from './die.mjs'
import GenomeList from './genome-list.mjs'
import NucleotideSelector from './nucleotide-selector.mjs'
import Error from './error.mjs'

class CloneNucleotide {
    constructor(rules) {
        this.rules = rules

        this.id = 'clone-nucleotide'
        this._boundClickHandler = this.clickHandler.bind(this)
    }

    enter() {
        this.rules.cloneButton.addEventListener('click',
                                                this._boundClickHandler)
        this.rules.cloneButton.disabled = false
    }

    exit() {
        this.rules.cloneButton.removeEventListener('click',
                                                   this._boundClickHandler)
        this.rules.cloneButton.disabled = true
    }

    clickHandler(evt) {
        const genome = this.rules.currentGenome.clone()
        this.rules.genomeList.push(genome)
        this.rules.next(new RollForNucleotide(this.rules))
    }
}

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
        if (this.rules.die.value > Genome.size) {
            this.rules.iterations--
            if (this.rules.isLastIteration) {
                this.rules.next(new DoNothing(this.rules))
            } else {
                this.rules.next(new CloneNucleotide(this.rules))
            }
        } else {
            this.rules.next(new NucleotideSelect(this.rules))
        }
    }
}

class NucleotideSelect {
    constructor(rules) {
        this.rules = rules

        this.id = 'nucleotide-select'
    }

    enter() {
        this.want = this.rules.die.value
        this.rules.instructions.querySelector('#select-number').innerHTML =
            `${this.want}<sup>${ordinalSuffix(this.want)}</sup>`

        this.rules.currentGenome.onSelectionChanged =
            this.handleSelectionChanged.bind(this)
        this.rules.currentGenome.unlock()
    }

    exit() {
        this.rules.currentGenome.lock()
        this.rules.currentGenome.onSelectionChanged = undefined;
    }

    handleSelectionChanged(nucleotide, i) {
        i++;
        if (i != this.rules.die.value) {
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

        this.selectedNucleotide.value = base
        this.rules.iterations--
        if (this.rules.isLastIteration) {
            this.rules.next(new DoNothing(this.rules))
        } else {
            this.rules.next(new CloneNucleotide(this.rules))
        }
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
    constructor(die, instructions, genomeList, nucleotideSelector, cloneButton, remainingIterations, printButton, errors) {
        this.die = new Die(die)
        this.instructions = instructions
        this.genomeList = new GenomeList(genomeList)
        this.nucleotideSelector = new NucleotideSelector(nucleotideSelector)
        this.cloneButton = cloneButton
        this.remainingIterations = remainingIterations
        this.printButton = printButton
        this.error = new Error(errors)

        this.iterations = Rules.maxIterations
        this.cloneButton.disabled = true
        this.genomeList.push(new Genome(Rules.initialGenomeBases))

        if (false) {
            this._debugStartAtRollForMutation()
        } else if (false) {
            this._debugStartAtPerformMutation(4)
        } else if (false) {
            this._debugStartWithError()
        } else {
            this.currentState = new CloneNucleotide(this)
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
            window.g = g
            this.genomeList.push(g)
        })

        this.currentState = new PerformMutation(this)
        this.die.value = 15
        const nucleotide = this.currentGenome.nucleotides[15]
        this.currentGenome.selectedNucleotide = nucleotide
    }

    _debugStartWithError() {
        this.currentState = new ShowError(this, new CloneNucleotide(this))
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
