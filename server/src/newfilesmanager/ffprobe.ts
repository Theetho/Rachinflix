import { spawn } from 'child_process'

// Returns the video codecs, and the audio codecs and channels
export async function Ffprobe(path: string): Promise<string[][]> {
  return Promise.all([
    new Promise((resolve, reject) => {
      spawn('powershell.exe', [
        `-Command`,
        `ffprobe.exe -v quiet -select_streams v -show_entries stream=codec_name -of csv "${path}"`
      ])
        .on('close', () => {
          reject(undefined)
        })
        .stdout.on('data', data => {
          resolve(
            (data.toString() as string)
              .split('stream,')
              .map(probe => probe.replace('\r\n', ''))
              .slice(1)
          )
        })
    }),
    new Promise((resolve, reject) => {
      spawn('powershell.exe', [
        `-Command`,
        `ffprobe.exe -v quiet -select_streams a -show_entries stream=codec_name,channels -of csv "${path}"`
      ])
        .on('close', (code, signal) => {
          reject(undefined)
        })
        .stdout.on('data', data => {
          resolve(
            (data.toString() as string)
              .split('stream,')
              .map(probe => probe.replace('\r\n', ''))
              .slice(1)
          )
        })
    })
  ])
}
