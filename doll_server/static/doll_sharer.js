var doll_sharer = function() {

    var server = "http://50.56.70.123:8888";
    var doll_id;
    var callbacks = {};

    var send_update = function(doll_id, component_id, update) {

        var update_json = json.dumps(update);

        $.ajax({
            url: spec.server + "/doll/" + doll_id + "/" + component_id + "/updates/",
            contentType: "application/json",
            data: update_json,
            type: "POST",
        });
    }

    var poll_for_updates = function() {

        $.ajax({
            url: spec.server + "/doll/" + doll_id + "/updates/",
            dataType: "json",
            complete: function(request, textStatus) {
                poll_for_updates(doll_id, component_id);
            },
            success: function(data, textStatus, request) {
                var idx;
                var jdx;
                var updates;
                for (idx = 0; idx < data.components.length; idx++) {
                    updates = data.components[idx].updates;
                    for (jdx = 0; jdx < updates.length; jdx++) {

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
