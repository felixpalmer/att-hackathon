var doll_sharer = function() {

    var server = "http://localhost:8888";
    var doll_id;
    var callbacks = {};

    var send_update = function(component_id, update) {

        var update_json = JSON.stringify(update);
        $.ajax({
            url: server + "/doll/" + doll_id + "/" + component_id + "/updates/",
            contentType: "application/json",
            data: update_json,
            type: "POST",
        });
    }

    var poll_for_updates = function() {

        $.ajax({
            url: server + "/doll/" + doll_id + "/updates/",
            dataType: "json",
            complete: function(request, textStatus) {
                poll_for_updates();
            },
            success: function(data, textStatus, request) {
                var idx;
                var jdx;
                var component_id;
                var updates;
                for (idx = 0; idx < data.components.length; idx++) {
                    component_id = data.components[idx].component;
                    if (component_id in callbacks) {
                        updates = data.components[idx].updates;
                        for (jdx = 0; jdx < updates.length; jdx++) {
                            callbacks[component_id](updates[jdx]);
                        }
                    }
                }
            }
        });
    }

    var initialize = function(new_doll_id, new_server) {
        doll_id = new_doll_id;
        server = new_server || server;
    }

    var add_update_handler = function(component_id, handler) {
        callbacks[component_id] = handler;
    }

    return {
        initialize: initialize,
        send_update: send_update,
        add_update_handler: add_update_handler,
        start_polling: poll_for_updates
    }
}();
