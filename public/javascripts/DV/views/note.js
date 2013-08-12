DV.view.Note = DV.Backbone.View.extend({
  initialize: function(options) {
    this.viewer          = options.viewer;
  },
  // stolen from models/annotation.js#render(annotation)
  render: function(){
    // if (this.html) { return this.html; }

    var note                      = this.model;
    var pageModel                 = this.viewer.models.pages;
    var zoom                      = pageModel.zoomFactor();
    var adata                     = note.toJSON();
    var x1, x2, y1, y2;
    var page                      = this.viewer.model.pages.getPageByIndex(note.get("page") - 1);

    if(adata.type === 'page'){
      x1 = x2 = y1 = y2           = 0;
      adata.top                   = 0;
    }else{
      y1                          = Math.round((adata.y1) * zoom);
      y2                          = Math.round((adata.y2) * zoom);
      if (x1 < this.LEFT_MARGIN) x1 = this.LEFT_MARGIN;
      x1                          = Math.round(adata.x1 * zoom);
      x2                          = Math.round(adata.x2 * zoom);
      adata.top                   = y1 - 5;
    }
    
    adata.owns_note               = adata.owns_note || false;
    adata.width                   = page.get('width') * zoom;
    adata.pageNumber              = adata.page;
    adata.author                  = adata.author || "";
    adata.author_organization     = adata.author_organization || "";
    adata.bgWidth                 = adata.width;
    adata.bWidth                  = adata.width - 16;
    adata.excerptWidth            = (x2 - x1) - 8;
    adata.excerptMarginLeft       = x1 - 3;
    adata.excerptHeight           = y2 - y1;
    adata.index                   = page.pageIndex;
    adata.image                   = page.imageURL();
    adata.imageTop                = y1 + 1;
    adata.tabTop                  = (y1 < 35 ? 35 - y1 : 0) + 8;
    // position missing
    adata.imageWidth              = page.get('width') * zoom;
    adata.imageHeight             = Math.round(page.get('height'))* zoom;                // wrong
    adata.regionLeft              = x1;
    adata.regionWidth             = x2 - x1 ;
    adata.regionHeight            = y2 - y1;
    adata.excerptDSHeight         = adata.excerptHeight - 6;
    adata.DSOffset                = 3;
    adata.text                    = adata.content;

    if (adata.access == 'public')         adata.accessClass = 'DV-accessPublic';
    else if (adata.access =='exclusive')  adata.accessClass = 'DV-accessExclusive';
    else if (adata.access =='private')    adata.accessClass = 'DV-accessPrivate';

    adata.orderClass = '';
    adata.options = this.viewer.options;
    if (note === this.viewer.model.notes.first()) adata.orderClass += ' DV-firstAnnotation';
    if (note === this.viewer.model.notes.last()) { adata.orderClass += ' DV-lastAnnotation'; }

    var className
    if (adata.type === 'page') {
      this.$el.html(JST['pageAnnotation'](adata));
      className = 'DV-annotation DV-pageNote ' + adata.orderClass +" "+ adata.accessClass +" "+ (adata.owns_note ? 'DV-ownsAnnotation' : '');
    } else {
      this.$el.html(JST['annotation'](adata));
      className = 'DV-annotation ' + adata.orderClass +" "+ adata.accessClass +" "+ (adata.owns_note ? 'DV-ownsAnnotation' : '');
    }
    this.$el.attr('class', className);
    this.$el.attr('style', 'top:'+adata.top+'px');
    this.$el.attr('id', 'DV-annotation-'+adata.id);
    this.$el.attr('data-id', adata.id); 
    return this.$el;
  }
});

// The NoteList is used to generate the AnnotationView display.
DV.view.ViewAnnotations = DV.Backbone.View.extend({
  className: 'DV-allAnnotations',
  
  initialize: function(options) {
    this.viewer          = options.viewer;
    this.collection      = (options.collection || this.viewer.model.notes);
    this.PAGE_NOTE_FUDGE = window.dc && dc.account && (dc.account.isOwner || dc.account.isReviewer) ? 46 : 26;
    this.noteViews = {};
    this.createSubViews();
    this.listenTo(this.collection,'reset', this.createSubViews);
  },
  
  createSubViews: function(){
    this.collection.each( _.bind(function(note){ 
      this.noteViews[note.cid] = new DV.view.Note({model: note, viewer: this.viewer});
    }, this));
  },
  
  render: function() {
    if (this.viewer.options.showAnnotations === false) return;
    
    this.setElement(this.viewer.$('.'+this.className));
    //var rendered = _.map(this.noteViews, function(subview){ return subview.render(); } );
    //var html      = rendered.join('').replace(/id="DV-annotation-(\d+)"/g, function(match, id) {
    //  return 'id="DV-listAnnotation-' + id + '" rel="aid-' + id + '"';
    //});
    //this.$el.html(html);
    var noteViewEls = _.map(this.noteViews, function(noteView){ 
      var el = noteView.render();
      var noteId = noteView.model.id;
      el.attr('id', 'DV-listAnnotation-' + noteId);
      el.attr('rel', 'aid-' + noteId);
      return el;
    });
    this.$el.append(noteViewEls);

    // TODO: This is hacky, but seems to be necessary. When fixing, be sure to
    // test with both autozoom and page notes.
    this.calculateNoteOffsets();
    _.defer(_.bind(this.calculateNoteOffsets, this));
  },
  
  // Offsets all document pages based on interleaved page annotations.
  calculateNoteOffsets: function(){
    var notes                 = this.collection;
    notes.offsetsAdjustments  = [];
    notes.offsetAdjustmentSum = 0;
    var pageAnnotationEls     = this.$('.DV-pageNote');
    var pageNoteHeights       = this.viewer.model.pages.pageNoteHeights;
    var me                    = this;

    // if the viewer isn't in the ViewAnnotations state, add the DV-getHeights class
    // so that correct noteView heights can be calculated.
    if(this.viewer.$('div.DV-docViewer').hasClass('DV-viewAnnotations') == false){
      this.$el.addClass('DV-getHeights');
    }

    // First, collect the list of page annotations, and associate them with
    // their DOM elements.
    var pageAnnos = [];
    var pageNotes = notes.select(function(anno) { return anno.get('type') == 'page'; });
    _.each(pageNotes, function(anno, i) {
      anno.el = pageAnnotationEls[i];
      pageAnnos[anno.get('page')] = anno;
    });

    // Then, loop through the pages and store the cumulative offset due to
    // page annotations.
    for (var i = 0; i <= this.viewer.models.document.totalPages; i++) {
      pageNoteHeights[i] = 0;
      if (pageAnnos[i]) { // if this page has a pageNote
        var height = (DV.jQuery(pageAnnos[i].el).height() + this.PAGE_NOTE_FUDGE);
        pageNoteHeights[i - 1] = height;
        notes.offsetAdjustmentSum += height;
      }
      notes.offsetsAdjustments[i] = notes.offsetAdjustmentSum;
    }
    this.$el.removeClass('DV-getHeights');
  }
  
  // Refresh the annotation's title and content from the model, in both
  // The document and list views.
  // N.B. Extracted from Annotation Model
  //refreshAnnotation : function(anno) {
  //  var viewer = this.viewer;
  //  anno.html = this.render(anno);
  //  DV.jQuery.$('#DV-annotation-' + anno.id).replaceWith(anno.html);
  //}
  
  
});
