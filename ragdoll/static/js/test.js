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

    up = new b2Vec2(0, -7);

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

    // var jointDef = new b2RevoluteJointDef();
    // jointDef.enableLimit = true;
    // jointDef.lowerAngle = Math.PI/4;
    // jointDef.upperAngle = 3*Math.PI/2;

    // // Join
    // jointDef.Initialize(pair[0], pair[1], new b2Vec2(pos[0], pos[1] + 2));
    // world.CreateJoint(jointDef);

    // Create a person
    var personX = Math.random()*7;
    var personY = (Math.random() - 1)*5;
    var head = [personX, personY, 1.5, 1.5]; // x, y, w, h
    var body = [personX, personY + 1.8, 1.5, 2.5]; 
    var leftArm = [personX - 1.5, personY + 1.8, 1.4, 0.3];
    var rightArm = [personX + 1.5, personY + 1.8, 1.4, 0.3];    
    var leftLeg = [personX + 0.1, personY + 4, 0.3, 2];
    var rightLeg = [personX + 1.2, personY + 4, 0.3, 2];    

    addRectToWorld(head, world, stage);
    addRectToWorld(body, world, stage);
    addRectToWorld(leftArm, world, stage);
    addRectToWorld(rightArm, world, stage);
    addRectToWorld(leftLeg, world, stage);
    addRectToWorld(rightLeg, world, stage); 
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
    var i = boxes.indexOf(e.target);
    bodies[i].ApplyImpulse(up, bodies[i].GetWorldCenter());
}

window.onload = Start;