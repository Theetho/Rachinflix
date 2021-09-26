export const setVideoSource = async (
  source: Promise<Blob>,
  video: HTMLVideoElement | null
): Promise<void> => {
  if (!video) return Promise.resolve()

  const blob = await source
  // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
  try {
    video.srcObject = blob
  } catch (err: any) {
    if (err.name !== 'TypeError') {
      console.log(err.message)
    }
    // Even if they do, they may only support MediaStream
    try {
      video.src = URL.createObjectURL(blob)
    } catch (err: any) {
      if (err.name !== 'TypeError') {
        console.log(err.message)
      }
      // Even if they do, they may only support MediaStream
      video.src = ''
    }
  }
  video.play()
}
