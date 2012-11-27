 // Renders the navigation sidebar for chapters and annotations.
_.extend(DV.Schema.helpers, {

  showAnnotations : function() {
    if (this.viewer.options.showAnnotations === false) return false;
    return _.size(this.viewer.models.annotations.byId) > 0;
  },

  renderViewer: function(){
    var doc         = this.viewer.schema.document;
    var pagesHTML   = this.constructPages();
    var description = (doc.description) ? doc.description : null;
    var storyURL = doc.resources.related_article;

    var headerHTML  = JST['header']({
      options     : this.viewer.options,
      id          : doc.id,
      story_url   : storyURL,
      title       : doc.title || ''
    });
    var footerHTML = JST['footer']({options : this.viewer.options});

    var pdfURL = doc.resources.pdf;
    pdfURL = pdfURL && this.viewer.options.pdf !== false ? '<a target="_blank" href="' + pdfURL + '">Original Document (PDF) &raquo;</a>' : '';

    var contribs = doc.contributor && doc.contributor_organization &&
                   ('' + doc.contributor + ', '+ doc.contributor_organization);

    var showAnnotations = this.showAnnotations();
    var printNotesURL = (showAnnotations) && doc.resources.print_annotations;

    var viewerOptions = {
      options : this.viewer.options,
      pages: pagesHTML,
      header: headerHTML,
      footer: footerHTML,
      pdf_url: pdfURL,
      contributors: contribs,
      story_url: storyURL,
      print_notes_url: printNotesURL,
      descriptionContainer: JST['descriptionContainer']({ description: description}),
      autoZoom: this.viewer.options.zoom == 'auto',
      mini: false
    };

    var width  = this.viewer.options.width;
    var height = this.viewer.options.height;
    if (width && height) {
      if (width < 500) {
        this.viewer.options.mini = true;
        viewerOptions.mini = true;
      }
      DV.jQuery(this.viewer.options.container).css({
        position: 'relative',
        width: this.viewer.options.width,
        height: this.viewer.options.height
      });
    }

    var container = this.viewer.options.container;
    var containerEl = DV.jQuery(container);
    if (!containerEl.length) throw "Document Viewer container element not found: " + container;
    containerEl.html(JST['viewer'](viewerOptions));
  },

  // If there is no description, no navigation, and no sections, tighten up
  // the sidebar.
  displayNavigation : function() {
    var doc = this.viewer.schema.document;
    var missing = (!doc.description && !_.size(this.viewer.schema.data.annotationsById) && !this.viewer.schema.data.sections.length);
    this.viewer.$('.DV-supplemental').toggleClass('DV-noNavigation', missing);
  },

  renderSpecificPageCss : function() {
    var classes = [];
    for (var i = 1, l = this.viewer.models.document.totalPages; i <= l; i++) {
      classes.push('.DV-page-' + i + ' .DV-pageSpecific-' + i);
    }
    var css = classes.join(', ') + ' { display: block; }';
    var stylesheet = '<style type="text/css" media="all">\n' + css +'\n</style>';
    DV.jQuery("head").append(stylesheet);
  },

  renderNavigation : function() {
    var bolds = [], nav=[], notes = [];
        
    var boldsId = this.viewer.models.boldsId || (this.viewer.models.boldsId = _.uniqueId());

    // If notes are to be shown, iterate over all pages
    // and create a list of notes for the sidebar, stored
    // both in our list of notes and our list of nav elements.
    if (this.showAnnotations()) {
      var markupNote = function(note) {
        bolds.push("#DV-selectedAnnotation-" + note.id + " #DV-annotationMarker-" + note.id + " .DV-navAnnotationTitle");
        return JST['annotationNav'](note);
      };
      for(var i = 0; i < this.viewer.models.document.totalPages; i++){
        var noteData = this.viewer.schema.data.annotationsByPage[i];
        if(noteData){ notes[i] = nav[i] = _.map(noteData, markupNote).join(''); }
      }
    }

    var noteMarkupForRange = function(rangeStart, rangeEnd){
      var annotations = [];
      for(var i = rangeStart; i < rangeEnd; i++){
        if(notes[i]){
          annotations.push(notes[i]);
          nav[i] = ''; // blank out a note's entry in the nav markup.
        }
      }
      return annotations.join('');
    };

    // Generate and store markup for each section
    var sections = this.viewer.schema.data.sections;
    _.each(sections, function(section){
      var annotations    = noteMarkupForRange(section.pageNumber - 1, section.endPage);
      if(annotations != '') {
        section.navigationExpander       = JST['navigationExpander']({});
        section.navigationExpanderClass  = 'DV-hasChildren';
        section.noteViews                = annotations;
      } else {
        section.navigationExpander       = '';
        section.navigationExpanderClass  = 'DV-noChildren';
        section.noteViews                = '';
      }
    
      var selectionRule = "#DV-selectedChapter-" + section.id + " #DV-chapter-" + section.id;
      bolds.push(selectionRule+" .DV-navChapterTitle");
      nav[section.pageNumber - 1] = JST['chapterNav'](section);
    });
    
    // insert and observe the nav
    var navigationView = nav.join('');

    var chaptersContainer = this.viewer.$('div.DV-chaptersContainer');
    chaptersContainer.html(navigationView);
    chaptersContainer.unbind('click').bind('click',this.events.compile('handleNavigation'));
    if (sections.length || _.size(this.viewer.schema.data.annotationsById)) { chaptersContainer.show(); } else { chaptersContainer.hide(); }
    this.displayNavigation();

    DV.jQuery('#DV-navigationBolds-' + boldsId, DV.jQuery("head")).remove();
    var boldsContents = bolds.join(", ") + ' { font-weight:bold; color:#000 !important; }';
    var navStylesheet = '<style id="DV-navigationBolds-' + boldsId + '" type="text/css" media="screen,print">\n' + boldsContents +'\n</style>';
    DV.jQuery("head").append(navStylesheet);
    chaptersContainer = null;
  },

  // Hide or show all of the components on the page that may or may not be
  // present, depending on what the document provides.
  renderComponents : function() {
    // Hide the overflow of the body, unless we're positioned.
    var containerEl = DV.jQuery(this.viewer.options.container);
    var position = containerEl.css('position');
    if (position != 'relative' && position != 'absolute' && !this.viewer.options.fixedSize) {
      DV.jQuery("html, body").css({overflow : 'hidden'});
      // Hide the border, if we're a full-screen viewer in the body tag.
      if (containerEl.offset().top == 0) {
        this.viewer.elements.viewer.css({border: 0});
      }
    }

    // Hide and show navigation flags:
    var showAnnotations = this.showAnnotations();
    var showPages       = this.viewer.models.document.totalPages > 1;
    var showSearch      = (this.viewer.options.search !== false) &&
                          (this.viewer.options.text !== false) &&
                          (!this.viewer.options.width || this.viewer.options.width >= 540);
    var noFooter = (!showAnnotations && !showPages && !showSearch && !this.viewer.options.sidebar);


    // Hide annotations, if there are none:
    var $annotationsView = this.viewer.$('.DV-annotationView');
    $annotationsView[showAnnotations ? 'show' : 'hide']();

    // Hide the text tab, if it's disabled.
    if (showSearch) {
      this.elements.viewer.addClass('DV-searchable');
      this.viewer.$('input.DV-searchInput', containerEl).placeholder({
        message: 'Search',
        clearClassName: 'DV-searchInput-show-search-cancel'
      });
    } else {
      this.viewer.$('.DV-textView').hide();
    }

    // Hide the Pages tab if there is only 1 page in the document.
    if (!showPages) {
      this.viewer.$('.DV-thumbnailsView').hide();
    }

    // Hide the Documents tab if it's the only tab left.
    if (!showAnnotations && !showPages && !showSearch) {
      this.viewer.$('.DV-views').hide();
    }

    this.viewer.api.roundTabCorners();

    // Hide the entire sidebar, if there are no annotations or sections.
    var showChapters = this.viewer.models.chapters.chapters.length > 0;

    // Remove and re-render the nav controls.
    // Don't show the nav controls if there's no sidebar, and it's a one-page doc.
    this.viewer.$('.DV-navControls').remove();
    if (showPages || this.viewer.options.sidebar) {
      var navControls = JST['navControls']({
        totalPages: this.viewer.schema.data.totalPages,
        totalAnnotations: this.viewer.schema.data.totalAnnotations
      });
      this.viewer.$('.DV-navControlsContainer').html(navControls);
    }

    this.viewer.$('.DV-fullscreenControl').remove();
    if (this.viewer.schema.document.canonicalURL) {
      var fullscreenControl = JST['fullscreenControl']({});
      if (noFooter) {
        this.viewer.$('.DV-collapsibleControls').prepend(fullscreenControl);
        this.elements.viewer.addClass('DV-hideFooter');
      } else {
        this.viewer.$('.DV-fullscreenContainer').html(fullscreenControl);
      }
    }

    if (this.viewer.options.sidebar) {
      this.viewer.$('.DV-sidebar').show();
    }

    // Check if the zoom is showing, and if not, shorten the width of search
    _.defer(_.bind(function() {
      if ((this.elements.viewer.width() <= 700) && (showAnnotations || showPages || showSearch)) {
        this.viewer.$('.DV-controls').addClass('DV-narrowControls');
      }
    }, this));

    // Set the currentPage element reference.
    this.elements.currentPage = this.viewer.$('span.DV-currentPage');
    this.viewer.models.document.setPageIndex(this.viewer.models.document.currentIndex());
  },

  // Reset the view state to a baseline, when transitioning between views.
  reset : function() {
    this.resetNavigationState();
    this.cleanUpSearch();
    this.viewer.pageSet.cleanUp();
    this.removeObserver('drawPages');
    this.viewer.dragReporter.unBind();
    this.elements.window.scrollTop(0);
  }

});
