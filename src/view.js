import CreateElement from './utils/createElement'
import ClearChildren from './utils/clearChildren'
import { RemoveChar } from './utils/removeChar'

export default class View {
	constructor() {
		this.mContainer = document.getElementById('container')
		this.mHeader = document.getElementById('header')
		this.mUserLanguage = document.getElementById('user-language')

		this.mViewer = document.getElementById('viewer')
		this.mVideo = document.getElementById('main-video')
		this.mBackButton = document.getElementById('go-back')

		this.mTitles = {}
	}

	Load(pData) {
		this.BuildCategories(pData.categories)
		this.BuildTitles(pData.titles)
		this.BuildSeasons(pData.seasons)
		this.BuildFiles(pData.paths)

		for (let selecter of document.getElementsByTagName('select')) {
			this.DisplayFilesForSeason(
				selecter.parentElement,
				RemoveChar(selecter.selectedOptions[0].id, ' ')
			)
		}
	}

	DisplayFilesForSeason(pTitle, pSeason) {
		pSeason = pSeason.toLowerCase()

		for (let files_area of pTitle.getElementsByTagName('div')) {
			if (files_area.className !== 'files-area') continue
			if (files_area.id.toLowerCase().includes(pSeason))
				files_area.style.display = 'flex'
			else files_area.style.display = 'none'
		}
	}

	BuildCategories(pCategories) {
		let categories = CreateElement('div', {
			id: 'categories',
		})

		for (let categorie of pCategories) {
			const categorie_name = RemoveChar(`${categorie.name}`, ' ')
			let categorie_item = CreateElement('a', {
				className: 'categories-item',
				id: categorie_name,
				innerHTML: `${categorie.name}`,
				// href: `./${categorie.name}`,
			})

			categories.appendChild(categorie_item)
		}

		this.mHeader.appendChild(categories)
	}

	BuildTitles(pTitles) {
		ClearChildren(this.mContainer)

		for (let title of pTitles) {
			let title_name = RemoveChar(`${title.name}`, ' ')

			let section = CreateElement('div', {
				className:
					'section flex-item' +
					(title.parent === 'Series' ? ' serie' : ' film'),
				id: title_name,
				innerHTML: `${title.name}`,
			})

			this.mTitles[title_name] = section

			this.mContainer.appendChild(section)
		}
	}

	BuildSeasons(pSeasons) {
		for (let season of pSeasons) {
			let serie = this.mTitles[RemoveChar(season.parent, ' ')]

			if (serie === undefined) continue

			if (serie.children.length > 0) {
				let season_selecter = serie.children[0]
				const option = CreateElement('option', {
					value: `${season.name}`,
					id: RemoveChar(`${season.name}`, ' '),
					innerHTML: `${season.name}`,
				})

				season_selecter.appendChild(option)
				continue
			}

			let season_selecter = CreateElement('select', {
				className: 'season-selecter',
				innerHTML: `<option id="${RemoveChar(`${season.name}`, ' ')}" value="${
					season.name
				}">${season.name}</options>`,
			})

			season_selecter.addEventListener('change', (event) => {
				this.DisplayFilesForSeason(
					serie,
					RemoveChar(event.target.selectedOptions[0].id, ' ')
				)
			})

			serie.appendChild(season_selecter)
		}
	}

	BuildFiles(pPaths) {
		for (let path of Object.keys(pPaths)) {
			let file = pPaths[path]
			let split = path.split('/')

			// Folder is equal to path without the name of the file (which is the last element of 'split')
			let folder = path.replace(`/${split[split.length - 1]}`, '')

			// Here the file can be either an episode of a serie, or a film.
			// If it is an episode, its parent contains 'season' in its name
			// so to get the title of this serie we have to take the name of
			// the parent of the parent of 'file', which is 'split[split.length - 3]'
			// Else, file's parent is the name of the movie
			let title = file.parent.toLowerCase().includes('season')
				? split[split.length - 3]
				: file.parent

			title = RemoveChar(title, ' ')

			let section = this.mTitles[title]

			// We get the area were the file will be displayed
			let files_area = document.getElementById(folder)

			// If it doesn't exist, we create it. We add to it the
			// first carousel
			if (files_area === null || files_area === undefined) {
				files_area = CreateElement(
					'div',
					{
						className: 'files-area',
						id: folder,
					},
					[
						CreateElement('div', {
							className: 'carousel',
							id: folder + 'carousel-0',
						}),
					]
				)
				// And add it to the section
				section.appendChild(files_area)
			}

			const server_path_to_file = `${files_area.id}/${RemoveChar(
				file.name,
				' '
			)}`

			const file_info = CreateElement(
				'div',
				{
					className: 'file-info',
				},
				[
					CreateElement('div', {
						className: 'file-name',
						innerHTML: file.name
							.replace(/S0*(\w+)E0*/, 'S$1:E')
							.replace(/([0-9]*) - /, '$1 - "')
							.replace('HASH', '#')
							.replace(/(.*)\.+(.*)/, '$1"'),
					}),
				]
			)

			let thumbnail = CreateElement('video', {
				className: 'thumbnail',
				poster: `/thumbnail:${server_path_to_file}`,
			})

			file_info.appendChild(thumbnail)
			const current_carousel = files_area.lastChild

			// If the current carousel is full (meaning it contains 5 thumbnails)
			if (current_carousel.getElementsByTagName('video').length == 5) {
				// Then we have to create a new one to add the thumbnail.
				// This thumbnail will be the first of its carousel, so it has
				// to have its z-index at 1 so that the right slider of the previous
				// carousel is over it when this new carousel is not active.
				file_info.style.zIndex = 1

				// We create a slider so that the previous carousel can give access
				// to this new one. As 'file-area' only contains carousels, it 'childCount"
				// can be used to ID the carousels inside of it
				const carousel_count = files_area.childElementCount

				let right_slider = CreateElement('a', {
					className: 'slider right-slider',
					innerHTML: '>',
					id: `to-${folder}carousel-${carousel_count}`,
				})

				// All the sliders are hidden except for the first one on the right.
				// They will be displayed dynamically later. So if their is only one
				// carousel, we have to display its slider.
				if (carousel_count === 1) right_slider.style.display = 'inherit'

				// We also need to create a slider for our new carousel so it give
				// us access to the previous one.
				let left_slider = CreateElement('a', {
					className: 'slider left-slider',
					innerHTML: '<',
					id: `to-${folder}carousel-${carousel_count - 1}`,
				})

				// We add the right slider to the current carousel
				current_carousel.appendChild(right_slider)

				// And we create the new one, with the left slider
				// as children
				files_area.appendChild(
					CreateElement(
						'div',
						{
							className: 'carousel',
							id: folder + 'carousel-' + files_area.childElementCount,
						},
						[left_slider]
					)
				)
			}

			// And finally, we add the thumbnail to the correct carousel
			// files_area.lastChild.appendChild(thumbnail)
			files_area.lastChild.appendChild(file_info)
		}
	}
}
