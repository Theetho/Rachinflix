import Model from './model'
import View from './view'
import EventHandler from './eventHandlers'
import PageLoader from './pageLoader'

export default class Controler {
	constructor() {
		this.mModel = new Model()
		this.mView = new View()
		this.mEventHandler = new EventHandler(this.mView)
		this.mPageLoader = new PageLoader(this.mView)

		this.Initialize()
	}

	async Initialize() {		
		this.mModel.AddObserver(this.mPageLoader)

		await this.mModel.Initialise()
		this.mEventHandler.Initialise(this.mPageLoader)
	}
}
