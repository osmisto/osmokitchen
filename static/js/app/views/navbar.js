
App.NavBar = Backbone.View.extend({
	el: $("#navbar"),
	template: _.template($('#navbar-template').html()),
	loggedInTemplate: _.template($('#navbar-loggedin-template').html()),
	loggedOutTemplate: _.template($('#navbar-loggedout-template').html()),

	currentPlace: {route: '', args: []},

	events: {
		"click #login": "doLogin",
		"click #logout": "doLogout",
		"submit .navbar-search": "doSearch"
	},

	initialize: function() {
		App.me.on('change', this.render, this);
		Backbone.history.on('route', this.onRoute, this);
		this.render();
	},

	onRoute: function(source, route, args) {
		// Empty bad args
		if (route === 'doSearch')
			args = [];

		this.currentPlace = {route: route, args: args};
		this.render();
	},

	render: function() {
		var args = this.currentPlace.args;
		var route = this.currentPlace.route;

		this.$el.html(this.template);

		// Set active class for current place
		this.$('#' + route + '-link').addClass('active');

		if (args.length > 0) {
			var suffix = args.length > 0 ? '-' + args.join('_') + '-' : '';
			$('#' + route + suffix + '-link', this.$el).addClass('active');
		}

		if (route.match(/^admin/)) {
			$('#admin-link').addClass('active');
		}

		// Switch between sign in/logged in templates
		var template = App.currentUser.can('guest') ? this.loggedInTemplate
													: this.loggedOutTemplate;
		this.$('.container').append(template(App.currentUser.toJSON()));
	},

	doLogin: function() {
		var userId = $('#user-nick', this.$el).val();
		App.currentUser.login('osmostarter_' + userId);
		return false;
	},

	doLogout: function() {
		App.currentUser.logout();
		return false;
	},

	doSearch: function() {
		var query = this.$('.search-query').val();
		Backbone.history.navigate('#search/' + encodeURIComponent(query), {trigger: true});
		return false;
	}

});
