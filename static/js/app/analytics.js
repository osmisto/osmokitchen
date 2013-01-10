
App.Analytics = function(options) {
	this.initialize.apply(this, arguments);
};
_.extend(App.Analytics.prototype, Backbone.Events, {

	initialize: function(options) {
		// this.listenTo(App.router, 'all', this.route, this);
		this.listenTo(App.me, 'login', this.meLogin, this);
		this.listenTo(App.me, 'logout', this.meLogout, this);
		this.listenTo(App.eventsHub, 'domchange:title', this.titleUpdate, this);

		if (options.trace) {
			this.on('all', this.trace, this);
		}
	},

	trace: function(event) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		console.log('[analytics] ' + event + ' :', args);
	},

	// route: function() {
	// 	var args = Array.prototype.slice.call(arguments);
	// 	args[0] = args[0].replace('route:', '');

	// 	if (args[0] === 'doSearch') {
	// 		var query = args[1];
	// 		this.trigger('search', query);
	// 	} else if (args[0] === 'createIdea') {
	// 		var model = args[1];
	// 		this.trigger('newIdea', model);
	// 	} else {
	// 		this.trigger('pageChange', args.join('/'));
	// 	}
	// },

	titleUpdate: function(title) {
		this.trigger('pageChange', title);
	},

	meLogin: function(model, response) {
		if (response.new_user)
			this.trigger('register', model);

		this.trigger('login', model);
	},

	meLogout: function(model, response) {
		this.trigger('logout', model);
	}
});


App.PiwikAnalytics = function(options) {
	this.initialize.apply(this, arguments);
};
_.extend(App.PiwikAnalytics.prototype, Backbone.Events, {

	initialize: function(options) {
		_(this).extend(options);

		App.analytics.on('pageChange', this.pageChange, this);
		App.analytics.on('search', this.search, this);
		App.analytics.on('register', this.register, this);
		App.analytics.on('newIdea', this.newIdea, this);
	},

	pageChange: function(title) {
		this.tracker.setCustomVariable(1, 'role', App.me.get('role'), 'visit');
		this.tracker.setCustomUrl(document.location.href);
		this.tracker.trackPageView(title);
	},

	search: function(query) {
		this.tracker.trackSiteSearch(query, false, 100);
	},

	register: function(model) {
		if (this.goals.newUser)
			this.tracker.trackGoal(this.goals.newUser);

	},

	newIdea: function(model) {
		if (this.goals.newIdea)
			this.tracker.trackGoal(this.goals.newIdea);

	}
});
