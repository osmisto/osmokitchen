
App.Vote = Backbone.Model.extend({
	urlRoot: '/votes',
	defaults: {
		body: '',
		cache: 0
	}
});

App.IdeaVotes = Backbone.Collection.extend({
	model: App.Vote,

	initialize: function(options) {
		this.idea = options.idea;
		this.url = '/ideas/' + this.idea.id + "/votes";
	}
});
