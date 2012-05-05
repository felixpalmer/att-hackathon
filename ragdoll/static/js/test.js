// Make life less painful
var		
b2Vec2		= Box2D.Common.Math.b2Vec2,
b2BodyDef	= Box2D.Dynamics.b2BodyDef,
b2Body		= Box2D.Dynamics.b2Body,
b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
b2World		= Box2D.Dynamics.b2World,
b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape,
b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape,
b2RevoluteJointDef	= Box2D.Dynamics.Joints.b2RevoluteJointDef;

// Global shared stuff - 1 meter = 100 pixels
var doodoll;
doodoll = doodoll || {};

doodoll.physics = function()
{
    var fixDef = new b2FixtureDef();
    var bodyDef = new b2BodyDef();
    var scale = 1;
    
    var world;
    var stage;
    var bodies = [];
    var up;
    var canvas_size = 200;
    
    var start = function() 
    {	
        // Init stage & world
        world = new b2World(new b2Vec2(0, 10),  true);
        stage = new Stage("c");
        stage.eventChildren = false;
        stage.addEventListener(Event.ENTER_FRAME, onEF);
        
        fixDef.density = 10.0;
        fixDef.shape = new b2PolygonShape();

        bodyDef.type = b2Body.b2_staticBody;

        // background
        var bg = new Bitmap( new BitmapData("winter2.jpg", 1) );
        bg.scaleX = stage.stageWidth / 1024;
        bg.scaleY = stage.stageHeight / 512;
        stage.addChild(bg);

        up = new b2Vec2(0, -70*scale);

        //create ground
        bodyDef.position.Set(9, stage.stageHeight/100 + 1);
        fixDef.shape.SetAsBox(10, 1);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        //left wall
        bodyDef.position.Set(-1, 3);
        fixDef.shape.SetAsBox(1, 100);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        //right wall
        bodyDef.position.Set(stage.stageWidth/100 + 1, 3);
        fixDef.shape.SetAsBox(1, 100);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        for(var r = 0; r < 2; r++)
        {
            addRagdollToWorld();
        }
    };

    var addRagdollToWorld = function()
    {
        // Create a ragdoll - don't change - bad things will happen
        var personX = Math.random()*7;
        var personY = (Math.random() - 1)*5;
        var jointGap = -0.1 * scale;
        var headSize = 1.5 * scale;
        var bodyLength = 1.5 * scale;
        var bodyWidth = 1.5 * scale;
        var armLength = 1.5 * scale;
        var armWidth = 0.3 * scale;
        var legLength = 1.5 * scale;
        var legWidth = 0.3 * scale;

        var head = [personX, personY, headSize, headSize]; // x, y, w, h
        var body = [head[0], head[1] + head[3] + jointGap, bodyWidth, bodyLength];
        var leftArm = [body[0] - (armLength + jointGap), body[1], armLength, armWidth];
        var rightArm = [body[0] + body[2] + jointGap, body[1], armLength, armWidth];    
        var leftLeg = [body[0] + 0.1, body[1] + body[3] + jointGap, legWidth, legLength];
        var rightLeg = [body[0] + body[2] - (legWidth + 0.1), body[1] + body[3] + jointGap, legWidth, legLength];    

        var headBody = addRectToWorld(head, "6_limbs/head.png");
        var bodyBody = addRectToWorld(body, "6_limbs/torso.png");
        var leftArmBody = addRectToWorld(leftArm, "6_limbs/arm_l.png");
        var rightArmBody = addRectToWorld(rightArm, "6_limbs/arm_r.png");
        var leftLegBody = addRectToWorld(leftLeg, "6_limbs/leg_l.png");
        var rightLegBody = addRectToWorld(rightLeg, "6_limbs/leg_r.png");

        // Link the wee lad up
        var jointDef = new b2RevoluteJointDef();
        jointDef.enableLimit = true;

        // Join head & body
        jointDef.lowerAngle = -Math.PI/6; jointDef.upperAngle = Math.PI/6;
        jointDef.Initialize(headBody, bodyBody, new b2Vec2(body[0] + body[2]/2, body[1]));
        world.CreateJoint(jointDef);

        // Add arms
        jointDef.Initialize(leftArmBody, bodyBody, new b2Vec2(body[0], body[1] + leftArm[3]/2));
        world.CreateJoint(jointDef);
        jointDef.Initialize(rightArmBody, bodyBody, new b2Vec2(body[0] + body[2], body[1] + rightArm[3]/2));
        world.CreateJoint(jointDef);

        // Add legs
        jointDef.Initialize(leftLegBody, bodyBody, new b2Vec2(leftLeg[0] + leftLeg[2]/2, body[1] + body[3]));
        world.CreateJoint(jointDef);
        jointDef.Initialize(rightLegBody, bodyBody, new b2Vec2(rightLeg[0] + rightLeg[2]/2, body[1] + body[3]));
        world.CreateJoint(jointDef);
        
        // Draw
        for(var b = 0; b < doodoll.boxes.length; b++)
        {
            var renderer = doodoll.drawing.new_gfx_renderer({ canvas_id : b});
            var update = {type : "line", 
                              data : {
                                  from : {
                                      x : 0,
                                      y : 0
                                  },
                                  to : {
                                      x : canvas_size,
                                      y : canvas_size
                                  }
                              }
                          };
                          renderer.handle_update(update);

                          update = {type : "line", 
                          data : {
                              from : {
                                  x : canvas_size,
                                  y : canvas_size
                              },
                              to : {
                                  x : canvas_size,
                                    y : canvas_size - 10
                              }
                          }
                      };

            renderer.handle_update(update);
        }
        
        world.ClearForces();
    };

    /**
    * Returns a body object (used for joints)
    */
    var addRectToWorld = function(rect, bg)
    {
        var vertices = [new b2Vec2(0,0), new b2Vec2(rect[2],0), new b2Vec2(rect[2],rect[3]), new b2Vec2(0,rect[3])];
        fixDef.shape.SetAsArray(vertices, 4);            
        bodyDef.position.Set(rect[0], rect[1]);
        bodyDef.type = b2Body.b2_dynamicBody;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        bodies.push(body);

        // For rendering
        var s = new Sprite();
        // s.scaleX = s.scaleY = 100 / canvas_size;
        s.rect = rect;
        s.addEventListener(MouseEvent.MOUSE_OVER, Jump);
        stage.addChild(s);
        doodoll.boxes.push(s);
        
        // Render in bg
        s.graphics.beginBitmapFill(new BitmapData(bg, 0));
        s.graphics.drawRect(0, 0, 200, 200);
        s.graphics.endFill();
        
        return body;
    };

    var onEF = function(e) 
    {
        world.Step(1 / 60,  3,  3);
        world.ClearForces();

        var p, body, box, coef = 180/Math.PI;
        for(var i=0; i<doodoll.boxes.length; i++)
        {
            body = bodies[i];
            box  = doodoll.boxes [i];
            p = body.GetPosition();
            w = box.rect[2]; h = box.rect[3];
            offX = (1.5 - w)/2; offY = (1.5 - h)/2; // TODO - do not hardcode
            box.x = (p.x - offX*Math.cos(body.GetAngle()) + offY*Math.sin(body.GetAngle())) * 100;
            box.y = (p.y - offX*Math.sin(body.GetAngle()) - offY*Math.cos(body.GetAngle())) * 100;
            box.rotation = body.GetAngle()*coef;
            ;
        }
    };

    var Jump = function(e)
    {
        console.log("Jump!");
        var i = doodoll.boxes.indexOf(e.target);
        bodies[i].ApplyImpulse(up, bodies[i].GetWorldCenter());
    };

    return {
        start : start  
    };
}();

// Contains all the boxes to draw 
doodoll.boxes = [];

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
    new_gfx_renderer: function(spec) {

        // Variables
        // For now assume we want to draw into box 0
        var ctx = doodoll.boxes[spec.canvas_id].graphics;
        
        var draw_line;

        var handle_update;

        // Functions
        draw_line = function(line) {
            // ctx.strokeStyle = line.color;
            // ctx.fillStyle = line.color;
            // ctx.lineWidth = line.width;
            // ctx.lineCap = "round";

            if (line.from.x != line.to.x || line.from.y != line.to.y) {
                ctx.moveTo(line.from.x, line.from.y);
                ctx.lineTo(line.to.x, line.to.y);
            } else {
                // // Can't draw a zero-length path, so just draw the point.
                // ctx.beginPath();
                // ctx.arc(line.from.x, line.from.y, 
                //         line.width/2.0, 2*Math.PI, true);
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
    }
};

window.onload = doodoll.physics.start;