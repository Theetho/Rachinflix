import CreateElement from './utils/createElement'
import ClearChildren from './utils/clearChildren'

// @brief: Class that contains all the event listeners (for clarity only)
export default class EventHandler {
	constructor(pView) {
		this.mView = pView
	}

	initialise() {
		this.fListenersForHeader()
		this.fListenersForVideo(this.mView)
		this.fListenersForSliders()
		this.fListenersForThumbnails(this.mView)
	}

	fListenersForHeader() {
		const fHideSections = (pClassNameToHide, pClassNameToDisplay) => {
			for (let section of document.getElementsByClassName(
				pClassNameToDisplay
			)) {
				section.style.display = 'inline'
			}
			for (let section of document.getElementsByClassName(pClassNameToHide)) {
				section.style.display = 'none'
			}
		}

		const films = document.getElementById('Films')

		films.addEventListener('click', (event) => {
			fHideSections('serie', 'film')
		})

		const series = document.getElementById('Series')

		series.addEventListener('click', (event) => {
			fHideSections('film', 'serie')
		})
	}

	fListenersForVideo(pView) {
		let viewer = pView.mViewer
		let back_button = pView.mBackButton
		let video = pView.mVideo
		let time_out

		// @brief: close the player when we click on the 'back' button
		back_button.addEventListener('click', (event) => {
			// Reduce the size of the player

			Object.assign(viewer.style, {
				height: '0%',
				width: '0%',
				top: '50%',
				left: '50%',
			})

			// Hide the text of the button
			Object.assign(back_button.style, {
				display: 'none',
			})

			video.parentElement.className = video.parentElement.className.replace(
				'vjs-controls-enabled',
				'vjs-controls-disabled'
			)

			// Reset the button so it can be visible next time
			// We use this weird code to hide the text because otherwise, if you
			// click the button and move the mouse, it stays on the screen because
			// moving the mouse in the player shows the button (see after).
			setTimeout(() => {
				Object.assign(back_button.style, {
					color: 'transparent',
					display: 'unset',
				})
				// We also pause the video if it is playing
				// if (!video.paused) video.pause()
				video.src = ''
			}, 1000)
		})

		// @brief: Display controls and back button when the mouse moves in the video tag.
		// Hide them after a time.
		video.addEventListener('mousemove', (event) => {
			video.removeAttribute('class')
			back_button.style.color = 'white'

			clearTimeout(time_out)

			time_out = setTimeout(() => {
				video.setAttribute('class', 'hide-controls')
				back_button.style.color = 'transparent'
			}, 3000)
		})

		// video.addEventListener('play', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('durationchange', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('ended', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('loadeddata', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('loadstart', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('progress', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('ratechange', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('seeked', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('seeking', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('suspend', (event) => {
		// 	console.log(event)
		// })
		// video.addEventListener('waiting', (event) => {
		// 	console.log(event)
		// })
	}

	fListenersForSliders() {
		let right_sliders = document.getElementsByClassName('right-slider')
		let left_sliders = document.getElementsByClassName('left-slider')

		const fMoveArea = (slider, side) => {
			let next_carousel_id = slider.id.replace('to-', '')
			let slider_carousel = slider.parentElement
			let next_carousel = document.getElementById(next_carousel_id)
			let files_area = slider_carousel.parentElement

			const current_left_position = Number(
				files_area.style.left.replace('px', '')
			)

			// Move the area of a carousel's width to the left or right
			const shift =
				side === 'left'
					? -slider_carousel.clientWidth
					: +next_carousel.clientWidth
			files_area.style.left = `${current_left_position + shift}px`

			// Hide the sliders of the current carousel
			for (let link of slider_carousel.getElementsByClassName('slider')) {
				link.style.display = 'none'
			}

			// And display the one of the new carousel
			for (let link of next_carousel.getElementsByClassName('slider')) {
				link.style.display = 'inherit'
			}
		}

		for (let right_slider of right_sliders) {
			right_slider.addEventListener('click', (event) => {
				fMoveArea(right_slider, 'left')
			})
		}

		// Same but we move it right
		for (let left_slider of left_sliders) {
			left_slider.addEventListener('click', (event) => {
				fMoveArea(left_slider, 'right')
			})
		}
	}

	fListenersForThumbnails(pView) {
		let thumbnails = document.getElementsByClassName('thumbnail')

		for (let thumbnail of thumbnails) {
			const video_source = `${thumbnail.src.replace('/thumbnail:', '')}`

			// const video_source = '/pipe'
			// const video_source = '/stream'

			// Open and play the selected video on click
			thumbnail.addEventListener('click', (event) => {
				const language = pView.mUserLanguage.selectedOptions[0].value

				const viewer_style = {
					height: '80%',
					width: '80%',
					top: '10%',
					left: '10%',
				}

				Object.assign(pView.mViewer.style, viewer_style)

				// Play back the video it it was the last one playing
				if (pView.mVideo.src.includes(video_source))
					pView.mVideo.play().catch((error) => {
						console.log(error)
					})
				// Else load it
				else {
					pView.mVideo.src = `${video_source}/${language}`
					pView.mVideo.load()
				}
				// Play it after a little time
				setTimeout(async () => {
					ClearChildren(pView.mVideo)

					// const subtitles = await fetch(
					// 	thumbnail.src.replace('thumbnail', 'subtitles') + '/fre'
					// )

					// console.log(subtitles)
					const CreateTrack = (pOptions) => {
						const track = CreateElement('track', {
							id: pOptions.id,
							kind: 'captions',
							label: pOptions.label,
							src:
								thumbnail.src.replace('thumbnail', 'subtitles') +
								'/' +
								pOptions.language,
							default: pOptions.default,
						})

						pView.mVideo.appendChild(track)
					}

					CreateTrack({
						id: 'sub-video-fre',
						label: 'French',
						language: 'fre',
						default: true,
					})
					CreateTrack({
						id: 'sub-video-eng',
						label: 'English',
						language: 'eng',
						default: false,
					})

					pView.mVideo.play().catch((error) => {
						console.log(error)
					})
				}, 500)
			})
		}
	}
}
