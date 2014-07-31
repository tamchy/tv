from django import template
register=template.Library()
from channels.views import channel_now_epg

@register.filter
def get_time(value):
	return 'test'
	m=value[0]
	return '%s:%s'%(m[8:10],m[10:])

@register.filter
def get_program(value):
	return 'test'
	m=value[2]
	return m

@register.filter
def get_time_now(value):
	return 'test'
	m=channel_now_epg(value.epg)
	return m[0]

@register.filter
def get_program_now(value):
	return 'test'
	m=channel_now_epg(value.epg)
	return m[1]

@register.filter
def get_program_desc(value):
	return 'test'
	m=channel_now_epg(value.epg)
	return m[1]
