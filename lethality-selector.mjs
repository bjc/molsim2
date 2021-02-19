class LethalitySelector {
    constructor(elt) {
        this.elt = elt

	for (const elt of this.elt.querySelectorAll('button')) {
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
        window.evt = evt
	this.onItemSelected(evt.target.id == 'lethal')
    }
}

export default LethalitySelector
