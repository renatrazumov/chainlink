import express from 'express'
import helmet from 'helmet'
import http from 'http'
import mime from 'mime-types'
import { getConfig } from './config'
import cookieSession from 'cookie-session'
import adminAuth from './middleware/adminAuth'
import * as controllers from './controllers'
import { addRequestLogging, logger } from './logging'
import { bootstrapRealtime } from './server/realtime'
import seed from './seed'

export default function server(): http.Server {
  const conf = getConfig()
  if (conf.dev) {
    seed()
  }

  const app = express()
  addRequestLogging(app)

  app.use(helmet())
  if (conf.dev) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cors: typeof import('cors') = require('cors')

    app.use(
      cors({
        origin: [conf.clientOrigin],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
      }),
    )
  }

  app.use(
    cookieSession({
      name: 'explorer',
      maxAge: conf.cookieExpirationMs,
      secret: conf.cookieSecret,
    }),
  )
  app.use(express.json())
  app.use(
    express.static('client/build', {
      maxAge: '1y',
      setHeaders(res, path) {
        if (mime.lookup(path) === 'text/html') {
          res.setHeader('Cache-Control', 'public, max-age=0')
        }
      },
    }),
  )

  app.use('/api/v1/admin/*', adminAuth)
  const ADMIN_CONTROLLERS = [
    controllers.adminLogin,
    controllers.adminLogout,
    controllers.adminNodes,
    controllers.adminHeads,
  ]
  ADMIN_CONTROLLERS.forEach(c => app.use('/api/v1/admin', c))

  app.use('/api/v1', controllers.jobRuns)

  app.get('/*', (_, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
  })

  const httpServer = new http.Server(app)
  bootstrapRealtime(httpServer)

  return httpServer.listen(conf.port, () => {
    logger.info(`Server started, listening on port ${conf.port}`)
  })
}
