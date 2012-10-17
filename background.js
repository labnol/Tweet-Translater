
chrome.extension.onRequest.addListener(function(request, sender, response) {
  if (request.method == "getSettings")
    response({
        googleTranslateAPIKey: localStorage['api-key'],
        sourceLang: localStorage['s-lang'],
        targetLang: localStorage['d-lang']
    });
  else
    response({});
});
