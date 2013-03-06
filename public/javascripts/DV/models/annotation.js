DV.model.Annotations = function(viewer) {
  this.LEFT_MARGIN              = 25;
  this.PAGE_NOTE_FUDGE          = window.dc && dc.account && (dc.account.isOwner || dc.account.isReviewer) ? 46 : 26;
  this.viewer                   = viewer;
  this.offsetsAdjustments       = [];
  this.offsetAdjustmentSum      = 0;
  this.saveCallbacks            = [];
  this.deleteCallbacks          = [];
  this.byId                     = this.viewer.model.notes.byId;
  this.byPage                   = this.viewer.model.notes.byPage;
};

DV.model.Annotations.prototype = {
  // Refresh the annotation's title and content from the model, in both
  // The document and list views.
  refreshAnnotation : function(anno) {
    var viewer = this.viewer;
    anno.html = this.render(anno);
    DV.jQuery.$('#DV-annotation-' + anno.id).replaceWith(anno.html);
  },

  // Removes a given annotation from the Annotations model (and DOM).
  removeAnnotation : function(anno) {
    delete this.byId[anno.id];
    var i = anno.page - 1;
    this.byPage[i] = _.without(this.byPage[i], anno);
    this.sortAnnotations();
    DV.jQuery('#DV-annotation-' + anno.id + ', #DV-listAnnotation-' + anno.id).remove();
    this.viewer.api.redraw(true);
    if (_.isEmpty(this.byId)) this.viewer.open('ViewDocument');
  },

  // Offsets all document pages based on interleaved page annotations.
  updateAnnotationOffsets: function(){
    this.offsetsAdjustments   = [];
    this.offsetAdjustmentSum  = 0;
    var documentModel         = this.viewer.models.document;
    var annotationsContainer  = this.viewer.$('div.DV-allAnnotations');
    var pageAnnotationEls     = annotationsContainer.find('.DV-pageNote');
    var pageNoteHeights       = this.viewer.model.pages.pageNoteHeights;
    var me = this;

    if(this.viewer.$('div.DV-docViewer').hasClass('DV-viewAnnotations') == false){
      annotationsContainer.addClass('DV-getHeights');
    }

    // First, collect the list of page annotations, and associate them with
    // their DOM elements.
    var pageAnnos = [];
    _.each(_.select(this.bySortOrder, function(anno) {
      return anno.type == 'page';
    }), function(anno, i) {
      anno.el = pageAnnotationEls[i];
      pageAnnos[anno.pageNumber] = anno;
    });

    // Then, loop through the pages and store the cumulative offset due to
    // page annotations.
    for (var i = 0, len = documentModel.totalPages; i <= len; i++) {
      pageNoteHeights[i] = 0;
      if (pageAnnos[i]) {
        var height = (this.viewer.$(pageAnnos[i].el).height() + this.PAGE_NOTE_FUDGE);
        pageNoteHeights[i - 1] = height;
        this.offsetAdjustmentSum += height;
      }
      this.offsetsAdjustments[i] = this.offsetAdjustmentSum;
    }
    annotationsContainer.removeClass('DV-getHeights');
  },

  // When an annotation is successfully saved, fire any registered
  // save callbacks.
  fireSaveCallbacks : function(anno) {
    _.each(this.saveCallbacks, function(c){ c(anno); });
  },

  // When an annotation is successfully removed, fire any registered
  // delete callbacks.
  fireDeleteCallbacks : function(anno) {
    _.each(this.deleteCallbacks, function(c){ c(anno); });
  },

  // Get an annotation by id, with backwards compatibility for argument hashes.
  getAnnotation: function(identifier) {
    if (identifier.id) return this.byId[identifier.id];
    if (identifier.index && !identifier.id) throw new Error('looked up an annotation without an id');
    return this.byId[identifier];
  }

};

DV.model.Note = DV.Backbone.Model.extend({
  defaults: {
    title               : "Untitled Note",
    text                : "",
    content             : "",
    access              : "public",
    owns_note           : false,
    author              : "",
    author_organization : "",
  },
  initialize: function(data, options){
    this.set("type", (this.get('location') && this.get('location').image ? 'region' : 'page'));

    if (this.get('type') === 'region') {
      var loc = DV.jQuery.map(this.get('location').image.split(','), function(n, i) { return parseInt(n, 10); });
      this.set('y1', loc[0]); this.set('x2', loc[1]); this.set('y2', loc[2]); this.set('x1', loc[3]);
      this.top = this.get('y1') - 5;
    } else if(this.get('type') === 'page') {
      this.set('y1', 0); this.set('x2', 0); this.set('y2', 0); this.set('x1', 0);
      this.top = 0;
    }
  },
});

DV.model.NoteSet = DV.Backbone.Collection.extend({
  model: DV.model.Note,
  
  // Default comparator set to sort by vertical order.
  // The annotation presenter accesses notes in three ways
  // byId, byPage and bySortOrder.  Only the last is an array
  // so, we'll use it as the default order, and manually track
  // the other two.
  comparator: function(note) { return note.get('page') * 10000 + note.get('y1'); },

  initialize: function(data, options){
    this.byId   = {};
    this.byPage = {};

    this.on( 'reset', function(){ this.each( _.bind(this.insertNoteIntoIndexes, this) ); }, this );
    this.on( 'add', this.insertNoteIntoIndexes, this );
  },

  getFirstAnnotation: function(){
    return this.first();
  },
  
  getNextAnnotation: function(note) {
    var anno = (note.id ? note : this.get(note));
    return this.at(this.indexOf(anno) + 1);
  },

  getPreviousAnnotation: function(note) {
    var anno = (note.id ? note : this.get(note));
    return this.at(this.indexOf(anno) - 1);
  },
  
  insertNoteIntoIndexes: function(note){
    this.byId[note.id] = note;
    
    var pageIndex = note.get('page') - 1;
    var pageNotes = this.byPage[pageIndex] = this.byPage[pageIndex] || [];
    var insertionIndex = _.sortedIndex(pageNotes, note, function(n){ return n.get('y1'); });
    pageNotes.splice(insertionIndex, 0, note);
  }
  
  
});
