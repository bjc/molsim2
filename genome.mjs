import Codon from './codon.mjs'
import Die from './die.mjs'
import { randomItem } from './utils.mjs'

class Genome {
    constructor(nucleotides) {
        const codonList = document.createElement('ol')
        this._boundNucleotideClickedHandler =
            this.nucleotideClickedHandler.bind(this)

        this.codons = []
        let tmpCodon = []
        nucleotides.forEach(base => {
            tmpCodon.push(base)
            if (tmpCodon.length == 3) {
                const c = new Codon(...tmpCodon)
                codonList.appendChild(c.elt)
                this.codons.push(c)
                tmpCodon = []
            }
        })
        this.elt.appendChild(codonList)
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
        this.codons.forEach(n => n.lock())
    }

    unlock() {
        this.elt.classList.remove('locked')
        this.codons.forEach(n => n.unlock())
    }

    clone() {
        return new Genome(this.codons.flatMap(c => c.bases.map(b => b.value)))
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

export default Genome
