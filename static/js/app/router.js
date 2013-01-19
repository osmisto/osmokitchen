
App.Router = Backbone.Router.extend({
	current: undefined,

	routes: {
		"" : "showHome",
		"ideas" : "listIdeas",
		"ideas/new" : "createIdea",
		"ideas/:id" : "viewIdea",
		"ideas/:id/*parts" : "viewIdea",
		"projects": "listProjects",
		"doc/:topic": "showDoc",
		"search/:querty": "doSearch",
		"admin/users": "adminUsers",
		"admin/templates": "adminTemplates",
		"admin/templates/:id": "adminTemplates",
		"user/:id": "showUser"
	},

	cleanupCurrent: function() {
		if (typeof this.current === 'undefined') return;
		this.current.remove();
		this.current = undefined;
	},

	showHome: function() {
		this.cleanupCurrent();
		this.current = new App.UnderConstruction({title: 'Home'});
	},

	/**
	 * Ideas controllers
	 */
	listIdeas: function() {
		this.cleanupCurrent();
		this.current = new App.IdeasList({collection: new App.Ideas()});
	},

	createIdea: function() {
		this.cleanupCurrent();
		this.current = new App.IdeaWizard();
	},

	viewIdea: function(id, parts) {
		this.cleanupCurrent();
		this.current = new App.IdeaView({
			model: new App.Idea({id: id}),
			route: parts
		});
	},

	editIdea: function(id) {
		this.cleanupCurrent();
		this.current = new App.IdeaEdit({model: new App.Idea({id: id})});
	},

	/**
	 * Projects controllers
	 */
	listProjects: function() {
		this.cleanupCurrent();
		this.current = new App.UnderConstruction({title: 'Projects'});
	},

	/**
	 * Documentation viewer
	 */
	showDoc: function(topic) {
		this.cleanupCurrent();
		this.current = new App.UnderConstruction({title: 'Documentation'});
	},

	doSearch: function(query) {
		this.cleanupCurrent();
		query = decodeURIComponent(query);
		this.current = new App.UnderConstruction({title: 'Search: ' + query});
	},

	adminUsers: function() {
		this.cleanupCurrent();
		this.current = new App.UnderConstruction({title: 'Users'});
	},

	adminTemplates: function(id) {
		this.cleanupCurrent();
		this.current = new App.TemplatesAdmin({
			current: id === 'new' ? undefined : id,
			create: id === 'new' ? true : false
		});
	},

	showUser: function(id) {
		this.cleanupCurrent();
		this.current = new App.UnderConstruction({title: 'User ' + id});
	}
});

