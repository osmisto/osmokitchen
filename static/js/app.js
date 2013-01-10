window.App = {};

App.viewHelpers = {
    humanTime: function(time_str) {
        var date = new Date(time_str);
        var now = new Date();
        var diff = this.getTimeDifference(date, now);
        var short = '?';

        if (diff.days > 4) {
            if (date.getFullYear() !== now.getFullYear()) {
                short = this.formatTime('dd mm yyyy', date);
            } else {
                short = this.formatTime('dd mm', date);
            }
        } else if (diff.days > 1) {
            short = diff.days + ' дня назад';
        } else if (diff.days == 1) {
            short = 'вчера';
        } else if (diff.minutes > 0) {
            short = diff.minutes + ' м. назад';
        } else if (diff.seconds > 5) {
            short = diff.seconds + ' с. назад';
        } else {
            short = 'только что';
        }
        return '<abbr title="' + date.toLocaleString() + '">' + short + '</abbr>';
    },

    getTimeDifference: function(earlierDate,laterDate) {
       var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
       var oDiff = {};
       oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);

       nTotalDiff -= oDiff.days*1000*60*60*24;
       oDiff.hours = Math.floor(nTotalDiff/1000/60/60);

       nTotalDiff -= oDiff.hours*1000*60*60;
       oDiff.minutes = Math.floor(nTotalDiff/1000/60);

       nTotalDiff -= oDiff.minutes*1000*60;
       oDiff.seconds = Math.floor(nTotalDiff/1000);
       return oDiff;
    },

    formatTime: function(format, date) {
        return '123';
    }

};


App.eventsHub = _.extend({}, Backbone.Events);

App.eventsHub.on('domchange:title', function(title) {
    $(document).attr('title', title + ' - OsmoKitchen');
}, this);


$(function() {
    App.router = new App.Router();
    App.me = App.currentUser = new App.CurrentUser(App.currrentUserDefaults);
    App.myVotes = App.currentUserVotes = new App.CurrentUserVotes();
    App.currentUserVotes.fetch();

    App.navbar = new App.NavBar();
    App.infobox = new App.Infobox();

    App.tags = new App.Tags();
    App.tags.fetch();

    // Analytics
    App.analytics = new App.Analytics({
        trace: true
    });

    if (piwikTracker) {
        App.piwik = new App.PiwikAnalytics({
            tracker: piwikTracker,
            goals: {
                newUser: 1,
                newIdea: 2,
                vote: 3,
                publishIdea: 4
            }
        });
    }

    Backbone.history.start();
});
