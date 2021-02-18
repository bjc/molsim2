import Nucleotide from './nucleotide.mjs'
import Die from './die.mjs'
import { randomItem } from './utils.mjs'

class Genome {
    static *randomBase() {
	for (const i of [...Array(Genome.size)]) {
            yield randomItem(Nucleotide.bases)
        }
    }

    constructor(gen) {
        const nucleotideList = document.createElement('ol')
        this._boundNucleotideClickedHandler =
            this.nucleotideClickedHandler.bind(this)
        this.nucleotides = [...gen].map(base => {
            const n = new Nucleotide(base)
            n.onClick = this._boundNucleotideClickedHandler
            nucleotideList.appendChild(n.elt)
            return n
        })
        this.elt.appendChild(nucleotideList)
        this.lock()
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('li')
            this._elt.classList.add('genome')
        }
        return this._elt
    }

    get onSelectionChanged() {
        if (this._onSelectionChanged !== undefined) {
            return this._onSelectionChanged
        }
        return () => {}
    }

    set onSelectionChanged(fn) {
        this._onSelectionChanged = fn
    }

    lock() {
        this.elt.classList.add('locked')
        this.nucleotides.forEach(n => n.lock())
    }

    unlock() {
        this.elt.classList.remove('locked')
        this.nucleotides.forEach(n => n.unlock())
    }

    clone() {
        return new Genome(this.nucleotides.map(n => n.value))
    }

    get selectedNucleotide() {
	return this._selectedNucleotide
    }

    set selectedNucleotide(nucleotide) {
	if (this.selectedNucleotide !== undefined) {
	    this.selectedNucleotide.deselect()
	}
	this._selectedNucleotide = nucleotide
	this._selectedNucleotide.select()

	const i = this.nucleotides.indexOf(this._selectedNucleotide)
	this.onSelectionChanged(this._selectedNucleotide, i)
    }

    nucleotideClickedHandler(nucleotide) {
	this.selectedNucleotide = nucleotide
    }
}
Genome.size = 18

export default Genome
