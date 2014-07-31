# -*- coding: utf-8  -*-

from news import forms
from news.models import News
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext

def news_add(request):
	if request.method=='POST':
		form=forms.NewsForm(request.POST)
		if form.is_valid():
			form.save()
			return HttpResponse('Добавлена новость')
		else:
			return render_to_response('news/news_add.html',{'form':form},context_instance=RequestContext(request))
	else:
		form=forms.NewsForm()
		return render_to_response('news/news_add.html',{'form':form},context_instance=RequestContext(request))

def index(request):
	news=News.objects.all()
	return render_to_response('news/index.html',{'news':news},context_instance=RequestContext(request))
