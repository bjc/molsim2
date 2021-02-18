class Die {
    constructor(elt) {
	this.elt = elt

        this.value = '--'
        this._boundRollHandler = this.rollHandler.bind(this)
        this.disable()
    }

    get valueElt() {
        if (this._valueElt === undefined) {
            this._valueElt = this.elt.querySelector('.value')
        }
        return this._valueElt
    }

    get value() {
        return this.valueElt.innerText
    }

    set value(val) {
        this.valueElt.innerText = val
    }

    get button() {
        if (this._button === undefined) {
            this._button = this.elt.querySelector('button')
        }
        return this._button
    }

    enable() {
        this.elt.classList.add('enabled')
	this.elt.classList.remove('disabled')
	this.button.disabled = false
	this.button.addEventListener('click', this._boundRollHandler)
    }

    disable() {
	this.elt.classList.add('disabled')
	this.elt.classList.remove('enabled')
	this.button.disabled = true
	this.button.removeEventListener('click', this._boundRollHandler)
    }

    get onChanged() {
	if (this._onChanged !== undefined) {
	    return this._onChanged
	}
	return () => {}
    }

    set onChanged(fn) {
	this._onChanged = fn
    }

    rollHandler() {
	this.value = Math.floor(Math.random() * Die.size) + 1
	this.onChanged(this.value)
    }
}
Die.size = 20

export default Die
