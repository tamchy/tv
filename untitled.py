g=[]
for i in prog_list:
	start=i.get('start')[:12]
	stop=i.get('stop')[:12]
	programme=i[0].text
	try:
	        if i[1].tag=='desc':
	                desc=i[1].text
	        else:
	                desc=''
	except IndexError:
	        desc=''
	k=[start,stop,programme,desc]
	g.append(k)