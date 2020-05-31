export default class Observer {
	constructor(pView) {
		this.mView = pView
	}

	OnUpdate(pModel, pOption) {
		throw new Error('This method has to be override!')
	}
}
