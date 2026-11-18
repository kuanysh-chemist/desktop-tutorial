import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
n=len(files); cols=2; rows=(n+1)//2
W,H=900,506
im=Image.new('RGB',(W*cols,H*rows),'white')
for i,f in enumerate(files):
    a=Image.open(f).convert('RGB').resize((W,H),Image.LANCZOS)
    im.paste(a,((i%cols)*W,(i//cols)*H))
im.save(out)
