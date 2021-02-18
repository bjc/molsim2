class Error {
    constructor(elt) {
	this.elt = elt

        this._boundClickHandler = this.clickHandler.bind(this)
        this.button.addEventListener('click', this._boundClickHandler)
    }

    get errorElt() {
        if (this._errorElt === undefined) {
            this._errorElt = this.elt.querySelector('p')
        }
        return this._errorElt
    }

    get button() {
        if (this._button === undefined) {
            this._button = this.elt.querySelector('button')
        }
        return this._button
    }

    get innerHTML() {
        return this.errorElt.tinnerHTML
    }

    set innerHTML(html) {
        this.errorElt.innerHTML = html
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

    show() {
        this.elt.classList.remove('hidden')
    }

    hide() {
        this.elt.classList.add('hidden')
    }

    clickHandler() {
	this.onClick()
    }
}

export default Error
