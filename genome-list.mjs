class GenomeList {
    constructor(elt) {
	this.genomes = [];
	this.elt = elt;
    }

    push(genome) {
	this.genomes.push(genome)
	this.elt.appendChild(genome.elt)
        window.genome = genome
        genome.elt.scrollIntoView(false)
    }

    get last() {
	if (this.genomes.length > 0) {
	    return this.genomes[this.genomes.length - 1]
	} else {
	    return undefined
	}
    }

    get penultimate() {
        if (this.genomes.length > 1) {
            return this.genomes[this.genomes.length - 2]
        } else {
            return undefined
        }
    }
}

export default GenomeList
