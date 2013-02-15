DV.view.Pages = DV.Backbone.View.extend({
  // In pixels.
  BASE_WIDTH      : 700,
  BASE_HEIGHT     : 906,
  // Factors for scaling from image size to zoomlevel.
  SCALE_FACTORS   : {'500': 0.714, '700': 1.0, '800': 0.8, '900': 0.9, '1000': 1.0},
  // For viewing page text.
  DEFAULT_PADDING : 100,
  // Embed reduces padding.
  REDUCED_PADDING : 44,
  // Mini padding, when < 500 px wide.
  MINI_PADDING    : 18,

  initialize: function(options) {
    this.viewer          = options.viewer;
    // Real page heights.
    this.pageHeights     = [];
    // Real page note heights.
    this.pageNoteHeights = [];
    // Rolling average page height.
    this.averageHeight   = 0;
    this.zoomLevel       = this.viewer.model.zoomLevel;
    this.baseWidth       = this.BASE_WIDTH;
    this.baseHeight      = this.BASE_HEIGHT;
    this.width           = this.zoomLevel;
    this.height          = this.baseHeight * this.zoomFactor();
    this.numPagesLoaded  = 0;
  },
  
  // taken from helpers/helpers.js#constructPages
  render: function() {
    var pages = [];
    var totalPagesToCreate = (this.viewer.model.get('totalPages') < 3) ? this.viewer.model.get('totalPages') : 3;

    for (var i = 0; i < totalPagesToCreate; i++) {
      pages.push(JST['pages']({ pageNumber: i+1, pageIndex: i , pageImageSource: null, baseHeight: this.height }));
    }

    return pages.join('');
  },

  imageURL: function(index) {
    
  },

  zeroPad: function(num, count) {
    
  },

  getPadding: function() {
    
  },

  zoomFactor: function() {
    
  },

  resize: function(zoomLevel) {
    
  },

  updateHeight: function(image, pageIndex) {
    
  },

  setPageHeight: function(pageIndex, pageHeight) {
    
  },

  getPageHeight: function(pageIndex) {
    
  }

});
