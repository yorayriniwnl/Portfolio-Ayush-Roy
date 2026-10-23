"""Author the portfolio's volumetric operator and canine companion.

Run with Blender 5.2: blender --background --python scripts/build-operator-model.py
No downloaded meshes, external textures, or image planes are used.  Individual
hair locks, fur, garment panels, fingers and equipment are real mesh geometry.
"""
import bpy, math, random, pathlib, json, struct, zlib, warnings
from mathutils import Vector, Matrix
from math import sin, cos, pi

warnings.filterwarnings('ignore', category=DeprecationWarning)

random.seed(41)
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'models'
ART = ROOT / 'artifacts' / 'operator-model'
OUT.mkdir(parents=True, exist_ok=True)
ART.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.materials): bpy.data.materials.remove(m)

def material(name, color, metal=0, rough=.55, emission=None):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal; bs.inputs['Roughness'].default_value=rough
    if emission:
        bs.inputs['Emission Color'].default_value=(*color,1)
        bs.inputs['Emission Strength'].default_value=emission
    return m

M={
 'cloth':material('Obsidian ripstop',(.022,.025,.029),0,.86),
 'leather':material('Worn glove leather',(.017,.019,.021),0,.53),
 'armor':material('Gunmetal polymer',(.025,.029,.035),.35,.37),
 'rubber':material('Matte rubber',(.009,.011,.014),0,.7),
 'seam':material('Charcoal stitching',(.085,.078,.074),0,.86),
 'red':material('Oxblood embroidered accents',(.32,.012,.021),.18,.6),
 'redbright':material('Crimson insignia',(.65,.022,.035),.18,.4),
 'metal':material('Brushed titanium buckles',(.25,.27,.29),.85,.31),
 'darkmetal':material('Dark weapon steel',(.028,.033,.038),.78,.34),
 'gold':material('Engraved warm brass',(.55,.32,.12),.82,.34),
 'skin':material('Warm shadow skin',(.17,.10,.065),0,.82),
 'hair':material('Black layered hair',(.008,.007,.008),0,.79),
 'hairline':material('Hair highlight strands',(.025,.018,.015),0,.83),
 'ivory':material('Husky warm ivory fur',(.49,.49,.45),0,.94),
 'furblack':material('Husky charcoal guard coat',(.035,.041,.047),0,.9),
 'furgray':material('Husky silver guard coat',(.24,.27,.28),0,.94),
 'nose':material('Canine nose leather',(.012,.016,.019),0,.39),
 'eye':material('Amber living eyes',(.48,.18,.035),.15,.22),
 'dogeye':material('Garnet canine eyes',(.34,.013,.009),.15,.25,emission=.08),
 'eyeWhite':material('Eye sclera',(.52,.46,.37),0,.54),
 'shine':material('Eye catchlights',(.88,.82,.66),0,.12),
 'lens':material('Optical crimson glass',(.28,.008,.014),.55,.14),
}

# Compact real texture images export through glTF.  Surface texture is kept in
# the asset rather than depending on Blender-only procedural shader nodes.
def png(path,w,h,pixels):
    def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
    raw=b''.join(b'\0'+bytes(pixels[y*w*4:(y+1)*w*4]) for y in range(h))
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

def make_textures():
    tex=ART/'textures';tex.mkdir(exist_ok=True)
    size=256;color=[];normal=[];rough=[];leather=[]
    random.seed(913)
    grid=[[random.random() for x in range(17)] for y in range(17)]
    def field(x,y):
        gx=x/size*16;gy=y/size*16;ix=int(gx);iy=int(gy);fx=gx-ix;fy=gy-iy
        fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy)
        return (grid[iy][ix]*(1-fx)+grid[iy][ix+1]*fx)*(1-fy)+(grid[iy+1][ix]*(1-fx)+grid[iy+1][ix+1]*fx)*fy
    for y in range(size):
        for x in range(size):
            n=field(x,y);grain=random.randint(-3,3);weave=2 if (x//2+y//2)%2 else -2
            if .57<n<.69:
                rgb=(31+grain+weave,12+grain,16+grain)
            else:rgb=(16+grain+weave,18+grain+weave,21+grain+weave)
            color.extend((*rgb,255))
            leather.extend((19+grain,18+grain,19+grain,255))
            nx=128+(8 if x%4<2 else -8)+random.randint(-3,3)
            ny=128+(8 if y%4<2 else -8)+random.randint(-3,3)
            normal.extend((nx,ny,253,255));r=219+random.randint(-9,9);rough.extend((255,r,0,255))
    paths={}
    for name,data in [('fabric-color',color),('grain-normal',normal),('fabric-roughness',rough),('leather-color',leather)]:
        path=tex/(name+'.png');png(path,size,size,data);paths[name]=path
    return paths

TP=make_textures()
def textured(key,color=None,strength=.23):
    mat=M[key];nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get('Principled BSDF')
    if color:
        t=nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(TP[color]),check_existing=True)
        links.new(t.outputs['Color'],bs.inputs['Base Color'])
    t=nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(TP['grain-normal']),check_existing=True);t.image.colorspace_settings.name='Non-Color'
    n=nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=strength;links.new(t.outputs['Color'],n.inputs['Color']);links.new(n.outputs['Normal'],bs.inputs['Normal'])
    t=nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(TP['fabric-roughness']),check_existing=True);t.image.colorspace_settings.name='Non-Color'
    separate=nodes.new('ShaderNodeSeparateColor');links.new(t.outputs['Color'],separate.inputs['Color']);links.new(separate.outputs['Green'],bs.inputs['Roughness'])
textured('cloth','fabric-color',.26)
textured('leather','leather-color',.17)
textured('rubber',None,.10)
textured('armor',None,.07)

def empty(name, pos=(0,0,0), parent=None):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); o.location=pos
    if parent: o.parent=parent
    return o

operator=empty('operator-root')
head=empty('operator-head',(-.5,-.035,1.59),operator)
dog=empty('husky-root')
doghead=empty('husky-head',(.9,-.13,1.02),dog)
tail=empty('husky-tail',(.96,.34,.30),dog)

def finish(o,name,mat,parent=operator,smooth=True):
    o.name=name
    if mat: o.data.materials.append(M[mat] if isinstance(mat,str) else mat)
    if smooth and o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    if parent:
        # Preserve the freshly assigned basis (including scale). matrix_world is
        # evaluated lazily, so reading it here would discard sphere dimensions.
        o.parent=parent; o.matrix_parent_inverse=parent.matrix_world.inverted()
    return o

def ell(name,pos,scale,mat,parent=operator,segments=20,rings=14,rot=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=pos)
    o=bpy.context.object; o.scale=scale
    if rot:o.rotation_euler=rot
    return finish(o,name,mat,parent)

def box(name,pos,scale,mat,parent=operator,bevel=.012,rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
    o=bpy.context.object; o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if rot:o.rotation_euler=rot
    if bevel:
        mod=o.modifiers.new('Machined rounded edges','BEVEL');mod.width=bevel;mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,mat,parent)

def mesh(name,verts,faces,mat,parent=operator,smooth=True):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o)
    return finish(o,name,mat,parent,smooth)

def tube(name,points,radii,mat,parent=operator,sides=8):
    points=[Vector(p) for p in points];vs=[];faces=[]
    if isinstance(radii,(float,int)):radii=[radii]*len(points)
    for i,p in enumerate(points):
        direction=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
        reference=Vector((0,0,1)) if abs(direction.z)<.9 else Vector((0,1,0))
        u=direction.cross(reference).normalized();v=direction.cross(u).normalized()
        for j in range(sides):
            a=j*2*pi/sides;vs.append(p+radii[i]*(u*cos(a)+v*sin(a)))
    for i in range(len(points)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(points)-1)*sides+j for j in range(sides))])
    return mesh(name,vs,faces,mat,parent)

def lock(name,points,widths,mat,parent=head,depth=.16,smooth=False):
    """Thin solid swept hair lock; elliptical cross sections are not cards."""
    points=[Vector(p) for p in points];vs=[];fs=[];sides=6
    if smooth:
        dense=[];radii=[]
        for i in range(len(points)-1):
            A=points[max(0,i-1)];B=points[i];C=points[i+1];D=points[min(len(points)-1,i+2)]
            for k in range(3):
                t=k/3;dense.append(.5*((2*B)+(-A+C)*t+(2*A-5*B+4*C-D)*t*t+(-A+3*B-3*C+D)*t*t*t))
                radii.append(widths[i]*(1-t)+widths[i+1]*t)
        points=dense+[points[-1]];widths=radii+[widths[-1]]
    for i,p in enumerate(points):
        d=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
        u=d.cross(Vector((0,1,0))).normalized()
        if u.length<.01:u=d.cross(Vector((1,0,0))).normalized()
        v=d.cross(u).normalized()
        for j in range(sides):
            a=2*pi*j/sides;vs.append(p+u*cos(a)*widths[i]+v*sin(a)*widths[i]*depth)
    for i in range(len(points)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides;fs.append((a,b,b+sides,a+sides))
    fs.extend([tuple(range(sides-1,-1,-1)),tuple((len(points)-1)*sides+j for j in range(sides))])
    return mesh(name,vs,fs,mat,parent)

def segment(name,a,b,r1,r2,mat,parent=operator,wrinkle=0,flatten=1):
    a,b=Vector(a),Vector(b);d=(b-a).normalized()
    u=d.cross(Vector((0,1,0))).normalized()
    if u.length<.1:u=d.cross(Vector((1,0,0))).normalized()
    v=d.cross(u).normalized();vs=[];faces=[];rings=14;sides=20
    for i in range(rings):
        t=i/(rings-1);p=a.lerp(b,t);r=(r1*(1-t)+r2*t)
        r*=.93+.07*sin(pi*t)
        for j in range(sides):
            theta=2*pi*j/sides
            fold=1+wrinkle*(sin(t*31+theta*3)*.5+cos(t*53-theta*2)*.3)*sin(pi*t)
            vs.append(p+r*fold*(u*cos(theta)+v*sin(theta)*flatten))
    for i in range(rings-1):
        for j in range(sides):
            a0=i*sides+j;a1=i*sides+(j+1)%sides;faces.append((a0,a1,a1+sides,a0+sides))
    faces.extend([tuple(range(sides-1,-1,-1)),tuple((rings-1)*sides+j for j in range(sides))])
    return mesh(name,vs,faces,mat,parent)

def torus(name,pos,major,minor,mat,parent=operator,rot=(pi/2,0,0),scale=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=6,location=pos,major_radius=major,minor_radius=minor,rotation=rot)
    o=bpy.context.object
    if scale:o.scale=scale
    return finish(o,name,mat,parent)

def text(name,body,pos,size,mat,parent=operator,rot=(pi/2,0,0),extrude=.0006):
    cu=bpy.data.curves.new(name,'FONT');cu.body=body;cu.size=size;cu.align_x='CENTER';cu.align_y='CENTER';cu.extrude=extrude;cu.bevel_depth=.00025;cu.resolution_u=3
    o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=rot
    return finish(o,name,mat,parent)

def strap(name,points,width,mat='rubber',parent=operator,depth=.009):
    # A broad woven ribbon follows the actual surface rather than an image.
    vs=[];faces=[]
    for i,p in enumerate(points):
        for dx in (-width/2,width/2):
            for dy in (-depth/2,depth/2):vs.append((p[0]+dx,p[1]+dy,p[2]))
    for i in range(len(points)-1):
        k=i*4;faces.extend([(k,k+4,k+6,k+2),(k+1,k+3,k+7,k+5),(k,k+1,k+5,k+4),(k+2,k+6,k+7,k+3)])
    faces.extend([(0,2,3,1),tuple((len(points)-1)*4+j for j in (0,1,3,2))])
    return mesh(name,vs,faces,mat,parent,False)

# Sculpted, seated anatomy hidden by fitted tactical garments.
ell('jacket-shoulder-volume',(-.5,.025,1.185),(.292,.174,.302),'cloth',segments=40,rings=28)
ell('lower-jacket-gather',(-.5,-.015,.925),(.254,.184,.19),'cloth',segments=32,rings=20)
ell('seated-hip-panel',(-.5,.025,.72),(.277,.217,.16),'cloth')
for x,side in [(-.69,'L'),(-.31,'R')]:
    knee=(x,-.48,.57);hip=(x,.01,.72);ankle=(x,-.54,.15)
    segment('trouser-thigh-'+side,hip,knee,.155,.132,'cloth',wrinkle=.12,flatten=.96)
    segment('trouser-shin-'+side,knee,ankle,.125,.075,'cloth',wrinkle=.19)
    ell('articulated-knee-pad-'+side,(x,-.553,.57),(.108,.065,.132),'armor')
    box('knee-pad-ridge-'+side,(x,-.611,.58),(.13,.016,.075),'rubber',bevel=.019)
    tube('knee-pad-red-edge-'+side,[(x-.075,-.608,.62),(x,-.624,.65),(x+.075,-.608,.62)],.004,'red')
    for z in (.515,.635):strap('knee-strap-'+side,[(x-.11,-.48,z),(x,-.52,z),(x+.11,-.48,z)],.027)
    ell('tactical-boot-'+side,(x,-.608,.10),(.095,.182,.093),'leather')
    box('heavy-boot-sole-'+side,(x,-.624,.035),(.195,.322,.054),'rubber',bevel=.026)
    ell('boot-cuff-'+side,(x,-.52,.17),(.085,.10,.12),'leather')
    for k in range(6):
        y=-.735+k*.026
        tube('boot-lacing-'+side,[(x-.043,y,.17-k*.006),(x+.043,y+.014,.17-k*.006)],.0045,'seam',sides=5)
    for sx in (-1,1):
        for k in range(5):box('sole-lug-'+side,(x+sx*.087,-.74+k*.048,.036),(.025,.026,.035),'rubber',bevel=.004)
    strap('thigh-webbing-'+side,[(x-.13,-.27,.70),(x,-.33,.70),(x+.13,-.27,.70)],.042)

# Tactical jacket: raised collar, shoulder caps, folds, red lining and seams.
segment('raised-collar-L',(-.602,.027,1.372),(-.601,.009,1.454),.052,.057,'cloth',flatten=1.3)
segment('raised-collar-R',(-.398,.027,1.372),(-.399,.009,1.454),.052,.057,'cloth',flatten=1.3)
tube('red-collar-piping',[(-.65,-.045,1.40),(-.64,-.075,1.46),(-.60,-.13,1.40),(-.53,-.19,1.21)],.0035,'red')
tube('red-collar-piping-R',[(-.35,-.045,1.40),(-.36,-.075,1.46),(-.40,-.13,1.40),(-.47,-.19,1.21)],.0035,'red')
for s in (-1,1):
    shoulder=(-.5+s*.285,0,1.33)
    ell('quilted-shoulder-cap',shoulder,(.115,.130,.109),'cloth',rot=(0,s*.26,0))
    for j in range(4):
        x=shoulder[0]+s*(j-1.5)*.025
        tube('shoulder-panel-stitch',[(x,-.122,1.33),(x,-.100,1.386),(x,-.045,1.425),(x,.02,1.435)],.0010,'cloth',sides=5)

# Left arm rests across the weapon; right arm rises into the cheek.
arms=[('L',(-.79,-.005,1.29),(-.87,-.18,.98),(-.60,-.42,.85)),
      ('R',(-.21,-.005,1.29),(-.025,-.195,1.025),(-.26,-.31,1.455))]
for side,a,b,c in arms:
    segment('jacket-upper-arm-'+side,a,b,.110,.091,'cloth',wrinkle=.085)
    ell('jacket-elbow-'+side,b,(.093,.096,.093),'cloth')
    segment('jacket-forearm-'+side,b,c,.090,.065,'cloth',wrinkle=.12)
    # Raised folds are offset miniature tubes hugging each sleeve.
    A,B=Vector(b),Vector(c);axis=(B-A).normalized();u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u).normalized()
    for i in range(7):
        t=.12+i*.104;p=A.lerp(B,t);radius=.090*(1-t)+.065*t
        pts=[p+(u*cos(theta)+v*sin(theta))*radius*1.015 for theta in [pi*.98+j*pi/8 for j in range(6)]]
        tube('sleeve-fold-'+side,pts,.0014,'cloth',sides=5)
    # Deep red angular sleeve decoration, volume following cloth.
    for i in range(12):
        t=random.uniform(.07,.9);p=A.lerp(B,t);rad=(.090*(1-t)+.065*t)*1.015
        p+=v*rad
        tube('sleeve-crimson-camo-'+side,[p+u*random.uniform(-.04,.01),p+axis*.025+u*.017,p+axis*.049-u*.014],[.001,.0018,.0004],'red',sides=5)
    segment('cuff-'+side,Vector(c)+(A-B).normalized()*.025,Vector(c)-(A-B).normalized()*.035,.071,.071,'rubber')

# Plate carrier has a shaped thick shell, webbing rows and dimensional pouches.
ell('armored-vest-body',(-.50,-.132,1.13),(.235,.073,.225),'armor',segments=32,rings=24)
box('carrier-central-panel',(-.5,-.208,1.16),(.405,.033,.332),'cloth',bevel=.030)
for s in (-1,1):
    x=-.5+s*.218
    strap('shoulder-carrier-strap',[(x,.03,1.39),(x,-.11,1.405),(x,-.204,1.30),(x,-.233,1.08)],.054)
    box('strap-brass-buckle',(x,-.218,1.296),(.060,.021,.047),'metal',bevel=.004)
    box('buckle-inner-slot',(x,-.233,1.296),(.035,.006,.025),'rubber',bevel=.002)
    for i in range(5):
        box('shoulder-webbing-rib',(x,-.237,1.19-i*.044),(.06,.012,.016),'cloth',bevel=.002)
for row in range(4):
    z=1.25-row*.061
    for col in range(6):
        box('MOLLE-loop',(-.674+col*.069,-.254,z),(.057,.014,.027),'rubber',bevel=.004)
        tube('MOLLE-loop-stitch',[(-.698+col*.069,-.264,z-.009),(-.698+col*.069,-.264,z+.009)],.0014,'seam',sides=4)
for i,x in enumerate([-.66,-.50,-.34]):
    box('magazine-pouch-'+str(i),(x,-.285,1.025),(.137,.082,.205),'cloth',bevel=.014)
    box('pouch-lid-'+str(i),(x,-.331,1.105),(.133,.018,.057),'rubber',bevel=.008)
    tube('pouch-shock-cord-'+str(i),[(x-.045,-.34,1.115),(x,-.35,1.145),(x+.045,-.34,1.115)],.0037,'seam',sides=6)
    box('pouch-retention-tab',(x,-.344,1.055),(.026,.008,.054),'armor',bevel=.004)
    for sx in (-1,1):tube('pouch-side-stitch',[(x+sx*.058,-.329,.941),(x+sx*.058,-.329,1.10)],.0018,'seam',sides=4)
box('red-velcro-namepatch',(-.51,-.259,1.283),(.156,.011,.041),'rubber',bevel=.005)
text('namepatch-operator','Y A',(-.51,-.267,1.284),.031,'redbright')

# Shoulder patch with inset border, wing insignia, lettering and a tiny flag.
patch=box('SAS-shoulder-patch',(-.817,-.126,1.267),(.137,.018,.163),'rubber',bevel=.009,rot=(0,-.18,-.10))
text('SAS-patch-lettering','SAS',(-.817,-.143,1.235),.032,'ivory',rot=(pi/2,0,-.10))
for s in (-1,1):
    for j in range(4):
        tube('wing-patch-embroidery',[(-.817+s*.006,-.146,1.270+j*.004),(-.817+s*(.042-j*.006),-.145,1.295+j*.006)],.0022,'ivory',sides=4)
tube('patch-dagger',[(-.817,-.146,1.276),(-.817,-.147,1.319)],.0025,'metal',sides=5)
box('flag-field',(-.817,-.143,1.200),(.083,.009,.041),'armor',bevel=.001)
for s in (-1,1):tube('flag-saltire',[(-.853,-.149,1.2+s*.017),(-.781,-.149,1.2-s*.017)],.004,'ivory',sides=4)
box('flag-cross-red-vertical',(-.817,-.153,1.200),(.009,.003,.041),'redbright',bevel=0)
box('flag-cross-red-horizontal',(-.817,-.153,1.200),(.083,.003,.008),'redbright',bevel=0)

# Neck chain and separated dog tags.
tube('silver-chain',[(-.60,-.135,1.435),(-.606,-.227,1.35),(-.55,-.280,1.205),(-.5,-.286,1.17),(-.45,-.280,1.205),(-.397,-.227,1.35),(-.40,-.135,1.435)],.0033,'metal',sides=6)
box('tag-one',(-.5,-.301,1.16),(.031,.008,.059),'metal',bevel=.005,rot=(0,.08,-.12))
box('tag-two',(-.477,-.304,1.149),(.027,.008,.054),'red',bevel=.004,rot=(0,-.05,.14))

# Head: shaped skin, sculpted eye sockets, nose bridge, layered real mask.
ell('head-anatomy',(-.5,-.026,1.608),(.143,.127,.183),'skin',head,segments=40,rings=28,rot=(.02,.03,.02))
segment('neck',(-.5,.005,1.36),(-.5,-.005,1.50),.084,.084,'skin',head)
for s in (-1,1):
    ell('ear',(-.5+s*.142,-.005,1.60),(.029,.020,.051),'skin',head,segments=16,rings=12)
    ell('deep-eye-socket',(-.5+s*.055,-.139,1.644),(.051,.018,.027),'hair',head)
    ell('visible-eye',(-.5+s*.055,-.1545,1.645),(.026,.008,.008),'eyeWhite',head,segments=20,rings=12)
    ell('iris',(-.5+s*.052,-.162,1.645),(.0082,.0032,.009),'eye',head,segments=16,rings=10)
    ell('eye-pupil',(-.5+s*.052,-.165,1.645),(.0044,.0019,.0065),'rubber',head,segments=12,rings=8)
    ell('eye-catchlight',(-.5+s*.052-.002,-.1668,1.648),(.0017,.001,.002),'shine',head,segments=8,rings=6)
    tube('brow',[(-.5+s*.024,-.151,1.670),(-.5+s*.061,-.153,1.678),(-.5+s*.094,-.14,1.671)],[.006,.008,.002],'hair',head,sides=7)
    tube('mask-ear-strap',[(-.5+s*.115,-.13,1.604),(-.5+s*.148,-.031,1.612),(-.5+s*.123,.042,1.586)],.007,'rubber',head)
ell('nose-bridge',(-.5,-.145,1.62),(.025,.024,.041),'skin',head,segments=20,rings=14)
# The mask is a wrapped shell, not a flat decal or face card.
vs=[];faces=[]
for row in range(9):
    t=row/8;z=1.614-t*.151
    for j in range(17):
        a=-1.12+j/16*2.24;rx=.140*(1-.19*t);ry=.151*(1-.17*t)
        vs.append((-.5+sin(a)*rx,-.024-cos(a)*ry,z+.011*cos(a)*sin(t*pi)))
for i in range(8):
    for j in range(16):a=i*17+j;faces.append((a,a+1,a+18,a+17))
mask=mesh('tailored-wrap-face-mask',vs,faces,'cloth',head)
sol=mask.modifiers.new('Mask woven thickness','SOLIDIFY');sol.thickness=.006
bpy.context.view_layer.objects.active=mask;bpy.ops.object.modifier_apply(modifier=sol.name)
for k in range(3):
    z=1.572-k*.030
    tube('mask-fold', [(-.619,-.089,z-.006),(-.579,-.155,z),(-.50,-.176,z+.006),(-.421,-.155,z),(-.381,-.089,z-.006)],.0010,'cloth',head,sides=5)
text('mask-YA-embroidery','YA',(-.477,-.180,1.566),.040,'redbright',head,rot=(pi/2,0,-.11))

# Hair uses hundreds of tapered, curved locks.  The silhouette is broken in 3D.
ell('scalp-under-hair',(-.501,-.012,1.718),(.153,.132,.132),'hair',head,segments=32,rings=24)
for i in range(145):
    az=random.uniform(0,2*pi);elev=random.uniform(.10,1.45)
    r=Vector((.157*cos(az)*sin(elev),.139*sin(az)*sin(elev),.135*cos(elev)))
    start=Vector((-.5,-.012,1.729))+r
    # Radial sweep with bent ends; longer fringe over the forward forehead.
    front=sin(az)<-.2
    leng=random.uniform(.070,.145)*(1.12 if front else 1)
    radial=Vector((cos(az)*.65,sin(az)*.65,-.6))
    wind=Vector((.55,-.20,.13))
    pts=[start,start+wind*.034+radial*.018,start+wind*.046+radial*leng*.58,start+wind*.035+radial*leng]
    lock('sculpted-hair-lock',pts,[.004,.008,.0045,.0003],'hair',head,smooth=True)
    if i%2==0:
        pts2=[p+Vector((0,-.003,.003)) for p in pts[1:]]
        tube('fine-hair-ridge',pts2,[.00045,.00050,.00010],'hairline',head,sides=4)
# Layered sweeping fringe avoids a smooth helmet shape.
for i in range(39):
    x=-.645+i*.0075;y=-.10-random.uniform(.005,.035);z=1.779+random.uniform(-.01,.04)
    end=(x+.025,-.169-random.uniform(0,.016),1.635+random.uniform(-.025,.03))
    lock('tousled-fringe',[(x,y,z),(x-.018,y-.043,z-.018),(end[0]-.013,end[1]-.01,end[2]+.037),end],[.003,.006,.004,.0002],'hair',head,smooth=True)

# Headphone arch and dimensional ear cups, logos, screws and connector wiring.
arch=[]
for i in range(23):
    a=i/22*pi;arch.append((-.5+.179*cos(a),.006,1.642+.191*sin(a)))
tube('headphone-metal-headband',arch,.015,'darkmetal',head,sides=10)
tube('headphone-padded-headband',[(x,y-.008,z-.010) for x,y,z in arch[2:-2]],.018,'rubber',head,sides=10)
for s in (-1,1):
    x=-.5+s*.167
    ell('headphone-ear-cushion',(x,-.004,1.638),(.034,.067,.091),'rubber',head,segments=24,rings=16)
    ell('headphone-solid-cup',(x+s*.025,-.008,1.641),(.025,.063,.080),'armor',head,segments=24,rings=16)
    # A front facing badge remains legible from the hero framing.
    box('headphone-red-tab',(x,-.054,1.720),(.022,.020,.029),'red',head,bevel=.004)
    text('headphone-YA','YA',(x,-.070,1.646),.035,'redbright',head,rot=(pi/2,0,-s*.19))
    tube('earcup-cable',[(x,-.01,1.56),(x,.025,1.52),(x+s*.035,.04,1.475),(x+s*.04,-.02,1.41)],.004,'rubber',head)
    for z in (1.586,1.693):ell('earcup-fastener',(x+s*.022,-.047,z),(.004,.004,.004),'metal',head,segments=8,rings=6)

# Five-finger gloves with articulated plates and sewn leather panels.
def glove(name,palm,forward,right,scale=1):
    P=Vector(palm);F=Vector(forward).normalized();R=Vector(right).normalized();N=R.cross(F).normalized()
    palmobj=ell(name+'-palm',P,(.062*scale,.036*scale,.076*scale),'leather')
    # Orient its elongated Z axis along the glove's local forward direction.
    palmobj.rotation_mode='QUATERNION';palmobj.rotation_quaternion=Vector((0,0,1)).rotation_difference(F)
    for i in range(4):
        base=P+R*((i-1.5)*.027*scale)+F*.045*scale
        length=[.062,.074,.069,.054][i]*scale
        p1=base+F*length*.54-N*.010*scale;p2=base+F*length*.79-N*.035*scale;p3=base+F*length*.74-N*.064*scale
        tube(name+'-finger-'+str(i),[base,p1,p2,p3],[.014*scale,.014*scale,.012*scale,.009*scale],'leather',sides=10)
        ell(name+'-knuckle-plate',base+F*.018-N*.015,(.013*scale,.011*scale,.018*scale),'armor',segments=12,rings=10)
        tube(name+'-finger-stitch',[base+N*.011,p1+N*.011,p2+N*.008],.0016,'seam',sides=4)
    thumb=P-R*.061*scale-F*.014*scale
    tube(name+'-thumb',[thumb,thumb+F*.030-R*.017,thumb+F*.061-R*.013],[.020*scale,.017*scale,.012*scale],'leather',sides=10)
    # Raised carbon knuckle group.
    for i in range(3):
        e=ell(name+'-back-armor',P+R*((i-1)*.028*scale)-N*.032,(.021*scale,.013*scale,.033*scale),'armor',segments=14,rings=10)
        e.rotation_mode='QUATERNION';e.rotation_quaternion=Vector((0,0,1)).rotation_difference(F)
    return P
glove('lap-glove',(-.584,-.445,.872),(.66,-.15,-.55),(0.6,0,.8))
glove('raised-glove',(-.277,-.315,1.490),(-.45,.05,.9),(.9,0,.45),.86)
text('glove-YA','YA',(-.58,-.486,.89),.031,'redbright',rot=(pi/2,0,-.45))
# A dimensional analog wristwatch with individual indices and hands.
watchcenter=Vector((-.661,-.428,.893))
torus('watch-rim',watchcenter,.036,.006,'metal')
ell('watch-dial',watchcenter+Vector((0,-.003,0)),(.031,.005,.031),'rubber',segments=24,rings=12)
for j in range(12):
    a=j*pi/6
    tube('watch-hour-marker',[watchcenter+Vector((sin(a)*.025,-.009,cos(a)*.025)),watchcenter+Vector((sin(a)*.028,-.009,cos(a)*.028))],.0015,'ivory',sides=4)
tube('watch-minute-hand',[watchcenter+Vector((0,-.010,0)),watchcenter+Vector((.011,-.010,.019))],.0015,'ivory',sides=4)
tube('watch-hour-hand',[watchcenter+Vector((0,-.011,0)),watchcenter+Vector((-.015,-.011,.005))],.0017,'redbright',sides=4)

# Ornamental rifle prop across the lap.  Detailed visual geometry, no mechanism.
gun=empty('ornamental-rifle-prop',(-.5,-.49,.83),operator)
gun.rotation_euler=(0,.23,-.06)
def gp(v):return gun.matrix_world @ Vector(v)
def gunbox(name,pos,size,mat='darkmetal',bevel=.008):
    o=box(name,pos,size,mat,parent=None,bevel=bevel);o.parent=gun;return o
def guntube(name,points,r,mat='darkmetal',sides=8):
    o=tube(name,points,r,mat,parent=None,sides=sides);o.parent=gun;return o
gunbox('rifle-receiver',(0,0,0),(.40,.082,.118),bevel=.012)
gunbox('rifle-top-rail',(.15,0,.078),(.69,.064,.021),bevel=.003)
gunbox('rifle-foregrip',(.37,0,.012),(.34,.068,.10),bevel=.011)
gunbox('rifle-stock',(-.36,0,.015),(.28,.065,.133),bevel=.013)
gunbox('rifle-stock-shoulder',(-.51,0,.013),(.035,.092,.182),'rubber',bevel=.008)
guntube('rifle-barrel',[(.53,0,.031),(.86,0,.031)],.020,sides=14)
guntube('rifle-muzzle',[(.83,0,.031),(.90,0,.031)],.029,sides=14)
gunbox('rifle-pistol-grip',(-.103,0,-.121),(.063,.059,.151),'rubber',bevel=.013)
gunbox('rifle-curved-magazine',(.085,0,-.154),(.112,.065,.214),bevel=.015)
gunbox('rifle-magazine-lower',(.105,0,-.247),(.114,.068,.042),bevel=.006)
for j in range(15):gunbox('rifle-rail-tooth',(-.17+j*.042,0,.096),(.021,.082,.014),bevel=.002)
for j in range(5):
    gunbox('rifle-foregrip-slot',(.25+j*.05,-.036,.010),(.028,.006,.031),'rubber',bevel=.005)
    gunbox('magazine-raised-rib',(.041+j*.019,-.036,-.159),(.006,.005,.141),'gold',bevel=.001)
for j in range(9):
    x=-.17+j*.069
    gunbox('receiver-pin',(x,-.044,random.uniform(-.032,.032)),(.010,.007,.010),'metal',bevel=.003)
# Gold inlay scrollwork and engraved curls wrap across the weapon surface.
for side in (-1,1):
    for j in range(8):
        cx=-.42+j*.14;cz=.012
        pts=[]
        for k in range(18):
            a=k/17*2.4*pi;r=.005+k/17*.035
            pts.append((cx+cos(a)*r,side*.043,cz+sin(a)*r))
        guntube('engraved-gold-scroll',pts,.0018,'gold',sides=5)
        guntube('engraved-gold-vine',[(cx-.05,side*.043,-.041),(cx-.02,side*.046,.025),(cx+.025,side*.043,.046),(cx+.065,side*.042,.013)],.0022,'gold',sides=5)
gunbox('rifle-orange-counter',(.16,-.049,.017),(.075,.008,.035),'rubber',bevel=.003)
counter=text('rifle-counter','06453',(.16,-.055,.018),.019,'redbright',parent=None);counter.parent=gun

# Husky companion. Layered body contours and anatomical facial markings.
ell('husky-seated-haunch',(.91,.105,.338),(.255,.293,.292),'furblack',dog,segments=32,rings=24)
ell('husky-chest',(.90,-.062,.681),(.221,.218,.343),'furblack',dog,segments=32,rings=24)
ell('husky-white-chest-bib',(.90,-.229,.666),(.172,.065,.271),'ivory',dog,segments=28,rings=20)
for x,s in [(.755,-1),(1.045,1)]:
    segment('husky-foreleg', (x,-.12,.65),(x,-.26,.14),.073,.048,'ivory',dog,wrinkle=.025)
    ell('husky-front-paw',(x,-.322,.097),(.082,.13,.072),'ivory',dog,segments=22,rings=14)
    for t in (-1,0,1):
        tube('husky-toe-cleft',[(x+t*.027,-.427,.08),(x+t*.026,-.416,.116)],.002,'furgray',dog,sides=4)
        ell('husky-claw',(x+t*.026,-.441,.074),(.005,.012,.006),'nose',dog,segments=8,rings=6)
    ell('husky-haunch-side',(.9+s*.19,.15,.26),(.14,.19,.19),'furblack',dog,segments=24,rings=16)
    ell('husky-rear-paw',(.9+s*.22,-.005,.071),(.096,.14,.065),'furgray',dog)

def canine_head():
    # A continuous anatomical loft joins skull, cheek bones and long muzzle.
    # Coat areas are material faces on the volume, not overlapping cheek balls.
    profile=[(.035,1.045,.125,.143),(-.03,1.065,.164,.174),(-.10,1.065,.180,.178),
             (-.17,1.055,.163,.145),(-.225,1.032,.117,.100),(-.28,1.004,.083,.065),
             (-.35,.994,.068,.050),(-.401,.999,.043,.031)]
    verts=[];faces=[];sides=40
    # Cubic interpolation of the profile provides a smooth natural transition.
    dense=[]
    for i in range(len(profile)-1):
        A=Vector(profile[max(0,i-1)]);B=Vector(profile[i]);C=Vector(profile[i+1]);D=Vector(profile[min(len(profile)-1,i+2)])
        for k in range(4):
            t=k/4;dense.append(.5*((2*B)+(-A+C)*t+(2*A-5*B+4*C-D)*t*t+(-A+3*B-3*C+D)*t*t*t))
    dense.append(Vector(profile[-1]))
    for y,z,w,h in dense:
        for j in range(sides):
            a=j*2*pi/sides;verts.append((.9+w*cos(a),y,z+h*sin(a)))
    for i in range(len(dense)-1):
        for j in range(sides):
            a=i*sides+j;faces.append((a,a+sides,(i+1)*sides+(j+1)%sides,i*sides+(j+1)%sides))
    faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(dense)-1)*sides+j for j in range(sides))])
    o=mesh('husky-continuous-skull-muzzle',verts,faces,'furblack',doghead)
    o.data.materials.append(M['ivory']);o.data.materials.append(M['furgray'])
    for p in o.data.polygons:
        c=p.center
        # Local mesh coordinates are authored in world space.
        c=sum((o.data.vertices[v].co for v in p.vertices),Vector())/len(p.vertices)
        dx=abs(c.x-.9)
        if (c.y<-.24 and c.z<1.058) or (c.z<1.055 and c.y<-.095) or (dx<.023 and c.y<-.16 and c.z>1.10):p.material_index=1
        elif c.y<-.1 and c.z<1.10:p.material_index=2
    return o
canine_head()
ell('husky-nose',(.9,-.409,1.0),(.043,.026,.027),'nose',doghead,segments=24,rings=16)
for s in (-1,1):
    ell('husky-nostril',(.9+s*.022,-.435,1.007),(.010,.004,.007),'rubber',doghead,segments=12,rings=8)
    ell('husky-almond-eyesocket',(.9+s*.102,-.215,1.095),(.031,.014,.016),'nose',doghead,segments=24,rings=16,rot=(0,s*.16,s*.18))
    ell('husky-eye',(.9+s*.102,-.228,1.096),(.013,.005,.009),'dogeye',doghead,segments=22,rings=14)
    ell('husky-pupil',(.9+s*.102,-.232,1.097),(.004,.0018,.007),'rubber',doghead,segments=16,rings=12)
    ell('husky-eye-highlight',(.9+s*.099,-.234,1.100),(.0018,.0008,.0024),'shine',doghead,segments=10,rings=8)
    tube('husky-mouth-line',[(.9+s*.075,-.315,.955),(.9+s*.050,-.375,.950),(.9,-.397,.959)],.0026,'nose',doghead,sides=5)
    for j in range(8):
        base=Vector((.9+s*random.uniform(.035,.064),-.377+random.uniform(-.01,.025),.98+random.uniform(-.014,.012)))
        end=base+Vector((s*random.uniform(.06,.095),-.017,random.uniform(-.017,.022)))
        tube('husky-whisker',[base,base.lerp(end,.7)+Vector((0,-.005,.005)),end],[.0007,.0005,.00015],'furgray',doghead,sides=4)

# Tapered triangular ears have inner cupped surfaces and fur borders.
for s in (-1,1):
    x=.9+s*.122
    verts=[(x-s*.066,-.137,1.118),(x+s*.07,-.105,1.131),(x+s*.041,-.069,1.341),
           (x-s*.054,-.018,1.132),(x+s*.065,.005,1.132),(x+s*.041,-.010,1.322)]
    ear=mesh('husky-pointed-ear',verts,[(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)],'furblack',doghead)
    mod=ear.modifiers.new('Soft organic ear edges','BEVEL');mod.width=.016;mod.segments=3
    bpy.context.view_layer.objects.active=ear;bpy.ops.object.modifier_apply(modifier=mod.name)
    mesh('husky-inner-ear',[(x-s*.035,-.143,1.145),(x+s*.044,-.118,1.156),(x+s*.035,-.077,1.296)],[(0,1,2)],'furgray',doghead)
    mesh('husky-inner-ear-ivory',[(x-s*.02,-.147,1.146),(x+s*.033,-.123,1.151),(x+s*.033,-.086,1.272)],[(0,1,2)],'ivory',doghead)

# Real tapered fur clumps along the mane, cheeks, coat and chest silhouette.
def furcoat(center,radii,count,parent,base='furblack',length=(.025,.062),region=None):
    C=Vector(center)
    for i in range(count):
        a=random.uniform(0,2*pi);h=random.uniform(-.94,.94);rho=(1-h*h)**.5
        direction=Vector((rho*cos(a),rho*sin(a),h))
        p=C+Vector((radii[0]*direction.x,radii[1]*direction.y,radii[2]*direction.z))
        if region and not region(p,direction):continue
        down=Vector((direction.x*.32,direction.y*.32,-.80)).normalized()
        L=random.uniform(*length)
        col=base
        if random.random()<.2:col='furgray' if base=='furblack' else 'ivory'
        lock('sculpted-tapered-fur',[p,p+down*L*.6+direction*.005,p+down*L],[.0014,.0012,.00012],col,parent,depth=.36)
furcoat((.9,-.05,.78),(.223,.217,.255),670,dog,length=(.032,.085))
furcoat((.9,-.12,1.025),(.18,.156,.161),350,doghead,length=(.018,.052),region=lambda p,d:d.z<.4 and abs(d.x)>.3)
furcoat((.9,-.23,.65),(.166,.054,.26),320,dog,base='ivory',length=(.021,.057),region=lambda p,d:d.y<-.05)
furcoat((.91,.08,.35),(.255,.287,.27),340,dog,length=(.024,.057),region=lambda p,d:d.y>.0 or abs(d.x)>.7)

# Huskies have a full curled tail, built with overlapping guard-hair layers.
tailpoints=[(.97,.30,.28),(1.18,.38,.28),(1.35,.31,.32),(1.38,.13,.32),(1.28,.02,.34),(1.17,.055,.36)]
tube('husky-curled-tail-core',tailpoints,[.085,.10,.10,.09,.07,.018],'furgray',tail,sides=16)
for i in range(105):
    t=random.uniform(0,len(tailpoints)-1.01);k=int(t);f=t-k
    p=Vector(tailpoints[k]).lerp(Vector(tailpoints[k+1]),f);angle=random.uniform(0,2*pi)
    radius=.07*(1-.5*t/(len(tailpoints)-1));offset=Vector((cos(angle)*radius,0,sin(angle)*radius))
    p+=offset;end=p+Vector((random.uniform(.01,.04),.025,-.018))
    lock('tail-guard-hair',[p,p.lerp(end,.6)+offset*.20,end],[.0025,.0018,.0002],'ivory' if i%4 else 'furblack',tail,depth=.5)

# Harness, fitted helmet, webbing and monocular modules.
ell('husky-helmet-cap',(.9,-.073,1.144),(.168,.144,.075),'armor',doghead,segments=32,rings=18)
strap('husky-helmet-red-center',[(.9,.04,1.16),(.9,-.035,1.211),(.9,-.13,1.204),(.9,-.205,1.167)],.025,'red',doghead)
for s in (-1,1):
    x=.9+s*.153
    strap('helmet-chin-strap',[(x,-.05,1.15),(x+s*.012,-.14,1.02),(.9+s*.10,-.19,.94)],.023,'rubber',doghead)
    box('helmet-side-patch',(x,-.141,1.156),(.068,.018,.047),'rubber',doghead,bevel=.005)
    text('helmet-SAS','SAS',(x,-.153,1.156),.020,'ivory',doghead)
    box('helmet-side-rail',(x,-.09,1.195),(.026,.128,.029),'darkmetal',doghead,bevel=.004)
    for j in range(4):box('helmet-rail-slot',(x,-.135+j*.031,1.212),(.035,.014,.009),'metal',doghead,bevel=.002)
text('helmet-YA','YA',(.902,-.211,1.169),.032,'redbright',doghead)
for x in (1.04,1.085):
    segment('canine-nightvision-module',(x,-.16,1.169),(x,-.29,1.153),.022,.024,'darkmetal',doghead)
    torus('nightvision-rib',(x,-.26,1.157),.023,.0035,'metal',doghead)
    ell('nightvision-glass',(x,-.293,1.153),(.017,.004,.017),'lens',doghead,segments=18,rings=12)
ell('husky-harness-chest',(.9,-.227,.764),(.157,.050,.159),'cloth',dog,segments=24,rings=16)
for s in (-1,1):
    strap('canine-harness-strap',[(.9+s*.17,.07,.85),(.9+s*.19,-.13,.87),(.9+s*.10,-.274,.78),(.9+s*.065,-.27,.63)],.039,'rubber',dog)
    box('canine-harness-buckle',(.9+s*.13,-.269,.82),(.047,.018,.035),'metal',dog,bevel=.004)
box('canine-chest-patch',(.9,-.287,.772),(.109,.015,.080),'rubber',dog,bevel=.007)
text('canine-SAS-patch','SAS',(.9,-.299,.788),.030,'ivory',dog)
text('canine-YA-patch','YA',(.9,-.301,.751),.022,'redbright',dog)
torus('husky-collar',(.9,-.077,.892),.185,.021,'rubber',dog,rot=(0,0,0),scale=(1,.84,1))
torus('husky-collar-ring',(.9,-.255,.886),.018,.003,'metal',dog)

# Lift the fitted helmet above the anatomical forehead, including its rails and
# lenses, while retaining the chin strap under the jaw.
for o in list(bpy.data.objects):
    if o.name.startswith(('husky-helmet-','helmet-','canine-nightvision-','nightvision-')) and 'chin' not in o.name:
        o.location.z+=.04

# Consolidate by animation parent. All visible geometry remains real mesh data.
def descends(o,root):
    p=o.parent
    while p:
        if p==root:return True
        p=p.parent
    return False

def consolidate(root):
    members=[o for o in bpy.data.objects if o.type in {'CURVE','FONT'} and descends(o,root)]
    for o in members:
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        bpy.ops.object.convert(target='MESH')
    for group in [o for o in bpy.data.objects if o.type=='EMPTY' and (o==root or descends(o,root))][::-1]:
        objects=[o for o in bpy.data.objects if o.type=='MESH' and o.parent==group]
        if not objects:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join()
        joined=bpy.context.object;joined.name=group.name+'-geometry'
        # Remove duplicated slots added by join; exporter reuses material IDs.
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)

consolidate(operator);consolidate(dog)

def add_surface_uvs(root):
    bpy.context.view_layer.update()
    for obj in [o for o in bpy.data.objects if o.type=='MESH' and descends(o,root)]:
        # Primitive UV layers otherwise survive a join as a second complete
        # attribute buffer. Keep one deliberately authored surface coordinate.
        for layer in list(obj.data.uv_layers):obj.data.uv_layers.remove(layer)
        uv=obj.data.uv_layers.new(name='Woven surface UV')
        for face in obj.data.polygons:
            for loop_index in face.loop_indices:
                p=obj.matrix_world @ obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
                # Continuous oblique coordinates preserve shared vertices at
                # every smooth surface; per-face box projection doubles the
                # mesh buffer unnecessarily along hair and fur rings.
                coord=((p.x+p.y*.37)*5,(p.z+p.y*.19)*5)
                uv.data[loop_index].uv=coord
add_surface_uvs(operator);add_surface_uvs(dog)

def export(root,path):
    bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
    for o in bpy.data.objects:
        if descends(o,root):o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,
                             export_animations=False,export_materials='EXPORT',export_cameras=False,
                             export_lights=False,export_extras=True,export_yup=True)

export(operator,OUT/'yor-operator.glb');export(dog,OUT/'yor-husky.glb')

# A reproducible beauty preview with the same solid meshes delivered to WebGL.
floor=box('preview-floor',(0,0,-.035),(4,4,.05),None,parent=None,bevel=0)
floor.data.materials.append(material('Preview floor',(.025,.018,.019),.12,.52))
# Preview chair does not ship with either character asset.
box('preview-seat',(-.5,.025,.61),(.66,.54,.13),'leather',parent=None,bevel=.055)
box('preview-chair-back',(-.5,.22,1.03),(.70,.12,.89),'leather',parent=None,bevel=.09)
for x in (-.88,-.12):box('preview-armrest',(x,-.06,.91),(.075,.37,.071),'leather',parent=None,bevel=.028)
world=bpy.context.scene.world or bpy.data.worlds.new('Night atmosphere');bpy.context.scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.012,.009,.013,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.38
def area(name,pos,color,power,size,target):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Warm portrait key',(-3,-4,4),(1,.72,.47),600,3,(0,0,1))
area('Crimson rim',(1,1.0,2.8),(1,.015,.025),800,2,(0,0,1))
area('Cool facial fill',(2,-3,2.5),(.46,.59,.8),380,2,(0,0,1))
bpy.ops.object.camera_add(location=(2.5,-5,2.5))
camera=bpy.context.object;camera.name='Character preview camera';camera.rotation_euler=(Vector((.15,-.07,.93))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.75
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.cycles.use_denoising=True;scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ART/'operator-husky-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'operator-husky.blend'))
bpy.ops.render.render(write_still=True)
stats={}
for root,file in [(operator,'yor-operator.glb'),(dog,'yor-husky.glb')]:
    meshes=[o for o in bpy.data.objects if o.type=='MESH' and descends(o,root)]
    stats[file]={'bytes':(OUT/file).stat().st_size,'vertices':sum(len(o.data.vertices) for o in meshes),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes),'groups':[o.name for o in bpy.data.objects if o==root or descends(o,root)]}
(ART/'asset-stats.json').write_text(json.dumps(stats,indent=2))
print('OPERATOR_ASSET_STATS '+json.dumps(stats))
