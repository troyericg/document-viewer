// this should probably be merged into LoginManager
(function(window, document, $, undefined) {
  function RemoteSocket(view) {
    this.view       = view
    this.viewer     = view.viewer;
    this.document   = this.viewer.model;
    var me          = this;
    
    this._socket = new DV.easyXDM.Rpc({
      remote: 'https://' + this.document.canonical_host() + '/auth/iframe',
      container: this.view.$('.frame')[0]
    }, {
      remote: {
        loadLoginStartingPage:{}, // Loads the initial login page into the remote iframe
        getRemoteData:{},         // attempts to determine if the account is logged in and gets it's data
        logout:{}
      },
      local: {
        // this desperately needs to be rewritten into a custom sync method.
        loggedInStatus: function( resp ){
          var account_data = resp.data.account;
          DV.account.set( account_data );
          DV.account.trigger("logged_in");
        }
      }
    });

  };
  
  _.extend(RemoteSocket.prototype, {
    logout: function(){
      this._socket.logout( this.document.id );
    },
    login: function (){
      this._socket.loadLoginStartingPage( this.document.id );
    }
  });

  DV.RemoteSocket = RemoteSocket;
})(window, document, jQuery);
