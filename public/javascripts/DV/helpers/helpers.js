// A potpourri of helper functions.

DV.Schema.helpers = {

    HOST_EXTRACTOR : (/https?:\/\/([^\/]+)\//),

    annotationClassName: '.DV-annotation',

    // Bind all events for the docviewer
    // live/delegate are the preferred methods of event attachment
    bindEvents: function(context){
      var viewer    = this.viewer;
      var doc       = context.models.document;

      //var boundZoom = this.events.compile('zoom');
      var boundZoom = viewer.state.delegatedEventFunction('zoom');
      var value     = _.indexOf(doc.ZOOM_RANGES, doc.zoomLevel);
      viewer.slider = viewer.$('.DV-zoomBox').slider({
        step: 1,
        min: 0,
        max: 4,
        value: value,
        slide:  function(el,d){ boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]); },
        change: function(el,d){ boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]); }
      });

      // next/previous
      var history          = viewer.history;
      var delegates        = viewer.state.delegated;
      delegates.next       = viewer.state.delegatedEventFunction('next');
      delegates.previous   = viewer.state.delegatedEventFunction('previous');

      var states = context.states;
      viewer.$('.DV-navControls').delegate('span.DV-next',    'click', delegates.next);
      viewer.$('.DV-navControls').delegate('span.DV-previous','click', delegates.previous);

      viewer.$('.DV-annotationView').delegate('.DV-trigger','click',function(e){ e.preventDefault(); context.open('ViewAnnotation'); });
      viewer.$('.DV-documentView').delegate(  '.DV-trigger',                   'click', function(e){ context.open('ViewDocument'); });
      viewer.$('.DV-thumbnailsView').delegate('.DV-trigger',                   'click', function(e){ context.open('ViewThumbnails'); });
      viewer.$('.DV-textView').delegate(      '.DV-trigger',                   'click', function(e){ context.open('ViewText'); });
      viewer.$('.DV-allAnnotations').delegate('.DV-annotationGoto .DV-trigger','click', DV.jQuery.proxy(this.gotoPage, this));

      viewer.$('form.DV-searchDocument').submit(viewer.state.delegatedEventFunction('search'));
      viewer.$('.DV-searchBar').delegate('.DV-closeSearch',           'click', function(e){ e.preventDefault(); context.open('ViewText'); });
      viewer.$('.DV-searchBox').delegate('.DV-searchInput-cancel',    'click', DV.jQuery.proxy(this.clearSearch, this));
      viewer.$('.DV-searchResults').delegate('span.DV-resultPrevious','click', DV.jQuery.proxy(this.highlightPreviousMatch, this));
      viewer.$('.DV-searchResults').delegate('span.DV-resultNext',    'click', DV.jQuery.proxy(this.highlightNextMatch, this));

      // Prevent navigation elements from being selectable when clicked.
      viewer.$('.DV-trigger').bind('selectstart', function(){ return false; });

      this.viewer.elements.viewer.delegate('.DV-fullscreen', 'click', _.bind(this.openFullScreen, this));

      var boundToggle  = DV.jQuery.proxy(this.annotationBridgeToggle, this);
      var collection   = this.viewer.elements.collection;

      
      collection.delegate('.DV-annotationTab',      'click', boundToggle);
      collection.delegate('.DV-annotationRegion',   'click', DV.jQuery.proxy(this.annotationBridgeShow, this));
      collection.delegate('.DV-annotationNext',     'click', DV.jQuery.proxy(this.annotationBridgeNext, this));
      collection.delegate('.DV-annotationPrevious', 'click', DV.jQuery.proxy(this.annotationBridgePrevious, this));
      collection.delegate('.DV-showEdit',           'click', DV.jQuery.proxy(this.showAnnotationEdit, this));
      collection.delegate('.DV-cancelEdit',         'click', DV.jQuery.proxy(this.cancelAnnotationEdit, this));
      collection.delegate('.DV-saveAnnotation',     'click', DV.jQuery.proxy(this.saveAnnotation, this));
      collection.delegate('.DV-saveAnnotationDraft','click', DV.jQuery.proxy(this.saveAnnotation, this));
      collection.delegate('.DV-deleteAnnotation',   'click', DV.jQuery.proxy(this.deleteAnnotation, this));
      collection.delegate('.DV-pageNumber',         'click', _.bind(this.permalinkPage, this, 'document'));
      collection.delegate('.DV-textCurrentPage',    'click', _.bind(this.permalinkPage, this, 'text'));
      collection.delegate('.DV-annotationTitle',    'click', _.bind(this.permalinkAnnotation, this));
      collection.delegate('.DV-permalink',          'click', _.bind(this.permalinkAnnotation, this));

      // Thumbnails
      viewer.$('.DV-thumbnails').delegate('.DV-thumbnail-page', 'click', function(e) {
        var $thumbnail = viewer.$(e.currentTarget);
        if (!viewer.openEditor) {
          var pageIndex = $thumbnail.closest('.DV-thumbnail').attr('data-pageNumber') - 1;
          viewer.models.document.setPageIndex(pageIndex);
          viewer.open('ViewDocument');
        }
      });

      // Handle iPad / iPhone scroll events...
      _.bindAll(this, 'touchStart', 'touchMove', 'touchEnd');
      this.viewer.elements.window[0].ontouchstart  = this.touchStart;
      this.viewer.elements.window[0].ontouchmove   = this.touchMove;
      this.viewer.elements.window[0].ontouchend    = this.touchEnd;
      this.viewer.elements.well[0].ontouchstart    = this.touchStart;
      this.viewer.elements.well[0].ontouchmove     = this.touchMove;
      this.viewer.elements.well[0].ontouchend      = this.touchEnd;

      viewer.$('.DV-descriptionToggle').live('click',function(e){
        e.preventDefault();
        e.stopPropagation();

        viewer.$('.DV-descriptionText').toggle();
        viewer.$('.DV-descriptionToggle').toggleClass('DV-showDescription');
      });

      var cleanUp = DV.jQuery.proxy(viewer.pageSet.cleanUp, this);

      this.viewer.elements.window.live('mousedown',
        function(e){
          var el = viewer.$(e.target);
          if (el.parents().is('.DV-annotation') || el.is('.DV-annotation')) return true;
          if(context.elements.window.hasClass('DV-coverVisible') && (el.width() - parseInt(e.clientX,10)) >= 15){ cleanUp(); }
        }
      );

      var docId = viewer.model.id;

      if(DV.jQuery.browser.msie == true){
        this.viewer.elements.browserDocument.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow,this));
        this.viewer.elements.browserDocument.bind('focusout.' + docId, DV.jQuery.proxy(this.focusOut,this));
      }else{
        this.viewer.elements.browserWindow.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow,this));
        this.viewer.elements.browserWindow.bind('blur.' + docId, DV.jQuery.proxy(this.blurWindow,this));
      }

      // When the document is scrolled, even in the background, resume polling.
      this.viewer.elements.window.bind('scroll.' + docId, DV.jQuery.proxy(this.focusWindow, this));

      this.viewer.elements.coverPages.live('mousedown', cleanUp);

      // Reference to the acceptInput jQuery extension for the currentPage input navigation box.
      viewer.acceptInput = this.viewer.elements.currentPage.acceptInput({ changeCallBack: DV.jQuery.proxy(this.acceptInputCallBack,this) });

    },

    // Unbind jQuery events that have been bound to objects outside of the viewer.
    unbindEvents: function() {
      var viewer = this.viewer;
      var docId = viewer.schema.document.id;
      if(DV.jQuery.browser.msie == true){
        this.viewer.elements.browserDocument.unbind('focus.' + docId);
        this.viewer.elements.browserDocument.unbind('focusout.' + docId);
      }else{
        viewer.helpers.elements.browserWindow.unbind('focus.' + docId);
        viewer.helpers.elements.browserWindow.unbind('blur.' + docId);
      }
      viewer.helpers.elements.browserWindow.unbind('scroll.' + docId);
      _.each(viewer.observers, function(obs){ viewer.helpers.removeObserver(obs); });
    },

    // We're entering the Notes tab -- make sure that there are no data-src
    // attributes remaining.
    ensureAnnotationImages : function() {
      this.viewer.$(".DV-img[data-src]").each(function() {
        var el = DV.jQuery(this);
        el.attr('src', el.attr('data-src'));
      });
    },

    startCheckTimer: function(){
      var _t = this.viewer.state.eventFunctions;
      var _check = function(){ _t.check(); };
      this.viewer.checkTimer = setInterval(_check,100);
    },

    stopCheckTimer: function(){
      clearInterval(this.viewer.checkTimer);
    },

    blurWindow: function(){
      if(this.viewer.isFocus === true){
        this.viewer.isFocus = false;
        // pause draw timer
        this.stopCheckTimer();
      }else{
        return;
      }
    },

    focusOut: function(){
      if(this.viewer.activeElement != document.activeElement){
        this.viewer.activeElement = document.activeElement;
        this.viewer.isFocus = true;
      }else{
        // pause draw timer
        this.viewer.isFocus = false;
        this.viewer.helpers.stopCheckTimer();
        return;
      }
    },

    focusWindow: function(){
      if(this.viewer.isFocus === true){
        return;
      }else{
        this.viewer.isFocus = true;
        // restart draw timer
        this.startCheckTimer();
      }
    },

    touchStart : function(e) {
      e.stopPropagation();
      e.preventDefault();
      var touch = e.changedTouches[0];
      this._moved  = false;
      this._touchX = touch.pageX;
      this._touchY = touch.pageY;
    },

    touchMove : function(e) {
      var el    = e.currentTarget;
      var touch = e.changedTouches[0];
      var xDiff = this._touchX - touch.pageX;
      var yDiff = this._touchY - touch.pageY;
      el.scrollLeft += xDiff;
      el.scrollTop  += yDiff;
      this._touchX  -= xDiff;
      this._touchY  -= yDiff;
      if (yDiff != 0 || xDiff != 0) this._moved = true;
    },

    touchEnd : function(e) {
      if (!this._moved) {
        var touch     = e.changedTouches[0];
        var target    = touch.target;
        var fakeClick = document.createEvent('MouseEvent');
        while (target.nodeType !== 1) target = target.parentNode;
        fakeClick.initMouseEvent('click', true, true, touch.view, 1,
          touch.screenX, touch.screenY, touch.clientX, touch.clientY,
          false, false, false, false, 0, null);
        target.dispatchEvent(fakeClick);
      }
      this._moved = false;
    },

    // Click to open a page's permalink.
    permalinkPage : function(mode, e) {
      if (mode == 'text') {
        var number  = this.viewer.models.document.currentPage();
      } else {
        var pageId  = this.viewer.$(e.target).closest('.DV-set').attr('data-id');
        var page    = this.viewer.pageSet.pages[pageId];
        var number  = page.pageNumber;
        this.jump(page.index);
      }
      this.viewer.history.save(mode + '/p' + number);
    },

    // Click to open an annotation's permalink.
    permalinkAnnotation : function(e) {
      var id   = this.viewer.$(e.target).closest('.DV-annotation').attr('data-id');
      var anno = this.viewer.models.annotations.getAnnotation(id);
      var sid  = anno.server_id || anno.id;
      if (this.viewer.state == 'ViewDocument') {
        this.viewer.pageSet.showAnnotation(anno);
        this.viewer.history.save('document/p' + anno.pageNumber + '/a' + sid);
      } else {
        this.viewer.history.save('annotation/a' + sid);
      }
    },

    setDocHeight:   function(height,diff) {
      this.viewer.elements.bar.css('height', height);
      this.viewer.elements.window[0].scrollTop += diff;
    },

    getWindowDimensions: function(){
      var d = {
        height: window.innerHeight ? window.innerHeight : this.viewer.elements.browserWindow.height(),
        width: this.viewer.elements.browserWindow.width()
      };
      return d;
    },

    // Is the given URL on a remote domain?
    isCrossDomain : function(url) {
      var match = url.match(this.HOST_EXTRACTOR);
      return match && (match[1] != window.location.host);
    },

    resetScrollState: function(){
      this.viewer.elements.window.scrollTop(0);
    },

    gotoPage: function(e){
      e.preventDefault();
      var aid           = this.viewer.$(e.target).parents('.DV-annotation').attr('rel').replace('aid-','');
      var annotation    = this.viewer.models.annotations.getAnnotation(aid);
      var viewer        = this.viewer;

      if(viewer.state !== 'ViewDocument'){
        this.viewer.models.document.setPageIndex(annotation.index);
        viewer.open('ViewDocument');
        // this.viewer.history.save('document/p'+(parseInt(annotation.index,10)+1));
      }
    },

    openFullScreen : function() {
      var doc = this.viewer.schema.document;
      var url = doc.canonicalURL.replace(/#\S+$/,"");
      var currentPage = this.viewer.models.document.currentPage();

      // construct url fragment based on current viewer state
      switch (this.viewer.state) {
        case 'ViewAnnotation':
          url += '#annotation/a' + this.viewer.activeAnnotationId; // default to the top of the annotations page.
          break;
        case 'ViewDocument':
          url += '#document/p' + currentPage;
          break;
        case 'ViewSearch':
          url += '#search/p' + currentPage + '/' + encodeURIComponent(this.viewer.elements.searchInput.val());
          break;
        case 'ViewText':
          url += '#text/p' + currentPage;
          break;
        case 'ViewThumbnails':
          url += '#pages/p' + currentPage; // need to set up a route to catch this.
          break;
      }
      window.open(url, "documentviewer", "toolbar=no,resizable=yes,scrollbars=no,status=no");
    },

    // Determine the correct DOM page ordering for a given page index.
    sortPages : function(pageIndex) {
      if (pageIndex == 0 || pageIndex % 3 == 1) return ['p0', 'p1', 'p2'];
      if (pageIndex % 3 == 2)                   return ['p1', 'p2', 'p0'];
      if (pageIndex % 3 == 0)                   return ['p2', 'p0', 'p1'];
    },

    addObserver: function(observerName){
      this.removeObserver(observerName);
      this.viewer.state.observers.push(observerName);
    },

    removeObserver: function(observerName){
      var observers = this.viewer.state.observers;
      for(var i = 0,len=observers.length;i<len;i++){
        if(observerName === observers[i]){ observers.splice(i,1); }
      }
    },

    toggleContent: function(toggleClassName){
      this.viewer.elements.viewer.removeClass('DV-viewText DV-viewSearch DV-viewDocument DV-viewAnnotations DV-viewThumbnails').addClass('DV-'+toggleClassName);
    },

    jump: function(pageIndex, modifier, forceRedraw){
      modifier = (modifier) ? parseInt(modifier, 10) : 0;
      var position = this.viewer.models.document.getOffset(parseInt(pageIndex, 10)) + modifier;
      this.viewer.elements.window[0].scrollTop = position;
      this.viewer.models.document.setPageIndex(pageIndex);
      if (forceRedraw) this.viewer.pageSet.redraw(true);
      if (this.viewer.state === 'ViewThumbnails') {
        this.viewer.thumbnails.highlightCurrentPage();
      }
    },

    shift: function(argHash){
      var windowEl        = this.elements.window;
      var scrollTopShift  = windowEl.scrollTop() + argHash.deltaY;
      var scrollLeftShift  = windowEl.scrollLeft() + argHash.deltaX;

      windowEl.scrollTop(scrollTopShift);
      windowEl.scrollLeft(scrollLeftShift);
    },

    // Unclear why this is in helpers/helpers.js and not in helpers/construction.js
    // generates markup.
    constructPages: function(){
      var pages = [];
      var totalPagesToCreate = (this.viewer.model.totalPages < 3) ? this.viewer.model.totalPages : 3;

      var height = this.viewer.models.pages.height;
      for (var i = 0; i < totalPagesToCreate; i++) {
        pages.push(JST.pages({ pageNumber: i+1, pageIndex: i , pageImageSource: null, baseHeight: height }));
      }

      return pages.join('');
    },

    // Position the viewer on the page. For a full screen viewer, this means
    // absolute from the current y offset to the bottom of the viewport.
    positionViewer : function() {
      var offset = this.viewer.elements.viewer.position();
      this.viewer.elements.viewer.css({position: 'absolute', top: offset.top, bottom: 0, left: offset.left, right: offset.left});
    },

    unsupportedBrowser : function() {
      var browser = DV.jQuery.browser;
      if (!(browser.msie && parseFloat(browser.version, 10) <= 6.0)) return false;
      DV.jQuery(this.viewer.options.container).html(JST.unsupported({viewer : this.viewer}));
      return true;
    },

    registerHashChangeEvents: function(){
      var events  = this.viewer.state.eventFunctions;
      var history = this.viewer.state.history;

      // Default route
      history.defaultCallback = _.bind(events.handleHashChangeDefault, events);

      // Handle page loading
      history.register(/document\/p(\d*)$/, _.bind(events.handleHashChangeViewDocumentPage, events));
      // Legacy NYT stuff
      history.register(/p(\d*)$/, _.bind(events.handleHashChangeLegacyViewDocumentPage, events));
      history.register(/p=(\d*)$/, _.bind(events.handleHashChangeLegacyViewDocumentPage, events));

      // Handle annotation loading in document view
      history.register(/document\/p(\d*)\/a(\d*)$/, _.bind(events.handleHashChangeViewDocumentAnnotation, events));

      // Handle annotation loading in annotation view
      history.register(/annotation\/a(\d*)$/, _.bind(events.handleHashChangeViewAnnotationAnnotation, events));

      // Handle loading of the pages view
      history.register(/pages$/, _.bind(events.handleHashChangeViewPages, events));

      // Handle page loading in text view
      history.register(/text\/p(\d*)$/, _.bind(events.handleHashChangeViewText, events));

      // Handle entity display requests.
      history.register(/entity\/p(\d*)\/(.*)\/(\d+):(\d+)$/, _.bind(events.handleHashChangeViewEntity, events));

      // Handle search requests
      history.register(/search\/p(\d*)\/(.*)$/, _.bind(events.handleHashChangeViewSearchRequest, events));
    },

    // Sets up the zoom slider to match the appropriate for the specified
    // initial zoom level, and real document page sizes.
    autoZoomPage: function() {
      var windowWidth = this.viewer.elements.window.outerWidth(true);
      var zoom;
      if (this.viewer.options.zoom == 'auto') {
        zoom = Math.min(700, windowWidth - (this.viewer.models.pages.getPadding() * 2));
      } else {
        zoom = this.viewer.options.zoom;
      }

      // Setup ranges for auto-width zooming
      var ranges = [];
      if (zoom <= 500) {
        var zoom2 = (zoom + 700) / 2;
        ranges = [zoom, zoom2, 700, 850, 1000];
      } else if (zoom <= 750) {
        var zoom2 = ((1000 - 700) / 3) + zoom;
        var zoom3 = ((1000 - 700) / 3)*2 + zoom;
        ranges = [.66*zoom, zoom, zoom2, zoom3, 1000];
      } else if (750 < zoom && zoom <= 850){
        var zoom2 = ((1000 - zoom) / 2) + zoom;
        ranges = [.66*zoom, 700, zoom, zoom2, 1000];
      } else if (850 < zoom && zoom < 1000){
        var zoom2 = ((zoom - 700) / 2) + 700;
        ranges = [.66*zoom, 700, zoom2, zoom, 1000];
      } else if (zoom >= 1000) {
        zoom = 1000;
        ranges = this.viewer.models.document.ZOOM_RANGES;
      }
      this.viewer.models.document.ZOOM_RANGES = ranges;
      this.viewer.slider.slider({'value': parseInt(_.indexOf(ranges, zoom), 10)});
      this.viewer.state.eventFunctions.zoom(zoom);
    },

    handleInitialState: function(){
      this.viewer.open('ViewDocument');
      var initialRouteMatch = this.viewer.history.loadURL(true);
      if(!initialRouteMatch) {
        var opts = this.viewer.options;
        this.viewer.open('ViewDocument');
        if (opts.note) {
          this.viewer.pageSet.showAnnotation(this.viewer.models.annotations.byId[opts.note]);
        } else if (opts.page) {
          this.jump(opts.page - 1);
        }
      }
    }

};
