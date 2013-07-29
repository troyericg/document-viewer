DV.Annotation = function(options){
  this.position     = { top: options.top, left: options.left };
  this.dimensions   = { width: options.width, height: options.height };
  this.page         = options.page;
  this.pageEl       = options.pageEl;
  this.annotationContainerEl = options.annotationContainerEl;
  this.viewer       = this.page.set.viewer;
  this.annotationEl = null;
  this.renderedHTML = options.renderedHTML;
  this.type         = options.type;
  this.id           = options.id;
  this.state        = 'collapsed';
  this.active       = false;
  this.render();

  if(options.active){
    this.viewer.helpers.setActiveAnnotationLimits(this);
    this.viewer.state.eventFunctions.resetTracker();
    this.active = null;
    // this.viewer.elements.window[0].scrollTop += this.annotationEl.offset().top;
    this.show();
    if (options.showEdit) this.showEdit();
  }
};

DV.Annotation.prototype.render = function(){
  this.remove();
  this.add();
};

// Add annotation to page
DV.Annotation.prototype.add = function(){
  if ( this.type === 'page' ) {
    // insert it at the top/beginning of the note layer
    this.annotationEl = this.renderedHTML.insertBefore(this.annotationContainerEl);
  } else {
    // otherwise append it to the end of the note layer
    this.annotationEl = this.renderedHTML.appendTo(this.annotationContainerEl);
  }
};

// Jump to next annotation
DV.Annotation.prototype.next = function(){
  console.log("DV.Annotation.next");
  this.hide.preventRemovalOfCoverClass = true;

  var note = this.viewer.model.notes.getNextAnnotation(this.id);
  if(!note){ return; }
  this.page.set.showAnnotation(note);
};

// Jump to previous annotation
DV.Annotation.prototype.previous = function(){
  this.hide.preventRemovalOfCoverClass = true;

  var note = this.viewer.model.notes.getPreviousAnnotation(this.id);
  if(!note) { return; }
  this.page.set.showAnnotation(note);
};

// Show annotation
DV.Annotation.prototype.show = function(options) {

  if (this.viewer.activeAnnotation && this.viewer.activeAnnotation.id != this.id) {
    this.viewer.activeAnnotation.hide();
  }
  this.viewer.annotationToLoadId = null;
  this.viewer.elements.window.addClass('DV-coverVisible');

  this.annotationEl.find('div.DV-annotationBG').css({ display: 'block', opacity: 1 });
  this.annotationEl.addClass('DV-activeAnnotation');
  this.viewer.activeAnnotation   = this;

  // Enable annotation tracking to ensure the active state hides on scroll
  this.viewer.helpers.addObserver('trackNoteView');
  this.viewer.helpers.setActiveAnnotationInNav(this.id);
  this.active                         = true;
  this.pageEl.parent('.DV-set').addClass('DV-activePage');
  // this.viewer.history.save('document/p'+(parseInt(this.page.index,10)+1)+'/a'+this.id);

  if (options && options.edit) {
    this.showEdit();
  }
};

// Hide annotation
DV.Annotation.prototype.hide = function(forceOverlayHide){
  var pageNumber = parseInt(this.viewer.elements.currentPage.text(),10);

  if(this.type !== 'page'){
    this.annotationEl.find('div.DV-annotationBG').css({ opacity: 0, display: 'none' });
  }

  var isEditing = this.annotationEl.hasClass('DV-editing');

  this.annotationEl.removeClass('DV-editing DV-activeAnnotation');
  if(forceOverlayHide === true){
    this.viewer.elements.window.removeClass('DV-coverVisible');
  }
  if(this.hide.preventRemovalOfCoverClass === false || !this.hide.preventRemovalOfCoverClass){
    this.viewer.elements.window.removeClass('DV-coverVisible');
    this.hide.preventRemovalOfCoverClass = false;
  }

  // stop tracking this annotation
  this.viewer.activeAnnotation                              = null;
  this.viewer.state.eventFunctions.trackNoteView.h        = null;
  this.viewer.state.eventFunctions.trackNoteView.id       = null;
  this.viewer.state.eventFunctions.trackNoteView.combined = null;
  this.active                                               = false;
  this.viewer.pages.setActiveAnnotation(null);
  this.viewer.helpers.removeObserver('trackNoteView');
  this.viewer.helpers.setActiveAnnotationInNav();
  this.pageEl.parent('.DV-set').removeClass('DV-activePage');

  if (isEditing) {
    this.viewer.helpers.saveAnnotation({target : this.annotationEl}, 'onlyIfText');
  }
};

// Toggle annotation
DV.Annotation.prototype.toggle = function(options){
  if (this.viewer.activeAnnotation && (this.viewer.activeAnnotation != this)){
    this.viewer.activeAnnotation.hide();
  }

  if (this.type === 'page') return;

  this.annotationEl.toggleClass('DV-activeAnnotation');
  if(this.active == true){
    this.hide(true);
  }else{
    this.show();
  }
};

// Show edit controls
DV.Annotation.prototype.showEdit = function() {
  this.annotationEl.addClass('DV-editing');
  this.viewer.$('.DV-annotationTitleInput', this.annotationEl).focus();
};

// Remove the annotation from the page
DV.Annotation.prototype.remove = function(){
  DV.jQuery('#DV-annotation-'+this.id).remove();
};
