class AminoAcidSelector {
    constructor(elt) {
	this.elt = elt
	for (const elt of this.elt.querySelectorAll('li')) {
	    elt.addEventListener('click', this.select.bind(this))
	}
    }

    attach() {
	this.elt.classList.remove('hidden')
    }

    detach() {
	this.elt.classList.add('hidden')
    }

    get onItemSelected() {
	if (this._onItemSelected !== undefined) {
	    return this._onItemSelected
	}
	return () => {}
    }

    set onItemSelected(fn) {
	this._onItemSelected = fn
    }

    select(evt) {
	this.onItemSelected(evt.currentTarget.innerText)
    }
}

export default AminoAcidSelector
