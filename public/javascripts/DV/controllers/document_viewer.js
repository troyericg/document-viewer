DV.DocumentViewer = function(options) {
  this.options        = options;
  this.window         = window;
  this.$              = this.jQuery;
  this.schema         = new DV.Schema();              // derp. should be done away with. Data should be held in models.
  this.api            = new DV.Api(this);             // unclear whether this should retain its own namespace in this manner.
  this.history        = new DV.History(this);         // replace with Backbone.History

  // Build the data models
  this.models     = this.schema.models;               // These aren't models proper, but some messy mix of controller/view functionality.
  this.events     = _.extend({}, DV.Schema.events);   // 
  this.helpers    = _.extend({}, DV.Schema.helpers);  // 
  this.states     = _.extend({}, DV.Schema.states);   // Where most of the magic happens. See DocumentViewer.prototype.open

  // state values
  this.isFocus            = true;
  this.openEditor         = null;
  this.confirmStateChange = null;
  this.activeElement      = null;
  this.observers          = [];
  this.windowDimensions   = {};
  this.scrollPosition     = null;
  this.checkTimer         = {};
  this.busy               = false;
  this.annotationToLoadId = null;
  this.dragReporter       = null;
  this.compiled           = {};
  this.tracker            = {};

  this.onStateChangeCallbacks = [];

  this.events     = _.extend(this.events, {
    viewer      : this,
    states      : this.states,
    elements    : this.elements,
    helpers     : this.helpers,
    models      : this.models,
    // this allows us to bind events to call the method corresponding to the current state
    compile     : function(){
      var viewer      = this.viewer;
      var methodName  = arguments[0];
      return function(){
        if(!viewer.events[viewer.state][methodName]){
          viewer.events[methodName].apply(viewer.events,arguments);
        }else{
          viewer.events[viewer.state][methodName].apply(viewer.events,arguments);
        }
      };
    }
  });

  // Extend helpers with viewer references to provide 
  // access to viewer internals in the helper namespace.
  this.helpers  = _.extend(this.helpers, {
    viewer      : this,
    states      : this.states,
    elements    : this.elements,
    events      : this.events,
    models      : this.models
  });

  // Viewer references for everyone!
  this.states   = _.extend(this.states, {
    viewer      : this,
    helpers     : this.helpers,
    elements    : this.elements,
    events      : this.events,
    models      : this.models
  });
};

DV.DocumentViewer.prototype.loadModels = function() {
  this.models.chapters     = new DV.model.Chapters(this);
  this.models.document     = new DV.model.Document(this);
  this.models.pages        = new DV.model.Pages(this);
  this.models.annotations  = new DV.model.Annotations(this);
  this.models.removedPages = {};
};

// Transition to a given state ... unless we're already in it.
DV.DocumentViewer.prototype.open = function(state) {
  if (this.state == state) return;
  var continuation = _.bind(function() {
    this.state = state;
    this.states[state].apply(this, arguments);
    this.slapIE();
    this.notifyChangedState();
    return true;
  }, this);
  this.confirmStateChange ? this.confirmStateChange(continuation) : continuation();
};

DV.DocumentViewer.prototype.slapIE = function() {
  DV.jQuery(this.options.container).css({zoom: 0.99}).css({zoom: 1});
};

DV.DocumentViewer.prototype.notifyChangedState = function() {
  _.each(this.onStateChangeCallbacks, function(c) { c(); });
};

// Record a hit on this document viewer.
DV.DocumentViewer.prototype.recordHit = function(hitUrl) {
  var loc = window.location;
  var url = loc.protocol + '//' + loc.host + loc.pathname;
  if (url.match(/^file:/)) return false;
  url = url.replace(/[\/]+$/, '');
  var id   = parseInt(this.api.getId(), 10);
  var key  = encodeURIComponent('document:' + id + ':' + url);
  DV.jQuery(document.body).append('<img alt="" width="1" height="1" src="' + hitUrl + '?key=' + key + '" />');
};

// jQuery object, scoped to this viewer's container.
DV.DocumentViewer.prototype.jQuery = function(selector, context) {
  context = context || this.options.container;
  return DV.jQuery.call(DV.jQuery, selector, context);
};

// The origin function, kicking off the entire documentViewer render.
DV.load = function(documentRep, options) {
  options = options || {};
  var id  = documentRep.id || documentRep.match(/([^\/]+)(\.js|\.json)$/)[1];
  if ('showSidebar' in options) options.sidebar = options.showSidebar;
  var defaults = {
    container : document.body,
    zoom      : 'auto',
    sidebar   : true
  };
  options            = _.extend({}, defaults, options);
  options.fixedSize  = !!(options.width || options.height);
  var viewer         = new DV.DocumentViewer(options);
  DV.viewers[id]     = viewer;
  // Once we have the JSON representation in-hand, finish loading the viewer.
  var continueLoad = DV.loadJSON = function(json) {
    var viewer = DV.viewers[json.id];
    viewer.schema.importCanonicalDocument(json);
    viewer.loadModels();
    DV.jQuery(function() {
      viewer.open('InitialLoad');
      if (options.afterLoad) options.afterLoad(viewer);
      if (DV.afterLoad) DV.afterLoad(viewer);
      if (DV.recordHit) viewer.recordHit(DV.recordHit);
    });
  };

  // If we've been passed the JSON directly, we can go ahead,
  // otherwise make a JSONP request to fetch it.
  var jsonLoad = function() {
    if (_.isString(documentRep)) {
      if (documentRep.match(/\.js$/)) {
        DV.jQuery.getScript(documentRep);
      } else {
        var crossDomain = viewer.helpers.isCrossDomain(documentRep);
        if (crossDomain) documentRep = documentRep + '?callback=?';
        DV.jQuery.getJSON(documentRep, continueLoad);
      }
    } else {
      continueLoad(documentRep);
    }
  };

  // If we're being asked the fetch the templates, load them remotely before
  // continuing.
  if (options.templates) {
    DV.jQuery.getScript(options.templates, jsonLoad);
  } else {
    jsonLoad();
  }

  return viewer;
};

// If the document viewer has been loaded dynamically, allow the external
// script to specify the onLoad behavior.
if (DV.onload) _.defer(DV.onload);

// New Viewer

DV.DocumentViewer = DV.Backbone.View.extend({
  // Instance Properties
  
  initialize: function(options) {
    this.confirmStateChange = null;
    
    this.options  = options;
    this.state    = new DV.model.ViewerState({viewer: this});

    // Legacy components to be refactored
    // this.events   = _.extend({}, DV.Schema.events);
    this.helpers  = _.extend({}, DV.Schema.helpers);
    this.api      = new DV.Api(this);
    
    // Extend helpers with viewer references to provide 
    // access to viewer internals in the helper namespace.
    this.helpers  = _.extend(this.helpers, {
      viewer      : this,
      states      : this.states,
      //elements    : this.elements,
      //events      : this.events,
    });
  },
  // transition between viewer states.
  open: function(state) {
    if (this.state.name == state) return;
    var continuation = _.bind( function() { this.state.transitionTo(state); return true; }, this );
    this.confirmStateChange ? this.confirmStateChange(continuation) : continuation();
  },
  slapIE: function(){ this.$el.css({zoom: 0.99}).css({zoom: 1}); },
  recordHit: function(hitUrl){ // pulled wholesale
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + loc.pathname;
    if (url.match(/^file:/)) return false;
    url = url.replace(/[\/]+$/, '');
    var id   = parseInt(this.api.getId(), 10);
    var key  = encodeURIComponent('document:' + id + ':' + url);
    DV.jQuery(document.body).append('<img alt="" width="1" height="1" src="' + hitUrl + '?key=' + key + '" />');
  }
});

// The origin function, kicking off the entire documentViewer render.
DV.load = function(documentRep, options) {
  options = options || {};
  var id  = documentRep.id || documentRep.match(/([^\/]+)(\.js|\.json)$/)[1];
  if ('showSidebar' in options) options.sidebar = options.showSidebar;
  var defaults = {
    container : document.body,
    zoom      : 'auto',
    sidebar   : true
  };
  options            = _.extend({}, defaults, options);
  options.fixedSize  = !!(options.width || options.height);
  var viewer         = new DV.DocumentViewer(options);
  DV.viewers[id]     = viewer;
  // Once we have the JSON representation in-hand, finish loading the viewer.
  var continueLoad = DV.loadJSON = function(json) {
    
    // Since we're retaining the existing loading mechanism
    // we'll load the models manually.
    var doc = new DV.model.Document(json);
    DV.documents.add(doc);

    // And set viewer's model to the document
    var viewer = DV.viewers[json.id];
    viewer.model = doc;
    
    //viewer.schema.importCanonicalDocument(json);
    //viewer.loadModels();
    DV.jQuery(function() {
      viewer.open('InitialLoad');
      if (options.afterLoad) options.afterLoad(viewer);
      if (DV.afterLoad) DV.afterLoad(viewer);
      if (DV.recordHit) viewer.recordHit(DV.recordHit);
    });
  };

  // If we've been passed the JSON directly, we can go ahead,
  // otherwise make a JSONP request to fetch it.
  var jsonLoad = function() {
    if (_.isString(documentRep)) {
      if (documentRep.match(/\.js$/)) {
        DV.jQuery.getScript(documentRep);
      } else {
        var crossDomain = viewer.helpers.isCrossDomain(documentRep);
        if (crossDomain) documentRep = documentRep + '?callback=?';
        DV.jQuery.getJSON(documentRep, continueLoad);
      }
    } else {
      continueLoad(documentRep);
    }
  };

  // If we're being asked the fetch the templates, load them remotely before
  // continuing.
  if (options.templates) {
    DV.jQuery.getScript(options.templates, jsonLoad);
  } else {
    jsonLoad();
  }

  return viewer;
};
