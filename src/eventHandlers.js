import CreateElement from './utils/createElement'
import ClearChildren from './utils/clearChildren'
import { THUMBNAILS_PER_SLIDE } from './constants'

// @brief: Class that contains all the event listeners (for clarity only)
export default class EventHandler {
	constructor(pView) {
		this.mView = pView
		this.mScroll = [0, 0]
	}

	Initialise(pPageLoader) {
		this.mPageLoader = pPageLoader

		this.ListenersForHeader()
		this.ListenersForVideo(this.mView)
		this.ListenersForSliders()
		this.ListenersForThumbnails(this.mView)
		this.ListenersForFileInfos()
	}

	ListenersForHeader() {
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

	ListenersForVideo(pView) {
		let back_button = pView.mBackButton
		let video = pView.mVideo
		let time_out

		// @brief: close the player when we click on the 'back' button
		back_button.addEventListener('click', (event) => {
			// Hide the player

			Object.assign(viewer.style, { display: 'none' })

			if (!video.paused) {
				video.pause()
			}
			// Notify server to stop the streaming
			const video_progress = (
				(video.currentTime / video.duration) *
				100
			).toFixed(2)

			fetch(video.src + '/end/' + video_progress)

			window.scrollTo({
				left: this.mScroll[0],
				top: this.mScroll[1],
				behavior: 'smooth',
			})
		})

		// @brief: Display controls and back button when the mouse moves in the video tag.
		// Hide them after a time.
		video.addEventListener('mousemove', (event) => {
			video.removeAttribute('class')

			clearTimeout(time_out)

			time_out = setTimeout(() => {
				video.setAttribute('class', 'hide-controls')
			}, 3000)
		})
	}

	ListenersForSliders() {
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

			slider_carousel.setAttribute('class', 'carousel')

			// And display the one of the new carousel
			for (let link of next_carousel.getElementsByClassName('slider')) {
				link.style.display = 'inherit'
			}

			next_carousel.setAttribute('class', 'carousel active')
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

	ListenersForThumbnails(pView) {
		let thumbnails = document.getElementsByClassName('thumbnail')

		for (let thumbnail of thumbnails) {
			const video_source = `${thumbnail.poster.replace('/thumbnail:', '')}`

			const file_description = thumbnail.parentElement.getElementsByClassName(
				'file-name'
			)[0]

			// Open and play the selected video on click
			thumbnail.addEventListener('click', (event) => {
				const video_source_without_hostsrc = video_source.replace(
					/https*:\/\/[^/]+/,
					''
				)

				const language = pView.mUserLanguage.selectedOptions[0].value

				this.mScroll = this._GetScroll()
				window.scrollTo({ left: 0, top: 0, behavior: 'smooth' })

				this.mPageLoader.mPageData.paths[video_source_without_hostsrc]

				Object.assign(pView.mViewer.style, { display: 'flex' })

				// Retrieve the file name to display it over the video
				pView.mCurrentFileName.innerHTML =
					thumbnail.parentElement.children[0].innerHTML

				// Play back the video it it was the last one playing
				if (pView.mVideo.src.includes(video_source))
					pView.mVideo.play().catch((error) => {
						console.log(error)
					})
				// Else load it
				else {
					pView.mVideo.src = `${video_source}/${language}`
					pView.mVideo.poster = thumbnail.poster
					pView.mVideo.load()
					pView.mVideo.addEventListener(
						'play',
						(event) => {
							if (thumbnail.time >= 0) {
								const time_in_seconds =
									(thumbnail.time / 100) * pView.mVideo.duration
								console.log(pView.mVideo.duration, time_in_seconds)
								pView.mVideo.currentTime = time_in_seconds
							}
						},
						{ once: true }
					)
				}

				// Play it after a little time
				setTimeout(async () => {
					ClearChildren(pView.mVideo)

					const CreateTrack = (pOptions) => {
						const track = CreateElement('track', {
							id: pOptions.id,
							kind: 'captions',
							label: pOptions.label,
							src:
								thumbnail.poster.replace('thumbnail', 'subtitles') +
								'/' +
								pOptions.language,
							default: pOptions.default,
						})

						// Move the subtitle's lines up a little
						track.addEventListener('load', (event) => {
							let cues = event.target.track.cues
							if (!cues || !cues.length) return

							let index = 0

							for (index = 0; index < cues.length; ++index) {
								let cue = cues[index]
								cue.snapToLines = false
								cue.line = 90
							}
						})

						pView.mVideo.appendChild(track)
					}

					CreateTrack({
						id: 'sub-video-fre-forced',
						label: 'French Forced',
						language: 'fre_forced',
						default: true,
					})

					CreateTrack({
						id: 'sub-video-eng-forced',
						label: 'English Forced',
						language: 'eng_forced',
						default: false,
					})

					CreateTrack({
						id: 'sub-video-fre',
						label: 'French',
						language: 'fre',
						default: false,
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

			let tPlayPreview = null
			// Plays the preview on over
			thumbnail.addEventListener('mouseenter', (event) => {
				// if (tPlayPreview) clearTimeout(tPlayPreview)

				file_description.style.color = 'white'

				tPlayPreview = setTimeout(() => {
					fetch(thumbnail.poster.replace('/thumbnail:', '/preview:'))
						.then((response) => {
							return response.blob()
						})
						.then((blob) => {
							// from https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
							if ('srcObject' in thumbnail) {
								try {
									thumbnail.srcObject = blob
								} catch (err) {
									if (err.name != 'TypeError') {
										console.log(err.message)
									}
									// Even if they do, they may only support MediaStream
									thumbnail.src = URL.createObjectURL(blob)
								}
							} else {
								// Avoid using this in new browsers, as it is going away.
								thumbnail.src = URL.createObjectURL(blob)
							}
							thumbnail.muted = true
							thumbnail.play()
						})
				}, 1300)
			})

			thumbnail.addEventListener('mouseleave', (event) => {
				if (tPlayPreview) clearTimeout(tPlayPreview)

				if (!thumbnail.paused) thumbnail.style.opacity = '0.7'

				file_description.style.color = 'transparent'

				tPlayPreview = setTimeout(() => {
					thumbnail.src = ''
					thumbnail.style.opacity = '1'
				}, 1000)
			})

			thumbnail.addEventListener('ended', (event) => {
				if (tPlayPreview) clearTimeout(tPlayPreview)

				tPlayPreview = setTimeout(() => {
					thumbnail.src = ''
				}, 1000)
			})
		}
	}

	ListenersForFileInfos() {
		const sections = document.getElementsByClassName('section')

		const fToggleHover = (pSection) => {
			const infos = pSection.getElementsByClassName('file-info')
			return setTimeout(() => {
				for (let info of infos) {
					if (info.className.includes('file-info-hoverable')) continue
					info.className = info.className.concat(' file-info-hoverable')
				}
			}, 1000)
		}

		// Enable/Disable hover effects when mouse enters/leaves the file area
		for (let section of sections) {
			let tHover = null

			// Trigger hover effect on thumbnails 1 sec after the mouse enters in the carousels
			section.addEventListener('mouseenter', (event) => {
				if (tHover) clearTimeout(tHover)
				tHover = fToggleHover(section)
			})
			// If the hover is not trigger already, then it triggers it on 'over'
			section.addEventListener('mouseover', (event) => {
				if (tHover) clearTimeout(tHover)
				tHover = fToggleHover(section)
			})
			// Remove the effect when leaving the carousel
			section.addEventListener('mouseleave', (event) => {
				if (tHover) clearTimeout(tHover)

				const infos = section.getElementsByClassName('file-info-hoverable')
				while (infos.length) {
					let info = infos[0]
					info.className = info.className.replace(' file-info-hoverable', '')
				}
			})
		}

		const GetStyleFromPosition = (pPosition, pOtherPosition, pOffset) => {
			let style = {
				cursor: 'pointer',
			}

			if (pPosition == 0) {
				style.left =
					(pPosition == pOtherPosition ? pOffset : 2 * pOffset) + 'px'
				if (pOtherPosition == THUMBNAILS_PER_SLIDE - 1) {
					style.zIndex = 2
				}
			} else if (pPosition == THUMBNAILS_PER_SLIDE - 1) {
				style.left =
					(pPosition == pOtherPosition ? -pOffset : -2 * pOffset) + 'px'
				if (pOtherPosition == 0) {
					style.zIndex = 2
				}
			} else {
				if (pOtherPosition < pPosition) {
					style.left = '0px'
				} else if (pOtherPosition > pPosition) {
					style.left = 2 * pOffset + 'px'
				} else {
					style.left = pOffset + 'px'
				}

				if (pOtherPosition == 0 || pOtherPosition == THUMBNAILS_PER_SLIDE - 1) {
					style.zIndex = 2
				}
			}

			return style
		}

		const infos = document.getElementsByClassName('file-info')
		let tResendEvent = null
		for (let info of infos) {
			info.addEventListener('mouseover', (event) => {
				// Delay the effect when entering in the new file area
				if (!info.className.includes('file-info-hoverable')) {
					if (tResendEvent) clearTimeout(tResendEvent)
					tResendEvent = setTimeout(() => {
						info.dispatchEvent(new Event('mouseover'))
					}, 100)
					return
				}
				const parent = info.parentElement
				const position = info.className.replace(
					/carousel-item-([0-9]+) .*/,
					'$1'
				)

				// 4 because it works
				const offset = info.clientWidth / 4

				for (let other_info of parent.getElementsByClassName('file-info')) {
					const other_position = other_info.className.replace(
						/carousel-item-([0-9]+) .*/,
						'$1'
					)

					let style = GetStyleFromPosition(position, other_position, offset)

					// Change the scale of the hovered item
					if (other_position === position) style.transform = 'scale(1.5)'

					Object.assign(other_info.style, style)
				}
			})

			info.addEventListener('mouseleave', (event) => {
				if (tResendEvent) clearTimeout(tResendEvent)
				const parent = info.parentElement
				const position = info.className.replace(
					/carousel-item-([0-9]+) .*/,
					'$1'
				)
				for (let other_info of parent.getElementsByClassName('file-info')) {
					const other_position = other_info.className.replace(
						/carousel-item-([0-9]+) .*/,
						'$1'
					)

					let style = {
						left: '0px',
						cursor: 'default',
						zIndex: 1,
					}

					// Change the scale of the hovered item
					if (other_position === position) style.transform = 'scale(1)'

					Object.assign(other_info.style, style)
				}
			})
		}
	}

	// https://stackoverLow.com/questions/2481350/how-to-get-scrollbar-position-with-javascript
	_GetScroll() {
		if (window.pageYOffset !== undefined) {
			console.log('Offset: ', [pageXOffset, pageYOffset])
			return [pageXOffset, pageYOffset]
		} else {
			var sx,
				sy,
				doc = document.documentElement,
				body = document.body
			sx = doc.scrollLeft || body.scrollLeft || 0
			sy = doc.scrollTop || body.scrollTop || 0
			console.log('Offset: ', [sx, sy])
			return [sx, sy]
		}
	}
}
