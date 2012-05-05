var world;
var bodies = [];
var boxes  = [];
var up;

function Start() 
{	
	var stage = new Stage("c");
	stage.eventChildren = false;
	stage.addEventListener(Event.ENTER_FRAME, onEF);
	
	// background
	var bg = new Bitmap( new BitmapData("winter2.jpg", 1) );
	bg.scaleX = stage.stageWidth / 1024;
	bg.scaleY = stage.stageHeight / 512;
	stage.addChild(bg);
	
	var		
			b2Vec2		= Box2D.Common.Math.b2Vec2,
			b2BodyDef	= Box2D.Dynamics.b2BodyDef,
			b2Body		= Box2D.Dynamics.b2Body,
			b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
			b2World		= Box2D.Dynamics.b2World,
			b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape,
			b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape,
			b2RevoluteJointDef	= Box2D.Dynamics.Joints.b2RevoluteJointDef;
	
	world = new b2World(new b2Vec2(0, 10),  true);
	up = new b2Vec2(0, -7);
	
	// I decided that 1 meter = 100 pixels
	
	var fixDef = new b2FixtureDef();
	fixDef.density = 10.0;
	
	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape();
	
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
	
	// let's add 10 joint boxes
	var count = 1;
	bodyDef.type = b2Body.b2_dynamicBody;
	var bd = new BitmapData("box.jpg", 1);
	var w, h;			// width and height of box
	var barr = [			// box vertices
		new b2Vec2(0,0), new b2Vec2(w,0),
		new b2Vec2(w,h), new b2Vec2(0,h)
	];
    
    var jointDef = new b2RevoluteJointDef();
    jointDef.enableLimit = true;
    jointDef.lowerAngle = Math.PI/4;
    jointDef.upperAngle = 3*Math.PI/2;
	for(var i = 0; i < count; i++)
	{
		// Make 2 rects and join them
		var pair = [];
		var pos = [Math.random()*7, -5 + Math.random()*5]
    	for(var b = 0; b < 2; b++)
    	{
            w = barr[1].x = barr[2].x = 0.3 + Math.random()*0.7;
            h = barr[2].y = barr[3].y = 0.3 + Math.random()*0.7;

            fixDef.shape.SetAsArray(barr, 4);
            bodyDef.position.Set(pos[0], pos[1] + 2*b);

            var body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            pair[b] = body;

            // For rendering
            bodies.push(body);
            var box = new Bitmap(bd);
            box.scaleX = w/2; box.scaleY = h/2;
            box.addEventListener(MouseEvent.MOUSE_OVER, Jump);
            stage.addChild(box);
            boxes.push(box);
	    }
	    
	    // Join
	    jointDef.Initialize(pair[0], pair[1], new b2Vec2(pos[0], pos[1] + 2));
		world.CreateJoint(jointDef);
	}	
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