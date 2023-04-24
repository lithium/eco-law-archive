const Handlebars = require("handlebars");
const fs = require('fs-extra')
const path = require('path')


class TemplateEngine {
	constructor(options) {
		this.template_dir = options.template_dir;
		this.output_dir = options.output_dir;
	}

	render(template_name, context) {
		const template_path = path.join(this.template_dir, template_name)
		const template_txt = (fs.readFileSync(template_path)).toString()

		const template = Handlebars.compile(template_txt)
		const rendered = template(context)
		return rendered
	}	
	render_to(template_name, output_name, context) {
		const rendered = this.render(template_name, context)

		const output_path = path.join(this.output_dir, output_name)
		console.log("Writing output", output_path)
		fs.ensureDirSync(path.dirname(output_path))
		fs.writeFileSync(output_path, rendered.toString())
	}

}

module.exports = TemplateEngine