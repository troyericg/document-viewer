DV.Schema = function() {
  this.models       = {};
  this.backbone     = { models:{}, views:{} };
  this.views        = {};
  this.states       = {};
  this.helpers      = {};
  this.events       = {};
  this.elements     = {};
  this.text         = {};
  this.data         = {
    zoomLevel               : 700,
    pageWidthPadding        : 20,
    additionalPaddingOnPage : 30,
    state                   : { page: { previous: 0, current: 0, next: 1 } }
  };
};

// Imports the document's JSON representation into the DV.Schema form that
// the models expect.
DV.Schema.prototype.importCanonicalDocument = function(json) {
  // Ensure that IDs start with 1 as the lowest id.
  _.uniqueId();
  // Ensure at least empty arrays for sections.
  json.sections               = _.sortBy(json.sections || [], function(sec){ return sec.page; });
  json.annotations            = json.annotations || [];
  json.canonicalURL           = json.canonical_url;

  this.document               = DV.jQuery.extend(true, {}, json);
  // Everything after this line is for back-compatibility.
  this.data.title             = json.title;
  this.data.totalPages        = json.pages;
  this.data.totalAnnotations  = json.annotations.length;
  this.data.sections          = json.sections;
  this.data.chapters          = [];
  this.data.annotationsById   = {};
  this.data.annotationsByPage = {};
  _.each(json.annotations, DV.jQuery.proxy(this.loadAnnotation, this));
};

// Load an annotation into the Schema, starting from the canonical format.
DV.Schema.prototype.loadAnnotation = function(anno) {
  if (anno.id) anno.server_id = anno.id;
  var idx     = anno.page - 1;
  anno.id     = anno.id || _.uniqueId();
  anno.title  = anno.title || 'Untitled Note';
  anno.text   = anno.content || '';
  anno.access = anno.access || 'public';
  anno.type   = anno.location && anno.location.image ? 'region' : 'page';
  if (anno.type === 'region') {
    var loc = DV.jQuery.map(anno.location.image.split(','), function(n, i) { return parseInt(n, 10); });
    anno.y1 = loc[0]; anno.x2 = loc[1]; anno.y2 = loc[2]; anno.x1 = loc[3];
  }else if(anno.type === 'page'){
    anno.y1 = 0; anno.x2 = 0; anno.y2 = 0; anno.x1 = 0;
  }
  anno.comments = [{commenter: 'Monsieur Grenouille', avatarUrl: 'file:///Users/ted/Pictures/thumbnails/frog.jpg', text:'Ribbit.'}, {commenter:'Charles Darwin', avatarUrl: 'file:///Users/ted/Pictures/thumbnails/darwin.jpg', text:'WHEN on board H.M.S. \'Beagle,\' as naturalist, I was much struck with certain facts in the distribution of the inhabitants of South America, and in the geological relations of the present to the past inhabitants of that continent. These facts seemed to me to throw some light on the origin of species—that mystery of mysteries, as it has been called by one of our greatest philosophers. On my return home, it occurred to me, in 1837, that something might perhaps be made out on this question by patiently accumulating and reflecting on all sorts of facts which could possibly have any bearing on it. After five years\' work I allowed myself to speculate on the subject, and drew up some short notes; these I enlarged in 1844 into a sketch of the conclusions, which then seemed to me probable: from that period to the present day I have steadily pursued the same object. I hope that I may be excused for entering on these personal details, as I give them to show that I have not been hasty in coming to a decision.'}];
  this.data.annotationsById[anno.id] = anno;
  var page = this.data.annotationsByPage[idx] = this.data.annotationsByPage[idx] || [];
  var insertionIndex = _.sortedIndex(page, anno, function(a){ return a.y1; });
  page.splice(insertionIndex, 0, anno);
  return anno;
};
