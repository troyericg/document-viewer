/* Todos:
  Tool Menu needs to listenTo DV.account for fetches, so that when record is populated, the docs are all made aware of it.
*/
DV.view.NoteToolMenu = DV.Backbone.View.extend({
  events: {
    'click .DV-button': 'openAnnotationEditor',
    'click .DV-login': 'login'
  },
  
  initialize: function(options) {
    this.viewer = options.viewer;
    this.listenTo(DV.account, 'change:id', this.renderLoginStatus, this);
  },
  
  render: function(){
    
  },
  
  renderLoginStatus: function(){
    var loginEl = this.$('.DV-accountBug');
    loginEl.html('<span class="DV-login">signed in as '+ DV.account.fullName() +'</span> <span class="DV-logout">(Logout)</span>');
  },
  
  openAnnotationEditor: function(e) {
    console.log("click", e);
    if (DV.account.id) {
      this.viewer.noteEditor.toggle('public');
    } else {
      this.login();
    }
  },
    
  login: function() { this.viewer.loginManager.login(); }
});