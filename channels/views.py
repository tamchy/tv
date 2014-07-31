# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response,get_object_or_404
from django.http import HttpResponse
from channels import forms, models
from channels.models import Channel
from django.contrib.auth.models import User,Group,Permission
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth import forms as reg_forms
from django.template import RequestContext
from registration.backends.default.views import ActivationView
from django.contrib.contenttypes.models import ContentType
from registration.models import RegistrationProfile
from django.http import Http404
from news.models import News
from lxml import etree
from datetime import datetime,timedelta
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from urllib import urlretrieve


def epg_parser(parse_file_path):
	f=etree.parse(parse_file_path)
	root=f.getroot()
	return root

def offset_fix(xml_file_abs_path,fixed_xml_path='/Users/Nuradil/Downloads/Folx/xml.xml'):
	parsed_xml=etree.parse(str(xml_file_abs_path))
	parsed_root=parsed_xml.getroot()
	programme=parsed_root.xpath("//programme")
	for i in programme:
		new_start=datetime.strptime(i.attrib['start'][:14],'%Y%m%d%H%M%S')+timedelta(hours=2)
		new_stop=datetime.strptime(i.attrib['stop'][:14],'%Y%m%d%H%M%S')+timedelta(hours=2)
		i.attrib['start']=new_start.strftime('%Y%m%d%H%M%S')+' +0600'
		i.attrib['stop']=new_stop.strftime('%Y%m%d%H%M%S')+' +0600'
	parsed_xml.write(fixed_xml_path,pretty_print=True,encoding='UTF-8')
	return fixed_xml_path

def channels_epg(channel_id):
	f=etree.parse('/Users/nuradil/tv/channels/tvguide.xml')
	root=f.getroot()
	for channel in Channel.objects.all():
		if bool(cache.get('programme_'+str(channel.epg)))==False :	
			prog_list=root.xpath("//programme[@channel='"+str(channel.epg)+"']")
			prog_list_new=[]
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
				prog_list_new.append(k)
			#cache.set('programme_'+str(channel.epg),prog_list_new,int((datetime.strptime(prog_list_new[-1][1],'%Y%m%d%H%M')-datetime.now()).total_seconds()))
			cache.set('programme_'+str(channel.epg),prog_list_new,455667778)
		else:
			continue
	channel_cache=cache.get('programme_'+str(channel_id))
	return channel_cache


def channel_today_epg(channel_id):
	if bool(cache.get('programme_'+str(channel_id)))==False:
		prog_list=channels_epg(channel_id)
		#root=epg_parser(offset_fix('/Users/Nuradil/Downloads/Folx/xmltv.xml.gz'))
		#prog_list=root.xpath("//programme[@channel='"+str(channel_id)+"']")
		#prog_list_new=[]
		#for i in prog_list:
		#	start=i.get('start')[:12]
		#	stop=i.get('stop')[:12]
		#	programme=i[0].text
		#	try:
		#		if i[1].tag=='desc':
		#			desc=i[1].text
		#		else:
		#			desc=''
		#	except IndexError:
		#		desc=''
		#	k=[start,stop,programme,desc]
		#	prog_list_new.append(k)
		#cache.set('programme_'+str(channel_id),prog_list_new,int((datetime.strptime(prog_list_new[-1][1],'%Y%m%d%H%M')-datetime.now()).total_seconds()))
	else:
		prog_list=cache.get('programme_'+str(channel_id))
	date=datetime.now().date()
	today_prog_list=[]
	for prog in prog_list:
		if date == datetime.strptime(prog[0],'%Y%m%d%H%M').date():
			today_prog_list.append(prog)
		else:
			continue
	return today_prog_list

#def channel_week_epg(channel_id):
#	try:
#		f=etree.parse('/Users/Nuradil/Downloads/Folx/xml.xml')
#		root=f.getroot()
#	except IOError:
#		f=etree.parse(offset_fix('/Users/Nuradil/Downloads/Folx/xmltv.xml.gz'))
#		root=f.getroot()
#	prog_list=root.xpath("//programme[@channel='"+str(channel_id)+"']")
#	date=datetime.now().date()
#	today_prog_list=[]
#	for prog in prog_list:
#		if date == datetime.strptime(prog.get('start')[:12],'%Y%m%d%H%M').date():
#			today_prog_list.append(prog)
#		else:
#			continue
#	return today_prog_list


def channel_now_epg(channel_id):
	time=datetime.now()
	programme=channel_today_epg(channel_id)
	for i in programme:
		start_time=datetime.strptime(i[0],'%Y%m%d%H%M')
		stop_time=datetime.strptime(i[1],'%Y%m%d%H%M')
		if time>=start_time:
			if time<stop_time:
				return ('%s:%s - %s:%s'%(i[0][8:10],i[0][10:],i[1][8:10],i[1][10:]),i[2])

def add(request):
	if request.method=='POST' and request.POST:
		form=forms.ChannelForm(request.POST,request.FILES)
		if form.is_valid():
			form.save()
			return render_to_response('channels/more.html',{},context_instance=RequestContext(request))
		else:
			return render_to_response('channels/add.html',{'form':form},context_instance=RequestContext(request))
	else:	
		form=forms.ChannelForm()
		return render_to_response('channels/add.html',{'form':form},context_instance=RequestContext(request))


def channels_list(request):
	#Пользователь залогинен и у него есть права
	if request.user.has_perm('channels.can_watch_channels'):
		channels_list=Channel.objects.all()
	#Пользователь не залогинен и отбрасываются закрытые каналы
	else:
		channels_list=Channel.objects.filter(login_required=False)
	return render_to_response('channels/list.html',{'news':channels_list.filter(category='News'),
													'kids':channels_list.filter(category='Kids'),
													'ent':channels_list.filter(category='Ent'),
													'edu':channels_list.filter(category='Edu'),
													'sport':channels_list.filter(category='Sport'),
													'music':channels_list.filter(category='Music'),
													'common':channels_list.filter(category='Common'),
													'film':channels_list.filter(category='Film'),
													'test':channels_list.filter(category='Test'),
													'kyr':channels_list.filter(category='Kyr')},
													context_instance=RequestContext(request))

def channel_page(request,channel_id):
	channel=get_object_or_404(Channel,pk=channel_id)
	#Пользователь залогинен -> Видна страница канала
	if request.user.has_perm('channels.can_watch_channels'):
		return render_to_response('channels/detail.html',{'channel':channel},context_instance=RequestContext(request))
	#Пользователь не залогинен и закрытый канал -> Вывод страницы 404
	elif request.user.has_perm('channels.can_watch_channels')==False and channel.login_required==True:
		raise Http404
	#Пользователь не залогинен и открытый канал -> Видна страница канала
	else:
		return render_to_response('channels/detail.html',{'channel':channel},context_instance=RequestContext(request))

def getChannelEpg(request,channel_id):
	channel=get_object_or_404(Channel,pk=channel_id)
	epg=channel_today_epg(str(channel.epg))
	return render_to_response('channels/epg.html',{'epg':epg})
	

class ActView(ActivationView):
	def activate(self, request, activation_key):
		activated_user = RegistrationProfile.objects.activate_user(activation_key)
		if activated_user:
            #signals.user_activated.send(sender=self.__class__,user=activated_user,request=request)
			gr=Group.objects.get(name='users')
			if 'Can Watch Channels' in str(gr.permissions.all()):
				activated_user.groups.add(gr)
			else:
				content_type=ContentType.objects.get(app_label='channels', model='channel')
				permission=Permission.objects.create(codename='can_watch_channels',name='Can Watch Channels',content_type=content_type)
				gr.permissions.add(permission)
				activated_user.groups.add(gr)
		return activated_user

def index(request):
	news=News.objects.all()
	return render_to_response('channels/index.html',{'news':news},context_instance=RequestContext(request))
