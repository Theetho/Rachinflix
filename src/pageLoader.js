import Observer from './observer'

export default class PageLoader extends Observer {
	constructor(pView) {
		super(pView)
	}

	OnUpdate(pModel, pOption) {
		let data = {
			paths: pModel.mPathToFiles,
			categories: pModel.mCategories,
			titles: pModel.mTitles,
			seasons: pModel.mSeasons,
		}

		this.mView.Load(data)
	}
}
