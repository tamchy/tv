#-*- coding: utf-8  -*-
from channels import models
from django import forms 
from django.contrib.auth import models as reg_model
from captcha.fields import CaptchaField
from registration.forms import RegistrationFormUniqueEmail
from django.http import HttpResponse
from channels.models import Channel

channels_category=['News','Kids','Ent','Edu','Sport','Music','Common','Film','Test','Kyr']
class ChannelForm(forms.ModelForm):
	class Meta():
		model=models.Channel
	def clean_torrent_file(self):
		data=self.cleaned_data['torrent_file']
		if str(data).split('.')[-1]!='torrent':
			raise forms.ValidationError('Неправильный тип торрент-файла')
		return data
	def clean_logo(self):
		data1=self.cleaned_data['logo']
		if str(data1).split('.')[-1] not in ['bmp','jpg','png','jpeg','gif']:
			raise forms.ValidationError('Укажите правильный тип картинки ( bmp , jpg , png , jpeg , gif )')
		return data1
	def clean_category(self):
		data=self.cleaned_data['category']
		if data not in channels_category:
			raise forms.ValidationError('Выберите тип канала')
		return data
	def clean_name(self):
		data=self.cleaned_data['name']
		try:
			Channel.objects.get(name=data)
			raise forms.ValidationError('Такой канал уже существует')
		except Channel.DoesNotExist:
			return data
		


class RegForm(RegistrationFormUniqueEmail):
	captcha=CaptchaField()


	
		