var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	name: String,
	description: String,
	html: String,
	variables: [{
		type: {
			type: String,
			enum: ['text', 'picture', 'widget']
		},
		code: String,
		isArray: Boolean,
		default: String
	}],
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	moderators: [{ type: mongoose.Schema.Types.ObjectId, sparse: true, ref: 'User' }]
});

Schema.methods.create = function (obj, user, sd) {
	this.author = user._id;
	this.moderators = [user._id];
	this.name = obj.name;
	this.description = obj.description;
	this.html = obj.html;
	this.variables = obj.variables;
}

module.exports = mongoose.model('Widget', Schema);
