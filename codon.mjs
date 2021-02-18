import AminoAcid from './amino-acid.mjs'
import Nucleotide from './nucleotide.mjs'

class Codon {
    constructor(n1, n2, n3) {
        this.bases = [n1, n2, n3]
        this.aminoAcid = new AminoAcid(n1, n2, n3)

        const nucleotideList = document.createElement('ol')
        this.bases = [n1, n2, n3].map(base => {
            const n = new Nucleotide(base)
            n.onClick = this._boundNucleotideClickedHandler
            nucleotideList.appendChild(n.elt)
            return n
        })
        this.elt.appendChild(nucleotideList)
        this.elt.appendChild(this.aminoAcid.elt)
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('li')
            this._elt.classList.add('codon')
        }
        return this._elt
    }

    get aaElt() {
        if (this._aaElt === undefined) {
            this._aaElt = document.createElement('div')
            this._aaElt.classList.add('amino-acid')
        }
        return this._aaElt
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
