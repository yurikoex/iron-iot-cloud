
import each from 'lodash/fp/each'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'

import { createBinDownloader } from './bin-downloader'

import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'
import {
	routePublic,
	routeBuiltPost
} from './http-server/static-files'

const devices = [{
	model: 'phub',
	iteration: 1,
	interpreter: { type: 'node', version: 'stable' }
}, {
	model: 'armb',
	iteration: 1,
	interpreter: { type: 'node', version: 'stable' }
}]

const port = 9967

const deviceUpsert = new Subject()
const prebuildNeeded = new Subject()
const buildNeeded = new Subject()
const buildComplete = new Subject()

buildNeeded.subscribe(d => {
	//post prebuild-ready to armb
})

createBinDownloader({
	prebuildNeeded,
	buildNeeded
})
	.then(() => createHttpServer(port))
	.then(server => routeApi(server, {
		deviceUpsert,
		prebuildNeeded,
		buildComplete
	}))
	.then(server => routePublic(server))
	.then(server => routeBuiltPost(server))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		server.log(`server up on ${port}`)
		each(d => deviceUpsert.next(d))(devices)
	}))
	.catch(console.error)
