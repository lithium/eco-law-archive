
const fs = require('fs-extra')
const path = require('path')

async function scan_directory(archive_path) {
	/*
	 given toplevel archive_path assume following directory structure
	  
	     <archive_path>/<collection>/<set>/*.json

  	 assumes json exported with the EcoCivicsImportExportMod

	 Returns: [
	 	{
			name: "collection1",
			sets: [
				{
					name: "set1",
			       'Eco.Gameplay.Civics.Constitution': [...], 
			    },
			    ...
			]
	    },
	    ...
	 ]

	*/
	const output = []

	const archive_dir = await fs.promises.opendir(archive_path)
	for await (const collection_entry of archive_dir) {
		const collection_path = path.join(archive_path, collection_entry.name)
		console.log("Scanning collection", collection_path)

		const collection = {
			name: collection_entry.name,
			sets: []
		}
		const collection_dir = await fs.promises.opendir(collection_path)
		for await (const set_entry of collection_dir) {
			const set_path = path.join(collection_path, set_entry.name)
			console.log("Scanning set", set_path)

			const set = await read_civics_directory(set_path)
			set.name = set_entry.name
			set.collection_name = collection.name
			collection.sets.push(set)
		}
		output.push(collection)
	}

	return output
}

async function read_civics_directory(directory_path) {
	const output = {}
	const dir = await fs.promises.opendir(directory_path)

	for await (const entry of dir) {
		entry_path = path.join(directory_path, entry.name)
		console.log("Scanning json", entry_path)

		const civics_txt = await fs.promises.readFile(entry_path)
		const civics_obj = JSON.parse(civics_txt)

		civics_obj['filename'] = entry_path
		const type = civics_obj.type.split('.').pop()
		if (!(type in output)) {
			output[type] = []
		}

		output[type].push(civics_obj)
	}
	return output;
}


module.exports = {
	scan_directory
}