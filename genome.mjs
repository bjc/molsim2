import Codon from './codon.mjs'
import Die from './die.mjs'
import { randomItem } from './utils.mjs'

class Genome {
    constructor(nucleotides) {
        this.codons = []
        let tmpCodon = []
        nucleotides.forEach(base => {
            tmpCodon.push(base)
            if (tmpCodon.length == 3) {
                const c = new Codon(...tmpCodon)
                this.elt.appendChild(c.elt)
                this.codons.push(c)
                tmpCodon = []
            }
        })

        this.lock()
        this._boundNucleotideClickedHandler =
            this.nucleotideClickedHandler.bind(this)
        this.codons.forEach(c => {
            c.bases.forEach(b => {
                b.onClick = this._boundNucleotideClickedHandler
            })
        })
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('ol')
            this._elt.classList.add('genome')
        }
        return this._elt
    }

    get nucleotides() {
        return this.codons.reduce((acc, c) => {
            return acc.concat(c.bases)
        }, [])
    }

    get length() {
        return this.codons.reduce((acc, c) => {
            return acc + c.bases.length
        }, 0)
    }

    get onNucleotideSelectionChanged() {
        if (this._onNucleotideSelectionChanged !== undefined) {
            return this._onNucleotideSelectionChanged
        }
        return () => {}
    }

    set onNucleotideSelectionChanged(fn) {
        this._onNucleotideSelectionChanged = fn
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

        if (nucleotide === undefined) {
            return
        }

	this._selectedNucleotide.select()
        let i = 0
        for (const c of this.codons) {
            for (const b of c.bases) {
                if (b === this._selectedNucleotide) {
                    this.selectedCodon = c
	            this.onNucleotideSelectionChanged(this._selectedNucleotide, i)
                    return
                }
                i++
            }
        }
    }

    nucleotideClickedHandler(nucleotide) {
	this.selectedNucleotide = nucleotide
    }
}

export default Genome
