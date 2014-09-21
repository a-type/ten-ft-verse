var TEN = TEN || {};

TEN.scanUrl = "http://api.biblia.com/v1/bible/scan";
TEN.verseUrl = "http://api.biblia.com/v1/bible/content/LEB.html";
$(function() { 
  TEN.verseTpl = _.template($("#verseTemplate").html().trim());
  TEN.errorTpl = _.template($("#errorTemplate").html().trim());
  TEN.versePanel = $("#versesPanel");
});
TEN.apiKey = "{{ API_KEY }}";

function submitSearch() {
  var q = $("#searchQuery").val().toUpperCase();
  $("#searchQuery").val("");
  $.ajax({
      type: "GET",
      url: TEN.scanUrl,
      data: { text: q, key: TEN.apiKey },
      //headers: { "Authorization": "Basic " + TEN.apiKey },
      success: function(resp) {
        if (resp.results === undefined || resp.results.length === 0) {
          addError("couldn't find a verse for '" + q + "'");
          return;
        }
        var passage = resp.results[0].passage;
        $.ajax({
          type: "GET",
          url: TEN.verseUrl,
          data: { passage: passage.replace(" ", "").replace(":", "."), key: TEN.apiKey },
          success: function(resp) {
            if (resp === undefined) {
              addError("couldn't find a verse for '" + q + "'");
              return;
            }
            var firstVerse = resp;
            addVerse(passage, firstVerse/*, sub*/);
          }
        });  
      }
  });
  return false;
}

function addVerse(p, v, s) {

  var returnedEl = $(v),
      data = { passage: p, text: "", submitter: s },
      t;
  for (t = 0; t < returnedEl.length; t++) {
    data.text += returnedEl[t].textContent;
  }
  data.text = data.text.trim().replace(/Yahweh/g, "the LORD");
  var el = $(TEN.verseTpl(data));
  var container = el.find(".verse-text-container");
  container[0].expanded = false;
  container.hide();
  TEN.versePanel.append(el);
}

function addError(e) {
  var el = $(TEN.errorTpl({ error: e }));
  TEN.versePanel.append(el);
}

function toggleExpand(el) {
  var container = $(el).find(".verse-text-container");
  if (!container[0].expanded) {
    container.css("opacity", "0").slideDown(200).animate({ "opacity": "1.0"}, 200);
  } else {
    container.animate({"opacity": "0"}, 200).slideUp(200);
  }
  container[0].expanded = !container[0].expanded;
}

function closeSelf(el) {
  var verseEl = $(el).closest(".verse");
  verseEl.remove();
}

function onSearchKeyDown() {
  var q = $("#searchQuery").val();
  if (event.keyCode === 13 && q !== "" && q !== null && q !== undefined){
    $("form").submit();
  }
}