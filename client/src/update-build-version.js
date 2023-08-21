import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { env } from 'process'

const main = () => {
	let gitCommitHash = env.BUILD_VERSION

	const obj = {
		gitCommitHash
	}

	const filePath = resolve('src', 'build-version.json')
	const fileContents = JSON.stringify(obj, null, 2)

	writeFileSync(filePath, fileContents)
}

main()
