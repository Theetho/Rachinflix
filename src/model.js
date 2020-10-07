import Observable from './observable'
import { RemoveChar } from './utils/removeChar'

export default class Model extends Observable {
	constructor() {
		super()
	}

	async Initialise() {
		let response = await fetch('/data')

		if (!response.ok) console.log('HTTP-Error: ' + response.status)

		let data_from_server = await response.json()

		this.mPathToFiles = {}
		this.mCategories = []
		this.mSeasons = []
		this.mTitles = []

		response = await fetch('/recommendation')
		this.mRecommendations = await response.json()

		this.Destructurate(data_from_server)

		this.SetChanged()
		this.NotifyObservers()
	}

	// Destructurate the tree sent by the server into several objects
	Destructurate(tree, path = '/') {
		let folder_contains_only_files = true

		for (let key of Object.keys(tree)) {
			let node = tree[key]
			node.name = key

			key = RemoveChar(key, ' ')

			if (node.isFile) {
				this.mPathToFiles[path + key] = node
				continue
			} else {
				folder_contains_only_files = false
			}

			const does_folder_contain_only_files = this.Destructurate(
				node.children,
				path + key + '/'
			)

			if (node.parent === '') {
				this.mCategories.push(node)
				continue
			}

			if (
				!does_folder_contain_only_files ||
				!node.name.toLowerCase().includes('season')
			) {
				this.mTitles.push(node)
			} else this.mSeasons.push(node)
		}

		return folder_contains_only_files
	}
}
