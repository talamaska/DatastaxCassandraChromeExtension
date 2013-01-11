(function($) {
	$(document).ready(function () {
		// Load the CSS files
		var $extCss = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('ext.css') + '" />');
		var $jsonCss = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('KelpJSONView.css') + '" />');
		$('head').append($jsonCss);
		$('head').append($extCss);
	
		// Initialize the pop-up window
		var $popUp = $('<div id="cass-pop-up-win"></div>');
		$popUp.append('<ul><li><a href="#result-raw" class="selected">Raw</a></li><li><a href="#result-formatted">JSON view</a></li></ul>');
		var $popUpRawContent = $('<div class="cass-pop-up-win-tab" id="result-raw"></div>');
		var $popUpHighlightedContent = $('<pre class="cass-pop-up-win-tab" id="result-formatted"></pre>');
		$popUp.append($popUpHighlightedContent);
		$popUp.append($popUpRawContent);
		var $closeBtn = $('<a href="#" id="cass-pop-up-win-close"></a>');
		$closeBtn.click(function () {
			$popUp.hide();
		});
		$popUp.append($closeBtn);
		$('body').append($popUp);
		
		// Handle cell clicks
		$('td.dojoxGridCell').live('click', function () {
			var $this = $(this);
			$popUpRawContent.html('');
			$popUpHighlightedContent.html('');
			
			// Calculate the position
			var cellOffset = $this.offset();
			var top = cellOffset.top;
			if ((top + 330) > $(window).height())
			{
				top = top - (330 - $this.outerHeight());
			}
			$popUp.css({
				'top': top,
				'left': cellOffset.left
			});
			
			// Copy the content to the pop up window (raw tab)
			$popUpRawContent.html($this.html());
			
			// Remove "the view all columns" link
			$popUpRawContent.find('a').remove();
			
			// Make it beautiful :P
			var raw = $popUpRawContent.html();
			// Create a valid JSON string so the JSON.parse() method will work
			if (raw) {
				var json =  '';
				try {
					var rawParts = raw.split(/<br\s*\/?>/);
					var jsonParts = [];
					var j = 0;
					for (var i = 0; i < rawParts.length; i++) {
						if (!rawParts[i]) {
							continue;
						}
						if (rawParts[i].match(/<u>/gi)) {
							rawParts[i] = '{' + rawParts[i].replace(/<u>/gi, '"').replace(/<\/u>/gi, '"') + '}';
						}
						jsonParts[j++] = rawParts[i];
					}
					json = '[' + jsonParts.join(',') + ']';
					
					$.JSONView(json, $popUpHighlightedContent);
				} catch (err) {
					$popUpHighlightedContent.html('Unable to process the JSON string.<br /><br />' + json);
				}
			} else {
				$popUpHighlightedContent.html('Unable to process empty string.');
			}
			
			// Now shine...
			$popUp.show();
		}).live('mouseenter', function () {
			$(this).addClass('over');
		}).live('mouseleave', function () {
			$(this).removeClass('over');
		});
		
		// Prevent bubbling for 'view all columns' button
		$('.dojoxGridCell a').live('click', function (e) {
			e.stopPropagation();
		})
		
		// Handle ESC button
		$(document).keyup(function(e) {
			if (e.keyCode == 27) {
				$closeBtn.click();
			}
		});
		
		// Hide the pop-up window when the user clicks outside of it
		$(document).mouseup(function (e) {
			if ($popUp.has(e.target).length === 0) {
				$closeBtn.click();
			}
		});
		
		// Tabs
		$('#cass-pop-up-win ul li a').live('click', function () {
			var $this = $(this);
			$('.cass-pop-up-win-tab').hide();
			$($this.attr('href')).show();
			$('#cass-pop-up-win ul li a').removeClass('selected');
			$this.addClass('selected');
			return false;
		});
		$('#cass-pop-up-win ul li a:first').click();
	});
})(jQuery);