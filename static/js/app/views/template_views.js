
App.TemplatesAdmin = Backbone.View.extend({
	tagName: 'div',
	className: 'container',
	template: _.template($('#template-admin-template').html()),
	collection: new App.Templates(),
	type: 'idea',

	events: {
		'click .btn-create': 'create',
		'click .btn-remove': 'remove'
	},

	initialize: function(options) {
		this.list = new App.TemplateNavList({
			collection: this.collection,
			current: options.current
		});
		this.listenTo(this.list, 'select', this.select, this);
		this.collection.fetch();
		this.render();

		if (options.create) {
			this.list.once('select', this.create, this);
		}

		$('#content').html(this.el);
	},

	render: function() {
		this.$el.html(this.template());
		this.list.render();
		this.$('#list .btn-remove').addClass('disabled');

		this.$('#list').append(this.list.el);
	},

	cleanupCurrent: function() {
		this.info = undefined;
		this.edit = undefined;
		this.current = undefined;
		this.$('#edit').empty();
		this.$('#side').empty();
		this.$('#list .btn-remove')
			.addClass('disabled')
			.removeClass('btn-danger');
	},

	select: function(model) {
		this.cleanupCurrent();
		if (typeof(model) === 'undefined') return;

		if (typeof(model.id) !== 'undefined') {
			this.$('#list .btn-remove').removeClass('disabled');
			Backbone.history.navigate('#admin/templates/' + model.id);
		}

		if (model.get('removed'))
			this.$('#list .btn-remove').addClass('btn-danger');

		this.current = model;
		this.info = new App.TemplateInfo({model: this.current});
		this.$('#side').append(this.info.el);
		this.edit = new App.TemplateEdit({model: this.current});
		this.$('#edit').html(this.edit.el);

	},

	create: function() {
		var self = this;
		this.list.current = undefined;
		this.list.render();

		var newModel = new App.Template({type: this.type});
		this.select(newModel);

		Backbone.history.navigate('#admin/templates/new');
	},

	remove: function() {
		var self = this;
		if (!this.current) return;
		this.current.save({removed: !this.current.get('removed')}, {
			success: function() {
				self.select(self.current);
			}
		});
		return false;
	}

});


App.TemplateNavList = Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	categoryTemplate: _.template($('#template-listcategory-template').html()),
	itemTemplate: _.template($('#template-listitem-template').html()),

	events: {
		'click a': 'click'
	},

	initialize: function(options) {
		this.collection = options.collection;
		this.current = options.current;
		this.listenTo(this.collection, 'reset change', this.render, this);
		this.listenTo(this.collection, 'reset', this.select, this);
	},

	render: function() {
		var byCategory = {};
		var self = this;
		self.$el.empty();

		this.collection.each(function(item) {
			var category = item.get('category');
			byCategory[category] = byCategory[category] || [];
			byCategory[category].push(item);
		});

		_(byCategory).each(function(list, category) {
			self.$el.append(self.categoryTemplate({category: category}));
			_(list).each(function(item) {
				var data = item.toJSON();
				data._selected = self.current == data.id;
				self.$el.append(self.itemTemplate(data));
			});
		});
		this.delegateEvents();
	},

	click: function(e) {
		this.current =  $(e.currentTarget).attr('data-template');
		this.select();
		this.render();
		return false;
	},

	select: function() {
		this.trigger('select', this.collection.get(this.current), this.current);
	}
});


App.TemplateInfo =  Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list sideinfo',
	template: _.template($('#template-sideinfo-template').html()),

	initialize: function(options) {
		this.model = options.model;
		this.model.on('change sync', this.render, this);
		this.render();
	},

	render: function(options) {
		var data = this.model.toJSON();
		_.extend(data, App.viewHelpers);
		this.$el.html(this.template(data));
	}
});

App.TemplateEdit = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#template-edit-template').html()),

	events: {
		'click .btn-save': 'save',
		'click .btn-cancel': 'reset',
		'keyup': 'handleHotkey'
	},

	initialize: function(options) {
		this.model = options.model;
		this.model.on('change sync', this.render, this);
		this.render();
	},

	render: function(options) {
		var data = this.model.toJSON();
		this.$el.html(this.template(data));
	},

	save: function() {
		var self = this;
		var isNew = this.model.isNew();
		var dict = this.parseForm();
		this.model.save(dict, {
			success: function(model) {
				if (!isNew) return;
				Backbone.history.navigate('#admin/templates/' + model.id, {trigger: true});
			}
		});
		return false;
	},

	reset: function() {
		if (this.model.isNew()) {
			Backbone.history.navigate('#admin/templates', {trigger: true});
		} else {
			this.render();
		}
		return false;
	},

	parseForm: function() {
		var dict = {};
		var fields = this.$('form').serializeArray();
		_(fields).each(function(elem) {
			dict[elem['name']] = elem['value'];
		});
		return dict;
	},

	handleHotkey: function(e) {
		if (e.ctrlKey && e.keyCode == 13) {
			this.save();
		}
	}
});
