# -*- coding: utf-8  -*-
from django.db import models

class News(models.Model):
	name=models.CharField(max_length=50)
	date=models.DateField(auto_now_add=True)
	text=models.TextField(blank=False)
	def __unicode__(self):
		return self.name
