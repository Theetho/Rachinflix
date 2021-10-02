import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as os from 'os'
import * as path from 'path'
import { AppModule } from 'src/app.module'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from './helpers/repository'
import { FileWatcher } from './newfilesmanager/monitorfolder'

const ifaces = os.networkInterfaces()
let addresses = {}

for (let ifname of Object.keys(ifaces)) {
  let alias = 0

  for (let iface of ifaces[ifname]) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      continue
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      addresses[ifname + ':' + alias] = iface.address
    } else {
      // this interface has only one ipv4 adress
      addresses[ifname] = iface.address
    }

    ++alias
  }
}

const PORT = 3001

class Bootstrap extends UseLogger {
  constructor() {
    super()
    NestFactory.create(AppModule, { logger: false }).then(app => {
      app.listen(PORT, addresses['Ethernet'] ?? addresses['Wi-Fi'], () => {
        this.logger.log(`Listening on ${addresses['Ethernet'] ?? addresses['Wi-Fi']}:${PORT}`)
        const filewatcher = new FileWatcher()
        filewatcher.watch()
        Repositories.getUserRepository().initialize()
      })
      app.use('/', express.static(path.join(__dirname, '../public/build')))
      app.use(cookieParser())
    })
  }
}
new Bootstrap()
