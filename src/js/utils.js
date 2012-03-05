function EventDispatcher(events) {
    var listeners = [];
    if (events) {
        for (var i = 0; i < events.length; i++) {
            this[events[i]] = events[i];
        }
    }

    this.getListeners = function () {
        return listeners;
    }

    this.addEventListener = function (title, method, handler) {

        function add(title) {
            if (!listeners[title]) { listeners[title] = []; }
            listeners[title].push({ method: method, handler: handler });
        }

        if (typeof(title) == 'object' && title.length) {

            for (var i = 0; i < title.length; i++) {
                add(title[i]);
            }

        } else {
            add(title);
        }


        return this;
    };

    this.removeEventListener = function (title, method) {
        if (listeners[title]) {
            for (var i = 0; i < listeners[title].length; i++) {
                if (listeners[title][i].method == method) {
                    listeners[title].splice(i, 1);
                }
            }
        }
        return this;
    };

    this.dispatchEvent = function (title, args) {
        if (listeners[title]) {
            for (var i = 0; i < listeners[title].length; i++) {
                listeners[title][i].method(args);
            }
        }
        return this;
    };

    this.removeAllEventListeners = function () {
        listeners = [];
        return this;
    };

    this.removeEventListenersByHandler = function (title, handler) {
        if (listeners[title]) {
            for (var i = 0; i < listeners[title].length; i++) {
                if (listeners[title][i].handler == handler) {
                    listeners[title].splice(i, 1);
                }
            }
        }
        return this;

    };

    return this;
}

Array.prototype.indexOf = Array.indexOf || function (needle) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == needle) {
            return i;
        }
    }
    return -1;
};

Array.prototype.indexOfObject = function (prop, val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return i;
        } else if (getNestedObjectProperty(this[i], prop) == val) {
            return i;
        }
    }
    return -1;
};



function updateNestedObjectProperty(ob, key, val) {
    var path = key.split('.');

    var objTraversals = 0;

    function traverse(obj) {
        if (typeof obj == 'object') {
            for (var y in obj) {
                if (y == path[objTraversals]) {
                    if (objTraversals == path.length - 1) {
                        obj[y] = val;
                        return true;
                    } else {
                        objTraversals++;
                        return traverse(obj[y]);
                    }
                }
            }
        }
        return false;
    }

    for (var x in ob) {
        if (x == path[objTraversals]) {
            if (objTraversals == path.length - 1) {
                ob[x] = val;
                return;
            } else {
                objTraversals++;
                return traverse(ob[x]);
            }
        }
    }
    ob[key] = val;
};

function getNestedObjectProperty(ob, key) {
    var path = key.split('.');
    var objTraversals = 0;

    function traverse(obj) {
        if (typeof obj === 'object') {
            for (var y in obj) {
                if (y === path[objTraversals]) {
                    if (objTraversals === path.length - 1) {
                        return obj[y];
                    } else {
                        objTraversals++;
                        return traverse(obj[y]);
                    }
                }
            }
        }
        return null;
    }
    for (var x in ob) {
        if (x === path[objTraversals]) {
            if (objTraversals === path.length - 1) {
                return ob[x] !== null ? ob[x] : null;
            } else {
                objTraversals++;
                return traverse(ob[x]);
            }
        }
    }
    return null;
};


function PortMessenger(port) {
    var $this = this,
        IsConnected = false;

    EventDispatcher.call(this);

    port.onMessage.addListener(function (e) {
        $this.dispatchEvent(e.title, e.data);
    });

    port.onDisconnect.addListener(function (e) {
        $this.removeAllEventListeners();
        $this.port = null;
    });

    this.port = port;

    this.receive = this.addEventListener;

    this.send = function (title, data) {
        if ($this.port) {
            port.postMessage({ title: title, data: data });
        }
    };

    return this;

}

function $(e) {
    /// <summary>Gets a DOM element by ID.</summary>
    /// <param name="id" type="String">The DOM Element requested</param>
    /// <returns type="DOMElement">Returns a DOM Element.</returns>
    return document.getElementById(e);
}
function $$(e) {
    return document.createElement(e);
}

function getXMLString(xml, node) {
    return xml.querySelectorAll(node)[0].firstChild.nodeValue;
}


function LocalStoreDAL(storage, defaultModel) {
    /// <summary>Gets and sets localstorage</summary>
    /// <param name="storage" type="String">The name of the localstorage to get or set</param>
    /// <param name="model" type="Object">Object to store</param>
    /// <returns type="LocalstorageDAL">Returns a localStorage access layer</returns>

    this.storage = storage;

    if (!localStorage[storage] || typeof localStorage[storage] == 'undefined') {
        localStorage[storage] = JSON.stringify(defaultModel || {});
    }

    this.set = function (key, val) {
        /// <summary>Sets the value of a localStorage item</summary>
        /// <param name="key" type="String">The key of the item in localStorage</param>
        /// <param name="value">The value to store</param>
        var localData = JSON.parse(localStorage[this.storage]);
        updateNestedObjectProperty(localData, key, val);
        localStorage[storage] = JSON.stringify(localData);
    };

    this.get = function (key) {
        var localData = JSON.parse(localStorage[this.storage]);
        if (key) {
            return getNestedObjectProperty(localData, key);
        }
        return localData;
    };

    this.reset = function (newModel) {
        localStorage[this.storage] = JSON.stringify(newModel);
    };

}