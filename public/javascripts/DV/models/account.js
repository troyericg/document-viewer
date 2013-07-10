// Account Model

DV.model.Account = DV.Backbone.Model.extend({
  GRAVATAR_BASE      : location.protocol + (location.protocol == 'https:' ? '//secure.' : '//www.') + 'gravatar.com/avatar/',

  DEFAULT_AVATAR     : location.protocol + '//' + location.host + '/images/embed/icons/user_blue_32.png',

  defaults           : { first_name : '', last_name : '', email : '' },
  
  ownsOrOrganization: function(model) {  },

  fullName : function(nonbreaking) {
    var name = this.get('first_name') + ' ' + this.get('last_name');
    return nonbreaking ? name.replace(/\s/g, '&nbsp;') : name;
  },

  gravatarUrl : function(size) {
    var hash = this.get('hashed_email');
    var fallback = encodeURIComponent(this.DEFAULT_AVATAR);
    return this.GRAVATAR_BASE + hash + '.jpg?s=' + size + '&d=' + fallback;
  }
});
