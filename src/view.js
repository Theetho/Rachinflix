import CreateElement from './utils/createElement'
import ClearChildren from './utils/clearChildren'
import { RemoveChar } from './utils/removeChar'
import { THUMBNAILS_PER_SLIDE } from './constants'

export default class View {
	constructor() {
		this.mContainer = document.getElementById('container')
		this.mRecommendation = document.getElementById('recommendation') // null
		this.mHeader = document.getElementById('header')
		this.mUserLanguage = document.getElementById('user-language')

		this.mViewer = document.getElementById('viewer')
		this.mVideo = document.getElementById('main-video') //'video-recommendation')
		this.mBackButton = document.getElementById('go-back')
		this.mCurrentFileName = document.getElementById('current-file-name')

		this.mTitles = {}
	}

	Load(pData) {
		ClearChildren(this.mContainer)

		if (Object.keys(pData.recommendations).length) this.BuildRecommendation()
		this.BuildCategories(pData.categories)
		this.BuildTitles(pData.titles)
		this.BuildSeasons(pData.seasons)
		this.BuildFiles(pData.paths)

		if (Object.keys(pData.recommendations).length)
			this.LoadRecommendation(pData.recommendations)

		for (let selecter of document.getElementsByTagName('select')) {
			this.DisplayFilesForSeason(
				selecter.parentElement,
				RemoveChar(selecter.selectedOptions[0].id, ' ')
			)
		}

		// Remove empty section (Directory with no files inside)
		for (let section of document.getElementsByClassName('section')) {
			if (section.childElementCount === 1) {
				for (let title of pData.titles) {
					const title_name = RemoveChar(title.name, ' ')
					const title_parent = RemoveChar(title.parent, ' ')
					if (title_parent === section.id) {
						const actual_section = document.getElementById(title_name)
						actual_section.firstChild.innerHTML = `${title.parent} - ${title.name}`
					}
				}
				section.parentNode.removeChild(section)
			}
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

	BuildRecommendation() {
		let section_name = 'section-recommendation' // --> Modify HERE ? Modify 'LoadRecommendation' too
		let area_name = 'file-recommendation'

		const file_area = CreateElement('div', {
			className: 'files-area',
			id: area_name,
		})
		let section = CreateElement(
			'div',
			{
				className: 'section',
				id: section_name,
			},
			[
				CreateElement('span', {
					innerHTML: 'Continue watching',
				}),
				file_area,
			]
		)

		this.mTitles[section_name] = section

		this.mContainer.appendChild(section)
	}

	LoadRecommendation(pRecommendation) {
		const section_name = 'section-recommendation'
		let area_name = 'file-recommendation'

		const file_area = document.getElementById(area_name)

		const carousel_items = Object.keys(pRecommendation).length
		const carousel_slides = carousel_items % THUMBNAILS_PER_SLIDE

		for (let slide = 0; slide < carousel_slides; ++slide) {
			const carousel = CreateElement('div', {
				className: slide == 0 ? 'carousel active' : 'carousel',
				id: `${section_name}carousel-${slide}`,
			})

			// Left slider
			if (slide != 0) {
				carousel.appendChild(
					CreateElement('a', {
						className: 'slider left-slider',
						id: `to-${section_name}carousel-${slide - 1}`,
					})
				)
			}

			// Thumbnails
			for (let item = 0; item < THUMBNAILS_PER_SLIDE; ++item) {
				const recommendation_index = slide * THUMBNAILS_PER_SLIDE + item
				// It means that every recommended file has already been handled
				if (recommendation_index >= carousel_items) {
					break
				}

				const thumbnail_src = Object.keys(pRecommendation)[recommendation_index]

				const thumbnail_inner_html = this._GetThumbnailInnerHTML(thumbnail_src)

				const carousel_item = CreateElement(
					'div',
					{
						className: `carousel-item-${item} file-info`,
					},
					[
						CreateElement('div', {
							className: 'file-name',
							innerHTML: thumbnail_inner_html,
						}),
						CreateElement('video', {
							className: 'thumbnail',
							poster: `/thumbnail:${thumbnail_src}`,
							time: pRecommendation[thumbnail_src],
						}),
					]
				)

				carousel.appendChild(carousel_item)

				// Right slider (only if this slide is full)
				if (slide != carousel_slides - 1 && item == THUMBNAILS_PER_SLIDE) {
					carousel.appendChild('a', {
						className: 'slider right-slider',
						id: `to-${section_name}carousel-${slide + 1}`,
					})
				}
			}

			file_area.appendChild(carousel)
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
			})

			categories.appendChild(categorie_item)
		}

		this.mHeader.appendChild(categories)
	}

	BuildTitles(pTitles) {
		for (let title of pTitles) {
			let title_name = RemoveChar(`${title.name}`, ' ')

			let section = CreateElement(
				'div',
				{
					className:
						'section' + (title.parent === 'Series' ? ' serie' : ' film'),
					id: title_name,
				},
				[
					CreateElement('span', {
						innerHTML: `${title.name}`,
					}),
				]
			)

			this.mTitles[title_name] = section

			this.mContainer.appendChild(section)
		}
	}

	BuildSeasons(pSeasons) {
		for (let season of pSeasons) {
			let serie = this.mTitles[RemoveChar(season.parent, ' ')]

			if (serie === undefined) continue

			let season_selecter = serie.getElementsByTagName('select')[0]
			if (season_selecter) {
				const option = CreateElement('option', {
					value: `${season.name}`,
					id: RemoveChar(`${season.name}`, ' '),
					innerHTML: `${season.name}`,
				})

				season_selecter.appendChild(option)
				continue
			}

			season_selecter = CreateElement('select', {
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
							className: 'carousel active',
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

			split = file.name.split('.')

			const file_name = file.name
				// Remove .mkv, .mp4, ...
				.replace('.' + split[split.length - 1], '')
				// Remove '0' from S01E01 and add ':' between season and episode
				.replace(/S0*([0-9]+)E0*/, 'S$1:E')
				// Add the number of the episode
				.replace(/0*([0-9]*) - /, '$1 - "')
				.replace('HASH', '#')
				// Add '"' if the video has a title
				.concat(file.name.includes('-') ? '"' : '')

			const current_carousel = files_area.lastChild

			const file_info = CreateElement('div', {}, [
				CreateElement('div', {
					className: 'file-name',
					innerHTML: file_name,
				}),
			])

			let thumbnail = CreateElement('video', {
				className: 'thumbnail',
				poster: `/thumbnail:${server_path_to_file}`,
			})

			file_info.appendChild(thumbnail)

			// If the current carousel is full (meaning it contains 5 thumbnails)
			if (
				current_carousel.getElementsByTagName('video').length ==
				THUMBNAILS_PER_SLIDE
			) {
				// Then we have to create a new one to add the thumbnail.
				// This thumbnail will be the first of its carousel, so it has
				// to have its z-index at 1 so that the right slider of the previous
				// carousel is over it when this new carousel is not active.
				// file_info.style.zIndex = 1

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

			file_info.className = `carousel-item-${
				files_area.lastChild.getElementsByClassName('file-info').length
			} file-info`

			// And finally, we add the thumbnail to the correct carousel
			// files_area.lastChild.appendChild(thumbnail)
			files_area.lastChild.appendChild(file_info)
		}
	}

	_GetThumbnailInnerHTML(pThumbnailSrc) {
		const thumbnails = document.getElementsByClassName('thumbnail')

		for (let thumbnail of thumbnails) {
			if (!thumbnail.poster.includes(pThumbnailSrc)) continue

			// Return the innerHTML of the 'file-name' element associated
			// with this thumbnail
			return thumbnail.parentElement.children[0].innerHTML
		}
	}
}
