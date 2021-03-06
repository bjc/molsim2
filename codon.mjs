import AminoAcid from './amino-acid.mjs'
import Nucleotide from './nucleotide.mjs'

class Codon {
    constructor(n1, n2, n3) {
        this.bases = [n1, n2, n3]

        const nucleotideList = document.createElement('ol')
        this.bases = [n1, n2, n3].map(base => {
            const n = new Nucleotide(base)
            n.onClick = this._boundNucleotideClickedHandler
            nucleotideList.appendChild(n.elt)
            return n
        })
        this.elt.appendChild(nucleotideList)

        this.aminoAcid = new AminoAcid(n1, n2, n3)
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('li')
            this._elt.classList.add('codon')
        }
        return this._elt
    }

    get value() {
        return this.bases.map(b => b.value).join('')
    }

    get aminoAcid() {
        return this._aminoAcid
    }

    set aminoAcid(value) {
        this._aminoAcid = value
        const oldElt = this.elt.querySelector('.amino-acid')
        if (oldElt) {
            this.elt.removeChild(oldElt)
        }
        this.elt.appendChild(value.elt)
    }

    lock() {
        this.bases.forEach(n => n.lock())
        this.aminoAcid.lock()
    }

    unlock() {
        this.bases.forEach(n => n.unlock())
        this.aminoAcid.unlock()
    }
}

export default Codon
