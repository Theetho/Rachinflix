import Observer from './observer'

export default class PageLoader extends Observer {
	constructor(pView) {
		super(pView)
		this.mPageData = {}
	}

	OnUpdate(pModel, pOption) {
		this.mPageData = {
			paths: pModel.mPathToFiles,
			categories: pModel.mCategories,
			titles: pModel.mTitles,
			seasons: pModel.mSeasons,
			recommendations: pModel.mRecommendations,
		}

		this.mView.Load(this.mPageData)
	}
}
