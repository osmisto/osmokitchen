
App.IdeasFilter = Backbone.View.extend({
	tagName: 'div',
	className: 'span10',
	collapsedTemplate: _.template($('#ideas-filter-template-collapsed').html()),
	expandedTemplate: _.template($('#ideas-filter-template-expanded').html()),
	collapsed: true,

	events: {
		'click .toggle': 'toggleState',
		'click [data-sort]': 'toggleSort',
		'click [data-filter]': 'toggleFilter',
		'click [data-perpage]': 'togglePerPage'
	},

	initialize: function(target) {
		this.target = target;
	},

	render: function() {
		this.render_expanded();

		this.$el.prepend(this.collapsedTemplate({
			collapsed: this.collapsed,
			filtersSummary: this.buildFiltersSummary(),
			sortSummary: this.buildSortSummary()
		}));

		return this;
	},

	render_expanded: function() {
		var self = this;
		self.$el.html(self.expandedTemplate({
			collapsed: this.collapsed
		}));

		// Order by
		var $cur_sort = self.$('[data-sort="' + self.target.order_by + '"]');
		$cur_sort.parent().addClass('active');
		$cur_sort.append(this.target.order_asc ? ' ↑' : ' ↓');

		// Filters
		self.target.filters.each(function(filter) {
			self.$('[data-filter="' + filter + '"]').parent().addClass('active');
		});

		// Per page
		self.$('[data-perpage="' + self.target.per_page + '"]').parent().addClass('active');
	},

	toggleState: function() {
		this.collapsed = !this.collapsed;
		this.render();
		return false;
	},

	toggleSort: function(e) {
		var order_by = $(e.currentTarget).attr('data-sort');
		// Toggle or switch to another sort method
		if (order_by === this.target.order_by) {
			this.target.order_asc = !this.target.order_asc;
		} else {
			this.target.order_by = order_by;
		}
		this.target.fetch();
		return false;
	},
	toggleFilter: function(e) {
		var self = this;
		var $el = $(e.currentTarget);
		// Toggle clicked one
		self.target.filters.toggle($el.attr('data-filter'));
		// Disable all others in this group
		$el.parent().siblings().each(function(index, el) {
			self.target.filters.disable($(el).children().attr('data-filter'));
		});
		this.target.fetch();
		return false;
	},
	togglePerPage: function(e) {
		this.target.per_page = $(e.currentTarget).attr('data-perpage');
		this.target.fetch();
		return false;
	},

	buildFiltersSummary: function() {
		var list = [];
		this.target.filters.each(function(filter) {
			list.push(this.$('[data-filter="' + filter + '"]').text());
		});
		return list.join(', ');
	},

	buildSortSummary: function() {
		var order_by = this.target.order_by;
		var order_asc = this.target.order_asc;
		var res = this.$('[data-sort="' + order_by + '"]').text();
		return res;
	}
});
