import { graphics, Systeminformation } from 'systeminformation'

export class NvidiaCard {
  private index: number

  constructor() {
    this.index = -1
    graphics().then(({ controllers }) => {
      controllers.forEach((controller: Systeminformation.GraphicsControllerData, index: number) => {
        if (controller.vendor == 'NVIDIA') {
          this.index = index
        }
      })
    })
  }

  getIndex() {
    return this.index
  }
}
