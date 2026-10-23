"""Build the geometric red-and-black night study used by the portfolio diorama.

Run with Blender 5.2: blender --background --python scripts/build-night-study.py
The exported GLB contains only joined static meshes, with no lights or cameras.
Frames, shelving, furniture and city details are geometry. The supplied image is
sampled only inside the two framed wall paintings. Preview lights/camera are added
after export, so the interactive scene uses the application's own light rig.
"""
import bpy
import math
import os
import random
import subprocess
from mathutils import Vector

random.seed(2407)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'models', 'yor-night-study.glb')
PREVIEW = os.path.join(ROOT, 'artifacts', 'night-study-preview.png')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, color, rough=.5, metal=0, emission=None, strength=1):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=rough
    bs.inputs['Metallic'].default_value=metal
    if emission:
        bs.inputs['Emission Color'].default_value=(*emission,1)
        bs.inputs['Emission Strength'].default_value=strength
    return m

M={
 'wall':mat('Oxblood lacquer wall',(0.023,.008,.007),.56),
 'walnut':mat('Dark carved walnut',(.052,.019,.010),.42),
 'woodgrain':mat('Warm walnut grain',(.09,.035,.016),.55),
 'ebony':mat('Ebony metal',(.018,.022,.026),.39,.6),
 'black':mat('Black case polymer',(.023,.027,.03),.7),
 'leather':mat('Tufted black leather',(.032,.022,.02),.48),
 'bronze':mat('Aged bronze',(.39,.20,.075),.38,.78),
 'gold':mat('Satin brass',(.61,.38,.13),.3,.82),
 'silver':mat('Pewter details',(.25,.29,.31),.28,.75),
 'paper':mat('Aged paper edges',(.47,.39,.26),.8),
 'bookred':mat('Crimson leather books',(.17,.014,.013),.6),
 'bookgreen':mat('Charcoal green books',(.027,.055,.044),.64),
 'bookblack':mat('Black cloth books',(.035,.039,.045),.8),
 'red':mat('Signal crimson',(.36,.009,.009),.47),
 'redglow':mat('Crimson practical lights',(.45,.008,.005),.32,0,(1,.009,.003),3.2),
 'amberglow':mat('Amber practical lights',(.35,.13,.028),.32,0,(1,.26,.045),2.5),
 'city':mat('Midnight skyline',(.009,.017,.028),.7,0,(.015,.025,.045),.4),
 'citywindow':mat('Distant city windows',(.15,.13,.10),.55,0,(.65,.36,.13),1.1),
 'cityred':mat('Distant red navigation lights',(.18,.004,.002),.3,0,(.8,.015,.006),2),
 'screen':mat('Obsidian laptop glass',(.008,.016,.022),.2,.2),
 'ui':mat('Laptop map display',(.11,.006,.004),.5,0,(.8,.035,.012),.9),
 'art':mat('Art charcoal ink',(.026,.012,.014),.9),
 'artgrey':mat('Art warm silver ink',(.24,.24,.22),.9),
}

def finish(obj,name,material):
    obj.name=name
    obj.data.materials.append(M[material] if isinstance(material,str) else material)
    return obj

def box(name,loc,size,material,bevel=0.008,rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object
    o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=1
        bpy.context.view_layer.objects.active=o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if rot:o.rotation_euler=rot
    return finish(o,name,material)

def cyl(name,loc,radius,depth,material,vertices=16,rot=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    o=bpy.context.object
    if rot:o.rotation_euler=rot
    return finish(o,name,material)

def sphere(name,loc,scale,material,segments=16,rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=loc)
    o=bpy.context.object;o.scale=scale
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,material)

def rod(name,a,b,radius,material,vertices=10):
    d=Vector(b)-Vector(a)
    o=cyl(name,(Vector(a)+Vector(b))/2,radius,d.length,material,vertices)
    o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    return o

def line(name,points,radius,material,closed=False):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D'
    c.resolution_u=1;c.bevel_depth=radius;c.bevel_resolution=0
    p=c.splines.new('POLY');p.points.add(len(points)-1)
    for dst,src in zip(p.points,points):dst.co=(*src,1)
    p.use_cyclic_u=closed
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o)
    o.data.materials.append(M[material])
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    return o

def label(name,body,loc,size,material,rot=(math.pi/2,0,0)):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.align_x='CENTER'
    c.extrude=.0005;c.resolution_u=2
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o)
    o.location=loc;o.rotation_euler=rot;o.data.materials.append(M[material])
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    return o

def frame(name,x,y,z,w,h,thickness=.045):
    box(name+' backing',(x,y+.026,z),(w,.07,h),'ebony')
    for inset,bar,ma in [(0,thickness,'walnut'),(.026,.012,'bronze'),(.048,.007,'gold')]:
        for side in [-1,1]:
            box(name+' vertical frame',(x+side*(w/2-inset),y-.025,z),(bar,.055,h-2*inset),ma,.004)
            box(name+' horizontal frame',(x,y-.025,z+side*(h/2-inset)),(w-2*inset,.055,bar),ma,.004)

def emblem(x,y,z,scale=1,material='red'):
    # The owner's angular YA monogram is built with bars, not a texture.
    def r(a,b,w=.018):rod('YA monogram',(x+a[0]*scale,y,z+a[1]*scale),(x+b[0]*scale,y,z+b[1]*scale),w*scale,material,6)
    r((-.20,.26),(-.035,-.02));r((.12,.26),(-.035,-.02));r((-.035,-.02),(-.035,-.25))
    r((-.055,-.25),(.145,.26));r((.145,.26),(.34,-.25));r((.025,-.07),(.27,-.07),.013)
    r((-.24,-.25),(.22,.30),.01)

def reference_painting_material():
    """Keep the supplied artwork as artwork, within a geometric framed room.

    A shared small JPEG is embedded once. UVs below select the two paintings
    already visible inside the user's reference without altering its pixels.
    """
    jpeg=os.path.join(ROOT,'artifacts','operator-paintings-source.jpg')
    os.makedirs(os.path.dirname(jpeg),exist_ok=True)
    subprocess.run(['node','-e',
        "require('sharp')('public/media/operator-reference.webp').resize({width:1024}).jpeg({quality:80}).toFile('artifacts/operator-paintings-source.jpg')"],cwd=ROOT,check=True)
    image=bpy.data.images.load(jpeg,check_existing=True)
    m=mat('Framed reference artwork',(1,1,1),.82)
    bs=m.node_tree.nodes.get('Principled BSDF')
    tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
    m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Emission Color'])
    bs.inputs['Emission Strength'].default_value=.08
    M['referenceart']=m

def picture(name,xmin,xmax,y,zmin,zmax,uv):
    umin,umax,vmin,vmax=uv
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([(xmin,y,zmin),(xmax,y,zmin),(xmax,y,zmax),(xmin,y,zmax)],[],[(0,1,2,3)])
    mesh.uv_layers.new(name='Reference painting crop')
    for loop,coord in zip(mesh.uv_layers[0].data,[(umin,vmin),(umax,vmin),(umax,vmax),(umin,vmax)]):loop.uv=coord
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
    return finish(o,name,'referenceart')

reference_painting_material()

# Open-front architectural shell, with a true cutout for the city window.
box('Raised diorama floor',(0,0,-.10),(7.05,4.9,.20),'ebony',.045)
box('Walnut floor',(0,0,.005),(6.90,4.75,.07),'walnut',.015)
for x in [-3.25+i*.38 for i in range(18)]:
    box('Floor plank seam',(x,0,.045),(.009,4.70,.006),'ebony',0)
    for y in [-1.7,-.2,1.3]:
        box('Plank end grain',(x+.18,y+((int(x*10)%3)*.2),.045),(.36,.007,.006),'woodgrain',0)
for x,w in [(-2.35,2.25),(2.35,2.25)]:
    box('Paneled back wall',(x,2.25,1.75),(w,.16,3.5),'wall',.018)
box('Window upper lintel',(0,2.25,3.29),(2.5,.16,.42),'walnut')
box('Window lower panel',(0,2.25,.4),(2.5,.16,.8),'walnut')
# Side returns are shallow so the orbit view still exposes the interior.
for x in [-3.48,3.48]:
    box('Side mahogany wall',(x,1.0,1.70),(.12,2.5,3.4),'wall')
    for z in [.17,.65,3.12,3.33]:
        box('Side raised molding',(x-.015 if x<0 else x-.02,1,z),(.14,2.5,.035),'bronze',.004)
for z in [.16,.65,3.13,3.35]:
    box('Back continuous molding',(0,2.14,z),(6.95,.065,.045),'bronze',.004)
for x in [-3.30,-1.34,1.34,3.3]:
    box('Wall raised pilaster',(x,2.12,1.76),(.07,.07,3.16),'walnut')
    box('Fine brass wall pilaster',(x-.045,2.07,1.76),(.012,.035,3.16),'bronze',.001)
for x in [-2.82,-1.85,1.85,2.82]:
    for z in [.36,.98]:
        frame('Lower wall panel',x,2.12,z,.76,.47,.018)

# Tall, mullioned picture window and deep skyline. Reflections are intentionally
# omitted so runtime lighting never turns the window into an opaque mirror.
box('Window midnight sky',(0,3.8,2.0),(2.6,.02,3.0),'city',0)
for x in [-1.25,0,1.25]:
    box('Window bronze mullion',(x,2.13,1.97),(.055,.095,2.60),'ebony')
    box('Mullion brass glint',(x-.021,2.07,1.97),(.009,.012,2.60),'bronze',0)
for z in [.71,3.23]:box('Window horizontal frame',(0,2.11,z),(2.59,.12,.07),'ebony')
box('Deep window sill',(0,2.06,.69),(2.68,.35,.085),'walnut')
for i,(x,w,h) in enumerate([(-1.06,.35,1.28),(-.66,.32,1.85),(-.26,.37,1.48),(.18,.37,2.25),(.65,.32,1.58),(1.02,.36,1.85)]):
    y=3.15+(i%2)*.22
    box('City tower',(x,y,.72+h/2),(w,.23,h),'city',0)
    for xx in [x-w*.29,x+w*.29]:
        for j in range(int(h/.12)):
            if random.random()>.37:box('Distant city lit window',(xx,y-.13,.81+j*.12),(.033,.008,.026),'citywindow',0)
    if i in [1,3,5]:
        rod('City roof antenna',(x,y,.72+h),(x,y,1+h),.006,'silver',6)
        sphere('City red beacon',(x,y,1+h),(.021,.018,.018),'cityred',8,4)
        box('City tower red crown',(x,y-.13,.70+h),(w*.7,.01,.025),'cityred',0)

# The supplied man-and-husky portrait is naturally displayed inside a real frame.
frame('Operator and companion portrait',-2.3,1.99,2.15,1.62,1.63,.065)
box('Portrait crimson ground',(-2.3,1.95,2.15),(1.45,.014,1.45),'art',0)
picture('Original operator and companion painting',-3.015,-1.585,1.928,1.43,2.88,(.086,.32,.66,.995))

# The right-hand painting sits behind a geometric red ring and YA emblem.
frame('Eclipse crest artwork',1.95,2.0,2.07,1.28,2.13,.055)
box('Eclipse ink background',(1.95,1.96,2.07),(1.16,.018,2.0),'art',0)
picture('Original eclipse rider painting',1.39,2.51,1.942,1.10,3.04,(.675,.86,.45,1.0))
ring=[]
for i in range(65):
    a=i*math.tau/64;ring.append((1.93+math.cos(a)*.45,1.93,2.59+math.sin(a)*.45))
line('Eclipse red corona',ring,.012,'redglow',True)
line('Eclipse dim outer rim',[(1.93+math.cos(i*math.tau/64)*.473,1.939,2.59+math.sin(i*math.tau/64)*.473) for i in range(65)],.003,'red',True)
rod('Eclipse top glint',(1.95,1.91,2.86),(1.95,1.91,3.03),.004,'amberglow',6)
rod('Eclipse top glint cross',(1.90,1.91,2.95),(2.0,1.91,2.95),.003,'amberglow',6)
emblem(1.91,1.925,1.83,.95,'red')

# Floor-to-ceiling library wing with varied leatherbound spines and brass bands.
bx=2.91;by=1.48;bw=1.02
box('Bookcase backing',(bx,by+.20,1.78),(bw,.07,2.95),'walnut')
for x in [bx-bw/2,bx+bw/2]:box('Bookcase upright',(x,by,1.78),(.075,.52,3.04),'ebony')
for z in [.29,.85,1.41,1.97,2.53,3.1]:
    box('Library shelf',(bx,by-.01,z),(bw,.54,.055),'walnut')
    box('Library shelf brass edge',(bx,by-.29,z),(.99,.022,.018),'bronze',.002)
for level in range(5):
    z=.33+level*.56;x=bx-.45
    while x<bx+.40:
        w=random.uniform(.055,.11);h=random.uniform(.31,.45)
        material=random.choice(['bookred','bookgreen','bookblack'])
        box('Leather book spine',(x+w/2,by-.22,z+h/2),(w,.11,h),material,.004)
        for dz in [.043,h-.037]:box('Book gilded band',(x+w/2,by-.28,z+dz),(w*.85,.008,.009),'bronze',0)
        if random.random()>.40:box('Book spine title',(x+w/2,by-.286,z+h*.57),(w*.55,.008,.031),'paper',0)
        x+=w+.011
box('Library red inner strip',(bx+bw/2-.055,by-.24,1.76),(.012,.015,2.69),'redglow',0)
box('Library inner strip lower',(bx-bw/2+.045,by-.24,1.19),(.012,.015,1.57),'redglow',0)
label('Library plaque','FIELD ARCHIVE',(bx,by-.30,3.15),.067,'gold')

# Left-side narrow display column: polished globe and amber practical lantern.
box('Display console',(-3.04,1.06,.67),(.62,.54,1.22),'walnut',.015)
for z in [.16,.53,.91,1.29]:box('Console shelf trim',(-3.04,.77,z),(.65,.04,.025),'bronze')
for z in [.34,.73,1.12]:
    frame('Console inset drawer',-3.04,.76,z,.48,.23,.018)
    box('Console drawer pull',(-3.04,.70,z),(.12,.04,.018),'bronze',.004)
sphere('Display armillary globe',(-3.04,1.02,1.52),(.20,.20,.20),'ebony',24,12)
for angle in [0,math.pi/3,2*math.pi/3]:
    pts=[]
    for i in range(49):
        t=i*math.tau/48
        pts.append((-3.04+math.cos(t)*.22,1.02+math.sin(t)*math.cos(angle)*.22,1.52+math.sin(t)*math.sin(angle)*.22))
    line('Globe bronze meridian',pts,.007,'bronze',True)
cyl('Globe pedestal',(-3.04,1.02,1.29),.14,.035,'bronze')

# Wingback lounge chair under the seated operator. Tufts and wood/gold piping are
# genuine relief, while open armrests allow his silhouette and rifle to read.
cx=-.5
box('Chair cushion',(cx,.18,.58),(.90,.82,.14),'leather',.07)
box('Chair high back',(cx,.43,1.10),(.86,.16,.87),'leather',.09,rot=(-.08,0,0))
for dx in [-.43,.43]:
    box('Chair wing',(cx+dx,.34,1.14),(.12,.29,.75),'leather',.035)
    box('Chair carved arm',(cx+dx,.10,.82),(.13,.72,.16),'walnut',.055)
    box('Chair arm leather',(cx+dx,.08,.91),(.14,.63,.10),'leather',.035)
    rod('Chair front leg',(cx+dx,-.11,.08),(cx+dx,-.11,.76),.045,'walnut',10)
    rod('Chair back leg',(cx+dx,.50,.08),(cx+dx,.43,.65),.035,'walnut',10)
    rod('Chair front brass foot',(cx+dx,-.11,.07),(cx+dx,-.11,.15),.047,'bronze',10)
for x in [-.27,0,.27]:
    for z in [.86,1.1,1.34]:
        sphere('Chair tuft button',(cx+x,.335,z),(.022,.015,.022),'bronze',8,4)
for dx in [-.37,.37]:rod('Chair back brass piping',(cx+dx,.333,.76),(cx+dx,.333,1.45),.006,'bronze',6)

def field_case(name,x,y,z,w=.72,h=.57,d=.54):
    box(name+' rugged body',(x,y,z+h/2),(w,d,h),'black',.035)
    box(name+' lid split',(x,y-.002,z+h*.73),(w+.015,d+.014,.035),'ebony',.005)
    for side in [-1,1]:
        box(name+' reinforcing strap',(x+side*w*.34,y-d/2-.018,z+h/2),(.052,.03,h*.9),'ebony')
        box(name+' clasp',(x+side*w*.32,y-d/2-.043,z+h*.72),(.065,.022,.09),'bronze',.008)
        for zz in [.035,h-.04]:box(name+' corner armor',(x+side*(w/2-.05),y-d/2-.02,z+zz),(.12,.05,.065),'silver',.007)
    box(name+' handle',(x,y-d/2-.045,z+h*.88),(.22,.03,.033),'ebony')
    for xx in [-.1,.1]:box(name+' handle end',(x+xx,y-d/2-.045,z+h*.85),(.025,.03,.075),'bronze')
    emblem(x,y-d/2-.026,z+h*.36,.30)

field_case('Left expedition trunk',-2.08,-.06,.08,1.14,.77,.76)
field_case('Right expedition trunk',2.12,-.09,.08,.90,.73,.74)
field_case('Right stacked case',2.19,-.04,.83,.71,.42,.59)
field_case('Left small case',-2.14,.02,.87,.75,.33,.58)
label('Left trunk ID','Y / A  -  07',(-2.08,-.465,.23),.070,'bronze')
label('Right trunk ID','FIELD  /  SAS',(2.12,-.475,.25),.055,'bronze')

# Tactical display helmet on the left case, with split night-optic cylinders.
sphere('Display helmet shell',(-2.15,.02,1.43),(.33,.28,.29),'ebony',24,12)
box('Helmet face cutout',(-2.15,-.22,1.35),(.47,.05,.22),'black',.035)
for dx in [-.10,.10]:
    cyl('Helmet night optic',(-2.15+dx,-.34,1.48),.068,.21,'black',16,(math.pi/2,0,0))
    cyl('Night optic lens',(-2.15+dx,-.453,1.48),.048,.008,'screen',16,(math.pi/2,0,0))
    cyl('Night optic brass bezel',(-2.15+dx,-.459,1.48),.055,.01,'bronze',16,(math.pi/2,0,0))
box('Helmet mount',(-2.15,-.23,1.64),(.17,.17,.07),'black')
label('Helmet label','SAS',(-2.15,-.273,1.69),.071,'paper')

# Copper-red tube lantern beside the right stacked case.
lx=2.49;ly=.04;lz=1.30
cyl('Lantern base',(lx,ly,lz),.14,.05,'bronze')
cyl('Lantern top',(lx,ly,lz+.43),.13,.045,'bronze')
cyl('Lantern radiant core',(lx,ly,lz+.23),.045,.37,'redglow')
for i in range(6):
    a=i*math.tau/6;rod('Lantern protective cage',(lx+math.cos(a)*.105,ly+math.sin(a)*.105,lz+.03),(lx+math.cos(a)*.105,ly+math.sin(a)*.105,lz+.41),.007,'ebony',6)
line('Lantern carry handle',[(lx-.08,ly,lz+.46),(lx-.08,ly,lz+.56),(lx+.08,ly,lz+.56),(lx+.08,ly,lz+.46)],.009,'bronze')

# Rich, low foreground desk: the top stays below the rifle and dog's chest.
box('Low walnut command desk',(0,-1.63,.445),(5.44,1.13,.13),'walnut',.035)
box('Desk top black leather inset',(0,-1.61,.516),(4.13,.86,.018),'leather',.035)
for x in [-2.60,2.60]:
    box('Desk bronze edge inlay',(x,-1.63,.516),(.014,1.02,.009),'bronze',0)
    box('Desk carved support',(x,-1.53,.22),(.15,.74,.44),'walnut')
    box('Desk brass foot',(x,-1.53,.055),(.18,.80,.055),'bronze')
for y in [-2.12,-1.15]:box('Desk brass border',(0,y,.518),(5.19,.013,.008),'bronze',0)
for x in [-2.31,-2.16,-2.02,-1.86,1.95,2.11,2.30]:
    box('Desk grain line',(x,-1.62,.513),(.006,.90,.003),'woodgrain',0)
box('Desk front apron',(0,-2.14,.36),(5.15,.055,.15),'ebony')
for x in [-2,-1,0,1,2]:box('Desk apron brass segment',(x,-2.174,.36),(.78,.007,.012),'bronze',0)

# Laptop on the right, tilted open with actual raised keys and a red map display.
box('Laptop base',(1.72,-1.62,.56),(.76,.55,.045),'ebony',.014)
box('Laptop trackpad',(1.72,-1.79,.585),(.25,.12,.003),'black',.006)
for row in range(4):
    for col in range(11):
        box('Laptop key',(1.405+col*.059,-1.61+row*.051,.587),(.047,.036,.007),'black',.003)
screen=box('Laptop display lid',(1.72,-1.286,.86),(.76,.035,.55),'ebony',.015,rot=(-.19,0,0))
box('Laptop red tactical screen',(1.72,-1.313,.861),(.685,.01,.462),'screen',.006,rot=(-.19,0,0))
for i in range(10):
    x=1.43+i*.061
    line('Screen command text',[(x,-1.344,.96),(x+.032,-1.344,.96)],.002,'ui')
for i in range(5):
    z=.71+i*.041
    line('Screen code row',[(1.43,-1.35,z),(1.56+random.random()*.09,-1.35,z)],.002,'ui')
line('Laptop topology map',[(1.79,-1.35,.73),(1.82,-1.35,.87),(1.96,-1.35,.91),(2.0,-1.35,1.04),(1.86,-1.35,1.02),(1.77,-1.35,.94),(1.87,-1.35,.88),(1.96,-1.35,.76)],.003,'ui')
for x,z in [(1.79,.73),(1.82,.87),(1.96,.91),(2,1.04),(1.86,1.02)]:sphere('Map node',(x,-1.35,z),(.008,.003,.008),'redglow',8,4)

# Personal items on the front desk: mug, notebook, pen and a small chess board.
cyl('Black travel mug',(-2.02,-1.69,.75),.105,.43,'ebony',24)
cyl('Mug polished lip',(-2.02,-1.69,.968),.109,.018,'silver',24)
cyl('Mug black coffee',(-2.02,-1.69,.971),.095,.009,'black',24)
emblem(-2.04,-1.797,.76,.23)
line('Mug handle',[(-1.93,-1.69,.84),(-1.84,-1.69,.84),(-1.82,-1.69,.69),(-1.92,-1.69,.65)],.018,'ebony')
box('Notebook paper',(-1.35,-1.83,.553),(.53,.39,.049),'paper',.009,rot=(0,0,-.16))
box('Notebook leather cover',(-1.35,-1.83,.583),(.55,.41,.012),'black',.009,rot=(0,0,-.16))
label('Notebook title','FIELD NOTES',(-1.35,-1.83,.591),.049,'bronze',rot=(0,0,-.16))
rod('Brass fountain pen',(-1.12,-1.46,.55),(-.76,-1.54,.55),.012,'bronze',10)
box('Chessboard',(-.34,-1.76,.55),(.69,.56,.055),'walnut',.01)
for row in range(6):
    for col in range(8):
        if (row+col)%2==0:box('Chessboard dark square',(-.637+col*.085,-1.995+row*.085,.581),(.082,.082,.008),'black',0)
for x,y,h,ma in [(-.57,-1.95,.15,'gold'),(-.40,-1.86,.10,'gold'),(-.15,-1.69,.12,'ebony'),(-.40,-1.6,.15,'ebony'),(-.05,-1.94,.10,'gold')]:
    cyl('Chess piece foot',(x,y,.601),.028,.026,ma,12)
    rod('Chess piece stem',(x,y,.61),(x,y,.60+h),.015,ma,10)
    sphere('Chess piece head',(x,y,.60+h),(.028,.028,.029),ma,12,6)
    if h>.14:
        rod('Chess king crown',(x,y,.60+h),(x,y,.66+h),.007,ma,6)
        rod('Chess king crown cross',(x-.019,y,.64+h),(x+.019,y,.64+h),.006,ma,6)
box('Closed black phone',(.47,-1.79,.545),(.21,.37,.026),'ebony',.015,rot=(0,0,.16))
box('Phone tiny signal',(.47,-1.79,.563),(.12,.20,.002),'screen',.004,rot=(0,0,.16))
box('Metal dog tag',(.79,-1.92,.545),(.10,.16,.014),'silver',.025,rot=(0,0,-.2))
line('Dog tag chain',[(.79+math.cos(i*math.tau/24)*.11,-1.79+math.sin(i*math.tau/24)*.18,.54) for i in range(25)],.004,'silver',True)

# Two rear sconces provide recognizable red practical fixtures even without
# runtime point lights; their real light comes from the application's light rig.
for x in [-1.44,1.39]:
    box('Wall sconce mount',(x,1.99,2.17),(.09,.06,.54),'ebony')
    box('Sconce warm light',(x,1.94,2.17),(.023,.03,.44),'amberglow',.005)
    for z in [1.92,2.42]:box('Sconce bronze cap',(x,1.91,z),(.10,.08,.04),'bronze')

# Join by material: dozens of physical details, a small stable set of draw calls.
groups={}
for o in list(bpy.context.scene.objects):
    if o.type=='MESH' and o.data.materials:
        groups.setdefault(o.data.materials[0].name,[]).append(o)
for material,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    joined=bpy.context.object
    joined.name='Study / '+material
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
root=bpy.data.objects.new('YA / Nocturne Study',None)
bpy.context.collection.objects.link(root)
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':o.parent=root
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,
                         export_yup=True,export_materials='EXPORT',export_cameras=False,
                         export_lights=False,export_extras=False,export_animations=False)
triangles=sum(len(p.vertices)-2 for o in bpy.context.scene.objects if o.type=='MESH' for p in o.data.polygons)
print('NIGHT_STUDY_EXPORT',os.path.getsize(OUT),'bytes',triangles,'triangles',len(groups),'mesh batches')

# Preview only. If the companion asset is available it is imported after export,
# so the independently owned environment GLB never includes duplicate characters.
for character_file in ['yor-operator.glb','yor-husky.glb']:
    character_path=os.path.join(ROOT,'public','models',character_file)
    if os.path.exists(character_path):bpy.ops.import_scene.gltf(filepath=character_path)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=32
scene.cycles.use_denoising=True
scene.render.resolution_x=1360;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world.color=(.055,.065,.09)
scene.view_settings.view_transform='AgX'

def area(name,loc,color,power,size,target):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

area('Preview warm key',(-3,-4,5),(1,.65,.40),420,4.5,(0,0,1))
area('Preview soft cool fill',(3,-3,3),(.29,.39,.65),180,4,(0,0,1.0))
area('Preview red rim',(2,1.4,2.9),(1,.025,.01),180,2,(0,0,1))
area('Preview amber rim',(-2,1.5,2.8),(1,.3,.08),150,2,(0,0,1))
area('Preview window glow',(0,2.2,2.8),(.25,.3,.5),100,2,(0,0,1))
cam_data=bpy.data.cameras.new('Study preview camera');camera=bpy.data.objects.new('Study preview camera',cam_data)
bpy.context.collection.objects.link(camera);camera.location=(0,-7.5,3.30)
camera.rotation_euler=(Vector((0,.3,1.45))-camera.location).to_track_quat('-Z','Y').to_euler()
cam_data.lens=38;scene.camera=camera
os.makedirs(os.path.dirname(PREVIEW),exist_ok=True)
scene.render.filepath=PREVIEW
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'artifacts','night-study.blend'))
bpy.ops.render.render(write_still=True)
print('NIGHT_STUDY_PREVIEW',PREVIEW)
