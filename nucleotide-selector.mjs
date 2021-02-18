class NucleotideSelector {
    constructor(elt) {
	this.elt = elt
	for (const elt of this.elt.querySelectorAll('li')) {
	    elt.addEventListener('click', this.select.bind(this))
	}
    }

    get onItemSelected() {
	if (this._onItemSelected !== undefined) {
	    return this._onItemSelected
	}
	return () => {}
    }

    set onItemSelected(fn) {
	this._onItemSelected = fn
        this._boundWindowResizeHandler =
            this.windowResizeHandler.bind(this)
    }

    attach(nucleotide) {
	this.nucleotide = nucleotide

	this.nucleotide.elt.appendChild(this.elt)
	this.elt.classList.remove('hidden')

        this.adjustPosition()
        window.addEventListener('resize', this._boundWindowResizeHandler)
    }

    detach() {
	this.elt.classList.add('hidden')
        window.removeEventListener('resize',
                                   this._boundWindowResizeHandler)
    }

    windowResizeHandler() {
        this.adjustPosition()
    }

    adjustPosition() {
	const top =
	      this.nucleotide.elt.offsetTop +
	      this.nucleotide.elt.offsetHeight
	const myWidth =
	      this.elt.getBoundingClientRect().width
	const eltLeft =
	      this.nucleotide.elt.offsetLeft
	const parentWidth =
	      this.nucleotide.elt.offsetParent.offsetWidth
/*
	this.elt.style.top = `${top}px`
	if (eltLeft + myWidth > parentWidth) {
	    this.elt.style.left = 'auto'
	    this.elt.style.right = '0'
	} else {
            this.elt.style.left = `${eltLeft}px`
	    this.elt.style.right = 'auto'
	}
*/

	this.elt.scrollIntoView(false)
    }

    select(evt) {
	this.onItemSelected(evt.currentTarget.innerText)
    }
}

export default NucleotideSelector
