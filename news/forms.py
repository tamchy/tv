# -*- coding: utf-8  -*-
from django import forms
from news import models

class NewsForm(forms.ModelForm):
	class Meta():
		model=models.News
