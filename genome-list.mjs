class GenomeList {
    constructor(elt) {
	this.genomes = [];
        this.elt = elt
    }

    push(genome) {
	this.genomes.push(genome)
        const li = document.createElement('li')
        li.appendChild(genome.elt)
	this.historyElt.appendChild(li)
        genome.elt.scrollIntoView(false)
    }

    get last() {
	if (this.genomes.length > 0) {
	    return this.genomes[this.genomes.length - 1]
	} else {
	    return undefined
	}
    }

    get historyElt() {
        if (this._historyElt === undefined) {
            this._historyElt = document.createElement('ol')
            this.elt.querySelector('.history').appendChild(this._historyElt)
        }
        return this._historyElt
    }

    set initialGenome(genome) {
        this.initialElt.appendChild(genome.elt)
    }

    set finalGenome(genome) {
        this.finalElt.appendChild(genome.elt)
        this.finalElt.classList.remove('hidden')
    }

    get initialElt() {
        return this.elt.querySelector('.initial')
    }

    get finalElt() {
        return this.elt.querySelector('.final')
    }
}

export default GenomeList
