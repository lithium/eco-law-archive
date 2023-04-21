
const Handlebars = require("handlebars");
const fs = require('fs')
const path = require('path')

//const template = Handlebars.compile("Name: {{name}}");
// console.log(template({ name: "Nils" }));
// console.log(process.argv)


async function main() {
	const archive_path = "archive"
	const output_path = "build"

	const archive_context = await read_collections(archive_path)
	console.log(archive_context)
}

async function read_collections(archive_path) {
	/*
	 given toplevel archive_path assume following directory structure
	  
	     <archive_path>/<collection>/<set>/*.json

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
		const collection = {
			name: collection_entry.name,
			sets: []
		}

		const collection_path = path.join(archive_path, collection_entry.name)
		const collection_dir = await fs.promises.opendir(collection_path)
		for await (const set_entry of collection_dir) {
			const set_path = path.join(collection_path, set_entry.name)

			const set = await read_civics_directory(set_path)
			set.name = set_entry.name
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
		const civics_txt = await fs.promises.readFile(entry_path)
		const civics_obj = JSON.parse(civics_txt)

		const type = civics_obj.type
		if (!(type in output)) {
			output[type] = []
		}

		output[type].push(civics_obj)
	}
	return output;
}

(async () => {
	const result = await main()
})();

