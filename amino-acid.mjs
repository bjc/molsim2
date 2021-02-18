class AminoAcid {
    // Create a protein from three nucleotides.
    constructor(n1, n2, n3) {
        this.value = AminoAcid.codonMap[n1+n2+n3]
        this._boundClickHandler = this.clickHandler.bind(this)
    }

    get elt() {
        if (this._elt === undefined) {
            this._elt = document.createElement('div')
            this._elt.classList.add('amino-acid')
        }
        return this._elt
    }

    get value() {
        return this.elt.innerText
    }

    set value(val) {
        this.elt.innerText = val
    }

    lock() {
        this.elt.removeEventListener('click', this._boundClickHandler)
    }

    unlock() {
        this.elt.addEventListener('click', this._boundClickHandler)
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

    clickHandler(evt) {
        this.onClick(this)
    }
}

AminoAcid.list = [
    'Ala', 'Arg', 'Asn', 'Asp', 'Cys', 'Gln', 'Glu', 'Gly', 'His', 'Ile',
    'Leu', 'Lys', 'Met', 'Phe', 'Pro', 'Ser', 'Thr', 'Trp', 'Tyr', 'Val',
    'STOP'
]

AminoAcid.codonMap = {
    'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg', 'AGA': 'Arg', 'AGG': 'Arg',
    'AAT': 'Asn', 'AAC': 'Asn',
    'GAT': 'Asp', 'GAC': 'Asp',
    'TGT': 'Cys', 'TGC': 'Cys',
    'CAA': 'Gln', 'CAG': 'Gln',
    'GAA': 'Glu', 'GAG': 'Glu',
    'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
    'CAT': 'His', 'CAC': 'His',
    'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile',
    'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu', 'TTA': 'Leu', 'TTG': 'Leu',
    'AAA': 'Lys', 'AAG': 'Lys',
    'ATG': 'Met',
    'TTT': 'Phe', 'TTC': 'Phe',
    'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser', 'AGT': 'Ser', 'AGC': 'Ser',
    'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'TGG': 'Trp',
    'TAT': 'Tyr', 'TAC': 'Tyr',
    'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
    'TAA': 'STOP', 'TGA': 'STOP', 'TAG': 'STOP',
}

export default AminoAcid
