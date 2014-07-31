from django.conf.urls import patterns, include, url
from news import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'tv.views.home', name='home'),
    # url(r'^tv/', include('tv.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^$',views.index,name='index'),
    url(r'^add/$',views.news_add,name='add'),
    )