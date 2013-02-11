// The Document View is the default view for the DocumentViewer.
// This view is responsible for tabulating the dimensions and
// positions for 
DV.view.Document = DV.Backbone.View.extend({
  initialize: function(options) {
    this.viewer = options.viewer;

    this.currentPageIndex          = 0;
    this.offsets                   = [];
    this.baseHeightsPortion        = [];
    this.baseHeightsPortionOffsets = [];
    this.paddedOffsets             = [];
    this.originalPageText          = {};
    this.totalDocumentHeight       = 0;
    this.totalPages                = 0;
    this.additionalPaddingOnPage   = 0;
    this.ZOOM_RANGES               = [500, 700, 800, 900, 1000];

    //var data                       = this.viewer.schema.data;
    //
    //this.state                     = data.state;
    //this.baseImageURL              = data.baseImageURL;
    //this.canonicalURL              = data.canonicalURL;
    //this.additionalPaddingOnPage   = data.additionalPaddingOnPage;
    //this.pageWidthPadding          = data.pageWidthPadding;
    //this.totalPages                = data.totalPages;

    this.onPageChangeCallbacks = [];

    //var zoom = this.zoomLevel = this.viewer.options.zoom || data.zoomLevel;
    //if (zoom == 'auto') this.zoomLevel = data.zoomLevel;

    // The zoom level cannot go over the maximum image width.
    var maxZoom = _.last(this.ZOOM_RANGES);
    if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;
  },
  setPageIndex: function(index) { console.log("DV.view.Document.setPageIndex"); },
  currentPage : function() { console.log("DV.view.Document.currentPage"); },
  currentIndex : function() { console.log("DV.view.Document.currentIndex"); },
  nextPage : function() { console.log("DV.view.Document.nextPage"); },
  previousPage : function() { console.log("DV.view.Document.previousPage"); },
  zoom: function(zoomLevel,force) { console.log("DV.view.Document.zoom"); },
  computeOffsets: function() { 
    console.log("DV.view.Document.computeOffsets"); 
    var notes            = this.viewer.models.annotations; // annotation collection
    var totalDocHeight   = 0;
    var adjustedOffset   = 0;
    var len              = this.totalPages;
    var diff             = 0;
    var scrollPos        = this.viewer.elements.window[0].scrollTop;

    for(var i = 0; i < len; i++) {
      if(notes.offsetsAdjustments[i]){
        adjustedOffset   = notes.offsetsAdjustments[i];
      }

      var pageHeight     = this.viewer.models.pages.getPageHeight(i);
      var previousOffset = this.offsets[i] || 0;
      var h              = this.offsets[i] = adjustedOffset + totalDocHeight;

      if((previousOffset !== h) && (h < scrollPos)) {
        var delta = h - previousOffset - diff;
        scrollPos += delta;
        diff += delta;
      }

      this.baseHeightsPortion[i]        = Math.round((pageHeight + this.additionalPaddingOnPage) / 3);
      this.baseHeightsPortionOffsets[i] = (i == 0) ? 0 : h - this.baseHeightsPortion[i];

      totalDocHeight                    += (pageHeight + this.additionalPaddingOnPage);
    }

    // Add the sum of the page note heights to the total document height.
    totalDocHeight += adjustedOffset;

    // artificially set the scrollbar height
    if(totalDocHeight != this.totalDocumentHeight){
      diff = (this.totalDocumentHeight != 0) ? diff : totalDocHeight - this.totalDocumentHeight;
      this.viewer.helpers.setDocHeight(totalDocHeight,diff);
      this.totalDocumentHeight = totalDocHeight;
    }
  },
  getOffset: function(_index) { console.log("DV.view.Document.getOffset"); },
  resetRemovedPages: function() { console.log("DV.view.Document.resetRemovedPages"); },
  addPageToRemovedPages: function(page) { console.log("DV.view.Document.addPageToRemovedPages"); },
  removePageFromRemovedPages: function(page) { console.log("DV.view.Document.removePageFromRemovedPages"); },
  redrawPages: function() {console.log("DV.view.Document.redrawPages");},
  redrawReorderedPages: function() {console.log("DV.view.Document.redrawReorderedPages");}
});
