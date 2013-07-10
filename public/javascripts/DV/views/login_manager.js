/*
  Todos:
    needs to update DV.account after login.
*/
DV.view.LoginManager = DV.Backbone.View.extend({
  events: {
    'click .close': 'close'
  },
  
  initialize: function(options) {
    this.viewer = options.viewer;
    this.model = (options.model || DV.account);
    this.listenTo(this.model, 'change:id', this.setAccountStatus);
  },
  
  render: function(){
    this._socket = new DV.RemoteSocket(this);
  },
  
  login: function() {
    this.$el.show();
    this._socket.login();
  },
  
  close: function() {
    this.$el.hide();
  },
  
  logout: function() {
    this._socket.logout();
  },
  
  setAccountStatus: function() {
    this.viewer.$el.addClass('DV-isOwner');
  }
});