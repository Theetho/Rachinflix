export default class Observable {
	constructor() {
		this.mObservers = []
		this.mState = false
	}

	AddObserver(pObserver) {
		this.mObservers.push(pObserver)
	}

	SetChanged() {
		this.mState = true
	}

	NotifyObservers(pOptions = null) {
		if (this.mState) {
			this.mObservers.forEach((pObserver) => {
				pObserver.OnUpdate(this, pOptions)
			})
			this.mState = false
		}
	}
}
