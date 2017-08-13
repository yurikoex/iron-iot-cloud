
import { readdir } from 'fs'
import { promisify } from 'util'
import path from 'path'

import map from 'lodash/fp/map'

const fsReaddir = promisify(readdir)

import { prebuildFolder } from '../../../bin-downloader'

export const createBinDownloaderApi = ({
	deviceUpsert
}) => {
	const apiRoute = 'api/bin/downloader'

	return {
		createRoute: () => ({
			method: [ 'GET','POST' ],
			path: `/${apiRoute}/prebuild`,
			handler: ({
				method,
				payload
			}, reply) => {
				if (method == 'get') {
					fsReaddir(prebuildFolder)
						.then(filenames =>
							map(filename => {
								const f = path.join(prebuildFolder, filename)
								const p = 'public/'
								return `/${f.substring(f.indexOf(p) + p.length)}`
							})(filenames))
						.then(reply)
				}
				else {
					reply()
					const {
						ref: version,
						ref_type,
						repository: { name: repo }
					} = payload
					if (ref_type == 'tag' && version.indexOf('v') == 0)  {
						const [ ,, model, iteration ] = repo.split('-')
						deviceUpsert.next({ model, iteration })
					}
				}
			}
		})
	}
}
