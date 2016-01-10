(function($) {
    var defaults = {
        "json": undefined,
        "item-selected-icon": "ace-icon fa fa-check",
        "item-unselected-icon": "ace-icon fa fa-times",
        "tree-open-icon": "ace-icon tree-minus",
        "tree-close-icon": "ace-icon tree-plus"
    }
    $.fn.extend({
        "jsontree": function(command) {
            var jsonRoot = $(this);
            var options = $.extend(defaults, command);
            if (typeof(command) === "string") {
                return commandMode(command);
            } else {
                initialMode();
                return $(this);
            }

            function commandMode(option) {
                var commands = {
                    "getSelectedItems": getSelectedItems,
                };
                if (option in commands) {
                    return commands[option]();
                }
            }

            function initialMode() {
                var ckmsg = checkOptions(jsonRoot);
                if (ckmsg.length > 0) {
                    throw ckmsg;
                }
                if (!jsonRoot.hasClass("tree")) {
                    jsonRoot.addClass("tree");
                }
                jsonRoot.html("");
                generateJsonTree(options.json, jsonRoot[0], "JSON");
                jsonRoot.on("click.jsontree", ".tree-item", function(ev) {
                    toggerTreeNode(ev.currentTarget);
                }).on("click.jsontree", ".tree-branch-header", function(ev) {
                    toggerFolder(ev.currentTarget);
                });
            }

            function checkOptions(element) {
                if ($.isEmptyObject(options.json)) {
                    return "json object is empty";
                }
                //var id = element.attr("id");
                //if (id.length == 0) {
                //    return "you must set id selector";
                //}
                if (!$.nodeName(element[0], "ul")) {
                    return "you must use ul";
                }
                var jsonType = typeof(options.json);
                if (jsonType !== "object") {
                    return "you must set json object as the param";
                }
                return "";
            }

            function generateJsonTree(jsonObj, domObj, pathFlag) {
                for (var key in jsonObj) {
                    var value = jsonObj[key];
                    var valueType = typeof(value);
                    var li = document.createElement("li");
                    var jsonPath = getJsonPath(pathFlag, key, jsonObj);

                    if (valueType === "object" && !$.isEmptyObject(value)) {
                        li.setAttribute("class", "tree-branch");
                        li.setAttribute("data-value", JSON.stringify(value));
                        li.setAttribute("data-path", jsonPath);
                        var div = document.createElement("div");
                        div.setAttribute("class", "tree-branch-header");
                        var span = document.createElement("span");
                        span.setAttribute("class", "tree-branch-name");
                        var icon = document.createElement("i");
                        icon.setAttribute("class", ("icon-folder " + options['tree-close-icon']));
                        var span1 = document.createElement("span");
                        span1.setAttribute("class", "tree-label");

                        span1.appendChild(document.createTextNode(key));
                        span.appendChild(icon);
                        span.appendChild(span1);
                        div.appendChild(span);
                        li.appendChild(div);

                        var ul = document.createElement("ul");
                        ul.setAttribute("class", "tree-branch-children hidden");
                        li.appendChild(ul);
                        generateJsonTree(value, ul, jsonPath);
                    } else {
                        if (valueType === "object") {
                            value = JSON.stringify(value);
                        }
                        li.setAttribute("class", "tree-item");
                        li.setAttribute("data-value", value);
                        li.setAttribute("data-path", jsonPath);
                        var span = document.createElement("span");
                        span.setAttribute("class", "tree-item-name");
                        var icon = document.createElement("i");
                        icon.setAttribute("class", ("icon-item " + options['item-unselected-icon']));
                        var span1 = document.createElement("span");
                        span1.setAttribute("class", "tree-label");

                        span1.appendChild(document.createTextNode(key));
                        span.appendChild(icon);
                        span.appendChild(span1);
                        li.appendChild(span);
                    }
                    domObj.appendChild(li);
                }
            }

            function getJsonPath(flag, key, parentValue) {
                function isArray(value) {
                    return value && typeof value === "object" && value.constructor === Array;
                }
                var path;
                if (isArray(parentValue)) {
                    path = flag + "[" + key + "]";
                } else {
                    if (key.indexOf(".") > -1) {
                        path = flag + "[\"" + key + "\"]";
                    } else {
                        path = flag + "." + key;
                    }
                }
                return path;
            }

            function closeFolder(element) {
                var $el = $(element);
                var $branch = $el.closest('.tree-branch');
                var $treeFolderContent = $branch.find('.tree-branch-children');
                var $treeFolderContentFirstChild = $treeFolderContent.eq(0);

                $treeFolderContentFirstChild.addClass('hidden');
                $branch.find('> .tree-branch-header .icon-folder').eq(0)
                    .removeClass(options['tree-open-icon']).addClass(options['tree-close-icon']);
            }

            function openFolder(element) {
                var $el = $(element);

                var $branch = $el.closest('.tree-branch');
                var $treeFolderContent = $branch.find('.tree-branch-children');
                var $treeFolderContentFirstChild = $treeFolderContent.eq(0);

                $treeFolderContentFirstChild.removeClass('hide hidden');
                $branch.find('> .tree-branch-header .icon-folder').eq(0)
                    .removeClass(options['tree-close-icon']).addClass(options['tree-open-icon']); //ACE

            }

            function toggerFolder(element) {
                var $el = $(element);
                if ($el.find('.' + $.trim(options['tree-close-icon']).replace(/(\s+)/g, '.')).length) {
                    openFolder(element);
                } else if ($el.find('.' + $.trim(options['tree-open-icon']).replace(/(\s+)/g, '.')).length) {
                    closeFolder(element);
                }
            }

            function toggerTreeNode(clickedElement) {
                var clicked = {};
                clicked.$element = $(clickedElement);
                clicked.$icon = clicked.$element.find('.icon-item');

                if (clicked.$element.hasClass("tree-selected")) {
                    clicked.$element.removeClass('tree-selected');
                    if (clicked.$icon.hasClass(options['item-selected-icon'])) {
                        clicked.$icon.removeClass(options['item-selected-icon']).addClass(options['item-unselected-icon']);
                    }
                    clicked.$element.trigger("unselected.item.jsontree", {
                        data: {
                            "path": clicked.$element.data("path"),
                            "key": clicked.$element.find(".tree-label").eq(0).text(),
                            "value": clicked.$element.data("value")
                        },
                        item: clicked.$element,
                        eventType: "unselected"
                    });
                } else {
                    clicked.$element.addClass('tree-selected');
                    if (clicked.$icon.hasClass(options['item-unselected-icon'])) {
                        clicked.$icon.removeClass(options['item-unselected-icon']).addClass(options['item-selected-icon']);
                    }
                    clicked.$element.trigger("selected.item.jsontree", {
                        data: {
                            "path": clicked.$element.data("path"),
                            "key": clicked.$element.find(".tree-label").eq(0).text(),
                            "value": clicked.$element.data("value")
                        },
                        item: clicked.$element,
                        eventType: "unselected"
                    });
                }
            }

            function getSelectedItems() {
                var selected = jsonRoot.find('.tree-selected');
                var results = [];
                $.each(selected, function(index, element) {
                    var $ele = $(element);
                    results.push({
                        "path": $ele.data("path"),
                        "key": $ele.find(".tree-label").eq(0).text(),
                        "value": $ele.data("value"),
                    });
                });
                return results;
            }
        }
    });
})(jQuery);