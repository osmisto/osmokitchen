
App.CurrentUserVotes = Backbone.Collection.extend({
	url: '/current_user/votes',
	loading: false,

	initialize: function() {
		App.me.on('switch', this.reload, this);
	},

	reload: function() {
		this.loading = true;
		this.fetch();
	},

	getVote: function(idea) {
		if (idea.isNew()) return undefined;
		var id = idea.get('id');
		return App.currentUserVotes.filter(function(vote) {
			return vote.get('idea_key') === id;
		})[0];
	}
});

App.CurrentUser = Backbone.Model.extend({
	url: '/current_user',
	weights: {
		none: 0,
		guest: 5,
		member: 10,
		admin: 50,
		developer: 100,
		root: 1000
	},

	can: function(role, author) {
		var my_role = this.get('role');
		if (this.get('id') === author) return true;
		if (typeof my_role === 'undefined') return false;
		return this.weights[role] <= this.weights[my_role];
	},

	login: function(options) {
		var self = this;
		this.save({nick: options.nick}, {
			success: function(model, response) {
				self.trigger('switch login sync', model, response);
			}
		});
	},

	logout: function() {
		var self = this;
		this.save({id: null}, {
			success: function(model, response) {
				self.trigger('switch logout sync', model, response);
			}
		});
	}
});
