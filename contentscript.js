(function( $){
  var body = document.getElementsByTagName('body')[0],
      argContainer = $('<input type="hidden" id="arg-gTrans">').appendTo(body);

  // define callback function to the webpage's gloval context
  _script({txt:'var gTranslateCallback = ' +
    (function (res) {
        var arg = JSON.parse(document.querySelector('#arg-gTrans').value),
            exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
            lang = arg.from + '_' + arg.to,
            html = res.data ? res.data.translations[0].translatedText.replace(exp, function(match){
                var text = match.replace(/https?:\/\/(www\.)?/i,'');
                if (text.length > 20) text = text.substring(0, 20) + '...';
                return '<a href="' + match + '" target="_blank">' + text + '</a>';
            }) : 'could not translate.';
        html = html.replace(/@ /g,'@').replace(/# /g,'#');

        /** create a new division with translated value */
        var translated = $('<div>').addClass('translated_item '+lang).html(html).click(function (e) {
            var href = $(e.target).attr('href');
            if (href && href.length > 0) 
              return;
            e.stopPropagation();
            return false;
        });
        /** add remove button */
        $('<div>').addClass('translated_item_remove').text('×').click(function (e) {
            $(this).parent().fadeOut();
            e.stopPropagation();
            return false;
        }).appendTo(translated);
        translated.appendTo($(arg.target)).fadeIn('fast');

        /** window.scroll(0, arg.top); */

        /** there is something wrong.. */
        if (! arg.apikey) {
          alert("Please set Google api's key \non this extension's settings first.");
        } else if (! res.data) {
          alert("Please check whether your Google api's key is collect.");
        }
    }).toString() + ';'
  });
  _style('' +
    '.translated_item {' +
    '  display: none;position: absolute;z-index: 1;top: 0px;left: 0px;' +
    '  background-color: rgba(0, 0, 0, 0.85);color: white;' +
    '  padding: 10px 23px 10px 15px;margin-left: -395px;' +
    '  width: 350px;max-width: 350px;min-height: 45px;cursor: default;' +
    '  -webkit-box-shadow: #AAA 7px 5px 8px;-webkit-border-radius: 3px;' +
    '}' +
    '.translated_item > a {color: CornFlowerBlue;}' +
    '.translated_item > a:hover {color: SkyBlue;}' +
    '.translated_item_remove {' +
    '  position: absolute;top: 1px;left: 369px;color: #999;font-size: 20px;' +
    '}' +
    '.translated_item_remove:hover {color: white;}'
   );

  // create anchors to invoke translation event
  $('.js-stream-item').live('mouseover', function(event){
    var _this = $(this);
    if (_this.hasClass('translate-event-binded'))
      return;
    _this.addClass('translate-event-binded');
    $('<a>').attr('href','#').text('Translate')
      .click(function(e){
        var text = $('.js-tweet-text', _this),
            links = text.children('a'),
            replies = $('.replies .js-tweet-text', _this),
            ancestors = $('.js-tweet-ancestors .js-tweet-text', _this),
            translated = text.children('.translated_item'),
            value = text.text().replace(/                    /g,'');

        // Replace with anchor's inside text
        for (var i = 0, len = links.length; i < len; i++){
          var link = $(links[ i]),
              linktext = link.text();
          if (link.attr('data-screen-name')) continue;
          if (link.hasClass('twitter-atreply')) continue;
          if (linktext.indexOf('#') == 0) continue;
          if (linktext.toLowerCase().indexOf('http://') == 0) continue;
          value = value.replace( linktext, link.attr('href'));
        }
        // Extract replies
        for (var i = 0, len = replies.length; i < len; i++){
          value = value.replace( replies.eq(i).text(),'');
        }
        // Extract ancestors
        for (var i = 0, len = ancestors.length; i < len; i++){
          value = value.replace( ancestors.eq(i).text(),'');
        }
        // Extract translated
        for (var i = 0, len = translated.length; i < len; i++){
          value = value.replace( translated.eq(i).text(), '');
        }

        value = value.replace(/(\n|…|\.\.\.)/g, '');
        _translate(_this.attr('id'), $(window).scrollTop(), value);
        e.stopPropagation();
        return false;
      })
      .appendTo($('.tweet-actions', _this));
  });


  function _translate(id, top, q) {
    // get settings from extension's context
    chrome.extension.sendRequest({method: "getSettings"}, function(response) {
      var source = response.sourceLang || 'en',
          target = response.targetLang || 'en',
          translated = $('#'+ id +' div.translated_item.'+source + '_' + target);

      // if the translated words are exists, make it visible.
      if (translated.length > 0) {
        translated.fadeIn('fast');
//        window.scroll(0, top);
        return;
      }

      // set argument to webpage context
      argContainer.val(JSON.stringify({
          target: "#"+ id +" .original-tweet > .content > p.js-tweet-text",
          apikey: response.googleTranslateAPIKey,
          top: top, from: source, to: target
      }));

      // calls google translate api v2
      _script({src:'https://www.googleapis.com/language/translate/v2' +
                   '?key=' + response.googleTranslateAPIKey +
                   '&source=' + source + '&target=' + target +
                   '&q=' + encodeURIComponent(q) + '&callback=gTranslateCallback'});
    });
  }
  // imports external scripts
  function _script(arg) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (arg.src) script.src = arg.src;
    if (arg.txt) script.innerText = arg.txt;
    body.appendChild(script);
  }
  function _style(value) {
    var script = document.createElement('style');
    script.type = 'text/css';
    script.innerText = value;
    body.appendChild(script);
  }
})( jQuery);
console.log('Translate tweets for Twitter will work!');
