import re,sys,glob
bad=0
for f in sorted(glob.glob('js/s-*.js')):
    s=open(f).read()
    for m in re.finditer(r'<[a-zA-Z][^<>]*?>', s):
        tag=m.group(0)
        if len(re.findall(r'\sstyle="',tag))>1 or len(re.findall(r'\sclass="',tag))>1:
            line=s[:m.start()].count('\n')+1; print(f,line,tag[:110]); bad+=1
print('duplicate-attr tags:',bad)
