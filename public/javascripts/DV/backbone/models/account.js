DV.backbone.model.Account = Backbone.Model.extend({
  className  : 'account',

  GRAVATAR_BASE: (location.protocol == 'file:' ? 'http:' : location.protocol) + (location.protocol == 'https:' ? '//secure.' : '//www.') + 'gravatar.com/avatar/',

  //DEFAULT_AVATAR: (location.protocol == 'file:' ? 'http:' : location.protocol) + '//' + location.host + '/images/embed/icons/user_blue_32.png',

  defaults: { first_name: 'Anonymous', last_name:'Commenter' },

  gravatarUrl: function(size) {
    var hash = this.get('hashed_email');
    //var fallback = encodeURIComponent(this.DEFAULT_AVATAR);
    return this.GRAVATAR_BASE + hash + '.jpg?s=' + size;// + '&d=' + fallback;
  },
  
  fullName: function() {
    return this.get('first_name') + ' ' + this.get('last_name');
  }
});
