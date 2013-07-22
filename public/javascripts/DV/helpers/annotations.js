_.extend(DV.Schema.helpers, {
  getAnnotationModel : function(annoEl) {
    var annoId = parseInt(annoEl.attr('rel').match(/\d+/), 10);
    return this.viewer.model.notes.get(annoId);
  },
  // Return the annotation Object that connects with the element in the DOM
  getAnnotationView: function(annotation){

    var annotation    = this.viewer.$(annotation);
    var annotationId  = annotation.attr('id').replace(/DV\-annotation\-|DV\-listAnnotation\-/,'');
    var pageId        = annotation.closest('div.DV-set').attr('data-id');

    for(var i = 0; (annotationObject = this.viewer.pages.pages[pageId].annotations[i]); i++){
      if(annotationObject.id == annotationId){
        // cleanup
        annotation = null;
        return annotationObject;
      }
    }

    return false;

  },
  // Set of bridges to access annotation methods
  // Toggle
  annotationBridgeToggle: function(e){
    e.preventDefault();
    var annotationView = this.getAnnotationView(this.viewer.$(e.target).closest(this.annotationClassName));
    annotationView.toggle();
  },
  // Show annotation
  annotationBridgeShow: function(e){
    e.preventDefault();
    var annotationView = this.getAnnotationView(this.viewer.$(e.target).closest(this.annotationClassName));
    annotationView.show();
  },
  // Hide annotation
  annotationBridgeHide: function(e){
    e.preventDefault();
    var annotationView = this.getAnnotationView(this.viewer.$(e.target).closest(this.annotationClassName));
    annotationView.hide(true);
  },
  // Jump to the next annotation
  annotationBridgeNext: function(e){
    e.preventDefault();
    var annotationView = this.getAnnotationView(this.viewer.$(e.target).closest(this.annotationClassName));
    annotationView.next();
  },
  // Jump to the previous annotation
  annotationBridgePrevious: function(e){
    e.preventDefault();
    var annotationView = this.getAnnotationView(this.viewer.$(e.target).closest(this.annotationClassName));
    annotationView.previous();
  },
  // Update currentpage text to indicate current annotation
  setAnnotationPosition: function(_position){
    this.viewer.elements.currentPage.text(_position);
  },
  // Update active annotation limits
  setActiveAnnotationLimits: function(annotation){
    var annotation = (annotation) ? annotation : this.viewer.activeAnnotation;

    if ( !annotation || annotation == null ) { return; }

    var elements = this.viewer.elements;
    var pageView = annotation.page;
    var noteEl   = annotation.annotationEl;
    var noteTop  = annotation.position.top * this.viewer.models.pages.zoomFactor();
    var tracker  = this.viewer.state.eventFunctions.trackAnnotation;

    if ( annotation.type === 'page' ) {
      tracker.h        = noteEl.outerHeight()+pageView.getOffset();
      tracker.combined = (pageView.getOffset()) - elements.window.height();
    } else {
      tracker.h        = (noteEl.height()+noteTop-20)+(pageView.getOffset()+pageView.getPageNoteHeight());
      tracker.combined = (noteTop-20+pageView.getOffset()+pageView.getPageNoteHeight()) - elements.window.height();
    }

  }
});
