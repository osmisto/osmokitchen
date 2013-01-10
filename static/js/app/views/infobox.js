
App.Infobox = Backbone.View.extend({
	el: $('#infobox'),
	messageTemplate: _.template($('#message-template').html()),

	initialize: function() {
		var self = this;
		$('body').ajaxError(function(event, xhr, settings, error) {
			self.showError('Error in: ' + settings.url + ': ' + error);
		});
	},

	showAlert: function(body, type) {
		this.$el.append(this.messageTemplate({
			body: body,
			cls: 'alert-' + type
		}));
	},

	showSuccess: function(body) {
		this.showAlert(body, 'success');
	},

	showError: function(body) {
		this.showAlert(body, 'error');
	}
});
