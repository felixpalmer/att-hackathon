var log;
var log_object;

if (log === undefined) {
    log = function() {};
}

if (log_object === undefined) {
    log_object = function() {};
}

var doodoll;
doodoll = doodoll || {};

doodoll.drawing = {
    /**
     * Create a new renderer object to draw updates onto a canvas.
     *
     * Spec:
     * - canvas_id - The id of the canvas element to use.
     *
     * Public functions:
     * - handle_update - Draw an update onto the canvas
     */
    new_renderer: function(spec) {

        // Variables
        var canvas = $("#" + spec.canvas_id);
        var ctx = canvas[0].getContext("2d");
        
        var draw_line;

        var handle_update;

        // Functions
        draw_line = function(line) {
            ctx.strokeStyle = line.color;
            ctx.fillStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.lineCap = "round";

            if (line.from.x != line.to.x || line.from.y != line.to.y) {
                ctx.beginPath();
                ctx.moveTo(line.from.x, line.from.y);
                ctx.lineTo(line.to.x, line.to.y);
                ctx.stroke();
            } else {
                // Can't draw a zero-length path, so just draw the point.
                ctx.beginPath();
                ctx.arc(line.from.x, line.from.y, 
                        line.width/2.0, 2*Math.PI, true);
            }
        }

        handle_update = function(update) {
            if (update.type == "line") {
                draw_line(update.data);
            }
        }

        // Spec
        return {
            handle_update: handle_update
        }
    },

    /**
     * Create a new UI engine instance.
     *
     * Spec:
     * - canvas_id - The id of the canvas element to use.
     * - output - The component to send updates to using "handle_update"
     *
     * Public functions:
     * - set_color - Set the drawing color
     * - set_type - Set the type of operation
     * - set_line_width - Set the width for drawing lines
     */
    new_ui_engine: function(spec) {

        // Variables
        var canvas = $("#" + spec.canvas_id);
        var output = spec.output;

        var color = "#000000";
        var type = "line";
        var line_width = 12.0;
        var last_point = null;
        var touch_id = null;

        var canvas_size = {
            width:  canvas[0].width,
            height: canvas[0].height
        };

        var draw_moved;
        var draw_started;
        var draw_ended;
        var touch_with_id;
        var point_for_touch;
        var send_line;

        // Functions
        touch_with_id = function(event_object, this_touch_id) {
            var result;
            var idx;
            var changed_touches = event_object.originalEvent.changedTouches;

            for (idx = 0; idx < changed_touches.length; idx++) {
                if (changed_touches[idx].identifier == this_touch_id) {
                    result = changed_touches[idx];
                    break;
                }
            }

            return result;
        }

        point_for_touch = function(touch) {
            var offset_x = touch.pageX - canvas.position().left;
            var offset_y = touch.pageY - canvas.position().top;

            var point = {
                x: canvas_size.width * offset_x / canvas.width(),
                y: canvas_size.height * offset_y / canvas.height()
            };

            return point;
        }

        draw_started = function(point) {
            last_point = point;
        }

        draw_ended = function(point) {
            if (type === "line") {
                send_line(last_point, point);
            }

            last_point = null;
        }

        draw_moved = function(point) {
            if (type === "line") {
                send_line(last_point, point);
            }
        
            last_point = point;
        }

        send_line = function(from, to) {
            output.handle_update({
                type: "line",
                data: {
                    from: from,
                    to: to,
                    width: line_width,
                    color: color
                }
            });
        }

        // Event Handler
        canvas.on({
            "touchstart":
                function(event_object) {
                    var touch;
                    var point;

                    if (touch_id === null) {
                        touch = event_object.originalEvent.changedTouches[0];
                        touch_id = touch.identifier;
                        point = point_for_touch(touch);

                        draw_started(point);
                    }

                    event_object.originalEvent.preventDefault();
                },
            "touchend touchmove": 
                function(event_object) {
                    var touch;
                    var point;
                    var draw_func;

                    if (touch_id !== null) {
                        touch = touch_with_id(event_object, touch_id);

                        if (touch !== undefined) {
                            point = point_for_touch(touch);

                            if (event_object.type === "touchmove") {
                                draw_moved(point);
                            } else {
                                draw_ended(point);
                                touch_id = null;
                            }
                        }
                    }

                    event_object.originalEvent.preventDefault();
                }

        });
    },

    /**
     * Create a receiver to receive updates from the server.
     *
     * Spec
     * - output - The component to send updates to using "handle_update"
     * - component_id - The id for the component to send
     *
     * Public functions:
     */
    new_receiver: function(spec) {

        var output = spec.output;
        var component_id = spec.component_id;

        var handle_update = function(update) {
            output.handle_update(update);
        }

        doll_sharer.add_update_handler(component_id, handle_update);
    },

    /**
     * Create a sender to send updates to the server.
     *
     * Spec
     * - output - The component to send updates to using "handle_update"
     * - component_id - The id for the component to send
     *
     * Public functions:
     * - handle_update - Send an update to the server and pass it on to the 
     *   renderer.
     */
    new_sender: function(spec) {

        var output = spec.output;
        var component_id = spec.component_id;

        var handle_update;

        // Functions
        handle_update = function(update) {
            doll_sharer.send_update(component_id, update);
            output.handle_update(update);
        }

        // Spec
        return {
            handle_update: handle_update
        }
    },

    /**
     * Create a component drawing element.
     *
     * Spec
     * - canvas_id - The id of the canvas element to use.
     * - component_id - the id of the component being displayed
     */
    new_component_drawer: function(spec) {

        var renderer;
        var sender;
        var ui_engine;

        var canvas_id = spec.canvas_id;
        var component_id = spec.component_id;

        renderer = doodoll.drawing.new_renderer({
            canvas_id: canvas_id
        });

        sender = doodoll.drawing.new_sender({
            output: renderer,
            component_id: component_id
        });

        ui_engine = doodoll.drawing.new_ui_engine({
            canvas_id: canvas_id,
            output: sender
        });

        return {
            renderer: renderer,
            sender: sender,
            ui_engine: ui_engine
        };
    },

    /**
     * Create a component viewing element.
     *
     * Spec
     * - canvas_id - The id of the canvas element to use.
     * - component_id - the id of the component being displayed
     */
    new_component_viewer: function(spec) {

        var renderer;
        var receiver;

        var canvas_id = spec.canvas_id;
        var component_id = spec.component_id;

        renderer = doodoll.drawing.new_renderer({
            canvas_id: canvas_id
        });

        receiver = doodoll.drawing.new_receiver({
            output: renderer,
            component_id: component_id
        });

        return {
            renderer: renderer,
            receiver: receiver,
        };
    }
}
