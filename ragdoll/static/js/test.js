var world;
var bodies = [];
var boxes  = [];
var up;



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
var doodoll = {};

var fixDef = new b2FixtureDef();
fixDef.density = 10.0;
fixDef.shape = new b2PolygonShape();

var bodyDef = new b2BodyDef();
bodyDef.type = b2Body.b2_staticBody;

function Start() 
{	
    // Init stage & world
    world = new b2World(new b2Vec2(0, 10),  true);
    
    var stage = new Stage("c");
    stage.eventChildren = false;
    stage.addEventListener(Event.ENTER_FRAME, onEF);

    // background
    var bg = new Bitmap( new BitmapData("winter2.jpg", 1) );
    bg.scaleX = stage.stageWidth / 1024;
    bg.scaleY = stage.stageHeight / 512;
    stage.addChild(bg);

    up = new b2Vec2(0, -700);

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

    for(var r = 0; r < 3; r++)
    {
        addRagdollToWorld(world, stage);
    }
}

function addRagdollToWorld(world, stage)
{
    // Create a ragdoll
    var personX = Math.random()*7;
    var personY = (Math.random() - 1)*5;
    var jointGap = 0.0;
    var armLength = 1.5;
    var armWidth = 0.3;
    var legLength = 2.0;
    var legWidth = 0.3;
    
    var head = [personX, personY, 1.5, 1.5]; // x, y, w, h
    var body = [head[0], head[1] + head[3] + jointGap, 1.5, 2.5];
    var leftArm = [body[0] - (armLength + jointGap), body[1], armLength, armWidth];
    var rightArm = [body[0] + body[2] + jointGap, body[1], armLength, armWidth];    
    var leftLeg = [body[0] + 0.1, body[1] + body[3] + jointGap, legWidth, legLength];
    var rightLeg = [body[0] + body[2] - (legWidth + 0.1), body[1] + body[3] + jointGap, legWidth, legLength];    

    var headBody = addRectToWorld(head, world, stage);
    var bodyBody = addRectToWorld(body, world, stage);
    var leftArmBody = addRectToWorld(leftArm, world, stage);
    var rightArmBody = addRectToWorld(rightArm, world, stage);
    var leftLegBody = addRectToWorld(leftLeg, world, stage);
    var rightLegBody = addRectToWorld(rightLeg, world, stage);
    
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
    
    world.ClearForces();
}

/**
* Returns a body object (used for joints)
*/
function addRectToWorld(rect, world, stage)
{
    var vertices = [new b2Vec2(0,0), new b2Vec2(rect[2],0), new b2Vec2(rect[2],rect[3]), new b2Vec2(0,rect[3])];
    fixDef.shape.SetAsArray(vertices, 4);            
    bodyDef.position.Set(rect[0], rect[1]);
    bodyDef.type = b2Body.b2_dynamicBody;

    var body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    bodies.push(body);

    // For rendering
    var bd = new BitmapData("box.jpg", 1);
    var box = new Bitmap(bd);
    box.scaleX = rect[2]/2; box.scaleY = rect[3]/2;
    box.addEventListener(MouseEvent.MOUSE_OVER, Jump);
    stage.addChild(box);
    boxes.push(box);

    return body;
}

function onEF(e) 
{
    world.Step(1 / 60,  3,  3);
    world.ClearForces();

    var p, body, box, coef = 180/Math.PI;
    for(var i=0; i<boxes.length; i++)
    {
        body = bodies[i];
        box  = boxes [i];
        p = body.GetPosition();
        box.x = p.x *100;
        box.y = p.y *100;
        box.rotation = body.GetAngle()*coef;
    }
}

function Jump(e)
{
    console.log("Jump!");
    var i = boxes.indexOf(e.target);
    bodies[i].ApplyImpulse(up, bodies[i].GetWorldCenter());
}

window.onload = Start;