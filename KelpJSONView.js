$.extend(jQuery,
{
    JSONView: function (json, container) {
        var ob;
        if (typeof json == 'string')
		{
			// JSON.parse() does not work well with large numbers so we are converting those numbers
			// to strings (wrapping tha values in quotes) and later we are going to strip the quotes.
			json = json.replace(/(:(\s)*(\d){12,})/g, ":\"$1#fakestring#\"");
			json = json.replace(/(:(\s)*(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\w{3}))/g,  ":\"$3#datestring#\"");

            ob = JSON.parse(json);
		}
        else
            ob = json;
        var p, l = [], c = container;
        var repeat = function (s, n) {
            return new Array(n + 1).join(s);
        };
		
        var r = function (o, isar, s) {
            for (var n in o) {
                var p = o[n];
                switch (typeof p) {
                    case 'function':
                        break;
                    case 'string':
                        p = p.replace(/</g, '&lt;');
                        p = p.replace(/>/g, '&gt;');
						// Detect a fake string used to represent large numbers
						var isFake = false;
						if (p.indexOf("#fakestring#") != -1) {
							isFake = true;
							p = p.replace(/(\"|:)/g, '');
							p = p.replace(/#fakestring#/g, '');
						}
						if (p.indexOf("#datestring#") != -1) {
							isFake = true;
							p = p.replace(/(\")/g, '');
							p = p.replace(/#datestring#/g, '');
						}
						
						if (isFake) {
							if (isar)
								l.push({ Text: '<span class="jsonnumber">' + p + '</span><span class="jsontag">,</span>', Step: s });
							else
								l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">: </span><span class="jsonnumber">' + p + '</span><span class="jsontag">,</span>', Step: s });
						} else {
							if (isar)
								l.push({ Text: '<span class="jsonstring">"' + p + '"</span><span class="jsontag">,</span>', Step: s });
							else
								l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">: </span><span class="jsonstring">"' + p + '"</span><span class="jsontag">,</span>', Step: s });
						}
                        break;
                    case 'boolean':
                        if (isar)
                            l.push({ Text: '<span class="jsonboolean">"' + p + '"</span><span class="jsontag">,</span>', Step: s });
                        else
                            l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">: </span><span class="jsonboolean">' + p + '</span><span class="jsontag">,</span>', Step: s });
                        break;
                    case 'number':
                        if (isar)
                            l.push({ Text: '<span class="jsonnumber">' + p + '</span><span class="jsontag">,</span>', Step: s });
                        else
                            l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">: </span><span class="jsonnumber">' + p + '</span><span class="jsontag">,</span>', Step: s });
                        break;
                    case 'object':
                        if (p === null) {
                            if (isar)
                                l.push({ Text: '<span class="jsonnull">' + p + '</span><span class="jsontag">,</span>', Step: s });
                            else
                                l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">: </span><span class="jsonnull">' + p + '</span><span class="jsontag">,</span>', Step: s });
                        }
                        else if (p.length == undefined) {
                            //object
                            if (!isar) {
                                l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">:</span>', Step: s });
                            }
                            l.push({ Text: '<span class="jsontag">{</span>', Step: s });
                            r(p, false, s + 1);
                            l.push({ Text: '<span class="jsontag">},</span>', Step: s });
                        }
                        else {
                            //array
                            if (!isar) {
                                l.push({ Text: '<span class="jsonname">"' + n + '"</span><span class="jsontag">:</span>', Step: s });
                            }
                            l.push({ Text: '<span class="jsontag">[</span>', Step: s });
                            r(p, true, s + 1);
                            l.push({ Text: '<span class="jsontag">],</span>', Step: s });
                        }
                        break;
                    default: break;
                }
            }
            var last = l.pop();
            var ct = ',</span>';
            if (last.Text.substr(last.Text.length - ct.length) == ct)
                l.push({ Text: last.Text.replace(ct, '</span>'), Step: last.Step });
            else
                l.push(last);
        };
 
        if (ob.length == undefined) {
            //object
            l.push({ Text: '<span class="jsontag">{</span>', Step: 0 });
            r(ob, false, 1);
            l.push({ Text: '<span class="jsontag">}</span>', Step: 0 });
        }
        else {
            //array
            l.push({ Text: '<span class="jsontag">[</span>', Step: 0 });
            r(ob, true, 1);
            l.push({ Text: '<span class="jsontag">]</span>', Step: 0 });
        }
 
        var f = true;
        c.addClass('KelpJSONView');
        c.append('<ol></ol>');
        c = c.find('ol');
        for (var index in l) {
            var jobject = l[index];
            if (f) {
                c.append($('<li class="jsonhighlight">' + repeat(' &nbsp; &nbsp;', jobject.Step) + jobject.Text + '</li>'));
                f = false;
            }
            else {
                c.append($('<li>' + repeat(' &nbsp; &nbsp;', jobject.Step) + jobject.Text + '</li>'));
                f=true;
            }
        }
    }
});