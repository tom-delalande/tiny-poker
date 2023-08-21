import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { env } from 'process'

const main = () => {
	let buildVersion = env.BUILD_VERSION

	const obj = {
		buildVersion
	}

	const filePath = resolve('src', 'build-version.json')
	const fileContents = JSON.stringify(obj)

	writeFileSync(filePath, fileContents)
}

main()
