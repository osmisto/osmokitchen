
App.Template = Backbone.Model.extend({
    urlRoot: '/templates',

    defaults: function() {
        return {
            id: undefined,
            author_nick: App.me.get('nick'),
            author_key: App.me.get('id'),
            created_at: new Date().toString(),
            updated_at: new Date().toString(),
            category: '',
            name: '',
            description: '',
            subject: '',
            body: '',
            short: '',
            tags: [],
            changelog: []
        };
    },

    initialize: function(options) {
        options = options || {};
        if (options.type)
            this.set('type', options.type);
    }

});

App.Templates = Backbone.Collection.extend({
    model: App.Template,
    url: '/templates'
});
