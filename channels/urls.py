from django.conf.urls import patterns, include, url
from channels import views
urlpatterns = patterns('',
    url(r'^$', views.channels_list, name='channels_list'),
    url(r'^(?P<channel_id>\d+)/$',views.channel_page,name='info'),
    url(r'^add/$',views.add,name='add'),
    url(r'^epg/(?P<channel_id>\d+)/$',views.getChannelEpg,name='channelEpg'),
)