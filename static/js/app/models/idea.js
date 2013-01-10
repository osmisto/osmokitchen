/**
 * Model section
 */

App.Idea = Backbone.Model.extend({
	urlRoot: '/ideas',

	initialize: function() {
		App.currentUserVotes.on('reset change destroy', this.updateCuVote, this);
		//App.currentUserVotes.on('all', function() { console.log(arguments); }, this);
		//this.on('all', function() {console.log(arguments);}, this);
		this.on('change:cache change:goal', this.updateShortCaches, this);
		this.updateCuVote();
		this.updateShortCaches();
	},

	updateCuVote: function() {
		this.cuVote = App.currentUserVotes.getVote(this);
		this.set({
			'cuVoted': typeof this.cuVote !== 'undefined',
			'cuVoteCache': this.cuVote ? this.cuVote.get('cache') : 0
		});
	},

	updateShortCaches: function() {
		this.set({
			short_cache: this.shortenCache(this.get('cache')),
			short_goal: this.shortenCache(this.get('goal'))
		}, {silent: true});
	},

	shortenCache: function(cache) {
		var limits = [
			[1000, ''],
			[1000000, 'K'],
			[1000000000, 'M'],
			[1000000000000, 'G']
		];

		for (var idx in limits) {
			var limit = limits[idx][0];
			var suffix = limits[idx][1];

			if (cache >= limit) continue;
			var str =  (cache / (limit / 1000)).toPrecision(3);
			str = str.replace(/0+$/, '').replace(/\.$/, '');
			return str + suffix;
		}
		return "BOOM!";
	}
});

App.Ideas = Backbone.Collection.extend({
	model: App.Idea,
	order_by:  'votes',
	order_asc: true,
	per_page: 25,
	page: 1,
	filters: new ToggableList(['opened']),
	filterTags: new ToggableList([]),
	tagsCollection: new App.Tags(),

	url: function() {
		return '/ideas?' + $.param({
			order_by: this.order_by,
			order_asc: this.order_asc ? 't' : '',
			filters: this.filters.all().join(' '),
			tags: this.filterTags.all().join(' '),
			per_page: this.per_page,
			page: this.page
		});
	},

	reset: function(answer, options) {
		Backbone.Collection.prototype.reset.apply(this, [answer.ideas, options]);
		this.tagsCollection.reset(answer.tags);
	}
});

function ToggableList(defaults) {
	this.list = {};
	for (var idx in defaults) {
		this.list[defaults[idx]] = true;
	}
}

ToggableList.prototype.all = function() {
	return _(this.list).keys();
};
ToggableList.prototype.each = function(callback) {
	_(this.all()).each(callback);
};
ToggableList.prototype.isOn = function(filter) {
	return this.list[filter];
};
ToggableList.prototype.toggle = function(filter) {
	return this.isOn(filter) ? this.disable(filter) : this.enable(filter);
};
ToggableList.prototype.disable = function(filter) {
	delete this.list[filter];
};
ToggableList.prototype.enable = function(filter) {
	this.list[filter] = true;
};
