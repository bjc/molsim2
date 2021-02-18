import NucleotideSelector from './nucleotide-selector.mjs'

class Nucleotide {
    constructor(base) {
        this.value = base
        this._boundClickHandler = this.clickHandler.bind(this)
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('li')
            this._elt.classList.add('nucleotide')
        }
        return this._elt
    }

    get valueElt() {
        if (this._valueElt === undefined) {
            this._valueElt = document.createElement('span')
            this.elt.appendChild(this._valueElt)
        }
        return this._valueElt
    }

    get value() {
        return this.valueElt.innerText
    }

    set value(val) {
        this.valueElt.innerText = val
    }

    get onClick() {
        if (this._onClick !== undefined) {
            return this._onClick
        }
        return () => {}
    }

    set onClick(fn) {
        this._onClick = fn
    }

    lock() {
        this.elt.removeEventListener('click', this._boundClickHandler)
    }

    unlock() {
        this.elt.addEventListener('click', this._boundClickHandler)
    }

    select() {
	this._elt.classList.add('selected')
    }

    deselect() {
	this._elt.classList.remove('selected')
    }

    clickHandler(evt) {
	this.onClick(this)
    }
}
Nucleotide.transition = {'A': 'G',
			  'C': 'T',
			  'G': 'A',
			  'T': 'C'}
Nucleotide.complementingTransversion = {'A': 'T',
					'C': 'G',
					'G': 'C',
					'T': 'A'}
Nucleotide.defaultTransversion = {'A': 'C',
                                  'C': 'A',
                                  'G': 'T',
                                  'T': 'G'}
Nucleotide.bases = Object.keys(Nucleotide.transition)


export default Nucleotide
